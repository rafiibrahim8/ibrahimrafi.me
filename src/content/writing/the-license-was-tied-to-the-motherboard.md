---
title: The license was tied to the motherboard
emoji: 🔑
date: 2026-05-20
tags: [reverse-engineering, virtualization, linux]
---

A hospital's nurse-call system was dying. Not the software — the _hardware_.
A single physical server from around 2010, running Debian 6, quietly routing
every call button, wall panel and pager in the building. The disks were old,
the box was old, and when hardware that old fails it doesn't ask permission.

The plan was the obvious one: pull a full image of the disk, turn the physical
machine into a virtual one (a P2V conversion), and run it on modern hardware
under KVM. Get it off the failing iron, keep it alive indefinitely. Standard
rescue work.

I imaged the disk, built the VM, booted it. Everything came up — Asterisk, the
telephony stack, the lot. Except the nurse-call application itself, which
refused to start. No useful error. Just… no.

## Following the refusal

The application was Java, so I pulled it apart with a decompiler and started
reading. Buried in the startup path was a license check — and the way it
worked stopped me for a second, because it was actually clever.

The app shelled out to:

```bash
dmidecode -s system-uuid
```

`dmidecode` reads the machine's DMI/SMBIOS tables — the firmware-level
description of the physical hardware. `system-uuid` is a unique identifier
baked into the motherboard. The app took that UUID and used it as the **key to
decrypt its license file**. Get the right UUID, the license decrypts, the
software runs. Wrong UUID, the decryption produces garbage, and the app bails.

It's a tidy scheme: the license is mathematically bound to one specific
motherboard. You can copy the software anywhere you like, but it only comes to
life on the machine it was sold for. No phone-home, no license server, nothing
to crack in the traditional sense — the hardware _is_ the key.

Which is exactly why my VM was dead in the water. The moment I virtualized the
box, the motherboard it expected no longer existed. The hypervisor handed the
guest a brand-new, randomly-generated system UUID. Wrong key. Garbage license.
Silent failure.

The one piece of luck: I'd read the original UUID straight off the physical
machine — `dmidecode -s system-uuid` — while it was still alive and I was
imaging it. So I _had_ the magic number. The only question was how to make the
VM present it.

## The fix is dumber than the lock

The clean way would be to make the VM genuinely _claim_ the original UUID. KVM
lets you set the guest's SMBIOS system UUID in the domain XML, so in principle
you pin the recovered value there and `dmidecode` inside the guest reports the
right thing all on its own.

That would have worked. But it's also the boring answer — pin a config value,
reboot, done. And the more I looked at _how_ the check actually worked, the more
a far more fun route opened up.

Because the application doesn't read the motherboard. It reads _the output of a
command named `dmidecode`_. It has no idea where that binary lives or what it
really does — it just trusts whatever comes back on stdout. So why fight QEMU's
SMBIOS tables at all, when I can just lie to the one program that's asking?

```bash
mv /usr/bin/dmidecode /usr/bin/dmidecode.bak

cat > /usr/bin/dmidecode <<'EOF'
#!/bin/bash
if [ "$1" = "-s" ] && [ "$2" = "system-uuid" ]; then
    echo "THE-ORIGINAL-SYSTEM-UUID"
else
    exec /usr/bin/dmidecode.bak "$@"
fi
EOF

chmod +x /usr/bin/dmidecode
```

A tiny shell script that stands in front of the real binary. The original is
parked next to it with a `.bak` suffix, and the shim only tells one lie: when
something asks for `-s system-uuid` — exactly what the license check calls — it
returns the blessed UUID. Every other invocation is passed straight through to
the genuine `dmidecode` with its arguments intact, so anything else on the box
that legitimately needs DMI data still gets real answers. The license decrypts,
the nurse-call software starts like nothing ever happened, and the rest of the
system is none the wiser.

The elaborate cryptographic hardware-binding scheme was defeated by a file with
the same name sitting earlier in `$PATH`.

## Why I like this one

There's a lesson in here that keeps showing up in my work: **a security
mechanism is only as strong as its weakest assumption, and the weakest
assumption is usually about trust, not math.** The license encryption was
genuinely fine. The decryption was fine. The fatal assumption was that the
string returned by a command called `dmidecode` actually came from the
hardware. On a box where I'm root, that assumption costs a few lines to break.

It's the same shape as a lot of reverse-engineering: you don't attack the
strong part. You find the seam where the strong part talks to something it
trusts, and you stand in the middle.

The nurse-call system has been humming along as a VM ever since — no failing
disks, snapshot-able, restorable in minutes. Same decade-old software, same
license, now running on hardware that won't die on a Tuesday night. The
motherboard it was married to is gone. It just doesn't know it.
