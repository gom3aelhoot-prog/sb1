/*
 SB1 — Strict complaints, sanctions, wallet holds and complaint assistant
*/
CREATE TABLE IF NOT EXISTS provider_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  held_balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  is_frozen boolean NOT NULL DEFAULT false,
  frozen_reason text,
  frozen_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider_id)
);
ALTER TABLE provider_wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_wallet_select" ON provider_wallets;
CREATE POLICY "public_wallet_select" ON provider_wallets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_wallet_insert" ON provider_wallets;
CREATE POLICY "public_wallet_insert" ON provider_wallets FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_wallet_update" ON provider_wallets;
CREATE POLICY "public_wallet_update" ON provider_wallets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS sanction_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  penalty_amount numeric NOT NULL DEFAULT 0,
  hold_percent numeric NOT NULL DEFAULT 0,
  freeze_hours integer NOT NULL DEFAULT 0,
  freeze_account boolean NOT NULL DEFAULT false,
  complaint_threshold integer NOT NULL DEFAULT 3,
  review_threshold integer NOT NULL DEFAULT 2,
  compensation_discount_percent numeric NOT NULL DEFAULT 20,
  compensation_free_questions integer NOT NULL DEFAULT 0,
  compensation_free_consultations integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sanction_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_rules_select" ON sanction_rules;
CREATE POLICY "public_rules_select" ON sanction_rules FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_rules_update" ON sanction_rules;
CREATE POLICY "public_rules_update" ON sanction_rules FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO sanction_rules
(rule_key,name,description,penalty_amount,hold_percent,freeze_hours,freeze_account,complaint_threshold,review_threshold,compensation_discount_percent,compensation_free_questions,compensation_free_consultations)
VALUES
('video_no_show','عدم حضور جلسة الفيديو','تطبق عند تسجيل عدم حضور المزود دون عذر مقبول',25,100,72,true,1,0,30,1,1),
('negative_review','تقييم سلبي يحتاج تحقيقاً','يحجز جزء من قيمة الجلسة عند تقييم منخفض غير واضح أو وجود شكوى مرتبطة',0,30,24,false,1,2,20,1,0),
('complaint_threshold','تراكم الشكاوى','تصعيد تلقائي عند تجاوز عدد الشكاوى المحدد خلال الفترة',50,50,168,true,3,0,30,2,1)
ON CONFLICT(rule_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS provider_sanctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  rule_id uuid REFERENCES sanction_rules(id),
  complaint_id uuid,
  session_id uuid,
  sanction_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  freeze_account boolean NOT NULL DEFAULT false,
  frozen_until timestamptz,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE provider_sanctions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_sanctions_select" ON provider_sanctions;
CREATE POLICY "public_sanctions_select" ON provider_sanctions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_sanctions_update" ON provider_sanctions;
CREATE POLICY "auth_sanctions_update" ON provider_sanctions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS session_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  provider_id uuid NOT NULL,
  complaint_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  percent numeric NOT NULL DEFAULT 0,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'held',
  created_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz
);
ALTER TABLE session_holds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_holds_select" ON session_holds;
CREATE POLICY "public_holds_select" ON session_holds FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  customer_email text,
  provider_id uuid,
  session_id uuid,
  rating integer CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  reason_category text NOT NULL DEFAULT 'other',
  description text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  ai_summary text,
  ai_recommendation text,
  customer_requested_resolution text,
  language_code text NOT NULL DEFAULT 'ar',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_complaints_insert" ON complaints;
CREATE POLICY "public_complaints_insert" ON complaints FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_complaints_select" ON complaints;
CREATE POLICY "public_complaints_select" ON complaints FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_complaints_update" ON complaints;
CREATE POLICY "auth_complaints_update" ON complaints FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS complaint_assistant_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  automatic boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE complaint_assistant_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_assistant_actions_insert" ON complaint_assistant_actions;
CREATE POLICY "public_assistant_actions_insert" ON complaint_assistant_actions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_assistant_actions_select" ON complaint_assistant_actions;
CREATE POLICY "public_assistant_actions_select" ON complaint_assistant_actions FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS compensation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE SET NULL,
  code text UNIQUE NOT NULL,
  discount_percent numeric NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 30),
  free_questions integer NOT NULL DEFAULT 0,
  free_consultations integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  max_uses integer NOT NULL DEFAULT 1,
  uses integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE compensation_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_codes_select" ON compensation_codes;
CREATE POLICY "public_codes_select" ON compensation_codes FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS complaint_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid,
  actor_type text NOT NULL DEFAULT 'system',
  actor_id text,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE complaint_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_audit_select" ON complaint_audit_log;
