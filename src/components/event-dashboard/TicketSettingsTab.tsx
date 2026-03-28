import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Save, Info, Loader2 } from 'lucide-react';
import { Switch } from '../ui/switch';
import { ticketsService } from '../../services';
import { toast } from 'sonner';

interface TicketSettingsTabProps {
  eventId: string;
}

export const TicketSettingsTab: React.FC<TicketSettingsTabProps> = ({ eventId }) => {
  const [settings, setSettings] = useState({
    enableTransfers: true,
    enableResale: false,
    resaleCap: 10,
    refundPolicy: 'flexible',
    supportEmail: '',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from API
  useEffect(() => {
    if (!eventId) return;
    setIsLoading(true);
    ticketsService.getSettings(eventId)
      .then((data) => setSettings({
        enableTransfers: data.enableTransfers ?? true,
        enableResale: data.enableResale ?? false,
        resaleCap: data.resaleCap ?? 10,
        refundPolicy: data.refundPolicy ?? 'flexible',
        supportEmail: data.supportEmail ?? '',
      }))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setIsLoading(false));
  }, [eventId]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await ticketsService.updateSettings(eventId, settings);
      setHasChanges(false);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Transfers & Resale */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Transfers & Resale</h3>
          
          <div className="space-y-6">
              <div className="flex items-center justify-between">
                  <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">Allow Ticket Transfers</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Attendees can transfer their ticket to another person via email.</p>
                  </div>
                  <Switch 
                    checked={settings.enableTransfers} 
                    onCheckedChange={(checked) => updateSetting('enableTransfers', checked)} 
                  />
              </div>

              <div className="flex items-center justify-between">
                  <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">Allow Ticket Resale</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Attendees can resell their tickets on the official marketplace.</p>
                  </div>
                  <Switch 
                    checked={settings.enableResale} 
                    onCheckedChange={(checked) => updateSetting('enableResale', checked)} 
                  />
              </div>

              {settings.enableResale && (
                  <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Resale Price Cap (%)</label>
                      <div className="flex items-center gap-2 max-w-[200px]">
                          <input 
                            type="number" 
                            value={settings.resaleCap}
                            onChange={(e) => updateSetting('resaleCap', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                          />
                          <span className="text-slate-500">%</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Limit how much above face value a ticket can be sold for.</p>
                  </div>
              )}
          </div>
      </section>

      {/* Refunds & Support */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Policies</h3>
          
          <div className="space-y-6">
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Default Refund Policy</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['flexible', 'moderate', 'strict'].map((policy) => (
                          <div 
                            key={policy}
                            onClick={() => updateSetting('refundPolicy', policy)}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                settings.refundPolicy === policy 
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500 ring-1 ring-indigo-600 dark:ring-indigo-500' 
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                              <div className="capitalize font-semibold text-slate-900 dark:text-slate-100 text-sm">{policy}</div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {policy === 'flexible' && "Full refund until 1 day before event."}
                                  {policy === 'moderate' && "Full refund until 7 days before event."}
                                  {policy === 'strict' && "No refunds allowed."}
                              </p>
                          </div>
                      ))}
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Support Email</label>
                  <input 
                    type="email" 
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting('supportEmail', e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                  <p className="text-xs text-slate-500 mt-1">This email will be shown on ticket receipts for inquiries.</p>
              </div>
          </div>
      </section>

      {/* Save Action */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          {hasChanges && <span className="text-sm text-amber-600 dark:text-amber-500 animate-pulse">You have unsaved changes</span>}
          <Button 
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
      </div>
    </div>
  );
};
