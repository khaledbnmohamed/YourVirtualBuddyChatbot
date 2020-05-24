const
  fs = require('fs');
const path = require('path');
const models = require('../../database/models');

const MemoryArray = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));
const UniqueMemesNumber = 20;

function jsonAppender(jsonStr, imageId) {
  console.log('=============================');
  const obj = JSON.parse(jsonStr);
  console.log(obj.imageId);
  console.log('=============================');

  obj.imageId.push({ imageId });
  console.log(obj);
  jsonStr = JSON.stringify(obj);
  return jsonStr;
}

module.exports = {
  getArraySize() {
    return MemoryArray.sentImages.length;
  },
  getPrint() {
    return MemoryArray.sentImages;
  },

  checkIfSentBefore(imageId, senderID) {
    models.SentMemes.findOne({ where: { fb_id: senderID } }).then((record) => {
      if (record) {
        console.log('=============================');
        // JSON.stringify(object)
        console.log(JSON.parse(record.imgur_id_gallery));
      } else {
        return false;
      }
    });
  },
  sendImageToNewUser(imageId, senderID, imageType) {
    let imgurIds = new Array();
    imgurIds = imgurIds.push({ imageId });
    console.log(imgurIds);

    // tools.sendImageMessage(senderID, imageId);
    models.SentMemes.create({
      fb_id: senderID,
      imgur_id_gallery: JSON.stringify(imgurIds),
    }).then((record) => {
      if (record) {
        return (record);
      }
      console.log('ERRRRRRRRRRRRRROR');
    });
  },

  sendImageToExistingUser(imageId, senderID, imageType) {
    models.SentMemes.findOne({ where: { fb_id: senderID } }).then((record) => {
      if (record) {
        imgurIds = imageType === 'gallery' ? jsonAppender(record.imgur_id_gallery, imageId) : jsonAppender(record.imgur_id_account, imageId);
        models.SentMemes.update({
          imgur_id_gallery: imgurIds,
        }).then((record) => {
          if (record) {
            return (record);
          }
          console.log('ERRRRRRRRRRRRRROR');
        });
      } else {
        console.log('User should have been found !');
      }
    });
  },

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
  getImageLink(data, i, counter) {
    if (counter == -1) {
      counter = 0;
    }
    if (data[i].is_album == true) {
      console.log(`link is ${data[i].images[counter].link}`);
      return data[i].images[counter].link;
    }
    console.log(`link is ${data[i].link}`);
    return data[i].link;
  },
  imageIDfetchr(ImageLink) {
    const urlParts = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(ImageLink);
    ImageID = urlParts[2]; // /path/to/somwhere
    if (path.extname(ImageID) == '.mp4') {
      // Continue Cycling on different resposne if found a video to handle empty response of a video not supported in sending image API
      console.log(`Extension ${path.extname(ImageID)}Is not supported `);
    } else {
      console.log(`Extension ${path.extname(ImageID)}is supported `);
    }
    return ImageID;
  },


};
