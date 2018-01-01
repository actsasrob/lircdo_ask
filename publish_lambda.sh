rm lambda.zip
cd lambda
npm install
zip -r ../lambda.zip *
cd ..
aws lambda update-function-code --function-name lircdo --zip-file fileb://lambda.zip --profile robhughes_us-east-1
