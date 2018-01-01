var constants = Object.freeze({

  // App-ID. TODO: Set Your App ID
  appId : '',

  //  DynamoDB Table Name
  dynamoDBTableName : 'lircdo',

  // Skill States
  states : {
    ONBOARDING : '',
    MAIN : '_MAIN',
  }

});

module.exports = constants;
