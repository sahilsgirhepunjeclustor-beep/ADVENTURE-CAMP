import { store } from './store';
import { Activity } from './types';

const ACTIVITY_LOG_KEY = 'ac_activity_log';

export function getActivityLog(): Activity[] {
  return store.get<Activity[]>(ACTIVITY_LOG_KEY) || [];
}

export function addActivityLog(activity: Activity) {
  const activities = getActivityLog();
  store.set(ACTIVITY_LOG_KEY, [activity, ...activities]);
}
