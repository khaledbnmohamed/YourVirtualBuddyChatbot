import redditImageFetcher from 'reddit-image-fetcher';

const { bulkInsertToGallery } = require('../controllers/memes.js');

function responseAdaptor(response) {
  const imagesArray = [];
  response.forEach((item) => {
    if (!item.NSFW) {
      imagesArray.push(
        {
          source_url: item.image,
          source: 'reddit',
          score: 0,
        },
      );
    }
  });
  return imagesArray;
}
// eslint-disable-next-line import/prefer-default-export
export async function RedditImageHandler(senderID) {
  const response = await redditImageFetcher.fetch({
    type: 'memes',
    total: 50,
  });

  const ImagesArray = responseAdaptor(response);
  bulkInsertToGallery(ImagesArray, 'gallery', senderID, 'memes');
}
