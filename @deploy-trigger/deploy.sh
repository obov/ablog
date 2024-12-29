#!/bin/bash

# Lambda 함수 이름
FUNCTION_NAME="DeployTrigger"
REGION="ap-northeast-2"

# 1. 의존성 설치 (필요 시)
echo "Installing dependencies..."
npm install --production

# 2. ZIP 파일 생성
echo "Creating ZIP file..."
zip -r function.zip index.js package.json node_modules > /dev/null

# 3. Lambda 함수 업데이트
echo "Deploying to AWS Lambda..."
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://function.zip \
  --region $REGION

# 4. 배포 결과 확인
if [ $? -eq 0 ]; then
  echo "Deployment successful!"
else
  echo "Deployment failed!"
fi

# 5. ZIP 파일 제거
echo "Cleaning up..."
rm function.zip