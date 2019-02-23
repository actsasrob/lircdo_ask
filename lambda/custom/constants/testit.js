const constants = require('./constants');

console.log(`${JSON.stringify(getSliceWrap(constants.mainStateHandlerThingsToSay.say, 0, constants.mainStateHandlerThingsToSay.say.length))}`);
console.log(`${JSON.stringify(getSliceWrap(constants.mainStateHandlerThingsToSay.say, 0, constants.mainStateHandlerThingsToSay.sayLength))}`);
console.log(`${JSON.stringify(getSliceWrap(constants.mainStateHandlerThingsToSay.say, constants.mainStateHandlerThingsToSay.say.length, constants.mainStateHandlerThingsToSay.sayLength))}`);
console.log(`${JSON.stringify(getSliceWrap(constants.mainStateHandlerThingsToSay.say, constants.mainStateHandlerThingsToSay.say.length - 2, constants.mainStateHandlerThingsToSay.sayLength))}`);
console.log("");
console.log(`${JSON.stringify(getSliceWrap(constants.mainStateHandlerThingsToSay.say, constants.mainStateHandlerThingsToSay.say.length + 2, constants.mainStateHandlerThingsToSay.sayLength))}`);
console.log('');
let theArray = getSliceWrap(constants.mainStateHandlerThingsToSay.say, constants.mainStateHandlerThingsToSay.say.length + 2, constants.mainStateHandlerThingsToSay.sayLength);

console.log(`${joinArrayOfStrings(theArray)}`);

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

function joinArrayOfStrings(theArray) {
   var index;
   var retVal = '';
   for (index = 0; index < theArray.length; ++index) {
      retVal=retVal.concat(`${index === 0 ? '' : ' or '}${theArray[index]}`);	
   }
   return retVal;
}

