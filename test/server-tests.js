/*
Mocha tests for the Alexa skill 
Using the Alexa Skill Test Framework (https://github.com/BrianMacIntosh/alexa-skill-test-framework).

Run with 'mocha server-tests.js'.
*/

const constants = require('../lambda/custom/constants/constants');
// include the testing framework
const alexaTest = require('alexa-skill-test-framework');
//const alexaTest = require('../../index');

// initialize the testing framework
alexaTest.initialize(
	require('../lambda/custom/index.js'),
	"amzn1.ask.skill.1640f539-4c65-43e2-8523-62478f40d2ba",
	"amzn1.ask.account.AEFTLT7DQAY3LSK3ACZAWKQMYXUFCVH5IOUJ4BW3JKMZK6POOK5SNCEIECL6PCUGB22RMX7KWVDM7OLB3TMXAC37QKOOICXXLYLLZKECPHW4XPQ4NRDXQXC5DAQUZK7GJSVOIZ2AIMEWDPLXVREHUWU2F3RVRP4HZWOKOUWGXOTR6WQE4FIWZ6CTYMYCXO3IAJ73VTDC3VZQMDI");

alexaTest.setDynamoDBTable('lircdo_test_tbl');
//console.log("server-tests.js: alexaTest: "+ JSON.stringify(alexaTest));

