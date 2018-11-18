var constants = Object.freeze({

  // App-ID. Set The App ID
  appId : 'amzn1.ask.skill.1640f539-4c65-43e2-8523-62478f40d2ba',

  //  DynamoDB Table Name
  dynamoDBTableName : 'lircdo_test_tbl',

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

});

module.exports = constants;
