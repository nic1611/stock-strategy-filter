📈 Stock Strategy Filter (SSF)

    SSF é uma ferramenta de análise quantitativa que automatiza a filtragem de ações da B3. Transforme dados brutos em uma lista refinada de ativos de valor utilizando um pipeline rigoroso de 11 etapas.

🎯 O Objetivo

Este projeto foi criado para investidores que seguem estratégias baseadas em Valor e Qualidade. Ele elimina o viés emocional e o trabalho manual de planilhas, aplicando filtros de liquidez, rentabilidade (EBIT), eficiência (ROIC) e valuation (EV/EBIT) de forma instantânea.
⚙️ O Pipeline de 11 Etapas

O algoritmo processa os dados seguindo esta hierarquia lógica:

    Ingestão: Upload de arquivos CSV/Excel.

    Mapeamento: Normalização inteligente de colunas.

    Liquidez: Apenas ativos com Volume > R$ 1 Milhão.

    Lucratividade: Filtro de Margem EBIT positiva.

    Qualidade: Filtro de ROIC > 10%.

    Valuation: Ordenação por EV/EBIT (do menor para o maior).

    Deduplicação: Mantém apenas a classe de ação mais líquida por ticker.

    Solvência: Exclusão de empresas em Recuperação Judicial.

    Limpeza: Remoção de outliers e dados corrompidos.

    Ranking: Atribuição de pontuação baseada no ranking final.

    Display: Interface rica para tomada de decisão.

🛠️ Tech Stack & Arquitetura

A aplicação segue os princípios de Clean Architecture e S.O.L.I.D.:

    Estado: Zustand - Gerenciamento de estado leve e escalável.

    Tabelas: TanStack Table - Tabelas headless com alta performance.

    Estilização: Tailwind CSS - Design responsivo e utilitário.

    Testes: Vitest - Suíte de testes ultrarrápida para garantir a integridade dos filtros.

🚀 Como Rodar o Projeto

    Clone o repositório:
    Bash

git clone https://github.com/seu-usuario/stock-strategy-filter.git

Instale as dependências:
Bash

npm install

Inicie o servidor de desenvolvimento:
Bash

npm run dev

Rode os testes unitários:
Bash

    npm run test

📂 Estrutura de Pastas
Plaintext

src/
├── domain/       # Funções puras de filtragem (Business Logic)
├── store/        # Zustand stores para estado global
├── components/   # UI components (Atomic Design)
├── hooks/        # Lógica de processamento de arquivos
└── __tests__/    # Cobertura de testes dos filtros

📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo LICENSE para mais detalhes.

⭐ Gostou do projeto? Considere dar uma estrela no repositório!