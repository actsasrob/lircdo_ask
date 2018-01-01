// Big thanks to Oscar Merry and the excellent Advanced Alexa course over at A Cloud Guru
// Source code for this project borrowed from: https://github.com/MerryOscar/voice-devs-lessons

var Alexa = require('alexa-sdk');

// Constants
var constants = require('./constants/constants');

// Handlers
var onboardingStateHandlers = require('./handlers/onboardingStateHandlers');
var mainStateHandlers = require('./handlers/mainStateHandlers');

exports.handler = function(event, context, callback){
  var alexa = Alexa.handler(event, context);

  alexa.appId = constants.appId;
  alexa.dynamoDBTableName = constants.dynamoDBTableName;

  alexa.registerHandlers(
    onboardingStateHandlers,
    mainStateHandlers
  );

  alexa.execute();
};
