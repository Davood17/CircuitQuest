'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Lesson } from '@/content/types';
import { CHALLENGE_KINDS, Scene } from './scenes';
import { MiniLab } from '@/components/circuit/CircuitView';
import { Quiz } from './Quiz';
import { RobotSpeech } from './RobotSpeech';
import { navigate } from '@/lib/router';
import { getDoneTasks } from '@/lib/taskProgress';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';
import { useLab } from '@/stores/lab';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles, Wrench } from 'lucide-react';

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const { t, tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const progress = useProgress();
  const setTask = useLab((s) => s.setTask);
  const [step, setStep] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number } | null>(null);
  const [xpShown, setXpShown] = useState<number | null>(null);
  /** lesson gates (user rule): the child must HEAR the whole teacher speech
   *  and FINISH the requested mission before the next button unlocks */
  const [speechDone, setSpeechDone] = useState(false);
  const [taskDone, setTaskDone] = useState(false);
  const startTime = useRef(Date.now());
  const doneTasks = useRef<Set<string>>(getDoneTasks());

  const screens = lesson.screens;
  const screen = screens[step];
  const isLast = step === screens.length - 1;
  const total = screens.length;

  useEffect(() => {
    setStep(0);
    setQuizResult(null);
    setXpShown(null);
    setHintsUsed(0);
    setSpeechDone(false);
    setTaskDone(false);
    doneTasks.current = getDoneTasks();
    startTime.current = Date.now();
  }, [lesson.id]);

  // re-arm the gates on every page turn
  useEffect(() => {
    setSpeechDone(false);
    setTaskDone(false);
  }, [step]);

  const finishLesson = () => {
    const seconds = Math.round((Date.now() - startTime.current) / 1000);
    const passed = (quizResult?.score ?? 0) / Math.max(1, quizResult?.total ?? 1) >= 0.7;
    if (passed) {
      progress.completeLesson(lesson.id, { hintsUsed, timeSpent: seconds });
      const first = !progress.completedLessons[lesson.id];
      setXpShown(first ? 50 : 0);
      progress.recordQuiz(lesson.id, Math.round(((quizResult?.score ?? 0) / Math.max(1, quizResult?.total ?? 1)) * 100));
      const perf = (quizResult?.score ?? 0) / Math.max(1, quizResult?.total ?? 1);
      progress.updateAdaptive(lesson.id, perf, perf < 0.7);
    } else {
      progress.recordQuiz(lesson.id, Math.round(((quizResult?.score ?? 0) / Math.max(1, quizResult?.total ?? 1)) * 100));
      progress.updateAdaptive(lesson.id, 0, true);
    }
    navigate({ screen: 'learn' });
  };

  const openTask = (screenIndex: number) => {
    if (screen.type !== 'build') return;
    setTask({
      goal: screen.task.goal,
      brief: screen.task.brief,
      hints: screen.task.hints,
      startCircuit: screen.task.startCircuit,
      taskId: `${lesson.id}:${screenIndex}`,
      returnTo: `#/learn/${lesson.id}`,
    });
    navigate({ screen: 'lab' });
  };

  const body = () => {
    switch (screen.type) {
      case 'explain':
        if (screen.speaker === 'robot') {
          // the teacher robot speaks the body inside a speech bubble
          return (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-extrabold leading-snug">{tx(screen.title)}</h2>
                <span aria-hidden className="mt-1.5 block h-1.5 w-20 rounded-full bg-gradient-to-r from-teal-400 via-amber-300 to-teal-400" />
              </div>
              <RobotSpeech key={screen.body.en} text={tx(screen.body)} onDone={() => setSpeechDone(true)} />
              {screen.scene && <Scene spec={screen.scene} animated={motion} onTaskDone={() => setTaskDone(true)} />}
              {screen.tip && (
                <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-3.5 text-sm font-bold text-amber-900 shadow-sm">
                  💡 {tx(screen.tip)}
                </div>
              )}
              {screen.ask && (
                <div className="rounded-3xl bg-teal-50 border-2 border-teal-200 p-4 shadow-sm">
                  <p className="text-[15.5px] font-extrabold leading-relaxed text-teal-900">
                    <span className="inline-flex w-8 h-8 rounded-full bg-teal-600 text-white items-center justify-center me-2 align-middle">🤔</span>
                    {tx(screen.ask)}
                  </p>
                </div>
              )}
            </div>
          );
        }
        return (
          <div className="space-y-4">
            {screen.scene && <Scene spec={screen.scene} animated={motion} />}
            <h2 className="text-2xl font-extrabold leading-snug">{tx(screen.title)}</h2>
            <p className="text-[17px] leading-relaxed text-slate-700 whitespace-pre-line">{tx(screen.body)}</p>
            {screen.tip && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-sm font-semibold text-amber-900">
                💡 {tx(screen.tip)}
              </div>
            )}
            {screen.ask && (
              <div className="rounded-2xl bg-teal-50 border-2 border-teal-200 p-4">
                <p className="text-[15.5px] font-bold leading-relaxed text-teal-900">
                  <span className="inline-flex w-8 h-8 rounded-full bg-teal-600 text-white items-center justify-center me-2 align-middle">🤔</span>
                  {tx(screen.ask)}
                </p>
              </div>
            )}
          </div>
        );
      case 'animation':
        return (
          <div className="space-y-4">
            <Scene spec={screen.anim} animated={motion} />
            <h2 className="text-2xl font-extrabold">{tx(screen.title)}</h2>
            {screen.body && <p className="text-[17px] leading-relaxed text-slate-700 whitespace-pre-line">{tx(screen.body)}</p>}
          </div>
        );
      case 'demo':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold">{tx(screen.title)}</h2>
            {screen.body && <p className="text-[17px] leading-relaxed text-slate-700 whitespace-pre-line">{tx(screen.body)}</p>}
            <MiniLab spec={screen.demo} />
          </div>
        );
      case 'build': {
        const done = doneTasks.current.has(`${lesson.id}:${step}`);
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold flex items-center gap-2">
              <Wrench className="w-6 h-6 text-teal-600" /> {tx(screen.title)}
            </h2>
            {screen.body && <p className="text-[17px] leading-relaxed text-slate-700 whitespace-pre-line">{tx(screen.body)}</p>}
            <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-4">
              <p className="font-bold text-teal-900 mb-3">🎯 {tx(screen.task.brief)}</p>
              {done ? (
                <p className="font-extrabold text-emerald-600">✅ {t('lesson.taskDone')}</p>
              ) : (
                <Button className="h-12 px-6 font-bold bg-teal-600 hover:bg-teal-700" onClick={() => openTask(step)}>
                  {t('lesson.openLab')} <ArrowRight className="w-5 h-5 ms-1 cq-flip-rtl" />
                </Button>
              )}
            </div>
          </div>
        );
      }
      case 'quiz':
        return (
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" /> {screen.title ? tx(screen.title) : t('lesson.quiz')}
            </h2>
            {screen.scene && <Scene spec={screen.scene} animated={motion} />}
            {screen.body && screen.speaker === 'robot' && (
              <RobotSpeech key={screen.body.en} text={tx(screen.body)} onDone={() => setSpeechDone(true)} />
            )}
            <Quiz
              questions={lesson.quiz}
              onDone={(score, totalQ) => setQuizResult({ score, total: totalQ })}
            />
          </div>
        );
      case 'reward': {
        const passed = (quizResult?.score ?? 0) / Math.max(1, quizResult?.total ?? 1) >= 0.7;
        return (
          <div className="text-center py-8">
            {screen.scene && (
              <div className="mb-5 text-start">
                <Scene spec={screen.scene} animated={motion} />
              </div>
            )}
            <div className={`text-7xl mb-4 ${motion ? 'cq-pop' : ''}`}>{passed ? '🏅' : '🔁'}</div>
            <h2 className="text-3xl font-extrabold text-teal-700 mb-2">
              {passed ? t('learn.lessonComplete') : t('lesson.failed')}
            </h2>
            {passed && lesson.rewardBadge && (
              <p className="inline-block rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-1.5 text-lg font-extrabold text-amber-600 mb-2">
                {tx(lesson.rewardBadge)}
              </p>
            )}
            {xpShown !== null && xpShown > 0 && (
              <p className="text-xl font-extrabold text-amber-500">{t('lesson.xpEarned', { xp: xpShown })}</p>
            )}
            <p className="text-slate-500 mt-2">{lesson.objectives.map((o) => `✓ ${tx(o)}`).join(' · ')}</p>
            {quizResult && (
              <p className="text-sm font-bold mt-3">
                {t('lesson.score', { score: quizResult.score, total: quizResult.total })}
              </p>
            )}
          </div>
        );
      }
    }
  };

  const needsSpeech =
    (screen.type === 'explain' || screen.type === 'quiz') && screen.speaker === 'robot' && !!screen.body;
  const isChallenge =
    screen.type === 'explain' && !!screen.scene && CHALLENGE_KINDS.has(screen.scene.kind);

  const canAdvance = useMemo(() => {
    if (screen.type === 'build') return doneTasks.current.has(`${lesson.id}:${step}`);
    if (screen.type === 'quiz')
      return (
        quizResult !== null &&
        quizResult.score / Math.max(1, quizResult.total) >= 0.7 &&
        (!needsSpeech || speechDone)
      );
    if (needsSpeech && !speechDone) return false;
    if (isChallenge && !taskDone) return false;
    return true;
  }, [screen, step, quizResult, lesson.id, needsSpeech, speechDone, isChallenge, taskDone]);

  // what the child still has to do before the next button unlocks
  const gateHint = !canAdvance && !isLast ? (!speechDone && needsSpeech ? t('lesson.gateListen') : t('lesson.gateTask')) : null;
  const nextText =
    !isLast && screen.type === 'explain' && screen.nextLabel ? tx(screen.nextLabel) : t('lesson.next');

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col">
      {/* header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label={t('lesson.back')} onClick={() => navigate({ screen: 'learn' })}>
          <ArrowLeft className="w-6 h-6 cq-flip-rtl" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold truncate">
            {lesson.emoji} {tx(lesson.title)}
          </p>
        </div>
        <div className="flex gap-1">
          {screens.map((_, i) => (
            <div key={i} className={`h-2.5 rounded-full transition-all ${i === step ? 'w-6 bg-teal-600' : i < step ? 'w-2.5 bg-teal-300' : 'w-2.5 bg-slate-200'}`} />
          ))}
        </div>
      </header>

      {/* content */}
      <main className="flex-1 overflow-y-auto cq-scroll px-4 py-5 max-w-2xl w-full mx-auto">{body()}</main>

      {/* footer nav */}
      <footer className="border-t bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto">
          {gateHint && (
            <p className="mb-2 text-center text-[13px] font-extrabold text-teal-600 animate-pulse" aria-live="polite">
              🔒 {gateHint}
            </p>
          )}
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" className="h-12 flex-1 font-bold" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="w-5 h-5 cq-flip-rtl" />
              </Button>
            )}
            {!isLast ? (
              <Button
                className="h-12 flex-[2] font-bold bg-teal-600 hover:bg-teal-700"
                disabled={!canAdvance}
                onClick={() => setStep((s) => s + 1)}
              >
                {nextText} <ArrowRight className="w-5 h-5 ms-1 cq-flip-rtl" />
              </Button>
            ) : (
              <Button className="h-12 flex-[2] font-bold bg-amber-500 hover:bg-amber-600" onClick={finishLesson}>
                {t('lesson.finish')} 🎉
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
