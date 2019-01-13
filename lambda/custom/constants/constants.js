var constants = Object.freeze({

  // App-ID. Set The App ID
  appId : 'amzn1.ask.skill.2ade1cff-3cb6-4230-94b6-4ff20ec3caf7',

  //  DynamoDB Table Name
  dynamoDBTableName : 'lircdo_table01',

  // Skill States
  states : {
    INITIAL : '',
    PAIRING : '_PAIRING',
    MAIN : '_MAIN',
  },

  mainStateHandlerLaunchHandlerSpeech: {
     say : ['Welcome back. What action would like to perform?', 'Welcome back. What would you like to do?'],
     reprompt : ['What action would like to perform?', 'What would you like to do?'],
  },

  initialStateHandlerSpeech: {
     say : ['We need to pair the LIRC do server-side application. Please say the application pin of the server like, my application pin is, followed by the pin number'],
     reprompt :['Please say the application pin of the server like, my application pin is, followed by the pin number'],
  },

});

module.exports = constants;
