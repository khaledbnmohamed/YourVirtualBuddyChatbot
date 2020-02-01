const
  fs = require('fs'),
  path = require('path'),
  models = require('./../../database/models');

var MemoryArray = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));
var UniqueMemesNumber = 20;

function jsonAppender (jsonStr, image_id) {
  console.log("=============================")
  var obj = JSON.parse(jsonStr);
  console.log(obj['image_id'])
  console.log("=============================")

  obj['image_id'].push({"image_id":image_id});
  console.log(obj)
  jsonStr = JSON.stringify(obj)
  return jsonStr
}

module.exports =
{
  getArraySize: function () {
    return MemoryArray.sentImages.length
  },
  getPrint: function () {
    return MemoryArray.sentImages
  },

  checkIfSentBefore: function (image_id, senderID) {
    models.Memes_Sent.findOne({ where: { fb_id: senderID } }).then(function (record) {
      if (record) {
        console.log("=============================")
        // JSON.stringify(object)
        console.log(JSON.parse(record.imgur_id_gallery))


      }
      else {
        return false;
      }

    })
  },
  sendImageToNewUser: function (image_id, senderID, image_type) {
    var imgur_ids = new Array();
    imgur_ids = imgur_ids.push({image_id});
    console.log(imgur_ids)

    // tools.sendImageMessage(senderID, image_id);
    models.Memes_Sent.create({
      fb_id: senderID,
      imgur_id_gallery: JSON.stringify( imgur_ids)
    }).then(function (record) {
      if (record) {
        return (record);
      } else {
        console.log("ERRRRRRRRRRRRRROR")
      }
    });
  },

  sendImageToExistingUser: function (image_id, senderID, image_type) {
    models.Memes_Sent.findOne({ where: { fb_id: senderID } }).then(function (record) {
      if (record) {
        imgur_ids = image_type == 'gallery' ? jsonAppender(record.imgur_id_gallery, image_id) : jsonAppender(record.imgur_id_account, image_id)
        models.Memes_Sent.update({
          imgur_id_gallery: imgur_ids
        }).then(function (record) {
          if (record) {
            return (record);
          } else {
            console.log("ERRRRRRRRRRRRRROR")
          }
        })
      }
      else {
        console.log("User should have been found !")
      }

    })},

// if (!MemoryArray.sentImages.includes(ImageID)) {
//   //Make sure to have UniqueMemes of certain number before resetting
//   if (MemoryArray.sentImages.length == UniqueMemesNumber) {
//     MemoryArray.sentImages = [];
//     fs.writeFileSync('./inputMemory.json', JSON.stringify(MemoryArray, null, 2), 'utf-8');
//   }
//   //Add Image to Send Array
//   MemoryArray.sentImages.push(ImageID);
//   fs.writeFileSync('./inputMemory.json', JSON.stringify(MemoryArray, null, 2), 'utf-8');
//   console.log("Added to array and Array length Now " + MemoryArray.sentImages.length)
//   return false;
//   //return false indicates that it wasn't sent before and send the link to the user
// }
// return true;
getImageLink: function (data, i, counter) {
      if (counter == -1) {
        counter = 0;
      }
      if (data[i].is_album == true) {
        console.log("link is " + data[i].images[counter].link)
        return data[i].images[counter].link;
      }
      else {
        console.log("link is " + data[i].link)
        return data[i].link;
      }
    },
      imageIDfetchr: function (ImageLink) {
        var urlParts = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(ImageLink);
        ImageID = urlParts[2]; // /path/to/somwhere
        if (path.extname(ImageID) == '.mp4') {
          //Continue Cycling on different resposne if found a video to handle empty response of a video not supported in sending image API
          console.log("Extension " + path.extname(ImageID) + "Is not supported ")
        }
        else {
          console.log("Extension " + path.extname(ImageID) + "is supported ")
        }
        return ImageID;
      },


}