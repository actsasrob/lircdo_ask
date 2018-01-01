var Alexa = require('alexa-sdk');

// Constants
var constants = require('../constants/constants');

// Data
//var alexaMeetups = require('../data/alexaMeetups');

// Helpers
var convertArrayToReadableString = require('../helpers/convertArrayToReadableString');

// Main Handlers
var mainStateHandlers = Alexa.CreateStateHandler(constants.states.MAIN, {

  'LaunchRequest': function () {
    // Check for User Data in Session Attributes
    var userName = this.attributes['userName'];
    if (userName) {
      // Welcome User Back by Name
      this.emit(':ask', `Welcome back ${userName}! You can ask me to perform various actions using lirc.`,  `What would you like to do?`);
    } else {
      // Change State to Onboarding:
      this.handler.state = constants.states.ONBOARDING;
      this.emitWithState('NewSession');
    }
  },

  'lircdo': function () {
    // Get Slot Values
    var LircActionSlot = this.event.request.intent.slots.LircAction.value;
    var LircComponentSlot = this.event.request.intent.slots.LircComponent.value;

    var LircAction = "undefined";
    var LircComponent = "undefined";
    if (LircActionSlot) {
      LircAction = LircActionSlot;
    }
    if (LircComponentSlot) {
      LircComponent = LircComponentSlot;
    }

    // Respond to User
    this.emit(':ask', `lircdo invoked for component ${LircComponent} with action ${LircAction}`, 'How else can I help you?');
  },

  'avr_action': function () {
    // Get Slot Values
    var LircAVRActionSlot = this.event.request.intent.slots.LircAVRAction.value;
    var LircAVDeviceSlot = this.event.request.intent.slots.LircAVDevice.value;

    var LircAVRAction = "undefined";
    var LircAVDevice = "undefined";
    if (LircAVRActionSlot) {
      LircAVRAction = LircAVRActionSlot;
    }
    if (LircAVDeviceSlot) {
      LircAVDevice = LircAVDeviceSlot;
    }

    // Respond to User
    this.emit(':ask', `avr_action invoked with AVR action ${LircAVRAction} with AV device ${LircAVDevice}`, 'How else can I help you?');
  },

  'channel_action': function () {
    // Get Slot Values
    var LircChannelActionSlot = this.event.request.intent.slots.LircChannelAction.value;
    var LircComponentSlot = this.event.request.intent.slots.LircComponent.value;
    var LircArgumentSlot = this.event.request.intent.slots.LircNumericArgument.value;

    var LircChannelAction = "undefined";
    var LircComponent = "undefined";
    var LircArgument = "undefined";
    if (LircChannelActionSlot) {
      LircChannelAction = LircChannelActionSlot;
    }
    if (LircComponentSlot) {
      LircComponent = LircComponentSlot;
    }
    if (LircArgumentSlot) {
      LircArgument = LircArgumentSlot;
    }
    // Respond to User
    this.emit(':ask', `channel_action invoked with channel action ${LircChannelAction} for component ${LircComponent} and argument ${LircArgument}`, 'How else can I help you?');
  },

  'volume_action': function () {
    // Get Slot Values
    var LircVolumeActionSlot = this.event.request.intent.slots.LircVolumeAction.value;
    var LircComponentSlot = this.event.request.intent.slots.LircComponent.value;
    var LircArgumentSlot = this.event.request.intent.slots.LircNumericArgument.value;

    var LircVolumeAction = "undefined";
    var LircComponent = "undefined";
    var LircArgument = "undefined";
    if (LircVolumeActionSlot) {
      LircVolumeAction = LircVolumeActionSlot;
    }
    if (LircComponentSlot) {
      LircComponent = LircComponentSlot;
    }
    if (LircNumericArgumentSlot) {
      LircArgument = LircNumericArgumentSlot;
    }

    // Respond to User
    this.emit(':ask', `volume_action invoked with volume action ${LircVolumeAction} for component ${LircComponent} and argument ${LircArgument}`, 'How else can I help you?');
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
    this.emit(':ask', `You can ask me to perform various actions using lirc.`,  `What would you like to do?`);
  },
  'Unhandled' : function () {
    this.emitWithState('AMAZON.HelpIntent');
  }

});

module.exports = mainStateHandlers;
