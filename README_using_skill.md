# **L**inux **I**nfrared **R**emote **C**ontrol ([LIRC](http://www.lirc.org/)) **Do** **A**lexa **S**kills **K**it ([ASK](https://developer.amazon.com/alexa-skills-kit/start))

This README file will hopefully help users understand how to interact with the lircdo Alexa skill.

## Intents

Intents are types of actions that can be handled by the Alexa skill.

Currently the lircdo Alexa skill understands five kinds of intents: 
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
|-----|-----|
| "close tray","close"| action=TRAY_CLOSE |
| "open tray","open","toggle tray"| action=TRAY_OPEN |
| "power on","turn on","on"| action=POWER_ON |
| "power off","turn off","off"| action=POWER_OFF |
| "show menu","display menu","menu","display","show"| action=MENU_SHOW |
| "dismiss menu","dismiss"| action=MENU_DISMISS |
| "pause","halt"| action=PAUSE |
| "unpause","continue","play"| action=UNPAUSE |
| "record","record show","record movie"| action=RECORD |
| "top menu"| action=TOP_MENU |
| "subtitles"| action=SUBTITLES |
| "close captions"| action=CLOSE_CAPTIONS |
| "favorites","show favorites","display favorites"| action=FAVORITES |
| "info","show info","show information"| action=INFORMATION |
| "last","last channel","go back"| action=LAST_CHANNEL |
| "stop play","stop record","stop recording"| action=STOP_PLAY |
| "dvr menu"| action=DVR_MENU |

### LircComponent Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "dvd player","dvd"| component=COMPONENT_DVD |
| "dvr","digital video recorder"| component=COMPONENT_DVR |
| "hdp","high definition player"| component=COMPONENT_HDP |
| "ps4","playstation 4"| component=COMPONENT_PS4 |
| "tv","television"| component=COMPONENT_TV |
| "set top box","stb","settopbox"| component=COMPONENT_STB |
| "cable box","cable"| component=COMPONENT_CABLE |
| "satellite","satellite dish"| component=COMPONENT_SATELLITE |
| "tuner"| component=COMPONENT_TUNER |
| "firetv","fire tv","amazon fire tv","fire stick","amazon fire stick"| component=COMPONENT_FIRETV |
| "vcr","video cassette recorder"| component=COMPONENT_VCR |
| "apple tv","apple tv"| component=COMPONENT_APPLETV |
| "System"| component=COMPONENT_SYSTEM |
| "avr","av receiver","audio video receiver"| component=COMPONENT_AVR |
| "xbox"| component=COMPONENT_XBOX |

### LIRC_AVR_ACTION Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "change component","set component","set device","change device","device","component"| action=CHANGE_COMPONENT |

### LIRC_AV_DEVICE Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "dvd player","dvd"| component=COMPONENT_DVD |
| "dvr","digital video recorder"| component=COMPONENT_DVR |
| "hdp"| component=COMPONENT_HDP |
| "tv","television"| component=COMPONENT_TV |
| "set top box","stb"| component=COMPONENT_STB |
| "cable box","cable"| component=COMPONENT_CABLE |
| "satellite","satellite dish"| component=COMPONENT_SATELLITE |
| "tuner"| component=COMPONENT_TUNER |
| "firetv","fire tv","amazon fire tv","fire stick","amazon fire stick"| component=COMPONENT_FIRETV |
| "vcr","video cassette recorder"| component=COMPONENT_VCR |
| "apple tv","apple tv"| component=COMPONENT_APPLETV |
| "ps4","playstation"| component=COMPONENT_PS4 |
| "ps3","playstation3"| component=COMPONENT_PS3 |

### LIRC_CHANNEL_ACTION Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "change channel","set channel","channel"| action=CHANNEL_CHANGE |

### LIRC_VOLUME_ACTION Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "increase volume","increase","raise volume","raise"| action=VOLUME_INCREASE |
| "decrease volume","decrease","lower volume","lower"| action=VOLUME_DECREASE |

