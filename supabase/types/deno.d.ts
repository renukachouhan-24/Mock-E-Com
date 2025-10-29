/// <reference types="@types/deno" />

// Type declarations for Deno npm: imports
declare module 'npm:@supabase/supabase-js@2.57.4' {
  export * from '@supabase/supabase-js';
}

// Ensure Deno global is available
declare global {
  const Deno: typeof import('@types/deno').Deno;
}
