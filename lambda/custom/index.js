
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

		let outputSpeech=randomPhrase(constants.mainStateHandlerLaunchHandlerSpeech.brief_say); 
		let reprompt=randomPhrase(constants.mainStateHandlerLaunchHandlerSpeech.brief_reprompt); 
		if (! persistentAttributes.BRIEF_MODE_STATE || persistentAttributes.BRIEF_MODE_STATE === constants.brief_mode_states.VERBOSE) {
			outputSpeech=randomPhrase(constants.mainStateHandlerLaunchHandlerSpeech.say);
			reprompt=randomPhrase(constants.mainStateHandlerLaunchHandlerSpeech.reprompt);
		}

		if (persistentAttributes.STATE && persistentAttributes.STATE === constants.states.PAIRING) {
			const currentIntent = handlerInput.requestEnvelope.request.intent;
			console.log(`LaunchRequestHandler.handle handlerInput ${JSON.stringify(handlerInput)}`);
			outputSpeech = randomPhrase(constants.initialStateHandlerSpeech.say);
			reprompt = randomPhrase(constants.initialStateHandlerSpeech.reprompt); 
		}

		return responseBuilder
			.speak(outputSpeech)
			.reprompt(reprompt)
			.getResponse();
	},
};

const InProgressPairServerIntent = {
	async canHandle(handlerInput) {
		//console.log(`in InProgressPairServerIntent.canHandle: handlerInput=${JSON.stringify(handlerInput)}`);
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
		//console.log(`in CompletedPairServerIntent.canHandle: handlerInput=${JSON.stringify(handlerInput)}`);
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
		console.log(`CompletedPairServerIntent.handle: Intent: ${handlerInput.requestEnvelope.request.intent.name}`);

		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;

		const filledSlots = handlerInput.requestEnvelope.request.intent.slots;

		const slotValues = getSlotValues(filledSlots);
		console.log(`CompletedPairServerIntent.handler: slotValues: ${JSON.stringify(slotValues)}`);
		const ip_address = `${slotValues.OctetA.resolved}.${slotValues.OctetB.resolved}.${slotValues.OctetC.resolved}.${slotValues.OctetD.resolved}`; 
		if (! validIPAddress(ip_address)) {
			console.log('CompletedPairServerIntent.handler: detected invalid I.P. address');
			return handlerInput.responseBuilder
				.speak("The requested application address is not a valid I.P. address. What is the application I.P. address? You can say my application address is, followed by the I.P. address in dotted decimal format")
				.reprompt("What is the application I.P. address? you can say my application address is, followed by the I.P. address in dotted decimal format")
				.addElicitSlotDirective("OctetA")
				.getResponse();
		}
		console.log('CompletedPairServerIntent.handler: valid I.P. address');
		const applicationPort = slotValues.ApplicationPort.resolved;
		const params = { 'pin': slotValues.ApplicationPin.resolved };
		console.log(`CompletedPairServerIntent.handler: ip_address: ${ip_address} applicationPort: ${applicationPort} params: ${JSON.stringify(params)}`);

		const lircdoServerOptions = buildLircdoServerOptions(false, ip_address, applicationPort, "", constants.stateHandlerIntentNameToCallbackLookup[requestEnvelope.request.intent.name], params);
		console.log(`CompletedPairServerIntent.handler: lircdoServerOptions: ${JSON.stringify(lircdoServerOptions)}`);

		let outputSpeech = '';

		await httpGet(lircdoServerOptions).then(async (response) => {

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
				sessionAttributes.BRIEF_MODE_STATE = constants.brief_mode_states.VERBOSE;
				attributesManager.setPersistentAttributes(sessionAttributes);
				await attributesManager.savePersistentAttributes();
			}
		})
		.catch(error => {
			var error_string=JSON.stringify(error);
			console.log(`CompletedPairServerIntent.handler: in .catch: error= ${error_string}`);
			outputSpeech = `Sorry, there was an unkown problem performing the requested action. Please verify LIRC do service I. P. address, port number, and pin number are correct. Also verify the LIRC do service is running in pairing mode, then try again`;
			if (error_string.match(/ECONNREFUSED/)) {
				outputSpeech = `Sorry, the connection to the LIRC do server was refused. The most likely reasons for this is that the LIRC do service is not running, or that your home router is not forwarding incoming connections to the correct server and port, or that the LIRC do service is listening on a different address or port number then requested. Please verify the LIRC do service is running and that the service is listening on the expected address and port number then try again.`;
			}
			// handle the special case where the LIRC Do service was probably not started in pairing mode
			else if (error_string.match(/302/)) {
				outputSpeech = `Sorry, the pairing request failed. The most likely reason is that the LIRC do service is not running in pairing mode. Please restart the LIRC do service in pairing mode, if needed, and then try again.`;
			}
			else if (error_string.match(/402/)) {
				outputSpeech = `Sorry, the pairing request failed. The most likely reason is the application pin number is incorrect. Please verify the pin number, then try again.`;
			}
			else if (error_string.match(/timeout/) || error_string.match(/ECONNRESET/)) {
				outputSpeech = 'Sorry, the connection to the LIRC do service timed out. The most likely reasons for this is that the LIRC do service is not running, or that your home router is not forwarding incoming connections to the correct server and port, or that the LIRC do service is listening on a different address or port number then requested. Please verify the LIRC do service is running and that the service is listening on the expected address and port number then try again.';
			}
		});

		return handlerInput.responseBuilder
			.speak(outputSpeech)
			.getResponse();
	},
};


