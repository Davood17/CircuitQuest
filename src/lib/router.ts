'use client';

import { useSyncExternalStore } from 'react';

/**
 * Hash-based router — keeps the app a single Next.js route (`/`) while giving
 * every screen a deep-linkable URL (`#/learn/lesson-0-3`). Mirrors the
 * architecture's route map; swaps trivially to file routes when packaged
 * with Capacitor or when file routes become available.
 */

export type Route =
  | { screen: 'home' }
  | { screen: 'learn' }
  | { screen: 'lesson'; id: string }
  | { screen: 'lab' }
  | { screen: 'projects' }
  | { screen: 'project'; id: string }
  | { screen: 'challenges' }
  | { screen: 'progress' }
  | { screen: 'profile' }
  | { screen: 'settings' };

export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '');
  const [head, id] = clean.split('/');
  switch (head) {
    case 'learn':
      return id ? { screen: 'lesson', id } : { screen: 'learn' };
    case 'lesson':
      return { screen: 'lesson', id: id ?? '' };
    case 'lab':
      return { screen: 'lab' };
    case 'projects':
      return id ? { screen: 'project', id } : { screen: 'projects' };
    case 'project':
      return { screen: 'project', id: id ?? '' };
    case 'challenges':
      return { screen: 'challenges' };
    case 'progress':
      return { screen: 'progress' };
    case 'profile':
      return { screen: 'profile' };
    case 'settings':
      return { screen: 'settings' };
    default:
      return { screen: 'home' };
  }
}

export function navigate(route: Route): void {
  const map: Record<Route['screen'], string> = {
    home: '#/',
    learn: '#/learn',
    lesson: '#/learn',
    lab: '#/lab',
    projects: '#/projects',
    project: '#/projects',
    challenges: '#/challenges',
    progress: '#/progress',
    profile: '#/profile',
    settings: '#/settings',
  };
  const base = map[route.screen];
  const id = 'id' in route && route.id ? `/${route.id}` : '';
  if (typeof window !== 'undefined') {
    window.location.hash = `${base}${id}`;
  }
}

const HOME_ROUTE: Route = { screen: 'home' };

/** cached current route — getSnapshot must return a stable reference */
let currentRoute: Route = typeof window !== 'undefined' ? parseHash(window.location.hash) : HOME_ROUTE;

function subscribe(cb: () => void) {
  const handler = () => {
    currentRoute = parseHash(window.location.hash);
    cb();
  };
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
}

export function useRoute(): Route {
  return useSyncExternalStore(
    subscribe,
    () => currentRoute,
    () => HOME_ROUTE, // stable server snapshot
  );
}