describe("Lirc Do Skill", function () {
	// tests the behavior of the skill's LaunchRequest
	describe("LaunchRequest", function () {
		alexaTest.test([
			{
				request: alexaTest.getLaunchRequest(),
				says: constants.mainStateHandlerLaunchHandlerSpeech.say,
				reprompts: constants.mainStateHandlerLaunchHandlerSpeech.reprompt,
				shouldEndSession: false
			}
		]);
	});

	// tests entity resolution for lircdo intent
        describe('lircdoIntent with synonyms (array)', function () {
                const slotsWithSynonym = {'LircAction': 'power on', 'LircComponent' : 'tv'};
                const requestWithEntityResolution = alexaTest.addEntityResolutionsToRequest(
                        alexaTest.getIntentRequest('lircdo', slotsWithSynonym),
                        [{
                                slotName: 'LircAction',
                                slotType: 'LIRC_ACTION',
                                value: 'POWER_ON',
                                id: 'POWER_ON'
                        },
			{
                                slotName: 'LircComponent',
                                slotType: 'LIRC_COMPONENT',
                                value: 'COMPONENT_TV',
                                id: 'COMPONENT_TV'
                        }]
                );

                function assertResponseText(context, response) {
			//console.log("server-tests.js lircdoIntent with synonyms (array) assertResponseText response="+ JSON.stringify(response));
                        const outputSpeech = response.response.outputSpeech.ssml.replace('<speak>', '').replace('</speak>', '');
                        //console.log("server-tests.js: test lircdoIntent outputSpeech="+ outputSpeech);

                        if (outputSpeech.trim().indexOf("success") < 0) {
                                context.assert({message: 'Expected dialog to contain success message'});
                        }
                }

                alexaTest.test([
                        {
                                request: requestWithEntityResolution,
                                callback: assertResponseText, 
				says: 'Action status was success with message success. What\'s next?',
                                reprompts: 'What\'s next?',
                                shouldEndSession: false
                        }
                ]);
        });



        // tests the behavior of the skill's lircdo Intent
        describe('lircdoIntent', function () {
                const slots = {'LircAction': 'TRAY_OPEN', 'LircComponent' : 'COMPONENT_DVD'};
                var requestWithSlots = alexaTest.getIntentRequest('lircdo', slots);

                function assertResponseText(context, response) {
                        const outputSpeech = response.response.outputSpeech.ssml.replace('<speak>', '').replace('</speak>', '');
                        //console.log("server-tests.js: test lircdoIntent outputSpeech="+ outputSpeech);

                        if (outputSpeech.trim().indexOf("success") < 0) {
                                context.assert({message: 'Expected dialog to contain success message'});
                        }
                }

                alexaTest.test([
                        {
                                request: requestWithSlots,
                                callback: assertResponseText, 
                                says: 'Action status was success with message success. What\'s next?',
                                reprompts: 'What\'s next?',
                                shouldEndSession: false
                        }
                ]);
        });

        // tests entity resolution for avr_action intent
        describe('avr_action intent with synonyms (array)', function () {
                const slotsWithSynonym = {'LircAVRAction': 'set component', 'LircAVDevice' : 'dvr'};
                const requestWithEntityResolution = alexaTest.addEntityResolutionsToRequest(
                        alexaTest.getIntentRequest('avr_action', slotsWithSynonym),
                        [{
                                slotName: 'LircAVRAction',
                                slotType: 'LIRC_AVR_ACTION',
                                value: 'CHANGE_COMPONENT',
                                id: 'CHANGE_COMPONENT'
                        },
                        {
                                slotName: 'LircAVDevice',
                                slotType: 'LIRC_AV_DEVICE',
                                value: 'COMPONENT_DVR',
                                id: 'COMPONENT_DVR'
                        }]
                );

                function assertResponseText(context, response) {
                        const outputSpeech = response.response.outputSpeech.ssml.replace('<speak>', '').replace('</speak>', '');
                        //console.log("server-tests.js: test avr_action Intent outputSpeech="+ outputSpeech);

                        if (outputSpeech.trim().indexOf("success") < 0) {
                                context.assert({message: 'Expected dialog to contain success message'});
                        }
                }

                alexaTest.test([
                        {
                                request: requestWithEntityResolution,
                                callback: assertResponseText, 
                                says: 'Action status was success with message success. What\'s next?',
                                reprompts: 'What\'s next?',
                                shouldEndSession: false
                        }
                ]);
        });

       // tests behavior for avr_action intent
        describe('avr_action intent', function () {
                const slots = {'LircAVRAction': 'CHANGE_COMPONENT', 'LircAVDevice' : 'COMPONENT_DVR'};
                var requestWithSlots = alexaTest.getIntentRequest('avr_action', slots);

                function assertResponseText(context, response) {
                        const outputSpeech = response.response.outputSpeech.ssml.replace('<speak>', '').replace('</speak>', '');
                        //console.log("server-tests.js: test avr_action Intent outputSpeech="+ outputSpeech);

                        if (outputSpeech.trim().indexOf("success") < 0) {
                                context.assert({message: 'Expected dialog to contain success message'});
                        }
                }

                alexaTest.test([
                        {
                                request: requestWithSlots,
                                callback: assertResponseText,
                                says: 'Action status was success with message success. What\'s next?',
                                reprompts: 'What\'s next?',
                                shouldEndSession: false
                        }
                ]);
        });

        // tests entity resolution for channel_action intent
        describe('channel_action intent with synonyms (array)', function () {
                const slotsWithSynonym = {'LircChannelAction': 'change channel', 'LircComponent' : 'set top box', 'LircNumericArgument': '746'};
                const requestWithEntityResolution = alexaTest.addEntityResolutionsToRequest(
                        alexaTest.getIntentRequest('channel_action', slotsWithSynonym),
                        [{
                                slotName: 'LircChannelAction',
                                slotType: 'LIRC_CHANNEL',
                                value: 'CHANNEL_CHANGE',
                                id: 'CHANNEL_CHANGE'
                        },
                        {
                                slotName: 'LircComponent',
                                slotType: 'LIRC_COMPONENT',
                                value: 'COMPONENT_STB',
                                id: 'COMPONENT_STB'
                        }]
                );

                function assertResponseText(context, response) {
                        const outputSpeech = response.response.outputSpeech.ssml.replace('<speak>', '').replace('</speak>', '');

                        if (outputSpeech.trim().indexOf("success") < 0) {
                                context.assert({message: 'Expected dialog to contain success message'});
                        }
                }

                alexaTest.test([
                        {
                                request: requestWithEntityResolution,
                                callback: assertResponseText, 
                                says: 'Action status was success with message success. What\'s next?',
                                reprompts: 'What\'s next?',
                                shouldEndSession: false
                        }
                ]);
        });

       // tests behavior for channel_action intent
        describe('channel_action intent', function () {
                const slots = {'LircChannelAction': 'CHANNEL_CHANGE', 'LircComponent' : 'COMPONENT_STB', 'LircNumericArgument': '231'};
                var requestWithSlots = alexaTest.getIntentRequest('channel_action', slots);

                function assertResponseText(context, response) {
                        const outputSpeech = response.response.outputSpeech.ssml.replace('<speak>', '').replace('</speak>', '');

                        if (outputSpeech.trim().indexOf("success") < 0) {
                                context.assert({message: 'Expected dialog to contain success message'});
                        }
                }

                alexaTest.test([
                        {
                                request: requestWithSlots,
                                callback: assertResponseText,
                                says: 'Action status was success with message success. What\'s next?',
                                reprompts: 'What\'s next?',
                                shouldEndSession: false
                        }
                ]);
        });

        // tests entity resolution for channel_action intent
        describe('volume_action intent with synonyms (array)', function () {
                const slotsWithSynonym = {'LircVolumeAction': 'raise volume', 'LircComponent' : 'av receiver', 'LircNumericArgument': '5'};
                const requestWithEntityResolution = alexaTest.addEntityResolutionsToRequest(
                        alexaTest.getIntentRequest('volume_action', slotsWithSynonym),
                        [{
                                slotName: 'LircVolumeAction',
                                slotType: 'LIRC_VOLUME_ACTION',
                                value: 'VOLUME_INCREASE',
                                id: 'VOLUME_INCREASE'
                        },
                        {
                                slotName: 'LircComponent',
                                slotType: 'LIRC_COMPONENT',
                                value: 'COMPONENT_AVR',
                                id: 'COMPONENT_AVR'
                        }]
                );

                function assertResponseText(context, response) {
                        const outputSpeech = response.response.outputSpeech.ssml.replace('<speak>', '').replace('</speak>', '');

                        if (outputSpeech.trim().indexOf("success") < 0) {
                                context.assert({message: 'Expected dialog to contain success message'});
                        }
                }

                alexaTest.test([
                        {
                                request: requestWithEntityResolution,
                                callback: assertResponseText,
                                says: 'Action status was success with message success. What\'s next?',
                                reprompts: 'What\'s next?',
                                shouldEndSession: false
                        }
                ]);
        });

       // tests behavior for volume_action intent
        describe('volume_action intent', function () {
                const slots = {'LircVolumeAction': 'VOLUME_DECREASE', 'LircComponent' : 'COMPONENT_AVR', 'LircNumericArgument': '4'};
                var requestWithSlots = alexaTest.getIntentRequest('volume_action', slots);

                function assertResponseText(context, response) {
                        const outputSpeech = response.response.outputSpeech.ssml.replace('<speak>', '').replace('</speak>', '');

                        if (outputSpeech.trim().indexOf("success") < 0) {
                                context.assert({message: 'Expected dialog to contain success message'});
                        }
                }

                alexaTest.test([
                        {
                                request: requestWithSlots,
                                callback: assertResponseText,
                                says: 'Action status was success with message success. What\'s next?',
                                reprompts: 'What\'s next?',
                                shouldEndSession: false
                        }
                ]);
        });

	// tests the behavior of the skill's lircdo Intent
	//describe("lircdo Intent", function () {
	//	alexaTest.test([
	//		{
	//			request: alexaTest.getIntentRequest("HelloWorldIntent"),
	//			says: "Hello World!", repromptsNothing: true, shouldEndSession: true,
	//			hasAttributes: {
	//				foo: 'bar'
	//			}
	//		}
	//	]);
	//});
	
	// tests the behavior of the skill's HelloWorldIntent with like operator
	//describe("HelloWorldIntent like", function () {
	//	alexaTest.test([
	//		{
	//			request: alexaTest.getIntentRequest("HelloWorldIntent"),
	//			saysLike: "World", repromptsNothing: true, shouldEndSession: true
	//		}
	//	]);
	//});
});
