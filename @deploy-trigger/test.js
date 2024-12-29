const { handler } = require('./index'); // Lambda 핸들러 가져오기

// Lambda 핸들러 호출
handler()
  .then((response) => {
    console.log('Lambda Response:', response);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
