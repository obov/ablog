#!/bin/bash

# 스크립트의 실제 위치를 찾아서 SCRIPT_DIR 변수에 저장
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

FUNCTION_NAME="DeployTrigger"
REGION="ap-northeast-2"

# 임시 디렉토리 생성 (스크립트 위치 기준)
echo "Creating temp directory..."
mkdir -p "${SCRIPT_DIR}/temp_deploy"

# 필요한 파일만 복사
cp "${SCRIPT_DIR}/index.js" "${SCRIPT_DIR}/temp_deploy/"
cp "${SCRIPT_DIR}/package.json" "${SCRIPT_DIR}/temp_deploy/"

# 임시 디렉토리에서 의존성 설치
cd "${SCRIPT_DIR}/temp_deploy"
echo "Installing dependencies..."
npm install --production --no-package-lock

# ZIP 파일 생성
echo "Creating ZIP file..."
zip -r "${SCRIPT_DIR}/function.zip" . > /dev/null

# 스크립트 디렉토리로 이동
cd "${SCRIPT_DIR}"

# 정리 함수 정의
cleanup() {
    echo "Cleaning up..."
    
    # temp_deploy 디렉토리 제거
    if [ -d "${SCRIPT_DIR}/temp_deploy" ]; then
        rm -rf "${SCRIPT_DIR}/temp_deploy" || {
            echo "Failed to remove temp_deploy directory"
            return 1
        }
    fi
    
    # function.zip 파일 제거
    if [ -f "${SCRIPT_DIR}/function.zip" ]; then
        rm "${SCRIPT_DIR}/function.zip" || {
            echo "Failed to remove function.zip"
            return 1
        }
    fi
    
    echo "Cleanup completed successfully"
}

# Lambda 함수 업데이트
echo "Deploying to AWS Lambda..."
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://function.zip \
  --region $REGION

# 배포 결과 확인
if [ $? -eq 0 ]; then
  echo "Deployment successful!"
else
  echo "Deployment failed!"
fi

# 정리 실행
cleanup
if [ $? -ne 0 ]; then
    echo "Warning: Cleanup was not completely successful"
    exit 1
fi