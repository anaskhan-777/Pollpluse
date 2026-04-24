import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  PlusCircle, 
  Trash2, 
  BarChart2, 
  Plus, 
  Minus, 
  Wand2, 
  X,
  Loader2,
  Users,
  Vote,
  Activity,
  ListOrdered
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminPanel = () => {
  // Main Data States
  const [stats, setStats] = useState({ totalPolls: 0, activePolls: 0, totalVotes: 0, totalUsers: 0 });
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results Modal States
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [activePoll, setActivePoll] = useState(null);

  // Voters Modal States
  const [isVotersOpen, setIsVotersOpen] = useState(false);
  const [votersData, setVotersData] = useState(null);
  const [loadingVoters, setLoadingVoters] = useState(false);

  // Delete Confirmation State
  const [pollToDelete, setPollToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pollsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/polls')
      ]);
      setStats(statsRes.data);
      setPolls(pollsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create Form Handlers
  const handleAddOption = () => {
    if (options.length < 10) setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleGenerateAI = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question first.");
      return;
    }
    try {
      setIsGenerating(true);
      const res = await api.post('/ai/generate-options', { question });
      if (res.data && res.data.options) {
        let aiOptions = res.data.options;
        if (aiOptions.length < 2) {
            aiOptions = [...aiOptions, "Option 2"];
        }
        setOptions(aiOptions.slice(0, 10)); // Ensure max 10
      }
    } catch (error) {
      console.error("Error generating options:", error);
      const msg = error.response?.data?.message || "Failed to generate options via AI.";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitPoll = async (e) => {
    e.preventDefault();
    if (options.some(opt => !opt.trim())) {
      toast.warning("All options must be filled out.");
      return;
    }
    if (!expiresAt) {
      toast.warning("Please set an expiry date.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/polls', { question, options, expiresAt });
      closeCreateModal();
      toast.success("Poll created successfully!");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error(error.response?.data?.message || "Failed to create poll");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setQuestion('');
    setOptions(['', '']);
    setExpiresAt('');
  };

  // Poll Action Handlers
  const handleDeletePoll = (id) => {
    setPollToDelete(id);
  };

  const confirmDeletePoll = async () => {
    if (!pollToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/polls/${pollToDelete}`);
      toast.success("Poll deleted successfully!");
      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting poll:", error);
      toast.error("Failed to delete poll");
    } finally {
      setIsDeleting(false);
      setPollToDelete(null);
    }
  };

  const handleViewResults = async (poll) => {
    try {
      const res = await api.get(`/polls/${poll._id}/results`);
      setActivePoll(poll);
      
      const labels = res.data.results.map(opt => opt.text);
      const data = res.data.results.map(opt => opt.votes);
      
      setResultsData({
        labels,
        datasets: [
          {
            label: 'Votes',
            data,
            backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
          }
        ]
      });
      setIsResultsOpen(true);
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to fetch poll results");
    }
  };

  const handleViewVoters = async (poll) => {
    try {
      setActivePoll(poll);
      setIsVotersOpen(true);
      setLoadingVoters(true);
      const res = await api.get(`/admin/polls/${poll._id}/voters`);
      setVotersData(res.data);
    } catch (error) {
      console.error("Error fetching voters:", error);
      toast.error("Failed to fetch poll voters");
      setIsVotersOpen(false);
    } finally {
      setLoadingVoters(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary-500 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-500">
          Admin Dashboard
        </h1>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-primary-500/25"
        >
          <PlusCircle size={20} />
          Create Poll
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Polls" value={stats.totalPolls} icon={<ListOrdered size={24} className="text-indigo-400" />} />
        <StatCard title="Active Polls" value={stats.activePolls} icon={<Activity size={24} className="text-emerald-400" />} />
        <StatCard title="Total Votes" value={stats.totalVotes} icon={<Vote size={24} className="text-amber-400" />} />
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users size={24} className="text-blue-400" />} />
      </div>

      {/* All Polls - Responsive */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 shadow-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-dark-700 font-semibold text-lg flex items-center gap-2">
          <ListOrdered className="text-primary-400" size={20}/> All Polls
          <span className="ml-auto text-sm font-normal text-gray-400">{polls.length} total</span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Question</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Votes</th>
                <th className="px-6 py-4 font-medium">Expires</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700 text-sm">
              {polls.map(poll => {
                const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
                const isExpired = new Date(poll.expiresAt) < new Date();
                return (
                  <tr key={poll._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-200 max-w-xs">
                      <span className="line-clamp-2">{poll.question}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isExpired ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{totalVotes}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{new Date(poll.expiresAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleViewVoters(poll)} className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 rounded-md hover:bg-emerald-400/10 text-xs">
                          <Users size={14} /> Voters
                        </button>
                        <button onClick={() => handleViewResults(poll)} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded-md hover:bg-indigo-400/10 text-xs">
                          <BarChart2 size={14} /> Results
                        </button>
                        <button onClick={() => handleDeletePoll(poll._id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {polls.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">No polls found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-dark-700">
          {polls.length === 0 && (
            <p className="text-center text-gray-500 italic py-10">No polls found.</p>
          )}
          {polls.map(poll => {
            const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
            const isExpired = new Date(poll.expiresAt) < new Date();
            return (
              <div key={poll._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-200 flex-1">{poll.question}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${isExpired ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Vote size={12} />{totalVotes} votes</span>
                  <span className="flex items-center gap-1"><Activity size={12} />{new Date(poll.expiresAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => handleViewVoters(poll)} className="flex-1 flex items-center justify-center gap-1 text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/10 transition-colors py-1.5 rounded-lg text-xs font-medium">
                    <Users size={13} /> Voters
                  </button>
                  <button onClick={() => handleViewResults(poll)} className="flex-1 flex items-center justify-center gap-1 text-indigo-400 border border-indigo-400/30 hover:bg-indigo-400/10 transition-colors py-1.5 rounded-lg text-xs font-medium">
                    <BarChart2 size={13} /> Results
                  </button>
                  <button onClick={() => handleDeletePoll(poll._id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-dark-600">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Poll Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-dark-700 sticky top-0 bg-dark-800 z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="text-primary-500" /> Create New Poll
              </h2>
              <button onClick={closeCreateModal} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitPoll} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Poll Question</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    required
                    value={question} 
                    onChange={e => setQuestion(e.target.value)}
                    className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-white"
                    placeholder="e.g. What is the best pizza topping?"
                  />
                  <button 
                    type="button" 
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !question.trim()}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    <span className="hidden sm:inline">AI Generate</span>
                    <span className="sm:hidden">AI</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Options</label>
                  <span className="text-xs text-gray-500">{options.length}/10 Options</span>
                </div>
                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center group">
                      <input 
                        type="text" 
                        required
                        value={opt} 
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-gray-200"
                        placeholder={`Option ${idx + 1}`}
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveOption(idx)}
                        disabled={options.length <= 2}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                      >
                        <Minus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                {options.length < 10 && (
                  <button 
                    type="button" 
                    onClick={handleAddOption}
                    className="mt-3 flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    <Plus size={16} /> Add Option
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={expiresAt} 
                  onChange={e => setExpiresAt(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-gray-200"
                />
              </div>

              <div className="pt-4 border-t border-dark-700">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Create Poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results View Modal */}
      {isResultsOpen && activePoll && resultsData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-between items-start p-6 border-b border-dark-700">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Poll Results</h2>
                <p className="text-gray-400 text-sm">{activePoll.question}</p>
              </div>
              <button onClick={() => setIsResultsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="h-[300px] w-full flex items-center justify-center">
                <Bar 
                  data={resultsData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#cbd5e1' }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: '#94a3b8' },
                        grid: { color: '#334155' }
                      },
                      x: {
                        ticks: { color: '#94a3b8' },
                        grid: { display: false }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voters Modal */}
      {isVotersOpen && activePoll && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-between items-start p-6 border-b border-dark-700 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="text-primary-400" /> Voter Breakdown
                </h2>
                <p className="text-gray-400 text-sm mt-1">{activePoll.question}</p>
              </div>
              <button onClick={() => setIsVotersOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {loadingVoters ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
                </div>
              ) : votersData && votersData.optionBreakdown ? (
                <div className="space-y-6">
                  {votersData.optionBreakdown.map((opt, idx) => (
                    <div key={idx} className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
                      <div className="bg-dark-800/80 px-4 py-3 border-b border-dark-700 flex justify-between items-center">
                        <span className="font-medium text-gray-200">{opt.optionText}</span>
                        <span className="bg-primary-500/20 text-primary-400 text-xs px-2.5 py-1 rounded-full font-bold">
                          {opt.voters.length} Votes
                        </span>
                      </div>
                      <div className="p-4">
                        {opt.voters.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {opt.voters.map((voter, vIdx) => (
                              <div key={vIdx} className="flex items-center gap-3 bg-dark-800 p-3 rounded-lg border border-dark-700/50">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                                  {voter.userName ? voter.userName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="truncate">
                                  <p className="text-sm font-medium text-gray-200 truncate">{voter.userName}</p>
                                  <p className="text-xs text-gray-500 truncate">{voter.userEmail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic text-center py-2">No voters for this option.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-red-400">Failed to load voters data.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {pollToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Poll?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete this poll? This action cannot be undone and will erase all associated votes permanently.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setPollToDelete(null)}
                disabled={isDeleting}
                className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeletePoll}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center"
              >
                {isDeleting ? <Loader2 size={20} className="animate-spin" /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg flex items-center gap-5 hover:border-dark-600 transition-colors">
    <div className="p-3 bg-dark-900 rounded-lg">{icon}</div>
    <div>
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

export default AdminPanel;
