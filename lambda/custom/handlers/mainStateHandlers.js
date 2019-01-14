//var Alexa = require('alexa-sdk'); // v1 sdk
var Alexa = require('ask-sdk-v1adapter'); // v2 sdk

// Constants
var constants = require('../constants/constants');

// Callback app constants
//var callback_app = require('../constants/catalog_external');

// Helpers
var convertArrayToReadableString = require('../helpers/convertArrayToReadableString');
var serverAPI = require('../helpers/serverAPI');
var delegateDialog = require('../helpers/delegateDialog');

// Trust self-signed certs whe connecting to server-side app
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Main Handlers
var mainStateHandlers = Alexa.CreateStateHandler(constants.states.MAIN, {

  'LaunchRequest': function () {
    console.log('mainStateHandlers.LaunchRequest: start');
    // Check for server-side application FQDN in Session Attributes
    var applicationFQDN = this.attributes['applicationFQDN'];
    if (applicationFQDN) {
       let say = constants.mainStateHandlerLaunchHandlerSpeech.say;
       let reprompt = constants.mainStateHandlerLaunchHandlerSpeech.reprompt;
       this.emit(':ask', say[Math.floor(Math.random() * say.length)], reprompt[Math.floor(Math.random() * reprompt.length)]);
    } else {
      // Change State to Pairing:
      this.handler.state = constants.states.PAIRING;
      this.emitWithState('NewSession');
    }
  },

  'lircdo': function () {

    //delegate to Alexa to collect all the required slot values
    console.log("lircdo: this.event.request.dialogState="+this.event.request.dialogState);
    //console.log("lircdo: this.event.request="+ JSON.stringify(this.event.request));
    //
    if (this.event.request.dialogState !== "STARTED" && this.event.request.dialogState !== "IN_PROGRESS")  { // needed by mocha tests as request.dialogState is not set
       this.event.request.dialogState="COMPLETED";
    }

    if (this.event.request.dialogState === "STARTED") {
       console.log("in Beginning");
       var updatedIntent=this.event.request.intent;
       //optionally pre-fill slots: update the intent object with slot values for which
       //you have defaults, then return Dialog.Delegate with this updated intent
       // in the updatedIntent property
       this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
       console.log("in not completed");
       // return a Dialog.Delegate directive with no updatedIntent property.
       this.emit(":delegate");
    } else {
       console.log("lircdo: in completed");
       console.log("lircdo: returning: "+ JSON.stringify(this.event.request.intent));
       // Dialog is now complete and all required slots should be filled,
       // so call your normal intent handler.
       var shared_secret = this.attributes['shared_secret'];
       var params = {shared_secret: shared_secret};

       // Get Slot Values
       var lircAction = delegateDialog.slotValue(this.event.request.intent.slots.LircAction, true);
       var lircComponent = delegateDialog.slotValue(this.event.request.intent.slots.LircComponent, true);
       if (lircComponent) {
         params.lircComponent = lircComponent;
       }
       if (lircAction) {
          params.lircAction = lircAction; 
       } 
       console.log('lircdo: invoking callback lircdo_ask with params: ', params);
       serverAPI.invoke_callback('lircdo_ask', this.attributes, params)
         .then((responseDetails) => {
           console.log('lircdo: responseDetails', JSON.stringify(responseDetails));
           // Respond to user with action status
	   if (responseDetails.message === "success") {
	      this.response.speak(`Action status was ${responseDetails.status}. What's next?`).listen('What\'s next?');
           } else {
              this.response.speak(`Action status was ${responseDetails.status} with message ${responseDetails.message}. What's next?`).listen('What\'s next?');
           }
           this.emit(":responseReady");
         })
         .catch((error) => {
           console.log('lircdo ERROR', error);
           this.emit(':tell', `Sorry, there was a problem performing the requested action.`);
         });
       
    }
  },

  'avr_action': function () {
    console.log('avr_action: enter');
    console.log("avr_action: this.event.request.dialogState="+this.event.request.dialogState);

    if (this.event.request.dialogState !== "STARTED" && this.event.request.dialogState !== "IN_PROGRESS")  { // needed by mocha tests as request.dialogState is not set
       this.event.request.dialogState="COMPLETED";
    }

    if (this.event.request.dialogState === "STARTED") {
       console.log("in Beginning");
       var updatedIntent=this.event.request.intent;
       //optionally pre-fill slots: update the intent object with slot values for which
       //you have defaults, then return Dialog.Delegate with this updated intent
       // in the updatedIntent property
       this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
       console.log("in not completed");
       // return a Dialog.Delegate directive with no updatedIntent property.
       this.emit(":delegate");
    } else {
       console.log("avr_action: in completed");
       console.log("avr_action: returning: "+ JSON.stringify(this.event.request.intent));
       // Dialog is now complete and all required slots should be filled,
       // so call your normal intent handler.

       var shared_secret = this.attributes['shared_secret'];
       var params = {shared_secret: shared_secret};

       // Get Slot Values
       var lircAVRAction = delegateDialog.slotValue(this.event.request.intent.slots.LircAVRAction, true);
       var lircAVDevice = delegateDialog.slotValue(this.event.request.intent.slots.LircAVDevice, true);

       if (lircAVRAction) {
         params.lircAVRAction = lircAVRAction;
       }
       if (lircAVDevice) {
         params.lircAVDevice = lircAVDevice;
       }
       console.log('avr_action: invoking callback avr_action_ask with params: ', params);
       serverAPI.invoke_callback('avr_action_ask', this.attributes, params)
         .then((responseDetails) => {
           console.log('avr_action: responseDetails', JSON.stringify(responseDetails));
           // Respond to user with action status
	   if (responseDetails.message === "success") {
              this.response.speak(`Action status was ${responseDetails.status}. What's next?`).listen('What\'s next?');
	   } else {
              this.response.speak(`Action status was ${responseDetails.status} with message ${responseDetails.message}. What's next?`).listen('What\'s next?');
	   }
           this.emit(":responseReady");
         })
         .catch((error) => {
           console.log('avr_action ERROR', error);
           this.emit(':tell', `Sorry, there was a problem performing the requested action.`);
         });

    }
  },

  'channel_action': function () {
    console.log('channel_action: enter');
    console.log("channel_action: this.event.request.dialogState="+this.event.request.dialogState);

    if (this.event.request.dialogState !== "STARTED" && this.event.request.dialogState !== "IN_PROGRESS")  { // needed by mocha tests as request.dialogState is not set
       this.event.request.dialogState="COMPLETED";
    }

    if (this.event.request.dialogState === "STARTED") {
       console.log("channel_action: in Beginning");
       var updatedIntent=this.event.request.intent;
       //optionally pre-fill slots: update the intent object with slot values for which
       //you have defaults, then return Dialog.Delegate with this updated intent
       // in the updatedIntent property
       this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
       console.log("channel_action: in not completed");
       // return a Dialog.Delegate directive with no updatedIntent property.
       this.emit(":delegate");
    } else {
       console.log("channel_action: in completed");
       console.log("channel_action: returning: "+ JSON.stringify(this.event.request.intent));
       // Dialog is now complete and all required slots should be filled,
       // so call your normal intent handler.

       var shared_secret = this.attributes['shared_secret'];
       var params = {shared_secret: shared_secret};

       // Get Slot Values
       var lircChannelAction = delegateDialog.slotValue(this.event.request.intent.slots.LircChannelAction, true);
       var lircComponent = delegateDialog.slotValue(this.event.request.intent.slots.LircComponent, true);
       var lircArgument = delegateDialog.slotValue(this.event.request.intent.slots.LircNumericArgument, true);
       if (lircChannelAction) {
         params.lircChannelAction = lircChannelAction;
       }
       if (lircComponent) {
         params.lircComponent = lircComponent;
       }
       if (lircArgument) {
         params.lircArgument = lircArgument;
       }
       console.log('channel_action: invoking callback channel_action_ask with params: ', params);
       serverAPI.invoke_callback('channel_action_ask', this.attributes, params)
         .then((responseDetails) => {
           console.log('channel_action: responseDetails', JSON.stringify(responseDetails));
           // Respond to user with action status
	   if (responseDetails.message === "success") {
	      this.response.speak(`Action status was ${responseDetails.status}. What's next?`).listen('What\'s next?');
	   } else {
	      this.response.speak(`Action status was ${responseDetails.status} with message ${responseDetails.message}. What's next?`).listen('What\'s next?');
	   }
           this.emit(":responseReady");
         })
         .catch((error) => {
           console.log('channel_action ERROR', error);
           this.emit(':tell', `Sorry, there was a problem performing the requested action.`);
         });

    }
  },

  'volume_action': function () {
    console.log('volume_action: enter');
    console.log("volume_action: this.event.request.dialogState="+this.event.request.dialogState);

    if (this.event.request.dialogState !== "STARTED" && this.event.request.dialogState !== "IN_PROGRESS")  { // needed by mocha tests as request.dialogState is not set
       this.event.request.dialogState="COMPLETED";
    }

    if (this.event.request.dialogState === "STARTED") {
       console.log("in Beginning");
       var updatedIntent=this.event.request.intent;
       //optionally pre-fill slots: update the intent object with slot values for which
       //you have defaults, then return Dialog.Delegate with this updated intent
       // in the updatedIntent property
       this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
       console.log("in not completed");
       // return a Dialog.Delegate directive with no updatedIntent property.
       this.emit(":delegate");
    } else {
       console.log("volume_action: in completed");
       console.log("volume_action: returning: "+ JSON.stringify(this.event.request.intent));
       // Dialog is now complete and all required slots should be filled,
       // so call your normal intent handler.

       var shared_secret = this.attributes['shared_secret'];
       var params = {shared_secret: shared_secret};

       console.log(this.event.request.intent.slots);
       //console.log(this.event.request.intent.slots.LircVolumeAction.resolutions.resolutionsPerAuthority[0]);

       // Get Slot Values

       var lircVolumeAction = delegateDialog.slotValue(this.event.request.intent.slots.LircVolumeAction, true);
       var lircComponent = delegateDialog.slotValue(this.event.request.intent.slots.LircComponent, true);
       var lircArgument = delegateDialog.slotValue(this.event.request.intent.slots.LircNumericArgument, true);
       if (lircVolumeAction) {
          params.lircVolumeAction = lircVolumeAction; 
       }
       if (lircComponent) {
          params.lircComponent = lircComponent;
       }
       if (lircArgument) {
          params.lircArgument = lircArgument;
       }
       console.log('volume_action: invoking callback channel_action_ask with params: ', params);
        serverAPI.invoke_callback('volume_action_ask', this.attributes, params)
          .then((responseDetails) => {
            console.log('volume_action: responseDetails', JSON.stringify(responseDetails));
            // Respond to user with action status
	    if (responseDetails.message === "success") {
	       this.response.speak(`Action status was ${responseDetails.status}. What's next?`).listen('What\'s next?');
	    } else {
	       this.response.speak(`Action status was ${responseDetails.status} with message ${responseDetails.message}. What's next?`).listen('What\'s next?');
	    }
            this.emit(":responseReady");
          })
          .catch((error) => {
            console.log('volume_action ERROR', error);
            this.emit(':tell', `Sorry, there was a problem performing the requested action.`);
          });
    } 
  },

    'pair_server_again': function () {
        console.log("pair_server_again: start");
        console.log("pair_server_again: this.event.request="+JSON.stringify(this.event.request));
        var sessionAttributes={};
        var filledSlots = delegateDialog.delegateSlotCollection.call(this);

        console.log("pair_server_again: after delegateSlotCollection: this.event="+JSON.stringify(this.event));
        if (this.event.request.intent.confirmationStatus !== 'DENIED') {
           delete this.attributes.applicationFQDN;
           delete this.attributes.STATE;
           this.handler.state = constants.states.PAIRING;
           this.emitWithState('NewSession');
        }
        else {
           this.response.speak('The pairing request has been cancelled. You can perform a LIRC action. What would you like to do?').listen('What would you like to do?');
           this.emit(':responseReady');
        }
   },
  'AMAZON.StopIntent': function () {
    // State Automatically Saved with :tell
    this.emit(':tell', `So long.`);
  },
  'AMAZON.CancelIntent': function () {
    // State Automatically Saved with :tell
    this.emit(':tell', `Goodbye.`);
  },
  'SessionEndedRequest': function () {
    console.log('mainStateHandler: SessionEndedRequest: start');
    // Force State Save When User Times Out
    this.emit(':saveState', true);
  },

  'AMAZON.HelpIntent' : function () {
    console.log('mainStateHandler: AMAZON.HelpIntent: start');
    this.emit(':ask', `You can operate your home audio and video equipment using voice commands. What would you like to do?`,  `What would you like to do?`);
  },
  //'Unhandled' : function () {
  //  console.log('mainStateHandler: Unhandled: start');
  //  this.emitWithState('AMAZON.HelpIntent');
  //}

});


module.exports = mainStateHandlers;
