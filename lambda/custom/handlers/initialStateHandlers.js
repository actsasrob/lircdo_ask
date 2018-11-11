/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

// alexa-cookbook sample code

// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// You can copy and paste the entire file contents as the code for a new Lambda function,
// or copy & paste section #3, the helper function, to the bottom of your existing Lambda code.

// TODO add URL to this entry in the cookbook


 // 1. Text strings =====================================================================================================
 //    Modify these strings and messages to change the behavior of your Lambda function

 var speechOutput;
 var reprompt;
 //var welcomeOutput = "We need to pair the LIRC do server-side application. Please say the I.P. address of the server like my application address is octet one dot octet two dot octet three dot octet four";
 var welcomeOutput = "We need to pair the LIRC do server-side application. Please say the application pin of the server like, my application pin is, followed by the pin number";
 //var welcomeReprompt = "Please say the I.P. address of the server like my application address is octet one dot octet two dot octet three dot octet four";
 var welcomeReprompt = "Please say the application pin of the server like, my application pin is, followed by the pin number";
 var pairIntro = [
   "Okay, I have all the necessary info to pair your LIRC do application. ",
   "Here is the info I collected. ",
   "I collected the following info. "
 ];


 // 2. Skill Code =======================================================================================================

'use strict';
//const Alexa = require('alexa-sdk'); // v1 sdk
const Alexa = require('ask-sdk-v1adapter'); // v2 sdk with v1 adapter

// Constants
var constants = require('../constants/constants');

//Pairing Server  Handlers
var initialStateHandlers = Alexa.CreateStateHandler(constants.states.INITIAL, {

    'NewSession': function () {
      console.log('initialStateHandlers.NewSession');

      // Check for User Data in Session Attributes
      var applicationFQDN = this.attributes['applicationFQDN'];
      if (applicationFQDN) {
        // Change State to MAIN:
        this.handler.state = constants.states.MAIN;
        this.emitWithState('LaunchRequest');
      } else {
        // Welcome User for the First Time
        console.log('initialStateHandler.NewSession: set state to PAIRING');
        this.handler.state = constants.states.PAIRING;
        //delete this.attributes.STATE;
        this.response.speak(welcomeOutput).listen(welcomeReprompt);
        this.emit(':responseReady');

        //this.emit(':ask', 'Welcome to lirc do! The skill that lets you perform various home automation tasks using linux IR remote control, or lirc, in your home by using an IR enabled device such as a raspberry pi. But first, I\'d like to get to know you better. Tell me your name by saying: My name is, and then your name.', 'Tell me your name by saying: My name is, and then your name.');
      }
    },

    'AMAZON.HelpIntent': function () {
        console.log('initialStateHandler:AMAZON.HelpIntent: start');
        this.response.speak(WelcomeOutput).listen(repromptOutput);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        speechOutput = "";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        speechOutput = "";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log('initialStateHandler:SessionEndedRequest: start');
        // Force State Save When User Times Out
        this.emit(':saveState', true);
        //var speechOutput = "";
        //this.response.speak(speechOutput);
        //this.emit(':responseReady');
    },
    'Unhandled' : function () {
        console.log('initialStateHandler:Unhandled: start');
        this.emitWithState('NewSession');
    }


});

module.exports = initialStateHandlers;

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================

function delegateSlotCollection(){
    console.log("delegateSlotCollection: start");
    console.log("delegateSlotCollection: current this.event.request.dialogState="+this.event.request.dialogState);
    console.log("delegateSlotCollection: this=" + JSON.stringify(this));
    if (this.event.request.dialogState === "STARTED") {
      console.log("delegateSlotCollection: in Beginning");
      var updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property

      this.event.request.intent.slots.ApplicationPort.value = '8843';

      console.log("delegateSlotCollection: updatedIntent=" + JSON.stringify(updatedIntent)); 
      this.emit(":delegate", updatedIntent);
      console.log('delegateSlotCollection: in Beginning: should not get here???');
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("delegateSlotCollection: in not completed");
      // return a Dialog.Delegate directive with no updatedIntent property.
      console.log("delegateSlotCollection: this.event=" + JSON.stringify(this.event)); 
      this.emit(":delegate");
      console.log('delegateSlotCollection: in not completed: should not get here???');
    } else {
      console.log("delegateSlotCollection: in completed");
      console.log("delegateSlotCollection: returning: "+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
    console.log('delegateSlotCollection: error???: should not get here???');
}

function randomPhrase(array) {
    // the argument is an array [] of words or phrases
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}
function isSlotValid(request, slotName){
        var slot = request.intent.slots[slotName];
        //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
        var slotValue;

        //if we have a slot, get the text and store it into speechOutput
        if (slot && slot.value) {
            //we have a value in the slot
            slotValue = slot.value.toLowerCase();
            return slotValue;
        } else {
            //we didn't get a value in the slot.
            return false;
        }
}

