import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResultsChart = ({ results }) => {
  const data = {
    labels: results.map(r => r.text),
    datasets: [
      {
        label: 'Votes',
        data: results.map(r => r.percentage),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Primary-500
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(51, 65, 85, 0.3)' }, // Dark-700
        ticks: { callback: (value) => `${value}%`, color: '#94a3b8' } // text-slate-400
      },
      y: {
        grid: { display: false },
        ticks: { color: '#f8fafc', font: { size: 14 } } // text-slate-50
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const originalVotes = results[index].votes;
            return ` ${context.raw}% (${originalVotes} votes)`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-80 mt-6 relative">
      <Bar data={data} options={options} />
    </div>
  );
};

export default ResultsChart;
