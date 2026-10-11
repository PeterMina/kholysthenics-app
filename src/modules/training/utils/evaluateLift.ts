import { DEFAULT_FAST_INCREMENT_KG, DEFAULT_INCREMENT_KG } from '@/modules/training/constants';
import { formatKg } from '@/shared/utils';
import type { Lift, LoggedSet } from '@/shared/validators';

export interface SetEntry {
  reps: number | null;
  kg: number | null;
}

export type VerdictState = 'pending' | 'up' | 'hold' | 'drop' | 'cap';

export interface Verdict {
  state: VerdictState;
  label: string;
  message: string;
  kgUsed: number | null;
  nextLoad: number | null;
}

interface FilledSet {
  reps: number;
  kg: number | null;
}

const isCapped = (lift: Lift, kgUsed: number): boolean =>
  lift.progress === 'reps' || (lift.maxLoad !== undefined && kgUsed >= lift.maxLoad);

const holdLabel = (capped: boolean, kgUsed: number): string =>
  capped || kgUsed === 0 ? 'the load' : `+${formatKg(kgUsed)} kg`;

const upVerdict = (lift: Lift, kgUsed: number): Verdict => {
  const belowBest = lift.best !== null && kgUsed < lift.best;
  const step = belowBest ? lift.incrementFast ?? DEFAULT_FAST_INCREMENT_KG : lift.increment ?? DEFAULT_INCREMENT_KG;
  const nextLoad = kgUsed + step;
  const why = belowBest ? 'Below your best, so the fast jump.' : 'New ground, so the slow jump.';
  return {
    state: 'up', label: `+${formatKg(step)} kg`, kgUsed, nextLoad,
    message: `All sets at ${lift.repMax}. Next ${lift.name.toLowerCase()}: +${formatKg(nextLoad)} kg. ${why}`,
  };
};

const missVerdict = (lift: Lift, kgUsed: number, capped: boolean, previous: readonly LoggedSet[] | null): Verdict => {
  const missedBefore = previous?.some((e) => e.reps < lift.repMin) ?? false;
  if (missedBefore && !capped) {
    const nextLoad = Math.max(0, kgUsed - (lift.increment ?? DEFAULT_INCREMENT_KG));
    return {
      state: 'drop', label: 'Drop', kgUsed, nextLoad,
      message: `Below ${lift.repMin} reps two sessions running. Drop one step to +${formatKg(nextLoad)} kg.`,
    };
  }
  return {
    state: 'hold', label: 'Hold', kgUsed, nextLoad: null,
    message: `Below ${lift.repMin} reps on a set. Keep ${holdLabel(capped, kgUsed)}. A second miss in a row drops one step.`,
  };
};

export const evaluateLift = (
  lift: Lift,
  entries: readonly SetEntry[],
  previous: readonly LoggedSet[] | null,
): Verdict => {
  const filled = entries.slice(0, lift.sets).filter((e): e is FilledSet => e.reps !== null);
  if (filled.length < lift.sets) {
    return { state: 'pending', label: 'Live', message: `${filled.length} of ${lift.sets} sets entered.`, kgUsed: null, nextLoad: null };
  }
  const kgUsed = lift.bodyweight ? 0 : Math.min(...filled.map((e) => e.kg ?? lift.load));
  const capped = isCapped(lift, kgUsed);
  const allTop = filled.every((e) => e.reps >= lift.repMax);
  if (allTop && capped) {
    return {
      state: 'cap', label: 'Top', kgUsed, nextLoad: null,
      message: `${lift.repMax} on every set at the ${formatKg(lift.maxLoad ?? kgUsed)} kg cap. Load stays. Next: slow the tempo, then a harder step on the pistol ladder.`,
    };
  }
  if (allTop) return upVerdict(lift, kgUsed);
  if (filled.some((e) => e.reps < lift.repMin)) return missVerdict(lift, kgUsed, capped, previous);
  return {
    state: 'hold', label: 'Hold', kgUsed, nextLoad: null,
    message: `In range. Keep ${holdLabel(capped, kgUsed)} until every set hits ${lift.repMax}.`,
  };
};
