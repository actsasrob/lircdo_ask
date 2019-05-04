#!/bin/bash

ask simulate -l en-US -p default -t "open baba zoo" > /dev/null 2>&1
ask simulate -l en-US -p default -t "$1"
