
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tilngyyfrjwqhciwpfcy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__fxO1EW33TyT-wZYj_vxUg_MS5_EdGj";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
