import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect as nextRedirect } from 'next/navigation';

export default async function RootPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (user) {
    return nextRedirect('/welcome');
  } else {
    return nextRedirect('/pricing');
  }
}