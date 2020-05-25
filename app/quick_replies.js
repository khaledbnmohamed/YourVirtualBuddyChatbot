import { ImgurImagesConsumer } from "./imgur_handler/api_consumer";
const resend = require('./resend_handler.js');

const fs = require('fs');
const
  tools = require('./helpers/sendFunctions.js');

const fileObject = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));

module.exports = function () {
/* quick reply send like */
  this.sendLike = function (senderID) {
    fileObject.want_more = true;
    resend.chooseCaller(fileObject.function_number, fileObject.seach_word, senderID);
    checkToSendMore(senderID);
    // console.log(last_input_function_name + last_input_search_word)
  };
  /* quick reply  do nothing* */
  this.doNothing = function (senderID) {
    tools.sendTypingOff(senderID);
    resend.saveToFile(null, null, false);
    tools.sendTextMessage(senderID, 'Whatever you want <3 ');
  };
  /* quick reply personal accunt memes */
  this.specialMemesFromMyAccount = function (senderID, quickReplyPayload) {
    ImgurImagesConsumer(senderID, 'account', quickReplyPayload);
    resend.saveToFile(1, quickReplyPayload, true);
    resend.checkToSendMore(senderID);
  };

  /* quick reply gallery memes */
  this.manyCategoriesSearch = function (senderID, quickReplyPayload) {
    ImgurImagesConsumer(senderID, 'gallery', quickReplyPayload);
    saveToFile(2, quickReplyPayload, true);
    checkToSendMore(senderID);
  };
};
