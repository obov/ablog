exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Lambda!?',
      input: event.queryStringParameters || {}, // GET 요청의 쿼리 매개변수
    }),
  };
};
