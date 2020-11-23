
// eslint-disable-next-line import/prefer-default-export
export class AppError extends Error {
  //  * Constructs the MyError class
  //  * @param {String} message an error message
  //  * @constructor
  constructor(commonType, description, isOperational, message, userID) {
    super(message);
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
    this.commonType = commonType;
    this.description = description;
    this.isOperational = isOperational;
    this.messageToUser = message;
    this.userID = userID;
  }
}
