'use client';

/** Tracks completed lab tasks (build steps inside lessons) for the session. */
const KEY = 'cq-tasks-done';

export function getDoneTasks(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

export function markTaskDone(key: string): void {
  const s = getDoneTasks();
  s.add(key);
  sessionStorage.setItem(KEY, JSON.stringify([...s]));
}
