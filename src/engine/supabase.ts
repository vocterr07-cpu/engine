import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://srsvoerlzhydspqsdcds.supabase.co";
const SUPABASE_KEY = "sb_publishable_DAVq853IyQskZDUIAo9n_w_SrZBv4ex";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);