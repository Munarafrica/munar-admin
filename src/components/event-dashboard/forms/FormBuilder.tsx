import React, { useState } from 'react';
import { Form, FormField, FormFieldType, FormType } from '../types';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { 
  Type, AlignLeft, Mail, Phone, Hash, Calendar, 
  List, CheckSquare, CircleDot, Star, Upload, 
  Trash2, GripVertical, Settings, Eye, Save, ArrowLeft,
  Plus, Menu, X, CreditCard, Loader2
} from 'lucide-react';
import { cn } from '../../ui/utils';
import { toast } from 'sonner';

interface FormBuilderProps {
  initialForm?: Partial<Form>;
  onSave: (form: Form) => void | Promise<void>;
  onCancel: () => void;
}

const FIELD_TYPES: { type: FormFieldType; label: string; icon: any }[] = [
  { type: 'text', label: 'Short Text', icon: Type },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'radio', label: 'Radio Group', icon: CircleDot },
  { type: 'rating', label: 'Rating', icon: Star },
  { type: 'file', label: 'File Upload', icon: Upload },
];

export const FormBuilder: React.FC<FormBuilderProps> = ({ initialForm, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'build' | 'settings' | 'preview'>('build');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [isMobilePropertiesOpen, setIsMobilePropertiesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState<Partial<Form>>({
    title: 'Untitled Form',
    description: '',
    type: 'registration',
    status: 'draft',
    fields: [],
    settings: {
      isPaid: false,
      allowAnonymous: false,
      oneResponsePerUser: true,
      confirmationMessage: 'Thank you for your submission!'
    },
    ...initialForm
  });

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: `f${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: '',
      options: ['Option 1', 'Option 2', 'Option 3'] // Default options for choice fields
    };
    
    setForm(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }));
    setSelectedFieldId(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields?.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const deleteField = (id: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields?.filter(f => f.id !== id)
    }));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (!form.fields) return;
    const newFields = [...form.fields];
    if (direction === 'up' && index > 0) {
      [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
    } else if (direction === 'down' && index < newFields.length - 1) {
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    }
    setForm(prev => ({ ...prev, fields: newFields }));
  };

  const handleSave = async () => {
    if (!form.title || form.title.trim() === '') {
      toast.error("Please enter a form title");
      setActiveTab('build');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(form as Form);
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const selectedField = form.fields?.find(f => f.id === selectedFieldId);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Builder Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <Button variant="ghost" size="sm" onClick={onCancel} className="shrink-0">
            <ArrowLeft className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Back</span>
          </Button>
          <div className="min-w-0 flex-1">
            <input 
              type="text" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})}
              className="font-bold text-base md:text-lg bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 w-full"
              placeholder="Form Title"
            />
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{form.type} Form</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded capitalize",
                    form.status === 'published' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}>
                    {form.status}
                </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-4">
              <button 
                onClick={() => setActiveTab('build')}
                className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", activeTab === 'build' ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:text-slate-400")}
              >
                Builder
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", activeTab === 'settings' ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:text-slate-400")}
              >
                Settings
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", activeTab === 'preview' ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:text-slate-400")}
              >
                Preview
              </button>
           </div>
           
           {/* Mobile Tab Selector */}
           <select 
             value={activeTab}
             onChange={(e) => setActiveTab(e.target.value as 'build' | 'settings' | 'preview')}
             className="md:hidden px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 font-medium mr-2"
           >
             <option value="build">Builder</option>
             <option value="settings">Settings</option>
             <option value="preview">Preview</option>
           </select>
           
           <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" size="sm" disabled={isSaving}>
             {isSaving ? (
               <><Loader2 className="w-4 h-4 animate-spin" /><span className="hidden md:inline">Saving...</span></>
             ) : (
               <><Save className="w-4 h-4" /><span className="hidden md:inline">Save & Exit</span></>
             )}
           </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* BUILD TAB */}
        {activeTab === 'build' && (
          <>
            {/* Left Sidebar: Tools - Hidden on mobile */}
            <div className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col overflow-y-auto">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Form Elements</h3>
              </div>
              <div className="p-4 grid grid-cols-1 gap-2">
                {FIELD_TYPES.map(ft => (
                  <button
                    key={ft.type}
                    onClick={() => {
                      addField(ft.type);
                      setIsMobileToolsOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all text-left group"
                  >
                    <ft.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{ft.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Add Field Button */}
            <button 
              onClick={() => setIsMobileToolsOpen(true)}
              className="lg:hidden fixed bottom-6 right-6 z-20 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>

            {/* Mobile Tools Modal */}
            {isMobileToolsOpen && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end" onClick={() => setIsMobileToolsOpen(false)}>
                <div className="bg-white dark:bg-slate-900 w-full rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Add Form Element</h3>
                    <button onClick={() => setIsMobileToolsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-2 overflow-y-auto">
                    {FIELD_TYPES.map(ft => (
                      <button
                        key={ft.type}
                        onClick={() => {
                          addField(ft.type);
                          setIsMobileToolsOpen(false);
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all text-center"
                      >
                        <ft.icon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{ft.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Center: Canvas */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950/50">
              <div className="max-w-2xl mx-auto space-y-4">
                 <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center">
                    <input 
                      className="text-2xl font-bold text-center bg-transparent border-none focus:outline-none w-full mb-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-300" 
                      value={form.title} 
                      onChange={e => setForm({...form, title: e.target.value})}
                      placeholder="Form Title"
                    />
                    <textarea 
                      className="text-sm text-center bg-transparent border-none focus:outline-none w-full text-slate-500 dark:text-slate-400 resize-none placeholder:text-slate-300"
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                      placeholder="Add a description for your form..."
                      rows={2}
                    />
                 </div>

                 {form.fields?.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center text-slate-400">
                        <Plus className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>Click elements on the left to add them to your form</p>
                    </div>
                 ) : (
                    form.fields?.map((field, index) => (
                      <div 
                        key={field.id}
                        onClick={() => setSelectedFieldId(field.id)}
                        className={cn(
                          "bg-white dark:bg-slate-900 p-6 rounded-xl border transition-all cursor-pointer relative group",
                          selectedFieldId === field.id 
                            ? "border-indigo-500 ring-1 ring-indigo-500 shadow-md z-10" 
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                           <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                           </label>
                           
                           {selectedFieldId === field.id && (
                              <div className="flex items-center gap-1">
                                <button onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }} disabled={index === 0} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ArrowLeft className="w-4 h-4 rotate-90" /></button>
                                <button onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }} disabled={index === (form.fields?.length || 0) - 1} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ArrowLeft className="w-4 h-4 -rotate-90" /></button>
                                <button onClick={(e) => { e.stopPropagation(); deleteField(field.id); }} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           )}
                        </div>
                        
                        {/* Field Preview */}
                        <div className="pointer-events-none opacity-70">
                           {(field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'phone' || field.type === 'date') && (
                              <div className="h-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 w-full"></div>
                           )}
                           {field.type === 'textarea' && (
                              <div className="h-24 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 w-full"></div>
                           )}
                           {(field.type === 'select' || field.type === 'multiselect') && (
                              <div className="h-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 w-full flex items-center justify-between px-3">
                                 <span className="text-sm text-slate-400">Select option...</span>
                                 <ArrowLeft className="w-3 h-3 -rotate-90 text-slate-400" />
                              </div>
                           )}
                           {(field.type === 'checkbox' || field.type === 'radio') && (
                              <div className="space-y-2">
                                 {field.options?.slice(0, 3).map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                       <div className={cn("w-4 h-4 border border-slate-300 dark:border-slate-600", field.type === 'radio' ? "rounded-full" : "rounded")}></div>
                                       <span className="text-sm text-slate-500 dark:text-slate-400">{opt}</span>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                      </div>
                    ))
                 )}
              </div>
            </div>

            {/* Right Sidebar: Properties - Hidden on mobile */}
            <div className="hidden lg:flex w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-col overflow-y-auto">
               <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                     {selectedField ? 'Edit Field' : 'Field Properties'}
                  </h3>
               </div>
               
               {selectedField ? (
                  <div className="p-4 space-y-6">
                     <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Label</label>
                        <input 
                           type="text" 
                           value={selectedField.label}
                           onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                           className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800"
                        />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Placeholder</label>
                        <input 
                           type="text" 
                           value={selectedField.placeholder || ''}
                           onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                           className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800"
                        />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Help Text</label>
                        <input 
                           type="text" 
                           value={selectedField.helpText || ''}
                           onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                           className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800"
                        />
                     </div>

                     <div className="flex items-center justify-between pt-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Required Field</label>
                        <Switch 
                           checked={selectedField.required} 
                           onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })} 
                        />
                     </div>

                     {/* Options for Choice Fields */}
                     {['select', 'checkbox', 'radio', 'multiselect'].includes(selectedField.type) && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                           <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Options</label>
                           <div className="space-y-2">
                              {selectedField.options?.map((opt, idx) => (
                                 <div key={idx} className="flex gap-2">
                                    <input 
                                       type="text" 
                                       value={opt}
                                       onChange={(e) => {
                                          const newOptions = [...(selectedField.options || [])];
                                          newOptions[idx] = e.target.value;
                                          updateField(selectedField.id, { options: newOptions });
                                       }}
                                       className="flex-1 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-sm bg-slate-50 dark:bg-slate-800"
                                    />
                                    <button 
                                       onClick={() => {
                                          const newOptions = selectedField.options?.filter((_, i) => i !== idx);
                                          updateField(selectedField.id, { options: newOptions });
                                       }}
                                       className="text-slate-400 hover:text-red-500"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              ))}
                              <Button 
                                 size="sm" 
                                 variant="outline" 
                                 className="w-full mt-2 text-xs"
                                 onClick={() => {
                                    updateField(selectedField.id, { options: [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`] });
                                 }}
                              >
                                 Add Option
                              </Button>
                           </div>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                     <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                     <p>Select a field on the canvas to edit its properties.</p>
                  </div>
               )}
            </div>
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
           <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950/50">
              <div className="max-w-2xl mx-auto space-y-6">
                 
                 {/* Form Info */}
                 <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Form Information</h3>
                    
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Form Title</label>
                           <input 
                              type="text"
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                              value={form.title || ''}
                              onChange={(e) => setForm({...form, title: e.target.value})}
                              placeholder="Enter form title"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                           <textarea 
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                              rows={3}
                              value={form.description || ''}
                              onChange={(e) => setForm({...form, description: e.target.value})}
                              placeholder="Add a description..."
                           />
                        </div>
                    </div>
                 </div>

                 {/* General Settings */}
                 <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Access & Submission</h3>
                    
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="font-medium text-slate-900 dark:text-slate-100">Limit Responses</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Allow only one response per user (requires login)</p>
                           </div>
                           <Switch 
                              checked={form.settings?.oneResponsePerUser} 
                              onCheckedChange={(checked) => setForm({...form, settings: {...form.settings!, oneResponsePerUser: checked}})} 
                           />
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800" />

                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="font-medium text-slate-900 dark:text-slate-100">Anonymous Submissions</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Do not collect user identity</p>
                           </div>
                           <Switch 
                              checked={form.settings?.allowAnonymous} 
                              onCheckedChange={(checked) => setForm({...form, settings: {...form.settings!, allowAnonymous: checked}})} 
                           />
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800" />

                        <div className="space-y-3">
                           <div className="flex items-center justify-between">
                              <div>
                                 <h4 className="font-medium text-slate-900 dark:text-slate-100">Auto-Close Date</h4>
                                 <p className="text-sm text-slate-500 dark:text-slate-400">Automatically close the form on a specific date</p>
                              </div>
                           </div>
                           <input 
                              type="datetime-local"
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                              value={form.settings?.closeDate || ''}
                              onChange={(e) => setForm({...form, settings: {...form.settings!, closeDate: e.target.value}})}
                           />
                           {form.settings?.closeDate && (
                              <button 
                                 onClick={() => setForm({...form, settings: {...form.settings!, closeDate: undefined}})}
                                 className="text-xs text-red-500 hover:text-red-600 font-medium"
                              >
                                 Remove close date
                              </button>
                           )}
                        </div>
                    </div>
                 </div>

                 {/* Payment Settings (Only for Registration) */}
                 {form.type === 'registration' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                       <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Payment Configuration</h3>
                       
                       <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div>
                                 <h4 className="font-medium text-slate-900 dark:text-slate-100">Paid Registration</h4>
                                 <p className="text-sm text-slate-500 dark:text-slate-400">Require payment to complete registration</p>
                              </div>
                              <Switch 
                                 checked={form.settings?.isPaid} 
                                 onCheckedChange={(checked) => setForm({...form, settings: {...form.settings!, isPaid: checked}})} 
                              />
                           </div>

                           {form.settings?.isPaid && (
                              <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-1 space-y-3">
                                 <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Registration Price</label>
                                    <div className="flex gap-2 mt-1">
                                       <select 
                                          className="w-24 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                          value={form.settings?.currency || 'NGN'}
                                          onChange={(e) => setForm({...form, settings: {...form.settings!, currency: e.target.value}})}
                                       >
                                          <option value="NGN">NGN</option>
                                          <option value="USD">USD</option>
                                          <option value="EUR">EUR</option>
                                          <option value="GBP">GBP</option>
                                       </select>
                                       <input 
                                          type="number" 
                                          className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                          placeholder="0.00"
                                          min="0"
                                          step="0.01"
                                          value={form.settings?.price || ''}
                                          onChange={(e) => setForm({...form, settings: {...form.settings!, price: parseFloat(e.target.value)}})}
                                       />
                                    </div>
                                 </div>
                              </div>
                           )}
                       </div>
                    </div>
                 )}

                 {/* Confirmation Message */}
                 <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Confirmation Page</h3>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Success Message</label>
                        <textarea 
                           className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:border-indigo-500"
                           rows={3}
                           value={form.settings?.confirmationMessage || ''}
                           onChange={(e) => setForm({...form, settings: {...form.settings!, confirmationMessage: e.target.value}})}
                           placeholder="Thank you for your submission!"
                        />
                        <p className="text-xs text-slate-500">Displayed to the user after successful submission.</p>
                    </div>
                 </div>

                 {/* Form Status Info */}
                 <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 text-sm text-slate-500 dark:text-slate-400 space-y-1">
                    <p><span className="font-medium text-slate-700 dark:text-slate-300">Status:</span> <span className="capitalize">{form.status}</span></p>
                    <p><span className="font-medium text-slate-700 dark:text-slate-300">Type:</span> <span className="capitalize">{form.type}</span></p>
                    <p><span className="font-medium text-slate-700 dark:text-slate-300">Fields:</span> {form.fields?.length || 0}</p>
                 </div>
              </div>
           </div>
        )}

        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
           <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-8">
                 <div className="h-2 bg-indigo-600 w-full"></div>
                 <div className="p-8 space-y-6">
                    <div className="text-center mb-6">
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{form.title}</h2>
                       <p className="text-slate-500 dark:text-slate-400 text-sm">{form.description}</p>
                    </div>

                    <div className="space-y-4">
                       {form.fields?.map(field => (
                          <div key={field.id} className="space-y-1.5">
                             <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                             </label>
                             
                             {field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'phone' ? (
                                <input 
                                   type={field.type === 'phone' ? 'tel' : field.type} 
                                   placeholder={field.placeholder}
                                   className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                                   disabled
                                />
                             ) : field.type === 'textarea' ? (
                                <textarea 
                                   placeholder={field.placeholder}
                                   className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 resize-none"
                                   rows={3}
                                   disabled
                                />
                             ) : field.type === 'select' ? (
                                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800" disabled>
                                   <option>Select an option...</option>
                                   {field.options?.map((opt, i) => <option key={i}>{opt}</option>)}
                                </select>
                             ) : field.type === 'radio' ? (
                                <div className="space-y-2">
                                   {field.options?.map((opt, i) => (
                                      <label key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                         <input type="radio" name={field.id} disabled />
                                         {opt}
                                      </label>
                                   ))}
                                </div>
                             ) : (
                                <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center text-xs text-slate-500">
                                   {field.type} input placeholder
                                </div>
                             )}
                             
                             {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
                          </div>
                       ))}
                    </div>

                    <div className="pt-4">
                       <Button className="w-full bg-indigo-600 text-white" disabled>Submit</Button>
                    </div>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};