import React, { useState, useEffect } from 'react';
import { TopBar } from "../components/dashboard/TopBar";
import { Page, Form, FormType } from "../components/event-dashboard/types";
import { Button } from "../components/ui/button";
import { Plus, FileText, BarChart2, MoreVertical, Edit2, Trash2, Eye, Copy, ChevronLeft, Menu, X, ExternalLink, Link as LinkIcon, Loader2, Send, XCircle, Globe } from 'lucide-react';
import { cn } from "../components/ui/utils";
import { FormBuilder } from "../components/event-dashboard/forms/FormBuilder";
import { FormResponseViewer } from "../components/event-dashboard/forms/FormResponseViewer";
import { eventsService, formsService } from "../services";
import { getCurrentEventId } from "../lib/event-storage";
import { useForms } from "../hooks/useForms";
import { useEvent } from "../contexts";
import { toast } from 'sonner';

interface FormManagementProps {
  onNavigate?: (page: Page) => void;
}

export const FormManagement: React.FC<FormManagementProps> = ({ onNavigate }) => {
  const [view, setView] = useState<'list' | 'builder' | 'responses'>('list');
  const eventId = getCurrentEventId();
  const { currentEvent } = useEvent();
  const eventSlug = currentEvent?.slug || eventId;

  const {
    forms,
    isLoading,
    fetchForms,
    createForm,
    updateForm,
    deleteForm: deleteFormHook,
    duplicateForm: duplicateFormHook,
    publishForm: publishFormHook,
    closeForm: closeFormHook,
  } = useForms({ eventId, autoFetch: true });

  const [currentForm, setCurrentForm] = useState<Form | undefined>(undefined);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [newFormName, setNewFormName] = useState('');

  const eventName = currentEvent?.name || 'My Event';
  const formsBaseUrl = `${window.location.origin}/e/${eventSlug}/forms`;

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleCreateClick = () => {
    setNewFormName('');
    setIsTypeModalOpen(true);
  };

  const startNewForm = (type: FormType) => {
    const formTitle = newFormName.trim() || (type === 'registration' ? 'New Registration' : type === 'survey' ? 'New Survey' : 'Untitled Form');
    setCurrentForm({
      id: `f${Date.now()}`,
      title: formTitle,
      description: '',
      type,
      status: 'draft',
      responseCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [],
      settings: {
        isPaid: false,
        allowAnonymous: false,
        oneResponsePerUser: true
      }
    });
    setIsTypeModalOpen(false);
    setView('builder');
  };

  const handleEditForm = (form: Form) => {
    setCurrentForm(form);
    setView('builder');
  };

  const handleDeleteForm = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this form? All responses will be lost.")) {
      const success = await deleteFormHook(id);
      if (success) {
        toast.success('Form deleted');
        eventsService.updateModuleCount(
          eventId,
          'Forms and surveys',
          forms.length - 1,
          'Form deleted',
          'file-text'
        );
      }
    }
  };

  const handleDuplicateForm = async (id: string) => {
    const dup = await duplicateFormHook(id);
    if (dup) toast.success(`Duplicated as "${dup.title}"`);
  };

  const handlePublishForm = async (form: Form) => {
    if (form.status === 'published') {
      const updated = await closeFormHook(form.id);
      if (updated) toast.success('Form closed');
    } else {
      if ((form.fields || []).length === 0) {
        toast.error('Add at least one field before publishing');
        return;
      }
      const updated = await publishFormHook(form.id);
      if (updated) toast.success('Form published! It is now accepting responses.');
    }
  };

  const handleViewResponses = (form: Form) => {
    setCurrentForm(form);
    setView('responses');
  };

  const handleSaveForm = async (savedForm: Form) => {
    const isExisting = forms.some(f => f.id === savedForm.id);
    if (isExisting) {
      await updateForm(savedForm.id, savedForm);
      toast.success('Form saved');
    } else {
      const created = await createForm({
        title: savedForm.title,
        description: savedForm.description,
        type: savedForm.type,
        fields: savedForm.fields,
        settings: savedForm.settings,
      });
      if (created) {
        eventsService.updateModuleCount(
          eventId,
          'Forms and surveys',
          forms.length + 1,
          `Created form "${created.title || 'New form'}"`,
          'file-text'
        );
        toast.success('Form created');
      }
    }
    setView('list');
    setCurrentForm(undefined);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      {view === 'list' && <TopBar onNavigate={onNavigate} />}
      
      <main className={cn("flex-1 max-w-[1440px] mx-auto w-full", view === 'list' ? "px-6 py-8" : "p-0")}>
        
        {view === 'list' ? (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                        <button onClick={() => onNavigate?.('event-dashboard')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Forms & Surveys</h1>
                </div>
                <div className="flex flex-col md:items-end gap-2 md:gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200">
                    <LinkIcon className="w-4 h-4 text-indigo-600" />
                    <span className="truncate max-w-[220px]" title={formsBaseUrl}>{formsBaseUrl}</span>
                    <button onClick={() => copyLink(formsBaseUrl)} className="p-1 hover:text-indigo-600" title="Copy link">
                      <Copy className="w-4 h-4" />
                    </button>
                    <a href={formsBaseUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-indigo-600" title="Open">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <Button 
                    onClick={handleCreateClick}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm shadow-indigo-200 dark:shadow-none"
                  >
                    <Plus className="w-4 h-4" />
                    Create Form
                  </Button>
                </div>
            </div>

            {/* Forms List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
                    </div>
                ) : forms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No forms created yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1 mb-4">Create registrations, surveys, or custom forms to collect data.</p>
                        <Button onClick={handleCreateClick} className="bg-indigo-600 text-white">Create Form</Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Form Name</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Responses</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Updated</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {forms.map((form) => (
                                    <tr key={form.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">{form.title}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{form.description || "No description"}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                {form.type === 'registration' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                                {form.type === 'survey' && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                                                {form.type === 'custom' && <div className="w-2 h-2 rounded-full bg-slate-500" />}
                                                <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{form.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                form.status === 'published' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                                                form.status === 'draft' ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" :
                                                "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                            )}>
                                                {form.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                                <BarChart2 className="w-4 h-4" />
                                                {form.responseCount}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(form.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handlePublishForm(form)} className={cn("p-1.5 transition-colors", form.status === 'published' ? "text-green-500 hover:text-amber-600" : "text-slate-400 hover:text-green-600 dark:hover:text-green-400")} title={form.status === 'published' ? 'Close form' : 'Publish form'}>
                                              {form.status === 'published' ? <XCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => handleEditForm(form)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Edit Builder">
                                              <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleViewResponses(form)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="View Responses">
                                              <BarChart2 className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => copyLink(`${formsBaseUrl}/${form.id}`)}
                                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                              title="Copy public link"
                                            >
                                              <LinkIcon className="w-4 h-4" />
                                            </button>
                                            <a
                                              href={`${formsBaseUrl}/${form.id}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                              title="Open public link"
                                            >
                                              <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button onClick={() => handleDuplicateForm(form.id)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Duplicate">
                                              <Copy className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteForm(form.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
          </>
        ) : view === 'builder' ? (
          <FormBuilder 
            initialForm={currentForm} 
            onSave={handleSaveForm}
            onCancel={() => { setView('list'); setCurrentForm(undefined); }}
          />
        ) : (
          <FormResponseViewer 
            form={currentForm} 
            onCancel={() => { setView('list'); setCurrentForm(undefined); }}
          />
        )}

      </main>

      {/* Type Selection Modal */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create New Form</h2>
                    <button onClick={() => setIsTypeModalOpen(false)} className="text-slate-400 hover:text-slate-500"><Trash2 className="w-5 h-5 opacity-0" /><span className="text-xl">×</span></button>
                </div>
                <div className="p-6 space-y-4">
                    {/* Form Name Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Form Name</label>
                        <input
                            type="text"
                            value={newFormName}
                            onChange={(e) => setNewFormName(e.target.value)}
                            placeholder="e.g. Event Registration, Post-Event Survey..."
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            autoFocus
                        />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 pt-2">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Select Type</span>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    </div>
                    
                    <button 
                        onClick={() => startNewForm('registration')}
                        className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left group"
                    >
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">Event Registration</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Collect attendee details, sell tickets, and manage RSVPs.</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => startNewForm('survey')}
                        className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left group"
                    >
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40">
                            <BarChart2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">Survey or Feedback</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Collect feedback, run polls, or gather post-event insights.</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => startNewForm('custom')}
                        className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
                    >
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">Custom Form</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start from scratch for any other data collection needs.</p>
                        </div>
                    </button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 flex justify-end">
                    <Button variant="ghost" onClick={() => setIsTypeModalOpen(false)}>Cancel</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};