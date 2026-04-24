import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPollResults, submitVote, clearPollError } from '../store/pollSlice';
import ResultsChart from '../components/ResultsChart';
import { Clock, Users, ArrowLeft, Loader, CheckCircle2 } from 'lucide-react';

const PollDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentPoll, liveResults, votedPolls, loading, error } = useSelector(state => state.poll);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [selectedOption, setSelectedOption] = useState(null);
  
  const hasVoted = votedPolls[id] !== undefined;
  const isExpired = currentPoll ? new Date(currentPoll.poll.expiresAt) < new Date() : false;

  useEffect(() => {
    dispatch(fetchPollResults(id));
    return () => dispatch(clearPollError());
  }, [dispatch, id]);

  const handleVoteSubmit = async () => {
    if (selectedOption === null) return;
    if (!isAuthenticated) return navigate('/login');
    
    await dispatch(submitVote({ pollId: id, optionIndex: selectedOption }));
    // fetch results again to update chart instantly
    dispatch(fetchPollResults(id)); 
  };

  if (loading && !currentPoll) {
    return <div className="flex justify-center py-20"><Loader size={40} className="animate-spin text-primary-500" /></div>;
  }

  if (error && !currentPoll) {
    return <div className="text-red-400 text-center py-10 bg-red-500/10 rounded-lg p-6 my-8">{error}</div>;
  }

  if (!currentPoll) return <div className="text-center py-20 text-gray-500">Poll not found</div>;

  const { poll, totalVotes } = currentPoll;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-dark-800 rounded-2xl p-6 md:p-8 border border-dark-700 shadow-2xl relative overflow-hidden">
        {isExpired && <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Ended</div>}
        
        <h1 className="text-3xl font-bold mb-6 text-white leading-tight pr-12">{poll.question}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-8 border-b border-dark-700 pb-6">
          <span className="flex items-center gap-1"><Users size={16} /> {totalVotes} votes</span>
          <span className="flex items-center gap-1"><Clock size={16} /> {new Date(poll.expiresAt).toLocaleDateString()}</span>
        </div>

        {error && <div className="bg-red-500/10 text-red-400 p-4 border border-red-500/30 rounded-lg mb-6">{error}</div>}

        {(hasVoted || isExpired) ? (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-green-500" /> 
              {hasVoted ? "You've voted on this poll. Here are the results:" : "Poll has ended. Final results:"}
            </h3>
            {liveResults && <ResultsChart results={liveResults} />}
          </div>
        ) : (
          <div className="space-y-4">
            {poll.options.map((opt, idx) => (
              <label key={opt._id} 
                className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedOption === idx 
                    ? 'border-primary-500 bg-primary-500/10' 
                    : 'border-dark-600 bg-dark-900/50 hover:bg-dark-700 hover:border-dark-500'
                }`}
              >
                <input 
                  type="radio" 
                  name="poll_option" 
                  className="w-5 h-5 text-primary-500 bg-dark-900 border-dark-600 focus:ring-primary-500"
                  onChange={() => setSelectedOption(idx)}
                  checked={selectedOption === idx}
                />
                <span className="ml-4 text-lg text-gray-200">{opt.text}</span>
              </label>
            ))}

            <button 
              onClick={handleVoteSubmit}
              disabled={loading || selectedOption === null}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all ${
                selectedOption !== null 
                  ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                  : 'bg-dark-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? <Loader size={24} className="animate-spin" /> : 'Submit Vote'}
            </button>
            {!isAuthenticated && selectedOption !== null && (
              <p className="text-center text-sm text-gray-400 mt-2">You will be redirected to log in.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PollDetail;
