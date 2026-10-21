import {
  maxSubarrayBruteForce,
  maxSubarrayDivideAndConquer
} from "./max-subarray.js";

const implementations = {
  brute: maxSubarrayBruteForce,
  divide: maxSubarrayDivideAndConquer
};
const algorithm = process.argv[2] ?? "divide";
if (!Object.hasOwn(implementations, algorithm)) {
  console.error("Uso: node src/main-max-subarray.js <brute|divide>");
  process.exit(2);
}
let input = "";
for await (const chunk of process.stdin) input += chunk;
const tokens = input.trim().split(/\s+/).filter(Boolean).map(Number);
if (tokens.length === 0 || !Number.isInteger(tokens[0]) || tokens[0] < 1) {
  console.error("Entrada inválida: informe n >= 1 seguido de n inteiros.");
  process.exit(2);
}
const n = tokens[0];
if (tokens.length !== n + 1 || !tokens.slice(1).every(Number.isSafeInteger)) {
  console.error(`Entrada inválida: esperado n=${n} seguido de exatamente ${n} inteiros.`);
  process.exit(2);
}
const result = implementations[algorithm](tokens.slice(1));
console.log(`${result.sum} ${result.start} ${result.end}`);
