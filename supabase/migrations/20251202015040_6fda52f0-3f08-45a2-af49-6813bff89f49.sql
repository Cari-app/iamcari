-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, role)
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Insert admin users (using their emails to find user_id)
-- Note: This will need to be run after the users have signed up
DO $$
DECLARE
    gabriel_id UUID;
    ezazino_id UUID;
BEGIN
    -- Get user IDs from auth.users based on email
    SELECT id INTO gabriel_id FROM auth.users WHERE email = 'gabrielschuberts@gmail.com';
    SELECT id INTO ezazino_id FROM auth.users WHERE email = 'ramosezazino@gmail.com';
    
    -- Insert admin roles if users exist
    IF gabriel_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (gabriel_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    IF ezazino_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (ezazino_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;