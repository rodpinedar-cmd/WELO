// WELO — Supabase Backend Connection
const SUPABASE_URL = 'https://xvffamfflboustptpjmjx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JOMVwBkqq_qgh8ZhrRcOdQ_JmTvh88U';

let supabase = null;

// Initialize Supabase client (loaded via CDN)
function initSupabase() {
  if(window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase connected');
    return true;
  }
  console.warn('Supabase SDK not loaded yet');
  return false;
}

// ========== AUTH ==========
async function signUp(email, password, role) {
  if(!supabase) return {error:'No connection'};
  const {data, error} = await supabase.auth.signUp({email, password, options:{data:{role}}});
  if(error) return {error: error.message};
  return {user: data.user};
}

async function signIn(email, password) {
  if(!supabase) return {error:'No connection'};
  const {data, error} = await supabase.auth.signInWithPassword({email, password});
  if(error) return {error: error.message};
  return {user: data.user, session: data.session};
}

async function getUser() {
  if(!supabase) return null;
  const {data} = await supabase.auth.getUser();
  return data?.user || null;
}

async function signOut() {
  if(!supabase) return;
  await supabase.auth.signOut();
}

// ========== COUPLE PAIRING ==========
async function createCouple(code) {
  if(!supabase) return {error:'No connection'};
  const user = await getUser();
  if(!user) return {error:'Not logged in'};
  const {data, error} = await supabase.from('couples').insert({
    code: code,
    user1_id: user.id,
    user1_role: 'ella'
  }).select().single();
  return {data, error: error?.message};
}

async function joinCouple(code) {
  if(!supabase) return {error:'No connection'};
  const user = await getUser();
  if(!user) return {error:'Not logged in'};
  // Find couple by code
  const {data, error} = await supabase.from('couples')
    .update({user2_id: user.id, user2_role: 'el'})
    .eq('code', code)
    .is('user2_id', null)
    .select().single();
  if(error) return {error:'Código no encontrado o ya usado'};
  return {data};
}

async function getCoupleId() {
  if(!supabase) return null;
  const user = await getUser();
  if(!user) return null;
  const {data} = await supabase.from('couples')
    .select('id')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .single();
  return data?.id || null;
}

// ========== DAILY MATCH ==========
async function saveMatchAnswers(answers) {
  if(!supabase) return {error:'No connection'};
  const user = await getUser();
  const coupleId = await getCoupleId();
  if(!user || !coupleId) return {error:'No couple'};
  
  const {data, error} = await supabase.from('match_answers').upsert({
    couple_id: coupleId,
    user_id: user.id,
    date: today(),
    answers: answers
  }, {onConflict: 'couple_id,user_id,date'}).select().single();
  return {data, error: error?.message};
}

async function getPartnerMatchAnswers() {
  if(!supabase) return null;
  const user = await getUser();
  const coupleId = await getCoupleId();
  if(!user || !coupleId) return null;
  
  const {data} = await supabase.from('match_answers')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('date', today())
    .neq('user_id', user.id)
    .single();
  return data;
}

// ========== RECOGNITION ==========
async function sendRecognitionDB(type) {
  if(!supabase) return {error:'No connection'};
  const user = await getUser();
  const coupleId = await getCoupleId();
  if(!user || !coupleId) return {error:'No couple'};
  
  const {error} = await supabase.from('recognitions').insert({
    couple_id: coupleId,
    from_user_id: user.id,
    type: type,
    date: today()
  });
  return {error: error?.message};
}

async function getRecognitionsForMe() {
  if(!supabase) return [];
  const user = await getUser();
  const coupleId = await getCoupleId();
  if(!user || !coupleId) return [];
  
  const {data} = await supabase.from('recognitions')
    .select('*')
    .eq('couple_id', coupleId)
    .neq('from_user_id', user.id)
    .order('created_at', {ascending: false})
    .limit(5);
  return data || [];
}

// ========== REALTIME (listen for partner actions) ==========
function listenForPartner(coupleId, callback) {
  if(!supabase) return;
  supabase.channel(`couple-${coupleId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'match_answers',
      filter: `couple_id=eq.${coupleId}`
    }, (payload) => {
      callback('match', payload.new);
    })
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'recognitions',
      filter: `couple_id=eq.${coupleId}`
    }, (payload) => {
      callback('recognition', payload.new);
    })
    .subscribe();
}
