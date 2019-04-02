/* eslint-disable  func-names */
/* eslint-disable  no-restricted-syntax */
/* eslint-disable  no-loop-func */
/* eslint-disable  consistent-return */
/* eslint-disable  no-console */
/* eslint-disable max-len */
/* eslint-disable prefer-destructuring */

const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
const https = require('https');

// Constants
var constants = require('./constants/constants');

/* INTENT HANDLERS */

const LaunchRequestHandler = {
	canHandle(handlerInput) {
		// launch requests as well as any new session
		// check to see if current device id has been paired
		// if not paired:
		//    return instructions to start pairing process
		// else 
		//    ask what to do 
		return handlerInput.requestEnvelope.session.new || handlerInput.requestEnvelope.request.type === 'LaunchRequest';
		//return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	async handle(handlerInput) {
		//console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: in handle:`);
		console.log(`Intent: LaunchRequestHandler: in handle:`);
		const attributesManager = handlerInput.attributesManager;
		const responseBuilder = handlerInput.responseBuilder;

		const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
		console.log(`Intent: LaunchRequestHandler: in handle: persistentAttributes: ${JSON.stringify(persistentAttributes)}`);
		if (Object.keys(persistentAttributes).length === 0) {
			persistentAttributes.STATE = constants.states.PAIRING;
		}

		attributesManager.setSessionAttributes(persistentAttributes);

		let speechOutput = randomPhrase(constants.mainStateHandlerLaunchHandlerSpeech.say);
		let reprompt = randomPhrase(constants.mainStateHandlerLaunchHandlerSpeech.reprompt); 
		if (persistentAttributes.STATE && persistentAttributes.STATE === constants.states.PAIRING) {
			const currentIntent = handlerInput.requestEnvelope.request.intent;
			console.log(`LaunchRequestHandler.handle handlerInput ${JSON.stringify(handlerInput)}`);
			speechOutput = randomPhrase(constants.initialStateHandlerSpeech.say);
			reprompt = randomPhrase(constants.initialStateHandlerSpeech.reprompt); 
		}

		return responseBuilder
			.speak(speechOutput)
			.reprompt(reprompt)
			.getResponse();
	},
};

