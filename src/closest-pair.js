/**
 * Par de pontos mais próximos.
 * Cada ponto é { x, y }; os índices retornados referem-se à entrada original.
 * Desempate: menor par lexicográfico de índices (firstIndex, secondIndex).
 */
function validatePoints(points) {
  if (!Array.isArray(points) || points.length < 2) {
    throw new TypeError("points deve ser um array com pelo menos dois pontos.");
  }
  for (const point of points) {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      throw new TypeError("Cada ponto deve conter coordenadas x e y finitas.");
    }
  }
}

function comparePair(a, b) {
  if (a.firstIndex !== b.firstIndex) return a.firstIndex - b.firstIndex;
  return a.secondIndex - b.secondIndex;
}

function makeCandidate(a, b) {
  const firstIndex = Math.min(a.index, b.index);
  const secondIndex = Math.max(a.index, b.index);
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return { distanceSquared: dx * dx + dy * dy, firstIndex, secondIndex };
}

function isBetter(candidate, current) {
  if (candidate.distanceSquared !== current.distanceSquared) {
    return candidate.distanceSquared < current.distanceSquared;
  }
  return comparePair(candidate, current) < 0;
}

function finish(candidate) {
  return {
    distance: Math.sqrt(candidate.distanceSquared),
    firstIndex: candidate.firstIndex,
    secondIndex: candidate.secondIndex
  };
}

function findDuplicatePair(points) {
  const byX = new Map();
  let bestPair = null;
  for (const point of points) {
    let byY = byX.get(point.x);
    if (!byY) {
      byY = new Map();
      byX.set(point.x, byY);
    }
    const indices = byY.get(point.y) ?? [];
    indices.push(point.index);
    byY.set(point.y, indices);
    if (indices.length >= 2) {
      const pair = {
        distanceSquared: 0,
        firstIndex: Math.min(indices[0], indices[1]),
        secondIndex: Math.max(indices[0], indices[1])
      };
      if (bestPair === null || comparePair(pair, bestPair) < 0) bestPair = pair;
    }
  }
  return bestPair;
}

/** Força bruta: O(n²) tempo e O(1) espaço auxiliar após a validação. */
export function closestPairBruteForce(inputPoints) {
  validatePoints(inputPoints);
  const points = inputPoints.map((point, index) => ({ ...point, index }));
  let best = null;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const candidate = makeCandidate(points[i], points[j]);
      if (best === null || isBetter(candidate, best)) best = candidate;
    }
  }
  return finish(best);
}

function closestInSmallSet(pointsByX) {
  let best = null;
  for (let i = 0; i < pointsByX.length; i++) {
    for (let j = i + 1; j < pointsByX.length; j++) {
      const candidate = makeCandidate(pointsByX[i], pointsByX[j]);
      if (best === null || isBetter(candidate, best)) best = candidate;
    }
  }
  return best;
}

function solve(pointsByX, pointsByY) {
  const n = pointsByX.length;
  if (n <= 3) return closestInSmallSet(pointsByX);

  const mid = Math.floor(n / 2);
  const leftByX = pointsByX.slice(0, mid);
  const rightByX = pointsByX.slice(mid);
  const leftIds = new Set(leftByX.map(point => point.index));
  const leftByY = [];
  const rightByY = [];

  for (const point of pointsByY) {
    (leftIds.has(point.index) ? leftByY : rightByY).push(point);
  }

  let bestLeft = solve(leftByX, leftByY);
  let bestRight = solve(rightByX, rightByY);
  let best = isBetter(bestRight, bestLeft) ? bestRight : bestLeft;
  const deltaSquared = best.distanceSquared;
  const dividingX = rightByX[0].x;
  const strip = pointsByY.filter(point => {
    const dx = point.x - dividingX;
    return dx * dx <= deltaSquared;
  });

  // Os pontos da faixa já estão ordenados por y. Comparam-se no máximo
  // os sete pontos seguintes, conforme o argumento geométrico do enunciado.
  for (let i = 0; i < strip.length; i++) {
    const limit = Math.min(i + 8, strip.length);
    for (let j = i + 1; j < limit; j++) {
      const dy = strip[j].y - strip[i].y;
      if (dy * dy > best.distanceSquared) break;
      const candidate = makeCandidate(strip[i], strip[j]);
      if (isBetter(candidate, best)) best = candidate;
    }
  }
  return best;
}

/**
 * Divisão e conquista: O(n log n) tempo, O(n log n) espaço auxiliar nesta
 * implementação (partições/slices em cada nível). Ordenação inicial O(n log n).
 */
export function closestPairDivideAndConquer(inputPoints) {
  validatePoints(inputPoints);
  const points = inputPoints.map((point, index) => ({ ...point, index }));

  // Tratar duplicatas antes da faixa preserva o desempate por índice mesmo
  // quando muitos pontos coincidem; a busca por duplicatas custa O(n) esperado.
  const duplicatePair = findDuplicatePair(points);
  if (duplicatePair !== null) return finish(duplicatePair);

  const pointsByX = [...points].sort((a, b) => a.x - b.x || a.y - b.y || a.index - b.index);
  const pointsByY = [...points].sort((a, b) => a.y - b.y || a.x - b.x || a.index - b.index);
  return finish(solve(pointsByX, pointsByY));
}
