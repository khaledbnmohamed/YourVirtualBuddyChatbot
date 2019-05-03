

//////////TODO add media filtration to extract videos out of images
/////////TODO Apply memeory to all parts of sending process
////////TODO Add instruction at the begining 
'use strict';

const
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request'),
  fs = require('fs'),
  tools = require('./sendFunctions.js'),
  tokenFile = require('./JWTtoken.js'),
  sk = require('./config/SecretKeys.js'),
  util = require('util'),
  PromisedSendtoDialogFlow = util.promisify(sendtoDialogFlow),

  dialogflow = require('dialogflow'),
  { WebhookClient } = require('dialogflow-fulfillment'),
  functions = require('./helpingFunctions.js'),

  { google } = require('googleapis');
//   oauth2Client = new google.auth.OAuth2(
//   YOUR_CLIENT_ID,
//   YOUR_CLIENT_SECRET,
//   YOUR_REDIRECT_URL
// );



var MessagetoDialogFlow = ""

//Secret Keys saved in different file for security 
var clientId = sk.getClientID();
var imgur_access_token = sk.getImgurAccessToken();
var imgur_username = sk.getImgurUserName();
var google_project_id = sk.getGoogleProjectID(); 
var google_access_token =tokenFile.sign();
var returnedFromDialogFlow = false
var returnedFromKnoweldge = false
var DialogflowhasParameters = false
var SortImagesbyPoints = true;
var uniqueRandoms = [];
var SortedByPointsCounter = 0; // initlize the i globally for easer access so don't have to write extra code to determine if first query to set i =0 or not

var google_access_token = tokenFile.sign();



var FirstQuery = true;
let counter = 0;
var default_text = ["You know that no matter how cool I am to you,",
  " at the end I'm a preprogrammed meme sender so please don't ask me for neither commitment or Anything I don't understand.",
  " Just type SEND MEME"
].join('\n');

var help_text = ["You can send me various messages:", "==========================", " ",
  "* 'Send meme' -> sends you a fresh meme", "* 'Sort by time' -> gets you latest memes without considering community's upvotes", "* 'Sort by points' -> sends you most upvoted memes in choosen category",
  "* 'Memes' -> Quick categories selection", "* 'Surprise me' -> sends you a meme uploaded by our community", "* You can send an image to be uploaded to the community section where you can access it anytime"
].join('\n');


var app = express();


var fileObject = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));

app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

/*
 * Be sure to setup your config values before running this code. You can
 * set them using environment variables or modifying the config file in /config.
 *
 */

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

/*
 * Use your own validation token. Check that the token used in the Webhook
 * setup is the same token used here.
 *
 */
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
// checkMessageContent("I want sad memes","Khaled")

