#!/bin/bash
ask simulate -l en-US -p default -t "open baba zoo"
sleep 2
ask simulate -l en-US -p default -t "pair server again"
sleep 2
ask simulate -l en-US -p default -t "yes"
sleep 2
ask simulate -l en-US -p default -t "stop"
sleep 2
