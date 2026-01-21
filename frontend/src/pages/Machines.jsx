import { useState, useEffect } from 'react';
import client from '../api/client';
import { Plus, Edit2, Trash2, X, Save, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Machines() {
    const [machines, setMachines] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [msg, setMsg] = useState({ name: '', type: 'Motor', location: '' });

    useEffect(() => {
        fetchMachines();
    }, []);

    const fetchMachines = async () => {
        try {
            setLoading(true);
            const res = await client.get('/machines');
            setMachines(res.data);
        } catch (err) {
            toast.error("Failed to load machines");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this machine?')) return;
        try {
            await client.delete(`/machines/${id}`);
            setMachines(machines.filter(m => m.id !== id));
            toast.success('Machine deleted successfully');
        } catch (err) {
            toast.error('Failed to delete machine');
        }
    };

    const handleEdit = (machine) => {
        setEditingMachine(machine);
        setMsg({ name: machine.name, type: machine.type, location: machine.location });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingMachine(null);
        setMsg({ name: '', type: 'Motor', location: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMachine) {
                const res = await client.put(`/machines/${editingMachine.id}`, msg);
                setMachines(machines.map(m => m.id === editingMachine.id ? res.data : m));
                toast.success('Machine updated');
            } else {
                const res = await client.post('/machines', msg);
                setMachines([...machines, res.data]);
                toast.success('Machine created');
            }
            setIsModalOpen(false);
        } catch (err) {
            toast.error("Operation failed");
            console.error(err);
        }
    };

    const filteredMachines = machines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Assets Management</h1>
                    <p className="text-gray-500">Manage your industrial machines and sensors</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus size={20} /> Add Machine
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search machines by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-card dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Location</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                            <th className="px-6 py-4 font-semibold text-right text-gray-600 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading assets...</td></tr>
                        ) : filteredMachines.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No machines found.</td></tr>
                        ) : (
                            filteredMachines.map(m => (
                                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium dark:text-white">{m.name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                                            {m.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{m.location}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-2 py-1 rounded-full text-xs font-bold",
                                            m.status === 'Healthy' ? "bg-green-100 text-green-700" :
                                                m.status === 'Critical' ? "bg-red-100 text-red-700" :
                                                    m.status === 'Danger' ? "bg-orange-100 text-orange-700" :
                                                        "bg-yellow-100 text-yellow-700"
                                        )}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(m)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-card w-full max-w-md rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white">
                                {editingMachine ? 'Edit Machine' : 'Add New Machine'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Machine Name</label>
                                <input
                                    type="text"
                                    required
                                    value={msg.name}
                                    onChange={e => setMsg({ ...msg, name: e.target.value })}
                                    className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="e.g. Main Pump A"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Type</label>
                                <select
                                    value={msg.type}
                                    onChange={e => setMsg({ ...msg, type: e.target.value })}
                                    className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                >
                                    <option>Motor</option>
                                    <option>Fan</option>
                                    <option>Compressor</option>
                                    <option>Pump</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Location</label>
                                <input
                                    type="text"
                                    required
                                    value={msg.location}
                                    onChange={e => setMsg({ ...msg, location: e.target.value })}
                                    className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="e.g. Floor 2"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
