var constants = Object.freeze({

  // App-ID. TODO: Set Your App ID
  appId : '',

  //  DynamoDB Table Name
  dynamoDBTableName : 'lircdo_test_tbl',

  // Skill States
  states : {
    INITIAL : '',
    PAIRING : '_PAIRING',
    MAIN : '_MAIN',
  }

});

module.exports = constants;
