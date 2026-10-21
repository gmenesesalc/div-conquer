import test from "node:test";
import assert from "node:assert/strict";
import {
  maxSubarrayBruteForce,
  maxSubarrayDivideAndConquer
} from "../src/max-subarray.js";

const implementations = [
  ["força bruta", maxSubarrayBruteForce],
  ["divisão e conquista", maxSubarrayDivideAndConquer]
];
const cases = [
  ["exemplo misto", [-2, 3, -1, 5, -6, 2, 2, -1], { sum: 7, start: 1, end: 3 }],
  ["todos negativos", [-8, -3, -6, -2, -5, -4], { sum: -2, start: 3, end: 3 }],
  ["tamanho um", [7], { sum: 7, start: 0, end: 0 }],
  ["todos positivos", [1, 2, 3, 4], { sum: 10, start: 0, end: 3 }],
  ["empate: menor início", [1, -1, 1], { sum: 1, start: 0, end: 0 }],
  ["empate: menor fim", [2, -2, 2], { sum: 2, start: 0, end: 0 }],
  ["melhor intervalo cruza a divisão", [4, -1, 2, 1], { sum: 6, start: 0, end: 3 }],
  ["zero isolado", [-2, 0, -1], { sum: 0, start: 1, end: 1 }],
  ["soma positiva com zero inicial", [0, 1], { sum: 1, start: 0, end: 1 }]
];
for (const [name, implementation] of implementations) {
  for (const [caseName, input, expected] of cases) {
    test(`${name}: ${caseName}`, () => assert.deepEqual(implementation(input), expected));
  }
  test(`${name}: rejeita vetor vazio`, () => assert.throws(() => implementation([]), TypeError));
}

test("as duas versões concordam em vetores pequenos exaustivos", () => {
  for (let length = 1; length <= 6; length++) {
    const total = 5 ** length;
    for (let code = 0; code < total; code++) {
      let value = code;
      const input = [];
      for (let i = 0; i < length; i++) {
        input.push((value % 5) - 2);
        value = Math.floor(value / 5);
      }
      const expected = maxSubarrayBruteForce(input);
      assert.deepEqual(maxSubarrayDivideAndConquer(input), expected, `D&C: [${input}]`);
    }
  }
});