CREATE POLICY "public_audit_select" ON complaint_audit_log FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION sb1_apply_sanction(
  p_provider_id uuid,
  p_rule_key text,
  p_reason text,
  p_complaint_id uuid DEFAULT NULL,
  p_session_id uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE r sanction_rules%ROWTYPE; w provider_wallets%ROWTYPE; sid uuid; until_at timestamptz;
BEGIN
 SELECT * INTO r FROM sanction_rules WHERE rule_key=p_rule_key AND enabled=true LIMIT 1;
 IF r.id IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','rule_disabled'); END IF;
 INSERT INTO provider_wallets(provider_id) VALUES(p_provider_id) ON CONFLICT(provider_id) DO NOTHING;
 SELECT * INTO w FROM provider_wallets WHERE provider_id=p_provider_id FOR UPDATE;
 IF r.freeze_hours > 0 THEN until_at:=now()+make_interval(hours=>r.freeze_hours); ELSE until_at:=NULL; END IF;
 UPDATE provider_wallets SET
   balance=GREATEST(0,balance-r.penalty_amount),
   is_frozen=CASE WHEN r.freeze_account THEN true ELSE is_frozen END,
   frozen_reason=CASE WHEN r.freeze_account THEN p_reason ELSE frozen_reason END,
   frozen_at=CASE WHEN r.freeze_account THEN now() ELSE frozen_at END,
   updated_at=now()
 WHERE provider_id=p_provider_id;
 INSERT INTO provider_sanctions(provider_id,rule_id,complaint_id,session_id,sanction_type,amount,freeze_account,frozen_until,reason)
 VALUES(p_provider_id,r.id,p_complaint_id,p_session_id,p_rule_key,r.penalty_amount,r.freeze_account,until_at,p_reason) RETURNING id INTO sid;
 INSERT INTO complaint_audit_log(complaint_id,actor_type,action,details)
 VALUES(p_complaint_id,'system','automatic_sanction',jsonb_build_object('rule',p_rule_key,'amount',r.penalty_amount,'freeze',r.freeze_account));
 RETURN jsonb_build_object('ok',true,'sanction_id',sid,'amount',r.penalty_amount,'frozen_until',until_at);
END $$;

CREATE OR REPLACE FUNCTION sb1_process_complaint(
  p_customer_name text,
  p_customer_email text,
  p_provider_id uuid,
  p_session_id uuid,
  p_rating integer,
  p_reason_category text,
  p_description text,
  p_severity text,
  p_language text,
  p_requested_resolution text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE cid uuid; r sanction_rules%ROWTYPE; recent_count integer; hold_amount numeric:=0; code text:=NULL; discount numeric:=0; freeq integer:=0; freec integer:=0; maxd numeric;
BEGIN
 INSERT INTO complaints(customer_name,customer_email,provider_id,session_id,rating,reason_category,description,severity,language_code,customer_requested_resolution)
 VALUES(p_customer_name,p_customer_email,p_provider_id,p_session_id,p_rating,p_reason_category,p_description,p_severity,p_language,p_requested_resolution) RETURNING id INTO cid;
 IF p_provider_id IS NOT NULL THEN
   SELECT count(*) INTO recent_count FROM complaints WHERE provider_id=p_provider_id AND created_at>now()-interval '30 days';
   IF p_rating IS NOT NULL AND p_rating<=2 THEN
     SELECT * INTO r FROM sanction_rules WHERE rule_key='negative_review' AND enabled=true;
     IF r.id IS NOT NULL AND p_session_id IS NOT NULL THEN
       SELECT COALESCE(vs.price,0)*r.hold_percent/100 INTO hold_amount FROM video_sessions vs WHERE vs.id=p_session_id;
       IF hold_amount>0 THEN INSERT INTO session_holds(session_id,provider_id,complaint_id,amount,percent,reason) VALUES(p_session_id,p_provider_id,cid,hold_amount,r.hold_percent,'تقييم منخفض مرتبط بشكوى'); END IF;
       PERFORM sb1_apply_sanction(p_provider_id,'negative_review','تقييم منخفض يحتاج تحقيقاً',cid,p_session_id);
     END IF;
   END IF;
   IF recent_count >= (SELECT complaint_threshold FROM sanction_rules WHERE rule_key='complaint_threshold') THEN
     PERFORM sb1_apply_sanction(p_provider_id,'complaint_threshold','تراكم شكاوى خلال 30 يوماً',cid,p_session_id);
   END IF;
 END IF;
 SELECT compensation_discount_percent,compensation_free_questions,compensation_free_consultations INTO discount,freeq,freec FROM sanction_rules WHERE rule_key=CASE WHEN p_severity='high' THEN 'complaint_threshold' ELSE 'negative_review' END AND enabled=true LIMIT 1;
 SELECT LEAST(30,COALESCE(discount,0)) INTO maxd;
 IF maxd>0 OR freeq>0 OR freec>0 THEN
   code:='SB1-'||upper(substr(md5(cid::text||clock_timestamp()::text),1,10));
   INSERT INTO compensation_codes(complaint_id,code,discount_percent,free_questions,free_consultations,expires_at)
   VALUES(cid,code,maxd,freeq,freec,now()+interval '30 days');
   INSERT INTO complaint_assistant_actions(complaint_id,action_type,action_payload)
   VALUES(cid,'automatic_compensation',jsonb_build_object('code',code,'discount_percent',maxd,'free_questions',freeq,'free_consultations',freec));
 END IF;
 INSERT INTO complaint_audit_log(complaint_id,actor_type,action,details)
 VALUES(cid,'system','complaint_received',jsonb_build_object('severity',p_severity,'rating',p_rating,'category',p_reason_category));
 RETURN jsonb_build_object('ok',true,'complaint_id',cid,'compensation_code',code,'discount_percent',maxd,'free_questions',freeq,'free_consultations',freec);
END $$;

CREATE OR REPLACE FUNCTION sb1_handle_video_no_show()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
 IF NEW.status='no_show' AND COALESCE(OLD.status,'')<>'no_show' AND NEW.doctor_id IS NOT NULL THEN
   PERFORM sb1_apply_sanction(NEW.doctor_id,'video_no_show','عدم حضور جلسة الفيديو دون عذر مسجل',NULL,NEW.id);
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_sb1_video_no_show ON video_sessions;
CREATE TRIGGER trg_sb1_video_no_show AFTER UPDATE OF status ON video_sessions FOR EACH ROW EXECUTE FUNCTION sb1_handle_video_no_show();

CREATE OR REPLACE FUNCTION sb1_provider_freeze_status(p_provider_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER AS $$
 SELECT jsonb_build_object('is_frozen',COALESCE(is_frozen,false),'reason',frozen_reason,'frozen_at',frozen_at) FROM provider_wallets WHERE provider_id=p_provider_id;
$$;
