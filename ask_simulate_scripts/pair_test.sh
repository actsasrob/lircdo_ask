#!/bin/bash

set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ip_address=$(nslookup lirc.robhughes.net | grep "^Address" | tail -1 | awk '{ print $2 }')

ip_text=$($DIR/ip_to_text.sh $ip_address)
if [ -z "$ip_text" ]; then
   echo "error: failed to lookup IP address"
   exit -1
fi

ask simulate -l en-US -p default -t "open baba zoo"
sleep 2 
ask simulate -l en-US -p default -t "my application pin is one seven eight"
sleep 2
ask simulate -l en-US -p default -t "my application address is ${ip_text}"
sleep 2
ask simulate -l en-US -p default -t "yes"
sleep 2
ask simulate -l en-US -p default -t "yes"
sleep 2
ask simulate -l en-US -p default -t "no"
sleep 2
ask simulate -l en-US -p default -t "my application port is eight eight four four"
sleep 2
ask simulate -l en-US -p default -t "yes"
