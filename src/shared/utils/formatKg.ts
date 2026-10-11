const KG_DECIMALS = 100;

export const formatKg = (kg: number): string => String(Math.round(kg * KG_DECIMALS) / KG_DECIMALS);
