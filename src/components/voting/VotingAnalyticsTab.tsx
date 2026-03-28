// Voting Analytics Tab - Charts and insights for voting data
import React from 'react';
import { VotingAnalytics } from '../../types/voting';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Vote,
  DollarSign,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface VotingAnalyticsTabProps {
  analytics: VotingAnalytics | null;
  isLoading: boolean;
  currency: string;
}

export const VotingAnalyticsTab: React.FC<VotingAnalyticsTabProps> = ({
  analytics,
  isLoading,
  currency,
}) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400">No analytics data available</p>
      </div>
    );
  }

  // Mock data for charts (would come from analytics in real app)
  const votesOverTime = analytics.votesOverTime.length > 0 
    ? analytics.votesOverTime 
    : [
      { timestamp: 'Mon', value: 120, label: 'Mon' },
      { timestamp: 'Tue', value: 180, label: 'Tue' },
      { timestamp: 'Wed', value: 250, label: 'Wed' },
      { timestamp: 'Thu', value: 320, label: 'Thu' },
      { timestamp: 'Fri', value: 280, label: 'Fri' },
      { timestamp: 'Sat', value: 450, label: 'Sat' },
      { timestamp: 'Sun', value: 380, label: 'Sun' },
    ];

  // Convert votesPerCategory to chart format
  const votesByCategory = Object.entries(analytics.votesPerCategory || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Get top contestants from votesPerContestant
  const topContestants = Object.entries(analytics.votesPerContestant || {})
    .map(([id, votes]) => ({ id, votes }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Votes"
          value={analytics.totalVotes.toLocaleString()}
          icon={Vote}
          color="indigo"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Unique Voters"
          value={analytics.uniqueVoters.toLocaleString()}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Avg Votes/User"
          value={analytics.averageVotesPerVoter.toFixed(1)}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Votes Over Time */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Votes Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={votesOverTime}>
                <defs>
                  <linearGradient id="voteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="votes"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#voteGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Votes by Category */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Votes by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={votesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {votesByCategory.map((entry: { name: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Contestants */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Top Contestants</h3>
        {topContestants.length > 0 ? (
          <div className="space-y-3">
            {topContestants.map((contestant: { id: string; votes: number }, index: number) => (
              <div
                key={contestant.id}
                className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg"
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  index === 0 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                  index === 1 && 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
                  index === 2 && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                  index > 2 && 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                )}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    Contestant {contestant.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {contestant.votes.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">votes</p>
                </div>
                {/* Progress bar */}
                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    style={{
                      width: `${(contestant.votes / (topContestants[0]?.votes || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No voting data yet
          </p>
        )}
      </div>

      {/* Voter Engagement Stats */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Voter Engagement</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {((analytics.paymentSuccessRate || 0) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Payment Success</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {analytics.invalidVotes || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Invalid Votes</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {analytics.authenticatedVsAnonymous?.authenticated || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Authenticated Voters</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
              {analytics.authenticatedVsAnonymous?.anonymous || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Anonymous Voters</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: number;
  color: 'indigo' | 'emerald' | 'purple' | 'amber';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn('p-2 rounded-lg', colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            trend >= 0 ? 'text-emerald-600' : 'text-red-600'
          )}>
            {trend >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};
