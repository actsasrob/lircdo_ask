var Alexa = require('alexa-sdk');

// Constants
var constants = require('../constants/constants');

// Callback app constants
var callback_app = require('../constants/catalog_external');

// Helpers
var convertArrayToReadableString = require('../helpers/convertArrayToReadableString');
var serverAPI = require('../helpers/serverAPI');
var delegateDialog = require('../helpers/delegateDialog');

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

    //delegate to Alexa to collect all the required slot values
    //var filledSlots = delegateDialog.delegateSlotCollection.call(this);
    //var filledSlots = delegateDialog.delegateSlotCollection.call(this);
    console.log("lircdo: "+this.event.request.dialogState);
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
       var params = {shared_secret: callback_app.SHARED_SECRET};

       // Get Slot Values
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
              // Respond to user with action status
              this.response.speak(`Action status was ${responseDetails.status} with message ${responseDetails.message}`).listen('What next?');
              this.emit(":responseReady");
              // Respond to user with action status
              //this.emit(':ask', `Action status was ${responseDetails.status} with message ${responseDetails.message}, What next?`, 'What next?');
            })
            .catch((error) => {
              console.log('lircdo ERROR', error);
              this.emit(':tell' `Sorry, there was a problem performing the requested action.`);
            });
       } else {  // This should never happen because delegate dialog should have filled all required slots
          // Missing action to perform
          //this.emit(':ask', `lircdo invoked for component ${lircComponent} with action ${lircAction}`, 'What next?');
          this.emit(':ask', 'Missing action to peform. Please say again.', 'What next?');
       }
    }
  },

  'avr_action': function () {
    console.log('avr_action enter');
    //delegate to Alexa to collect all the required slot values
    //var filledSlots = delegateDialog.delegateSlotCollection.call(this);
    //var filledSlots = delegateDialog.delegateSlotCollection.call(this);
    console.log("avr_action: "+this.event.request.dialogState);
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

       var params = {shared_secret: callback_app.SHARED_SECRET};

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
    }
  },

  'channel_action': function () {
    console.log('channel_action enter');
    //delegate to Alexa to collect all the required slot values
    //var filledSlots = delegateDialog.delegateSlotCollection.call(this);
    //var filledSlots = delegateDialog.delegateSlotCollection.call(this);
    console.log("lircdo: "+this.event.request.dialogState);
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

       var params = {shared_secret: callback_app.SHARED_SECRET};

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
    }
  },

  'volume_action': function () {
    console.log('volume_action enter');
   //delegate to Alexa to collect all the required slot values
    //var filledSlots = delegateDialog.delegateSlotCollection.call(this);
    //var filledSlots = delegateDialog.delegateSlotCollection.call(this);
    console.log("volume_action: "+this.event.request.dialogState);
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

       var params = {shared_secret: callback_app.SHARED_SECRET};

       console.log(this.event.request.intent.slots);
       console.log(this.event.request.intent.slots.LircVolumeAction.resolutions.resolutionsPerAuthority[0]);

       // Get Slot Values
       //var LircVolumeActionSlotID = this.event.request.intent.slots.LircVolumeAction.resolutions.resolutionsPerAuthority[].values[].value.id;

       var lircVolumeAction = delegateDialog.isSlotValid(this.event.request, 'LircVolumeAction');
       var lircComponent = delegateDialog.isSlotValid(this.event.request, 'LircComponent');
       var lircArgument = delegateDialog.isSlotValid(this.event.request, 'LircNumericArgument');
       if (lircVolumeAction) {
          params.lircVolumeAction = lircVolumeAction; 
       }
       if (lircComponent) {
          params.lircComponent = lircComponent;
       }
       if (lircArgument) {
          params.lircArgument = lircArgument;
       }
       console.log('volume_action: invoking callback lircdo_ask with params: ', params);
        serverAPI.invoke_callback('volume_action_ask', params)
          .then((responseDetails) => {
            console.log('volume_action: responseDetails', JSON.stringify(responseDetails));
            // Respond to user with action status
            this.response.speak(`Action status was ${responseDetails.status} with message ${responseDetails.message}`).listen('What next?');
            this.emit(":responseReady");
          })
          .catch((error) => {
            console.log('volume_action ERROR', error);
            this.emit(':tell' `Sorry, there was a problem performing the requested action.`);
          });
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
    this.emit(':ask', `You can ask me to perform various actions using lirc.`,  `What would you like to do?`);
  },
  'Unhandled' : function () {
    this.emitWithState('AMAZON.HelpIntent');
  }

});


module.exports = mainStateHandlers;