function sendtoDialogFlow(MessagetoDialogFlow, callback) {

  var CallBackReturn;

  var https = require('https');
  var DFchunks = [];

  const data = JSON.stringify({



    "queryInput": {
      "text": {
        "languageCode": "en",
        "text": MessagetoDialogFlow
      }
    }


  })


  const options = {
    method: 'POST',
    host: 'dialogflow.googleapis.com',
    path: '/v2beta1/projects/' + google_project_id + '/agent/environments/draft/users/6542423/sessions/124567:detectIntent',
    headers: {

      'Authorization': 'Bearer ' + google_access_token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'

    }
  }
  var req = https.request(options, (res) => {
    res.on('data', (d) => { process.stdout.write(d) })


    res.on("data", function (DF) {
      DFchunks.push(DF);
      res.on("end", function (DF) {
        var body = Buffer.concat(DFchunks);
        var parsed = JSON.parse(body)
        res.on("error", function (error) {
          console.error(error);
          callback(error, "")
        });

        if (JSON.stringify(parsed.queryResult.parameters) != "{}") {

          console.log("parsed.queryResult.parameters" + parsed.queryResult.parameters.sendmeme)
          if (parsed.queryResult.parameters.sendmeme !== undefined) {

            DialogflowhasParameters = true
            console.log("REquest is parsed.queryResult.parameters.sendmeme " + parsed.queryResult.parameters.sendmeme)
            CallBackReturn = parsed.queryResult.parameters.sendmeme;

          }
          else {

            DialogflowhasParameters = false
            console.log("REquest is parsed.queryResult.fulfillmentText " + parsed.queryResult.fulfillmentText)
            CallBackReturn = parsed.queryResult.fulfillmentText;
          }
        }
        else {

          DialogflowhasParameters = false;
          try {

            if (parsed.queryResult.action == "repeat" && parsed.alternativeQueryResults[0].knowledgeAnswers.answers[0].matchConfidence > 0.41) {
              CallBackReturn = parsed.alternativeQueryResults[0].knowledgeAnswers.answers[0].answer;
              returnedFromKnoweldge = true;

            }
            else {
              console.log("fulfiliment in try " + parsed.queryResult.fulfillmentText)
              CallBackReturn = parsed.queryResult.fulfillmentText;
            }
          }
          catch (err) {
            console.log("I'll catch the error " + parsed.queryResult.fulfillmentText)
            CallBackReturn = parsed.queryResult.fulfillmentText;
          }

        }

        callback("", CallBackReturn);


      });


  
    });

  })

  req.on("error", (error) => { console.error(error) })

  req.write(data)

  req.end()



}














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
      console.log("name before pasring " + body)

      console.log("name after pasring " + JSON.parse(body).first_name)
      first_name = JSON.parse(body).first_name;
      console.log("first_name at get first name " + first_name)
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
    tools.sendTextMessage(senderID, "Uploaded your meme for later happiness");
    setTimeout(function () {
      tools.sendTextMessage(senderID, "You can access this meme and other selected memes by typing 'my memes'");
    }, 2000); //added timeout to make sure it comes later

  }
}


/* Check for message content*/

