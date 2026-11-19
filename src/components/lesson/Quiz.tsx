'use client';

import { useMemo, useState } from 'react';
import type { Question } from '@/content/types';
import { CircuitView } from '@/components/circuit/CircuitView';
import { CircuitPickArt } from './CircuitPickArt';
import { PartIcon } from '@/parts/visuals';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/stores/settings';
import { sfx } from '@/lib/sfx';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizProps {
  questions: Question[];
  onDone: (score: number, total: number, firstTryCorrect: number) => void;
}

interface AnswerState {
  qIndex: number;
  picked: number | boolean | null;
  correct: boolean;
  firstTry: boolean;
}

export function Quiz({ questions, onDone }: QuizProps) {
  const { t, tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [picked, setPicked] = useState<number | boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const score = useMemo(() => answers.filter((a) => a.correct).length, [answers]);
  const firstTryCorrect = useMemo(() => answers.filter((a) => a.firstTry).length, [answers]);

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-6">
        <div className="text-6xl mb-3">{pct === 100 ? '🏆' : pct >= 70 ? '🎉' : '💪'}</div>
        <p className="text-lg font-bold">{t('lesson.score', { score, total: questions.length })}</p>
        <p className={`mt-1 font-semibold ${pct >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
          {pct >= 70 ? t('lesson.passed') : t('lesson.failed')}
        </p>
        <div className="mt-4 flex gap-2 justify-center">
          {pct < 100 && (
            <Button
              variant="outline"
              onClick={() => {
                setAnswers([]);
                setIndex(0);
                setPicked(null);
                setRevealed(false);
                setFinished(false);
              }}
            >
              {t('lesson.retryQuiz')}
            </Button>
          )}
          <Button className="bg-teal-600 hover:bg-teal-700 font-bold" onClick={() => onDone(score, questions.length, firstTryCorrect)}>
            {t('lesson.next')}
          </Button>
        </div>
      </div>
    );
  }

  const pick = (v: number | boolean) => {
    if (revealed) return;
    setPicked(v);
  };

  const check = () => {
    if (picked === null || revealed) return;
    let correct = false;
    if (q.type === 'trueFalse') correct = picked === q.answer;
    else correct = picked === q.answer;
    const alreadyAnswered = answers.find((a) => a.qIndex === index);
    setAnswers((prev) => [
      ...prev.filter((a) => a.qIndex !== index),
      { qIndex: index, picked, correct, firstTry: correct && !alreadyAnswered },
    ]);
    setRevealed(true);
    // celebration: applause on every correct answer
    if (correct) sfx.applause();
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      // include the current answer in scoring
      const finalAnswers = [...answers.filter((a) => a.qIndex !== index), { qIndex: index, picked, correct: picked === q.answer, firstTry: true }];
      const sc = finalAnswers.filter((a) => a.correct).length;
      const first = finalAnswers.filter((a) => a.firstTry && a.correct).length;
      setFinished(true);
      onDone(sc, questions.length, first);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setRevealed(false);
  };

  const optionStyle = (i: number) => {
    if (!revealed) return picked === i ? 'border-teal-600 bg-teal-50' : 'border-slate-200 bg-white';
    if (i === q.answer) return 'border-emerald-500 bg-emerald-50';
    if (picked === i && i !== q.answer) return 'border-rose-400 bg-rose-50';
    return 'border-slate-200 bg-white opacity-60';
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-4">
        {questions.map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < index ? 'bg-teal-500' : i === index ? 'bg-teal-300' : 'bg-slate-200'}`} />
        ))}
      </div>

      <p className="text-lg font-bold mb-4 leading-snug">{tx(q.prompt)}</p>

      {(q.type === 'diagnose') && (
        <div className="cq-canvas-grid rounded-2xl border mb-4 h-56">
          <CircuitView doc={q.circuit} snapshot={null} running={false} showFlow={false} />
        </div>
      )}
      {q.type === 'identify' && (
        <div className="rounded-2xl border bg-white mb-4 py-4 flex justify-center">
          <PartIcon type={q.partType} size={90} />
        </div>
      )}

      <div className="space-y-2">
        {q.type === 'trueFalse' ? (
          <div className="grid grid-cols-2 gap-3">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                onClick={() => pick(v)}
                className={`rounded-2xl border-2 py-5 text-lg font-extrabold transition-all ${optionStyle(v === true ? 0 : 1).replace('border-teal-600 bg-teal-50', picked === v ? 'border-teal-600 bg-teal-50' : '')}`}
              >
                {v ? `👍 ${t('quiz.true')}` : `👎 ${t('quiz.false')}`}
              </button>
            ))}
          </div>
        ) : (
          (q.type === 'mcq' || q.type === 'diagnose' || q.type === 'identify') &&
          q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              className={`w-full rounded-2xl border-2 px-4 py-3.5 text-start font-semibold transition-all ${optionStyle(i)} ${motion ? 'active:scale-[0.99]' : ''}`}
            >
              <span className="inline-flex w-7 h-7 rounded-full bg-slate-100 items-center justify-center text-sm font-bold me-2">
                {String.fromCharCode(65 + i)}
              </span>
              {tx(opt)}
              {revealed && i === q.answer && <CheckCircle2 className="inline w-5 h-5 ms-2 text-emerald-600" />}
              {revealed && picked === i && i !== q.answer && <XCircle className="inline w-5 h-5 ms-2 text-rose-500" />}
            </button>
          ))
        )}
        {/* pick-the-circuit: options are simple drawn circuit pictures */}
        {q.type === 'circuitPick' &&
          q.variants.map((variant, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              className={`w-full rounded-2xl border-2 p-2.5 transition-all ${optionStyle(i)} ${motion ? 'active:scale-[0.99]' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex w-7 h-7 shrink-0 rounded-full bg-slate-100 items-center justify-center text-sm font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <div className="h-32 flex-1 min-w-0 rounded-xl bg-white">
                  <CircuitPickArt variant={variant} />
                </div>
                <span className="w-5 shrink-0">
                  {revealed && i === q.answer && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {revealed && picked === i && i !== q.answer && <XCircle className="w-5 h-5 text-rose-500" />}
                </span>
              </div>
            </button>
          ))}
      </div>

      {revealed && (
        <div className="mt-4 rounded-2xl bg-slate-50 border p-4">
          <p className="font-bold text-sm mb-1">
            {answers.find((a) => a.qIndex === index)?.correct ? `✅ ${t('quiz.correct')}` : `❌ ${t('quiz.wrong')}`}
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-bold">{t('quiz.why')} </span>
            {tx(q.explanation)}
          </p>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        {!revealed ? (
          <Button className="h-12 px-8 font-bold bg-teal-600 hover:bg-teal-700" disabled={picked === null} onClick={check}>
            {t('lesson.check')}
          </Button>
        ) : (
          <Button className="h-12 px-8 font-bold bg-teal-600 hover:bg-teal-700" onClick={next}>
            {index + 1 >= questions.length ? t('lesson.finish') : t('lesson.next')}
          </Button>
        )}
      </div>
    </div>
  );
}
