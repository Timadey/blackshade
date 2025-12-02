import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "https://esm.sh/web-push@3.5.0"

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
const vapidSubject = 'mailto:admin@blackshade.app'

webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    try {
        const { record } = await req.json()

        // Only process if it's a reply (has parent_id)
        if (!record.parent_id) {
            return new Response(JSON.stringify({ message: 'Not a reply' }), {
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // 1. Get the parent message to find the author
        const { data: parentMessage, error: parentError } = await supabase
            .from('messages')
            .select('author_id, content')
            .eq('id', record.parent_id)
            .single()

        if (parentError || !parentMessage) {
            throw new Error('Parent message not found')
        }

        // Don't notify if replying to self
        if (parentMessage.author_id === record.author_id) {
            return new Response(JSON.stringify({ message: 'Reply to self' }), {
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // 2. Get the author's notification subscriptions
        const { data: subscriptions, error: subError } = await supabase
            .from('notifications')
            .select('subscription_data')
            .eq('user_id', parentMessage.author_id)

        if (subError) throw subError

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // 3. Send notifications
        const payload = JSON.stringify({
            title: 'New Reply on Blackshade',
            body: `Someone replied to: "${parentMessage.content.substring(0, 30)}..."`,
            url: `/thread/${record.parent_id}`
        })

        const notifications = subscriptions.map(sub =>
            webpush.sendNotification(sub.subscription_data, payload)
                .catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription is invalid, delete it
                        supabase
                            .from('notifications')
                            .delete()
                            .match({ subscription_data: sub.subscription_data })
                    }
                    console.error('Error sending notification:', err)
                })
        )

        await Promise.all(notifications)

        return new Response(JSON.stringify({ message: 'Notifications sent' }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
})
