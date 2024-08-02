npx tsoa spec
npx @openapitools/openapi-generator-cli generate -i ./build/swagger.json -o ./client -g typescript-fetch --skip-validate-spec