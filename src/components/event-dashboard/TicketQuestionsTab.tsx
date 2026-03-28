import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Plus, Trash2, Edit2, GripVertical, CheckSquare, AlignLeft, List, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { TicketType } from './types';
import { ticketsService } from '../../services';
import { toast } from 'sonner';

export interface Question {
  id: string;
  label: string;
  type: 'text' | 'dropdown' | 'checkbox';
  required: boolean;
  ticketIds: string[]; // 'all' or specific IDs
  options?: string[]; // for dropdown/checkbox
}

interface TicketQuestionsTabProps {
  tickets: TicketType[];
  eventId: string;
}

export const TicketQuestionsTab: React.FC<TicketQuestionsTabProps> = ({ tickets, eventId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Question>>({
    label: '',
    type: 'text',
    required: false,
    ticketIds: ['all'],
    options: []
  });
  const [optionInput, setOptionInput] = useState('');

  // Load questions from API
  useEffect(() => {
    if (!eventId) return;
    setIsLoadingQuestions(true);
    ticketsService.getQuestions(eventId)
      .then((data) => setQuestions(data as unknown as Question[]))
      .catch(() => toast.error('Failed to load questions'))
      .finally(() => setIsLoadingQuestions(false));
  }, [eventId]);

  const handleEdit = (question: Question) => {
    setFormData(question);
    setEditingId(question.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Delete this question?")) return;
    try {
      await ticketsService.deleteQuestion(eventId, id);
      setQuestions(questions.filter(q => q.id !== id));
      toast.success('Question deleted');
    } catch {
      toast.error('Failed to delete question');
    }
  };

  const handleSave = async () => {
    if (!formData.label) return;

    try {
      if (editingId) {
        const updated = await ticketsService.updateQuestion(eventId, editingId, {
          label: formData.label!,
          type: formData.type as any,
          required: formData.required || false,
          ticketIds: formData.ticketIds || ['all'],
          options: formData.options || [],
        });
        setQuestions(questions.map(q => q.id === editingId ? (updated as unknown as Question) : q));
        toast.success('Question updated');
      } else {
        const created = await ticketsService.createQuestion(eventId, {
          label: formData.label!,
          type: formData.type as any,
          required: formData.required || false,
          ticketIds: formData.ticketIds || ['all'],
          options: formData.options || [],
        });
        setQuestions([...questions, created as unknown as Question]);
        toast.success('Question created');
      }
    } catch {
      toast.error('Failed to save question');
    }
    
    setIsAdding(false);
    setEditingId(null);
    setFormData({ label: '', type: 'text', required: false, ticketIds: ['all'], options: [] });
  };

  const addOption = () => {
    if (optionInput.trim()) {
        setFormData(prev => ({ ...prev, options: [...(prev.options || []), optionInput.trim()] }));
        setOptionInput('');
    }
  };

  const removeOption = (index: number) => {
      setFormData(prev => ({ ...prev, options: (prev.options || []).filter((_, i) => i !== index) }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
       <div className="flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Checkout Questions</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Collect extra information from attendees during checkout</p>
            </div>
            {!isAdding && (
                <Button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Add Question
                </Button>
            )}
       </div>

       {/* List or Form */}
       {isLoadingQuestions ? (
           <div className="flex items-center justify-center h-32">
               <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
           </div>
       ) : isAdding ? (
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-2">
               <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">{editingId ? 'Edit Question' : 'New Question'}</h4>
               
               <div className="space-y-4">
                   <div className="space-y-1.5">
                       <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Question Label</label>
                       <input 
                            type="text" 
                            value={formData.label}
                            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="e.g. What is your job title?"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                       />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Answer Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'text', icon: AlignLeft, label: 'Text' },
                                    { id: 'dropdown', icon: ChevronDown, label: 'Select' },
                                    { id: 'checkbox', icon: CheckSquare, label: 'Check' },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setFormData(prev => ({ ...prev, type: type.id as any }))}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-1",
                                            formData.type === type.id 
                                                ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-400" 
                                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        )}
                                    >
                                        <type.icon className="w-5 h-5" />
                                        <span className="text-xs font-medium">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Settings</label>
                            <label className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <span className="text-sm text-slate-700 dark:text-slate-300">Required Field</span>
                                <input 
                                    type="checkbox" 
                                    checked={formData.required}
                                    onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                                    className="accent-indigo-600 w-4 h-4"
                                />
                            </label>
                        </div>
                   </div>

                   {/* Options for Dropdown/Checkbox */}
                   {(formData.type === 'dropdown' || formData.type === 'checkbox') && (
                       <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Answer Options</label>
                           <div className="flex gap-2">
                               <input 
                                    type="text" 
                                    value={optionInput}
                                    onChange={(e) => setOptionInput(e.target.value)}
                                    placeholder="Add an option"
                                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                    onKeyDown={(e) => e.key === 'Enter' && addOption()}
                               />
                               <Button size="sm" onClick={addOption} variant="outline" className="border-slate-200 dark:border-slate-700">Add</Button>
                           </div>
                           <div className="space-y-1 max-h-32 overflow-y-auto">
                               {formData.options?.map((opt, i) => (
                                   <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-700 text-sm">
                                       <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                                       <button onClick={() => removeOption(i)} className="text-slate-400 hover:text-red-500">
                                           <Trash2 className="w-3.5 h-3.5" />
                                       </button>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}
               </div>

               <div className="flex justify-end gap-3 mt-6">
                   <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</Button>
                   <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Question</Button>
               </div>
           </div>
       ) : (
           <div className="space-y-3">
               {questions.length === 0 ? (
                   <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                       <List className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                       <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No questions yet</h3>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add custom questions to your checkout form.</p>
                   </div>
               ) : (
                   questions.map((q) => (
                       <div key={q.id} className="group flex items-start gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-sm transition-all">
                            <div className="mt-1 cursor-grab text-slate-300 dark:text-slate-600 hover:text-slate-500">
                                <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{q.label}</span>
                                    {q.required && (
                                        <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">REQUIRED</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded capitalize">
                                        {q.type === 'text' && <AlignLeft className="w-3 h-3" />}
                                        {q.type === 'dropdown' && <ChevronDown className="w-3 h-3" />}
                                        {q.type === 'checkbox' && <CheckSquare className="w-3 h-3" />}
                                        {q.type}
                                    </span>
                                    <span>•</span>
                                    <span>Applies to {q.ticketIds.includes('all') ? 'All Tickets' : `${q.ticketIds.length} Ticket Types`}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEdit(q)}>
                                    <Edit2 className="w-4 h-4 text-slate-500" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-red-600" onClick={() => handleDelete(q.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                       </div>
                   ))
               )}
           </div>
       )}
    </div>
  );
};
