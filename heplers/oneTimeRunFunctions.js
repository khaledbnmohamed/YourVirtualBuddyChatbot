'use strict';
if( process.env.NODE_ENV != 'production' && process.env.NODE_ENV != 'staging'){
  require('dotenv').config()
}

require('../imgur_handler/api_consumer.js')();
require('../imgur_handler/response_handler.js')();
require('../dialogflow_handler/api_consumer.js')();
require('../messages/receiver.js')();
require('../quick_replies.js')();
require('../resend_handler.js')();
require('../messages/events.js')();
require('../messages/payload.js')();

const
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request')


var app = express();


app.set('port', process.env.PORT || 5001);
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  process.env.PAGE_ACCESS_TOKEN;


/* DialogFlow API
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
// app.post('/webhook', function (req, res) {
//   exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
//   const agent = new WebhookClient({ request, response });

//   console.log("dialogflowFirebaseFulfillment"+dialogflowFirebaseFulfillment)
//   function hours (agent) {
//     if (currentlyOpen()) {
//       agent.add(`We're open now! We close at 5pm today.`);
//     } else {
//       agent.add(`We're currently closed, but we open every weekday at 9am!`);
//     }
//   }
// });

// });

  

/*Dialogflow response API */

// sendtoDialogFlow("How old are you",function (err, data) {
// if (err) return console.error(err);
// return data; }) 

////////////////////////////////////////////////////////////////////////////////////////////////////

/* ONLY RUN ONCE IN A BOT for get started button */
// enable_get_started(); 

// function enable_get_started()
// {


// var https = require('https');
// const access_token = PAGE_ACCESS_TOKEN ;

// const data = JSON.stringify({

//   "get_started":{"payload":"get_started"}

// })


// const options = {
//   method: 'POST',
//   hostname: 'graph.facebook.com',
//   port:443,
//   path: '/v2.6/me/messenger_profile?access_token='+ access_token,
//   headers: {
//     'Content-Type': 'application/json',
//     'Content-Length': data.length
//   }
// }






// var req = https.request(options, (res)=> {
//   res.on('data',(d) => {process.stdout.write(d)})


//     })

//     req.on("error", (error) => { console.error(error)})

//    req.write(data)
//    req.end()



// }


/////////////////////////////////////////////////////////////////////////////////////



/* ONLY RUN ONCE IN A BOT for greeting message */
// greeting(); 

// function greeting()
// {


// var https = require('https');
// const access_token = PAGE_ACCESS_TOKEN ;

// const data = JSON.stringify({


//   "greeting": [
//     {
//       "locale":"default",
//       "text":"Hello {{user_first_name}} !" 
//     }, {
//       "locale":"en_US",
//       "text":"Hi. This is Automated Meme sender so you don't have to communicate with any humans"
//     }
//   ]

// })


// const options = {
//   method: 'POST',
//   hostname: 'graph.facebook.com',
//   port:443,
//   path: '/v2.6/me/messenger_profile?access_token='+ access_token,
//   headers: {
//     'Content-Type': 'application/json',
//     'Content-Length': data.length
//   }
// }
// var req = https.request(options, (res)=> {
//   res.on('data',(d) => {process.stdout.write(d)})


//     })

//     req.on("error", (error) => { console.error(error)})

//    req.write(data)
//    req.end()



// }

//////////////////////////////////////////////////////////////////////////////////////////////////////


/* ONLY RUN ONCE IN A BOT for persistent_menu on the side button instead of like button */
// persistent_menu(); 

// function persistent_menu()
// {


// var https = require('https');

// const access_token = PAGE_ACCESS_TOKEN ;
// const data = JSON.stringify({

//   "persistent_menu":[
//     {
//       "locale":"default",
//       "composer_input_disabled": false,
//       "call_to_actions":[
//         {
//           "title":"Memes Categories",
//           "type":"nested",
//           "call_to_actions":[
//             {
//               "title":"Sad Memes",
//               "type":"postback",
//               "payload":"Sad Memes"
//             },
//               {
//               "title":"Love Memes",
//               "type":"postback",
//               "payload":"Love Memes"
//             },
//               {
//               "title":"Our Community Memes",
//               "type":"postback",
//               "payload":"surprise me"
//             }
//           ],

		 
//         },
//         {
//           "title":"Sort Memes by",
//           "type":"nested",
//           "call_to_actions":[
//             {
//               "title":"Highest Points First",
//               "type":"postback",
//               "payload":"sort by points"
//             },
//               {
//               "title":"Recent First",
//               "type":"postback",
//               "payload":"sort by time"
//             },
       
//           ],

		 
//         },
//         {
//          "title": "Help",
//           "type": "postback",
// 		  "payload": "help"

// 		 }
//       ]
//     }
//   ]
// })


// const options = {
//   method: 'POST',
//   hostname: 'graph.facebook.com',
//   port:443,
//   path: '/v2.6/me/messenger_profile?access_token='+ access_token,
//   headers: {
//     'Content-Type': 'application/json',
//     'Content-Length': data.length
//   }
// }
// var req = https.request(options, (res)=> {
//   res.on('data',(d) => {process.stdout.write(d)})


//     })

//     req.on("error", (error) => { console.error(error)})

//    req.write(data)
//    req.end()



// }