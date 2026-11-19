'use client';

import { useMemo, useState } from 'react';
import { PROJECTS } from '@/content/projects';
import { CHALLENGES } from '@/content/challenges';
import { LEVELS } from '@/content';
import type { Challenge, Project } from '@/content/types';
import { useProgress } from '@/stores/progress';
import { useLab } from '@/stores/lab';
import { useI18n } from '@/lib/i18n';
import { navigate } from '@/lib/router';
import { markTaskDone } from '@/lib/taskProgress';
import { Button } from '@/components/ui/button';
import { PartIcon } from '@/parts/visuals';
import { CheckCircle2, Play, Lock, ArrowLeft, Wrench, Trophy, Lightbulb } from 'lucide-react';

// ------------------------------------------------------------------ PROJECTS

export function ProjectsScreen() {
  const { t, tx } = useI18n();
  const completedProjects = useProgress((s) => s.completedProjects);
  const completedLessons = useProgress((s) => s.completedLessons);
  const completed = useMemo(() => new Set(Object.keys(completedLessons)), [completedLessons]);

  return (
    <div className="p-4 pb-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-1">{t('projects.title')}</h1>
      <p className="text-sm text-slate-500 font-semibold mb-5">{t('projects.subtitle')}</p>
      <div className="space-y-3">
        {LEVELS.filter((l) => l.index <= 2).map((level) => {
          const projects = PROJECTS.filter((p) => p.levelId === level.id);
          if (projects.length === 0) return null;
          const levelUnlocked = level.index === 0 || completed.size > 0;
          return (
            <section key={level.id}>
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400 mb-2">
                {level.index}. {tx(level.title)}
              </p>
              <div className="grid gap-2">
                {projects.map((project) => {
                  const done = Boolean(completedProjects[project.id]);
                  return (
                    <button
                      key={project.id}
                      disabled={!levelUnlocked}
                      onClick={() => navigate({ screen: 'project', id: project.id })}
                      className={`w-full flex items-center gap-3 rounded-2xl border-2 p-3.5 text-start active:scale-[0.99] transition-transform ${
                        done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl shrink-0">
                        {project.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold leading-tight">{tx(project.title)}</p>
                        <p className="text-[11px] text-slate-500 font-semibold line-clamp-1">{tx(project.objective)}</p>
                      </div>
                      {done ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="text-xs font-extrabold text-amber-600 shrink-0">{t('lesson.xpEarned', { xp: project.xp })}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ PROJECT PLAYER

export function ProjectPlayer({ project }: { project: Project }) {
  const { t, tx } = useI18n();
  const progress = useProgress();
  const setTask = useLab((s) => s.setTask);
  const doneTasks = useMemo(() => new Set<string>(), []);
  const [step, setStep] = useState(0);
  const [celebrated, setCelebrated] = useState(false);

  void doneTasks;

  const openStep = (index: number) => {
    const s = project.steps[index];
    setTask({
      goal: s.task.goal,
      brief: s.task.brief,
      hints: s.task.hints,
      startCircuit: s.task.startCircuit,
      taskId: `${project.id}:${index}`,
      returnTo: `#/projects/${project.id}`,
    });
    navigate({ screen: 'lab' });
  };

  const stepDone = (index: number) => {
    try {
      return JSON.parse(sessionStorage.getItem('cq-tasks-done') ?? '[]').includes(`${project.id}:${index}`);
    } catch {
      return false;
    }
  };

  const allDone = project.steps.every((_, i) => stepDone(i));

  const celebrate = () => {
    if (!celebrated) {
      progress.completeProject(project.id);
      setCelebrated(true);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ screen: 'projects' })} aria-label={t('lesson.back')}>
          <ArrowLeft className="w-6 h-6 cq-flip-rtl" />
        </Button>
        <p className="font-extrabold truncate">{project.emoji} {tx(project.title)}</p>
      </header>

      <main className="flex-1 overflow-y-auto cq-scroll px-4 py-5 max-w-2xl w-full mx-auto space-y-5">
        <div className="rounded-2xl bg-white border p-4">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold">{tx(project.intro)}</p>
          <p className="mt-2 text-sm font-bold text-teal-700">🎯 {tx(project.objective)}</p>
        </div>

        <section>
          <h2 className="font-extrabold mb-2">{t('project.materials')}</h2>
          <div className="flex gap-2 flex-wrap">
            {project.materials.map((m) => (
              <div key={m} className="rounded-xl border bg-white p-2 w-[86px] flex flex-col items-center">
                <PartIcon type={m} size={38} />
                <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">
                  {t(`part.${m}.name`)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-extrabold mb-2">{t('project.steps')}</h2>
          <div className="space-y-2">
            {project.steps.map((s, i) => {
              const done = stepDone(i);
              return (
                <div key={i} className={`rounded-2xl border-2 p-4 ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                  <p className="text-xs font-extrabold text-slate-400 uppercase">{t('project.step', { n: i + 1, total: project.steps.length })}</p>
                  <p className="font-bold mt-1 leading-snug">{tx(s.instruction)}</p>
                  <p className="text-sm font-semibold text-teal-700 mt-1">🎯 {tx(s.task.brief)}</p>
                  {done ? (
                    <p className="font-extrabold text-emerald-600 mt-2">✅ {t('lesson.taskDone')}</p>
                  ) : (
                    <Button className="mt-3 h-11 font-bold bg-teal-600 hover:bg-teal-700" onClick={() => openStep(i)}>
                      {t('project.openLab')} <Wrench className="w-4 h-4 ms-1" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {allDone && (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-5 text-center">
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-xl font-extrabold">{t('project.complete')}</p>
            <p className="text-emerald-100 font-bold text-sm mt-1">{t('lesson.xpEarned', { xp: project.xp })}</p>
            {!progress.completedProjects[project.id] && (
              <Button className="mt-3 h-11 bg-white text-emerald-700 hover:bg-emerald-50 font-extrabold" onClick={celebrate}>
                <Trophy className="w-5 h-5 me-1.5" /> {t('project.claimReward')}
              </Button>
            )}
          </div>
        )}

        <section className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <h2 className="font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-5 h-5" /> {t('project.troubleshooting')}
          </h2>
          <div className="space-y-3">
            {project.troubleshooting.map((tr, i) => (
              <div key={i} className="text-sm">
                <p className="font-bold text-amber-900">❓ {tx(tr.symptom)}</p>
                <p className="text-amber-800 font-semibold">→ {tx(tr.cause)}</p>
                <p className="text-amber-900">🔧 {tx(tr.fix)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// ------------------------------------------------------------------ CHALLENGES

export function ChallengesScreen() {
  const { t, tx } = useI18n();
  const progress = useProgress();
  const setTask = useLab((s) => s.setTask);
  const completedLessons = useProgress((s) => s.completedLessons);
  const completed = useMemo(() => new Set(Object.keys(completedLessons)), [completedLessons]);

  const startChallenge = (ch: Challenge) => {
    setTask({
      goal: ch.goal,
      brief: ch.brief,
      hints: ch.hints,
      startCircuit: ch.startCircuit,
      rewardId: ch.id,
      returnTo: '#/challenges',
      taskId: `challenge:${ch.id}`,
    });
    navigate({ screen: 'lab' });
  };

  return (
    <div className="p-4 pb-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-violet-600" /> {t('challenges.title')}
      </h1>
      <p className="text-sm text-slate-500 font-semibold mb-5">{t('challenges.subtitle')}</p>
      <div className="space-y-3">
        {CHALLENGES.map((ch) => {
          const solved = Boolean(progress.solvedChallenges[ch.id]);
          return (
            <div
              key={ch.id}
              className={`rounded-2xl border-2 p-4 ${solved ? 'bg-emerald-50 border-emerald-200' : ch.kind === 'troubleshoot' ? 'bg-rose-50/60 border-rose-200' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center text-2xl shrink-0">{ch.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold leading-tight">{tx(ch.title)}</p>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${ch.kind === 'troubleshoot' ? 'bg-rose-200 text-rose-800' : 'bg-teal-100 text-teal-800'}`}>
                    {ch.kind === 'troubleshoot' ? t('challenges.troubleshoot') : t('challenges.build')}
                  </span>
                </div>
                {solved && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />}
              </div>
              <p className="text-sm text-slate-600 font-semibold mt-2">{tx(ch.brief)}</p>
              {ch.kind === 'troubleshoot' && !solved && (
                <p className="text-xs font-bold text-rose-600 mt-1">🔍 {t('challenge.brokenCircuit')}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <Button
                  className="h-10 font-bold bg-violet-600 hover:bg-violet-700"
                  onClick={() => startChallenge(ch)}
                >
                  <Play className="w-4 h-4 me-1" /> {solved ? t('challenges.done') : t('challenges.start')}
                </Button>
                {!solved && <span className="text-xs font-extrabold text-amber-600">{t('challenges.xpNoHints')}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 rounded-2xl bg-slate-100 border border-dashed p-4 text-center text-sm font-semibold text-slate-400">
        🔜 {t('challenges.moreSoon')}
      </div>
    </div>
  );
}
