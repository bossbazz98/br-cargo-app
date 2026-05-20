import { supabase } from '@/api/supabaseClient';

let _userId = null;
let _userEmail = null;

export const initTracker = (user) => {
  _userId = user?.id || null;
  _userEmail = user?.email || null;
};

export const track = async (page, action = 'view', detail = '') => {
  if (!_userId) return;
  try {
    await supabase.from('user_activity').insert([{
      user_id: _userId,
      user_email: _userEmail,
      page,
      action,
      detail,
    }]);
  } catch (e) {}
};
