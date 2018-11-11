// Big thanks to Oscar Merry and the excellent Advanced Alexa course over at A Cloud Guru
// Source code for this project borrowed from: https://github.com/MerryOscar/voice-devs-lessons

//var Alexa = require('alexa-sdk'); // v1 sdk
var Alexa = require('ask-sdk-v1adapter'); // v2 sdk with v1 adapter
//var Alexa = require('alexa-sdk-core'); // v2 sdk no adapter

var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'}); // Required to allow mocha tests to run without
                                          //  complaining that region is not set for DynamoDB

// Constants
var constants = require('./constants/constants');

// Handlers
var initialStateHandlers = require('./handlers/initialStateHandlers');
var pairingStateHandlers = require('./handlers/pairingStateHandlers');
var mainStateHandlers = require('./handlers/mainStateHandlers');

exports.handler = function(event, context, callback){
  var alexa = Alexa.handler(event, context);

  alexa.appId = constants.appId;
  alexa.dynamoDBTableName = constants.dynamoDBTableName;

  alexa.registerHandlers(
    initialStateHandlers,
    pairingStateHandlers,
    mainStateHandlers
  );

  alexa.execute();
};

//let skill;
// 
//exports.handler = function (event, context) {
//     // Prints Alexa Event Request to CloudWatch logs for easier debugging
//     console.log(`===EVENT===${JSON.stringify(event)}`);
//     if (!skill) {
//     //skill.appID = constants.appId;
//     skill = Alexa.SkillBuilders.custom()
//     .addRequestHandlers(
//             initialStateHandlers,
//             pairingStateHandlers,
//             mainStateHandlers
//         )
//	 .withTableName(constants.dynamoDBTableName)
//	 .withAutoCreateTable(true)
//	 .withDynamoDbClient(
//	     new AWS.DynamoDB({ apiVersion: "latest", region: "us-east-1" })
//	       )
//         .create();
//     }
//
//     return skill.invoke(event,context);
// }

//exports.handler = Alexa.SkillBuilders.standard()
//  .addRequestHandlers(
//  initialStateHandlers,
//  pairingStateHandlers,
//  mainStateHandlers
//  )
//  //.addRequestInterceptors(RequestLog)
//  //.addResponseInterceptors(ResponseLog)
//  //.addErrorHandlers(ErrorHandler)
//  .withTableName('constants.dynamoDBTableName')
//  .withAutoCreateTable(true)
//.lambda();
