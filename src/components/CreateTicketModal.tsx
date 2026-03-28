import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Info, Users, Ticket, DollarSign, Calendar, Eye, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { TicketType, TicketStatus, TicketTypeType, TicketVisibility, Perk } from './event-dashboard/types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: Partial<TicketType>) => void | Promise<void>;
  /** When provided, puts the modal into edit mode */
  editTicket?: TicketType | null;
}

const EMPTY_FORM: Partial<TicketType> = {
  type: 'Single',
  name: '',
  description: '',
  isFree: false,
  price: 0,
  quantityTotal: 100,
  quantityUnlimited: false,
  minPerOrder: 1,
  maxPerOrder: 10,
  salesStart: '',
  salesEnd: '',
  visibility: 'Public',
  status: 'On Sale',
  allowTransfer: true,
  allowResale: true,
  transferFeesToGuest: false,
  refundPolicy: 'Refundable',
  requireAttendeeInfo: true,
  groupSize: 1,
  perks: [],
};

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, onSave, editTicket }) => {
  const isEditMode = !!editTicket;
  const [activeSection, setActiveSection] = useState<'basic' | 'advanced'>('basic');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [perkInput, setPerkInput] = useState('');
  const [editingPerkId, setEditingPerkId] = useState<string | null>(null);
  const [editingPerkName, setEditingPerkName] = useState('');
  const [showPerkTooltip, setShowPerkTooltip] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<TicketType>>(EMPTY_FORM);

  // Reset / pre-populate form when modal opens or editTicket changes
  useEffect(() => {
    if (!isOpen) return;
    if (editTicket) {
      setFormData({ ...editTicket });
      setShowAdvanced(true); // Show advanced when editing
    } else {
      setFormData({ ...EMPTY_FORM });
      setShowAdvanced(false);
    }
    setPerkInput('');
    setEditingPerkId(null);
    setEditingPerkName('');
  }, [isOpen, editTicket]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof TicketType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPerk = () => {
    if (perkInput.trim()) {
      const newPerk: Perk = {
        id: Date.now().toString(),
        name: perkInput.trim()
      };
      setFormData(prev => ({
        ...prev,
        perks: [...(prev.perks || []), newPerk]
      }));
      setPerkInput('');
    }
  };

  const updatePerk = (id: string, newName: string) => {
    setFormData(prev => ({
      ...prev,
      perks: (prev.perks || []).map(p => p.id === id ? { ...p, name: newName } : p)
    }));
    setEditingPerkId(null);
    setEditingPerkName('');
  };

  const removePerk = (id: string) => {
    setFormData(prev => ({
      ...prev,
      perks: (prev.perks || []).filter(p => p.id !== id)
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name) return;
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-transparent dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isEditMode ? 'Edit Ticket' : 'Create Ticket'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isEditMode ? 'Update your ticket details' : 'Set up your ticket details and pricing'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Ticket Type */}
          <section className="space-y-4">
             <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Ticket Type</label>
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleInputChange('type', 'Single')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    formData.type === 'Single' 
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-500" 
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-transparent"
                  )}
                >
                    <div className={cn("p-3 rounded-full", formData.type === 'Single' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>
                        <Ticket className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <span className={cn("block font-bold text-sm", formData.type === 'Single' ? "text-indigo-900 dark:text-indigo-300" : "text-slate-900 dark:text-slate-100")}>Single Ticket</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">One person per ticket</span>
                    </div>
                </button>

                <button 
                   onClick={() => handleInputChange('type', 'Group')}
                   className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    formData.type === 'Group' 
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-500" 
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-transparent"
                  )}
                >
                    <div className={cn("p-3 rounded-full", formData.type === 'Group' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <span className={cn("block font-bold text-sm", formData.type === 'Group' ? "text-indigo-900 dark:text-indigo-300" : "text-slate-900 dark:text-slate-100")}>Group Ticket</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Multiple people per ticket</span>
                    </div>
                </button>
             </div>
          </section>

          {/* Basic Info */}
          <section className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ticket Name</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Early Bird, VIP" 
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                </div>
                {formData.type === 'Group' && (
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Attendees per Ticket</label>
                        <input 
                            type="number" 
                            min="2"
                            value={formData.groupSize}
                            onChange={(e) => handleInputChange('groupSize', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                        />
                    </div>
                )}
             </div>

             {/* Ticket Description */}
             <div className="space-y-1.5">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ticket Description</label>
                 <textarea 
                     placeholder="Add details about what's included in this ticket..."
                     value={formData.description || ''}
                     onChange={(e) => handleInputChange('description', e.target.value)}
                     className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"
                     rows={3}
                 />
             </div>

             {/* Perks */}
             <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ticket Perks</label>
                 <div className="flex gap-2">
                     <input 
                         type="text" 
                         placeholder="e.g. Free lunch, VIP parking"
                         value={perkInput}
                         onChange={(e) => setPerkInput(e.target.value)}
                         onKeyPress={(e) => e.key === 'Enter' && addPerk()}
                         className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                     />
                     <button 
                         onClick={addPerk}
                         className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                     >
                         <Plus className="w-4 h-4" />
                         Add
                     </button>
                 </div>
                 
                 {/* Perks List */}
                 {(formData.perks || []).length > 0 && (
                     <div className="space-y-2 mt-3">
                         {formData.perks.map((perk) => (
                             <div 
                                 key={perk.id}
                                 className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                             >
                                 {editingPerkId === perk.id ? (
                                     <>
                                         <input 
                                             type="text" 
                                             value={editingPerkName}
                                             onChange={(e) => setEditingPerkName(e.target.value)}
                                             className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                                             onKeyPress={(e) => e.key === 'Enter' && updatePerk(perk.id, editingPerkName)}
                                             autoFocus
                                         />
                                         <button 
                                             onClick={() => updatePerk(perk.id, editingPerkName)}
                                             className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold"
                                         >
                                             Save
                                         </button>
                                     </>
                                 ) : (
                                     <>
                                         <span className="flex-1 text-sm text-slate-900 dark:text-slate-100">{perk.name}</span>
                                         <button 
                                             onClick={() => {
                                                 setEditingPerkId(perk.id);
                                                 setEditingPerkName(perk.name);
                                             }}
                                             className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                                             title="Edit perk"
                                         >
                                             <Edit2 className="w-3.5 h-3.5" />
                                         </button>
                                         <button 
                                             onClick={() => removePerk(perk.id)}
                                             className="p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                             title="Remove perk"
                                         >
                                             <Trash2 className="w-3.5 h-3.5" />
                                         </button>
                                     </>
                                 )}
                             </div>
                         ))}
                     </div>
                 )}

             </div>

             {/* Pricing */}
             <div className="space-y-3">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pricing</label>
                 <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button 
                            onClick={() => handleInputChange('isFree', false)}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all", 
                                !formData.isFree 
                                    ? "bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-slate-100" 
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            Paid
                        </button>
                        <button 
                            onClick={() => handleInputChange('isFree', true)}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all", 
                                formData.isFree 
                                    ? "bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-slate-100" 
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            Free
                        </button>
                    </div>
                    
                    {!formData.isFree && (
                        <div className="relative flex-1 max-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
                            <input 
                                type="number" 
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                                className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                    )}
                 </div>
             </div>

             {/* Quantity & Limits */}
             <div className="space-y-3">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Quantity</label>
                 <div className="flex gap-3 items-end">
                     <div className="flex-1">
                         <input 
                             type="number" 
                             value={formData.quantityTotal}
                             onChange={(e) => handleInputChange('quantityTotal', parseInt(e.target.value))}
                             disabled={formData.quantityUnlimited}
                             className={cn(
                                 "w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800",
                                 formData.quantityUnlimited && "opacity-50 cursor-not-allowed"
                             )}
                         />
                     </div>
                     <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <input 
                             type="checkbox" 
                             checked={formData.quantityUnlimited || false}
                             onChange={(e) => {
                                 handleInputChange('quantityUnlimited', e.target.checked);
                                 if (e.target.checked) handleInputChange('quantityTotal', 999999);
                             }}
                             className="accent-indigo-600 w-4 h-4"
                         />
                         <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Unlimited</span>
                     </label>
                 </div>
             </div>

             {/* Min & Max per Order */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Min per Order</label>
                    <input 
                        type="number" 
                        value={formData.minPerOrder}
                        onChange={(e) => handleInputChange('minPerOrder', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max per Order</label>
                    <input 
                        type="number" 
                        value={formData.maxPerOrder}
                        onChange={(e) => handleInputChange('maxPerOrder', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                    />
                 </div>
             </div>
          </section>

          {/* Schedule */}
          <section className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-sm">
                <Calendar className="w-4 h-4" />
                <h3>Sales Schedule</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Starts</label>
                    <input 
                        type="datetime-local" 
                        value={formData.salesStart}
                        onChange={(e) => handleInputChange('salesStart', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Ends</label>
                    <input 
                        type="datetime-local" 
                        value={formData.salesEnd}
                        onChange={(e) => handleInputChange('salesEnd', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950"
                    />
                 </div>
             </div>
          </section>

          {/* Visibility */}
           <section className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-sm">
                <Eye className="w-4 h-4" />
                <h3>Visibility</h3>
             </div>
             <div className="flex flex-wrap gap-2">
                 {(['Public', 'Hidden', 'Invite Only'] as const).map((vis) => (
                     <button
                        key={vis}
                        onClick={() => handleInputChange('visibility', vis)}
                        className={cn(
                            "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                            formData.visibility === vis 
                                ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400" 
                                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                     >
                        {vis}
                     </button>
                 ))}
             </div>
           </section>

           {/* Ticket Status */}
           <section className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-sm">
                <Ticket className="w-4 h-4" />
                <h3>Status</h3>
             </div>
             <div className="flex flex-wrap gap-2">
                 {(['On Sale', 'Draft', 'Hidden'] as const).map((st) => (
                     <button
                        key={st}
                        onClick={() => handleInputChange('status', st)}
                        className={cn(
                            "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                            formData.status === st 
                                ? st === 'On Sale'
                                  ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-600 text-green-700 dark:text-green-400"
                                  : "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400"
                                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                     >
                        {st}
                     </button>
                 ))}
             </div>
           </section>

           {/* Advanced Options Toggle */}
           <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group"
             >
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Advanced Options</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
             </button>
             
             {showAdvanced && (
                 <div className="pt-4 space-y-6 animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* Access Rules */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access & Transfers</h4>
                        <div className="space-y-2">
                            <label className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Allow Ticket Transfers</span>
                                <input 
                                    type="checkbox" 
                                    checked={formData.allowTransfer}
                                    onChange={(e) => handleInputChange('allowTransfer', e.target.checked)}
                                    className="accent-indigo-600 w-4 h-4"
                                />
                            </label>
                            <label className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Allow Resale</span>
                                <input 
                                    type="checkbox" 
                                    checked={formData.allowResale}
                                    onChange={(e) => handleInputChange('allowResale', e.target.checked)}
                                    className="accent-indigo-600 w-4 h-4"
                                />
                            </label>
                            <label className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg group relative">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Transfer Platform Fees to Guest</span>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowPerkTooltip(!showPerkTooltip)}
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            <Info className="w-4 h-4" />
                                        </button>
                                        {showPerkTooltip && (
                                            <div className="absolute bottom-full left-0 mb-2 p-3 bg-slate-900 dark:bg-slate-950 text-white dark:text-slate-100 text-xs rounded-lg shadow-lg z-10 whitespace-normal w-52">
                                                <p>When enabled, the platform processing fees will be added to the ticket price and charged to customers during checkout instead of being deducted from your revenue.</p>
                                                <div className="absolute top-full left-3 w-2 h-2 bg-slate-900 dark:bg-slate-950 transform rotate-45"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={formData.transferFeesToGuest || false}
                                    onChange={(e) => handleInputChange('transferFeesToGuest', e.target.checked)}
                                    className="accent-indigo-600 w-4 h-4"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Attendee Info */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendee Information</h4>
                        <label className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <div className="text-sm">
                                <span className="block font-medium text-slate-700 dark:text-slate-300">Require Attendee Details</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Collect name and email for each ticket holder</span>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={formData.requireAttendeeInfo}
                                onChange={(e) => handleInputChange('requireAttendeeInfo', e.target.checked)}
                                className="accent-indigo-600 w-4 h-4"
                            />
                        </label>
                    </div>

                    {/* Refund Policy */}
                     <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Refund Policy</h4>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input 
                                    type="radio" 
                                    name="refund"
                                    checked={formData.refundPolicy === 'Refundable'}
                                    onChange={() => handleInputChange('refundPolicy', 'Refundable')}
                                    className="accent-indigo-600"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Refundable</span>
                            </label>
                             <label className="flex items-center gap-2">
                                <input 
                                    type="radio" 
                                    name="refund"
                                    checked={formData.refundPolicy === 'Non-refundable'}
                                    onChange={() => handleInputChange('refundPolicy', 'Non-refundable')}
                                    className="accent-indigo-600"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Non-refundable</span>
                            </label>
                        </div>
                    </div>
                 </div>
             )}
           </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
           <Button variant="ghost" onClick={onClose} className="text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200" disabled={isSaving}>Cancel</Button>
           <Button onClick={handleSave} className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700" disabled={isSaving}>
             {isSaving ? (
               <><Loader2 className="w-4 h-4 animate-spin mr-2" />{isEditMode ? 'Saving...' : 'Creating...'}</>
             ) : (
               isEditMode ? 'Save Changes' : 'Create Ticket'
             )}
           </Button>
        </div>
      </div>
    </div>
  );
};
