import { UploadDashboard } from './components/UploadDashboard';
import { StockTable } from './components/StockTable';
import { useStockStore } from './store/useStockStore';

function App() {
  const { rawStocks } = useStockStore();

  return (
    <div className="min-h-screen bg-[#18181b] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#202023] border-b border-[#333] h-16 px-24 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <h1 className="text-lg font-bold text-white tracking-wide uppercase">
            Stock Strategy Filter
          </h1>
        </div>
      </header>

      {/* Main Layout - 2 Columns */}
      {/* Main Layout - Vertical Stack */}
      <main className="flex-1 p-8 flex flex-col gap-8 max-w-[1920px] mx-auto w-full h-[calc(100vh-64px)]">
        {/* Upload Section - Centered, limited width */}
        <div className="w-[50%] max-w-3xl mx-auto shrink-0 my-10">
          <div className="bg-[#121212] p-8 rounded-lg border border-[#333] shadow-lg flex flex-col justify-center">
            <UploadDashboard />
          </div>
        </div>

        {/* Results Section - Takes remaining space */}
        <div className="flex-1 min-h-0 bg-[#121212] rounded-lg border border-[#333] shadow-lg flex flex-col overflow-hidden">
          {rawStocks.length > 0 ? (
            <StockTable />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Upload a file to view analysis results.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
