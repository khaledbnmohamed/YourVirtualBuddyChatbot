
import { sendMemeToUser } from '../controllers/sent_memes';

const SortImagesbyPoints = true;
const uniqueRandoms = [];
const SortedByPointsCounter = 0; // initlize the i globally for easer access so don't have to write extra code to determine if first query to set i =0 or not

let FirstQuery = true;
const { bulkInsertToGallery } = require('../controllers/memes.js');
const functions = require('../helpers/helpingFunctions.js');
const tools = require('../helpers/sendFunctions.js');

export function predicateBy(prop) {
  return function value(a, b) {
    if (a[prop] > b[prop]) {
      return 1;
    } if (a[prop] < b[prop]) {
      return -1;
    }
    return 0;
  };
}

export function sortByPoints(parsed) {
  let Sorted = parsed.data.sort(predicateBy('points'));
  Sorted = Sorted.reverse();
  return (Sorted);
}

export function makeUniqueRandom(numRandoms) {
  // refill the array if needed
  if (!uniqueRandoms.length) {
    for (let i = 0; i < numRandoms; i += 1) {
      uniqueRandoms.push(i);
    }
  }
  const index = Math.floor(Math.random() * uniqueRandoms.length);
  const val = uniqueRandoms[index];
  // now remove that value from the array
  uniqueRandoms.splice(index, 1);
  return val;
}

/*
    formingElements is the function responsible for parsing the  JSON response,choose which image to fetch its link,
    handles albums and solo images issue and check for duplicated images to make sure not to send to the user the same image twice
    in a counter of 100 images saved in a SentImages in inputMemory.json file
    */
export function formingElements(result, type, senderID) {
  const parsed = JSON.parse(result);
  const Sorted = sortByPoints(parsed);
  bulkInsertToGallery(Sorted, type);
  sendMemeToUser(senderID);
}
