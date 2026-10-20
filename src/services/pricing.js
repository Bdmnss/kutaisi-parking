export const DAY_MS = 24 * 60 * 60 * 1000;

export function countDays(from, to) {
  const ms = new Date(to) - new Date(from);
  if (!(ms > 0)) return 0;
  return Math.ceil(ms / DAY_MS);
}

/**
 * Rules: 1 free day if the customer buys or already has a GLOBALCELL eSIM.
 * Parking voucher applies after the free day. eSIM voucher applies to the eSIM price.
 */
export function calculateTotal({ days, rate, hasEsim, esimPrice = 0, voucher }) {
  const freeDays = hasEsim && days > 0 ? 1 : 0;
  const parkingGross = days * rate;
  const freeDiscount = freeDays * rate;
  const parkingAfterFree = parkingGross - freeDiscount;
  const applyVoucher = (base) => {
    if (!voucher) return 0;
    const d = voucher.type === 'percent' ? (base * voucher.value) / 100 : voucher.value;
    return Math.min(base, Math.round(d * 100) / 100);
  };
  const parkingVoucher = voucher?.appliesTo === 'parking' ? applyVoucher(parkingAfterFree) : 0;
  const esimVoucher = voucher?.appliesTo === 'esim' ? applyVoucher(esimPrice) : 0;
  const parking = parkingAfterFree - parkingVoucher;
  const esim = esimPrice - esimVoucher;
  return { days, freeDays, parkingGross, freeDiscount, parkingVoucher, esimVoucher, parking, esim, total: parking + esim };
}
