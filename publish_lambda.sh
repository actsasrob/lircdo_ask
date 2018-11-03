#!/bin/bash

nvm use 8.0

overallstatus=0
which node > /dev/null 2>&1
if [ "$?" -eq 0 ]; then
   echo "Running node --check..."
   cd lambda
   node --check index.js
   status=$?
   if [ "$status" -ne 0 ]; then
      echo "error: non-zero status when checking index.js"
      overallstatus=$status
   fi
   listofjsfiles=$(find handlers/ helpers/ constants/ -name "*.js")
   for file in $listofjsfiles; do
      #echo "checking file $file"
      node --check $file
      status=$?
      if [ "$status" -ne 0 ]; then
         echo "error: non-zero status when checking ${file}"
         overallstatus=$status
      fi
   done 
   cd ..
fi

if [ "$overallstatus" -ne 0 ]; then
   echo "error: non-zero status from node --check"
   exit $overallstatus
fi

rm lambda.zip
cd lambda
npm install
zip -r --quiet ../lambda.zip *
cd ..
aws lambda update-function-code --function-name lircdo_nodejsv08 --zip-file fileb://lambda.zip --profile robhughes_us-east-1
