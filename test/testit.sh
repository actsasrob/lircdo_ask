#!/bin/bash

cwd=$(pwd)
cd ..

echo "remember to remove comments..."
#echo "unpairing lircdo server..."
#./ask_simulate_scripts/pair_server_again.sh > /dev/null 2>&1

#echo "pairing lircdo server ..."
#./ask_simulate_scripts/pair_test.sh > /dev/null 2>&1

cd $cwd
echo "running moch tests..."
#mocha server-tests.js
#mocha --require node_modules/ts-node/register/index.js ./skill.spec.ts
mocha --require node_modules/ask-sdk-test/dist/index.js ./skill.spec.js
