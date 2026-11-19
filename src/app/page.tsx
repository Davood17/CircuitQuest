'use client';

import { useEffect } from 'react';
import { useRoute, navigate } from '@/lib/router';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { useSettings } from '@/stores/settings';
import { useLab } from '@/stores/lab';
import { useProgress } from '@/stores/progress';
import { markTaskDone } from '@/lib/taskProgress';
import { LESSON_MAP, LEVELS, PROJECTS } from '@/content';
import { HomeScreen, LearnScreen, ProgressScreen, ProfileScreen, SettingsScreen } from '@/screens/main';
import { ProjectsScreen, ProjectPlayer, ChallengesScreen } from '@/screens/activities';
import { LabScreen } from '@/components/circuit/LabScreen';
import { LessonPlayer } from '@/components/lesson/LessonPlayer';
import { Home as HomeIcon, BookOpen, CircuitBoard, Wrench, User } from 'lucide-react';

function LessonNotFound() {
  const { t } = useI18n();
  return (
    <div className="p-8 text-center font-bold text-slate-400">
      {t('lesson.notFound')}{' '}
      <button className="text-teal-700 underline" onClick={() => navigate({ screen: 'learn' })}>
        {t('lesson.back')}
      </button>
    </div>
  );
}

function ProjectNotFound() {
  const { t } = useI18n();
  return <div className="p-8 text-center font-bold text-slate-400">{t('project.notFound')}</div>;
}

function TabBar() {
  const { t } = useI18n();
  const route = useRoute();
  const tabs = [
    { screen: 'home' as const, icon: HomeIcon, label: t('nav.home') },
    { screen: 'learn' as const, icon: BookOpen, label: t('nav.learn') },
    { screen: 'lab' as const, icon: CircuitBoard, label: t('nav.lab') },
    { screen: 'projects' as const, icon: Wrench, label: t('nav.projects') },
    { screen: 'progress' as const, icon: User, label: t('nav.me') },
  ];
  const active = route.screen === 'lesson' || route.screen === 'project' ? null : route.screen;
  return (
    <nav
      className="sticky bottom-0 z-30 bg-white/95 backdrop-blur border-t flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="main navigation"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.screen || (tab.screen === 'progress' && (route.screen === 'profile' || route.screen === 'settings'));
        return (
          <button
            key={tab.screen}
            onClick={() => navigate({ screen: tab.screen })}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 min-h-[56px] font-bold text-[10px] transition-colors ${
              isActive ? 'text-teal-700' : 'text-slate-400'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <tab.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function Shell() {
  const route = useRoute();
  const { lang } = useI18n();
  const textSize = useSettings((s) => s.textSize);
  const motion = useSettings((s) => s.motion);
  const highContrast = useSettings((s) => s.highContrast);
  const setTask = useLab((s) => s.setTask);

  useEffect(() => {
    document.documentElement.setAttribute('data-cq-contrast', highContrast ? 'high' : 'normal');
    document.documentElement.style.fontSize = textSize === 'small' ? '14px' : textSize === 'medium' ? '16px' : '19px';
  }, [highContrast, textSize]);

  // keep <html lang/dir> in sync with the chosen language (Persian = RTL)
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);

  // scroll to top on screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const onTaskComplete = () => {
    const task = useLab.getState().task;
    if (task?.taskId) markTaskDone(task.taskId);
    setTask(null);
    if (task?.returnTo) {
      window.location.hash = task.returnTo;
    } else {
      navigate({ screen: 'lab' });
    }
  };

  let content: React.ReactNode = null;
  switch (route.screen) {
    case 'home':
      content = <HomeScreen />;
      break;
    case 'learn':
      content = <LearnScreen />;
      break;
    case 'lesson': {
      const lesson = LESSON_MAP.get(route.id);
      content = lesson ? (
        <LessonPlayer lesson={lesson} />
      ) : (
        <LessonNotFound />
      );
      break;
    }
    case 'lab':
      content = (
        <div className="max-w-3xl mx-auto w-full">
          <LabScreen onTaskComplete={onTaskComplete} />
        </div>
      );
      break;
    case 'projects':
      content = <ProjectsScreen />;
      break;
    case 'project': {
      const project = PROJECTS.find((p) => p.id === route.id);
      content = project ? (
        <ProjectPlayer project={project} />
      ) : (
        <ProjectNotFound />
      );
      break;
    }
    case 'challenges':
      content = <ChallengesScreen />;
      break;
    case 'progress':
      content = <ProgressScreen />;
      break;
    case 'profile':
      content = <ProfileScreen />;
      break;
    case 'settings':
      content = <SettingsScreen />;
      break;
  }

  const fullScreen = route.screen === 'lesson' || route.screen === 'project';

  return (
    <div
      lang={lang}
      className="min-h-[100dvh] bg-background text-foreground flex flex-col"
      style={{ ['--motion' as never]: motion ? '1' : '0' }}
    >
      <div className={fullScreen ? 'flex-1' : 'flex-1'}>{content}</div>
      {!fullScreen && <TabBar />}
    </div>
  );
}

export default function Page() {
  useEffect(() => {
    // dev/e2e handle: exposes stores to automated tests (stripped in production builds by usage guard)
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as Record<string, unknown>).__cq = { lab: useLab, progress: useProgress };
    }
  }, []);
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  );
}

// keep LEVELS referenced for potential future level-count UI
void LEVELS;
