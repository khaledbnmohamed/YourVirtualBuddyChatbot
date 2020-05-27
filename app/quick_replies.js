import { ImgurImagesConsumer } from './imgur_handler/api_consumer';
import { checkToSendMore } from './messages/receiver';

const fs = require('fs');
const resend = require('./resend_handler.js');

const
  tools = require('./helpers/sendFunctions.js');

const fileObject = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));

module.exports = function () {
/* quick reply send like */
  this.sendLike = function (senderID) {
    fileObject.want_more = true;
    resend.chooseCaller(fileObject.function_number, fileObject.seach_word, senderID);
    checkToSendMore(senderID);
  };
  /* quick reply  do nothing* */
  this.doNothing = function (senderID) {
    tools.sendTypingOff(senderID);
    tools.sendTextMessage(senderID, 'Whatever you want <3 ');
  };
  /* quick reply personal accunt memes */
  this.specialMemesFromMyAccount = function (senderID, quickReplyPayload) {
    ImgurImagesConsumer('account', quickReplyPayload, senderID);
    resend.saveToFile(1, quickReplyPayload, true);
    resend.checkToSendMore(senderID);
  };

  /* quick reply gallery memes */
  this.manyCategoriesSearch = function (senderID, quickReplyPayload) {
    ImgurImagesConsumer('gallery', quickReplyPayload, senderID);
    checkToSendMore(senderID);
  };
};
