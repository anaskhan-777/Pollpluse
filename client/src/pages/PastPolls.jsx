import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PollCard from '../components/PollCard';
import { Loader } from 'lucide-react';

const PastPolls = () => {
  const [pastPolls, setPastPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPastPolls = async () => {
      try {
        // Technically this route might not exist publically depending on implementation,
        // let's create a custom filter from all polls if admin or build a fast specific endpoint.
        // Actually, for public past polls, we might need to modify backend or just fetch all and filter.
        // The business rule: GET /api/polls is admin only.
        // Let's modify the backend later to add GET /api/polls/past, OR just ask the user.
        // Wait, I will use a simple axios call and if it fails show error.
        // I will add a backend route /api/polls/past that is public.
        const response = await api.get('/polls'); // Need to handle auth?
      } catch (err) {
        // ... Wait, since GET /api/polls is admin only, I should add a specific backend route.
      }
    };
    
    // Quick fix: Add route in backend. Let's do it via axios here first.
    const getExpired = async () => {
      try {
        const res = await api.get('/polls/past');
        setPastPolls(res.data);
      } catch (err) {
        setError("Failed to load past polls. (May need backend route update)");
      } finally {
        setLoading(false);
      }
    };
    getExpired();
  }, []);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Past Polls</h1>
      
      {loading ? (
        <div className="flex justify-center py-20"><Loader size={40} className="animate-spin text-primary-500" /></div>
      ) : error ? (
        <div className="text-red-400 bg-red-500/10 p-6 rounded-xl text-center">{error}</div>
      ) : pastPolls.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-dark-800 rounded-xl">No past polls found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastPolls.map(poll => (
            <PollCard key={poll._id} poll={poll} isExpired={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PastPolls;
