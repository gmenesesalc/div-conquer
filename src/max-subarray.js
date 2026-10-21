/**
 * Subarranjo de soma máxima.
 * Índices baseados em zero e fim inclusivo.
 * Desempate: menor índice inicial; depois, menor índice final.
 */
function isBetter(candidate, current) {
  if (candidate.sum !== current.sum) return candidate.sum > current.sum;
  if (candidate.start !== current.start) return candidate.start < current.start;
  return candidate.end < current.end;
}

function validateInput(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError("values deve ser um array não vazio de inteiros.");
  }
  if (!values.every(Number.isSafeInteger)) {
    throw new TypeError("Todos os elementos devem ser inteiros seguros.");
  }
}

/** Força bruta: O(n²) tempo e O(1) espaço auxiliar. */
export function maxSubarrayBruteForce(values) {
  validateInput(values);
  let best = { sum: Number.NEGATIVE_INFINITY, start: 0, end: 0 };

  for (let start = 0; start < values.length; start++) {
    let sum = 0;
    for (let end = start; end < values.length; end++) {
      sum += values[end];
      const candidate = { sum, start, end };
      if (isBetter(candidate, best)) best = candidate;
    }
  }
  return best;
}

function bestLeftSuffix(values, left, mid) {
  let sum = 0;
  let bestSum = Number.NEGATIVE_INFINITY;
  let bestStart = mid;
  for (let i = mid; i >= left; i--) {
    sum += values[i];
    if (sum > bestSum || (sum === bestSum && i < bestStart)) {
      bestSum = sum;
      bestStart = i;
    }
  }
  return { sum: bestSum, start: bestStart, end: mid };
}

function bestRightPrefix(values, mid, right) {
  let sum = 0;
  let bestSum = Number.NEGATIVE_INFINITY;
  let bestEnd = mid + 1;
  for (let i = mid + 1; i <= right; i++) {
    sum += values[i];
    if (sum > bestSum) {
      bestSum = sum;
      bestEnd = i;
    }
  }
  return { sum: bestSum, start: mid + 1, end: bestEnd };
}

function solve(values, left, right) {
  if (left === right) return { sum: values[left], start: left, end: left };

  const mid = Math.floor((left + right) / 2);
  const bestLeft = solve(values, left, mid);
  const bestRight = solve(values, mid + 1, right);
  const suffix = bestLeftSuffix(values, left, mid);
  const prefix = bestRightPrefix(values, mid, right);
  const crossing = {
    sum: suffix.sum + prefix.sum,
    start: suffix.start,
    end: prefix.end
  };

  let best = bestLeft;
  if (isBetter(bestRight, best)) best = bestRight;
  if (isBetter(crossing, best)) best = crossing;
  return best;
}

/** Divisão e conquista: T(n)=2T(n/2)+Θ(n)=Θ(n log n), pilha Θ(log n). */
export function maxSubarrayDivideAndConquer(values) {
  validateInput(values);
  return solve(values, 0, values.length - 1);
}

