import { chooseCaller, saveToFile } from '../resend_handler';

const fs = require('fs');
const util = require('util');
const tools = require('../helpers/sendFunctions.js');
const sendtoDialogFlow = require('../dialogflow_handler/response_handler');
const DialogFlowParameteresHandler = require('../dialogflow_handler/api_consumer');
const doNothing = require('../quick_replies');

const fileObject = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));
const PromisedSendtoDialogFlow = util.promisify(sendtoDialogFlow);

let {
  returnedFromDialogFlow,
  returnedFromKnoweldge,
  DialogflowhasParameters,
} = false;

/* Check for message content */
export function checkMessageContent(messageText, senderID) {
  tools.sendReadReceipt(senderID);
  switch (
    messageText
      .replace(/[^\w\s]/gi, '')
      .trim()
      .toLowerCase()
  ) {
    case 'hello':
    case 'hi':
      tools.sendHiMessage(senderID);
      setTimeout(() => {
        tools.sendTextMessage(
          senderID,
          'You can also send me a meme as an attachment to save it',
        );
      }, 1000);
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
      tools.sendTextMessage(
        senderID,
        'Next memes will be upvote/points based',
      );
      break;

    case 'sort by time':
      SortImagesbyPoints = false;
      tools.sendTextMessage(senderID, 'Next memes will be the most recent');
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

    case 'test':
      chooseCaller('account', null, senderID);
      break;

    case 'send meme':
      // tools.sendTypingOn(senderID); //typing on till fetching
      saveToFile(2, 'memes', true);
      chooseCaller(2, null, senderID);
      this.checkToSendMore(senderID);
      break;

    default:
      tools.sendTypingOn(senderID);

      if (returnedFromDialogFlow) {
        if (returnedFromKnoweldge) {
          tools.sendTextMessage(senderID, messageText);
          returnedFromKnoweldge = false;
        } else if (DialogflowhasParameters) {
          DialogFlowParameteresHandler(senderID, messageText);
        } else {
          tools.sendTextMessage(senderID, messageText);
          returnedFromDialogFlow = false;
        }
        returnedFromDialogFlow = false;
      } else if (returnedFromDialogFlow == false) {
        PromisedSendtoDialogFlow(messageText)
          .then((data) => {
            returnedFromDialogFlow = true;
            checkMessageContent(data, senderID);
          })
          .catch((err) => console.error(`[Error]: ${err}`));
      }
      tools.sendTypingOff(senderID);
      // setTimeout(function(){tools.sendQuickReply(senderID)},3000); //added timeout to make sure it comes later
      break;
  }
}
export function checkToSendMore(senderID) {
  if (fileObject.want_more) {
    setTimeout(() => {
      tools.SendMore(senderID);
    }, 5001); // must be called like that   why ? https://stackoverflow.com/a/5520159/5627553
  }
}
