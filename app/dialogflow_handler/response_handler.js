
require('./../quick_replies.js')();

const 
functions = require('./../helpers/helpingFunctions.js'),
tools = require('./../helpers/sendFunctions.js');
help_text = ["You can send me various messages:", "=================", " ",
"* *Send meme* -> sends you a fresh meme", " ", "* *Sort by time* -> gets you latest memes without considering community's upvotes", " ", "* *Sort by points* -> sends you most upvoted memes in choosen category", " ",
"* *Memes* -> Quick categories selection", " ", "* *Surprise me* -> sends you a meme uploaded by our community", " ", "* You can send an image to be uploaded to the community section where you can access it anytime"
].join('\n');
module.exports  = function() {
    this.DialogFlowParameteresHandler=function(senderID, data) {
        //To Handle the search call from the dialogFlow function 
        //TODO : Find a template calling theme for cleaner code
        if (data != "memes" || data != "send meme") {
          if (data == "surprise me") {
            // To access saved memes on my imgur account
            specialMemesFromMyAccount(senderID, data);
            return;
      
          }
          else if (data == "help") {
            tools.sendTextMessage(senderID, help_text);
            return;
      
          }
          else {
            // To allow generic search for any category using the intents from DialogFlow
            saveToFile(2, data, true);
            chooseCaller(2, data, senderID);
      
            return;
          }
        }
        returnedFromDialogFlow = false;
      
      }
      



}