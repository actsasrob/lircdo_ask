# **L**inux **I**nfrared **R**emote **C**ontrol ([LIRC](http://www.lirc.org/)) **Do** **A**lexa **S**kills **K**it ([ASK](https://developer.amazon.com/alexa-skills-kit/start))

This README file will hopefully help users understand how to interact with the lircdo Alexa skill.

Currently the lircdo skill understands five kinds of intents: 
* generic "lircdo" intents like "power on system", "change component to dvd player", "open dvd tray" etc.
* audio/video receiver (AVR) intents like "change component to tv", "set component to fire tv", "set device to apple tv"
* volume intents like "raise volume on set top box by 5" and "lower volume by 10"
* channel intents like "change channel on set top box to 746" or "set channel to 231"
* pair server intent requests. When you launch the lircdo skill for the first time it will prompt you for information that it needs to connect with the lircdo server/service in your home. 

| Intent Name | Description | lircdo server key and value |
|-------------|-------------|------|
| lircdo | Perform a variety of actions on a variety of A/V components | intent=lircdo |
| channel_action | Change channel of A/V component | intent=channel_action |
| volume_action  | Raise or lower volume of A/V component | intent=volume_action |
| avr_action     | Change selected component of Audio Video Receiver (AVR) | intent=avr_action |
| pair_server    | Used to pair the Alexa lircdo skill with the lircdo server | N/A |
 
## Generic "lircdo" Intent

| Slot          |      Description      |  Optional |
|---------------|-------------|------|
| LircAction    |  An action to perform | no |
| LircComponent | The A/V component to apply the action to |  yes |


## Slots

### LircAction Slot
| What you can say | lircdo server meta Key & Value | 
|---------------|-------------|------|
| "open tray" | action=TRAY_OPEN |
| "power on" | action=POWER_ON |
