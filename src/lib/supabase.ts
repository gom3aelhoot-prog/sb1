import { createClient } from '@supabase/supabase-js';
import { demoSpecialties, demoDoctors, demoArticles, demoVideos, demoAudio, demoCourses, demoClinics, demoLabs, demoRadiology, demoFacilities, demoProducts, demoLibrary } from '@/lib/demoData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

// Keep the public site renderable when deployment environment variables are not configured yet.
// Database-backed pages will surface a clear configuration error instead of crashing the entire app.
type DemoRow = Record<string, any>;

const demoTables: Record<string, DemoRow[]> = {
  specialties: demoSpecialties,
  doctors: demoDoctors,
  articles: demoArticles,
  doctor_videos: demoVideos,
  doctor_audio: demoAudio,
  courses: demoCourses,
  clinics: demoClinics,
  lab_centers: demoLabs,
  radiology_centers: demoRadiology,
  additional_facilities: demoFacilities,
  pharmacy_products: demoProducts,
  specialty_library_items: demoLibrary,
  questions: [],
  question_pricing_rules: [{ id: 'pricing-demo', country_code: null, currency_code: 'USD', base_price: 9, duration_days: 7, notification_reach: 10, min_answers: 1, max_answers: 3, response_speed: 'standard', is_active: true }],
  signup_promotions: [{ id: 'promo-demo', code: 'SB1-FIRST-SIGNUP', discount_percent: 10, is_active: true }],
};

class DemoQuery implements PromiseLike<{ data: any; error: any }> {
  private rows: DemoRow[];
  private filters: ((row: DemoRow) => boolean)[] = [];
  private sortKey: string | null = null;
  private ascending = true;
  private maxRows: number | null = null;
  private singleRow = false;

  constructor(private table: string) {
    this.rows = [...(demoTables[table] || [])];
  }
  select(_columns = '*') { return this; }
  eq(key: string, value: any) { this.filters.push(r => r[key] === value); return this; }
  neq(key: string, value: any) { this.filters.push(r => r[key] !== value); return this; }
  ilike(key: string, pattern: string) {
    const needle = pattern.replace(/%/g, '').toLowerCase();
    this.filters.push(r => String(r[key] ?? '').toLowerCase().includes(needle));
    return this;
  }
  order(key: string, opts?: { ascending?: boolean }) { this.sortKey = key; this.ascending = opts?.ascending !== false; return this; }
  limit(n: number) { this.maxRows = n; return this; }
  range(_from: number, to: number) { this.maxRows = to + 1; return this; }
  maybeSingle() { this.singleRow = true; return this; }
  single() { this.singleRow = true; return this; }
  insert(_values: any) { return this; }
  update(_values: any) { return this; }
  delete() { return this; }
  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    try {
      let result = this.rows.filter(r => this.filters.every(f => f(r))).map(r => ({ ...r }));
      if (this.sortKey) result.sort((a,b) => {
        const av = a[this.sortKey!], bv = b[this.sortKey!];
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (this.ascending ? 1 : -1);
      });
      if (this.maxRows !== null) result = result.slice(0, this.maxRows);
      const data = this.singleRow ? (result[0] ?? null) : result;
      const value = { data, error: null };
      return Promise.resolve(value).then(onfulfilled as any, onrejected as any);
    } catch (error) {
      return Promise.reject(error).then(onfulfilled as any, onrejected as any);
    }
  }
}

const demoClient = {
  from(table: string) { return new DemoQuery(table); },
  rpc(_fn: string, _args?: any) { return Promise.resolve({ data: null, error: null }); },
};

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : demoClient;