function checkMessageContent(messageText, senderID) {
  
  tools.sendReadReceipt(senderID);

  console.log(" I restart checkMessageContent ");

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
    case '9185memory':
      tools.sendTextMessage(senderID, functions.getArraySize)
      break;
    case '9185elements':
      tools.sendTextMessage(senderID, functions.getPrint)
      break;
    case '9185cat':
      tools.sendTextMessage(senderID, "FILE SYSYEM VALUES ARE " + fileObject.function_number + fileObject.seach_word)
      break;
    default:
      tools.sendTypingOn(senderID);

      console.log("returnedFromDialogFlow UP  = " + returnedFromDialogFlow);

      if (returnedFromDialogFlow) 
      {
        console.log("Entered here at return from dialog flow")



        if (returnedFromKnoweldge) {

          console.log("returnedFromKnoweldge ")

          tools.sendTextMessage(senderID, messageText)
          returnedFromKnoweldge = false;

        }

        else {
          if (DialogflowhasParameters) {
            console.log(" I have Parameters");
            
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
          console.log("returnedFromDialogFlow  = " + returnedFromDialogFlow);
          console.log("Data is , ",data)
          
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

/* quick reply send like*/

function sendLike(senderID) {

  fileObject.want_more = true;
  console.log(" I CHOSE SEND_ALIKE");
  console.log("FILE SYSYEM VALUES FOR ALIKE" + fileObject.function_number + fileObject.seach_word)
  chooseCaller(fileObject.function_number, fileObject.seach_word, senderID);
  checkToSendMore(senderID)
  // console.log(last_input_function_name + last_input_search_word)
}

/* quick reply gallery memes*/

function manyCategoriesSearch(senderID, quickReplyPayload) {

  fetchingData_from_gallery_searchAPi(senderID, quickReplyPayload);
  saveToFile(2, quickReplyPayload, true);
  console.log("FILE SYSYEM VALUES ARE " + fileObject.function_number + fileObject.seach_word);
  checkToSendMore(senderID)

}

/* quick reply  do nothing**/

function doNothing(senderID) {

  tools.sendTypingOff(senderID);
  console.log(" I CHOSE do nothing");
  saveToFile(null, null, false);
  tools.sendTextMessage(senderID, "Whatever you want <3 ")

}

/* quick reply personal accunt memes*/

function specialMemesFromMyAccount(senderID, quickReplyPayload) {

  fetchingData_from_Account_ImagesAPi(senderID, quickReplyPayload);
  saveToFile(1, quickReplyPayload, true);
  console.log("FILE SYSYEM VALUES ARE " + fileObject.function_number + fileObject.seach_word);
  checkToSendMore(senderID)


}






/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
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

function DialogFlowParameteresHandler(senderID, data) {
  //To Handle the search call from the dialogFlow function 
  //TODO : Find a template calling theme for cleaner code
  if (data != "memes" || data != "send meme") {

    if (data == "surprise me") {

      // To access saved memes on my imgur account

      specialMemesFromMyAccount(senderID, data);

      return;
    }
    else if (data == "help") {

      tools.sendTextMessage(senderID, help_text);

      return;

    }
    else {
      // To allow generic search for any category using the intents from DialogFlow
      console.log("I will save to file " + data)
      saveToFile(2, data, true);
      chooseCaller(2, data, senderID);

      return;
    }
  }
  returnedFromDialogFlow = false;


}

function fetchingData_from_gallery_searchAPi(senderID, Search_query) {

  fileObject.want_more = true;


  if (!Search_query) {
    Search_query = "memes"
    fileObject.search_word = Search_query
    fs.writeFileSync('./inputMemory.json', JSON.stringify(fileObject, null, 2), 'utf-8');

  }
  else {

    Search_query = encodeURIComponent(Search_query);
  }
  //Imgur API Gallery Search Request
  var https = require('https');
  // console.log(Search_query);

  var options = {
    'method': 'GET',
    'hostname': 'api.imgur.com',
    'path': '/3/gallery/search/{{sort}}/{{window}}/{{page}}?q=' + Search_query,
    'headers': {
      'Authorization': 'Client-ID ' + clientId
    }
  };



  var req = https.request(options, function (res) {

    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      // console.log(JSON.parse(body).data[0])
      console.log(options.path)
      let image_link = formingElements(body, senderID, false)
      if (!image_link) {

        image_link = formingElements(body, senderID, false)

      }
      else {
        //Handling empty image responses 

        tools.sendTypingOff(senderID);
        tools.sendImageMessage(senderID, image_link);

      }

    });

    res.on("error", function (error) {
      console.error(error);
    });

  });

  req.end();
  // console.log(body);
}
function sortByPoints(parsed) {


  var Sorted = parsed.data.sort(predicateBy("points"));
  Sorted = Sorted.reverse();
  return (Sorted);

}


function predicateBy(prop) {
  return function (a, b) {
    if (a[prop] > b[prop]) {
      return 1;
    } else if (a[prop] < b[prop]) {
      return -1;
    }
    return 0;
  }
}


function fetchingData_from_Account_ImagesAPi(senderID, Search_query) {


  //Imgur API Gallery Search Request
  var https = require('https');

  var options = {
    'method': 'GET',
    'hostname': 'api.imgur.com',
    'path': '/3/account/khaledbnmohamed/images',
    'headers': {
      'Authorization': 'Bearer ' + imgur_access_token
    }
  };


  var req = https.request(options, function (res) {

    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      console.log("data after pasring " + JSON.parse(body))
      console.log(options.path)
      console.log("Authorization is" + options.headers.Authorization)

      let image_link = formingElements(body, senderID, true)
      if (image_link) {

        tools.sendTypingOff(senderID);
        tools.sendImageMessage(senderID, image_link);


      }

    });

    res.on("error", function (error) {
      console.error(error);
    });

  });

  req.end();

  // console.log(body);
}

