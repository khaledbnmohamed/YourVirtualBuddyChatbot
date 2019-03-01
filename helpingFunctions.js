// 'module.exports' is a node.JS specific feature, it does not work with regular JavaScript

//Holding ALL send functions in the bots for easier use

const
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request'),
  fs = require('fs')



var ImageLink = 'https://i.imgur.com/KZC2CW9.jpg'
var clientId = '8056e5db3f369d1'
var imgur_access_token = '2a8f6dacd57b657d8f9542b166724964c1ed8f8f'
var imgur_username = 'khaledbnmohamed'
var FirstQuery = true;
let counter = 0;
var default_text = [ "You know that no matter how cool I am to you,",
  " at the end I'm a preprogrammed meme sender so please don't ask me for neither commitment or Anything I don't understand.",
  " Just type SEND MEME"
].join('\n');
 

var app = express();
app.set('port', process.env.PORT || 5000);


var MemoryArray =JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));


// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

module.exports = 
{
    /*
   * Call the Send API. The message data goes in the body. If successful, we'll
   * get the message id in a response
   *
   */


     checkIfSentBefore: function (next, [recipientId, ...args]) {
    fileObject.function_number=number;
    fileObject.seach_word= word;
    fileObject.want_more=want_more;
    fs.writeFileSync('./inputMemory.json', JSON.stringify(fileObject, null, 2) , 'utf-8');


  }


}