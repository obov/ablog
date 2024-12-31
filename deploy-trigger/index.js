const { SecretsManager } = require('aws-sdk');
const axios = require('axios');
const { Client } = require('@notionhq/client');

const secretsManager = new SecretsManager();

exports.handler = async (event) => {
  // Secrets Manager에서 토큰들 가져오기
  const githubSecret = await secretsManager
    .getSecretValue({
      SecretId: 'GitHubToken',
    })
    .promise();
  const notionSecret = await secretsManager
    .getSecretValue({
      SecretId: 'notion-blog-database',
    })
    .promise();
  GITHUB_TOKEN = githubSecret.SecretString;
  const { NOTION_TOKEN, NOTION_DATABASE_ID } = JSON.parse(
    notionSecret.SecretString
  );

  // Notion 클라이언트 초기화
  const notion = new Client({ auth: NOTION_TOKEN });

  try {
    // 가장 최근에 수정된 페이지 1개 조회
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 1,
      sorts: [
        {
          timestamp: 'last_edited_time',
          direction: 'descending',
        },
      ],
    });

    const lastEditedPage = response.results[0];
    const lastEditTime = new Date(lastEditedPage.last_edited_time);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // 최근 5분 이내 수정되었는지 확인
    if (lastEditTime > fiveMinutesAgo) {
      // GitHub Actions workflow 트리거
      const GITHUB_API_URL =
        'https://api.github.com/repos/obov/ablog/actions/workflows/deploy-gh-pages.yml/dispatches';

      await axios.post(
        GITHUB_API_URL,
        {
          ref: 'main',
        },
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Workflow triggered',
          lastEditTime: lastEditedPage.last_edited_time,
          pageId: lastEditedPage.id,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'No recent changes in Notion',
        lastEditTime: lastEditedPage.last_edited_time,
        pageId: lastEditedPage.id,
      }),
    };
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error occurred', error: error.message }),
    };
  }
};
