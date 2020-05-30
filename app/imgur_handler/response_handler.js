
import { sendMemeToUser } from '../controllers/sent_memes';

const uniqueRandoms = [];
const { bulkInsertToGallery } = require('../controllers/memes.js');

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

export function formingElements(result, type, senderID, SearchQuery) {
  const parsed = JSON.parse(result);
  const Sorted = sortByPoints(parsed);
  bulkInsertToGallery(Sorted, type, senderID, SearchQuery, () => {
    sendMemeToUser(senderID); // send to user after bulk add first time
  });
}
