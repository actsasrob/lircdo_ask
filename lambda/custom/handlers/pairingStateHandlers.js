/if (this.event.request.intent.dialogState === 'COMPLETED')* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

// alexa-cookbook sample code

// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// You can copy and paste the entire file contents as the code for a new Lambda function,
// or copy & paste section #3, the helper function, to the bottom of your existing Lambda code.

// TODO add URL to this entry in the cookbook


// Constants
var constants = require('../constants/constants');

 // 1. Text strings =====================================================================================================
 //    Modify these strings and messages to change the behavior of your Lambda function

 var speechOutput;
 var reprompt;
 //var welcomeOutput = "We need to pair the LIRC do server-side application. Please say the application pin of the server like, my application pin is, followed by the pin number";
 //var welcomeReprompt = "Please say the application pin of the server like, my application pin is, followed by the pin number";
 var welcomeOutput = constants.initialStateHandlerSpeech.say[0];
 var welcomeReprompt = constants.initialStateHandlerSpeech.reprompt[0];
 var pairIntro = [
   "Okay, I have all the necessary info to pair your LIRC do application. ",
   "Here is the info I collected. ",
   "I collected the following info. "
 ];
 var cardTitle = constants.initialStateHandlerCard.title;
 var cardContent = constants.initialStateHandlerCard.content;

 // 2. Skill Code =======================================================================================================

'use strict';
//const Alexa = require('alexa-sdk'); // v1 sdk
const Alexa = require('ask-sdk-v1adapter'); // v2 sdk

var serverAPI = require('../helpers/serverAPI');

