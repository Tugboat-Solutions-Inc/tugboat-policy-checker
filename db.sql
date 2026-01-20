-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.app_user_roles (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  role USER-DEFINED NOT NULL DEFAULT 'USER'::app_user_role,
  CONSTRAINT app_user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT app_user_roles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.brands (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  property_id uuid NOT NULL,
  name text NOT NULL,
  CONSTRAINT brands_pkey PRIMARY KEY (id),
  CONSTRAINT brands_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  property_id uuid NOT NULL,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
CREATE TABLE public.collections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  description text NOT NULL,
  cover_image_url text NOT NULL,
  unit_id uuid NOT NULL,
  CONSTRAINT collections_pkey PRIMARY KEY (id),
  CONSTRAINT collections_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id)
);
CREATE TABLE public.duplication_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  collection_id uuid NOT NULL,
  CONSTRAINT duplication_groups_pkey PRIMARY KEY (id),
  CONSTRAINT duplication_groups_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id)
);
CREATE TABLE public.items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  description text NOT NULL,
  model_nr text NOT NULL,
  condition USER-DEFINED NOT NULL DEFAULT 'BRAND_NEW'::item_condition,
  est_cost integer NOT NULL DEFAULT 0,
  photo_context text NOT NULL DEFAULT ''::text,
  bounding_box ARRAY,
  photo_url text,
  brand_id uuid,
  category_id uuid,
  collection_id uuid NOT NULL,
  dupe_group_id uuid,
  est_age double precision NOT NULL DEFAULT 0.0,
  quantity integer NOT NULL DEFAULT 1,
  CONSTRAINT items_pkey PRIMARY KEY (id),
  CONSTRAINT items_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id),
  CONSTRAINT items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT items_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id),
  CONSTRAINT items_dupe_group_id_fkey FOREIGN KEY (dupe_group_id) REFERENCES public.duplication_groups(id)
);
CREATE TABLE public.organization_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  role USER-DEFINED NOT NULL,
  CONSTRAINT organization_users_pkey PRIMARY KEY (id),
  CONSTRAINT organization_users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_data(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  logo_url text,
  type USER-DEFINED NOT NULL DEFAULT 'INDIVIDUAL'::organization_type,
  owner_id uuid NOT NULL,
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users_data(id)
);
CREATE TABLE public.properties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  address text NOT NULL,
  address_place_id text NOT NULL,
  owner_org_id uuid NOT NULL,
  CONSTRAINT properties_pkey PRIMARY KEY (id),
  CONSTRAINT properties_owner_org_id_fkey FOREIGN KEY (owner_org_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.property_access (
  property_id uuid NOT NULL,
  unit_id uuid NOT NULL,
  organization_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  access_type USER-DEFINED NOT NULL,
  is_client boolean NOT NULL DEFAULT false,
  CONSTRAINT property_access_pkey PRIMARY KEY (property_id, unit_id, organization_user_id),
  CONSTRAINT property_access_organization_user_id_fkey FOREIGN KEY (organization_user_id) REFERENCES public.organization_users(id),
  CONSTRAINT property_access_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT property_access_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id)
);
CREATE TABLE public.units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL DEFAULT ''::text,
  property_id uuid NOT NULL,
  CONSTRAINT units_pkey PRIMARY KEY (id),
  CONSTRAINT units_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
CREATE TABLE public.uploads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  collection_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'QUEUED'::upload_status,
  photo_urls ARRAY NOT NULL,
  CONSTRAINT uploads_pkey PRIMARY KEY (id),
  CONSTRAINT uploads_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id)
);
CREATE TABLE public.users_data (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  email text NOT NULL,
  phone_number text,
  first_name text,
  last_name text,
  profile_picture_url text,
  settings jsonb NOT NULL DEFAULT '{"notifications": {"sms": false, "email": true, "marketing": false}}'::jsonb,
  onboarding_complete boolean NOT NULL DEFAULT false,
  CONSTRAINT users_data_pkey PRIMARY KEY (id),
  CONSTRAINT users_data_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);