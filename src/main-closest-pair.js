import { closestPairBruteForce, closestPairDivideAndConquer } from "./closest-pair.js";

const implementations = { brute: closestPairBruteForce, divide: closestPairDivideAndConquer };
const algorithm = process.argv[2] ?? "divide";
if (!Object.hasOwn(implementations, algorithm)) {
  console.error("Uso: node src/main-closest-pair.js <brute|divide>");
  process.exit(2);
}
let input = "";
for await (const chunk of process.stdin) input += chunk;
const tokens = input.trim().split(/\s+/).filter(Boolean).map(Number);
if (tokens.length === 0 || !Number.isInteger(tokens[0]) || tokens[0] < 2) {
  console.error("Entrada inválida: informe n >= 2 seguido de n pares x y.");
  process.exit(2);
}
const n = tokens[0];
if (tokens.length !== 1 + 2 * n || !tokens.slice(1).every(Number.isFinite)) {
  console.error(`Entrada inválida: esperado n=${n} seguido de ${n} pares de coordenadas finitas.`);
  process.exit(2);
}
const points = [];
for (let i = 1; i < tokens.length; i += 2) points.push({ x: tokens[i], y: tokens[i + 1] });
const result = implementations[algorithm](points);
console.log(`${result.distance} ${result.firstIndex} ${result.secondIndex}`);