const InProgressPairServerIntent = {
	async canHandle(handlerInput) {
		console.log(`in InProgressPairServerIntent.canHandle: handlerInput=${JSON.stringify(handlerInput)}`);
		const request = handlerInput.requestEnvelope.request;
		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}
		return request.type === 'IntentRequest'
			&& sessionAttributes.STATE === constants.states.PAIRING
			&& request.intent.name === 'pair_server'
			&& request.dialogState !== 'COMPLETED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		console.log(`InProgressPairServerIntent.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name} currentIntent: ${JSON.stringify(currentIntent)}`);

		// Set default values
		let applicationPortSlot = currentIntent.slots['ApplicationPort'];
		if (!("value" in applicationPortSlot)) {
			applicationPortSlot['value'] = constants.defaultApplicationPort;
		}

		let prompt = '';

		for (const slotName in currentIntent.slots) {
			if (Object.prototype.hasOwnProperty.call(currentIntent.slots, slotName)) {
				const currentSlot = currentIntent.slots[slotName];
				if (currentSlot.confirmationStatus !== 'CONFIRMED'
						&& currentSlot.resolutions
						&& currentSlot.resolutions.resolutionsPerAuthority[0]) {
					if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
						/*if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
						  prompt = 'Which would you like';
						  const size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;

						  currentSlot.resolutions.resolutionsPerAuthority[0].values
						  .forEach((element, index) => {
						  prompt += ` ${(index === size - 1) ? ' or' : ' '} ${element.value.name}`;
						  });

						  prompt += '?';

						  return handlerInput.responseBuilder
						  .speak(prompt)
						  .reprompt(prompt)
						  .addElicitSlotDirective(currentSlot.name)
						  .getResponse();
						  }
						  */
					} else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {
						if (constants.initialStateHandlerRequiredSlots.indexOf(currentSlot.name) > -1) {
							prompt = `What ${currentSlot.name} are you looking for`;

							return handlerInput.responseBuilder
								.speak(prompt)
								.reprompt(prompt)
								.addElicitSlotDirective(currentSlot.name)
								.getResponse();
						}
					}
				}
			}
		}

		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const CompletedPairServerIntent = {
	async canHandle(handlerInput) {
		console.log(`in CompletedPairServerIntent.canHandle: handlerInput=${JSON.stringify(handlerInput)}`);
		const request = handlerInput.requestEnvelope.request;
		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}

		return request.type === 'IntentRequest'
			&& sessionAttributes.STATE === constants.states.PAIRING
			&& request.intent.name === 'pair_server'
			&& request.dialogState === 'COMPLETED';
	},
	async handle(handlerInput) {
		console.log(`CompletedPairServerIntent.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name}`);

		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;

		const filledSlots = handlerInput.requestEnvelope.request.intent.slots;

		const slotValues = getSlotValues(filledSlots);
		console.log(`CompletedPairServerIntent.handler: slotValues: ${JSON.stringify(slotValues)}`);
		const ip_address = `${slotValues.OctetA.resolved}.${slotValues.OctetB.resolved}.${slotValues.OctetC.resolved}.${slotValues.OctetD.resolved}`; 
		const applicationPort = slotValues.ApplicationPort.resolved;
		const params = { 'pin': slotValues.ApplicationPin.resolved };
		console.log(`CompletedPairServerIntent.handler: ip_address: ${ip_address} applicationPort: ${applicationPort} params: ${JSON.stringify(params)}`);

		const lircdoServerOptions = buildLircdoServerOptions(false, ip_address, applicationPort, "", constants.stateHandlerIntentNameToCallbackLookup[requestEnvelope.request.intent.name], params);
		console.log(`CompletedPairServerIntent.handler: lircdoServerOptions: ${JSON.stringify(lircdoServerOptions)}`);

		let outputSpeech = '';

		try {
			const response = await httpGet(lircdoServerOptions);

			console.log(`CompletedPairServerIntent.handler: response: ${JSON.stringify(response)}`); 
			if (response.status !== 'success') {
				outputSpeech = `Pairing was not successful. The server-side application returned message ${response.message}`;
			} else {
				outputSpeech = 'The server-side LIRC Do application has been paired successfully. You should now restart the server-side LIRC Do application in non-pairing mode.';
				const attributesManager = handlerInput.attributesManager;
				const sessionAttributes = attributesManager.getSessionAttributes();
				sessionAttributes.applicationFQDN = response.fqdn;
				sessionAttributes.applicationPort = response.port;
				if ("ca_cert" in response) {
				   sessionAttributes.trustedCA = response.ca_cert;
				}
				sessionAttributes.shared_secret = response.shared_secret;
				sessionAttributes.STATE = constants.states.MAIN;
				attributesManager.setPersistentAttributes(sessionAttributes);
				await attributesManager.savePersistentAttributes();
				console.log(`CompletedPairServerIntent.handler: after await`); 
			}
		} catch (error) {
			outputSpeech = `Sorry, there was a problem performing the requested action. error is ${error}`;
			console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: message: ${error}`);
			// handle the special case where the LIRC Do service was probably not started in pairing mode
			if (error.message.match(/404:/)) {
				outputSpeech = `Sorry, there was a problem pairing with the LIRC Do service. Please ensure the LIRC Do service is started in pairing mode and try again`;
			}	
		}

		return handlerInput.responseBuilder
			.speak(outputSpeech)
			.getResponse();
	},
};


const InProgressUnpairServerIntent = {
	async canHandle(handlerInput) {
		console.log(`in InProgressUnpairServerIntent.canHandle: handlerInput=${JSON.stringify(handlerInput)}`);
		const request = handlerInput.requestEnvelope.request;
		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}

		return request.type === 'IntentRequest'
			&& sessionAttributes.STATE === constants.states.MAIN
			&& request.intent.name === 'pair_server_again'
			&& request.dialogState !== 'COMPLETED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		console.log(`InProgressUnpairServerIntent.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name} currentIntent: ${JSON.stringify(currentIntent)}`);

		let prompt = '';

		for (const slotName in currentIntent.slots) {
			if (Object.prototype.hasOwnProperty.call(currentIntent.slots, slotName)) {
				const currentSlot = currentIntent.slots[slotName];
				if (currentSlot.confirmationStatus !== 'CONFIRMED'
						&& currentSlot.resolutions
						&& currentSlot.resolutions.resolutionsPerAuthority[0]) {
					if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
						/*if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
						  prompt = 'Which would you like';
						  const size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;

						  currentSlot.resolutions.resolutionsPerAuthority[0].values
						  .forEach((element, index) => {
						  prompt += ` ${(index === size - 1) ? ' or' : ' '} ${element.value.name}`;
						  });

						  prompt += '?';

						  return handlerInput.responseBuilder
						  .speak(prompt)
						  .reprompt(prompt)
						  .addElicitSlotDirective(currentSlot.name)
						  .getResponse();
						  }
						  */
					} else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {
						if (constants.mainStateHandlerRequiredSlots[handlerInput.requestEnvelope.request.intent.name].indexOf(currentSlot.name) > -1) {
							prompt = `What ${currentSlot.name} are you looking for`;

							return handlerInput.responseBuilder
								.speak(prompt)
								.reprompt(prompt)
								.addElicitSlotDirective(currentSlot.name)
								.getResponse();
						}
					}
				}
			}
		}

		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const CompletedUnpairServerIntent = {
	async canHandle(handlerInput) {
		console.log(`in CompletedUnpairServerIntent.canHandle: handlerInput=${JSON.stringify(handlerInput)}`);
		const request = handlerInput.requestEnvelope.request;
		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}

		return request.type === 'IntentRequest'
			&& sessionAttributes.STATE === constants.states.MAIN
			&& request.intent.name === 'pair_server_again'
			&& request.dialogState === 'COMPLETED';
	},
	async handle(handlerInput) {
		console.log(`CompletedUnpairServerIntent.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name}`);
		console.log(`CompletedUnpairServerIntent.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name} handlerInput: ${JSON.stringify(handlerInput)}`);

		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;

		let outputSpeech='';

		if (requestEnvelope.request.intent.confirmationStatus === 'DENIED') {
			outputSpeech = 'Ok, the pairing process has ben cancelled';
		} else { // intent was confirmed
			outputSpeech = 'The lirc do server has been successfully unpaired';
			const sessionAttributes = attributesManager.getSessionAttributes();
			delete sessionAttributes.applicationFQDN;
			delete sessionAttributes.applicationPort;
			delete sessionAttributes.trustedCA;
			delete sessionAttributes.shared_secret;
			delete sessionAttributes.thingsToSayIndex;
			sessionAttributes.STATE = constants.states.PAIRING;
			attributesManager.setSessionAttributes(sessionAttributes);
			attributesManager.setPersistentAttributes(sessionAttributes);
			await attributesManager.savePersistentAttributes();
			console.log(`CompletedUnpairServerIntent.handler: after await`);
		}
		return handlerInput.responseBuilder
			.speak(outputSpeech)
			.getResponse();
	},
};

const FallbackHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
	},
	handle(handlerInput) {
		console.log(`FallbackHandler.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name}`);
		let speechOutput = randomPhrase(constants.mainStateHandlerLaunchHandlerSpeech.say);
		let reprompt = randomPhrase(constants.mainStateHandlerLaunchHandlerSpeech.reprompt); 
		return handlerInput.responseBuilder
			.speak(speechOutput)
			.reprompt(reprompt)
			.getResponse();
	},
};


const InProgressActionIntent = {
	async canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}

		return request.type === 'IntentRequest' &&
			sessionAttributes.STATE === constants.states.MAIN
			&& ['lircdo', 'volume_action', 'channel_action', 'avr_action'].indexOf(request.intent.name) > -1 
			&& request.dialogState !== 'COMPLETED';
	},
	async handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		console.log(`InProgressActionIntent.handle: Intent: ${handlerInput.requestEnvelope.request.intent.name} handlerInput: ${JSON.stringify(handlerInput)}`);
		//console.log(`InProgressActionIntent.handle: Intent: ${handlerInput.requestEnvelope.request.intent.name} currentIntent: ${JSON.stringify(currentIntent)}`);

		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;

		let prompt = '';

		for (const slotName in currentIntent.slots) {
			if (Object.prototype.hasOwnProperty.call(currentIntent.slots, slotName)) {
				const currentSlot = currentIntent.slots[slotName];
				if (currentSlot.confirmationStatus !== 'CONFIRMED'
						&& currentSlot.resolutions
						&& currentSlot.resolutions.resolutionsPerAuthority[0]) {
					if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
						/*if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
						  prompt = 'Which would you like';
						  const size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;

						  currentSlot.resolutions.resolutionsPerAuthority[0].values
						  .forEach((element, index) => {
						  prompt += ` ${(index === size - 1) ? ' or' : ' '} ${element.value.name}`;
						  });

						  prompt += '?';

						  return handlerInput.responseBuilder
						  .speak(prompt)
						  .reprompt(prompt)
						  .addElicitSlotDirective(currentSlot.name)
						  .getResponse();
						  }
						  */
					} else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {
						if (constants.mainStateHandlerRequiredSlots[handlerInput.requestEnvelope.request.intent.name].indexOf(currentSlot.name) > -1) {
							prompt = `What ${currentSlot.name} are you looking for`;

							return handlerInput.responseBuilder
								.speak(prompt)
								.reprompt(prompt)
								.addElicitSlotDirective(currentSlot.name)
								.getResponse();
						}
					}
				}
			}
		}

		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const CompletedActionIntent = {
	async canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}

		return request.type === 'IntentRequest'
			&& sessionAttributes.STATE === constants.states.MAIN
			&& ['lircdo', 'volume_action', 'channel_action', 'avr_action'].indexOf(request.intent.name) > -1 
			&& request.dialogState === 'COMPLETED';
	},
	async handle(handlerInput) {
		console.log(`CompletedActionIntent.handler: handlerInput: ${JSON.stringify(handlerInput)}`);
		//console.log(`CompletedActionIntent.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name}`);

		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}

		const params = { shared_secret: sessionAttributes.shared_secret };
		const filledSlots = handlerInput.requestEnvelope.request.intent.slots;

		const slotValues = getSlotValues(filledSlots);
		console.log(`CompletedActionIntent.handler: slotValues: ${JSON.stringify(slotValues)}`);

		for (const key in slotValues) {
			//console.log(`CompletedActionIntent.handler: key: ${JSON.stringify(key)}`);
			if (slotValues[key].resolved !== undefined) {
				params[constants.stateHandlerSlotNameToParamNameLookup[requestEnvelope.request.intent.name][key]] = slotValues[key].resolved;
			}
		}

		console.log(`CompletedActionIntent.handle: params: ${JSON.stringify(params)}`);
		var trustedCA="";
                if ( "trustedCA" in sessionAttributes) {
			trustedCA=sessionAttributes.trustedCA;
		}	
		const lircdoServerOptions = buildLircdoServerOptions(true, sessionAttributes.applicationFQDN, sessionAttributes.applicationPort, trustedCA, constants.stateHandlerIntentNameToCallbackLookup[requestEnvelope.request.intent.name], params);
		console.log(`CompletedActionIntent.handler: lircdoServerOptions: ${JSON.stringify(lircdoServerOptions)}`);

		let outputSpeech = '';
		let reprompt= "What's next?";

		try {
			const response = await httpGet(lircdoServerOptions);

			console.log(`CompletedActionIntent.handle: response: ${JSON.stringify(response)}`); 
			if (response.message !== 'success') {
				outputSpeech = `Action status was ${response.status} with message ${response.message}. What's next?`;
			} else {
				outputSpeech = `Action status was ${response.status}. What's next?`;
			}
		} catch (error) {
			outputSpeech = `Sorry, there was a problem performing the requested action. error is ${error}`;
			console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: message: ${JSON.stringify(error)}`);
			if (error.message.match(/302:/)) {
				outputSpeech = `Sorry, there was a problem with the LIRC Do service executing the requested action. Please ensure the LIRC Do service is started in non-pairing mode and try again`;
			}
		}

		return handlerInput.responseBuilder
			.speak(outputSpeech)
			.reprompt(reprompt)
			.getResponse();
	},
};


const CatchallHandler = {
	canHandle(handlerInput) {
		console.log(`CatchallHandler: handlerInput: ${JSON.stringify(handlerInput)}`);

		return true;
	},
	async handle(handlerInput) {
		console.log(`CatchallHandler.handle: handlerInput: ${JSON.stringify(handlerInput)}`);

		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}

		let speechOutput = ''; 
		let reprompt = ''; 
		if (sessionAttributes.STATE === constants.states.PAIRING) {
			const cardTitle = constants.initialStateHandlerCard.title;
			const cardContent = constants.initialStateHandlerCard.content;
			speechOutput = randomPhrase(constants.initialStateHandlerHelpSpeech.say);
			reprompt = randomPhrase(constants.initialStateHandlerHelpSpeech.reprompt);
			return responseBuilder
				.speak(speechOutput)
				.reprompt(reprompt)
				.withSimpleCard(cardTitle, cardContent)
				.getResponse();
		} else {

			speechOutput = randomPhrase(constants.mainStateHandlerHelpSpeech.say); 
			reprompt = randomPhrase(constants.mainStateHandlerHelpSpeech.reprompt); 
			return responseBuilder
				.speak(speechOutput)
				.reprompt(reprompt)
				.getResponse();
		}
	},
};

const HelpHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;

		return request.type === 'IntentRequest'
			&& request.intent.name === 'AMAZON.HelpIntent';
	},
	async handle(handlerInput) {
		console.log(`HelpHandler.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name}`);
		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}

		let speechOutput = '';
		let reprompt = '';
		console.log(`HelpHandler.handle: sessionAttributes=${JSON.stringify(sessionAttributes)}`);
		if (sessionAttributes.STATE === constants.states.PAIRING) {
			const cardTitle = constants.initialStateHandlerCard.title;
			const cardContent = constants.initialStateHandlerCard.content;
			speechOutput = randomPhrase(constants.initialStateHandlerHelpSpeech.say);
			reprompt = randomPhrase(constants.initialStateHandlerHelpSpeech.reprompt);
			return responseBuilder
				.speak(speechOutput)
				.reprompt(reprompt)
				.withSimpleCard(cardTitle, cardContent)
				.getResponse();
		} else {
			speechOutput = randomPhrase(constants.mainStateHandlerHelpSpeech.say); 
			reprompt = randomPhrase(constants.mainStateHandlerHelpSpeech.reprompt); 
			if (! sessionAttributes.thingsToSayIndex) {
				sessionAttributes.thingsToSayIndex = 0;
			}

			const sampleThingsToSayArray = getSliceWrap(constants.mainStateHandlerThingsToSay.say, sessionAttributes.thingsToSayIndex, constants.mainStateHandlerThingsToSay.sayLength);
			sessionAttributes.thingsToSayIndex +=  constants.mainStateHandlerThingsToSay.sayLength;
			if (sessionAttributes.thingsToSayIndex >= constants.mainStateHandlerThingsToSay.say.length) {
				sessionAttributes.thingsToSayIndex = sessionAttributes.thingsToSayIndex % constants.mainStateHandlerThingsToSay.say.length;
			}
			const sampleThingsToSay = joinArrayOfStrings(sampleThingsToSayArray);
			speechOutput = speechOutput.concat(' You can say things like,').concat(sampleThingsToSay).concat(' Ask for help to hear additional sample things you can say');
			return responseBuilder
				.speak(speechOutput)
				.reprompt(reprompt)
				.getResponse();
		}
	},
};

const ExitHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;

		return request.type === 'IntentRequest'
			&& (request.intent.name === 'AMAZON.CancelIntent'
					|| request.intent.name === 'AMAZON.StopIntent');
	},
	handle(handlerInput) {
		console.log(`ExitHandler.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name}`);
		return handlerInput.responseBuilder
			.speak('Bye')
			.getResponse();
	},
};

const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

		return handlerInput.responseBuilder.getResponse();
	},
};

const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error) {
		console.log(`Error handled: ${handlerInput.requestEnvelope.request.type} ${handlerInput.requestEnvelope.request.type === 'IntentRequest' ? `intent: ${handlerInput.requestEnvelope.request.intent.name} ` : ''}${error.message}.`);

		return handlerInput.responseBuilder
			.speak('Sorry, I can\'t understand the command. Please say again.')
			.reprompt('Sorry, I can\'t understand the command. Please say again.')
			.getResponse();
	},
};


/* CONSTANTS */

/* HELPER FUNCTIONS */

// return session attributes and load from persistent store if needed
async function loadSessionAttributes(attributesManager) {
	var sessionAttributes = attributesManager.getSessionAttributes();
	if (Object.keys(sessionAttributes).length === 0) {
		const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
		console.log(`loadSessionAttributes: loading session attributes from persistent store persistentAttributes: ${JSON.stringify(persistentAttributes)}`);
		attributesManager.setSessionAttributes(persistentAttributes);
		sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes.STATE = constants.states.PAIRING;
		}
	}
	return sessionAttributes;
}

function saveValue(options, handlerInput) {
	const key = `_${options.fieldName}`;
	const attributes = handlerInput.attributesManager.getSessionAttributes();

	if (options.append && attributes[key]) {
		attributes[key].push(options.data);
	} else if (options.append) {
		attributes[key] = [options.data];
	} else {
		attributes[key] = options.data;
	}
}

function getSlotValues(filledSlots) {
	const slotValues = {};

	console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
	Object.keys(filledSlots).forEach((item) => {
		const name = filledSlots[item].name;

		if (filledSlots[item] &&
				filledSlots[item].resolutions &&
				filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
				filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
				filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
			switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
				case 'ER_SUCCESS_MATCH':
					slotValues[name] = {
						synonym: filledSlots[item].value,
						//resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
						resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.id,
						isValidated: true,
					};
					break;
				case 'ER_SUCCESS_NO_MATCH':
					slotValues[name] = {
						synonym: filledSlots[item].value,
						resolved: filledSlots[item].value,
						isValidated: false,
					};
					break;
				default:
					break;
			}
		} else {
			slotValues[name] = {
				synonym: filledSlots[item].value,
				resolved: filledSlots[item].value,
				isValidated: false,
			};
		}
	}, this);

	return slotValues;
}

function randomPhrase(array) {
	return (array[Math.floor(Math.random() * array.length)]);
}

function joinArrayOfStrings(theArray) {
	var index;
	var retVal = '';
	for (index = 0; index < theArray.length; ++index) {
		retVal=retVal.concat(`${index === 0 ? '' : ' or '}${theArray[index]}`).concat('<break time="250ms"/>');
	}
	return retVal;
}

function getSliceWrap(theArray, beginNdx, sliceLength) {

	var theSlice = [];
	let arrayLength = theArray.length;
	let startNdx = beginNdx;
	if (beginNdx > (arrayLength - 1)) {
		startNdx = startNdx %  arrayLength;
	}
	if ((startNdx + sliceLength) > (arrayLength - 1)) {
		theSlice = theArray.slice(startNdx, arrayLength);
		//theSlice.concat(theArray.slice(0, arrayLength - startNdx + 1));
		theSlice = theSlice.concat(theArray.slice(0, 3));
	} else {
		theSlice = theArray.slice(startNdx, startNdx + sliceLength);
	}
	return theSlice;
}

function buildQueryString(params) {
	let paramsList = '';
	let index = 0;
	if (params) {
		for (const key in params) {
			paramsList += `${index === 0 ? '?' : '&'}${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
			index += 1;
		}
	} 
	return paramsList;
}

