---
title: Hiding a sentence in plain sight
emoji: 🪡
date: 2026-06-10
tags: [steganography, meta]
---

This website is hiding something. The footer has been telling you since the day
it launched. This post explains the trick — though not the secret itself.

## Where it started

My first real projects, back in university, were steganography tools:
[iSteg](https://github.com/rafiibrahim8/isteg) hid text inside images,
[aSteg](https://github.com/rafiibrahim8/asteg) hid files inside audio. The
appeal was never the cryptography — it was the idea that a thing could look
completely ordinary and still carry a payload.

## Two ways to hide text in a webpage

### In an image: least significant bits

Every pixel in a PNG has red, green and blue channels, each a number from 0 to 255. Flip the lowest bit of any of them — turn a 142 into a 143 — and no human
eye can tell the difference. Do that systematically and an image becomes a
container:

```text
message bit:   1        0        1        1
red channel:   10001110 → 10001111
green channel: 01101001 → 01101000
blue channel:  11010100 → 11010101
```

A 1000×800 photo gives you 2.4 million channels — nearly 300 KB of hidden
capacity in an image that looks untouched. That's what iSteg did in 2018, and
it's what the [/steg](/steg) page on this site does today, entirely in your
browser.

### In text: zero-width characters

Unicode contains characters with no visual width at all — the zero-width space
(U+200B) and the zero-width non-joiner (U+200C). Sandwich them between normal
letters and the text _looks_ identical, but the character stream now carries
extra data: treat one as binary `0`, the other as `1`, and any sentence becomes
a covert channel.

This very site uses that trick. Somewhere on the homepage, a perfectly normal
looking sentence says more than it appears to.

## Finding it

The [/steg](/steg) page has a decoder. What you paste into it is up to you.

Happy hunting.
