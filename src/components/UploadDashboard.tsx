import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, Info } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useStockStore } from '../store/useStockStore';

export const UploadDashboard = () => {
    const { setRawData, isProcessing } = useStockStore();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const reader = new FileReader();

        if (file.name.endsWith('.csv')) {
            reader.onload = (e) => {
                const text = e.target?.result as string;
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setRawData(results.data as any);
                        // Redirect to table section
                        setTimeout(() => {
                            document.getElementById('table-section')?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }, 100);
                    },
                    error: (error: any) => {
                        console.error('CSV Parsing Error:', error);
                    }
                });
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                setRawData(jsonData as any);
                // Redirect to table section
                setTimeout(() => {
                    document.getElementById('table-section')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            };
            reader.readAsArrayBuffer(file);
        }
    }, [setRawData]);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        multiple: false
    });

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">Import Fundamental Data</h2>
                <p className="text-gray-400 text-sm font-light">
                    Follow the instructions below to get your data from Investsite and upload it here.
                </p>
            </div>

            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer
                    ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-[#333] hover:border-[#444] bg-[#1a1a1a]'}
                    ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
                `}
            >
                <input {...getInputProps()} />
                <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-500/20' : 'bg-[#222]'}`}>
                    <Upload className={`w-10 h-10 ${isDragActive ? 'text-blue-500' : 'text-gray-500'}`} />
                </div>

                <div className="text-center">
                    <p className="text-white font-medium">
                        {isDragActive ? 'Drop it here!' : 'Click or drag file to upload'}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                        Supports .csv, .xlsx and .xls
                    </p>
                </div>
            </div>

            {fileRejections.length > 0 && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-500 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>Invalid file type. Please upload a CSV or Excel spreadsheet.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333] flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-500 font-bold text-sm">1</div>
                        <p className="text-white text-sm font-medium">Access Investsite</p>
                    </div>
                    <p className="text-gray-500 text-xs">
                        Go to <a href="https://www.investsite.com.br" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Investsite</a> and navigate to the "Filtro de Ações" section.
                    </p>
                </div>

                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333] flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-500 font-bold text-sm">2</div>
                        <p className="text-white text-sm font-medium">Search All Actions</p>
                    </div>
                    <p className="text-gray-500 text-xs">
                        Wait for the search to load all Brazilian stocks (B3) with: Ação; Empresa; Preço; Margem EBIT; EV/EBIT; Div.Yield; Volume Financ.(R$).
                    </p>
                </div>

                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333] flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-500 font-bold text-sm">3</div>
                        <p className="text-white text-sm font-medium">Copy Data</p>
                    </div>
                    <p className="text-gray-500 text-xs">
                        Select and copy the entire data table from the page (usually Ctrl+A, Ctrl+C).
                    </p>
                </div>

                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333] flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-500 font-bold text-sm">4</div>
                        <p className="text-white text-sm font-medium">Paste to Sheets</p>
                    </div>
                    <p className="text-gray-500 text-xs">
                        Paste the data into Excel or Google Sheets to verify columns like <b>Papel</b> and <b>ROIC</b>.
                    </p>
                </div>

                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333] flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-500 font-bold text-sm">5</div>
                        <p className="text-white text-sm font-medium">Export to CSV</p>
                    </div>
                    <p className="text-gray-500 text-xs">
                        Save as <b>CSV</b> or just upload the <b>XLSX</b> file directly to the box above.
                    </p>
                </div>

                <div className="bg-blue-600/5 p-4 rounded-lg border border-blue-500/20 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-500/20 rounded-md">
                            <Info className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-white text-sm font-medium">Live Charts</p>
                    </div>
                    <p className="text-gray-500 text-xs">
                        Price history and variation will still be updated live via API for your selected stocks.
                    </p>
                </div>
            </div>
        </div>
    );
};
