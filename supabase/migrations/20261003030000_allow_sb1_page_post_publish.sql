-- Allow authenticated SB1 users to create public page posts from the publishing composer.
drop policy if exists "signed in create page posts" on public.sb1_page_posts;
create policy "signed in create page posts"
on public.sb1_page_posts for insert
to authenticated
with check (auth.uid() is not null);
