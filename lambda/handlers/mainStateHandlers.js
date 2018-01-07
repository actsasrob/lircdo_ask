var Alexa = require('alexa-sdk');

// Constants
var constants = require('../constants/constants');

// Callback app constants
var callback_app = require('../constants/catalog_external');

// Helpers
var convertArrayToReadableString = require('../helpers/convertArrayToReadableString');
var serverAPI = require('../helpers/serverAPI');

// Trust self-signed certs whe connecting to server-side app
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Main Handlers
var mainStateHandlers = Alexa.CreateStateHandler(constants.states.MAIN, {

  'LaunchRequest': function () {
    // Check for User Data in Session Attributes
    var userName = this.attributes['userName'];
    if (userName) {
      // Welcome User Back by Name
      this.emit(':ask', `Welcome back ${userName}! You can perform lirc actions.`,  `What would you like to do?`);
    } else {
      // Change State to Onboarding:
      this.handler.state = constants.states.ONBOARDING;
      this.emitWithState('NewSession');
    }
  },

  'lircdo': function () {
    var params = {shared_secret: callback_app.SHARED_SECRET};

    // Get Slot Values
    console.log('enter lircdo: CALLBACK_APP_FQDN: ' + callback_app.CALLBACK_APP_FQDN);

    var LircActionSlot = this.event.request.intent.slots.LircAction.value;
    var LircComponentSlot = this.event.request.intent.slots.LircComponent.value;

    var lircAction = "undefined";
    var lircComponent = "undefined";
    if (LircComponentSlot) {
      lircComponent = LircComponentSlot;
      params.lircComponent = lircComponent;
    }
    if (LircActionSlot) {
      lircAction = LircActionSlot;
      params.lircAction = lircAction; 
   
        console.log('lircdo: invoking callback lircdo_ask with params: ', params);
        serverAPI.invoke_callback('lircdo_ask', params)
          .then((responseDetails) => {
            console.log('lircdo: responseDetails', JSON.stringify(responseDetails));
            // Get status
            //var status = responseDetails.status;

            // Respond to user with action status
            this.emit(':ask', `Action status was ${responseDetails.status} with message ${responseDetails.message}, What next?`, 'What next?');
          })
          .catch((error) => {
            console.log('lircdo ERROR', error);
            this.emit(':tell' `Sorry, there was a problem performing the requested action.`);
          });
    } else { 
       // Missing action to perform
       //this.emit(':ask', `lircdo invoked for component ${lircComponent} with action ${lircAction}`, 'What next?');
       this.emit(':ask', 'Missing action to peform. Please say again.', 'What next?');
    }
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
    this.emit(':ask', `avr_action invoked with AVR action ${LircAVRAction} with AV device ${LircAVDevice}`, 'What next?');
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
    this.emit(':ask', `channel_action invoked with channel action ${LircChannelAction} for component ${LircComponent} and argument ${LircArgument}`, 'What next?');
  },

  'volume_action': function () {
    console.log('Start volume_action intent');
    console.log(this.event.request.intent.slots);
    console.log(this.event.request.intent.slots.LircVolumeAction.resolutions.resolutionsPerAuthority[0]);
    // Get Slot Values
    var LircVolumeActionSlot = this.event.request.intent.slots.LircVolumeAction.value;
    //var LircVolumeActionSlotID = this.event.request.intent.slots.LircVolumeAction.resolutions.resolutionsPerAuthority[].values[].value.id;
    var LircVolumeActionSlotID = 'test';
    var LircComponentSlot = this.event.request.intent.slots.LircComponent.value;
    var LircArgumentSlot = this.event.request.intent.slots.LircNumericArgument.value;

    var LircVolumeAction = "undefined";
    var LircVolumeActionID = "undefined";
    var LircComponent = "undefined";
    var LircArgument = "undefined";
    if (LircVolumeActionSlot) {
      LircVolumeAction = LircVolumeActionSlot;
    }
    if (LircVolumeActionSlotID) {
      LircVolumeActionID = LircVolumeActionSlotID;
    }
    if (LircComponentSlot) {
      LircComponent = LircComponentSlot;
    }
    if (LircArgumentSlot) {
      LircArgument = LircArgumentSlot;
    }

    // Respond to User
    this.emit(':ask', `volume_action invoked with volume action ${LircVolumeAction} and action ID ${LircVolumeActionSlotID} for component ${LircComponent} and argument ${LircArgument}`, 'What next?');
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
