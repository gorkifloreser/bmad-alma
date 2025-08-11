'use client';

import { Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return user ? (
    <>
      <span style={{ marginRight: '1rem' }}>{user.email}</span>
      <Button color="inherit" component={Link} href="/account">
        Account
      </Button>
      <Button color="inherit" component={Link} href="/brand-heart">
        Brand Heart
      </Button>
      <Button color="inherit" onClick={handleLogout}>
        Logout
      </Button>
    </>
  ) : (
    <>
      <Button color="inherit" component={Link} href="/login">
        Login
      </Button>
      <Button color="inherit" component={Link} href="/signup">
        Sign Up
      </Button>
    </>
  );
}
