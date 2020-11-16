import { addSortPrefToUser } from '../controllers/users';
import { doNothing, sendLike } from '../quick_replies';
import { chooseCaller } from '../resend_handler';
import { getFirstName } from '../helpers/facebook_apis';

const tools = require('../helpers/send_functions.js');

export const helpText = ['You can send me various messages:', '=================', ' ',
  '* *Send meme* -> sends you a fresh meme', ' ', "* *Sort by time* -> gets you latest memes without considering community's upvotes", ' ', '* *Sort by points* -> sends you most upvoted memes in choosen category', ' ',
  '* *Memes* -> Quick categories selection', ' ', '* *Surprise me* -> sends you a meme uploaded by our community', ' ', '* You can send an image to be uploaded to the community section where you can access it anytime',
].join('\n');
/*
   * If users came here through testdrive, they need to configure the server URL
   * in default.json before they can access local resources likes images/videos.
   */

// eslint-disable-next-line import/prefer-default-export
export function handlePayload(payload, senderID) {
  switch (payload) {
    case 'account_memes':
      chooseCaller('account', null, senderID);
      break;

    case 'send_alike':
      sendLike(senderID);
      break;

    case 'do nothing':
      doNothing(senderID);
      break;

    case 'help':
      tools.sendTextMessage(senderID, helpText);
      break;

    case 'get_started':
      getFirstName(senderID, (error, firstName) => {
        const firstTimeGreeting = [`Hi ${firstName},`, "Try me by sending 'Send meme' or 'memes' "].join('\n');
        tools.sendTextMessage(senderID, firstTimeGreeting);
      });

      break;

    case 'sort by points':
      if (addSortPrefToUser(senderID, true)) {
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
      if (addSortPrefToUser(senderID, false)) {
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

    default:
      chooseCaller('gallery', payload, senderID);
  }
}
