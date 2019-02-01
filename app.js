

//////////TODO add media filtration to extract videos out of images
'use strict';

const
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request'),
  fs = require('fs'),
  tools = require('./sendFunctions.js');




var ImageLink = 'https://i.imgur.com/KZC2CW9.jpg'
var clientId = '8056e5db3f369d1'
var imgur_access_token = '2a8f6dacd57b657d8f9542b166724964c1ed8f8f'
var imgur_username = 'khaledbnmohamed'
var FirstQuery = true;
let counter = 0;
var default_text = [ "You know that no matter how cool I am to you,",
  " at the end I'm a preprogrammed meme sender so please don't ask me for neither commitment or Anything I don't understand.",
  " Just type SEND MEME"
].join('\n');
 

var app = express();


var fileObject =JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));

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

 function getFirstName()
 {


var https = require('https');
const access_token = PAGE_ACCESS_TOKEN ;




const options = {
  method: 'GET',
  hostname: 'graph.facebook.com',
  port:443,
  path: '/<PSID>?fields=first_name&access_token='+ access_token,
}
 var req = https.request(options, function (res) {

      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log("name before pasring " + body)

        console.log("name after pasring " + JSON.parse(body))
        return JSON.parse(body);
      });

      res.on("error", function (error) {
        console.error(error);
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
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s",
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);
    tools.sendTypingOn(senderID); //typing on till fetching

	switch (quickReplyPayload) {
	case 'personal_account_memes':
        fetchingData_from_Account_ImagesAPi(senderID, quickReplyPayload);
	   	saveToFile(1,quickReplyPayload,true);
        console.log("FILE SYSYEM VALUES ARE " + fileObject.function_number + fileObject.seach_word);
     	checkToSendMore(senderID)

        // last_input_function_name = 'fetchingData_from_Account_ImagesAPi';
        // last_input_search_word = quickReplyPayload;

        // console.log(" last_input_function_name "+last_input_function_name+" last_input_search_word "+ last_input_search_word)
         break;
	case 'send_alike':
	     fileObject.want_more=true;
     	 console.log(" I CHOSE SEND_ALIKE");
         console.log("FILE SYSYEM VALUES FOR ALIKE" + fileObject.function_number + fileObject.seach_word)
         chooseCaller(fileObject.function_number,fileObject.seach_word,senderID);
         checkToSendMore(senderID)
     	 // console.log(last_input_function_name + last_input_search_word)
        break;

     case 'do nothing':
         tools.sendTypingOff(senderID);
	 	 console.log(" I CHOSE do nothing");
	   	 saveToFile(null,null,false);
	     tools.sendTextMessage(senderID,"Whatever you want <3 ")


        break;



      default:
        fetchingData_from_gallery_searchAPi(senderID,quickReplyPayload);
	   	saveToFile(2,quickReplyPayload,true);
        console.log("FILE SYSYEM VALUES ARE " + fileObject.function_number + fileObject.seach_word);
     	checkToSendMore(senderID)

        
    }
  // setTimeout(SendMore(senderID), 3000);
  return;
  }

    if (messageText) {

      // If we receive a text message, check to see if it matches any special
      // keywords and send back the corresponding example. Otherwise, just echo
      // the text we received.


      switch (messageText.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
        case 'hello':
        case 'hi':
          tools.sendHiMessage(senderID);
          break;

        case 'image':
          tools.requiresServerURL(tools.sendImageMessage, [senderID]);
          break;

        case 'gif':
          tools.requiresServerURL(tools.sendGifMessage, [senderID]);
          break;

        case 'audio':
          tools.requiresServerURL(tools.sendAudioMessage, [senderID]);
          break;

        case 'video':
          tools.requiresServerURL(tools.sendVideoMessage, [senderID]);
          break;

        case 'file':
          tools.requiresServerURL(tools.sendFileMessage, [senderID]);
          break;

        case 'button':
          tools.sendButtonMessage(senderID);
          break;

        case 'generic':
          tools.requiresServerURL(tools.sendGenericMessage, [senderID]);
          break;

        case 'receipt':
          tools.requiresServerURL(tools.sendReceiptMessage, [senderID]);
          break;

        case 'memes':
          tools.sendQuickReply(senderID);
		  // checkToSendMore(senderID);
          break;

        case 'read receipt':
          tools.sendReadReceipt(senderID);
          break;

        case 'typing on':
          tools.sendTypingOn(senderID);
          break;

        case 'typing off':
          tools.sendTypingOff(senderID);
          break;

        case 'account linking':
          tools.requiresServerURL(sendAccountLinking, [senderID]);
          break;

        case 'send meme':
          // tools.sendTypingOn(senderID); //typing on till fetching
          saveToFile(2,"memes",true);
          chooseCaller(2,null,senderID); 
		  checkToSendMore(senderID);

          break;

        default:
          tools.sendTextMessage(senderID, default_text);
      }
    } else if (messageAttachments) {
      tools.sendTextMessage(senderID, "Message with attachment received");
    }
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
	 if(event.postback && event.postback.payload === "get_started" )
        {
        		var user_first_name=getFirstName();
        		var message_first_time = "Hi" + user_first_name +" Try me by 'Send meme' or 'memes' "
                //present user with some greeting or call to action
                tools.sendTextMessage(senderID,message_first_time );
                                //sendMessage(event.sender.id,msg);      
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






  function fetchingData_from_gallery_searchAPi(senderID, Search_query) {
	     
     fileObject.want_more=true;


    if (!Search_query) {
      Search_query = "memes"
      fileObject.search_word=Search_query
      fs.writeFileSync('./inputMemory.json', JSON.stringify(fileObject, null, 2) , 'utf-8');

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
        'Authorization': 'Client-ID 8056e5db3f369d1'
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

  function formingElements(result, senderID, accountImages) {


    let parsed = JSON.parse(result)
    let i = -1;
    let random_factor = 30

    if (accountImages) {
      random_factor = 10

    }

    if (FirstQuery) {

      FirstQuery = false;
      i = 0;

    }
    else {
      i = Math.floor((Math.random() * random_factor) + 1);
    }

    while (parsed.data[i]) {

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
      else {
        i++
      }
    }

    tools.sendTextMessage(senderID, "No memes for you today go get a life")
    return;
  }

function chooseCaller(function_number,last_input_search_word,senderID){
/* 
1== for personal account api
2== gallery
 */
 if(last_input_search_word==null){
		last_input_search_word="memes";  //special case for send meme
		console.log("last_input_search_word "+ last_input_search_word)
 }
	if(function_number==1){

        fetchingData_from_Account_ImagesAPi(senderID, last_input_search_word);
        return;

	}
	else if(function_number==2){

        fetchingData_from_gallery_searchAPi(senderID, last_input_search_word);
        return;

	}
}

function checkToSendMore(senderID){

if (fileObject.want_more ){
    
      setTimeout(function(){tools.SendMore(senderID)},5000); //must be called like that   why ? https://stackoverflow.com/a/5520159/5627553


}
}

function firstEntity(nlp, name) {
  return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}

function saveToFile(number,word,want_more){


	fileObject.function_number=number;
	fileObject.seach_word= word;
 	fileObject.want_more=want_more;
    fs.writeFileSync('./inputMemory.json', JSON.stringify(fileObject, null, 2) , 'utf-8');



}

  // Start server
  // Webhooks must be available via SSL with a certificate signed by a valid
  // certificate authority.
  app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
  });

  module.exports = app;

