import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { ArrowLeft, Activity, Thermometer, Gauge } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import clsx from 'clsx';

export default function MachineDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [machine, setMachine] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDetails = async () => {
        try {
            const [mRes, hRes] = await Promise.all([
                client.get(`/machines/${id}`),
                client.get(`/data/${id}?limit=50`)
            ]);
            setMachine(mRes.data);
            // Reverse history to show chronological order
            setHistory([...hRes.data].reverse());
            setLoading(false);
        } catch (err) {
            console.error("Failed to load details", err);
        }
    };

    useEffect(() => {
        fetchDetails();
        const interval = setInterval(fetchDetails, 2000); // Live updates
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    if (!machine) return <div className="p-8 text-center text-red-500">Machine not found</div>;

    const latest = history[history.length - 1] || {};

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/machines')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
                <ArrowLeft size={20} /> Back to Assets
            </button>

            {/* Header Info */}
            <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white mb-1">{machine.name}</h1>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <span>Type: {machine.type}</span>
                        <span>Location: {machine.location}</span>
                    </div>
                </div>
                <div className={clsx(
                    "px-4 py-2 rounded-lg font-bold text-white",
                    machine.status === 'Healthy' ? "bg-green-500" :
                        machine.status === 'Alert' ? "bg-yellow-500" :
                            machine.status === 'Danger' ? "bg-orange-500" : "bg-red-600"
                )}>
                    {machine.status}
                </div>
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Thermometer size={20} /> Temperature
                    </div>
                    <div className="text-3xl font-mono font-semibold dark:text-white">
                        {latest.temperature?.toFixed(1)}°C
                    </div>
                </div>

                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Activity size={20} /> Vibration RMS
                    </div>
                    <div className="text-3xl font-mono font-semibold dark:text-white">
                        {latest.vibration?.toFixed(3)} G
                    </div>
                </div>

                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Gauge size={20} /> Health Score
                    </div>
                    <div className="text-3xl font-mono font-semibold dark:text-white">
                        {latest.health_score?.toFixed(0)}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-500"
                            style={{ width: `${latest.health_score}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold mb-6 dark:text-white">Temperature Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="timestamp" hide />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#ec4899"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold mb-6 dark:text-white">Vibration Analysis</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="timestamp" hide />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="vibration"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
