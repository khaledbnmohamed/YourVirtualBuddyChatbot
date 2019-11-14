require('./imgur_handler/api_consumer.js')();
require('./resend_handler.js')();


const 
tools = require('./../sendFunctions.js'),
fileObject = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));

module.exports  = function() {
/* quick reply send like*/
this.sendLike = function(senderID) {

    fileObject.want_more = true;
    chooseCaller(fileObject.function_number, fileObject.seach_word, senderID);
    checkToSendMore(senderID)
    // console.log(last_input_function_name + last_input_search_word)
  }
  /* quick reply  do nothing**/
this.doNothing=function(senderID) {
    tools.sendTypingOff(senderID);
    saveToFile(null, null, false);
    tools.sendTextMessage(senderID, "Whatever you want <3 ")
  
  }
  /* quick reply personal accunt memes*/
this.specialMemesFromMyAccount=function(senderID, quickReplyPayload) {

    personal_images_consumer(senderID, quickReplyPayload);
    saveToFile(1, quickReplyPayload, true);
    checkToSendMore(senderID)
  }

/* quick reply gallery memes*/
this.manyCategoriesSearch= function(senderID, quickReplyPayload) {

    public_images_consumer(senderID, quickReplyPayload);
    saveToFile(2, quickReplyPayload, true);
    checkToSendMore(senderID)
  
  }

}
