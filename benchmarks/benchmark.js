import fs from "node:fs";
import os from "node:os";
import process from "node:process";
import { performance } from "node:perf_hooks";
import {
  maxSubarrayBruteForce,
  maxSubarrayDivideAndConquer
} from "../src/max-subarray.js";
import { closestPairBruteForce, closestPairDivideAndConquer } from "../src/closest-pair.js";

const sizes = (process.env.SIZES ?? "100,200,400,800,1600,3200,6400")
  .split(",").map(Number).filter(n => Number.isInteger(n) && n >= 2);
const repetitions = Math.max(5, Number.parseInt(process.env.REPETITIONS ?? "5", 10) || 5);
const outputDirectory = new URL("../results/", import.meta.url);
fs.mkdirSync(outputDirectory, { recursive: true });

let seed = 20261013;
function randomInt(min, max) {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return min + (seed % (max - min + 1));
}
function makeArray(n) {
  return Array.from({ length: n }, () => randomInt(-100, 100));
}
function makePoints(n) {
  // Coordenadas inteiras determinísticas em uma faixa ampla para evitar
  // duplicatas frequentes sem eliminar a possibilidade de proximidades reais.
  return Array.from({ length: n }, () => ({ x: randomInt(-100000, 100000), y: randomInt(-100000, 100000) }));
}
function sameResult(a, b, problem) {
  if (problem === "max-subarray") return a.sum === b.sum && a.start === b.start && a.end === b.end;
  // Em caso de empate geométrico, qualquer par com distância mínima é válido.
  return Math.abs(a.distance - b.distance) < 1e-9;
}
function timeOnce(fn, input) {
  const start = performance.now();
  fn(input);
  return performance.now() - start;
}

// Mede cada amostra em um pequeno lote para reduzir o ruído de chamadas muito rápidas.
// O valor gravado é o tempo médio por chamada dentro do lote.
function measureSample(fn, input, targetBatchMs = 15) {
  fn(input); // aquecimento
  const calibrationMs = Math.max(timeOnce(fn, input), 0.001);
  const iterations = Math.max(1, Math.min(10000, Math.floor(targetBatchMs / calibrationMs)));
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn(input);
  return { elapsedMs: (performance.now() - start) / iterations, iterations };
}

const rows = [];
const algorithms = {
  "max-subarray": [
    ["brute-force", maxSubarrayBruteForce],
    ["divide-conquer", maxSubarrayDivideAndConquer]
  ],
  "closest-pair": [
    ["brute-force", closestPairBruteForce],
    ["divide-conquer", closestPairDivideAndConquer]
  ]
};

for (const n of sizes) {
  for (const problem of Object.keys(algorithms)) {
    const input = problem === "max-subarray" ? makeArray(n) : makePoints(n);
    const functions = algorithms[problem];

    // Validar equivalência antes de cronometrar. O custo dessa validação não entra no CSV.
    const reference = functions[0][1](input);
    for (const [name, fn] of functions.slice(1)) {
      const actual = fn(input);
      if (!sameResult(reference, actual, problem)) {
        throw new Error(`Resultados divergentes em ${problem}, n=${n}, algoritmo=${name}`);
      }
    }

    for (const [algorithm, fn] of functions) {
      for (let repetition = 1; repetition <= repetitions; repetition++) {
        const sample = measureSample(fn, input);
        rows.push({ problem, algorithm, n, repetition, iterations_per_sample: sample.iterations, elapsed_ms: sample.elapsedMs.toFixed(6) });
      }
      console.log(`${problem.padEnd(13)} ${algorithm.padEnd(20)} n=${String(n).padStart(5)} concluído`);
    }
  }
}

const columns = ["problem", "algorithm", "n", "repetition", "iterations_per_sample", "elapsed_ms"];
const csv = [columns.join(","), ...rows.map(row => columns.map(column => row[column]).join(","))].join("\n") + "\n";
fs.writeFileSync(new URL("measurements.csv", outputDirectory), csv);

const machine = {
  measured_at: new Date().toISOString(),
  operating_system: `${os.type()} ${os.release()}`,
  platform: process.platform,
  architecture: process.arch,
  node_version: process.version,
  cpu_model: os.cpus()[0]?.model ?? "não identificado",
  logical_cpu_count: os.cpus().length,
  total_memory_gib: Number((os.totalmem() / (1024 ** 3)).toFixed(2)),
  repetitions_per_size: repetitions,
  sizes,
  note: "Medições neste ambiente Linux virtualizado; resultados dependem da máquina, da carga do sistema e da versão do Node.js. Reexecute na máquina da dupla antes da entrega."
};
fs.writeFileSync(new URL("machine.json", outputDirectory), JSON.stringify(machine, null, 2) + "\n");

// Agregação simples para facilitar a tabela do relatório.
const grouped = new Map();
for (const row of rows) {
  const key = `${row.problem}|${row.algorithm}|${row.n}`;
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(Number(row.elapsed_ms));
}
const summaryRows = [];
for (const [key, times] of grouped) {
  const [problem, algorithm, n] = key.split("|");
  const mean = times.reduce((sum, value) => sum + value, 0) / times.length;
  const sorted = [...times].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  summaryRows.push({ problem, algorithm, n, repetitions: times.length, mean_ms: mean.toFixed(6), median_ms: median.toFixed(6), min_ms: sorted[0].toFixed(6), max_ms: sorted.at(-1).toFixed(6) });
}
const summaryColumns = ["problem", "algorithm", "n", "repetitions", "mean_ms", "median_ms", "min_ms", "max_ms"];
fs.writeFileSync(new URL("summary.csv", outputDirectory), [summaryColumns.join(","), ...summaryRows.map(row => summaryColumns.map(column => row[column]).join(","))].join("\n") + "\n");
console.log(`\nMedições salvas em results/measurements.csv e results/summary.csv`);
console.log(`Configuração salva em results/machine.json`);
