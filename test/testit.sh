#!/bin/bash

cwd=$(pwd)
cd ..

echo "unpairing lircdo server..."
./ask_simulate_scripts/pair_server_again.sh > /dev/null 2>&1

echo "pairing lircdo server ..."
./ask_simulate_scripts/pair.sh > /dev/null 2>&1

cd $cwd
echo "running moch tests..."
mocha server-tests.js
