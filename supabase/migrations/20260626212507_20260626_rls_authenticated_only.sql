/*
# Secure RLS Policies - Authenticated Users Only

This migration replaces the overly permissive "public access" policies with authenticated-only policies.

## Background
The original migration created policies with `USING (true) WITH CHECK (true)` allowing anyone (including anonymous users) to perform all CRUD operations. With Supabase Auth now implemented in the frontend, we need to restrict data access to authenticated users only.

## Changes Made
For each of the 6 tables, this migration:
1. Drops the existing "public access" policy
2. Creates a new policy requiring `auth.uid() IS NOT NULL` for all operations

## Tables Affected
- `clientes` - Customer records
- `motores` - Motor records
- `servicos` - Service catalog
- `orcamentos` - Quotes/estimates
- `itens_orcamento` - Line items for quotes
- `configuracoes` - System configuration

## Security Model
- All operations (SELECT, INSERT, UPDATE, DELETE) require an authenticated session
- `auth.uid() IS NOT NULL` returns true only when a user is logged in
- Anonymous users (those without a valid session) cannot read or modify any data
- GRANTs remain unchanged - the RLS policies provide the actual access control

## Notes
1. RLS is already ENABLED on all tables - no need to re-enable
2. GRANTs are not modified - they allow anon/authenticated roles, but policies enforce authentication
3. This is a non-destructive migration - only policies are replaced, no data or schema changes
*/

-- CLIENTES
DROP POLICY IF EXISTS "public access clientes" ON public.clientes;
CREATE POLICY "authenticated access clientes" ON public.clientes 
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- MOTORES
DROP POLICY IF EXISTS "public access motores" ON public.motores;
CREATE POLICY "authenticated access motores" ON public.motores 
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- SERVICOS
DROP POLICY IF EXISTS "public access servicos" ON public.servicos;
CREATE POLICY "authenticated access servicos" ON public.servicos 
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ORCAMENTOS
DROP POLICY IF EXISTS "public access orcamentos" ON public.orcamentos;
CREATE POLICY "authenticated access orcamentos" ON public.orcamentos 
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ITENS_ORCAMENTO
DROP POLICY IF EXISTS "public access itens" ON public.itens_orcamento;
CREATE POLICY "authenticated access itens" ON public.itens_orcamento 
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- CONFIGURACOES
DROP POLICY IF EXISTS "public access config" ON public.configuracoes;
CREATE POLICY "authenticated access config" ON public.configuracoes 
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
