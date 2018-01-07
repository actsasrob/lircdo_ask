var request = require('request-promise');

// Callback app constants
var callback_app = require('../constants/catalog_external');

module.exports = {

  invoke_callback: (callback_action, params) => {
    return new Promise((resolve, reject) => {
      // Call server-side lircdo_ask action 
      request({
        method: 'GET',
        uri: `${callback_app.CALLBACK_APP_SCHEME}://${callback_app.CALLBACK_APP_FQDN}:${callback_app.CALLBACK_APP_PORT}/${callback_action}`,
        qs: params,
        agentOptions: {
           ca: callback_app.ca
        }
      })
      .then((response) => {
        // Return Users Details
        resolve(JSON.parse(response));
      })
      .catch((error) => {
        // API ERROR
        reject(`invoke_callback: ${callback_action} `, error);
      });
    });
  },

};
