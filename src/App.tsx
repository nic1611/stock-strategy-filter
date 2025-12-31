import { UploadDashboard } from './components/UploadDashboard';
import { StockTable } from './components/StockTable';
import { useStockStore } from './store/useStockStore';
import { Navbar } from './components/Navbar';
// import { exportToExcel } from './utils/export';
// import { Download, Trash2 } from 'lucide-react';

function App() {
  const { rawStocks } = useStockStore();

  return (
    <div className="min-h-screen bg-[#18181b] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#202023] border-b border-[#333] h-16 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <h1 className="text-lg font-bold text-white tracking-wide uppercase">
            Stock Strategy Filter
          </h1>
        </div>
        <Navbar />
      </header>

      {/* Main Layout - 2 Columns */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-8 max-w-[1920px] mx-auto w-full h-[calc(100vh-64px)] overflow-hidden">
        {/* Left Column: Upload / Controls */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#121212] p-8 rounded-lg border border-[#333] shadow-lg h-full flex flex-col justify-center">
            <UploadDashboard />
          </div>
        </div>

        {/* Right Column: Table / Results */}
        <div className="flex flex-col h-full overflow-hidden bg-[#121212] rounded-lg border border-[#333] shadow-lg">
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
