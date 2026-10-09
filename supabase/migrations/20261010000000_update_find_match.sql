-- Update find_match: End any lingering previous session first before seeking new match!
CREATE OR REPLACE FUNCTION public.find_match()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $func$
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

    -- When user clicks "Find a Stranger", terminate ANY existing session so they are NEVER reconnected to the old stranger!
    UPDATE public.chat_sessions
    SET status = 'ended',
        ended_at = timezone('utc'::text, now()),
        end_reason = 'left'
    WHERE status = 'active' AND (user_a = v_user_id OR user_b = v_user_id);

    -- Remove any old queue entries
    DELETE FROM public.match_queue WHERE user_id = v_user_id;

    -- Look for the oldest waiting candidate using FOR UPDATE SKIP LOCKED
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
      -- Candidate must have queued recently (last 5 minutes)
      AND mq.queued_at > (timezone('utc'::text, now()) - INTERVAL '5 minutes')
    ORDER BY mq.queued_at ASC
    FOR UPDATE OF mq SKIP LOCKED
    LIMIT 1;

    IF v_partner_id IS NOT NULL THEN
        -- Also ensure partner's older sessions are ended
        UPDATE public.chat_sessions
        SET status = 'ended', ended_at = timezone('utc'::text, now()), end_reason = 'left'
        WHERE status = 'active' AND (user_a = v_partner_id OR user_b = v_partner_id);

        -- Create brand new session
        INSERT INTO public.chat_sessions (user_a, user_b, status)
        VALUES (v_user_id, v_partner_id, 'active')
        RETURNING id INTO v_session_id;

        UPDATE public.match_queue
        SET status = 'matched', matched_session_id = v_session_id, updated_at = timezone('utc'::text, now())
        WHERE user_id = v_partner_id;

        DELETE FROM public.match_queue WHERE user_id = v_user_id;

        RETURN jsonb_build_object('status', 'matched', 'session_id', v_session_id);
    ELSE
        -- No candidate currently waiting: put this user into waiting queue
        INSERT INTO public.match_queue (user_id, status, queued_at, updated_at)
        VALUES (v_user_id, 'waiting', timezone('utc'::text, now()), timezone('utc'::text, now()))
        ON CONFLICT (user_id) DO UPDATE SET
            status = 'waiting',
            matched_session_id = NULL,
            queued_at = timezone('utc'::text, now()),
            updated_at = timezone('utc'::text, now());

        RETURN jsonb_build_object('status', 'waiting');
    END IF;
END;
$func$;
