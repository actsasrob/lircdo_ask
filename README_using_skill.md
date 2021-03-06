# **L**inux **I**nfrared **R**emote **C**ontrol ([LIRC](http://www.lirc.org/)) **Do** **A**lexa **S**kills **K**it ([ASK](https://developer.amazon.com/alexa-skills-kit/start))

This README file will hopefully help users understand how to interact with the lircdo Alexa skill.

## <a id="lircdo_intents"></a>Intents

Intents are types of actions that can be handled by the Alexa skill.

Currently the lircdo Alexa skill understands seven kinds of intents: 
* [generic "lircdo" intents](#lircdo_intent) like "power on system", "open dvd tray" etc.
* [audio/video receiver (AVR) intents](#avr_action_intent) like "change component to tv", "set component to fire tv", "set device to apple tv"
* [volume intents](#volume_action_intent) like "raise volume on set top box by 5" and "lower volume by 10"
* [channel intents](#channel_action_intent) like "change channel on set top box to 746" or "set channel to 231"
* [navigation intents](#navigate_action_intent) like "dvd player scroll right" or "page up 2 times"
* pair/unpair server intent requests. When you launch the lircdo skill for the first time it will prompt you for information that it needs to connect with the lircdo server/service in your home. 
* response vebosity intent requests. Allows you to toggle the verbosity of skill responses.

| Intent Name | Description | lircdo server Key & Value |
|-------------|-------------|------|
| [lircdo](#lircdo_intent) | Perform a variety of actions on a variety of A/V components | intent=lircdo |
| [channel_action](#channel_action_intent) | Change channel of A/V component | intent=channel_action |
| [volume_action](#volume_action_intent)  | Raise or lower volume of A/V component | intent=volume_action |
| [navigate_action](#navigate_action_intent)  | Navigate menus | intent=navigate_action |
| [avr_action](#avr_action_intent)     | Change selected component of Audio Video Receiver (AVR) | intent=avr_action |
| pair_server    | Used to pair the Alexa lircdo skill with the lircdo server. To invoke this intent say "pair server" | N/A |
| unpair_server    | Used to unpair the Alexa lircdo skill with the lircdo server. To invoke this intent say "unpair server" | N/A |
| brief_mode    | Change verbosity of sklll responses. To toggle verbosity of responses say "brief mode", "change brief mode", or "toggle brief mode"  | N/A |
 
## <a id="lircdo_intent"></a>Generic "lircdo" Intent

Perform a variety of actions on a variety of A/V components.

### Phrases understand by lircdo intent
 
    "turn {LircComponent} {LircAction}",
    "power {LircComponent} {LircAction}",
    "{LircAction} for {LircComponent}",
    "{LircAction} {LircComponent} tray",
    "{LircAction} tray",
    "{LircAction}",
    "{LircComponent} {LircAction}"

The text surrounded by curly braces are known as "slots". See the table below for more information about each slot.

| Slot          |      Description      |  Optional |
|---------------|-------------|------|
| [LircAction](#LircAction)    |  An action to perform | no |
| [LircComponent](#LircComponent) | The A/V component to apply the action to |  yes |

## <a id="channel_action_intent"></a>channel_action intent

Change channel of A/V component.

### Phrases understand by channel_action intent

    "{LircChannelAction} {LircComponent} to {LircNumericArgument}",
    "change {LircComponent} {LircChannelAction} to {LircNumericArgument}",
    "set {LircComponent} {LircChannelAction} to {LircNumericArgument}",
    "{LircChannelAction} to {LircNumericArgument}"

The text surrounded by curly braces are known as "slots". See the table below for more information about each slot.

| Slot          |      Description      |  Optional |
|---------------|-------------|------|
| [LircChannelAction](#LircChannelAction)    |  A channel action to perform | no |
| [LircComponent](#LircComponent) | The A/V component to apply the action to |  yes |
| LircNumericArgument | A positive integer channel number |  no |

## <a id="volume_action_intent"></a>volume_action intent

Raise or lower volume of A/V component.

### Phrases understand by volume_action intent

    "{LircVolumeAction} {LircComponent} volume by {LircNumericArgument}",
    "{LircVolumeAction} by {LircNumericArgument}"

The text surrounded by curly braces are known as "slots". See the table below for more information about each slot.

| Slot          |      Description      |  Optional |
|---------------|-------------|------|
| [LircVolumeAction](#LircVolumeAction)    |  A volume action to perform | no |
| [LircComponent](#LircComponent) | The A/V component to apply the action to |  yes |
| LircNumericArgument | A positive integer indicating how much the volume should be raised or lowered. Note: for raise volume actions the maximum value allowed by the lircdo server is 5 |  yes |


## <a id="navigate_action_intent"></a>Navigation Intent

Navigate menus.

### Phrases understand by navigate_action intent

   "{LircComponent} {LircNavigateVerb} {LircNavigateAction}",
   "{LircComponent} {LircNavigateAction}",
   "{LircNavigateVerb} {LircNavigateAction}",
   "{LircNavigateAction}",
   "{LircComponent} {LircNavigateVerb} {LircNavigateAction} {LircNumericArgument} times",
   "{LircComponent} {LircNavigateAction} {LircNumericArgument} times",
   "{LircNavigateVerb} {LircNavigateAction} {LircNumericArgument} times",
   "{LircNavigateAction} {LircNumericArgument} times",
   "{LircComponent} {LircNavigateAction} {LircNumericArgument}",
   "{LircNavigateVerb} {LircNavigateAction} {LircNumericArgument}",
   "{LircNavigateAction} {LircNumericArgument}"

The text surrounded by curly braces are known as "slots". See the table below for more information about each slot.

| Slot          |      Description      |  Optional |
|---------------|-------------|------|
| [LircNavigateAction](#LircNavigateAction)    |  The navigate action to perform | no |
| LircNavigateVerb | Helper verbs: "navigate", "scroll", or "go" |  yes |
| [LircComponent](#LircComponent) | The A/V component to apply the action to |  yes |
| LircNumericArgument | Number of times to repeat action. Defaults to 1 |  yes |


## <a id="avr_action_intent"></a>avr_action intent

Change selected component of Audio Video Receiver (AVR).

### Phrases understand by avr_action intent

    "{LircAVRAction} {LircAVDevice}",
    "{LircAVRAction} to {LircAVDevice}"

The text surrounded by curly braces are known as "slots". See the table below for more information about each slot.


| Slot          |      Description      |  Optional |
|---------------|-------------|------|
| [LircAVRAction](#LircAVRAction)    |  A A/V action to perform | no |
| [LircAVDevice](#LircAVDevice) | The A/V device to apply the action to |  no |

## Slots

### <a id="LircAction"></a>LircAction Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "close tray","close"| action=TRAY_CLOSE |
| "open tray","open","toggle tray"| action=TRAY_OPEN |
| "power on","turn on","on"| action=POWER_ON |
| "power off","turn off","off"| action=POWER_OFF |
| "show menu","display menu","menu","display","show"| action=MENU_SHOW |
| "dismiss menu","dismiss"| action=MENU_DISMISS |
| "mute","silence"| action=MUTE |
| "unmute"| action=UNMUTE |
| "pause","halt","pause play"| action=PAUSE |
| "unpause","continue","play","toggle pause"| action=UNPAUSE |
| "record","record show","record movie"| action=RECORD |
| "top menu","home","home menu","go home"| action=TOP_MENU |
| "subtitles"| action=SUBTITLES |
| "close captions"| action=CLOSE_CAPTIONS |
| "favorites","show favorites","display favorites"| action=FAVORITES |
| "options","show options","display options"| action=OPTIONS |
| "show visual settings","show visual options","show display settings","show display options"| action=DISPLAY_SETTINGS |
| "audio","audio settings","change audio settings"| action=AUDIO_SETTINGS |
| "on demand","show on demand","display on demand"| action=ON_DEMAND |
| "info","show info","show information"| action=INFORMATION |
| "last","last channel","previous channel","previous","go back"| action=LAST_CHANNEL |
| "stop play","stop record","stop recording"| action=STOP_PLAY |
| "select","o.k.","ok","accept"| action=SELECT |
| "source","select source","source select","change source","input select","select input","change input"| action=SOURCE_SELECT |
| "pip","picture in picture"| action=PIP |
| "guide","channel guide","show guide","show channels"| action=GUIDE |
| "dvr menu"| action=DVR_MENU |

### <a id="LircComponent"></a>LircComponent Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "dvd player","dvd, d.v.d. player"| component=COMPONENT_DVD |
| "dvr","digital video recorder, d. v. r."| component=COMPONENT_DVR |
| "hdp","high definition player, h. d. p."| component=COMPONENT_HDP |
| "ps4","playstation four, playstation, p. s. four"| component=COMPONENT_PS |
| "tv","television, t. v."| component=COMPONENT_TV |
| "set top box","s. t. b.","settopbox"| component=COMPONENT_STB |
| "cable box","cable"| component=COMPONENT_CABLE |
| "satellite","satellite dish"| component=COMPONENT_SATELLITE |
| "tuner"| component=COMPONENT_TUNER |
| "firetv","fire tv","fire t. v.","amazon fire tv","amazon fire t. v.","fire stick","amazon fire stick"| component=COMPONENT_FIRETV |
| "vcr","video cassette recorder","v. c. r."| component=COMPONENT_VCR |
| "apple tv","apple t. v."| component=COMPONENT_APPLETV |
| "System"| component=COMPONENT_SYSTEM |
| "avr","a. v. receiver","audio video receiver","a. v. r."| component=COMPONENT_AVR |
| "xbox","x. box","x. box one","x. box three hundred sixty"| component=COMPONENT_XBOX |

### <a id="LircAVRAction"></a>LircAVRAction Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "change component","set component","set device","change device","device","component"| action=CHANGE_COMPONENT |

### <a id="LircAVDevice"></a>LircAVDevice Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "dvd player","dvd, d.v.d. player"| component=COMPONENT_DVD |
| "dvr","digital video recorder, d. v. r."| component=COMPONENT_DVR |
| "hdp","high definition player, h. d. p."| component=COMPONENT_HDP |
| "ps4","playstation four, playstation, p. s. four"| component=COMPONENT_PS |
| "tv","television, t. v."| component=COMPONENT_TV |
| "set top box","s. t. b.","settopbox"| component=COMPONENT_STB |
| "cable box","cable"| component=COMPONENT_CABLE |
| "satellite","satellite dish"| component=COMPONENT_SATELLITE |
| "tuner"| component=COMPONENT_TUNER |
| "firetv","fire tv","fire t. v.","amazon fire tv","amazon fire t. v.","fire stick","amazon fire stick"| component=COMPONENT_FIRETV |
| "vcr","video cassette recorder","v. c. r."| component=COMPONENT_VCR |
| "apple tv","apple t. v."| component=COMPONENT_APPLETV |
| "avr","a. v. receiver","audio video receiver","a. v. r."| component=COMPONENT_AVR |
| "xbox","x. box","x. box one","x. box three hundred sixty"| component=COMPONENT_XBOX |

### <a id="LircChannelAction"></a>LircChannelAction Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "change channel","set channel","channel"| action=CHANNEL_CHANGE |

### <a id="LircVolumeAction"></a>LircVolumeAction Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "increase volume","increase","raise volume","raise"| action=VOLUME_INCREASE |
| "decrease volume","decrease","lower volume","lower"| action=VOLUME_DECREASE |

### <a id="LircNavigateAction"></a>LircNavigateAction Slot

| What you can say | lircdo server meta Key & Value |
|-----|-----|
| "up","upward"| action=NAVIGATE_UP |
| "down","downward"| action=NAVIGATE_DOWN |
| "right","rightward"| action=NAVIGATE_RIGHT |
| "left","leftward"| action=NAVIGATE_LEFT |
| "page up"| action=NAVIGATE_PAGE_UP |
| "page down"| action=NAVIGATE_PAGE_DOWN |
| "page right"| action=NAVIGATE_PAGE_RIGHT |
| "page left"| action=NAVIGATE_PAGE_LEFT |
| "previous chapter","chapter back"| action=NAVIGATE_CHAPTER_PREVIOUS |
| "next chapter","chapter forward"| action=NAVIGATE_CHAPTER_NEXT |
| "channel up"| action=CHANNEL_UP |
| "channel down"| action=CHANNEL_DOWN |
| "fast forward","forward"| action=FAST_FORWARD |
| "reverse","rewind","reverse play"| action=REVERSE |
| "return","back"| action=NAVIGATE_RETURN |

