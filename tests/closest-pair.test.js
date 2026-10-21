import test from "node:test";
import assert from "node:assert/strict";
import { closestPairBruteForce, closestPairDivideAndConquer } from "../src/closest-pair.js";

const implementations = [
  ["força bruta", closestPairBruteForce],
  ["divisão e conquista", closestPairDivideAndConquer]
];
const cases = [
  ["par horizontal", [{x:0,y:0},{x:3,y:0},{x:1,y:0}], {distance:1,firstIndex:0,secondIndex:2}],
  ["par vertical", [{x:2,y:0},{x:2,y:5},{x:2,y:2}], {distance:2,firstIndex:0,secondIndex:2}],
  ["distância diagonal", [{x:0,y:0},{x:3,y:4}], {distance:5,firstIndex:0,secondIndex:1}],
  ["pontos duplicados", [{x:1,y:1},{x:5,y:5},{x:1,y:1}], {distance:0,firstIndex:0,secondIndex:2}],
  ["vários duplicados: menor par de índices", [{x:8,y:8},{x:0,y:0},{x:8,y:8},{x:8,y:8}], {distance:0,firstIndex:0,secondIndex:2}],
  ["empate entre distâncias", [{x:0,y:0},{x:2,y:0},{x:0,y:2}], {distance:2}],
  ["par cruza a mediana", [{x:-10,y:0},{x:0,y:0},{x:0.5,y:0.2},{x:10,y:0}], {distance:Math.sqrt(0.29),firstIndex:1,secondIndex:2}],
  ["pontos colineares", [{x:0,y:0},{x:10,y:0},{x:4,y:0},{x:5,y:0}], {distance:1,firstIndex:2,secondIndex:3}]
];
for (const [name, implementation] of implementations) {
  for (const [caseName, points, expected] of cases) {
    test(`${name}: ${caseName}`, () => {
      const actual = implementation(points);
      assert.ok(Math.abs(actual.distance - expected.distance) < 1e-10);
      if (expected.firstIndex !== undefined) {
        assert.equal(actual.firstIndex, expected.firstIndex);
        assert.equal(actual.secondIndex, expected.secondIndex);
      }
      const first = points[actual.firstIndex];
      const second = points[actual.secondIndex];
      assert.ok(first && second && actual.firstIndex !== actual.secondIndex);
      assert.ok(Math.abs(Math.hypot(first.x - second.x, first.y - second.y) - actual.distance) < 1e-10);
    });
  }
  test(`${name}: rejeita menos de dois pontos`, () => assert.throws(() => implementation([{x:0,y:0}]), TypeError));
  test(`${name}: rejeita coordenadas não finitas`, () => assert.throws(() => implementation([{x:0,y:0},{x:Infinity,y:1}]), TypeError));
}

test("divisão e conquista concorda com força bruta em entradas determinísticas", () => {
  let state = 123456789;
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state;
  };
  for (let n = 2; n <= 60; n++) {
    const points = Array.from({length:n}, () => ({x:random()%1000, y:random()%1000}));
    const expected = closestPairBruteForce(points);
    const actual = closestPairDivideAndConquer(points);
    assert.ok(Math.abs(actual.distance - expected.distance) < 1e-9, `distância divergente em n=${n}`);
    const first = points[actual.firstIndex];
    const second = points[actual.secondIndex];
    assert.ok(Math.abs(Math.hypot(first.x - second.x, first.y - second.y) - actual.distance) < 1e-9, `par inválido em n=${n}`);
  }
});
