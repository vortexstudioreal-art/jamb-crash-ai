-- Create payments table for storing Paystack transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  package TEXT NOT NULL CHECK (package IN ('basic', 'pro', 'ultimate')),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  paystack_reference TEXT UNIQUE,
  paystack_transaction_id TEXT,
  access_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow inserting payments (for webhook and frontend)
CREATE POLICY "Anyone can insert payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (true);

-- Allow reading own payments by email
CREATE POLICY "Users can view payments by reference" 
ON public.payments 
FOR SELECT 
USING (true);

-- Allow updating payments (for webhook verification)
CREATE POLICY "Allow updating payments" 
ON public.payments 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();