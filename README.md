# Trabalho Prático — Divisão e Conquista

Implementação em JavaScript (Node.js) dos dois problemas do enunciado: **Subarranjo de Soma Máxima** e **Par de Pontos Mais Próximos**. Cada problema possui uma solução de força bruta e uma de divisão e conquista. O projeto inclui testes, benchmarks, CSVs, gráficos e um rascunho do relatório.

## Requisitos

- Node.js 20 ou superior (testado com Node.js 22)
- Python 3 e `matplotlib` somente para regenerar os gráficos
- Git para a etapa de publicação

## Estrutura do projeto

```text
divisao-e-conquista/
├── src/
│   ├── max-subarray.js
│   ├── closest-pair.js
│   ├── main-max-subarray.js
│   └── main-closest-pair.js
├── tests/
│   ├── max-subarray.test.js
│   ├── closest-pair.test.js
│   └── cases.json
├── benchmarks/
│   └── benchmark.js
├── results/
│   ├── measurements.csv
│   ├── summary.csv
│   ├── machine.json
│   └── test-run.txt
├── report/
│   ├── relatorio-rascunho.md
│   └── figures/
├── tools/plot-results.py
├── package.json
├── .gitignore
└── README.md
```

## Executar os testes

```bash
npm test
```

Os testes usam o módulo nativo `node:test`, sem dependências npm adicionais. Cobrem casos de borda e comparam os resultados dos algoritmos.

## Etapa 1 — Subarranjo de Soma Máxima

A entrada contém `n` e, em seguida, `n` inteiros. A saída é `soma início fim`.

```bash
node src/main-max-subarray.js brute
node src/main-max-subarray.js divide
```

Exemplo de entrada:

```text
8
-2 3 -1 5 -6 2 2 -1
```

Saída esperada:

```text
7 1 3
```

Os índices são baseados em zero e o índice final é inclusivo. Em empate de soma, escolhe-se o intervalo com menor índice inicial e, depois, menor índice final. A entrada deve conter pelo menos um elemento. Se todos forem negativos, a resposta é o maior elemento, não zero.

Complexidades: força bruta `Θ(n²)` tempo e `Θ(1)` espaço auxiliar; divisão e conquista `Θ(n log n)` tempo e `Θ(log n)` de pilha recursiva.

## Etapa 2 — Par de Pontos Mais Próximos

A entrada contém `n` e depois `n` pares `x y`. A saída é `distância índice1 índice2`.

```bash
node src/main-closest-pair.js brute
node src/main-closest-pair.js divide
```

Exemplo de entrada:

```text
4
0 0
3 4
1 1
8 8
```

A distância é euclidiana. Os índices são baseados em zero e correspondem à ordem dos pontos na entrada. Se houver mais de um par com a mesma distância mínima, qualquer par válido com a menor distância é aceito; os testes validam a distância e que o par retornado corresponde aos índices informados. Pontos duplicados são permitidos e produzem distância mínima zero.

Complexidades: força bruta `Θ(n²)` tempo; divisão e conquista `Θ(n log n)` tempo. A solução eficiente ordena inicialmente por x e y, divide os pontos, preserva a ordenação por y nas partições e examina até sete vizinhos seguintes na faixa central.

## Análise experimental

```bash
npm run benchmark
```

O script usa por padrão os tamanhos `100, 200, 400, 800, 1600, 3200, 6400` e cinco amostras por algoritmo e tamanho. As funções são aquecidas antes da medição; chamadas rápidas são medidas em pequenos lotes para reduzir o ruído do cronômetro. O CSV registra o número de chamadas por amostra e o tempo médio por chamada.

Arquivos gerados:

- `results/measurements.csv`: medições brutas;
- `results/summary.csv`: média, mediana, mínimo e máximo por algoritmo e tamanho;
- `results/machine.json`: configuração do ambiente medido.

É possível personalizar os tamanhos e repetições:

```bash
SIZES=100,200,400,800 REPETITIONS=7 npm run benchmark
```

Depois de executar o benchmark, regenere os gráficos com:

```bash
python3 tools/plot-results.py
```

**Importante:** os resultados incluídos foram medidos em um ambiente Linux virtualizado. Antes da entrega, execute novamente `npm test`, `npm run benchmark` e o script de gráficos no computador que será descrito no relatório. Não apresente a configuração do ambiente virtualizado como se fosse a máquina pessoal da dupla.

## Recorrências

- Soma máxima por divisão e conquista: `T(n) = 2T(n/2) + Θ(n)`, portanto `Θ(n log n)`.
- Pontos mais próximos por divisão e conquista: ordenação inicial `Θ(n log n)` e `T(n) = 2T(n/2) + Θ(n)`, portanto `Θ(n log n)`.
- As duas soluções de força bruta: `Θ(n²)`.

## Entregáveis do enunciado

1. Repositório Git com código-fonte, instruções de execução e histórico de commits que reflita o desenvolvimento.
2. Arquivo de casos de teste com entradas e saídas esperadas.
3. Relatório PDF de até oito páginas com recorrências, tabelas, gráficos, análise experimental e justificativa do limiar usado na Etapa 2.

O relatório está em `report/relatorio-rascunho.md` e deve ser revisado e convertido para PDF depois que a dupla repetir as medições na máquina escolhida.
