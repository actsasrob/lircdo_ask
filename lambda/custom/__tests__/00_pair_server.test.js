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
//	//test('Launch skill and pair server', async () => {
//	//	let result = await alexa.launch();
//	//	console.log(`result: ${JSON.stringify(result)}`);
//	//	//assert.include(result.response.outputSpeech.ssml, constants.initialStateHandlerSpeech.say);
//	//	//assert.include(result.response.outputSpeech.ssml, "Please say the application pin");
//	//	const pair_server_step1 = await alexa.utter("my application pin is one seven eight");
//	//	console.log(`initiate_unpair_step1: ${JSON.stringify(initiate_unpair_step1)}`);
//	//	assert(true);
//	//	//assert.include(result.prompt(), 'welcome');
//	//});
//
//	test('Launch skill and pair server', (done) => { 
//		//let result = await alexa.launch();
//		//console.log(`result: ${JSON.stringify(result)}`);
//		alexa.intend('pair_server', { OctetA: '108', OctetB: '51', OctetC: '25', OctetD: '67', ApplicationPort: '8844', ApplicationPin: '178' }).then((payload) => {
//			console.log(`payload ${JSON.stringify(payload)}`);
//                        expect(payload.prompt).toContain("What is the application I.P.");
//                        //return alexa.utter("my application address is one zero eight dot five one dot two five dot six seven");
//                        return alexa.intend('pair_server', { OctetA: '108', OctetB: '51', OctetC: '25', OctetD: '67' });
//
//                }).then((payload) => {
//			console.log(`payload ${JSON.stringify(payload)}`);
//			expect(payload.prompt).toContain("my application pin is");
//			return alexa.utter("my application pin is one seven eight");
//		}).then((payload) => {
//			console.log(`payload ${JSON.stringify(payload)}`);
//			expect(payload.response.outputSpeech.ssml).toContain("application address");
//			return alexa.utter("my application address is one zero eight dot five one dot two five dot six seven");
//
//		}).then((payload) => {
//			console.log(`payload ${JSON.stringify(payload)}`);
//			expect(payload.response.outputSpeech.ssml).toContain("correct");
//			return alexa.utter("yes");
//
//		}).then((payload) => {
//			console.log(`payload ${JSON.stringify(payload)}`);
//			expect(payload.response.outputSpeech.ssml).toContain("correct");
//			return alexa.utter("yes");
//
//		});
//
//	});
//});

//describe('Test expected intent responses against various input', function() {
//test("change channel", (done) => {
//    alexa.utter("change channel to 746").then((payload) => {
//			console.log(`payload ${JSON.stringify(payload)}`);
//        expect(payload.response.outputSpeech.ssml).toContain("success");
//   }); 
//});

describe('Test expected intent responses against various input', function() {

       test('Test skill launch prompt', async () => {
                let result = await alexa.launch();                                   
                console.log(`result: ${JSON.stringify(result)}`);
                assert(true, constants.mainStateHandlerLaunchHandlerSpeech.say.some(x => x.includes(result.response.outputSpeech.ssml.replace('<speak>', '').replace('</speak>', ''))));
        });


        test('change channel intend', async () => {
                 await alexa.intend("channel_action", { LircChannelAction: 'change channel', LircNumericArgument: '746'});
                let result = await alexa.intend("channel_action", { LircChannelAction: 'change channel', LircNumericArgument: '746'});
                console.log(`result: ${JSON.stringify(result)}`);
                //assert.equal(true,true);
                assert.include(result.response.outputSpeech.ssml, 'Action status was success');
        });


        test('change channel1', async () => {
                await alexa.utter("set channel to 231");
                let result = await alexa.utter("change channel to 231");
                console.log(`result: ${JSON.stringify(result)}`);
                assert.include(result.response.outputSpeech.ssml, 'Action status was success');
        });

        test("raise volume test intend", async () => {
                await alexa.intend("volume_action", { LircVolumeAction: "raise volume", LircNumericArgument: '5'});
                let result=await alexa.intend("volume_action", { LircVolumeAction: "raise volume", LircNumericArgument: '5'});
                        console.log(`result: ${JSON.stringify(result)}`);
                assert.include(result.response.outputSpeech.ssml, 'Action status was success');
                });

	test('lower volume test', async () => {
		//await alexa.launch();
		await alexa.utter("lower volume by 10");
		let result = await alexa.utter("lower volume by 10");
		console.log(`result: ${JSON.stringify(result)}`);
		assert.include(result.response.outputSpeech.ssml, 'Action status was success');
	});
});

