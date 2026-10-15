CREATE UNIQUE INDEX IF NOT EXISTS productos_nombre_ci_unique_idx
ON public.productos (lower(btrim(nombre)));
