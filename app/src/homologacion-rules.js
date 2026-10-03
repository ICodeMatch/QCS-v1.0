// Decimal con signo, independiente de las restricciones de búsqueda CodeMatch.
export function exact(raw) {
  const value = String(raw ?? "")
    .trim()
    .replace(",", ".");
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(value))
    throw Error("Valor numérico inválido.");
  const neg = value.startsWith("-"),
    unsigned = value.replace(/^[+-]/, "");
  const [whole, fraction = ""] = unsigned.split(".");
  return { n: BigInt(whole + fraction) * (neg ? -1n : 1n), s: fraction.length };
}
const align = (a, b) => {
  const s = Math.max(a.s, b.s);
  return [a.n * 10n ** BigInt(s - a.s), b.n * 10n ** BigInt(s - b.s), s];
};
export const add = (a, b) => {
  const [x, y, s] = align(a, b);
  return { n: x + y, s };
};
export const multiply = (a, b) => ({ n: a.n * b.n, s: a.s + b.s });
export const compare = (a, b) => {
  const [x, y] = align(a, b);
  return x < y ? -1 : x > y ? 1 : 0;
};
export function exactText(a) {
  const neg = a.n < 0n,
    value = (neg ? -a.n : a.n).toString().padStart(a.s + 1, "0");
  return (
    (neg ? "-" : "") +
    (a.s ? value.slice(0, -a.s) + "." + value.slice(-a.s) : value)
  );
}
const blank = (x) => x === null || x === undefined || String(x).trim() === "";
export function limits(spec) {
  try {
    let lower, upper, origin;
    if (
      !blank(spec.nominal) &&
      !blank(spec.lowerTolerance) &&
      !blank(spec.upperTolerance)
    ) {
      const n = exact(spec.nominal),
        l = exact(spec.lowerTolerance),
        u = exact(spec.upperTolerance);
      if (spec.type === "percent") {
        if (!["fraction", "percent"].includes(spec.percentEncoding))
          throw Error("Escala de porcentaje sin configurar.");
        const shift = spec.percentEncoding === "percent" ? 2 : 0;
        lower = multiply(n, add(exact("1"), { n: l.n, s: l.s + shift }));
        upper = multiply(n, add(exact("1"), { n: u.n, s: u.s + shift }));
      } else if (spec.type === "dimensional") {
        lower = add(n, l);
        upper = add(n, u);
      } else throw Error("Tipo no evaluable.");
      origin = "nominal+tolerancias";
    } else if (
      spec.explicitLimits &&
      !blank(spec.lowerLimit) &&
      !blank(spec.upperLimit)
    ) {
      lower = exact(spec.lowerLimit);
      upper = exact(spec.upperLimit);
      origin = "límites explícitos del mapeo";
    } else
      throw Error("Especificación incompleta: faltan límites o tolerancias.");
    if (compare(lower, upper) > 0)
      throw Error("Límites incoherentes: inferior mayor que superior.");
    return {
      valid: true,
      lower: exactText(lower),
      upper: exactText(upper),
      origin,
    };
  } catch (e) {
    return { valid: false, reason: e.message };
  }
}
export function evaluateSample(spec, raw) {
  if (blank(raw)) return { status: "pending" };
  if (spec.type === "attribute") {
    const result = spec.attributeMap?.[String(raw)];
    return ["conforming", "nonconforming"].includes(result)
      ? { status: result }
      : {
          status: "notEvaluable",
          reason: "Atributo sin correspondencia explícita.",
        };
  }
  if (!["dimensional", "percent"].includes(spec.type))
    return { status: "notEvaluable", reason: "Tipo desconocido." };
  let value;
  try {
    value = exact(raw);
  } catch {
    return { status: "invalid", reason: "Medición no numérica." };
  }
  const rule = limits(spec);
  if (!rule.valid) return { status: "notEvaluable", reason: rule.reason };
  return {
    status:
      compare(value, exact(rule.lower)) < 0 ||
      compare(value, exact(rule.upper)) > 0
        ? "nonconforming"
        : "conforming",
    value: exactText(value),
    ...rule,
  };
}
export function evaluateCharacteristic(c) {
  const samples = c.samples.map((s) => evaluateSample(c, s.value)),
    counts = {
      pending: 0,
      invalid: 0,
      conforming: 0,
      nonconforming: 0,
      notEvaluable: 0,
    };
  for (const s of samples) counts[s.status]++;
  let nValid = 0;
  for (let i = 0; i < c.samples.length; i++)
    if (c.type === "attribute") {
      if (["conforming", "nonconforming"].includes(samples[i].status)) nValid++;
    } else if (
      ["dimensional", "percent"].includes(c.type) &&
      !blank(c.samples[i].value)
    ) {
      try {
        exact(c.samples[i].value);
        nValid++;
      } catch {}
    }
  const measured = c.samples.some((s) => !blank(s.value));
  const conformity = !measured
    ? "Sin medir"
    : counts.nonconforming
      ? "No conforme"
      : counts.invalid || counts.notEvaluable
        ? "No evaluable"
        : counts.conforming
          ? "Conforme"
          : "No evaluable";
  return {
    samples,
    counts,
    nValid,
    nRequired: c.nRequired ?? null,
    conformity,
    completeness: "Sin definir",
    approval: "Pendiente",
    rule: c.type === "attribute" ? null : limits(c),
  };
}
