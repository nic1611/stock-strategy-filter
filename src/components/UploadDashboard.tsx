import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useStockStore } from '../store/useStockStore';
import { UploadCloud } from 'lucide-react';

export const UploadDashboard = () => {
    const setRawData = useStockStore((state) => state.setRawData);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const isCsv = file.name.endsWith('.csv');

        if (isCsv) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setRawData(results.data as any[]);
                },
            });
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const parsedData = XLSX.utils.sheet_to_json(sheet);
                setRawData(parsedData as any[]);
            };
            reader.readAsBinaryString(file);
        }
    }, [setRawData]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        multiple: false
    });

    return (
        <div
            {...getRootProps()}
            className={`
        w-full h-64 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer border-2 border-dashed
        ${isDragActive
                    ? 'border-green-500 bg-[#1a1a1a] shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                    : 'border-[#333333] bg-[#121212] hover:border-[#4d4d4d]'
                }
      `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
                <UploadCloud className={`w-16 h-16 mb-6 ${isDragActive ? 'text-green-500' : 'text-gray-500'}`} />

                <h3 className="text-xl font-medium text-gray-200 mb-6">Upload CSV or Excel File</h3>

                {isDragActive ? (
                    <p className="text-green-500 text-sm">Drop the file here...</p>
                ) : (
                    <button className="px-8 py-2.5 bg-[#1e1e1e] border border-[#333333] rounded-md text-gray-300 text-sm font-medium hover:bg-[#2d2d2d] transition-colors">
                        Select File
                    </button>
                )}
            </div>
        </div>
    );
};
