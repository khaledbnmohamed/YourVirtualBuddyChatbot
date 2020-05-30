import { chooseCaller } from '../resend_handler';
import { addSortPrefToUser } from '../controllers/users';

const fs = require('fs');
const util = require('util');
const tools = require('../helpers/send_functions.js');
const { sendtoDialogFlow } = require('../dialogflow_handler/api_consumer');
const doNothing = require('../quick_replies');



export function checkToSendMore(senderID) {
  setTimeout(() => {
    tools.SendMore(senderID);
  }, 10001); // must be called like that   why ? https://stackoverflow.com/a/5520159/5627553
}

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
      if (addSortPrefToUser(senderID, false)) {
        tools.sendTextMessage(
          senderID,
          'Next memes will be upvote/points based',
        );
      } else {
        tools.sendTextMessage(
          senderID,
          'Something went wrong !',
        );
      }
      break;

    case 'sort by time':
      if (addSortPrefToUser(senderID, true)) {
        tools.sendTextMessage(
          senderID,
          'Next memes will be the most recent',
        );
      } else {
        tools.sendTextMessage(
          senderID,
          'Something went wrong !',
        );
      }
      break;

    case 'memes':
      tools.sendQuickReply(senderID);
      break;

    case 'another category':
      tools.sendQuickReply(senderID);
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
      chooseCaller('account', 'memes', senderID);
      break;

    default:
      tools.sendTypingOn(senderID);
      sendtoDialogFlow(messageText, senderID);
      break;
  }
}
