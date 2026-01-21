import { useState, useEffect } from 'react';
import client from '../api/client';
import MachineCard from '../components/MachineCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [machines, setMachines] = useState([]);
    const [latestData, setLatestData] = useState({});
    const [stats, setStats] = useState({ total: 0, critical: 0, healthy: 0 });
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            // In a real app, optimize loops
            const [machinesRes, dataRes] = await Promise.all([
                client.get('/machines'),
                client.get('/data/latest')
            ]);

            setError(null);

            const machineList = machinesRes.data;
            const dataList = dataRes.data;

            // Transform data list to map by machine_id
            const dataMap = {};
            dataList.forEach(d => {
                dataMap[d.machine_id] = d;
            });

            setMachines(machineList);
            setLatestData(dataMap);

            // Calc Stats
            const total = machineList.length;
            const critical = machineList.filter(m => m.status === 'Critical' || m.status === 'Danger').length;
            const healthy = machineList.filter(m => m.status === 'Healthy').length;
            setStats({ total, critical, healthy });

            // Check for alarms
            machineList.forEach(m => {
                if (m.status === 'Critical') {
                    toast.error(`CRITICAL ALARM: ${m.name} is in Critical state!`, {
                        id: `critical-${m.id}`, // Unique ID prevents duplicates
                        duration: 5000,
                        icon: '🚨'
                    });
                } else if (m.status === 'Danger') {
                    toast.error(`WARNING: ${m.name} is showing instability.`, {
                        id: `danger-${m.id}`,
                        duration: 4000,
                        icon: '⚠️'
                    });
                }
            });

        } catch (err) {
            console.error("Error fetching dashboard data", err);
            setError("Unable to connect to the server or database. Please check your connection.");
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                        <div>
                            <p className="text-sm text-red-700 font-bold">System Error</p>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Assets</p>
                        <h3 className="text-2xl font-bold">{stats.total}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Critical / Danger</p>
                        <h3 className="text-2xl font-bold">{stats.critical}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Healthy</p>
                        <h3 className="text-2xl font-bold">{stats.healthy}</h3>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-primary to-blue-600 p-6 rounded-xl shadow-sm text-white flex flex-col justify-center">
                    <p className="opacity-80 text-sm">System Status</p>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        Monitoring Active
                    </h3>
                </div>
            </div>

            {/* Machines Grid */}
            <div>
                <h3 className="text-lg font-bold mb-4">Live Machine Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {machines.map(m => (
                        <MachineCard key={m.id} machine={m} data={latestData[m.id]} />
                    ))}
                    {machines.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 py-10">Loading machines...</p>
                    )}
                </div>
            </div>
        </div>
    )
}