/* 
formingElements is the function responsible for parsing the  JSON response,choose which image to fetch its link, 
handles albums and solo images issue and check for duplicated images to make sure not to send to the user the same image twice 
in a counter of 100 images saved in a SentImages in inputMemory.json file


*/
function formingElements(result, senderID, accountImages) {


  let parsed = JSON.parse(result)
  let random_factor = 70
  let i = -1;

  if (accountImages) { //smaller range for account uploaded images
    random_factor = 40

  }

  /*
  if Condition to check if user chose to sort images by points and cancel the randmoization 
  PS: doesn't work with community uploaded images on account images that's why it's added in if condition
  */
  if (SortImagesbyPoints && !accountImages) {
    var Sorted = sortByPoints(parsed);

    console.log("SortedByPointsCounter MAIN" + SortedByPointsCounter);

    console.log("Result points " + Sorted[SortedByPointsCounter].points);

    var Target = functions.getImageLink(Sorted, SortedByPointsCounter, -1);

    console.log("Image link " + Target);

    while (functions.checkIfSentBefore(Target)) {
      //wait until you get a target image that was not sent before to the user

      SortedByPointsCounter++;

      Target = functions.getImageLink(Sorted, SortedByPointsCounter, -1);

      console.log("Sorted[SortedByPointsCounter]" + Sorted[SortedByPointsCounter].points);

      console.log("SortedByPointsCounter" + SortedByPointsCounter);




    }

    console.log("Image link Just before returning  " + Target + " it's count is " + SortedByPointsCounter);
    console.log("======================================================================================")
    return Target;




  }
  else {



    if (FirstQuery) {

      FirstQuery = false;
      i = 0;

    }
    else {
      i = makeUniqueRandom(random_factor)
    }


    while (parsed.data[i] == null) {

      console.log("while random value" + Math.random())
      i = Math.floor((Math.random() * random_factor) + 1);


    }


    console.log("entered ", i)
    /* to check for images if it belongs to album or not and a special case for
     account API images that doesn't belong to the albums at all  */
    if (parsed.data[i].is_album == true || accountImages == true) {
      console.log("Found it")
      counter = counter + 1;
      console.log("Counter is now " + counter);
      if (accountImages) {
        console.log("LINK IS " + parsed.data[i].link)
        return parsed.data[i].link //Fetched data from personal account are not in albums, single images so no Images variabel at all
      }
      else {
        return parsed.data[i].images[0].link
      }
    }
    else if (functions.getImageLink(parsed.data, i, -1)) {

      return functions.getImageLink(parsed.data, i, -1);
    }

    else {
      i++
    }


    //Handle Worst case of missed links
    tools.sendTextMessage(senderID, "That's a random empty miss, Try again")
    tools.sendTextMessage(senderID, "Hopefully you might get your dunk meme this time !")
  }


  return;

}



function chooseCaller(function_number, last_input_search_word, senderID) {
  /* 
  1== for personal account api
  2== gallery
   */
  if (last_input_search_word == null) {
    last_input_search_word = "memes";  //special case for send meme
    console.log("last_input_search_word " + last_input_search_word)
  }
  if (function_number == 1) {

    fetchingData_from_Account_ImagesAPi(senderID, last_input_search_word);
    return;

  }
  else if (function_number == 2) {

    fetchingData_from_gallery_searchAPi(senderID, last_input_search_word);
    return;

  }
}

function checkToSendMore(senderID) {

  if (fileObject.want_more) {

    setTimeout(function () { tools.SendMore(senderID) }, 5000); //must be called like that   why ? https://stackoverflow.com/a/5520159/5627553


  }
}


function saveToFile(number, word, want_more) {


  fileObject.function_number = number;
  fileObject.seach_word = word;
  fileObject.want_more = want_more;
  fs.writeFileSync('./inputMemory.json', JSON.stringify(fileObject, null, 2), 'utf-8');



}


function makeUniqueRandom(numRandoms) {


  // refill the array if needed
  if (!uniqueRandoms.length) {
    for (var i = 0; i < numRandoms; i++) {
      uniqueRandoms.push(i);
    }
  }
  var index = Math.floor(Math.random() * uniqueRandoms.length);
  var val = uniqueRandoms[index];

  // now remove that value from the array
  uniqueRandoms.splice(index, 1);

  return val;

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
        console.log("dataaaa" + data);
        user_first_name = data


        console.log("user_first_name" + user_first_name)
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


      break;
    default:
      console.log("I should work here")
      manyCategoriesSearch(senderID, payload);


  }

}
function uploadToAccount(senderID, image) {
  var https = require('https');

  var options = {
    'method': 'POST',
    'hostname': 'api.imgur.com',
    'path': '/3/image',
    'headers': {
      'Authorization': 'Bearer ' + imgur_access_token
    }
  };

  var req = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });

    res.on("error", function (error) {
      console.error(error);
    });
  });

  var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"image\"\r\n\r\n" + image + "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";

  req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');

  req.write(postData);

  req.end();
}


// Start server
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority.
app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});


module.exports = app;

