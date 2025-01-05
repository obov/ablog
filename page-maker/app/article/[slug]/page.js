import { Fragment } from 'react';
import Link from 'next/link';

import { getDatabase, getBlocks, getPageFromSlug } from '../../../lib/notion';
import Text from '../../../components/text';
import { renderBlock } from '../../../components/notion/renderer';
import styles from '../../../styles/post.module.css';

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const database = await getDatabase();
  return database?.map((page) => {
    const slug = page.properties.Slug?.rich_text[0].text.content;
    return { id: page.id, slug };
  });
}

export async function generateMetadata({ params }) {
  const page = await getPageFromSlug(params?.slug);
  const emojiSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <text x="50%" y="50%" font-size="48" text-anchor="middle" dominant-baseline="central">
        ${page.icon?.emoji}
      </text>
    </svg>
  `;
  const svgBase64 = Buffer.from(emojiSvg).toString('base64');
  const svgUrl = `data:image/svg+xml;base64,${svgBase64}`;
  return {
    title: page.properties.Title?.title[0].plain_text,
    icons: {
      icon: svgUrl,
    },
  };
}

export default async function Page({ params }) {
  const page = await getPageFromSlug(params?.slug);
  const blocks = await getBlocks(page?.id);

  if (!page || !blocks) {
    return <div />;
  }

  return (
    <div>
      <article className={styles.container}>
        <h1 className={styles.name}>
          <Text title={page.properties.Title?.title} icon={page.icon?.emoji} />
        </h1>
        <section>
          {blocks.map((block) => (
            <Fragment key={block.id}>{renderBlock(block, params?.slug)}</Fragment>
          ))}
          <Link href="/" className={styles.back}>
            ← Go home
          </Link>
        </section>
      </article>
    </div>
  );
}

// export const getStaticPaths = async () => {
//   const database = await getDatabase(databaseId);
//   return {
//     paths: database.map((page) => {
//       const slug = page.properties.Slug?.rich_text[0].text.content;
//       return ({ params: { id: page.id, slug } });
//     }),
//     fallback: true,
//   };
// };

// export const getStaticProps = async (context) => {
//   const { slug } = context.params;
//   const page = await getPage(id);
//   const blocks = await getBlocks(id);

//   return {
//     props: {
//       page,
//       blocks,
//     },
//     revalidate: 1,
//   };
// };
