Project: Stock Strategy Filter (SSF) - Technical Specification
1. Overview

A Web Application designed to automate the "Stock Picking" process based on fundamentalist indicators. The objective is to transform raw market data files (Excel/CSV) into a filtered and ranked list of assets with high value potential and operational efficiency.
2. Tech Stack

    Core: React (Vite)

    Language: TypeScript

    Global State: Zustand

    Data Management: TanStack Table v8

    Styling: Tailwind CSS

    File Parsing: XLSX (for .xlsx) or PapaParse (for .csv)

    Unit Testing: Vitest + React Testing Library

3. Architecture & Clean Code

The project will follow Clean Architecture and S.O.L.I.D. principles:

    Separation of Concerns: Filtering logic (Business Rules) will be isolated from UI components.

    Pure Functions: Filters will be implemented as pure functions to ensure easy testability and predictability.

    Immutability: Original data states will never be mutated; new lists will be generated at each processing step.

Suggested Folder Structure
Plaintext

src/
 ├── @types/          # Global interfaces and types (IStock, IFilterConfig)
 ├── components/      # Generic UI components (Button, Table, Dropzone)
 ├── domain/          # Pure business logic (Filters and Calculations)
 │    └── stockLogic.ts
 ├── hooks/           # Custom hooks for processing logic
 ├── store/           # Zustand Store (useStockStore.ts)
 ├── utils/           # Currency and percentage formatters
 └── __tests__/       # Unit tests with Vitest

4. The Processing Algorithm (11-Step Pipeline)

The application must process the data strictly following this sequence:

    Data Ingestion: Upload of the raw file (.xlsx or .csv).

    Column Mapping: Normalization of fields (Ticker, Company, Price, EBIT Margin, EV/EBIT, Div. Yield, Financial Volume, ROIC).

    Liquidity Filter: Keep only assets with Financial Volume (R$) > 1,000,000.

    Profitability Filter: Remove records with EBIT Margin <= 0 or N/A values.

    Quality Filter (New): Remove companies with ROIC < 10% (ensuring capital efficiency).

    Value Sorting: Organize by EV/EBIT from lowest to highest.

    Company Deduplication: Identify companies with multiple share classes (e.g., PETR3, PETR4). Keep only the one with the highest financial volume and remove the others.

    Legal Filter: Remove companies under "Judicial Recovery" (Bankruptcy protection) status.

    Outlier Cleanup: Remove records with corrupted data or negative EV/EBIT due to accounting distortions.

    Ranking: Assign a rank from 1 to N based on the final sorted order.

    Display: Render the final table with highlighted indicators.

5. UI/UX Requirements

    Upload Dashboard: Drag and Drop area for file input.

    Interactive Table (TanStack Table):

        Fast sorting by any column.

        Global search by ticker or company name.

        Conditional formatting (e.g., ROIC > 20% in green).

    Statistical Summary: Cards showing the average Dividend Yield and EV/EBIT of the filtered portfolio.

    Export: Button to export the processed results to a new Excel/CSV file.

6. Testing Strategy (Vitest)

Automated tests must be implemented for:

    Filtering Logic: Ensure the deduplication function maintains the correct ticker.

    Calculation Validation: Ensure EV/EBIT sorting correctly handles null values or strings.

    State Flow (Zustand): Test if data loaded in the store reflects changes accurately after filters are applied.

7. Acceptance Criteria

    [ ] The system must process a 500-line file in under 1 second.

    [ ] Users must be notified if the file is missing required columns.

    [ ] The application must be fully responsive (Tailwind CSS).

    [ ] Code must achieve at least 80% test coverage in the filtering logic module.