function buildHttpGetOptions(doHostnameCheck, host, trustedCA, path, port, params) {
	let options = {
		hostname: host,
		path: path + buildQueryString(params),
		port: port,
		method: 'GET',
		rejectUnauthorized: doHostnameCheck,
	};
	if (doHostnameCheck && trustedCA !== "") {
	        let ca_cert = trustedCA.replace(/\./g, '\n');
		options.ca = ca_cert;
	}
	options.agent = new https.Agent(options);

	return options;
}

function buildLircdoServerOptions(doHostnameCheck, lircdoHost, lircdoPort, trustedCA, lircdoServerCallback, params) {
	const port = parseInt(lircdoPort);
	return buildHttpGetOptions(doHostnameCheck, lircdoHost, trustedCA, lircdoServerCallback, port, params);
}

function httpGet(options) {
	return new Promise(((resolve, reject) => {
		const request = https.request(options, (response) => {
			response.setEncoding('utf8');
			let returnData = '';

			if (response.statusCode < 200 || response.statusCode >= 300) {
				return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
			}

			response.on('data', (chunk) => {
				returnData += chunk;
			});

			response.on('end', () => {
				resolve(JSON.parse(returnData));
			});

			response.on('error', (error) => {
				reject(error);
			});
		});
		request.end();
	}));
}


const skillBuilder = Alexa.SkillBuilders.standard();

/* LAMBDA SETUP */
exports.handler = skillBuilder
.addRequestHandlers(
		//LaunchRequestHandler,
		InProgressPairServerIntent,
		CompletedPairServerIntent,
		InProgressUnpairServerIntent,
		CompletedUnpairServerIntent,
		InProgressActionIntent,
		CompletedActionIntent,
		LaunchRequestHandler,
		HelpHandler,
		//FallbackHandler,
		ExitHandler,
		SessionEndedRequestHandler,
		CatchallHandler,
		)
	.addErrorHandlers(ErrorHandler)
	.withSkillId(constants.appId)
	.withTableName(constants.dynamoDBTableName)
	.withAutoCreateTable(true)
.withPartitionKeyGenerator(Alexa.PartitionKeyGenerators.deviceId)
	.withDynamoDbClient ( 
			// Required to allow mocha tests to run without
			//  complaining that region is not set for DynamoDB
			new AWS.DynamoDB({ apiVersion: "latest", region: "us-east-1" })
			)
	.lambda();

