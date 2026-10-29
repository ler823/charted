-- Photos lived in an S3 bucket on the old AWS account, which no longer exists.
-- Clear every reference so the app falls back to initials/placeholders
-- until users upload new photos to the new bucket.

update profiles set avatar_key = null where avatar_key is not null;
update users set photo_id = null where photo_id is not null;
update lists set cover_photo = null where cover_photo is not null;

delete from pin_photos;
delete from photos;
