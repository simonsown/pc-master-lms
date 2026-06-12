'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { RealtimeProvider } from '@/lib/realtime-provider';

export default function RealtimeWrapper({ children }) {
    const [userId, setUserId] = useState(null);
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user) setUserId(data.user.id);
        });
    }, []);
    return <RealtimeProvider userId={userId}>{children}</RealtimeProvider>;
}
