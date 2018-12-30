var request = require('request-promise');

// Callback app constants
//var callback_app = require('../constants/catalog_external');

module.exports = {

  invoke_callback: (callback_action, attributes, params) => {
    var app_fqdn = attributes['applicationFQDN'];
    var app_port = attributes['applicationPort'];
    //When using Let's Encrypt signed certificates we no longer need to send/receive
    // the self-signed CA cert
    //var ca_cert = attributes['ca_cert'];
    //ca_cert = ca_cert.replace(/\./g, '\n');
    console.log(`invoke_callback: callback_action=${callback_action} app_fqdn=${app_fqdn} app_port=${app_port}`);

    return new Promise((resolve, reject) => {
      // Call server-side callback action 
      request({
        method: 'GET',
        uri: `https://${app_fqdn}:${app_port}/${callback_action}`,
        qs: params,
        agentOptions: {
           //ca: ca_cert  // only needed when using self-signed certificate
        }
      })
      .then((response) => {
        // Return Users Details
        resolve(JSON.parse(response));
      })
      .catch((error) => {
        // API ERROR
        //reject(`invoke_callback: ${callback_action} `, error);
        reject(`invoke_callback: ${callback_action} ` + error);
      });
    });
  },
  invoke_pair_callback: (ip_address, port, params) => {
    console.log('invoke_pair_callback:  ip_address=' + ip_address + ' port = ' +  port + ' params=', JSON.stringify(params));
    return new Promise((resolve, reject) => {
      // Call server-side lircdo_ask pair action
      request({
        method: 'GET',
        uri: `https://${ip_address}:${port}/pair_action_ask`,
        qs: params,
	json: true,
	// insecure: true, // doesn't work
	rejectUnauthorized: false,
	//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      })
      .then((response) => {
        // Return Users Details
        console.log('invoke_pair_callback: response=', JSON.stringify(response));
        //resolve(JSON.parse(response));
        resolve(response);
      })
      .catch((error) => {
        // API ERROR
        console.log('invoke_pair_callback: error=' + error);
        reject(`invoke_pair_callback: ` + error);
      });
    });
    console.log('invoke_pair_callback: after request()');
  },

};
