const { SecretsManager } = require('aws-sdk');
const axios = require('axios');

const secretsManager = new SecretsManager();

exports.handler = async (event) => {
  // Fetch GitHub token from Secrets Manager
  const secretName = 'GitHubToken'; // Replace with your secret name
  const secret = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  const GITHUB_TOKEN = secret.SecretString;

  const GITHUB_API_URL = 'https://api.github.com/repos/obov/ablog/actions/workflows/deploy-gh-pages.yml/dispatches';

  try {
    const response = await axios.post(
      GITHUB_API_URL,
      {
        ref: 'master', // Branch to trigger
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Workflow triggered', response: response.data }),
    };
  } catch (error) {
    console.error('Error triggering workflow:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error triggering workflow', error: error.message }),
    };
  }
};
