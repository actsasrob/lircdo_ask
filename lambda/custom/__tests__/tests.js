const assert = require('chai').assert;

const constants = require('../constants/constants');
const va = require("virtual-alexa");
beforeAll(() => {
	alexa = va.VirtualAlexa.Builder()
		.handler("./index.handler") // Lambda function file and name
		.applicationID('amzn1.ask.skill.1640f539-4c65-43e2-8523-62478f40d2ba')
		.interactionModelFile("../../models/en-US.json") // Path to interaction model file
		.create();

	alexa.context().device()
		.setID('amzn1.ask.device.AERQWYDPXKPVES7MTBLCVLG6R2XHGFK6TKY7B5MLQD2PXZIQ74CGJBMXSNWJYECJORZNITQN62KJECR7MAAXRM5OQVLJI33ZRSCJMHC7O4U3ESRXWDRPV5H6V67NKJNQQX75X3SKRLRKMYL575G2FA3UY5TRYEN3B36HWJTBAOWVDKH3XYI2S');
});

//describe('Test unpairing and pairing server', function() {
//	test('Launch skill and unpair server', async () => { 
//		let result = await alexa.launch();
//		console.log(`result: ${JSON.stringify(result)}`);
//		await alexa.utter("unpair server");
//		await alexa.utter("yes");
//		await alexa.endSession();
//		assert(true);
//		//assert.include(result.prompt(), 'welcome');
//	});
//
//
//
//      test('Launch skill and pair server', async () => { 
//              //var result = await alexa.launch();
//              //console.log(`result: ${JSON.stringify(result)}`);
//              await alexa.intend('pair_server', { OctetA: '108', OctetB: '51', OctetC: '25', OctetD: '67', ApplicationPort: '8844', ApplicationPin: '178' });
//              let result = await alexa.intend('pair_server', { OctetA: '108', OctetB: '51', OctetC: '25', OctetD: '67', ApplicationPort: '8844', ApplicationPin: '178' });
//              console.log(`result: ${JSON.stringify(result)}`);
//	      assert.equal(true,true);
//      });
//
//});

