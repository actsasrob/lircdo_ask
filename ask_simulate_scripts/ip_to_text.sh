#!/bin/bash
#set -x
retVal=""

ip_address=$1
validchars="0"
for (( i=0; i<${#ip_address}; i++ )); do
   char="${ip_address:$i:1}"
   output=""
   case "$char" in

      0)  output="zero"
	 ;;
      1)  output="one"
	 ;;
      2)  output="two" 
	 ;;
      3)  output="three" 
	 ;;
      4)  output="four" 
	 ;;
      5)  output="five" 
	 ;;
      6)  output="six" 
	 ;;
      7)  output="seven" 
	 ;;
      8)  output="eight" 
	 ;;
      9) output="nine" 
	 ;;
      .) output="dot" 
	 ;;
      *) output="" 
	 ;;
   esac

   if [ "x$output" != "x" ]; then
      if [ "$validchars" -gt 0 ]; then
	 echo -n " "
      fi 
      echo -n "$output"
      validchars=$(( validchars+1 ))
   fi
done
