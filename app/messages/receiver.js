import { chooseCaller } from '../resend_handler';
import { addSortPrefToUser } from '../controllers/users';

// const fs = require('fs');
// const util = require('util');
const tools = require('../helpers/send_functions.js');
const { sendToDialogflow } = require('../dialogflow_handler/api_consumer');
const { doNothing } = require('../quick_replies');


/* Check for message content */
// eslint-disable-next-line import/prefer-default-export
export function checkMessageContent(messageText, senderID) {
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

    case 'no':
      doNothing(senderID);
      break;

    case 'yes':
      tools.sendQuickReply(senderID);
      break;

    case 'send meme':
      chooseCaller('account', 'memes', senderID);
      break;

    default:
      tools.sendTypingOn(senderID);
      sendToDialogflow(messageText, senderID);
      break;
  }
}
