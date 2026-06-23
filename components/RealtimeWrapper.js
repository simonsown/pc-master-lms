'use client';

import React, { useEffect, useState } from 'react';
import { RealtimeProvider } from '@/lib/realtime-provider';

export default function RealtimeWrapper({ children }) {
    const [userId, setUserId] = useState(null);
    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) return;
        import('@supabase/ssr').then(({ createBrowserClient }) => {
            const client = createBrowserClient(url, key);
            client.auth.getUser().then(({ data }) => {
                if (data?.user) setUserId(data.user.id);
            });
        });
    }, []);
    return <RealtimeProvider userId={userId}>{children}</RealtimeProvider>;
}
