
var SortImagesbyPoints = true;
var uniqueRandoms = [];
var SortedByPointsCounter = 0; // initlize the i globally for easer access so don't have to write extra code to determine if first query to set i =0 or not

var FirstQuery = true;
let counter = 0;
const 
functions = require('./../../helpingFunctions.js'),
tools = require('./../../sendFunctions.js');

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