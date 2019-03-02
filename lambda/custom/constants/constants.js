var constants = Object.freeze({

	// App-ID. Set The App ID
	appId : 'amzn1.ask.skill.1640f539-4c65-43e2-8523-62478f40d2ba',

	//  DynamoDB Table Name
	dynamoDBTableName : 'lircdo_table_v2',

	// Default application port
	defaultApplicationPort : '8843',

	// Skill States
	states : {
		INITIAL : '',
		PAIRING : '_PAIRING',
		MAIN : '_MAIN',
	},

	mainStateHandlerLaunchHandlerSpeech: {
		say : ['Welcome back. What action would you like to perform?', 'Welcome back. What would you like to do?'],
		reprompt : ['What action would you like to perform?', 'What would you like to do?'],
	},
	mainStateHandlerHelpSpeech: {
		say : ["You can operate your audio and video equipment using voice commands."],
		reprompt :['What action would you like to perform?', 'What would you like to do?'],
	},
	mainStateHandlerThingsToSay: {
		sayLength: 5,
		say: ['power on system',
		'turn on set top box',
		'power off t.v.',
		'open d.v.d. tray',
		'close d.v.d. tray',
		'play d.v.d. player',
		'pause set top box',
		'<phoneme alphabet="ipa" ph="ˈrəkɔrd">record</phoneme> set top box',
		'show menu set top box',
		'dismiss menu s.t.b.',
		'increase volume by 5',
		'raise t.v. volume by 2',
		'decrease a.v.r. volume by 10',
		'lower volume by 15',
		'change channel to 746',
		'set channel to two three one',
		'change component to fire t.v.',
		'set device to x box player',
		'mute system',
		'unmute system',
		'mute t.v.',
		],
	},
	mainStateHandlerRequiredSlots: {
		lircdo: [ 'LircAction' ],
		volume_action: [ 'LircVolumeAction', 'LircNumericArgument' ],
		channel_action: [ 'LircChannelAction', 'LircNumericArgument' ],
		avr_action: [ 'LircAVRAction', 'LircAVDevice' ],
		pair_server: [ 'OctetA', 'ApplicationPin', 'ApplicationPort' ],
	},
	stateHandlerIntentNameToCallbackLookup: {
		lircdo: '/lircdo_ask',
		volume_action: '/volume_action_ask', 
		channel_action: '/channel_action_ask',
		avr_action: '/avr_action_ask',
		pair_server: '/pair_action_ask',
	},
	stateHandlerSlotNameToParamNameLookup: {
		lircdo: { LircComponent: 'lircComponent', LircAction: 'lircAction' },
		volume_action: { LircComponent: 'lircComponent', LircVolumeAction: 'lircVolumeAction', LircNumericArgument: 'lircArgument' },
		channel_action: { LircComponent: 'lircComponent', LircChannelAction: 'lircChannelAction', LircNumericArgument: 'lircArgument' },
		avr_action: { LircAVDevice: 'lircAVDevice', LircAVRAction: 'lircAVRAction' },
	},
	initialStateHandlerSpeech: {
		say : ['We need to pair the LIRC do server-side application. Please say the application pin of the server like, my application pin is, followed by the pin number'],
		reprompt :['Please say the application pin of the server like, my application pin is, followed by the pin number'],
	},
	initialStateHandlerHelpSpeech: {
		say : ["You can operate your audio and video equipment using voice commands. I've added a card to your alexa application with links where you can find additional information about this skill including how to pair the skill with your lirc do server. To start the pairing process now say your lirc do server pin number. You can say my application pin is, followed by the pin number."],
		reprompt :["Please see the card added to your alexa application for additional setup details. To start the pairing process now say your lirc do server pin number. You can say my application pin is, followed by the pin number."],
	},
	initialStateHandlerCard: {
		title: 'Baba Zoo Help',
		content: 'Please navigate to the following link to learn more about Baba zoo (aka LIRC Do) including building the lircdo server: https://github.com/actsasrob/lircdo_ask/blob/master/README.md\n\nNavigate to this link to learn about how to interact with the lircdo Alexa skill: https://github.com/actsasrob/lircdo_ask/blob/master/README_using_skill.md',
	},

});

module.exports = constants;
