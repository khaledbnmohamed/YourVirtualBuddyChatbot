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
  appJS = require('./app.js')
  fs = require('fs'),
  tools = require('./sendFunctions.js')



var MemoryArray =JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));

var help_text = [ "You can send me various messages:","=========================="," ",
  "* 'Send meme' -> sends you a fresh meme",  "* 'Sort by time' -> gets you latest memes without considering community's upvotes",  "* 'Sort by points' -> sends you most upvoted memes in choosen category",
    "* 'Memes' -> Quick categories selection",   "* 'Surprise me' -> sends you a meme uploaded by our community", "* You can send an image to be uploaded to the community section where you can access it anytime"
].join('\n');

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

               //Add Image to Send Array
                      
              MemoryArray.sentImages.push(ImageID);
              fs.writeFileSync('./inputMemory.json', JSON.stringify(MemoryArray, null, 2) , 'utf-8');
              console.log("Added to array and Array length Now " + MemoryArray.sentImages.length)
              return false;
              //return false indicates that it wasn't sent before and send the link to the user

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

            console.log("This data is an album so I got the first image link")

            return data[i].images[counter].link;
          }
          
          else {

            console.log("This data is an Image so I sent the Link directly without any changes")

            return data[i].link;

          }
        
          },


           handlePayload: function (payload,senderID) {


        switch (payload) {
          case 'personal_account_memes':

                appJS.specialMemesFromMyAccount(senderID,payload)

                 break;
          case 'send_alike':

                 appJS.sendLike(senderID);
                break;

         case 'do nothing':
                  
                appJS.doNothing(senderID);
                break;

          case 'help':
                  
                tools.sendTextMessage(senderID, help_text);
                break;

         case 'get_started':
                  
            var user_first_name=''
            appJS.getFirstName(senderID,function (err, data) {
               if (err) return console.error(err);
               console.log("dataaaa" +data);
               user_first_name =data
            
                  
            console.log("user_first_name" + user_first_name)
            var message_first_time = ["Hi " + user_first_name +",", "Try me by sending 'Send meme' or 'memes' "].join('\n');
                //present user with some greeting or call to action
                tools.sendTextMessage(senderID,message_first_time );
                                });                

              break;

              default:
              console.log("I should work here")
               manyCategoriesSearch(senderID,payload);

                
    }
    
      }






}