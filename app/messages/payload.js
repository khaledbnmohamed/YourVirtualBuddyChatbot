const
  returnedFromDialogFlow = false;
const returnedFromKnoweldge = false;
const DialogflowhasParameters = false;

const
  util = require('util');
const { sendAccountLinking } = require('../helpers/sendFunctions');
// require('./../imgur_handler/api_consumer.js')();
// require('./../resend_handler.js')();

const { getUser } = require('../controllers/users.js');
const {
  doNothing, sendLike, specialMemesFromMyAccount, manyCategoriesSearch,
} = require('../quick_replies');

const prom_user_id = util.promisify(getUser);
const tools = require('../helpers/sendFunctions.js');
// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN)
  ? (process.env.MESSENGER_PAGE_ACCESS_TOKEN)
  : process.env.PAGE_ACCESS_TOKEN;

const help_text = ['You can send me various messages:', '=================', ' ',
  '* *Send meme* -> sends you a fresh meme', ' ', "* *Sort by time* -> gets you latest memes without considering community's upvotes", ' ', '* *Sort by points* -> sends you most upvoted memes in choosen category', ' ',
  '* *Memes* -> Quick categories selection', ' ', '* *Surprise me* -> sends you a meme uploaded by our community', ' ', '* You can send an image to be uploaded to the community section where you can access it anytime',
].join('\n');
/*
   * If users came here through testdrive, they need to configure the server URL
   * in default.json before they can access local resources likes images/videos.
   */

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
      tools.sendTextMessage(senderID, help_text);
      break;

    case 'get_started':
      // sendAccountLinking(senderID);
      var user_first_name = '';
      prom_user_id(senderID).then((data) => {
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
      SortImagesbyPoints = true;
      tools.sendTextMessage(senderID, 'Next memes will be upvote/points based');
      break;

    case 'sort by time':
      SortImagesbyPoints = false;
      tools.sendTextMessage(senderID, 'Next memes will be the most recent');
      break;

    case 'surprise me':
      specialMemesFromMyAccount(senderID, payload);
      break;

    default:
      manyCategoriesSearch(senderID, payload);
  }
}

export function getFirstName(senderID, callback) {
  const https = require('https');
  const access_token = PAGE_ACCESS_TOKEN;

  let first_name = '';
  const options = {
    method: 'GET',
    hostname: 'graph.facebook.com',
    path: `/v7.0/${senderID}?fields=first_name&access_token=${access_token}`,
  };
  const req = https.request(options, (res) => {
    const chunks = [];
    res.on('data', (chunk) => {
      chunks.push(chunk);
    });

    res.on('end', (chunk) => {
      const body = Buffer.concat(chunks);
      first_name = JSON.parse(body).first_name;
      callback('', first_name);
    });

    res.on('error', (error) => {
      console.error(error);
      callback(error, '');
    });
  });

  req.end();
}
