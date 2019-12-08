
var SortImagesbyPoints = true;
var uniqueRandoms = [];
var SortedByPointsCounter = 0; // initlize the i globally for easer access so don't have to write extra code to determine if first query to set i =0 or not

var FirstQuery = true;
let counter = 0;
const 
functions = require('./../helpers/helpingFunctions.js'),
tools = require('./../helpers/sendFunctions.js');
require('../controllers/memes.js')();

module.exports  = function() {
    /* 
    formingElements is the function responsible for parsing the  JSON response,choose which image to fetch its link, 
    handles albums and solo images issue and check for duplicated images to make sure not to send to the user the same image twice 
    in a counter of 100 images saved in a SentImages in inputMemory.json file


    */

    this.formingElements= function (result, senderID, accountImages) {
        let parsed = JSON.parse(result)
        let random_factor = 70
        let i = -1;
        if (accountImages) { //smaller range for account uploaded images
            random_factor = 40
        }
        /*
        if Condition to check if user chose to sort images by points and cancel the randmoization 
        PS: doesn't work with community uploaded images on account images that's why it's added in if condition
        */
        if (SortImagesbyPoints && !accountImages) {
            var Sorted = sortByPoints(parsed);
            insert_to_gallery(Sorted)
            var Target = functions.getImageLink(Sorted, SortedByPointsCounter, -1);
            while (functions.checkIfSentBefore(Target)) {
                //wait until you get a target image that was not sent before to the user
                SortedByPointsCounter++;
                Target = functions.getImageLink(Sorted, SortedByPointsCounter, -1);
            }
            return Target;
        }
        else {

            if (FirstQuery) {
                FirstQuery = false;
                i = 0;
            }
            else {
                i = makeUniqueRandom(random_factor)
            }
            while (parsed.data[i] == null) {
                i = Math.floor((Math.random() * random_factor) + 1);
            }
            /* to check for images if it belongs to album or not and a special case for
             account API images that doesn't belong to the albums at all  */
            if (parsed.data[i].is_album == true || accountImages == true) {
                counter = counter + 1;
                if (accountImages) {
                    return parsed.data[i].link //Fetched data from personal account are not in albums, single images so no Images variabel at all
                }
                else {
                    return parsed.data[i].images[0].link
                }
            }
            else if (functions.getImageLink(parsed.data, i, -1)) {

                return functions.getImageLink(parsed.data, i, -1);
            }

            else {
                i++
            }
            //Handle Worst case of missed links
            tools.sendTextMessage(senderID, "That's a random empty miss, Try again")
            tools.sendTextMessage(senderID, "Hopefully you might get your dunk meme this time !")
        }
        return;
    },

    this.makeUniqueRandom = function (numRandoms) {
        // refill the array if needed
        if (!uniqueRandoms.length) {
            for (var i = 0; i < numRandoms; i++) {
                uniqueRandoms.push(i);
            }
        }
        var index = Math.floor(Math.random() * uniqueRandoms.length);
        var val = uniqueRandoms[index];
        // now remove that value from the array
        uniqueRandoms.splice(index, 1);
        return val;
    },
    this.sortByPoints= function (parsed) {
        var Sorted = parsed.data.sort(predicateBy("points"));
        Sorted = Sorted.reverse();
        return (Sorted);

    },

    this.predicateBy= function (prop) {
        return function (a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        }
    }

};
