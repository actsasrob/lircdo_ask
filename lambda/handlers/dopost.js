var request = require('request-promise');
var callback_app = require('../constants/catalog_external');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var rp = new Promise((resolve, reject) => {
      // Call server-side lircdo_ask action
      request({
        method: 'POST',
        uri: 'https://lirc.robhughes.net:8843/lircdo_ask',
        body: {
           lircAction: 'foobar',
           lircComponent: 'TV',
           shared_secret: callback_app.SHARED_SECRET
        },
        json: true // Automatically stringifies the body to JSON
      })
      .then((response) => {
        // Return Users Details
        resolve(JSON.parse(response));
        console.log('in then ' + response);
      })
      .catch((error) => {
        // API ERROR
        reject('lircdo_ask: ', error);
        console.log('in catch ' + error);
      });
    });

