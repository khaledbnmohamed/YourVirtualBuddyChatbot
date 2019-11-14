var SortImagesbyPoints = true;
var uniqueRandoms = [];
var SortedByPointsCounter = 0; // initlize the i globally for easer access so don't have to write extra code to determine if first query to set i =0 or not

var FirstQuery = true;
let counter = 0;
require('./imgur_handler/api_consumer.js')();

const
  tools = require('../sendFunctions.js'),
  fileObject = JSON.parse(fs.readFileSync('./../inputMemory.json', 'utf8'));

module.exports = function () {

  this.saveToFile = function (number, word, want_more) {

    fileObject.function_number = number;
    fileObject.seach_word = word;
    fileObject.want_more = want_more;
    fs.writeFileSync('./../inputMemory.json', JSON.stringify(fileObject, null, 2), 'utf-8');

  }
  this.chooseCaller = function (function_number, last_input_search_word, senderID) {
    /* 
    1== for personal account api
    2== gallery
     */
    if (last_input_search_word == null) {
      last_input_search_word = "memes";  //special case for send meme
      console.log("last_input_search_word " + last_input_search_word)
    }
    if (function_number == 1) {

      personal_images_consumer(senderID, last_input_search_word);
      return;

    }
    else if (function_number == 2) {

      public_images_consumer(senderID, last_input_search_word);
      return;

    }
  }



}