describe('Test expected intent responses against various input', function() {

       test('Test skill launch prompt', async () => {
                let result = await alexa.launch();                                   
                //console.log(`result: ${JSON.stringify(result)}`);
                assert(true, constants.mainStateHandlerLaunchHandlerSpeech.say.some(x => x.includes(result.response.outputSpeech.ssml.replace('<speak>', '').replace('</speak>', ''))));
                assert(true, constants.mainStateHandlerLaunchHandlerSpeech.reprompt.some(x => x.includes(result.response.reprompt.outputSpeech.ssml.replace('<speak>', '').replace('</speak>', ''))));
        });

        test('lircdo intent valid slot values -- recognizes power on', async () => {
                 await alexa.intend("lircdo", { LircAction: 'power on', LircComponent: 'tv'});
                 let result =await alexa.intend("lircdo", { LircAction: 'power on', LircComponent: 'tv'});
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('lircdo intent valid slot values -- recognizes TRAY_CLOSE', async () => {
                 await alexa.intend("lircdo", { LircAction: 'TRAY_CLOSE', LircComponent: 'COMPONENT_DVD'});
                 let result = await alexa.intend("lircdo", { LircAction: 'TRAY_CLOSE', LircComponent: 'COMPONENT_DVD'});
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('lircdo intent valid slot values -- recognizes SELECT', async () => {
                 await alexa.intend("lircdo", { LircAction: 'SELECT', LircComponent: 'COMPONENT_STB'});
                 let result = await alexa.intend("lircdo", { LircAction: 'SELECT', LircComponent: 'COMPONENT_STB'});
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('lircdo intent valid slot values -- recognizes MUTE', async () => {
                 await alexa.intend("lircdo", { LircAction: 'MUTE', LircComponent: 'COMPONENT_SYSTEM'});
                 let result = await alexa.intend("lircdo", { LircAction: 'MUTE', LircComponent: 'COMPONENT_SYSTEM'});
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('lircdo intent valid slot values -- recognizes on demand', async () => {
                 await alexa.intend("lircdo", { LircAction: 'ON_DEMAND', LircComponent: 'COMPONENT_STB'});
                 let result = await alexa.intend("lircdo", { LircAction: 'ON_DEMAND', LircComponent: 'COMPONENT_STB'});
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('lircdo intent valid slot values -- recognizes unpause', async () => {
                 await alexa.intend("lircdo", { LircAction: 'unpause', LircComponent: 'COMPONENT_DVD'});
                 let result = await alexa.intend("lircdo", { LircAction: 'unpause', LircComponent: 'COMPONENT_DVD'});
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('lircdo intent is detected -- recognizes subtitles', async () => {
                await alexa.utter("subtitles");
                let result = await alexa.utter("subtitles");
                //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('lircdo intent is detected -- recognizes play', async () => {
                await alexa.utter("play");
                let result = await alexa.utter("play");
                //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('lircdo intent detect no matching LIRC script', async () => {
                 await alexa.intend("lircdo", { LircAction: 'TRAY_OPEN', LircComponent: 'COMPONENT_PS4'});
                 let result =await alexa.intend("lircdo", { LircAction: 'TRAY_OPEN', LircComponent: 'COMPONENT_PS4'});
                assert.include(result.response.outputSpeech.ssml, 'No matching LIRC script');
        });

        test('change channel intent valid slot values', async () => {
                 await alexa.intend("channel_action", { LircChannelAction: 'change channel', LircNumericArgument: '746'});
                let result = await alexa.intend("channel_action", { LircChannelAction: 'change channel', LircNumericArgument: '746'});
                //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('test channel_action intent is detected', async () => {
                await alexa.utter("change channel to 233");
                let result = await alexa.utter("change channel to 233");
                //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('change channel intent detect no matching lirc scrpt', async () => {
                 await alexa.intend("channel_action", { LircChannelAction: 'CHANNEL_CHANGE', LircComponent: 'COMPONENT_FIRETV', LircNumericArgument: '746'});
                 let result = await alexa.intend("channel_action", { LircChannelAction: 'CHANNEL_CHANGE', LircComponent: 'COMPONENT_FIRETV', LircNumericArgument: '746'});
                //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(result.response.outputSpeech.ssml, 'No matching LIRC script');
        });

        test('test channel_action intent detects channel argument > five digits', async () => {
                await alexa.utter("change channel to 123456");
                let result = await alexa.utter("change channel to 123456");
                //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(result.response.outputSpeech.ssml, 'with message invalid channel argument');
        });

        test('test channel_action intent detects non-numeric channel argument', async () => {
                await alexa.intend("channel_action", { LircChannelAction: 'CHANGE_CHANNEL', LircComponent: 'COMPONENT_STB', LircNumericArgument: 'bad'});
                let result = await alexa.intend("channel_action", { LircChannelAction: 'CHANGE_CHANNEL', LircComponent: 'COMPONENT_STB', LircNumericArgument: 'bad'});
                //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(result.response.outputSpeech.ssml, 'with message invalid channel argument');
        });

        test("raise volume intent valid slot values", async () => {
                await alexa.intend("volume_action", { LircVolumeAction: "raise volume", LircNumericArgument: '5'});
                let result=await alexa.intend("volume_action", { LircVolumeAction: "raise volume", LircNumericArgument: '5'});
                        //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
                });

        test("test volume_action detects non-numeric argument", async () => {
                await alexa.intend("volume_action", { LircVolumeAction: "raise volume", LircNumericArgument: 'bad', LircComponent: 'COMPONENT_STB'});
                let result = await alexa.intend("volume_action", { LircVolumeAction: "raise volume", LircNumericArgument: 'bad', LircComponent: 'COMPONENT_STB'});
                        //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(result.response.outputSpeech.ssml, 'with message invalid volume argument');
                });

        test("test volume_action detects numeric argument is one or two digits", async () => {
                await alexa.intend("volume_action", { LircVolumeAction: "raise volume", LircNumericArgument: '123', LircComponent: 'COMPONENT_AVR'});
                let result = await alexa.intend("volume_action", { LircVolumeAction: "raise volume", LircNumericArgument: '123', LircComponent: 'COMPONENT_AVR'});
                        //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(result.response.outputSpeech.ssml, 'with message invalid volume argument');     
                })

        test("test avr_action with valid slot values", async () => {

                await alexa.intend("avr_action", { LircAVRAction: "change component", LircAVDevice: 'firetv'});
                let result = await alexa.intend("avr_action", { LircAVRAction: "change component", LircAVDevice: 'firetv'});
                        //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
                });

        test("test avr_action detect no matching LIRC script", async () => {

                await alexa.intend("avr_action", { LircAVRAction: "CHANGE_COMPONENT", LircAVDevice: 'COMPONENT_XBOX'});
                let result = await alexa.intend("avr_action", { LircAVRAction: "CHANGE_COMPONENT", LircAVDevice: 'COMPONENT_XBOX'});
                        //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(result.response.outputSpeech.ssml, 'No matching LIRC script');
                });

        test('navigate_action intent valid slot values', async () => {
                 await alexa.intend("navigate_action", { LircNavigateAction: 'page up', LircComponent: 'set top box'});
                 let result = await alexa.intend("navigate_action", { LircNavigateAction: 'page up', LircComponent: 'set top box'});
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('navigate_action intent valid slot values with default component', async () => {
                 await alexa.intend("navigate_action", { LircNavigateAction: 'page right', LircNumericArgument: '3'});
                 let result = await alexa.intend("navigate_action", { LircNavigateAction: 'page right', LircNumericArgument: '3'});
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('navigate_action intent valid slot values -- recognizes fast forward', async () => {
                 await alexa.intend("navigate_action", { LircNavigateAction: 'fast forward', LircNumericArgument: '1'});
                 let result = await alexa.intend("navigate_action", { LircNavigateAction: 'fast forward', LircNumericArgument: '1'});
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('navigate_action intent valid slot values -- recognizes rewind', async () => {
                 await alexa.intend("navigate_action", { LircNavigateAction: 'rewind', LircNumericArgument: '1'});
                 let result = await alexa.intend("navigate_action", { LircNavigateAction: 'rewind', LircNumericArgument: '1'});
                assert.include(constants.mainStateActionHandlerSpeech.say, result.response.outputSpeech.ssml.replace('<speak>','').replace('</speak>',''));
        });

        test('navigate_action intent detects no matching LIRC script', async () => {
                 await alexa.intend("navigate_action", { LircNavigateAction: 'left', LircComponent: 'firetv'});
                 let result = await alexa.intend("navigate_action", { LircNavigateAction: 'left', LircComponent: 'firetv'});
                assert.include(result.response.outputSpeech.ssml, 'No matching LIRC script');
        });

        test('test navigate_action intent is detected -- recognizes previous chapter', async () => {
                await alexa.utter("previous chapter");
                let result = await alexa.utter("previous chapter");
                //console.log(`result: ${JSON.stringify(result)}`);
                assert.include(result.response.outputSpeech.ssml, 'No matching LIRC script');
        });

        test('navigate_action intent test invalid numeric argument', async () => {
                 await alexa.intend("navigate_action", { LircNavigateAction: 'down', LircNumericArgument: '3'});
                 let result = await alexa.intend("navigate_action", { LircNavigateAction: 'down', LircNumericArgument: '99999'});
                assert.include(result.response.outputSpeech.ssml, 'error with message invalid numeric');
        });

        test('test action intent does not end session ', async () => {
                await alexa.utter("set component to ps4");
                let result = await alexa.utter("set component to ps4");
                //console.log(`result: ${JSON.stringify(result)}`);
                assert.equal(false, result.response.shouldEndSession);
        });

});

