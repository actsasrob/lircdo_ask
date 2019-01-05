#lircdo_ask stands for **L**inux **I**nfrared **R**emote **C**ontrol [LIRC](http://www.lirc.org/) **Do** **A**lexa **S**kills **K**it (ASK)

lircdo is a \*voice first\* interface for controlling your home audio/video equipment. There are two components: 

1. lircdo Alexa Skill
2. lircdo server/service

##lircdo [Alexa](https://en.wikipedia.org/wiki/Amazon_Echo) Skill. 

This component is written in node.js and implements the [AWS](https://aws.amazon.com/what-is-aws/) lambda function that is called bythe Amazon Alexa service when you invoke the lircdo skill via your Alexa-enabled device. You invoke the skill by saying something like \*Alexa, open lircdo\*. **NOTE: The lircdo Alexa skill has not yet been published and is not currently available to the public.**

You are currently reading the README page for the lircdo Alexa Skill component.

##lircdo server/service 

This component is implented using a small computer (e.g. Raspberry Pi 3 Model B) residing in your home and running the lircdo service. This computer requires additional hardware capable of emitting infrared (IR) signals. The lircdo server/IR emitter combination control your home audio/video (AV) equipment using IR signals. **YOU MUST BUILD THIS COMPONENT YOURSELF**. 

To learn more about this component navigate to to this [link](https://github.com/actsasrob/lircdo)

## More About lircdo Alexa Skill

The remainder of this README is dedicated to the lircdo Alexa Skill component.


### Credit

   Big thanks to Oscar Merry and the excellent Advanced Alexa course over at [A CLOUD GURU](https://acloud.guru/)
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
