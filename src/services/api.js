// Mock service layer. Replace these functions with real HTTP calls when the backend is ready.
import prices from '../data/prices.json';
import esimPackages from '../data/esimPackages.json';
import vouchers from '../data/vouchers.json';
import seedBookings from '../data/bookings.json';
import faq from '../data/faq.json';

const LATENCY = 600;
const delay = (data, ms = LATENCY) => new Promise((res) => setTimeout(() => res(structuredClone(data)), ms));
const fail = (msg, ms = LATENCY) => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms));

const STORE_KEY = 'kp_bookings';
const ESIM_KEY = 'kp_esims';
const read = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const normPlate = (p) => p.replace(/[^a-z0-9]/gi, '').toUpperCase();

export const getPrices = () => delay(prices);
export const getEsimPackages = () => delay(esimPackages);
export const getFaq = () => delay(faq);

export function validateVoucher(code) {
  const v = vouchers.find((x) => x.code === code.trim().toUpperCase());
  return v ? delay(v, 400) : fail('voucherInvalid', 400);
}

export function createBooking(payload) {
  const all = read(STORE_KEY, []);
  const code = `KP-${Math.floor(100000 + Math.random() * 900000)}`;
  const status = payload.paymentOption === 'arrival' ? 'Request received' : 'Confirmed';
  const booking = { ...payload, code, status, createdAt: new Date().toISOString() };
  write(STORE_KEY, [...all, booking]);
  return delay(booking, 900);
}

export function findBooking(query) {
  const q = query.trim().toUpperCase();
  const all = [...seedBookings, ...read(STORE_KEY, [])];
  const found = all.filter((b) => b.code.toUpperCase() === q || normPlate(b.plate) === normPlate(q));
  return delay(found);
}

// eSIM mock actions
export function buyEsim(packageId, email) {
  const pkg = esimPackages.find((p) => p.id === packageId);
  if (!pkg) return fail('packageNotFound');
  const iccid = `8999500${Math.floor(1e11 + Math.random() * 9e11)}`;
  const esim = { iccid, email, packages: [{ ...pkg, remainingGb: parseInt(pkg.data, 10) }], balance: 0 };
  write(ESIM_KEY, [...read(ESIM_KEY, []), esim]);
  return delay(esim, 900);
}
export function addEsim(iccid) {
  if (!/^\d{18,20}$/.test(iccid)) return fail('iccidInvalid');
  const all = read(ESIM_KEY, []);
  let esim = all.find((e) => e.iccid === iccid);
  if (!esim) { esim = { iccid, packages: [], balance: 0 }; write(ESIM_KEY, [...all, esim]); }
  return delay(esim);
}
export function getEsim(iccid) {
  const esim = read(ESIM_KEY, []).find((e) => e.iccid === iccid.trim());
  return esim ? delay(esim) : fail('esimNotFound');
}
export function addPackage(iccid, packageId) {
  const all = read(ESIM_KEY, []);
  const esim = all.find((e) => e.iccid === iccid.trim());
  const pkg = esimPackages.find((p) => p.id === packageId);
  if (!esim) return fail('esimNotFound');
  esim.packages.push({ ...pkg, remainingGb: parseInt(pkg.data, 10) });
  write(ESIM_KEY, all);
  return delay(esim);
}
