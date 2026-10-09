-- StrangerSpace Database Schema & Concurrency Migrations
-- Designed for PostgreSQL 15+ / Supabase

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'eligible' CHECK (status IN ('eligible', 'restricted', 'banned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. POLICY ACCEPTANCES TABLE
CREATE TABLE IF NOT EXISTS public.policy_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_type TEXT NOT NULL CHECK (policy_type IN ('terms_and_age', 'privacy_policy', 'community_guidelines')),
    policy_version TEXT NOT NULL DEFAULT '1.0.0',
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_policy UNIQUE (user_id, policy_type, policy_version)
);

-- 3. MATCH QUEUE TABLE
CREATE TABLE IF NOT EXISTS public.match_queue (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled')),
    matched_session_id UUID,
    queued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_match_queue_waiting ON public.match_queue(queued_at) WHERE status = 'waiting';

-- 4. CHAT SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMPTZ,
    end_reason TEXT CHECK (end_reason IN ('left', 'skipped', 'reported', 'blocked', 'timeout', 'moderated')),
    CONSTRAINT chk_different_users CHECK (user_a <> user_b)
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_a ON public.chat_sessions(user_a) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_b ON public.chat_sessions(user_b) WHERE status = 'active';

-- 5. BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.blocks (
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT chk_no_self_block CHECK (blocker_id <> blocked_id)
);

-- 6. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
    reason_code TEXT NOT NULL CHECK (reason_code IN ('harassment', 'spam', 'threat', 'inappropriate', 'underage', 'other')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMPTZ,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at DESC);

-- 7. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_messages_session ON public.messages(session_id, created_at ASC);

-- 8. USER RESTRICTIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked'))
);

-- 9. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = p_user_id);
$$;

-- RLS POLICIES
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own policy acceptances" ON public.policy_acceptances FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can accept policies" ON public.policy_acceptances FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own queue state" ON public.match_queue FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own queue entry" ON public.match_queue FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Participants view their sessions" ON public.chat_sessions FOR SELECT TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b OR public.is_admin(auth.uid()));

CREATE POLICY "Users view own blocks" ON public.blocks FOR SELECT TO authenticated USING (auth.uid() = blocker_id);
CREATE POLICY "Users can block someone" ON public.blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can unblock someone" ON public.blocks FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

CREATE POLICY "Users create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users view own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admins update reports" ON public.reports FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Participants view messages in session" ON public.messages FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = messages.session_id AND (s.user_a = auth.uid() OR s.user_b = auth.uid())) OR public.is_admin(auth.uid())
);
CREATE POLICY "Participants insert messages in active session" ON public.messages FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = messages.session_id AND s.status = 'active' AND (s.user_a = auth.uid() OR s.user_b = auth.uid()))
);

