#!/bin/bash

cwd=$(pwd)
cd ..

#echo "remember to remove comments..."
echo "unpairing lircdo server..."
./ask_simulate_scripts/pair_server_again.sh > /dev/null 2>&1

echo "pairing lircdo server ..."
./ask_simulate_scripts/pair_test.sh > /dev/null 2>&1

cd ./lambda/custom
echo "running jest/virtual-alexa tests..."

npm test

cd $cwd
