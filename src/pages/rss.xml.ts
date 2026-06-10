import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (
    await getCollection('writing', ({ data }) => !data.draft)
  ).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Ibrahim Rafi — Writing',
    description:
      'Posts on self-hosting, Linux, security, and small sharp tools.',
    site: context.site!,
    items: posts.map((post) => ({
      title: `${post.data.emoji} ${post.data.title}`,
      pubDate: post.data.date,
      link: `/writing/${post.id}`,
    })),
  });
}
