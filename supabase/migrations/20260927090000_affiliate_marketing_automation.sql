/*
 SB1 Affiliate Matrix + Marketing Automation
 Commissions are tied to qualified purchases/content sales, not recruitment alone.
*/
CREATE TABLE IF NOT EXISTS affiliate_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  name text NOT NULL,
  email text,
  member_type text NOT NULL DEFAULT 'client',
  referral_code text NOT NULL UNIQUE,
  parent_id uuid REFERENCES affiliate_members(id) ON DELETE SET NULL,
  level integer NOT NULL DEFAULT 0,
  country_code text,
  language_code text NOT NULL DEFAULT 'ar',
  points integer NOT NULL DEFAULT 0,
  wallet_balance numeric(12,2) NOT NULL DEFAULT 0,
  total_sales numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_members_parent ON affiliate_members(parent_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_members_code ON affiliate_members(referral_code);

CREATE TABLE IF NOT EXISTS affiliate_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES affiliate_members(id) ON DELETE CASCADE,
  source_member_id uuid REFERENCES affiliate_members(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  source_id text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 0,
  commission numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'confirmed',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_events_member ON affiliate_events(member_id, created_at DESC);

CREATE TABLE IF NOT EXISTS affiliate_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level integer NOT NULL UNIQUE,
  commission_percent numeric(6,3) NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO affiliate_rules(level,commission_percent,points) VALUES
(1,5,100),(2,3,60),(3,2,40),(4,1,20),(5,0.5,10)
ON CONFLICT(level) DO NOTHING;

CREATE TABLE IF NOT EXISTS marketing_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT false,
  account_name text,
  account_id text,
  language_code text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  source_id text,
  language_code text NOT NULL DEFAULT 'ar',
  title text NOT NULL,
  body text NOT NULL,
  media_url text,
  target_providers text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'queued',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_marketing_queue_status ON marketing_queue(status,created_at);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  language_code text NOT NULL DEFAULT 'ar',
  country_code text,
  is_active boolean NOT NULL DEFAULT true,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  language_code text NOT NULL DEFAULT 'ar',
  body_html text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  scheduled_for timestamptz,
  sent_at timestamptz,
  recipient_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE affiliate_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['affiliate_members','affiliate_events','affiliate_rules','marketing_connections','marketing_queue','newsletter_subscribers','newsletter_campaigns'] LOOP
   EXECUTE format('DROP POLICY IF EXISTS "sb1_public_read_%s" ON %I',t,t);
   EXECUTE format('CREATE POLICY "sb1_public_read_%s" ON %I FOR SELECT TO anon,authenticated USING (true)',t,t);
   EXECUTE format('DROP POLICY IF EXISTS "sb1_public_write_%s" ON %I',t,t);
   EXECUTE format('CREATE POLICY "sb1_public_write_%s" ON %I FOR INSERT TO anon,authenticated WITH CHECK (true)',t,t);
   EXECUTE format('DROP POLICY IF EXISTS "sb1_public_update_%s" ON %I',t,t);
   EXECUTE format('CREATE POLICY "sb1_public_update_%s" ON %I FOR UPDATE TO anon,authenticated USING (true) WITH CHECK (true)',t,t);
 END LOOP;
END $$;
