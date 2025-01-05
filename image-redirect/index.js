const { SecretsManager } = require('aws-sdk');
const { Client } = require('@notionhq/client');

const secretsManager = new SecretsManager();

exports.handler = async (event) => {
  const notionSecret = await secretsManager
    .getSecretValue({
      SecretId: 'notion-blog-database',
    })
    .promise();

  const { NOTION_TOKEN, NOTION_DATABASE_ID } = JSON.parse(notionSecret.SecretString);
  const notion = new Client({ auth: NOTION_TOKEN });
  const getPageFromSlug = async (slug) => {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter: {
        property: 'Slug',
        formula: {
          string: {
            equals: slug,
          },
        },
      },
    });
    if (response?.results?.length) {
      return response?.results?.[0];
    }
    return {};
  };

  const getImages = async (blockID) => {
    const blockId = blockID.replaceAll('-', '');

    const { results } = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
    });

    // 하위 블록들을 재귀적으로 플랫하게 수집
    const childBlocks = results.map(async (block) => {
      if (block.has_children) {
        const children = await getImages(block.id);
        return [block, ...children]; // 현재 블록과 하위 블록을 합침
      }
      return [block]; // 현재 블록만 반환
    });

    // 모든 블록을 플랫하게 병합
    return Promise.all(childBlocks).then((nestedBlocks) =>
      nestedBlocks
        .flat()
        .filter((block) => block.type === 'image') // 모든 배열을 평탄화
        .map((block) => (block.image.type === 'external' ? block.image.external.url : block.image.file.url))
    );
  };

  const page = await getPageFromSlug(event.queryStringParameters.slug);
  const images = await getImages(page.id);
  const url = images.find(
    (image) =>
      image === event.queryStringParameters?.url ||
      new URL(image).pathname.split('/')[2] === event.queryStringParameters?.pathname
  );

  console.log('==========');
  console.log(images.map((image) => new URL(image).pathname.split('/')[2])[0]);
  console.log('==========');
  console.log(event.queryStringParameters);
  console.log('==========');
  console.log(event.queryStringParameters?.pathname);
  console.log('==========');

  return {
    statusCode: 302,
    headers: {
      Location: url || 'https://www.google.com',
    },
  };
};

// https://bmh6chbc23yndckuad6i2gghgi0rxzal.lambda-url.ap-northeast-2.on.aws/?slug=notion_image_has_expire&pathname=9271ac0b-23d3-49fc-a526-aaa3cd98cf74
