DROP TABLE IF EXISTS users, gallery_memes, account_memes, memes_sent
CASCADE;

CREATE TABLE users (
  id SERIAL ,
  fb_id VARCHAR PRIMARY KEY,
  rec_images int,
  created_at TIMESTAMP
);
CREATE TABLE gallery_memes (
    id SERIAL ,
    imgur_id VARCHAR PRIMARY KEY,
    score int,
    created_at TIMESTAMP
);
CREATE TABLE account_memes (
    id SERIAL,
    imgur_id VARCHAR PRIMARY KEY,
    score int,
    created_at TIMESTAMP
);

CREATE TABLE memes_sent(
    fb_id VARCHAR REFERENCES users,
    imgur_id_gallery VARCHAR REFERENCES gallery_memes(imgur_id),
    imgur_id_account VARCHAR REFERENCES account_memes(imgur_id),
    PRIMARY KEY (fb_id, imgur_id_gallery,imgur_id_account)
);
INSERT INTO users (fb_id,rec_images)
VALUES  ('15kdas1',1);

INSERT INTO gallery_memes (imgur_id, score)
VALUES  ('imgur_is', 15644);
