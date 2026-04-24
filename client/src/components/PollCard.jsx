import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, TrendingUp } from 'lucide-react';

const PollCard = ({ poll, isExpired = false }) => {
  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
  const timeLeft = new Date(poll.expiresAt).getTime() - new Date().getTime();
  const expired = isExpired || timeLeft <= 0;

  let formattedTime = '';
  if (expired) {
    formattedTime = 'Ended';
  } else {
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    formattedTime = days > 0 ? `${days}d left` : hours > 0 ? `${hours}h left` : `${mins}m left`;
  }

  // Top voted option for preview
  const topOption = poll.options.reduce((max, opt) => opt.votes > max.votes ? opt : max, poll.options[0]);
  const topPct = totalVotes > 0 ? Math.round((topOption.votes / totalVotes) * 100) : 0;

  return (
    <Link
      to={`/polls/${poll._id}`}
      className={`group flex flex-col bg-dark-800 rounded-xl border transition-all duration-300 shadow-lg overflow-hidden
        ${expired
          ? 'border-dark-700 opacity-75'
          : 'border-dark-700 hover:border-primary-500 hover:shadow-primary-500/10 hover:shadow-xl hover:-translate-y-0.5'
        }`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${expired ? 'bg-gray-600' : 'bg-gradient-to-r from-primary-500 to-cyan-400 group-hover:from-cyan-400 group-hover:to-primary-500 transition-all duration-500'}`} />

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category badge */}
        {poll.category && (
          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 mb-3 w-fit">
            {poll.category}
          </span>
        )}

        {/* Question */}
        <h3 className="text-base sm:text-lg font-semibold leading-snug mb-4 text-white line-clamp-3 flex-1">
          {poll.question}
        </h3>

        {/* Top option preview */}
        {totalVotes > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span className="truncate max-w-[70%]">📊 {topOption.text}</span>
              <span className="font-semibold text-primary-400">{topPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${topPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-dark-700">
          <span className="flex items-center gap-1">
            <Users size={13} className="text-primary-400" />
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </span>
          <span className={`flex items-center gap-1 font-medium ${expired ? 'text-red-400' : 'text-emerald-400'}`}>
            <Clock size={13} />
            {formattedTime}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PollCard;
