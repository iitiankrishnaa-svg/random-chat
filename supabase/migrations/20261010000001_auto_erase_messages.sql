-- 1. Function to immediately delete messages from ended sessions
-- AND delete any messages older than 5 minutes to keep Supabase 100% free of bloat!

CREATE OR REPLACE FUNCTION public.cleanup_expired_messages()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
    -- Purge messages older than 5 minutes
    DELETE FROM public.messages
    WHERE created_at < (timezone('utc'::text, now()) - INTERVAL '5 minutes');

    -- Purge all messages from ended sessions
    DELETE FROM public.messages
    WHERE session_id IN (
        SELECT id FROM public.chat_sessions WHERE status = 'ended'
    );
END;
$func$;

-- 2. Update end_session to IMMEDIATELY erase all messages for this session from the root
CREATE OR REPLACE FUNCTION public.end_session(p_session_id UUID, p_reason TEXT DEFAULT 'left')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    -- Mark session ended
    UPDATE public.chat_sessions
    SET status = 'ended',
        ended_at = timezone('utc'::text, now()),
        end_reason = p_reason
    WHERE id = p_session_id
      AND status = 'active'
      AND (user_a = v_user_id OR user_b = v_user_id OR public.is_admin(v_user_id));

    -- IMMEDIATELY ERASE ALL MESSAGES FOR THIS SESSION FROM THE ROOT!
    DELETE FROM public.messages WHERE session_id = p_session_id;

    -- Also clean up any general messages older than 5 minutes
    PERFORM public.cleanup_expired_messages();

    RETURN FOUND;
END;
$func$;

-- 3. Update send_message so every sent message automatically prunes messages older than 5 minutes
CREATE OR REPLACE FUNCTION public.send_message(p_session_id UUID, p_body TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
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

    -- Rate Limit check
    SELECT COUNT(*) INTO v_recent_count FROM public.messages
    WHERE sender_id = v_user_id AND created_at > (timezone('utc'::text, now()) - INTERVAL '3 seconds');
    IF v_recent_count >= 5 THEN RAISE EXCEPTION 'Rate limit exceeded: please slow down'; END IF;

    -- Insert new message
    INSERT INTO public.messages (session_id, sender_id, body)
    VALUES (p_session_id, v_user_id, v_clean_body)
    RETURNING id INTO v_msg_id;

    -- Erase messages in this session that are older than 5 minutes!
    DELETE FROM public.messages
    WHERE session_id = p_session_id
      AND created_at < (timezone('utc'::text, now()) - INTERVAL '5 minutes');

    RETURN jsonb_build_object('id', v_msg_id, 'session_id', p_session_id, 'created_at', timezone('utc'::text, now()));
END;
$func$;

-- 4. Trigger to erase messages automatically on session termination
CREATE OR REPLACE FUNCTION public.trigger_delete_messages_on_session_end()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
    IF NEW.status = 'ended' THEN
        DELETE FROM public.messages WHERE session_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_delete_messages_on_session_end ON public.chat_sessions;
CREATE TRIGGER trg_delete_messages_on_session_end
AFTER UPDATE OF status ON public.chat_sessions
FOR EACH ROW
WHEN (NEW.status = 'ended')
EXECUTE FUNCTION public.trigger_delete_messages_on_session_end();
