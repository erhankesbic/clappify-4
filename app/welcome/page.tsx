//

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function Welcome() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) {
    return redirect('/signin');
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
    </div>
  );
}