const InProgressUnpairServerIntent = {
	async canHandle(handlerInput) {
		//console.log(`in InProgressUnpairServerIntent.canHandle: handlerInput=${JSON.stringify(handlerInput)}`);
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
		//console.log(`in CompletedUnpairServerIntent.canHandle: handlerInput=${JSON.stringify(handlerInput)}`);
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
			outputSpeech = 'Ok, the pairing process has been cancelled';
		} else { // intent was confirmed
			outputSpeech = 'The lirc do server has been successfully unpaired';
			const sessionAttributes = attributesManager.getSessionAttributes();
			delete sessionAttributes.applicationFQDN;
			delete sessionAttributes.applicationPort;
			delete sessionAttributes.trustedCA;
			delete sessionAttributes.shared_secret;
			delete sessionAttributes.thingsToSayIndex;
			delete sessionAttributes.BRIEF_MODE_STATE;
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


const InProgressBriefModeIntent = {
	async canHandle(handlerInput) {
		//console.log(`in InProgressBriefIntent.canHandle: handlerInput=${JSON.stringify(handlerInput)}`);
		const request = handlerInput.requestEnvelope.request;
		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}

		return request.type === 'IntentRequest'
			&& sessionAttributes.STATE === constants.states.MAIN
			&& request.intent.name === 'brief_mode'
			&& request.dialogState !== 'COMPLETED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		console.log(`InProgressBriefModeIntent.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name} currentIntent: ${JSON.stringify(currentIntent)}`);

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

const CompletedBriefModeIntent = {
	async canHandle(handlerInput) {
		//console.log(`in CompletedBriefModeIntent.canHandle: handlerInput=${JSON.stringify(handlerInput)}`);
		const request = handlerInput.requestEnvelope.request;
		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}

		return request.type === 'IntentRequest'
			&& sessionAttributes.STATE === constants.states.MAIN
			&& request.intent.name === 'brief_mode'
			&& request.dialogState === 'COMPLETED';
	},
	async handle(handlerInput) {
		console.log(`CompletedBriefModeIntent.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name}`);
		console.log(`CompletedBriefModeIntent.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name} handlerInput: ${JSON.stringify(handlerInput)}`);

		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;

		let outputSpeech='';
		let reprompt = randomPhrase(constants.mainStateActionHandlerSpeech.reprompt);
		if (requestEnvelope.request.intent.confirmationStatus === 'DENIED') {
			outputSpeech = 'Ok, response verbosity will not change';
		} else { // intent was confirmed
			let brief_mode_state = constants.brief_mode_states.VERBOSE;
			outputSpeech = 'OK, responses are now changed to ';
			const sessionAttributes = attributesManager.getSessionAttributes();
			if (! sessionAttributes.BRIEF_MODE_STATE || sessionAttributes.BRIEF_MODE_STATE === constants.brief_mode_states.VERBOSE) {
				brief_mode_state = constants.brief_mode_states.BRIEF;
				reprompt = randomPhrase(constants.mainStateActionHandlerSpeech.brief_reprompt);
			}
			outputSpeech = 'OK, responses will now be ' + brief_mode_state.toLowerCase();
			sessionAttributes.BRIEF_MODE_STATE = brief_mode_state; 
			attributesManager.setSessionAttributes(sessionAttributes);
			attributesManager.setPersistentAttributes(sessionAttributes);
			await attributesManager.savePersistentAttributes();
			console.log(`CompletedBriefModeIntent.handler: after await`);
		}
		return handlerInput.responseBuilder
			.speak(outputSpeech)
			.reprompt(reprompt)
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
			&& ['lircdo', 'volume_action', 'channel_action', 'avr_action', 'navigate_action'].indexOf(request.intent.name) > -1 
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
			&& ['lircdo', 'volume_action', 'channel_action', 'avr_action', 'navigate_action'].indexOf(request.intent.name) > -1 
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
		let outputSpeech="<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01'/> " + randomPhrase(constants.mainStateActionHandlerSpeech.brief_say); 
		let reprompt=randomPhrase(constants.mainStateActionHandlerSpeech.brief_reprompt); 
		if (! sessionAttributes.BRIEF_MODE_STATE || sessionAttributes.BRIEF_MODE_STATE === constants.brief_mode_states.VERBOSE) {
			outputSpeech=randomPhrase(constants.mainStateActionHandlerSpeech.say);
			reprompt=randomPhrase(constants.mainStateActionHandlerSpeech.reprompt);
		}

		await httpGet(lircdoServerOptions).then((response) => {

			console.log(`CompletedActionIntent.handle: response: ${JSON.stringify(response)}`); 
			if (response.message !== 'success') {
				if (! sessionAttributes.BRIEF_MODE_STATE || sessionAttributes.BRIEF_MODE_STATE === constants.brief_mode_states.VERBOSE) {
					outputSpeech = `Action status was ${response.status} with message ${response.message}. What's next?`;
				} else {
					outputSpeech = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_negative_response_02'/> " + outputSpeech;
				}
			}
		})
		.catch(error => {
			var error_string=JSON.stringify(error);
			console.log(`CompletedActionIntent.handle: in .catch: error= ${error_string}`);

			if (sessionAttributes.BRIEF_MODE_STATE === constants.brief_mode_states.BRIEF) { // verbose error

				outputSpeech = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_negative_response_02'/> " + outputSpeech;
			} else { r
				outputSpeech = `Sorry, there was a problem performing the requested action. Please verify the LIRC do service is running in non-pairing mode, then try again. error is ${error}`;

				console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: message: ${error_string}`);
				if (error_string.match(/ECONNREFUSED/)) {
					outputSpeech = `Sorry, the connection to the LIRC do server was refused. The most likely reasons for this is that the LIRC do service is not running, or that your home router is not forwarding incoming connections to the correct server and port, or that the LIRC do service is listening on a different address or port number then requested. Also, verify the domain name for the LIRC do service points to the correct I. P. address. Please check the previously mentioned things and then try again.`;
				}
				// handle the special case where the LIRC Do service was probably not started in pairing mode
				else if (error_string.match(/302/)) {
					outputSpeech = `Sorry, the requested action failed. The most likely reason is that the LIRC do service is running in pairing mode. Please restart the LIRC do server in non-pairing mode, if needed, and then try again.`;
				}
				else if (error_string.match(/401/)) {
					outputSpeech = `Sorry, the requested action failed. This can happen when the LIRC do service is using a different shared secret then the shared secret captured during the LIRC do service pairing phase. To correct this try unpairing the Alexa skill and then pairing with the LIRC do service again.`;
				}
				else if (error_string.match(/timeout/) || error_string.match(/ECONNRESET/)) {
					outputSpeech = 'Sorry, the connection to the LIRC do service timed out. The most likely reasons for this is that the LIRC do service is not running, or that your home router is not forwarding incoming connections to the correct server and port, or that the LIRC do service is listening on a different address or port number then requested. Also, verify the domain name for the LIRC do service points to the correct I. P. address. Please check the previously mentioned things and then try again.';
				}
			} // end verbose error

		});

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

			speechOutput = randomPhrase(constants.mainStateCatchallHandlerHelpSpeech.say); 
			reprompt = randomPhrase(constants.mainStateCatchallHandlerHelpSpeech.reprompt); 
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
	async handle(handlerInput) {
		console.log(`ExitHandler.handler: Intent: ${handlerInput.requestEnvelope.request.intent.name}`);
		const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
		var sessionAttributes = attributesManager.getSessionAttributes();
		if (Object.keys(sessionAttributes).length === 0 || ! sessionAttributes.STATE) {
			sessionAttributes = await loadSessionAttributes(attributesManager);
		}

		let outputSpeech="<audio src='soundbank://soundlibrary/musical/amzn_sfx_electronic_beep_02'/>"; 
		if (! sessionAttributes.BRIEF_MODE_STATE || sessionAttributes.BRIEF_MODE_STATE === constants.brief_mode_states.VERBOSE) {
			outputSpeech='Bye';
		}
		return handlerInput.responseBuilder
			.speak(outputSpeech)
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
				var error = new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path} blash`);
				error.code = response.statusCode;
				error.message = "LIRC do server returned unsuccesful HTTP response";
				return reject(error);
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
		// use its "timeout" event to abort the request
		request.on('socket', function(socket) { 
			socket.setTimeout(constants.socketTimeout, function () {   // set short timeout so discovery fails fast
				var e = new Error ('Timeout connecting to ' + options.host );
				e.name = 'timeout';
				console.log(`in httpGet: request.on socket: ${JSON.stringify(e)}`);
				request.abort();    // kill socket
				return reject(e);   
			});
			socket.on('error', function (err) { // this catches ECONNREFUSED events
				console.log(`in httpGet: in socket.on error: ${JSON.stringify(err)}`);
				request.abort();    // kill socket
				return reject(err); 
			});
		}); // handle connection events and errors

		request.on('error', function (e) {  // happens when we abort
			console.log(`in httpget: in request.on error: ${JSON.stringify(e)}`);
			return reject(e);
		});
		request.end();
	}));
}

function validIPAddress(ipaddress) {
	if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
		return (true)
	} else {
		return (false)
	}
}

const skillBuilder = Alexa.SkillBuilders.standard();

/* LAMBDA SETUP */
exports.handler = skillBuilder
.addRequestHandlers(
		InProgressPairServerIntent,
		CompletedPairServerIntent,
		InProgressUnpairServerIntent,
		CompletedUnpairServerIntent,
		InProgressBriefModeIntent,
		CompletedBriefModeIntent,
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

