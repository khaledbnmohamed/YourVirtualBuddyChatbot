// 'module.exports' is a node.JS specific feature, it does not work with regular JavaScript

//Holding ALL send functions in the bots for easier use

const
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request'),
  URL = require('url'),
  fs = require('fs'),
  path = require('path'),
  tools = require('./sendFunctions.js')




var MemoryArray = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));
var UniqueMemesNumber = 20;
var help_text = ["You can send me various messages:", "==========================", " ",
  "* 'Send meme' -> sends you a fresh meme", "* 'Sort by time' -> gets you latest memes without considering community's upvotes", "* 'Sort by points' -> sends you most upvoted memes in choosen category",
  "* 'Memes' -> Quick categories selection", "* 'Surprise me' -> sends you a meme uploaded by our community", "* You can send an image to be uploaded to the community section where you can access it anytime"
].join('\n');



module.exports =
  {
    /*
   * Call the Send API. The message data goes in the body. If successful, we'll
   * get the message id in a response
   *
   */
  getArraySize: function () {
    return MemoryArray.sentImages.length
  },
  getPrint: function () {
    return MemoryArray.sentImages
  },

    checkIfSentBefore: function (ImageLink) {



      var urlParts = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(ImageLink);
      ImageID = urlParts[2]; // /path/to/somwhere

      if (path.extname(ImageID) == '.mp4') {

        //Continue Cycling on different resposne if found a video to handle empty response of a video not supported in sending image API

        console.log("Extension " + path.extname(ImageID) + "Is not supported ")

        return true;

      }
      if (!MemoryArray.sentImages.includes(ImageID)) {

        //Make sure to have UniqueMemes of certain number before resetting
        if (MemoryArray.sentImages.length == UniqueMemesNumber) {

          console.log(" I reseteed the memeory");
          MemoryArray.sentImages = [];

          fs.writeFileSync('./inputMemory.json', JSON.stringify(MemoryArray, null, 2), 'utf-8');

        }

        //Add Image to Send Array

        MemoryArray.sentImages.push(ImageID);
        fs.writeFileSync('./inputMemory.json', JSON.stringify(MemoryArray, null, 2), 'utf-8');
        console.log("Added to array and Array length Now " + MemoryArray.sentImages.length)
        return false;
        //return false indicates that it wasn't sent before and send the link to the user

      }

      console.log("MemoryArray.sentImages.ImageID " + ImageID);
      console.log("It's already there and Array length is " + MemoryArray.sentImages.length)

      return true;
    },

    getImageLink: function (data, i, counter) {


      if (counter == -1) {
        counter = 0;
      }

      if (data[i].is_album == true) {

        console.log("This data is an album so I got the first image link")
        console.log("link is " + data[i].images[counter].link)
        return data[i].images[counter].link;
      }

      else {

        console.log("This data is an Image so I sent the Link directly without any changes")
        console.log("link is " + data[i].link)

        return data[i].link;

      }

    }








  }