// Round Modal - Create or edit a voting round
import React, { useState, useEffect } from 'react';
import { VotingRound } from '../../types/voting';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Layers } from 'lucide-react';

interface RoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRoundData) => Promise<void>;
  round?: VotingRound;
  roundNumber: number;
}

export interface CreateRoundData {
  name: string;
  startDate: string;
  endDate: string;
  advancementRule: 'top-votes' | 'percentage' | 'threshold' | 'manual';
  advancementCount?: number;
  advancementPercentage?: number;
  voteThreshold?: number;
}

export const RoundModal: React.FC<RoundModalProps> = ({
  isOpen,
  onClose,
  onSave,
  round,
  roundNumber,
}) => {
  const [formData, setFormData] = useState<CreateRoundData>({
    name: '',
    startDate: '',
    endDate: '',
    advancementRule: 'top-votes',
    advancementCount: 10,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (round) {
      setFormData({
        name: round.name,
        startDate: round.startDate.split('T')[0],
        endDate: round.endDate.split('T')[0],
        advancementRule: round.advancementRule,
        advancementCount: round.advancementCount,
        advancementPercentage: round.advancementPercentage,
        voteThreshold: round.voteThreshold,
      });
    } else {
      setFormData({
        name: `Round ${roundNumber}`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        advancementRule: 'top-votes',
        advancementCount: 10,
      });
    }
  }, [round, roundNumber, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save round:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {round ? 'Edit Round' : 'Add Round'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Configure voting round settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Round Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Preliminary Round"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Start Date *
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                End Date *
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Advancement Rule *
            </label>
            <select
              value={formData.advancementRule}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                advancementRule: e.target.value as CreateRoundData['advancementRule']
              }))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="top-votes">Top Votes (advance top N contestants)</option>
              <option value="percentage">Percentage (advance top X%)</option>
              <option value="threshold">Vote Threshold (minimum votes required)</option>
              <option value="manual">Manual Selection</option>
            </select>
          </div>

          {formData.advancementRule === 'top-votes' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Number to Advance *
              </label>
              <Input
                type="number"
                value={formData.advancementCount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, advancementCount: Number(e.target.value) }))}
                placeholder="10"
                min={1}
                required
              />
            </div>
          )}

          {formData.advancementRule === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Percentage to Advance *
              </label>
              <Input
                type="number"
                value={formData.advancementPercentage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, advancementPercentage: Number(e.target.value) }))}
                placeholder="50"
                min={1}
                max={100}
                required
              />
            </div>
          )}

          {formData.advancementRule === 'threshold' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Minimum Votes Required *
              </label>
              <Input
                type="number"
                value={formData.voteThreshold || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, voteThreshold: Number(e.target.value) }))}
                placeholder="100"
                min={1}
                required
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : round ? 'Update Round' : 'Add Round'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
