import { UploadDashboard } from './components/UploadDashboard';
import { StockTable } from './components/StockTable';
import { PriceHistoryChart } from './components/PriceHistoryChart';
import { useStockStore } from './store/useStockStore';

function App() {
  const { rawStocks } = useStockStore();

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans">
      <main className="flex-1 px-[10%] flex flex-col max-w-[1920px] mx-auto w-full">
        {/* Section 1: Hero (Title and Upload) - 100vh */}
        <section id="hero-section" className="min-h-screen flex flex-col justify-center items-center gap-12 py-12">
          {/* App Title */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight uppercase">
              Stock Strategy Filter
            </h1>
            <p className="text-gray-400 mt-4 text-lg md:text-xl">Powerful stock analysis and filtering based on Value Investing strategies.</p>
          </div>

          {/* Upload component */}
          <div id="upload-section" className="w-full max-w-3xl">
            <UploadDashboard />
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-10 animate-bounce flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-2">Scroll to explore results</span>
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Results Sections Container */}
        <div className="flex flex-col gap-12 pb-24">
          {/* Section 2: Table component */}
          <div id="table-section" className="w-full">
            {rawStocks.length > 0 ? (
              <StockTable />
            ) : (
              <div className="py-20 flex items-center justify-center text-gray-500 border border-dashed border-[#333] rounded-xl">
                <p className="text-lg">Upload a CSV or Excel file to see the analysis results here.</p>
              </div>
            )}
          </div>

          {/* Section 3: Chart component */}
          {rawStocks.length > 0 && (
            <div id="chart-section" className="w-full pt-8 border-t border-[#333]">
              <PriceHistoryChart />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
