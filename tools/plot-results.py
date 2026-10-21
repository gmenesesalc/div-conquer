"""Gera gráficos do CSV de resumo. Requer Python 3 e matplotlib."""
import csv
from pathlib import Path
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
summary_path = ROOT / "results" / "summary.csv"
figures = ROOT / "report" / "figures"
figures.mkdir(parents=True, exist_ok=True)
with summary_path.open(encoding="utf-8", newline="") as file:
    rows = list(csv.DictReader(file))

plots = [
    ("max-subarray", ["brute-force", "divide-conquer"], "Subarranjo de soma máxima", "max-subarray"),
    ("closest-pair", ["brute-force", "divide-conquer"], "Par de pontos mais próximos", "closest-pair"),
]
labels = {"brute-force": "Força bruta", "divide-conquer": "Divisão e conquista"}
for problem, algorithms, title, filename in plots:
    fig, ax = plt.subplots(figsize=(8, 5))
    for algorithm in algorithms:
        selected = [row for row in rows if row["problem"] == problem and row["algorithm"] == algorithm]
        selected.sort(key=lambda row: int(row["n"]))
        if selected:
            ax.plot([int(row["n"]) for row in selected], [float(row["mean_ms"]) for row in selected], marker="o", label=labels[algorithm])
    ax.set_title(title)
    ax.set_xlabel("Tamanho da entrada (n)")
    ax.set_ylabel("Tempo médio (ms)")
    ax.set_xscale("log", base=2)
    ax.set_yscale("log")
    ax.grid(True, which="both", alpha=0.25)
    ax.legend()
    fig.tight_layout()
    fig.savefig(figures / f"{filename}.png", dpi=160)
    fig.savefig(figures / f"{filename}.svg")
    plt.close(fig)
print(f"Gráficos gerados em {figures}")
