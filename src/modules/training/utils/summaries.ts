import { formatKg } from '@/shared/utils';
import type { Session } from '@/shared/validators';

export const liftSummary = (session: Session): string[] => {
  const lines = session.lifts.map((lift) => {
    const logged = session.log.lifts?.[lift.key];
    const load = (kg: number): string => (lift.bodyweight ? '' : ` @ +${formatKg(kg)}`);
    if (session.status === 'done' && logged) {
      return `${lift.name} · ${logged.map((s) => s.reps).join('/')}${load(Math.min(...logged.map((s) => s.kg)))}`;
    }
    return `${lift.name} · ${lift.sets}×${lift.repMin}–${lift.repMax}${load(lift.load)}`;
  });
  if (lines.length > 0) return lines;
  return session.skill ? [session.skill.name] : [];
};
