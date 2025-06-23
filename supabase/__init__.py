try:
    from supabase_py import create_client as _real_create_client
except Exception:

    def create_client(*args, **kwargs):
        raise NotImplementedError("Supabase client not available")

else:
    create_client = _real_create_client
