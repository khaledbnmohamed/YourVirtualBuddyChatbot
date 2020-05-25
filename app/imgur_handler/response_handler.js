
const SortImagesbyPoints = true;
const uniqueRandoms = [];
let SortedByPointsCounter = 0; // initlize the i globally for easer access so don't have to write extra code to determine if first query to set i =0 or not

let FirstQuery = true;
const { insertToGallery, insertToAccount } = require('../controllers/memes.js');
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
export function formingElements(result, type, senderID, accountImages) {
  const parsed = JSON.parse(result);
  let randomFactor = 70;
  let i = -1;
  if (accountImages) { // smaller range for account uploaded images
    randomFactor = 40;
  }
  /*
        if Condition to check if user chose to sort images by points and cancel the randmoization
        PS: doesn't work with community uploaded images on account images that's why it's added in if condition
        */
  if (SortImagesbyPoints && !accountImages) {
    const Sorted = sortByPoints(parsed);
    if (type === 'gallery') {
      insertToGallery(Sorted);
    } else { insertToAccount(Sorted); }
    let Target = functions.getImageLink(Sorted, SortedByPointsCounter, -1);
    while (functions.checkIfSentBefore(Target, senderID)) {
      // wait until you get a target image that was not sent before to the user
      SortedByPointsCounter += 1;
      Target = functions.getImageLink(Sorted, SortedByPointsCounter, -1);
    }
    return Target;
  }


  if (FirstQuery) {
    FirstQuery = false;
    i = 0;
  } else {
    i = makeUniqueRandom(randomFactor);
  }
  while (parsed.data[i] == null) {
    i = Math.floor((Math.random() * randomFactor) + 1);
  }
  /* to check for images if it belongs to album or not and a special case for
             account API images that doesn't belong to the albums at all  */
  if (parsed.data[i].is_album === true || accountImages === true) {
    counter += 1;
    if (accountImages) {
      return parsed.data[i].link; // Fetched data from personal account are not in albums, single images so no Images variabel at all
    }

    return parsed.data[i].images[0].link;
  }
  if (functions.getImageLink(parsed.data, i, -1)) {
    return functions.getImageLink(parsed.data, i, -1);
  }


  i += 1;

  // Handle Worst case of missed links
  tools.sendTextMessage(senderID, "That's a random empty miss, Try again");
  tools.sendTextMessage(senderID, 'Hopefully you might get your dunk meme this time !');
  return false;
}
