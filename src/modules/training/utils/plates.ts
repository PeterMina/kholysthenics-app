import { PLATES_KG } from '@/modules/training/constants';

const EPSILON = 1e-9;

export const plateStack = (kg: number): number[] => {
  const plates: number[] = [];
  let rest = kg;
  for (const plate of PLATES_KG) {
    while (rest >= plate - EPSILON) {
      plates.push(plate);
      rest -= plate;
    }
  }
  return plates;
};
