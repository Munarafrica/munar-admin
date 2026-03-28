// Vote Modal - Cast votes for a contestant
import React, { useState } from 'react';
import { Contestant } from '../../types/voting';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import {
  X,
  Vote,
  Minus,
  Plus,
  Sparkles,
  CreditCard,
  Wallet,
  AlertCircle,
} from 'lucide-react';

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestant: Contestant | null;
  userVoteBalance: number;
  onCastVote: (voteCount: number) => Promise<void>;
  onBuyVotes: () => void;
  isLoading: boolean;
  isPaidVoting: boolean;
  pricePerVote: number;
}

export const VoteModal: React.FC<VoteModalProps> = ({
  isOpen,
  onClose,
  contestant,
  userVoteBalance,
  onCastVote,
  onBuyVotes,
  isLoading,
  isPaidVoting,
  pricePerVote,
}) => {
  const [voteCount, setVoteCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'card'>('balance');

  const maxVotes = paymentMethod === 'balance' ? userVoteBalance : 100;
  const totalCost = isPaidVoting && paymentMethod === 'card' ? voteCount * pricePerVote : 0;

  const handleVote = async () => {
    await onCastVote(voteCount);
    setVoteCount(1);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);

  if (!isOpen || !contestant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        {/* Contestant Header */}
        <div className="relative p-6 pb-4">
          <div className="flex items-center gap-4">
            <img
              src={contestant.imageUrl || 'https://via.placeholder.com/80'}
              alt={contestant.name}
              className="w-20 h-20 rounded-xl object-cover border-2 border-white/20"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{contestant.name}</h2>
              {contestant.code && (
                <code className="text-sm text-white/50">{contestant.code}</code>
              )}
              <p className="text-sm text-white/60 mt-1">
                Current votes: {contestant.voteCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Vote Count Selector */}
        <div className="px-6 py-4 bg-black/20">
          <label className="block text-sm font-medium text-white/70 mb-3">
            How many votes?
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setVoteCount(Math.max(1, voteCount - 1))}
              disabled={voteCount <= 1}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{voteCount}</span>
            </div>
            <button
              onClick={() => setVoteCount(Math.min(maxVotes, voteCount + 1))}
              disabled={voteCount >= maxVotes}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {/* Quick Select */}
          <div className="flex justify-center gap-2 mt-4">
            {[5, 10, 20, 50].filter(v => v <= maxVotes).map((num) => (
              <button
                key={num}
                onClick={() => setVoteCount(num)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-all',
                  voteCount === num
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Options */}
        {isPaidVoting && (
          <div className="px-6 py-4 border-t border-white/10">
            <label className="block text-sm font-medium text-white/70 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('balance')}
                className={cn(
                  'p-3 rounded-xl border-2 transition-all',
                  paymentMethod === 'balance'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  <span className="font-medium text-white">Vote Balance</span>
                </div>
                <p className="text-xs text-white/50">
                  {userVoteBalance} votes available
                </p>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={cn(
                  'p-3 rounded-xl border-2 transition-all',
                  paymentMethod === 'card'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium text-white">Pay Now</span>
                </div>
                <p className="text-xs text-white/50">
                  {formatCurrency(pricePerVote)}/vote
                </p>
              </button>
            </div>

            {/* Balance Warning */}
            {paymentMethod === 'balance' && userVoteBalance < voteCount && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                <div className="text-xs text-amber-300">
                  <p className="font-medium">Insufficient vote balance</p>
                  <button
                    onClick={onBuyVotes}
                    className="underline hover:no-underline"
                  >
                    Buy more votes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-6 bg-black/20 border-t border-white/10">
          {/* Summary */}
          {isPaidVoting && paymentMethod === 'card' && (
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-white/60">Total Cost</span>
              <span className="text-xl font-bold text-white">{formatCurrency(totalCost)}</span>
            </div>
          )}

          <Button
            onClick={handleVote}
            disabled={
              isLoading ||
              voteCount < 1 ||
              (paymentMethod === 'balance' && userVoteBalance < voteCount)
            }
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white gap-2 py-3 text-lg font-bold disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Vote className="w-5 h-5" />
                Cast {voteCount} Vote{voteCount > 1 ? 's' : ''}
              </>
            )}
          </Button>

          {/* Need more votes? */}
          {isPaidVoting && paymentMethod === 'balance' && (
            <button
              onClick={onBuyVotes}
              className="w-full mt-3 text-center text-sm text-white/50 hover:text-white/80 transition-colors flex items-center justify-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              Need more votes? Buy a package
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
