import React, { useEffect, useState, useCallback } from 'react';
import { TopBar } from "../components/dashboard/TopBar";
import { CreateTicketModal } from "../components/CreateTicketModal";
import { TicketType, Attendee, TicketStatus, Page } from "../components/event-dashboard/types";
import { Button } from "../components/ui/button";
import { TicketValidationTab } from "../components/event-dashboard/TicketValidationTab";
import { TicketQuestionsTab } from "../components/event-dashboard/TicketQuestionsTab";
import { TicketSettingsTab } from "../components/event-dashboard/TicketSettingsTab";
import { AttendeeDetailModal } from "../components/event-dashboard/AttendeeDetailModal";
import { Plus, Users, QrCode, MessageSquare, Settings, Search, Filter, MoreVertical, AlertCircle, Copy, Trash2, Edit, Ticket, ExternalLink, Link as LinkIcon, BarChart3, CreditCard, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from "../components/ui/utils";
import { eventsService, ticketsService } from "../services";
import { getCurrentEventId } from "../lib/event-storage";
import { toast } from 'sonner';
import { useTickets } from "../hooks";

interface TicketManagementProps {
  onNavigate?: (page: Page) => void;
}

export const TicketManagement: React.FC<TicketManagementProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'types' | 'attendees' | 'validation' | 'questions' | 'settings'>('types');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const eventId = getCurrentEventId();
  const [eventSlug, setEventSlug] = useState<string>('');
  const [eventName, setEventName] = useState<string>('');

  // Fetch event info for slug and name
  useEffect(() => {
    if (!eventId) return;
    eventsService.getEvent(eventId).then(ev => {
      if (ev) {
        setEventSlug(ev.slug || ev.id);
        setEventName(ev.name || 'Event');
      }
    }).catch(() => {});
  }, [eventId]);

  const {
    tickets,
    isLoading,
    attendees,
    isLoadingAttendees,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    duplicateTicket,
    fetchAttendees,
    checkInAttendee,
    undoCheckIn,
    exportAttendees,
  } = useTickets({ eventId });

  // Fetch attendees when switching to attendees or validation tab
  useEffect(() => {
    if (activeTab === 'attendees' || activeTab === 'validation') {
      fetchAttendees();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateTicket = async (newTicket: Partial<TicketType>) => {
    const ticket = await createTicket(newTicket);
    if (ticket) {
      eventsService.updateModuleCount(
        eventId,
        'Tickets',
        tickets.length + 1,
        `Created ticket "${ticket.name || 'New ticket'}"`,
        'ticket'
      );
      toast.success(`Ticket "${ticket.name}" created`);
    }
  };

  const handleEditTicket = async (updatedData: Partial<TicketType>) => {
    if (!editingTicket) return;
    const updated = await updateTicket(editingTicket.id, updatedData);
    if (updated) {
      toast.success(`Ticket "${updated.name}" updated`);
    }
    setEditingTicket(null);
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    const success = await deleteTicket(id);
    if (success) {
      eventsService.updateModuleCount(
        eventId,
        'Tickets',
        tickets.length - 1,
        'Ticket deleted',
        'ticket'
      );
      toast.success('Ticket deleted');
    }
  };

  const handleDuplicateTicket = async (id: string) => {
    const dup = await duplicateTicket(id);
    if (dup) {
      toast.success(`Ticket duplicated as "${dup.name}"`);
    }
  };

  const handleCheckIn = async (attendeeId: string, status: boolean) => {
    if (status) {
      const ok = await checkInAttendee(attendeeId);
      if (ok) toast.success('Attendee checked in');
    } else {
      const ok = await undoCheckIn(attendeeId);
      if (ok) toast.success('Check-in undone');
    }
  };

  const handleExport = async () => {
    await exportAttendees('csv');
    toast.success('Attendees exported');
  };

  const openEditModal = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingTicket(null);
  };

    const ticketPublicUrl = eventSlug ? `${window.location.origin}/e/${eventSlug}/tickets` : '';

    const copyLink = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        } catch (err) {
            console.error('Failed to copy link', err);
            toast.error('Failed to copy link');
        }
    };

    const stats = {
        totalTypes: tickets.length,
        onSale: tickets.filter(t => t.status === 'On Sale').length,
        sold: tickets.reduce((sum, t) => sum + t.quantitySold, 0),
        revenue: tickets.reduce((sum, t) => sum + (t.isFree ? 0 : (t.price || 0) * t.quantitySold), 0),
    };

    const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) => (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                    'p-2 rounded-lg',
                    color === 'indigo' && 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
                    color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
                    color === 'blue' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                    color === 'amber' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
       <TopBar onNavigate={onNavigate} />
       
       <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                        <button onClick={() => onNavigate?.('event-dashboard')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ticket Management</h1>
                </div>
                <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200">
                                            <LinkIcon className="w-4 h-4 text-indigo-600" />
                                            <span className="truncate max-w-[220px]" title={ticketPublicUrl}>{ticketPublicUrl}</span>
                                            <button onClick={() => copyLink(ticketPublicUrl)} className="p-1 hover:text-indigo-600" title="Copy link">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <a href={ticketPublicUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-indigo-600" title="Open">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm shadow-indigo-200 dark:shadow-none"
                    >
                        <Plus className="w-4 h-4" />
                        Create Ticket
                    </Button>
                </div>
            </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <StatCard label="Ticket types" value={stats.totalTypes} icon={Ticket} color="indigo" />
                            <StatCard label="On sale" value={stats.onSale} icon={Users} color="emerald" />
                            <StatCard label="Sold" value={stats.sold} icon={QrCode} color="blue" />
                            <StatCard label="Revenue" value={`₦${stats.revenue.toLocaleString()}`} icon={CreditCard} color="amber" />
                        </div>

                        {/* Tabs & Content */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col transition-colors">
                {/* Tabs Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 px-2 flex overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'types', label: 'Ticket Types', icon: Ticket },
                        { id: 'attendees', label: 'Attendees', icon: Users },
                        { id: 'validation', label: 'Validation', icon: QrCode },
                        { id: 'questions', label: 'Questions', icon: MessageSquare },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                                activeTab === tab.id 
                                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400" 
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                            )}
                        >
                            {/* @ts-ignore */}
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 flex-1">
                    
                    {/* TICKET TYPES TAB */}
                    {activeTab === 'types' && (
                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <Ticket className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No tickets created yet</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">Create your first ticket type to start selling tickets for your event.</p>
                                    <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4 bg-indigo-600 text-white">Create Ticket</Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[40px]"></th>
                                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket Name</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sold / Total</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {tickets.map((ticket) => (
                                                <tr key={ticket.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="py-4 px-4 text-slate-400 dark:text-slate-600 cursor-move">⋮⋮</td>
                                                    <td className="py-4 px-4">
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">{ticket.name}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {ticket.salesStart ? `Sales start: ${new Date(ticket.salesStart).toLocaleDateString()}` : 'No schedule'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                                            {ticket.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">
                                                        {ticket.isFree ? 'Free' : `₦${ticket.price?.toLocaleString()}`}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-indigo-500 rounded-full" 
                                                                    style={{ width: `${(ticket.quantitySold / ticket.quantityTotal) * 100}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-slate-600 dark:text-slate-400">{ticket.quantitySold}/{ticket.quantityTotal}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={cn(
                                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                            ticket.status === 'On Sale' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                                                            ticket.status === 'Draft' ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" :
                                                            ticket.status === 'Sold Out' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                                                            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                                        )}>
                                                            {ticket.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openEditModal(ticket)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Edit">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDuplicateTicket(ticket.id)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Duplicate">
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" 
                                                                title="Delete"
                                                                onClick={() => handleDeleteTicket(ticket.id)}
                                                            >
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
                    )}

                    {/* ATTENDEES TAB */}
                    {activeTab === 'attendees' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Search attendees..." 
                                        onChange={(e) => fetchAttendees({ search: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="gap-2 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">
                                        <Filter className="w-4 h-4" />
                                        Filter
                                    </Button>
                                    <Button variant="outline" onClick={handleExport} className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">Export CSV</Button>
                                </div>
                            </div>
                            
                            {isLoadingAttendees ? (
                                <div className="flex items-center justify-center h-48">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                </div>
                            ) : attendees.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-center">
                                    <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No attendees yet</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Attendees will appear here once tickets are purchased.</p>
                                </div>
                            ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Name</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Email</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ticket Type</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Check-in</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {attendees.map(attendee => (
                                        <tr 
                                            key={attendee.id} 
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer"
                                            onClick={() => setSelectedAttendee(attendee)}
                                        >
                                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{attendee.name}</td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{attendee.email}</td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    {attendee.ticketTypeName || '—'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                                    attendee.status === 'Confirmed' && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                                    attendee.status === 'Checked In' && "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                                    attendee.status === 'Cancelled' && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                                    attendee.status === 'Pending' && "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                                )}>
                                                    {attendee.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {attendee.checkedIn ? (
                                                    <span className="text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                        Checked In
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-500 text-xs">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            )}
                        </div>
                    )}

                    {/* NEW TABS */}
                    {activeTab === 'validation' && (
                        <TicketValidationTab attendees={attendees} onCheckIn={handleCheckIn} eventId={eventId} />
                    )}
                    
                    {activeTab === 'questions' && (
                        <TicketQuestionsTab tickets={tickets} eventId={eventId} />
                    )}
                    
                    {activeTab === 'settings' && (
                        <TicketSettingsTab eventId={eventId} />
                    )}

                </div>
            </div>
       </main>

       {/* Create / Edit Ticket Modal */}
       <CreateTicketModal 
          isOpen={isCreateModalOpen} 
          onClose={closeModal}
          onSave={editingTicket ? handleEditTicket : handleCreateTicket}
          editTicket={editingTicket}
       />

       {/* Attendee Detail Modal */}
       <AttendeeDetailModal
          attendee={selectedAttendee}
          onClose={() => setSelectedAttendee(null)}
          tickets={tickets}
       />
    </div>
  );
};

export default TicketManagement;
