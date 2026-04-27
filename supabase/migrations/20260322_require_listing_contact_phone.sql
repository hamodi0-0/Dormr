alter table public.listings
  alter column contact_phone set not null;

alter table public.listings
  drop constraint if exists listings_contact_phone_not_blank;

alter table public.listings
  add constraint listings_contact_phone_not_blank
  check (char_length(btrim(contact_phone)) > 0);