//Pairing Server  Handlers
var pairingStateHandlers = Alexa.CreateStateHandler(constants.states.PAIRING, {

    'NewSession': function () {
      console.log('pairingStateHandlers.NewSession');
      // Check for User Data in Session Attributes
      var applicationFQDN = this.attributes['applicationFQDN'];
      if (applicationFQDN) {
        // Change State to MAIN:
        this.handler.state = constants.states.MAIN;
        this.emitWithState('LaunchRequest');
      } else {
        // Welcome User for the First Time
        console.log('pairingStateHandler.NewSession: set state to PAIRING');
        this.handler.state = constants.states.PAIRING;
        delete this.attributes.STATE;
        //this.response.speak(welcomeOutput).listen(welcomeReprompt);
        this.response.speak(welcomeOutput).cardRenderer(cardTitle, cardContent).listen(welcomeReprompt);
        this.emit(':responseReady');

        //this.emit(':ask', 'Welcome to lirc do! The skill that lets you perform various home automation tasks using linux IR remote control, or lirc, in your home by using an IR enabled device such as a raspberry pi. But first, I\'d like to get to know you better. Tell me your name by saying: My name is, and then your name.', 'Tell me your name by saying: My name is, and then your name.');
      }
    },

    'pair_server': function () {
        console.log("pair_server: start");
        console.log("pair_server: this.event.request="+JSON.stringify(this.event.request));
        console.log("pair_server: this="+JSON.stringify(this));
        var sessionAttributes={};
        //var filledSlots = delegateSlotCollection.call(this);
        //console.log("pair_server: after delegateSlotCollection: this.event="+JSON.stringify(this.event));
       if (this.event.request.dialogState === "STARTED") {
          console.log("in Beginning");
          var updatedIntent=this.event.request.intent;
          //optionally pre-fill slots: update the intent object with slot values for which
          //you have defaults, then return Dialog.Delegate with this updated intent
          // in the updatedIntent property
          this.event.request.intent.slots.ApplicationPort.value = '8843';
          this.emit(":delegate", updatedIntent);
       } else if (this.event.request.dialogState !== "COMPLETED") {

           console.log("in not completed");
           // return a Dialog.Delegate directive with no updatedIntent property.
           this.emit(":delegate");
       } else { // this.event.request.intent.slots.OctetA.confirmationStatus
           //compose speechOutput that simply reads all the collected slot values
           var speechOutput = randomPhrase(pairIntro);

           //speechOutput += "Pairing request has been cancelled.";

           //Now let's recap
           var octetA=this.event.request.intent.slots.OctetA.value;
           var octetB=this.event.request.intent.slots.OctetB.value;
           var octetC=this.event.request.intent.slots.OctetC.value;
           var octetD=this.event.request.intent.slots.OctetD.value;
           var applicationPort=this.event.request.intent.slots.ApplicationPort.value;
           var applicationPin=this.event.request.intent.slots.ApplicationPin.value;
           //speechOutput+= "" + octetA + " dot " + octetB + " dot " + octetC + " dot " + octetD + " with port " + applicationPort + " and pin " + applicationPin;
           console.log('pair_server: ' + octetA + " dot " + octetB + " dot " + octetC + " dot " + octetD + " with port " + applicationPort + " and pin " + applicationPin);
           console.log("pair_server: this.event.request.intent.slots.OctetA.confirmationStatus=" + this.event.request.intent.slots.OctetA.confirmationStatus);
           console.log("pair_server: this.event.request.intent.slots.ApplicationPort.confirmationStatus=" + this.event.request.intent.slots.ApplicationPort.confirmationStatus);
           console.log("pair_server: this.event.request.intent.slots.ApplicationPin.confirmationStatus=" + this.event.request.intent.slots.ApplicationPin.confirmationStatus); 
           var typeof1 = typeof this.event.request.intent.slots.OctetA.confirmationStatus;
           console.log("pair_server: typeof this.event.request.intent.slots.OctetA.confirmationStatus=" + typeof1);
           console.log('pair_server: intent=', JSON.stringify(this.event.request.intent));
	   if (this.event.request.intent.slots.OctetA.confirmationStatus === 'CONFIRMED' && this.event.request.intent.slots.ApplicationPort.confirmationStatus === 'CONFIRMED' &&  this.event.request.intent.slots.ApplicationPin.confirmationStatus === 'CONFIRMED') {
               var params = { pin: applicationPin };
               var ip_addr = octetA + "." + octetB + "." + octetC + "." + octetD;
               console.log(`pair_server: invoking serverAPI.invoke_pair_callback(${ip_addr}, ${applicationPort}, params)`);
               serverAPI.invoke_pair_callback(ip_addr, applicationPort, params)
                 .then((responseDetails) => {            
                    console.log('pair_server: responseDetails', JSON.stringify(responseDetails));
		    var json_response = responseDetails;
		    var status = 'error';
		    var message = 'unspecified';
		    if (typeof json_response.status !== 'undefined') {
                       status = json_response.status;
		    }
		    if (json_response.status !== 'success') {
                       if(typeof json_response.message !== 'undefined') {
                          message = json_response.message;
                       }
	               speechOutput = `Pairing was not successful. The server-side application returned message ${message}`; 
		       this.response.speak(speechOutput);
		       this.emit(':responseReady');
                    }
		    else
                    {
                       // Respond to user with action status            
                       speechOutput = 'The server-side LIRC Do application has been paired successfully. You should now restart the server-side LIRC Do application in non-pairing mode.';
                       this.attributes['applicationFQDN'] = json_response.fqdn;
                       this.attributes['applicationPort'] = json_response.port;
                       this.attributes['shared_secret'] = json_response.shared_secret;
                       //this.attributes['ca_cert'] = json_response.ca_cert;
                       this.handler.state = constants.states.MAIN;
		       this.response.speak(speechOutput);
		       this.emit(':responseReady');
		    }
                 })
                 .catch((error) => {
                   console.log('pair server ERROR', error);            
                   speechOutput = 'Sorry, there was a problem performing the requested action. error is' + error;
		   this.emit(':tell', speechOutput);
                 });
 
	   }
           else
           {
              speechOutput = "Pairing request has been cancelled.";
	      this.response.speak(speechOutput);
	      this.emit(":responseReady");
           }

           //say the results
           //this.response.speak(speechOutput);
           //this.emit(":responseReady");
        } // end if (this.event.request.dialogState === 'COMPLETED')
    },
    'AMAZON.HelpIntent': function () {
        console.log('pairingStateHandler:AMAZON.HelpIntent: start');
	this.response.speak(`You can operate your audio and video equipment using voice commands. But first we need to pair the lirc do server. To start the pairing process now say your lirc do server pin number. You can say my application pin is, followed by the pin number.`).listen(`To start the lirc do server pairing process say your lirc do server pin number. You can say my application pin is, followed by the pin number.`);
	this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        speechOutput = "Goodbye.";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        speechOutput = "So long.";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log('pairingStateHandler:SessionEndedRequest: start');
        // Force State Save When User Times Out
        this.emit(':saveState', true);
        //var speechOutput = "";
        //this.response.speak(speechOutput);
        //this.emit(':responseReady');
    },
    //'Unhandled' : function () {
    //    console.log('pairingStateHandler:Unhandled: start');
    //    this.emitWithState('AMAZON.HelpIntent');
    //}


});

module.exports = pairingStateHandlers;

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

