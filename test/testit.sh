#!/bin/bash

# The unit tests currently expect the skill for the current device to be in
# the "main" state (paired with a lircdo server). The pair_server intent requires 
# slot confirmation which is not currently supported by the virtual-alexa package.
# We'll use 'ask_simulate' to invoke the pair_server_again intent to unpair the skill.
# This will force the skill to become unpaired for the current device no matter the current
# skill state.  We then use 'ask_simulate' to invoke the pair_server intent to pair the skill
# to the test lircdo server.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "DIR=$DIR"

cwd=$(pwd)
cd $DIR/.. 

echo "remember to remove comments..."
echo "unpairing lircdo server..."
./ask_simulate_scripts/pair_server_again.sh > /dev/null 2>&1

echo "pairing lircdo server ..."
./ask_simulate_scripts/pair_test.sh > /dev/null 2>&1

cd ./lambda/custom
echo "running jest/virtual-alexa tests..."

npm test

cd $cwd
