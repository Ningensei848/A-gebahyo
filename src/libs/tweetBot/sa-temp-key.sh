#!/bin/bash

# GitHub Actions からキーなし認証で Google Spread Sheet を操作する
# cf. https://zenn.dev/hankei6km/articles/update-google-spread-sheet-from-github-actions#ローカルでの動作確認

set -e

# PROJECT_ID="<PROJECT_ID>"
# SA_EMAIL="<SERVICE_EMAIL>"

# ./.envファイルを読み込んで変数として参照できるようにする
source ./.env

FILE_BASE_NAME="temp"

FILE_NAME="gha-creds-test-${FILE_BASE_NAME}.json"

gcloud iam service-accounts keys create "${FILE_NAME}" \
  --project="${PROJECT_ID}" \
  --iam-account="${SA_EMAIL}"

echo ""
read -r -p "enter to delete key"

gcloud iam service-accounts keys delete "$(jq < "${FILE_NAME}" ".private_key_id" -r)" \
  --project="${PROJECT_ID}" \
  --iam-account="${SA_EMAIL}" --quiet

rm "${FILE_NAME}"