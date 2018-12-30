# lircdo_ask
Linux Infra Red Remote Control (LIRC) Do Alexa Skills Kit (ASK)

### Credit

   Big thanks to Oscar Merry and the excellent Advanced Alexa course over at A Cloud Guru
   Source code for this project borrowed from: https://github.com/MerryOscar/voice-devs-lessons

### Deploy Project Updates
# Deploy lambda function and alexa skill from development stage:
```cd to project dir
ask deploy
ask deploy -t lambda
ask deploy -t model


### Testing

Execute the scripts in the ask_simulate_scripts directory from the top-level project directory: e.g.

```./ask_simulate_scripts/pair.sh
```

Execute the mocha tests from the test directory: e.g.
```cd test
./testit.sh
```
