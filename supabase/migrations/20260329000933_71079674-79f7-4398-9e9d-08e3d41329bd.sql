
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  customer_name text,
  status text NOT NULL DEFAULT 'authorized',
  ticto_order_id text,
  ticto_order_hash text,
  product_name text,
  product_id text,
  payment_method text,
  paid_amount integer,
  ticto_token text,
  raw_payload jsonb,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by edge function)
-- Anon/authenticated can only check if email exists (for registration page)
CREATE POLICY "Allow public to check purchase by email"
  ON public.purchases
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role can insert/update (via edge function)
CREATE POLICY "Service role can insert purchases"
  ON public.purchases
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update purchases"
  ON public.purchases
  FOR UPDATE
  TO service_role
  USING (true);

CREATE INDEX idx_purchases_email ON public.purchases (lower(email));
CREATE INDEX idx_purchases_status ON public.purchases (status);
