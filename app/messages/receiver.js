
require('../imgur_handler/api_consumer.js')();
require('./../dialogflow_handler/response_handler.js')();
require('./../resend_handler.js')();

var
  returnedFromDialogFlow = false,
  returnedFromKnoweldge = false,
  DialogflowhasParameters = false;

const
  tools = require('../../sendFunctions.js'),
  fs = require('fs'),
  fileObject = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8')),
  util = require('util'),
  PromisedSendtoDialogFlow = util.promisify(sendtoDialogFlow);

module.exports = function () {
/* Check for message content*/
this.checkMessageContent=function(messageText, senderID) {

    tools.sendReadReceipt(senderID);
    switch (messageText.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
      case 'hello':
      case 'hi':
        tools.sendHiMessage(senderID);
        setTimeout(function () { tools.sendTextMessage(senderID, "You can also send me a meme as an attachment to save it"); }, 1000);
        break;
  
      case 'image':
        tools.requiresSERVER_URL(tools.sendImageMessage, [senderID]);
        break;
  
      case 'gif':
        tools.requiresSERVER_URL(tools.sendGifMessage, [senderID]);
        break;
  
      case 'video':
        tools.requiresSERVER_URL(tools.sendVideoMessage, [senderID]);
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
        tools.requiresSERVER_URL(sendAccountLinking, [senderID]);
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
  this.checkToSendMore = function(senderID) {
    if (fileObject.want_more) {
      setTimeout(function () { tools.SendMore(senderID) }, 5000); //must be called like that   why ? https://stackoverflow.com/a/5520159/5627553
    }
  }
  
}