CREATE POLICY "Users view own restrictions" ON public.user_restrictions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage restrictions" ON public.user_restrictions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins view admin list" ON public.admins FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- RPC FUNCTIONS
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_profile RECORD;
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    INSERT INTO public.profiles (user_id, status)
    VALUES (v_user_id, 'eligible')
    ON CONFLICT (user_id) DO UPDATE SET updated_at = timezone('utc'::text, now())
    RETURNING * INTO v_profile;
    RETURN jsonb_build_object('user_id', v_profile.user_id, 'status', v_profile.status);
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_policy(p_policy_type TEXT, p_version TEXT DEFAULT '1.0.0')
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    INSERT INTO public.policy_acceptances (user_id, policy_type, policy_version)
    VALUES (v_user_id, p_policy_type, p_version)
    ON CONFLICT (user_id, policy_type, policy_version) DO NOTHING;
    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_match()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_user_status TEXT;
    v_active_session_id UUID;
    v_partner_id UUID;
    v_session_id UUID;
    v_already_matched_session_id UUID;
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    SELECT status INTO v_user_status FROM public.profiles WHERE user_id = v_user_id;
    IF v_user_status IS NOT NULL AND v_user_status <> 'eligible' THEN
        RETURN jsonb_build_object('status', 'restricted', 'reason', 'Account restricted');
    END IF;

    SELECT id INTO v_active_session_id
    FROM public.chat_sessions
    WHERE status = 'active' AND (user_a = v_user_id OR user_b = v_user_id)
    LIMIT 1;

    IF v_active_session_id IS NOT NULL THEN
        RETURN jsonb_build_object('status', 'matched', 'session_id', v_active_session_id);
    END IF;

    SELECT matched_session_id INTO v_already_matched_session_id
    FROM public.match_queue
    WHERE user_id = v_user_id AND status = 'matched';

    IF v_already_matched_session_id IS NOT NULL THEN
        DELETE FROM public.match_queue WHERE user_id = v_user_id;
        RETURN jsonb_build_object('status', 'matched', 'session_id', v_already_matched_session_id);
    END IF;

    SELECT mq.user_id INTO v_partner_id
    FROM public.match_queue mq
    JOIN public.profiles p ON p.user_id = mq.user_id
    WHERE mq.status = 'waiting'
      AND mq.user_id <> v_user_id
      AND p.status = 'eligible'
      AND NOT EXISTS (
          SELECT 1 FROM public.blocks b
          WHERE (b.blocker_id = v_user_id AND b.blocked_id = mq.user_id)
             OR (b.blocker_id = mq.user_id AND b.blocked_id = v_user_id)
      )
      AND mq.queued_at > (timezone('utc'::text, now()) - INTERVAL '10 minutes')
    ORDER BY mq.queued_at ASC
    FOR UPDATE OF mq SKIP LOCKED
    LIMIT 1;

    IF v_partner_id IS NOT NULL THEN
        INSERT INTO public.chat_sessions (user_a, user_b, status)
        VALUES (v_user_id, v_partner_id, 'active')
        RETURNING id INTO v_session_id;

        UPDATE public.match_queue
        SET status = 'matched', matched_session_id = v_session_id, updated_at = timezone('utc'::text, now())
        WHERE user_id = v_partner_id;

        DELETE FROM public.match_queue WHERE user_id = v_user_id;

        RETURN jsonb_build_object('status', 'matched', 'session_id', v_session_id);
    ELSE
        INSERT INTO public.match_queue (user_id, status, queued_at, updated_at)
        VALUES (v_user_id, 'waiting', timezone('utc'::text, now()), timezone('utc'::text, now()))
        ON CONFLICT (user_id) DO UPDATE SET
            status = 'waiting',
            matched_session_id = NULL,
            updated_at = timezone('utc'::text, now());

        RETURN jsonb_build_object('status', 'waiting');
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_queue_status()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_mq RECORD;
    v_session_id UUID;
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    SELECT * INTO v_mq FROM public.match_queue WHERE user_id = v_user_id;
    IF NOT FOUND THEN
        SELECT id INTO v_session_id FROM public.chat_sessions
        WHERE status = 'active' AND (user_a = v_user_id OR user_b = v_user_id)
        LIMIT 1;
        IF v_session_id IS NOT NULL THEN
            RETURN jsonb_build_object('status', 'matched', 'session_id', v_session_id);
        END IF;
        RETURN jsonb_build_object('status', 'idle');
    END IF;

    IF v_mq.status = 'matched' AND v_mq.matched_session_id IS NOT NULL THEN
        DELETE FROM public.match_queue WHERE user_id = v_user_id;
        RETURN jsonb_build_object('status', 'matched', 'session_id', v_mq.matched_session_id);
    ELSIF v_mq.status = 'waiting' THEN
        RETURN jsonb_build_object('status', 'waiting');
    ELSE
        RETURN jsonb_build_object('status', 'idle');
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_queue()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN RETURN FALSE; END IF;
    DELETE FROM public.match_queue WHERE user_id = v_user_id;
    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.end_session(p_session_id UUID, p_reason TEXT DEFAULT 'left')
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    UPDATE public.chat_sessions
    SET status = 'ended',
        ended_at = timezone('utc'::text, now()),
        end_reason = p_reason
    WHERE id = p_session_id
      AND status = 'active'
      AND (user_a = v_user_id OR user_b = v_user_id OR public.is_admin(v_user_id));
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.block_session_partner(p_session_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_partner_id UUID;
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    SELECT CASE WHEN user_a = v_user_id THEN user_b ELSE user_a END INTO v_partner_id
    FROM public.chat_sessions
    WHERE id = p_session_id AND (user_a = v_user_id OR user_b = v_user_id);

    IF v_partner_id IS NOT NULL THEN
        INSERT INTO public.blocks (blocker_id, blocked_id)
        VALUES (v_user_id, v_partner_id)
        ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

        PERFORM public.end_session(p_session_id, 'blocked');
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.report_session_partner(
    p_session_id UUID,
    p_reason_code TEXT,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_partner_id UUID;
    v_report_id UUID;
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    SELECT CASE WHEN user_a = v_user_id THEN user_b ELSE user_a END INTO v_partner_id
    FROM public.chat_sessions
    WHERE id = p_session_id AND (user_a = v_user_id OR user_b = v_user_id);

    IF v_partner_id IS NULL THEN RAISE EXCEPTION 'Session not found or user not participant'; END IF;

    INSERT INTO public.reports (reporter_id, reported_id, session_id, reason_code, description, status)
    VALUES (v_user_id, v_partner_id, p_session_id, p_reason_code, p_description, 'pending')
    RETURNING id INTO v_report_id;

    PERFORM public.end_session(p_session_id, 'reported');
    RETURN v_report_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_message(p_session_id UUID, p_body TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_session RECORD;
    v_recent_count INT;
    v_clean_body TEXT;
    v_msg_id UUID;
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    v_clean_body := trim(p_body);
    IF char_length(v_clean_body) = 0 THEN RAISE EXCEPTION 'Message body cannot be empty'; END IF;
    IF char_length(v_clean_body) > 1000 THEN RAISE EXCEPTION 'Message exceeds 1000 characters limit'; END IF;

    SELECT * INTO v_session FROM public.chat_sessions WHERE id = p_session_id;
    IF NOT FOUND OR v_session.status <> 'active' THEN RAISE EXCEPTION 'Session is not active'; END IF;
    IF v_session.user_a <> v_user_id AND v_session.user_b <> v_user_id THEN RAISE EXCEPTION 'Not authorized'; END IF;

    SELECT COUNT(*) INTO v_recent_count FROM public.messages
    WHERE sender_id = v_user_id AND created_at > (timezone('utc'::text, now()) - INTERVAL '3 seconds');
    IF v_recent_count >= 5 THEN RAISE EXCEPTION 'Rate limit exceeded: please slow down'; END IF;

    INSERT INTO public.messages (session_id, sender_id, body)
    VALUES (p_session_id, v_user_id, v_clean_body)
    RETURNING id INTO v_msg_id;

    RETURN jsonb_build_object('id', v_msg_id, 'session_id', p_session_id, 'created_at', timezone('utc'::text, now()));
END;
$$;
