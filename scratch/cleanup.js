const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/SUPABASE_URL=(.+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_KEY=(.+)/);
const anonKeyMatch = env.match(/SUPABASE_ANON_KEY=(.+)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch ? keyMatch[1].trim() : anonKeyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_IDS = [
  'brass-diya-pair',
  'brass-pooja-bell',
  'brass-aarti-plate',
  'copper-kalash-pooja',
  'copper-panchapatra-pali',
  'copper-pooja-lota',
  'ganesha-gold-frame',
  'lakshmi-gold-frame',
  'radha-krishna-frame',
  'daily-pooja-kit',
  'premium-sandalwood-paste',
  'organic-camphor-tablets',
  'vratam-peta-kit'
];

async function cleanup() {
  console.log('Fetching items...');
  const { data, error } = await supabase
    .from('orders')
    .select('items')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .single();

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  const allItems = data.items || [];
  console.log(`Found ${allItems.length} total items.`);

  // Filter out any item whose ID or Name matches a demo product
  const userItems = allItems.filter(item => {
    // If it has one of the default IDs, it's a demo product
    if (item.id && DEFAULT_IDS.includes(item.id)) return false;
    
    // Also filter by known demo names if ID is missing or changed
    const demoNames = [
      'Handcrafted Brass Diya (Pair)',
      'Ornate Brass Pooja Handbell',
      'Engraved Brass Aarti Plate',
      'Pure Copper Pooja Kalash',
      'Copper Panchapatra & Pali Set',
      'Traditional Copper Pooja Lota',
      'Lord Ganesha Gold-Plated Frame',
      'Goddess Lakshmi Gold-Plated Frame',
      'Radha Krishna Wooden Altar Frame',
      'Daily Pooja Essentials Kit',
      'Premium Sandalwood Paste (Chandanam)',
      'Organic Camphor Tablets (100g)'
    ];
    if (demoNames.includes(item.name)) return false;

    // Keep the item
    return true;
  });

  console.log(`Keeping ${userItems.length} user-added items.`);
  
  if (userItems.length !== allItems.length) {
    console.log('Updating Supabase...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({ items: userItems })
      .eq('id', '00000000-0000-0000-0000-000000000000');
      
    if (updateError) {
      console.error('Error updating:', updateError);
    } else {
      console.log('Cleanup successful!');
    }
  } else {
    console.log('No demo items found to remove.');
  }
}

cleanup();
