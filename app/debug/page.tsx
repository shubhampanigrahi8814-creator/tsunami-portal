'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DebugPage() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      const userRes = await supabase.auth.getUser();

      const user = userRes.data.user;
      let profileRes = null;

      if (user) {
        profileRes = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id);
      }

      setInfo({
        userResult: userRes,
        profileResult: profileRes,
      });
    };

    run();
  }, []);

  return (
    <pre className="text-xs text-white p-4">
      {JSON.stringify(info, null, 2)}
    </pre>
  );
}
