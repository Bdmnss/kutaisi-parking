export const money = (n) => `${Number(n).toFixed(n % 1 ? 2 : 0)} GEL`;
