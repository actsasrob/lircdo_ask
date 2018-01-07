module.exports = {

   delegateSlotCollection: function () {
     console.log("in delegateSlotCollection");
     console.log("current dialogState: "+this.event.request.dialogState);
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
         console.log("in completed");
         console.log("returning: "+ JSON.stringify(this.event.request.intent));
         // Dialog is now complete and all required slots should be filled,
         // so call your normal intent handler.
         return this.event.request.intent;
       }
   },

   isSlotValid: (request, slotName) => {
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

};
