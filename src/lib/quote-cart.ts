/**
 * The quote basket — one shared store behind every calculator on the site.
 *
 * Each product section prices its own thing (panels by the panel, posts by the
 * metre, coils by coverage), but a buyer is specifying one perimeter, not four
 * unrelated purchases. So the sections write into this, and the basket is where
 * the totals actually live.
 *
 * **localStorage, not a server.** This build is a static site with no backend
 * and no payment integration, so the basket is a client-side working document
 * that ends in an enquiry, not an order. It survives a reload and a page
 * change, which is what matters when the panels, posts and toppings live on
 * three different URLs. It does not survive a different browser, and it is not
 * a commitment to buy — /quote says both in as many words.
 *
 * Everything is stored **ex VAT**, the basis the whole site quotes on. VAT is
 * applied once, on the total, the way the manufacturer's own estimator does it.
 * Storing inclusive figures and dividing back out is what produced a cent of
 * drift the last time it was tried.
 *
 * Writes dispatch `gm:cart` on `window` so any listener — the header count, the
 * basket page — re-renders without the sections knowing about each other. The
 * `storage` event covers the second-tab case.
 */

const KEY = 'gm.quote.v1';
export const VAT_RATE = 0.15;
export const CART_EVENT = 'gm:cart';

export interface QuoteLine {
  /** Stable identity for merging: same id + same unit price means same line. */
  id: string;
  /** Which section it came from, for grouping on the basket page. */
  group: string;
  label: string;
  /** Rand each, ex VAT. */
  unitEx: number;
  qty: number;
  /** Free-text detail — "2.4 m × R 143.00/m", "covers 13 m". */
  detail?: string;
  /** Mass each, kg, where the source publishes one. */
  kg?: number;
}

const isLine = (v: unknown): v is QuoteLine => {
  if (typeof v !== 'object' || v === null) return false;
  const l = v as Record<string, unknown>;
  return (
    typeof l.id === 'string' &&
    typeof l.group === 'string' &&
    typeof l.label === 'string' &&
    typeof l.unitEx === 'number' &&
    Number.isFinite(l.unitEx) &&
    typeof l.qty === 'number' &&
    Number.isFinite(l.qty)
  );
};

export const read = (): QuoteLine[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    /* Anything in localStorage is untrusted input — it may be from an older
       build, a different site on the same origin, or hand-edited. Drop what
       doesn't validate rather than letting a malformed line reach the totals. */
    return Array.isArray(parsed) ? parsed.filter(isLine) : [];
  } catch {
    return [];
  }
};

const write = (lines: QuoteLine[]): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* Private mode, or quota. The in-page total still works for this visit. */
  }
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: lines }));
};

/** Add a line, merging into an identical one already in the basket. */
export const add = (line: QuoteLine): QuoteLine[] => {
  const lines = read();
  const match = lines.find((l) => l.id === line.id && l.unitEx === line.unitEx);
  if (match) match.qty += line.qty;
  else lines.push({ ...line });
  write(lines);
  return lines;
};

export const setQty = (id: string, qty: number): QuoteLine[] => {
  const lines = read()
    .map((l) => (l.id === id ? { ...l, qty: Math.max(0, Math.floor(qty)) } : l))
    .filter((l) => l.qty > 0);
  write(lines);
  return lines;
};

export const remove = (id: string): QuoteLine[] => {
  const lines = read().filter((l) => l.id !== id);
  write(lines);
  return lines;
};

export const clear = (): void => write([]);

export const count = (lines = read()): number => lines.reduce((n, l) => n + l.qty, 0);

export interface QuoteTotals {
  ex: number;
  vat: number;
  incl: number;
  kg: number;
}

/** Rounded to the cent at each step, so the printed lines add up to the total. */
export const totals = (lines = read()): QuoteTotals => {
  const ex = lines.reduce((sum, l) => sum + Math.round(l.unitEx * l.qty * 100) / 100, 0);
  const exR = Math.round(ex * 100) / 100;
  const vat = Math.round(exR * VAT_RATE * 100) / 100;
  const kg = lines.reduce((sum, l) => sum + (l.kg ?? 0) * l.qty, 0);
  return {
    ex: exR,
    vat,
    incl: Math.round((exR + vat) * 100) / 100,
    kg: Math.round(kg * 100) / 100,
  };
};

export const rand = (v: number): string =>
  `R ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)}`;

/** Subscribe to every change, including from another tab. */
export const onChange = (fn: (lines: QuoteLine[]) => void): void => {
  window.addEventListener(CART_EVENT, () => fn(read()));
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) fn(read());
  });
};

/* ---------- submitted quotes ---------- */

const SUB_PREFIX = 'gm.quote.sub.';

export interface Submission {
  ref: string;
  /** ISO timestamp, stamped in the browser at submit time. */
  at: string;
  name?: string;
  site?: string;
  lines: QuoteLine[];
}

/**
 * A quote reference. Base-36 of the clock plus a little entropy, upper-cased —
 * short enough to read down a phone, unique enough that two people quoting in
 * the same second don't collide. It is not a sequence: without a server there
 * is nothing to sequence against, and a fake incrementing number would imply an
 * order book that doesn't exist.
 */
export const newRef = (): string => {
  const stamp = Date.now().toString(36).slice(-5);
  const salt = Math.floor(Math.random() * 36 ** 2)
    .toString(36)
    .padStart(2, '0');
  return `GM-${(stamp + salt).toUpperCase()}`;
};

/** Freeze the current basket under a new reference and return it. */
export const submit = (meta: { name?: string; site?: string }): Submission => {
  const submission: Submission = {
    ref: newRef(),
    at: new Date().toISOString(),
    name: meta.name || undefined,
    site: meta.site || undefined,
    lines: read(),
  };
  try {
    localStorage.setItem(SUB_PREFIX + submission.ref, JSON.stringify(submission));
  } catch {
    /* Private mode or quota — the status page falls back to "not found", which
       is the truth for this browser. */
  }
  return submission;
};

export const readSubmission = (ref: string): Submission | null => {
  try {
    const raw = localStorage.getItem(SUB_PREFIX + ref);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const sub = parsed as Partial<Submission>;
    if (typeof sub.ref !== 'string' || !Array.isArray(sub.lines)) return null;
    return {
      ...sub,
      ref: sub.ref,
      at: sub.at ?? '',
      lines: sub.lines.filter(isLine),
    } as Submission;
  } catch {
    return null;
  }
};
