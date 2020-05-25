// ///////TODO Apply memeory to all parts of sending process
// //////TODO Add instruction at the begining


import { getUser } from './app/controllers/users';
import { sendtoDialogFlow } from './app/dialogflow_handler/api_consumer';
import {
  verifyRequestSignature, receivedDeliveryConfirmation, receivedPostback,
  receivedAccountLink, receivedAuthentication, receivedMessageRead,
} from './app/messages/events';

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
  require('dotenv').config();
}

const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const util = require('util');
const handlePayload = require('./app/messages/payload');
const { ImgurImagesConsumer } = require('./app/imgur_handler/api_consumer');
const tools = require('./app/helpers/sendFunctions');
const helpers = require('./app/helpers/helpingFunctions');
const checkMessageContent = require('./app/messages/receiver');
const { uploadToAccount } = require('./app/imgur_handler/api_consumer');

const PromisedToDB = util.promisify(getUser);
const PromisedSendtoDialogFlow = util.promisify(sendtoDialogFlow);


const app = express();

app.set('port', process.env.PORT || 5001);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET)
  ? process.env.MESSENGER_APP_SECRET
  : process.env.APP_SECRET;
// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN)
  ? (process.env.MESSENGER_VALIDATION_TOKEN)
  : process.env.VALIDATION_TOKEN;
// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN)
  ? (process.env.MESSENGER_PAGE_ACCESS_TOKEN)
  : process.env.PAGE_ACCESS_TOKEN;
// tools.PAGE_ACCESS_TOKEN= PAGE_ACCESS_TOKEN; //to use it in CallSendAPI
// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
const SERVER_URL = (process.env.SERVER_URL)
  ? (process.env.SERVER_URL)
  : process.env.SERVER_URL;
if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error('Missing config values');
  process.exit(1);
}
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe'
    && req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});

function receivedMessage(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const { message } = event;
  console.log('Received message for user %d and page %d at %d with message:',
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));
  const isEcho = message.is_echo;
  const messageId = message.mid;
  const appId = message.app_id;
  const { metadata } = message;
  // You may get a text or attachment but not both
  const messageText = message.text;
  const messageAttachments = message.attachments;
  const quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to conole COMMENTED FOR BETTER VISIBILLITY
    // console.log("Received echo for message %s and app %d with metadata %s",
    // messageId, appId, metadata);
    return;
  } if (quickReply) {
    const quickReplyPayload = quickReply.payload;
    console.log('Quick reply for message %s with payload %s',
      messageId, quickReplyPayload);
    tools.sendTypingOn(senderID); // typing on till fetching
    handlePayload(quickReplyPayload, senderID);
    // setTimeout(SendMore(senderID), 3000);
    return;
  }
  if (messageText) {
    console.log("fuck yeah")

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    checkMessageContent(messageText, senderID);
  } else if (messageAttachments) {
    for (let i = 0; i < messageAttachments.length; i += 1) {
      if (messageAttachments[i].type === 'image') {
        const imageURL = messageAttachments[i].payload.url;
        uploadToAccount(senderID, imageURL);
      }
    }
    tools.sendTextMessage(senderID, 'Uploaded your meme/s for later happiness');
    setTimeout(() => {
      tools.sendTextMessage(senderID, "You can access this meme and other selected memes by typing 'my memes'");
    }, 2000); // added timeout to make sure it comes later
  }
}

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', (req, res) => {
  const data = req.body;
  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach((pageEntry) => {
      const pageID = pageEntry.id;
      const timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach((messagingEvent) => {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        } else {
          console.log('Webhook received unknown messagingEvent: ', messagingEvent);
        }
      });
    });
    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});
/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL.
 *
 */
app.get('/authorize', (req, res) => {
  const accountLinkingToken = req.query.account_linking_token;
  const redirectURI = req.query.redirect_uri;
  // Authorization Code should be generated per user by the developer. This will
  // be passed to the Account Linking callback.
  const authCode = '1234567890';
  // Redirect users to this URI on successful login
  const redirectURISuccess = `${redirectURI}&authorization_code=${authCode}`;
  res.render('authorize', {
    accountLinkingToken,
    redirectURI,
    redirectURISuccess,
  });
});

// ImgurImagesConsumer('kaka', 'gallery', 'memes');
// send_meme_to_user('Khalod1');
// helpers.sendImageToNewUser('fuckme', '33333324ds32423sdfafadas');
// console.log(getUser('khal22ooood'));
// PromisedToDB('Khalod1')
//   .then((data) => {
//     console.log('=============================================');
//     console.log('returned fresh data', data);
//   })
//   .catch((err) => console.error(`[Error]: ${err}`));


// PromisedSendtoDialogFlow("kilme")
// .then(data => {
//   checkMessageContent(data, senderID);
//   console.log(100*"==");
//   console.log("data is " + data);

// }
// )
// .catch(err => console.error(`[Error]: ${err}`));

// Test Function
// checkMessageContent("send memes", "Khaled")

const now = new Date();
let millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 0) - now;
if (millisTill10 < 0) {
  millisTill10 += 86400000; // it's after 10am, try 10am tomorrow.
}
setTimeout(() => { alert("It's 10am!"); }, millisTill10);

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority.
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
