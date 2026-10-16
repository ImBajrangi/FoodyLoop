import { createClient } from '@supabase/supabase-js';
import type { UserRole } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://omuiqrdtbyzaqkzkrvfh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdWlxcmR0Ynl6YXFremtydmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMjg3NzYsImV4cCI6MjEwNzcwNDc3Nn0.OIoFsKRLzGdtsYi4bwDRPw5w2omgRk4H8xvzAOskfOg';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Admin client for zero-interruption real-time database synchronization
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : supabase;

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string }> = {
  shop: { email: 'shop@foodloop.in', pass: 'foodloop_secret_password_2026' },
  ngo: { email: 'ngo@foodloop.in', pass: 'foodloop_secret_password_2026' },
  volunteer: { email: 'volunteer@foodloop.in', pass: 'foodloop_secret_password_2026' },
  donor: { email: 'donor@foodloop.in', pass: 'foodloop_secret_password_2026' },
  admin: { email: 'admin@foodloop.in', pass: 'foodloop_secret_password_2026' }
};

export async function signInDemoUser(role: UserRole) {
  try {
    const cred = DEMO_CREDENTIALS[role];
    if (!cred) return null;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cred.email,
      password: cred.pass
    });
    if (error) {
      console.warn('Supabase auth notice:', error.message);
      return null;
    }
    return data.user;
  } catch (err) {
    console.warn('Supabase auth catch:', err);
    return null;
  }
}

/**
 * Health check to verify live Supabase connectivity and measure ping latency
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  latencyMs: number;
  projectRef: string;
  error?: string;
}> {
  const start = performance.now();
  try {
    const { error } = await supabase.from('organizations').select('count', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - start);
    
    const isConn = !error || error.code === '42P01' || error.message.includes('relation');
    return {
      connected: isConn,
      latencyMs,
      projectRef: 'omuiqrdtbyzaqkzkrvfh',
      error: error && !isConn ? error.message : undefined
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Math.round(performance.now() - start),
      projectRef: 'omuiqrdtbyzaqkzkrvfh',
      error: err?.message || 'Connection failed'
    };
  }
}

/**
 * Realtime channel subscription for cross-device synchronization
 */
export function subscribeToRealtimeDonations(onUpdate: (payload: any) => void) {
  const channel = supabase
    .channel('public:donations')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'donations' },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
