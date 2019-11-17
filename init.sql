CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  memes_no INTEGER NOT NULL,
  memes_links VARCHAR(255) NOT NULL
);

INSERT INTO users (memes_no, memes_links)
VALUES  (15, 'linkyoooo');