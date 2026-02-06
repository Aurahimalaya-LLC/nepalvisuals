
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdmin() {
  console.log('Checking profiles for admins...');
  
  // 1. List all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');
    
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }
  
  console.log('Found profiles:', profiles.length);
  profiles.forEach(p => {
    console.log(`- ID: ${p.id}, Email: ${p.email}, Role: ${p.role}`);
  });
  
  // 2. Check blog_categories
  const { data: categories, error: catError } = await supabase
    .from('blog_categories')
    .select('*');
    
  if (catError) {
    console.error('Error fetching categories:', catError);
  } else {
    console.log('Found categories:', categories.length);
    categories.forEach(c => console.log(`- ${c.name} (${c.id})`));
  }
}

checkAdmin();
