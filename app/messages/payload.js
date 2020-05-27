import { addSortPrefToUser } from '../controllers/users';

const
  util = require('util');
const { sendAccountLinking } = require('../helpers/sendFunctions');
// require('./../imgur_handler/api_consumer.js')();
// require('./../resend_handler.js')();

const { getUser } = require('../controllers/users.js');
const {
  doNothing, sendLike, specialMemesFromMyAccount, manyCategoriesSearch,
} = require('../quick_replies');

const PromisedUser = util.promisify(getUser);
const tools = require('../helpers/sendFunctions.js');

const helpText = ['You can send me various messages:', '=================', ' ',
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
    case 'personal_AccountMemes':
      specialMemesFromMyAccount(senderID, payload);
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
      // sendAccountLinking(senderID);
      const user_first_name = '';
      PromisedUser(senderID).then((data) => {
        console.log('returned fresh data', data);
      });
      // getFirstName(senderID, (err, data) => {
      //   if (err) return console.error(err);
      //   user_first_name = data;
      //   const message_first_time = [`Hi ${user_first_name},`, "Try me by sending 'Send meme' or 'memes' "].join('\n');
      //   // present user with some greeting or call to action
      //   tools.sendTextMessage(senderID, message_first_time);
      // });
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


    case 'surprise me':
      specialMemesFromMyAccount(senderID, payload);
      break;

    default:
      manyCategoriesSearch(senderID, payload);
  }
}
