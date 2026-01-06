
-- Create collaborator_bank_details table
CREATE TABLE public.collaborator_bank_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collaborator_bank_details ENABLE ROW LEVEL SECURITY;

-- RLS policies for collaborator_bank_details
CREATE POLICY "Collaborators can view own bank details"
ON public.collaborator_bank_details
FOR SELECT
USING (email = get_auth_email() OR is_admin_or_owner(auth.uid()));

CREATE POLICY "Collaborators can insert own bank details"
ON public.collaborator_bank_details
FOR INSERT
WITH CHECK (email = get_auth_email());

CREATE POLICY "Collaborators can update own bank details"
ON public.collaborator_bank_details
FOR UPDATE
USING (email = get_auth_email());

-- Create payout_requests table
CREATE TABLE public.payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_email text NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  bank_name text,
  account_number text,
  account_name text,
  requested_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  processed_by text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for payout_requests
CREATE POLICY "Collaborators can view own payout requests"
ON public.payout_requests
FOR SELECT
USING (collaborator_email = get_auth_email() OR is_admin_or_owner(auth.uid()));

CREATE POLICY "Collaborators can insert own payout requests"
ON public.payout_requests
FOR INSERT
WITH CHECK (collaborator_email = get_auth_email());

CREATE POLICY "Only owner can update payout requests"
ON public.payout_requests
FOR UPDATE
USING (is_owner(auth.uid()));

-- Add UPDATE policy to user_roles for owner
CREATE POLICY "Only owner can update roles"
ON public.user_roles
FOR UPDATE
USING (is_owner(auth.uid()));

-- Create trigger for updated_at on collaborator_bank_details
CREATE TRIGGER update_collaborator_bank_details_updated_at
BEFORE UPDATE ON public.collaborator_bank_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
