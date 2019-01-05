# **L**inux **I**nfrared **R**emote **C**ontrol ([LIRC](http://www.lirc.org/)) **Do** **A**lexa **S**kills **K**it ([ASK](https://developer.amazon.com/alexa-skills-kit/start))

lircdo is a "voice first" interface for controlling your home audio/video equipment. There are two components: 

1. lircdo Alexa Skill
2. lircdo server/service

## lircdo [Alexa](https://en.wikipedia.org/wiki/Amazon_Echo) Skill 

This component is written in node.js and implements the [AWS](https://aws.amazon.com/what-is-aws/) [lambda](https://aws.amazon.com/lambda/) function that is called by the Amazon Alexa service when you invoke the lircdo skill via your Alexa-enabled device. You invoke the skill by saying something like \*Alexa, open lircdo\*. **NOTE: The lircdo Alexa skill has not yet been published and is not currently available to the public. Hopefully it will be available soon.**

You are currently reading the README page for the lircdo Alexa Skill component.

## lircdo server/service 

This component is implemented using a small computer(e.g. Raspberry Pi 3 Model B) residing in your home and running the lircdo service. The lircdo server refers to the physical hardware. The lircdo service refers to the lircdo sofware running on the server. The lircdo server requires additional hardware capable of emitting infrared (IR) signals. The lircdo server/IR emitter combination control your home audio/video (AV) equipment using IR signals. **YOU MUST BUILD THIS COMPONENT YOURSELF!!!**. 

To learn more about this component navigate to to this [link](https://github.com/actsasrob/lircdo)

## How Does It Work?

The lircdo Alexa Skill is responsible for responding to your voice commands via an Alexa-enabled device. You say the wake word (typically "Alexa" but you may have changed it to something like "Echo" or "Computer".) Saying the wake word causes the Alexa-enabled device to start listening for requests. You can launch the lircdo skill by saying the wake word followed by "open lircdo". e.g.

"Alexa, open lircdo"

You can also also use the variants: "Alexa, tell lircdo <*to do something*>" or "Alexa, ask lircdo <*to do something*>" But I find it works best to launch the skill via "Alexa, open lircdo".

The Alexa service processes the request "open/tell/ask lircdo" and recognizes you want to launch a skill named "lircdo". It looks through its inventory of skills, finds the lircdo skill and launches it. What it does next depends on whether you used the word "open"  or "tell/ask". For "open" Alexa launches the lircdo skill and sends it a launch request. The lircdo skill responds to the launch request by responding with a simple welcome back phrase and asks you want you would like to do. At that point you can speak the actions you want the lircdo skill to perform. In Alexa skill parlance these actions are known as "intents". The Alexa skill listens for you to say actions. It processes the words and tries to match them to the intents made available by the lircdo skill. If the Alexa skill recognizes a valid intent it invokes a callback within the lircdo skill and passes any extra parameters to the callback. When you launch the skill with the "tell/ask" words you additionally say an action to perform. In this case the Alexa skill first determines the skill you wish to invoke, determines the intent you wish to use, and then launches the skill and invokes the associated callback.

### Currently the lircdo skill understands five kinds of intents: 
* generic intents like "power on system", "change component to dvd player", "open dvd tray" etc.
* audio/video receiver (AVR) intents like "change component to tv", "set component to fire tv", "set device to apple tv"
* volume intents like "raise volume on set top box by 5" and "lower volume by 10"
* channel intents like "change channel on set top box to 746" or "set channel to 231"
* pair server requests. When you launch the lircdo skill for the first time it will prompt you for information that it needs to connect with the lircdo server/service in your home. (*More on that later*)

lircdo callbacks first validate all the required parameters were passed to the callback. For instance the volume intent requires one parameter to know whether to raise or lower the volume and a second required parameter which is a numeric argument which indicates by how much to raise or lower the volume. The volume intent take an optional third parameter which is the device or component that should have its volume raised or lowered. It is designed to be optional. In fact the device/component is optional for generic intents, volume intents, and channel intents. For each of these intents you can specify a default device/component which will be targeted. This is handy, say, if all your components are plugged into an audio/video receiver which handles the volume for all components.

Once the lircdo callback determines it has all the required parameters it looks up the information for your lircdo server/service. The lircdo skills stores the minimal amount of information it needs to perform its function. It uses a dynamo DB instance to store the Alexa ID of your Alexa-enabled device, the fully qualified domain name (FQDN) of your lircdo server, the port number that the lircdo service listens on for incoming requests, and a "shared secret" used to better secure HTTPS requests. The lircdo skill captures this information during the intial "pairing" of the lircdo skill mentioned above.

The lircdo callback then makes an HTTPS request to the lircdo service running on your lircdo server using the registered FQDN and the port number. Each of the callback intents for the lircdo skill have an associated callback function implemented by the lircdo service. Any additional parameters are passed to the lirdo service callback running in your home. 

All the above processing is handled by the lircdo Alexa skill. You are currently reading the README document for the github project that implements the lircdo Alexa skill including the models that define the intents recognized by the skill and the actual node.js logic that implements the AWS lambda function that is invoked by the Alexa service when it needs to launch the lircdo Alexa skill.

At this point, if you wish to understand how the lircdo server/service process incoming HTTPS requests, navigate to the [README file](https://github.com/actsasrob/lircdo/blob/master/README.md) for the github project which implements the logic for the lircdo service.


Once the lircdo skill is published as a publicly available skill you will be able to enable it by making a request to your Alexa-enabled device. Say "Alexa, enable lircdo". In that phrase "Alexa" is the wake word. You may have changed your wake word to something like "Echo" or "Computer". Replace the "Alexa" wake word as appropriate.


## More About lircdo Alexa Skill

The remainder of this README is dedicated to the lircdo Alexa Skill component.

Most folks won't need to do anything with this project. I maintain and publish updates and bug fixes for the lircdo Alexa skill.

However if you wish to fork the project for your own use here are the steps needed to set up a development environment and publish updates to your own Alexa skill.

You will need an Amazon Developer account and an Amazon Web Service (AWS) account to host the lambda function, IAM roles, and the Dynamo DB database. I won't cover how to obtain those. There are many great tutorials available via the internet.

## Setup Development Environment

### Install node version manager (NVM):
```
curl https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
```

#### Add the following to your .bashrc file:
```
export NVM_DIR="<path to your home dir>/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
```

#### Source your .bashrc file:
```
source .bashrc
```

### Install node.js version 8.10. The lircdo Alexa skill has only been tested with node.js v8.10.0.
```
nvm install  8.10.0
nvm alias default 8.10.0 
```

### Clone the lircdo_ask git project:
```
git clone git@github.com:actsasrob/lircdo_ask.git
```

Edit the lambda/custom/constants/constants.js file and change the appId constant to be the ID of your Amazon skill. This is an extra safety step which allows your lambda function to only be invoked by the associated Amazon skill.

### Install Alexa Skills Kit (ASK) Command Line Interface (CLI):

The ASK CLI allows you to manage Alexa skills programmatically from the command line.

Here is a nice [overview](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html) of the ASK CLI.

#### Globally install ask-cli node.js module
```
npm install -g ask-cli
```

#### One-time setup to configure ask
```
ask init
```

### Deploy Project Updates From Github Project To Alexa Skill
```
cd to top-level project dir
ask deploy           # Update the lambda function and model
ask deploy -t lambda # Just update the lambda function
ask deploy -t model  # Just update the model
```

## Testing

### Install mocha
```
npm install -g mocha
```

Execute the "ask simulate" scripts in the ask_simulate_scripts directory from the top-level project directory: e.g.

```
./ask_simulate_scripts/pair.sh
```

**NOTE:** If you look at the contents of the scripts in the ask_simulate_scripts directory you may notice the Alexa skill is invoked as "open baba zoo" instead of "open lircdo". This is because I have created a second Alexa skill named "baba zoo" paired with with its own lircdo server/service which I use for test purposes only. This allows me to do testing, and in particular, run bulk mocha tests, without causing my main lircdo server/service to emit many IR signals to my home audio/video equipment.

## Execute the mocha tests from the test directory: e.g.
```
cd test
./testit.sh
```

## Credit

   Big thanks to Oscar Merry and the excellent Advanced Alexa course over at [A CLOUD GURU](https://acloud.guru/)
   Source code for this project borrowed from: https://github.com/MerryOscar/voice-devs-lessons
