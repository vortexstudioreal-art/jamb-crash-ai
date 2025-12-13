CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'owner',
    'admin',
    'collaborator'
);


--
-- Name: jamb_subject; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.jamb_subject AS ENUM (
    'english',
    'mathematics',
    'physics',
    'chemistry',
    'biology',
    'literature',
    'government',
    'economics',
    'crs',
    'irs',
    'geography',
    'accounting',
    'commerce',
    'agricultural_science'
);


--
-- Name: check_user_access(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_user_access(user_email text) RETURNS TABLE(has_access boolean, is_admin boolean, package text, expires_at timestamp with time zone, admin_role text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_user_id UUID;
  v_role app_role;
BEGIN
  -- Get user_id from profiles
  SELECT p.id INTO v_user_id FROM profiles p WHERE p.email = user_email;
  
  -- Check if user has a role in user_roles table
  SELECT ur.role INTO v_role FROM user_roles ur WHERE ur.user_id = v_user_id;
  
  IF v_role IS NOT NULL THEN
    -- Owner, admin, and collaborator all get full access
    RETURN QUERY SELECT true, true, 'admin'::TEXT, NULL::TIMESTAMP WITH TIME ZONE, v_role::TEXT;
    RETURN;
  END IF;
  
  -- Also check admin_users table for backward compatibility
  IF EXISTS (SELECT 1 FROM admin_users au WHERE au.email = user_email) THEN
    SELECT au.role INTO v_role FROM admin_users au WHERE au.email = user_email;
    RETURN QUERY SELECT true, true, 'admin'::TEXT, NULL::TIMESTAMP WITH TIME ZONE, COALESCE(v_role, 'collaborator')::TEXT;
    RETURN;
  END IF;
  
  -- Check for active payment
  RETURN QUERY
  SELECT 
    CASE WHEN p.access_expires_at > now() THEN true ELSE false END,
    false,
    p.package,
    p.access_expires_at,
    NULL::TEXT
  FROM payments p
  WHERE p.email = user_email 
    AND p.status = 'success'
  ORDER BY p.access_expires_at DESC NULLS LAST
  LIMIT 1;
  
  -- If no payment found, return no access
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, NULL::TEXT;
  END IF;
END;
$$;


--
-- Name: generate_referral_code(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_referral_code(user_email text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_code TEXT;
  existing_code TEXT;
BEGIN
  -- Check if user already has a code
  SELECT referral_code INTO existing_code FROM referrals WHERE referrer_email = user_email LIMIT 1;
  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;
  
  -- Generate new code
  new_code := 'JAMB' || upper(substring(md5(user_email || now()::text) from 1 for 6));
  
  INSERT INTO referrals (referrer_email, referral_code)
  VALUES (user_email, new_code);
  
  RETURN new_code;
END;
$$;


--
-- Name: get_auth_email(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_auth_email() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- If this is the owner email, assign owner role
  IF NEW.email = 'saeedabdulbasit933@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT DO NOTHING;
  -- If this is the collaborator email, assign collaborator role  
  ELSIF NEW.email = 'muzzyothmam@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'collaborator')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_admin_or_owner(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin_or_owner(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('owner', 'admin')
  )
$$;


--
-- Name: is_owner(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_owner(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'owner'
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: validate_coupon(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_coupon(coupon_code text) RETURNS TABLE(valid boolean, discount integer, coupon_id uuid, creator text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true AS valid,
    cc.discount_amount AS discount,
    cc.id AS coupon_id,
    cc.creator_email AS creator
  FROM coupon_codes cc
  WHERE cc.code = UPPER(coupon_code)
    AND cc.is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, NULL::TEXT;
  END IF;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    role text DEFAULT 'collaborator'::text
);


--
-- Name: coupon_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    creator_email text NOT NULL,
    discount_amount integer DEFAULT 1000 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: coupon_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    coupon_id uuid NOT NULL,
    used_by_email text NOT NULL,
    payment_id uuid,
    amount_paid integer NOT NULL,
    discount_applied integer NOT NULL,
    creator_earning integer DEFAULT 1000 NOT NULL,
    is_paid_out boolean DEFAULT false NOT NULL,
    paid_out_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: demo_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.demo_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text,
    device_fingerprint text,
    used_at timestamp with time zone DEFAULT now()
);


--
-- Name: feature_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature_status (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    feature_name text NOT NULL,
    is_working boolean DEFAULT false,
    last_checked timestamp with time zone DEFAULT now(),
    notes text
);


--
-- Name: flashcards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flashcards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    topic text,
    front text NOT NULL,
    back text NOT NULL,
    source_type text DEFAULT 'ai'::text,
    source_id uuid,
    difficulty text DEFAULT 'medium'::text,
    times_reviewed integer DEFAULT 0,
    times_correct integer DEFAULT 0,
    last_reviewed_at timestamp with time zone,
    next_review_at timestamp with time zone,
    mastery_level text DEFAULT 'new'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: jamb_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jamb_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subject public.jamb_subject NOT NULL,
    year integer,
    question text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text NOT NULL,
    correct_answer text NOT NULL,
    explanation text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: jamb_syllabus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jamb_syllabus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subject text NOT NULL,
    topic text NOT NULL,
    subtopic text,
    objectives text[],
    recommended_content text,
    difficulty_level text DEFAULT 'medium'::text,
    estimated_reading_time integer DEFAULT 30,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    package text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    paystack_reference text,
    paystack_transaction_id text,
    access_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_package_check CHECK ((package = ANY (ARRAY['basic'::text, 'pro'::text, 'ultimate'::text]))),
    CONSTRAINT payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    quiz_type text DEFAULT 'full'::text NOT NULL,
    subjects public.jamb_subject[] NOT NULL,
    total_questions integer NOT NULL,
    correct_answers integer NOT NULL,
    time_taken_seconds integer,
    questions_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: reading_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    syllabus_id uuid,
    subject text NOT NULL,
    topic text NOT NULL,
    progress_percent integer DEFAULT 0,
    times_reviewed integer DEFAULT 0,
    last_read_at timestamp with time zone,
    mastery_level text DEFAULT 'not_started'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: reading_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    syllabus_id uuid,
    subject text NOT NULL,
    topic text NOT NULL,
    time_spent_seconds integer DEFAULT 0 NOT NULL,
    started_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone,
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referrals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    referrer_email text NOT NULL,
    referral_code text NOT NULL,
    referred_email text,
    discount_amount integer DEFAULT 1000,
    is_used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    questions_completed integer DEFAULT 0,
    study_days_completed integer DEFAULT 0,
    weak_subject text,
    target_score integer,
    predicted_score_min integer,
    predicted_score_max integer,
    plan_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_study_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_study_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    study_days text[] DEFAULT ARRAY['monday'::text, 'tuesday'::text, 'wednesday'::text, 'thursday'::text, 'friday'::text],
    hours_per_session integer DEFAULT 2,
    preferred_subjects text[],
    target_score integer DEFAULT 300,
    exam_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_subjects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    subjects public.jamb_subject[] NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_reminders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    phone_number text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: coupon_codes coupon_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_codes
    ADD CONSTRAINT coupon_codes_code_key UNIQUE (code);


--
-- Name: coupon_codes coupon_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_codes
    ADD CONSTRAINT coupon_codes_pkey PRIMARY KEY (id);


--
-- Name: coupon_usage coupon_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_pkey PRIMARY KEY (id);


--
-- Name: demo_usage demo_usage_device_fingerprint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_usage
    ADD CONSTRAINT demo_usage_device_fingerprint_key UNIQUE (device_fingerprint);


--
-- Name: demo_usage demo_usage_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_usage
    ADD CONSTRAINT demo_usage_email_key UNIQUE (email);


--
-- Name: demo_usage demo_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_usage
    ADD CONSTRAINT demo_usage_pkey PRIMARY KEY (id);


--
-- Name: feature_status feature_status_feature_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_status
    ADD CONSTRAINT feature_status_feature_name_key UNIQUE (feature_name);


--
-- Name: feature_status feature_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_status
    ADD CONSTRAINT feature_status_pkey PRIMARY KEY (id);


--
-- Name: flashcards flashcards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcards
    ADD CONSTRAINT flashcards_pkey PRIMARY KEY (id);


--
-- Name: jamb_questions jamb_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jamb_questions
    ADD CONSTRAINT jamb_questions_pkey PRIMARY KEY (id);


--
-- Name: jamb_syllabus jamb_syllabus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jamb_syllabus
    ADD CONSTRAINT jamb_syllabus_pkey PRIMARY KEY (id);


--
-- Name: payments payments_paystack_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_paystack_reference_key UNIQUE (paystack_reference);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: reading_progress reading_progress_email_syllabus_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_email_syllabus_id_key UNIQUE (email, syllabus_id);


--
-- Name: reading_progress reading_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_pkey PRIMARY KEY (id);


--
-- Name: reading_sessions reading_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_sessions
    ADD CONSTRAINT reading_sessions_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referral_code_key UNIQUE (referral_code);


--
-- Name: user_progress user_progress_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_email_unique UNIQUE (email);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_study_preferences user_study_preferences_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_study_preferences
    ADD CONSTRAINT user_study_preferences_email_key UNIQUE (email);


--
-- Name: user_study_preferences user_study_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_study_preferences
    ADD CONSTRAINT user_study_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_subjects user_subjects_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subjects
    ADD CONSTRAINT user_subjects_email_key UNIQUE (email);


--
-- Name: user_subjects user_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subjects
    ADD CONSTRAINT user_subjects_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_reminders whatsapp_reminders_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_reminders
    ADD CONSTRAINT whatsapp_reminders_email_unique UNIQUE (email);


--
-- Name: whatsapp_reminders whatsapp_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_reminders
    ADD CONSTRAINT whatsapp_reminders_pkey PRIMARY KEY (id);


--
-- Name: idx_flashcards_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flashcards_email ON public.flashcards USING btree (email);


--
-- Name: idx_flashcards_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flashcards_subject ON public.flashcards USING btree (subject);


--
-- Name: idx_jamb_syllabus_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jamb_syllabus_subject ON public.jamb_syllabus USING btree (subject);


--
-- Name: idx_reading_progress_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_progress_email ON public.reading_progress USING btree (email);


--
-- Name: idx_reading_sessions_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_sessions_email ON public.reading_sessions USING btree (email);


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_subjects update_user_subjects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_subjects_updated_at BEFORE UPDATE ON public.user_subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: coupon_usage coupon_usage_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupon_codes(id) ON DELETE CASCADE;


--
-- Name: coupon_usage coupon_usage_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reading_progress reading_progress_syllabus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_syllabus_id_fkey FOREIGN KEY (syllabus_id) REFERENCES public.jamb_syllabus(id) ON DELETE CASCADE;


--
-- Name: reading_sessions reading_sessions_syllabus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_sessions
    ADD CONSTRAINT reading_sessions_syllabus_id_fkey FOREIGN KEY (syllabus_id) REFERENCES public.jamb_syllabus(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: coupon_codes Admins can manage coupons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage coupons" ON public.coupon_codes USING (public.is_admin_or_owner(auth.uid()));


--
-- Name: jamb_questions Admins can manage questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage questions" ON public.jamb_questions USING ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE (admin_users.email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE (admin_users.email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)))));


--
-- Name: jamb_syllabus Admins can manage syllabus; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage syllabus" ON public.jamb_syllabus USING (public.is_admin_or_owner(auth.uid())) WITH CHECK (public.is_admin_or_owner(auth.uid()));


--
-- Name: jamb_questions Anyone can read questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read questions" ON public.jamb_questions FOR SELECT USING (true);


--
-- Name: jamb_syllabus Anyone can read syllabus; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read syllabus" ON public.jamb_syllabus FOR SELECT USING (true);


--
-- Name: coupon_codes Anyone can view active coupons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active coupons" ON public.coupon_codes FOR SELECT USING ((is_active = true));


--
-- Name: demo_usage Authenticated users can insert demo usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert demo usage" ON public.demo_usage FOR INSERT TO authenticated WITH CHECK ((email = public.get_auth_email()));


--
-- Name: coupon_usage Authenticated users can insert usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert usage" ON public.coupon_usage FOR INSERT WITH CHECK ((used_by_email = public.get_auth_email()));


--
-- Name: feature_status Authenticated users can read feature status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read feature status" ON public.feature_status FOR SELECT TO authenticated USING (true);


--
-- Name: demo_usage Authenticated users can view demo usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view demo usage" ON public.demo_usage FOR SELECT TO authenticated USING (((email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: feature_status Only admins can manage features; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage features" ON public.feature_status TO authenticated USING (public.is_admin_or_owner(auth.uid())) WITH CHECK (public.is_admin_or_owner(auth.uid()));


--
-- Name: admin_users Only admins can view admin list; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can view admin list" ON public.admin_users FOR SELECT TO authenticated USING (public.is_admin_or_owner(auth.uid()));


--
-- Name: admin_users Only owner can delete admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only owner can delete admins" ON public.admin_users FOR DELETE TO authenticated USING (public.is_owner(auth.uid()));


--
-- Name: user_roles Only owner can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only owner can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.is_owner(auth.uid()));


--
-- Name: admin_users Only owner can insert admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only owner can insert admins" ON public.admin_users FOR INSERT TO authenticated WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: user_roles Only owner can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only owner can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: coupon_usage Only owner can update usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only owner can update usage" ON public.coupon_usage FOR UPDATE USING (public.is_owner(auth.uid()));


--
-- Name: payments Only service role can update payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only service role can update payments" ON public.payments FOR UPDATE TO authenticated USING (public.is_owner(auth.uid()));


--
-- Name: flashcards Users can delete own flashcards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own flashcards" ON public.flashcards FOR DELETE USING ((email = public.get_auth_email()));


--
-- Name: user_progress Users can delete own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own progress" ON public.user_progress FOR DELETE TO authenticated USING ((email = public.get_auth_email()));


--
-- Name: quiz_attempts Users can delete own quiz attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own quiz attempts" ON public.quiz_attempts FOR DELETE TO authenticated USING ((email = public.get_auth_email()));


--
-- Name: reading_progress Users can delete own reading progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own reading progress" ON public.reading_progress FOR DELETE USING ((email = public.get_auth_email()));


--
-- Name: reading_sessions Users can delete own reading sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own reading sessions" ON public.reading_sessions FOR DELETE USING ((email = public.get_auth_email()));


--
-- Name: whatsapp_reminders Users can delete own reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own reminders" ON public.whatsapp_reminders FOR DELETE TO authenticated USING ((email = public.get_auth_email()));


--
-- Name: user_study_preferences Users can delete own study preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own study preferences" ON public.user_study_preferences FOR DELETE USING ((email = public.get_auth_email()));


--
-- Name: user_subjects Users can delete own subjects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own subjects" ON public.user_subjects FOR DELETE TO authenticated USING ((email = public.get_auth_email()));


--
-- Name: flashcards Users can insert own flashcards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own flashcards" ON public.flashcards FOR INSERT WITH CHECK ((email = public.get_auth_email()));


--
-- Name: payments Users can insert own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK ((email = public.get_auth_email()));


--
-- Name: user_progress Users can insert own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT TO authenticated WITH CHECK ((email = public.get_auth_email()));


--
-- Name: quiz_attempts Users can insert own quiz attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK ((email = public.get_auth_email()));


--
-- Name: reading_progress Users can insert own reading progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own reading progress" ON public.reading_progress FOR INSERT WITH CHECK ((email = public.get_auth_email()));


--
-- Name: reading_sessions Users can insert own reading sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own reading sessions" ON public.reading_sessions FOR INSERT WITH CHECK ((email = public.get_auth_email()));


--
-- Name: whatsapp_reminders Users can insert own reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own reminders" ON public.whatsapp_reminders FOR INSERT TO authenticated WITH CHECK ((email = public.get_auth_email()));


--
-- Name: user_study_preferences Users can insert own study preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own study preferences" ON public.user_study_preferences FOR INSERT WITH CHECK ((email = public.get_auth_email()));


--
-- Name: user_subjects Users can insert own subjects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own subjects" ON public.user_subjects FOR INSERT TO authenticated WITH CHECK ((email = public.get_auth_email()));


--
-- Name: referrals Users can insert referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK ((referrer_email = public.get_auth_email()));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((id = auth.uid()));


--
-- Name: flashcards Users can update own flashcards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own flashcards" ON public.flashcards FOR UPDATE USING ((email = public.get_auth_email()));


--
-- Name: user_progress Users can update own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE TO authenticated USING ((email = public.get_auth_email()));


--
-- Name: quiz_attempts Users can update own quiz attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own quiz attempts" ON public.quiz_attempts FOR UPDATE TO authenticated USING ((email = public.get_auth_email()));


--
-- Name: reading_progress Users can update own reading progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own reading progress" ON public.reading_progress FOR UPDATE USING ((email = public.get_auth_email()));


--
-- Name: reading_sessions Users can update own reading sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own reading sessions" ON public.reading_sessions FOR UPDATE USING ((email = public.get_auth_email()));


--
-- Name: referrals Users can update own referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own referrals" ON public.referrals FOR UPDATE TO authenticated USING ((referrer_email = public.get_auth_email()));


--
-- Name: whatsapp_reminders Users can update own reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own reminders" ON public.whatsapp_reminders FOR UPDATE TO authenticated USING ((email = public.get_auth_email()));


--
-- Name: user_study_preferences Users can update own study preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own study preferences" ON public.user_study_preferences FOR UPDATE USING ((email = public.get_auth_email()));


--
-- Name: user_subjects Users can update own subjects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own subjects" ON public.user_subjects FOR UPDATE TO authenticated USING ((email = public.get_auth_email()));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((id = auth.uid()));


--
-- Name: flashcards Users can view own flashcards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own flashcards" ON public.flashcards FOR SELECT USING (((email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: payments Users can view own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT TO authenticated USING (((email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: user_progress Users can view own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT TO authenticated USING (((email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: quiz_attempts Users can view own quiz attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (((email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: reading_progress Users can view own reading progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own reading progress" ON public.reading_progress FOR SELECT USING (((email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: reading_sessions Users can view own reading sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own reading sessions" ON public.reading_sessions FOR SELECT USING (((email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: referrals Users can view own referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT TO authenticated USING (((referrer_email = public.get_auth_email()) OR (referred_email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: whatsapp_reminders Users can view own reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own reminders" ON public.whatsapp_reminders FOR SELECT TO authenticated USING (((email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: user_study_preferences Users can view own study preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own study preferences" ON public.user_study_preferences FOR SELECT USING (((email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: user_subjects Users can view own subjects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own subjects" ON public.user_subjects FOR SELECT TO authenticated USING (((email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING ((id = auth.uid()));


--
-- Name: user_roles Users can view their own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_owner(auth.uid())));


--
-- Name: coupon_usage Users can view their own usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own usage" ON public.coupon_usage FOR SELECT USING (((used_by_email = public.get_auth_email()) OR public.is_admin_or_owner(auth.uid())));


--
-- Name: admin_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

--
-- Name: coupon_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: coupon_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: demo_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.demo_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: feature_status; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feature_status ENABLE ROW LEVEL SECURITY;

--
-- Name: flashcards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

--
-- Name: jamb_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jamb_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: jamb_syllabus; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jamb_syllabus ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: reading_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: reading_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: referrals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

--
-- Name: user_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_study_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_study_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: user_subjects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_reminders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_reminders ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


