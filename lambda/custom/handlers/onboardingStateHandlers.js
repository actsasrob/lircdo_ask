var Alexa = require('alexa-sdk');

// Constants
var constants = require('../constants/constants');

// Onboarding Handlers
var onboardingStateHandlers = Alexa.CreateStateHandler(constants.states.ONBOARDING, {

  'NewSession': function () {
    console.log('onboardStateHandlers.NewSession');
    // Check for User Data in Session Attributes
    var userName = this.attributes['userName'];
    if (userName) {
      // Change State to Onboarding:
      this.handler.state = constants.states.MAIN;
      this.emitWithState('LaunchRequest');
    } else {
      // Welcome User for the First Time
      this.emit(':ask', 'Welcome to lirc do! The skill that lets you perform various home automation tasks using linux IR remote control, or lirc, in your home by using an IR enabled device such as a raspberry pi. But first, I\'d like to get to know you better. Tell me your name by saying: My name is, and then your name.', 'Tell me your name by saying: My name is, and then your name.');
    }
  },

  'NameCapture': function () {
    console.log('onboardStateHandlers.NameCapture');
    // Get Slot Values
    var USFirstNameSlot = this.event.request.intent.slots.USFirstName.value;
    var UKFirstNameSlot = this.event.request.intent.slots.UKFirstName.value;

    // Get Name
    var name;
    if (USFirstNameSlot) {
      name = USFirstNameSlot;
    } else if (UKFirstNameSlot) {
      name = UKFirstNameSlot;
    }

    // Save Name in Session Attributes
    if (name) {
      this.attributes['userName'] = name;

      // Change State to Main:
      this.handler.state = constants.states.MAIN;

      //this.emit(':ask', `Ok ${userName}! you can ask me to perform various LIRC actions.  What would you like to do?`, `What would you like to do?`);
      this.emit(':ask', `Ok ${name}! you can ask me to perform various LIRC actions.  What would you like to do?`, `What would you like to do?`);
    } else {
      this.emit(':ask', `Sorry, I didn\'t recognise that name!`, `'Tell me your name by saying: My name is, and then your name.'`);
    }
  },

  'AMAZON.StopIntent': function () {
    // State Automatically Saved with :tell
    this.emit(':tell', `Goodbye.`);
  },
  'AMAZON.CancelIntent': function () {
    // State Automatically Saved with :tell
    this.emit(':tell', `Goodbye.`);
  },
  'SessionEndedRequest': function () {
    // Force State Save When User Times Out
    this.emit(':saveState', true);
  },

  'AMAZON.HelpIntent' : function () {
    console.log('onboardingStateHander.HelpIntent');
    // User Name Attribute
    var userName = this.attributes['userName'];

    if (userName) {
      this.emit(':ask', `Help Intent What action would you like to perform`, `Help Intent What action would you like to perform`);
    } else {
      this.emit(':ask', 'Please tell me your name by saying: My name is, and then your name.', 'Tell me your name by saying: My name is, and then your name.');
    }
  },

  'Unhandled' : function () {
    this.emitWithState('AMAZON.HelpIntent');
  }

});

module.exports = onboardingStateHandlers;
