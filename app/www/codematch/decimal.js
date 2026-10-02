// Decimal finito: la decisión nunca usa un valor redondeado para pantalla.
export function decimal(raw) {
  const s = String(raw ?? "")
    .trim()
    .replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(s))
    throw new Error("Introduce un número no negativo, con coma o punto.");
  const [a, b = ""] = s.split(".");
  return { n: BigInt(a + b), s: b.length };
}
const pow = (s) => 10n ** BigInt(s);
export function align(a, b) {
  const s = Math.max(a.s, b.s);
  return [a.n * pow(s - a.s), b.n * pow(s - b.s), s];
}
export function text(a) {
  const s = a.n.toString().padStart(a.s + 1, "0");
  return a.s ? s.slice(0, -a.s) + "," + s.slice(-a.s) : s;
}
export function sum(values) {
  let a = { n: 0n, s: 0 };
  for (const v of values) {
    if (String(v).trim() === "") continue;
    const [x, y, s] = align(a, decimal(v));
    a = { n: x + y, s };
  }
  return text(a);
}
export function within(value, target, tolerance, percent = false) {
  const v = decimal(value),
    t = decimal(target),
    p = decimal(tolerance);
  const tol = percent ? { n: t.n * p.n, s: t.s + p.s + 2 } : p;
  const [x, y, s] = align(v, t),
    diff = { n: x > y ? x - y : y - x, s };
  const [d, b] = align(diff, tol);
  return d <= b;
}
export function pair(record, query, tol, percent = false) {
  const check = (a, b) => {
    let missing = false;
    for (let i = 0; i < 2; i++) {
      if (String(query[i] ?? "").trim() === "") continue;
      if (String([a, b][i] ?? "").trim() === "") {
        missing = true;
        continue;
      }
      try {
        if (!within([a, b][i], query[i], tol, percent)) return "Descartada";
      } catch {
        missing = true;
      }
    }
    return missing ? "No evaluable" : "Coincidencia";
  };
  const direct = check(...record),
    swapped = check(record[1], record[0]);
  if (direct === "Coincidencia" || swapped === "Coincidencia")
    return "Coincidencia";
  return direct === "No evaluable" || swapped === "No evaluable"
    ? "No evaluable"
    : "Descartada";
}

