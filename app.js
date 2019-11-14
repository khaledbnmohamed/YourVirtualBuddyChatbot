/////////TODO Apply memeory to all parts of sending process
////////TODO Add instruction at the begining 
'use strict';
// require('app/Initializer/initializer.js')();
require('./app/imgur_handler/api_consumer.js')();
require('./app/imgur_handler/response_handler.js')();
require('./app/dialogflow_handler/api_consumer.js')();
require('./app/quick_replies.js')();
require('./app/resend_handler.js')();

const
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  fs = require('fs'),
  tools = require('./sendFunctions.js'),
  util = require('util'),
  PromisedSendtoDialogFlow = util.promisify(sendtoDialogFlow);


var MessagetoDialogFlow = "",
  returnedFromDialogFlow = false,
  returnedFromKnoweldge = false,
  DialogflowhasParameters = false,
  app = express(),
  fileObject = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8')),
  default_text = ["You know that no matter how cool I am to you,",
    " at the end I'm a preprogrammed meme sender so please don't ask me for neither commitment or Anything I don't understand.",
    " Just type SEND MEME"
  ].join('\n'),

  help_text = ["You can send me various messages:", "=================", " ",
    "* *Send meme* -> sends you a fresh meme", " ", "* *Sort by time* -> gets you latest memes without considering community's upvotes", " ", "* *Sort by points* -> sends you most upvoted memes in choosen category", " ",
    "* *Memes* -> Quick categories selection", " ", "* *Surprise me* -> sends you a meme uploaded by our community", " ", "* You can send an image to be uploaded to the community section where you can access it anytime"
  ].join('\n');


//Database conncetion setup
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

// tools.PAGE_ACCESS_TOKEN= PAGE_ACCESS_TOKEN; //to use it in CallSendAPI
// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

app.get('/webhook', function (req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});


/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function (pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function (messagingEvent) {
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
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
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
app.get('/authorize', function (req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will
  // be passed to the Account Linking callback.
  var authCode = "1234567890";

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});


//Test Function
// checkMessageContent("what is love", "Khaled")

function getFirstName(senderID, callback) {
  var https = require('https');
  const access_token = PAGE_ACCESS_TOKEN;
  var first_name = ''
  const options = {
    method: 'GET',
    hostname: 'graph.facebook.com',
    port: 443,
    path: '/' + senderID + '?fields=first_name&access_token=' + access_token,
  }
  var req = https.request(options, function (res) {
    var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      first_name = JSON.parse(body).first_name;
      callback("", first_name);
    });

    res.on("error", function (error) {
      console.error(error);
      callback(error, "")
    });

  });

  req.end();

}

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
      .update(buf)
      .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;
  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger'
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam,
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  tools.sendTextMessage(senderID, "Authentication successful");
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message'
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've
 * created. If we receive a message with an attachment (image, video, audio),
 * then we'll simply confirm that we've received the attachment.
 *
 */
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));
  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;
  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to conole COMMENTED FOR BETTER VISIBILLITY 
    // console.log("Received echo for message %s and app %d with metadata %s",
    // messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);
    tools.sendTypingOn(senderID); //typing on till fetching

    handlePayload(quickReplyPayload, senderID);
    // setTimeout(SendMore(senderID), 3000);
    return;
  }
  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    checkMessageContent(messageText, senderID)

  } else if (messageAttachments) {
    for (var i = 0; i < messageAttachments.length; i++) {
      if (messageAttachments[i].type === "image") {
        var imageURL = messageAttachments[i].payload.url;
        uploadToAccount(senderID, imageURL)
        console.log(imageURL);
      }
    }
    tools.sendTextMessage(senderID, "Uploaded your meme/s for later happiness");
    setTimeout(function () {
      tools.sendTextMessage(senderID, "You can access this meme and other selected memes by typing 'my memes'");
    }, 2000); //added timeout to make sure it comes later
  }
}

