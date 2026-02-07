-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  start_date date NOT NULL,
  start_time time without time zone NOT NULL,
  rental_days integer NOT NULL CHECK (rental_days > 0),
  pickup_location text NOT NULL,
  total_amount numeric NOT NULL,
  booking_status text NOT NULL DEFAULT 'pending'::text CHECK (booking_status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'completed'::text, 'refund_pending'::text, 'refunded'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  booking_reference character varying,
  magic_token_hash character varying,
  token_expires_at timestamp with time zone,
  agreed_to_terms boolean DEFAULT false,
  pickup_time character varying,
  cancellation_reason text,
  refund_status text DEFAULT 'none'::text CHECK (refund_status = ANY (ARRAY['none'::text, 'pending'::text, 'completed'::text])),
  refund_reference_id text,
  refund_proof_url text,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT bookings_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  contact_number text NOT NULL,
  address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['cash'::text, 'gcash'::text, 'card'::text, 'bank_transfer'::text])),
  amount numeric NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
  transaction_reference text,
  payment_proof_url text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  payment_type character varying CHECK (payment_type::text = ANY (ARRAY['full'::character varying, 'downpayment'::character varying]::text[])),
  receipt_url text,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin'::text CHECK (role = ANY (ARRAY['admin'::text, 'staff'::text])),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.vehicle_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid,
  brand text NOT NULL,
  model text NOT NULL,
  color text,
  transmission text NOT NULL DEFAULT 'automatic'::text CHECK (transmission = ANY (ARRAY['automatic'::text, 'manual'::text])),
  fuel_type text NOT NULL DEFAULT 'gasoline'::text CHECK (fuel_type = ANY (ARRAY['gasoline'::text, 'diesel'::text, 'electric'::text, 'hybrid'::text])),
  seats integer NOT NULL DEFAULT 5,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_per_day numeric NOT NULL,
  status text NOT NULL DEFAULT 'available'::text CHECK (status = ANY (ARRAY['available'::text, 'rented'::text, 'maintenance'::text, 'retired'::text])),
  is_featured boolean NOT NULL DEFAULT false,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vehicles_pkey PRIMARY KEY (id),
  CONSTRAINT vehicles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.vehicle_categories(id)
);