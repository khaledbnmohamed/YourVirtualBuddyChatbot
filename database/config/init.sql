DROP TABLE IF EXISTS users, GalleryMemes, AccountMemes, SentMemes
CASCADE;

CREATE TABLE users (
  id SERIAL ,
  fb_id VARCHAR PRIMARY KEY,
  rec_images int,
  created_at TIMESTAMP
);
CREATE TABLE GalleryMemes (
    id SERIAL ,
    imgur_id VARCHAR PRIMARY KEY,
    score int,
    created_at TIMESTAMP
);
CREATE TABLE AccountMemes (
    id SERIAL,
    imgur_id VARCHAR PRIMARY KEY,
    score int,
    created_at TIMESTAMP
);

CREATE TABLE SentMemes(
    fb_id VARCHAR REFERENCES users,
    imgur_id_gallery VARCHAR REFERENCES GalleryMemes(imgur_id),
    imgur_id_account VARCHAR REFERENCES AccountMemes(imgur_id),
    PRIMARY KEY (fb_id, imgur_id_gallery,imgur_id_account)
);
INSERT INTO users (fb_id,rec_images)
VALUES  ('15kdas1',1);

INSERT INTO GalleryMemes (imgur_id, score)
VALUES  ('imgur_is', 15644);
