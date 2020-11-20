const { bulkInsertToGallery } = require('../controllers/memes.js');

function predicateBy(prop) {
  return function value(a, b) {
    if (a[prop] > b[prop]) {
      return 1;
    } if (a[prop] < b[prop]) {
      return -1;
    }
    return 0;
  };
}

function sortByPoints(parsed) {
  let Sorted = parsed.data.sort(predicateBy('points'));
  Sorted = Sorted.reverse();
  return (Sorted);
}

function responseAdaptor(response) {
  const dailyNumber = 20;
  const imagesArray = [];
  // Need to handle out of array errors
  if (response.length < 1) {
    return true;
  }
  for (let i = 0; i <= dailyNumber; i += 1) {
    imagesArray.push(
      {
        source_url: response[i].is_album === true ? response[i].images[0].link : response[i].link,
        source: 'imgur',
        score: response[i].is_album === true ? response[i].images[0].score : response[i].score,
      },
    );
  }
  return imagesArray;
}


// eslint-disable-next-line import/prefer-default-export
export async function formingElements(result, type, senderID, SearchQuery) {
  const parsed = JSON.parse(result);
  const Sorted = sortByPoints(parsed);
  const ImagesArray = responseAdaptor(Sorted);
  bulkInsertToGallery(ImagesArray, type, senderID, SearchQuery);
}
