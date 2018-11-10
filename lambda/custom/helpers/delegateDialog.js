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

   slotValue: (slot, useId) => {
       var value = null;
       if (slot && slot.value) {
          value = slot.value;
       }
       var resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
       if(resolution && resolution.status.code == 'ER_SUCCESS_MATCH'){
           var resolutionValue = resolution.values[0].value;
           value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name;
       }
       return value;
   },

   isSlotValid: (request, slotName) => {
        var slot = request.intent.slots[slotName];
        console.log("isSlotValid: request = "+JSON.stringify(request)); //uncomment if you want to see the request
        var slotValue;

        // If entity resolution found an exact match then return the canonical slot id as value, otherwise return the found value
        if (slot && slot.resolutions & slot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
           slotValue = slot.resolutions.resolutionsPerAuthority[0].values[0].value.id.toLowerCase();
           return slotValue;
        } else if (slot && slot.value) {
            //we have a value in the slot
            slotValue = slot.value.toLowerCase();
            return slotValue;
        } else {
            //we didn't get a value in the slot.
            return false;
        }
   }

};
