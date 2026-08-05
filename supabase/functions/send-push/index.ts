// WELO — Push Notification Sender (Supabase Edge Function)
// Sends daily push notifications to subscribed users.
// Triggered by: Supabase cron (pg_cron) or manual invocation.
//
// Notification types:
// - daily_challenge: "Tu reto diario te espera" (9:00 AM)
// - streak_warning: "No pierdas tu racha" (8:00 PM, if user hasn't opened today)
// - partner_action: "Tu pareja ha respondido" (immediate, triggered by DB webhook)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = 'BCcRnXal3HnuCFldWU5hemlSC_-zhvROefT5bdIdt4r80d7tE0aHZC6OP286eEYcTI1nEyJPkqQwVK0FEQ0Qy3Q';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const VAPID_SUBJECT = 'mailto:welobcn@gmail.com';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Web Push signing (simplified for Deno)
// In production, use a proper web-push library for Deno
async function sendPushNotification(subscription: any, payload: any) {
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TTL': '86400',
    },
    body: JSON.stringify(payload),
  });
  return response;
}

// Notification templates
const NOTIFICATIONS = {
  daily_challenge: {
    title: 'WELO 🎯',
    body: '¡Tu reto diario te espera! 2 minutos para conectar.',
    icon: '/WELO/icons/icon-192.svg',
    url: '/WELO/index.html',
    tag: 'daily-challenge',
  },
  streak_warning: {
    title: 'WELO 🔥',
    body: '¡No pierdas tu racha! Abre WELO antes de medianoche.',
    icon: '/WELO/icons/icon-192.svg',
    url: '/WELO/index.html',
    tag: 'streak-warning',
  },
  match_diario: {
    title: 'WELO 💕',
    body: '¡Tu pareja ya respondió el Match Diario! Mira en qué coincidís.',
    icon: '/WELO/icons/icon-192.svg',
    url: '/WELO/index.html',
    tag: 'match-diario',
  },
  recognition: {
    title: 'WELO 🤗',
    body: 'Tu pareja se sintió especial gracias a ti hoy.',
    icon: '/WELO/icons/icon-192.svg',
    url: '/WELO/index.html',
    tag: 'recognition',
  },
};

serve(async (req: Request) => {
  try {
    const { type = 'daily_challenge', user_ids = [] } = await req.json().catch(() => ({}));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get subscriptions
    let query = supabase.from('push_subscriptions').select('*');
    
    if (user_ids.length > 0) {
      query = query.in('user_id', user_ids);
    }

    const { data: subscriptions, error } = await query;

    if (error || !subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, error: error?.message || 'No subscriptions' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const notification = NOTIFICATIONS[type as keyof typeof NOTIFICATIONS] || NOTIFICATIONS.daily_challenge;
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        const result = await sendPushNotification(sub.subscription, notification);
        if (result.ok || result.status === 201) {
          sent++;
        } else if (result.status === 410 || result.status === 404) {
          // Subscription expired — remove from DB
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          failed++;
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
      }
    }

    return new Response(JSON.stringify({ sent, failed, total: subscriptions.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
