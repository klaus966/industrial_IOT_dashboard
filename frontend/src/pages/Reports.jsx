import client from '../api/client';
import { FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {

    const handleDownload = async () => {
        try {
            const response = await client.get('/reports/summary', {
                responseType: 'blob',
            });

            // Create Blob URL
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'plant_report.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            toast.success("Report downloaded");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate report");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Reports Center</h1>
                    <p className="text-gray-500">Generate and export system analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-bold dark:text-white mb-2">Plant Health Summary</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Complete overview of all assets, their current status, and critical alerts summary.
                    </p>
                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
