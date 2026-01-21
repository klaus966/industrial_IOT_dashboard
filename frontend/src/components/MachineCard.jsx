import { Activity, Thermometer, Gauge } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function MachineCard({ machine, data }) {
    // Determine Color based on Status
    const statusColors = {
        Healthy: 'bg-green-500',
        Alert: 'bg-yellow-500',
        Danger: 'bg-orange-500',
        Critical: 'bg-red-600'
    };

    const statusColor = statusColors[machine.status] || 'bg-gray-400';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 hover:text-primary cursor-pointer transition-colors">
                        <a href={`/machines/${machine.id}`}>{machine.name}</a>
                    </h3>
                    <p className="text-xs text-gray-500">{machine.type} • {machine.location}</p>
                </div>
                <div className={clsx("px-2 py-1 rounded text-xs font-bold text-white uppercase tracking-wider", statusColor)}>
                    {machine.status}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Thermometer size={14} /> Temp
                    </div>
                    <span className={clsx("text-lg font-mono font-semibold", data?.temperature > 85 ? "text-red-500" : "text-gray-700 dark:text-gray-300")}>
                        {data?.temperature?.toFixed(1)}°C
                    </span>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Activity size={14} /> Vib
                    </div>
                    <span className="text-lg font-mono font-semibold text-gray-700 dark:text-gray-300">
                        {data?.vibration?.toFixed(2)}
                    </span>
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                    <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                        <div className="flex items-center gap-1"><Gauge size={14} /> Health Score</div>
                        <span>{data?.health_score?.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                            className={clsx("h-full transition-all duration-500 ease-out", statusColor)}
                            style={{ width: `${data?.health_score}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