/* Check for message content*/
function checkMessageContent(messageText, senderID) {

  tools.sendReadReceipt(senderID);
  switch (messageText.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
    case 'hello':
    case 'hi':
      tools.sendHiMessage(senderID);
      setTimeout(function () { tools.sendTextMessage(senderID, "You can also send me a meme as an attachment to save it"); }, 1000);
      break;

    case 'image':
      tools.requiresServerURL(tools.sendImageMessage, [senderID]);
      break;

    case 'gif':
      tools.requiresServerURL(tools.sendGifMessage, [senderID]);
      break;

    case 'video':
      tools.requiresServerURL(tools.sendVideoMessage, [senderID]);
      break;

    case 'sort by points':
      SortImagesbyPoints = true;
      tools.sendTextMessage(senderID, "Next memes will be upvote/points based");
      break;

    case 'sort by time':
      SortImagesbyPoints = false;
      tools.sendTextMessage(senderID, "Next memes will be the most recent");
      break;

    case 'memes':
      tools.sendQuickReply(senderID);
      // checkToSendMore(senderID);
      break;

    case 'another category':
      tools.sendQuickReply(senderID);
      // checkToSendMore(senderID);
      break;

    case 'read receipt':
      tools.sendReadReceipt(senderID);
      break;

    case 'account linking':
      tools.requiresServerURL(sendAccountLinking, [senderID]);
      break;

    case 'no':
      doNothing(senderID);
      break;

    case 'send meme':
      // tools.sendTypingOn(senderID); //typing on till fetching
      saveToFile(2, "memes", true);
      chooseCaller(2, null, senderID);
      checkToSendMore(senderID);
      break;
    ////////Debugging Cases Just to check Input Values
    default:
      tools.sendTypingOn(senderID);

      if (returnedFromDialogFlow) {
        if (returnedFromKnoweldge) {
          tools.sendTextMessage(senderID, messageText)
          returnedFromKnoweldge = false;
        }
        else {
          if (DialogflowhasParameters) {
            DialogFlowParameteresHandler(senderID, messageText);
          }
          else {
            tools.sendTextMessage(senderID, messageText)
            returnedFromDialogFlow = false;
          }

        }
        returnedFromDialogFlow = false;
      }
      else if (returnedFromDialogFlow == false) {

        PromisedSendtoDialogFlow(messageText)
          .then(data => {
            returnedFromDialogFlow = true;
            checkMessageContent(data, senderID);
          }
          )
          .catch(err => console.error(`[Error]: ${err}`));
      }
      tools.sendTypingOff(senderID);

      //setTimeout(function(){tools.sendQuickReply(senderID)},3000); //added timeout to make sure it comes later
      break;
  }
}





function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function (messageID) {
      console.log("Received delivery confirmation for message ID: %s",
        messageID);
    });
  }
  console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;
  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;
  if (event.postback) {

    handlePayload(event.postback.payload, senderID);


  }

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful

}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}

/*
 * If users came here through testdrive, they need to configure the server URL
 * in default.json before they can access local resources likes images/videos.
 */



function checkToSendMore(senderID) {
  if (fileObject.want_more) {
    setTimeout(function () { tools.SendMore(senderID) }, 5000); //must be called like that   why ? https://stackoverflow.com/a/5520159/5627553
  }
}


function handlePayload(payload, senderID) {
  switch (payload) {
    case 'personal_account_memes':

      specialMemesFromMyAccount(senderID, payload)

      break;
    case 'send_alike':

      sendLike(senderID);
      break;

    case 'do nothing':

      doNothing(senderID);
      break;

    case 'help':

      tools.sendTextMessage(senderID, help_text);
      break;

    case 'get_started':

      var user_first_name = ''
      getFirstName(senderID, function (err, data) {
        if (err) return console.error(err);
        user_first_name = data
        var message_first_time = ["Hi " + user_first_name + ",", "Try me by sending 'Send meme' or 'memes' "].join('\n');
        //present user with some greeting or call to action
        tools.sendTextMessage(senderID, message_first_time);
      });

      break;

    case 'sort by points':
      SortImagesbyPoints = true;
      tools.sendTextMessage(senderID, "Next memes will be upvote/points based");

      break;

    case 'sort by time':
      SortImagesbyPoints = false;
      tools.sendTextMessage(senderID, "Next memes will be the most recent");
      break;

    case 'surprise me':

      specialMemesFromMyAccount(senderID, payload);

      break;
    default:
      manyCategoriesSearch(senderID, payload);


  }

}


// Start server
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority.
app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});


module.exports = app;

