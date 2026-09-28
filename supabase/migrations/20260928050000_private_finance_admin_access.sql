-- SB1: private wallet/account visibility
-- Owners see their own financial data; moderators/admins/owners may review it.
-- Public/anonymous users must never be able to read financial balances, transactions or rewards.

revoke all on public.sb1_wallets, public.sb1_wallet_transactions, public.sb1_rewards_ledger, public.sb1_commerce_orders from anon;

drop policy if exists "sb1 wallet own" on public.sb1_wallets;
create policy "sb1 wallet own" on public.sb1_wallets
  for all to authenticated
  using (
    account_key=(select auth.uid())::text
    or public.sb1_can_admin('moderator')
  )
  with check (
    account_key=(select auth.uid())::text
    or public.sb1_can_admin('moderator')
  );

drop policy if exists "sb1 wallet transactions own" on public.sb1_wallet_transactions;
create policy "sb1 wallet transactions private" on public.sb1_wallet_transactions
  for select to authenticated
  using (
    account_key=(select auth.uid())::text
    or public.sb1_can_admin('moderator')
  );

drop policy if exists "sb1 rewards own" on public.sb1_rewards_ledger;
create policy "sb1 rewards private" on public.sb1_rewards_ledger
  for select to authenticated
  using (
    account_key=(select auth.uid())::text
    or public.sb1_can_admin('moderator')
  );

drop policy if exists "sb1 commerce orders own" on public.sb1_commerce_orders;
create policy "sb1 commerce orders private" on public.sb1_commerce_orders
  for select to authenticated
  using (
    account_key=(select auth.uid())::text
    or public.sb1_can_admin('moderator')
  );

-- Keep the public profile free of any financial/account information.
comment on table public.sb1_wallets is 'PRIVATE: visible only to wallet owner and SB1 admins/moderators.';
comment on table public.sb1_wallet_transactions is 'PRIVATE: visible only to wallet owner and SB1 admins/moderators.';
comment on table public.sb1_rewards_ledger is 'PRIVATE: visible only to wallet owner and SB1 admins/moderators.';
comment on table public.sb1_commerce_orders is 'PRIVATE: visible only to order owner and SB1 admins/moderators.';
