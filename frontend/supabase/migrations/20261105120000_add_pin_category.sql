-- Place category (Google Places primaryTypeDisplayName, e.g. "Coffee Shop"),
-- shown on pin cards. Saved when a pin is created/edited from a Google place;
-- older pins are filled in lazily by the app.
alter table pins add column if not exists category text;
