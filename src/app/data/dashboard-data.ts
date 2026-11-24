import { hoursAgo, minutesAgo } from './demo-time';
import type { ActivityItem, WeeklyStatus } from './models';

/** The delta line of each figure is fixed text, not computed: it is the demo's story for today. */
export const STAT_FIGURES = {
  sla: { value: '3', delta: 'Down 2 since yesterday' },
  response: { value: '14 min', delta: 'Unchanged since yesterday' },
  csat: { value: '94%', delta: 'Up 1 point since last week' },
  openDelta: 'Up 4 since yesterday',
} as const;

/** The six most recent weeks, named by the Monday they start on, oldest first. */
export const WEEKLY_STATUS: WeeklyStatus = {
  weeks: ['Oct 12', 'Oct 19', 'Oct 26', 'Nov 2', 'Nov 9', 'Nov 16'],
  series: [
    { status: 'open', values: [9, 11, 8, 12, 10, 13] },
    { status: 'in-progress', values: [14, 12, 15, 11, 14, 12] },
    { status: 'waiting', values: [5, 6, 4, 7, 5, 6] },
    { status: 'resolved', values: [31, 34, 38, 36, 41, 39] },
  ],
};

/** Newest first. */
export const ACTIVITY: readonly ActivityItem[] = [
  { id: 'f1', text: 'Mara Okafor replied to WJ-1032.', at: minutesAgo(25) },
  {
    id: 'f2',
    text: 'Hana Sato opened WJ-1032, "Customer survey link opens a 404 page".',
    at: hoursAgo(1),
  },
  { id: 'f3', text: 'Wen-Li Zhao Montgomery-Reyes moved WJ-1018 to In progress.', at: hoursAgo(3) },
  { id: 'f4', text: 'Priya Nair added a note to WJ-1015.', at: hoursAgo(5) },
  { id: 'f5', text: 'Tomas Herrera assigned WJ-1029 to himself.', at: hoursAgo(8) },
  { id: 'f6', text: 'Sana Aziz resolved WJ-1005.', at: hoursAgo(15) },
  { id: 'f7', text: 'Jonas Lindqvist raised the priority of WJ-1023 to Urgent.', at: hoursAgo(20) },
  { id: 'f8', text: 'Lena Fischer thanked the team on WJ-1006.', at: hoursAgo(28) },
  { id: 'f9', text: 'Mara Okafor closed WJ-1007 after the replacement arrived.', at: hoursAgo(55) },
  { id: 'f10', text: 'Kofi Mensah opened WJ-1026.', at: hoursAgo(60) },
  { id: 'f11', text: 'Priya Nair resolved WJ-1003.', at: hoursAgo(80) },
];
