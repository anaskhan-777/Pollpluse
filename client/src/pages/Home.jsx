import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivePolls } from '../store/pollSlice';
import PollCard from '../components/PollCard';
import { Loader } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const { activePolls, loading, error } = useSelector((state) => state.poll);

  useEffect(() => {
    dispatch(fetchActivePolls());
  }, [dispatch]);

  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-cyan-400">
          Live Polls & Opinions
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Have your say on trending topics. Vote on active polls below to see live community results instantly.
        </p>
      </div>

      {loading && activePolls.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Loader size={40} className="text-primary-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-10 bg-red-500/10 rounded-lg p-6 max-w-lg mx-auto">
          {error}
        </div>
      ) : activePolls.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-dark-800 rounded-xl border border-dark-700">
          <p className="text-xl">No active polls found.</p>
          <p className="text-sm mt-2">Come back later or check Past Polls.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePolls.map(poll => (
            <PollCard key={poll._id} poll={poll} isExpired={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
