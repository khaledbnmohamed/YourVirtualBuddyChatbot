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
  fs = require('fs')


var MemoryArray =JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));



module.exports = 
{
    /*
   * Call the Send API. The message data goes in the body. If successful, we'll
   * get the message id in a response
   *
   */


     checkIfSentBefore: function (ImageLink) {

    
         
          var urlParts = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(ImageLink);
          ImageID = urlParts[2]; // /path/to/somwhere
          if(!MemoryArray.sentImages.includes(ImageID)){

                   if (MemoryArray.sentImages.length == 70){

                        console.log( " I reseteed the memeory");
                        MemoryArray.sentImages=[];

                        fs.writeFileSync('./inputMemory.json', JSON.stringify(MemoryArray, null, 2) , 'utf-8');

                      }
              MemoryArray.sentImages.push(ImageID);
              fs.writeFileSync('./inputMemory.json', JSON.stringify(MemoryArray, null, 2) , 'utf-8');


              console.log("Array length Now " + MemoryArray.sentImages.length)
              return false;

          }

     
          console.log("It's already there  ");

          return true;
        },

     getImageLink: function (data,i,counter) {

          if (counter ==-1){
            counter=0;
          }

          if(data[i].is_album==true)
          {

            return data[i].images[counter].link;
          }
          
          else {

            return data[i].link;

          }
        
          }





}