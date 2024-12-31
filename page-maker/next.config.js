const isProd = process.env.NODE_ENV === 'production'; // 프로덕션 환경인지 확인

module.exports = {
  output: 'export',
  basePath: isProd ? '/ablog' : '',
};
