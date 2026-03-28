import React, { useRef, useState } from 'react';
import { TopBar } from '../components/dashboard/TopBar';
import { Page } from '../App';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner@2.0.3';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { 
  ArrowLeft, Upload, Image as ImageIcon, Video, Star, Eye, 
  MoreVertical, Trash2, EyeOff, Filter, Search, Plus, 
  CheckCircle, PlayCircle, HardDrive, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { eventsService } from '../services';
import { getCurrentEventId } from '../lib/event-storage';

interface GalleryAdminProps {
  onNavigate?: (page: Page) => void;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string; // For videos
  caption: string;
  date: string;
  category: string; // e.g., 'Day 1', 'Speaker', 'Networking'
  isFeatured: boolean;
  isVisible: boolean;
  size: number; // in MB
  duration?: string; // For videos
}

// Mock Data
const MOCK_MEDIA: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1669670617524-5f08060c8dcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBldmVudHxlbnwxfHx8fDE3NjkzNDYxNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Main stage crowd during the opening keynote',
    date: '2026-06-12T10:30:00',
    category: 'Day 1',
    isFeatured: true,
    isVisible: true,
    size: 2.4
  },
  {
    id: '2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwc3BlYWtlciUyMHN0YWdlfGVufDF8fHx8MTc2OTM3MDAzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Sarah Johnson discussing the future of AI',
    date: '2026-06-12T11:45:00',
    category: 'Speakers',
    isFeatured: true,
    isVisible: true,
    size: 1.8
  },
  {
    id: '3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1675716921224-e087a0cca69a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ldHdvcmtpbmclMjBldmVudHxlbnwxfHx8fDE3NjkzOTQxNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Networking session at the VIP lounge',
    date: '2026-06-12T14:00:00',
    category: 'Networking',
    isFeatured: false,
    isVisible: true,
    size: 3.1
  },
  {
    id: '4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Mock video
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000',
    caption: 'Highlight reel from Day 1',
    date: '2026-06-12T18:00:00',
    category: 'Highlights',
    isFeatured: false,
    isVisible: true,
    size: 45.2,
    duration: '2:30'
  }
];

export const GalleryAdmin: React.FC<GalleryAdminProps> = ({ onNavigate }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(MOCK_MEDIA);
  const eventId = getCurrentEventId();
  const updateGalleryCount = (count: number, message?: string) => {
    eventsService.updateModuleCount(eventId, 'Event Media & Gallery', count, message, 'image');
  };
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'featured' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats
  const totalMedia = mediaItems.length;
  const totalPhotos = mediaItems.filter(i => i.type === 'image').length;
  const totalVideos = mediaItems.filter(i => i.type === 'video').length;
  const storageUsed = mediaItems.reduce((acc, curr) => acc + curr.size, 0);
  const storageLimit = 1000; // 1GB in MB

  const filteredMedia = mediaItems.filter(item => {
    if (searchQuery && !item.caption.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filter === 'all') return true;
    if (filter === 'image') return item.type === 'image';
    if (filter === 'video') return item.type === 'video';
    if (filter === 'featured') return item.isFeatured;
    if (filter === 'hidden') return !item.isVisible;
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const newItems: MediaItem[] = Array.from(files).map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        type: file.type.startsWith('video') ? 'video' : 'image',
        url: URL.createObjectURL(file),
        caption: file.name,
        date: new Date().toISOString(),
        category: 'New Uploads',
        isFeatured: false,
        isVisible: true,
        size: file.size / (1024 * 1024), // MB
        duration: file.type.startsWith('video') ? '0:00' : undefined
      }));

      setMediaItems(prev => [...newItems, ...prev]);
      updateGalleryCount(mediaItems.length + newItems.length, `Uploaded ${newItems.length} media item${newItems.length === 1 ? '' : 's'}`);
      setIsUploading(false);
      toast.success(`Successfully uploaded ${files.length} items`);
    }, 1500);
  };

  const toggleFeatured = (id: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id ? { ...item, isFeatured: !item.isFeatured } : item
    ));
    toast.success('Media status updated');
  };

  const toggleVisibility = (id: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    ));
    toast.success('Visibility updated');
  };

  const deleteMedia = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setMediaItems(prev => prev.filter(item => item.id !== id));
      updateGalleryCount(Math.max(mediaItems.length - 1, 0), 'Media item deleted');
      toast.success('Media deleted');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
              <button onClick={() => onNavigate?.('event-dashboard')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Event Media Gallery</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Showcase photos and videos from your event to build trust and excitement. 
              Organize media into collections and publish them to your event website.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" onClick={() => onNavigate?.('gallery-public')} className="dark:bg-slate-900 dark:border-slate-800">
              <Eye className="w-4 h-4 mr-2" />
              View Gallery
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Media</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalMedia}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-lg">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Videos</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalVideos}</p>
          </div>
           <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                <Star className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Featured</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{mediaItems.filter(m => m.isFeatured).length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                <HardDrive className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Storage</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{Math.round(storageUsed)} MB</p>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div 
                    className="h-full bg-slate-500 rounded-full" 
                    style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
                />
            </div>
          </div>
        </div>

        {/* Upload Dropzone (Hidden Input, Visual only if empty or dragging - simplifying for now) */}
        <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
        />

        {/* Controls & Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm sticky top-[80px] z-30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <Button 
                variant={filter === 'all' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setFilter('all')}
                className={cn("rounded-full", filter === 'all' && "bg-slate-900 text-white dark:bg-white dark:text-slate-900")}
              >
                All Media
              </Button>
              <Button 
                variant={filter === 'image' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setFilter('image')}
                className={cn("rounded-full", filter === 'image' && "bg-slate-900 text-white dark:bg-white dark:text-slate-900")}
              >
                Photos
              </Button>
              <Button 
                variant={filter === 'video' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setFilter('video')}
                className={cn("rounded-full", filter === 'video' && "bg-slate-900 text-white dark:bg-white dark:text-slate-900")}
              >
                Videos
              </Button>
              <Button 
                variant={filter === 'featured' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setFilter('featured')}
                className={cn("rounded-full", filter === 'featured' && "bg-slate-900 text-white dark:bg-white dark:text-slate-900")}
              >
                Featured
              </Button>
               <Button 
                variant={filter === 'hidden' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setFilter('hidden')}
                className={cn("rounded-full text-slate-500", filter === 'hidden' && "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white")}
              >
                Hidden
              </Button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search captions..." 
                className="pl-9 h-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
               <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">No media found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm text-center mb-6">
                {filter !== 'all' || searchQuery 
                    ? "Try adjusting your filters or search query." 
                    : "Your gallery is empty. Upload photos or videos to show what your event feels like."}
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
                Upload Media
            </Button>
          </div>
        ) : (
          <ResponsiveMasonry columnsCountBreakPoints={{350: 1, 750: 2, 900: 3, 1200: 4}}>
            <Masonry gutter="16px">
              {filteredMedia.map((item) => (
                <div key={item.id} className="group relative break-inside-avoid">
                  <div className={cn(
                    "relative overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 border transition-all hover:shadow-md",
                    item.isVisible ? "border-slate-200 dark:border-slate-700" : "border-dashed border-slate-300 opacity-60"
                  )}>
                    {item.type === 'image' ? (
                      <img 
                        src={item.url} 
                        alt={item.caption}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative aspect-video">
                        <img 
                          src={item.thumbnail || item.url} 
                          alt={item.caption}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                          <PlayCircle className="w-10 h-10 text-white opacity-90" />
                        </div>
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded font-medium">
                          {item.duration}
                        </span>
                      </div>
                    )}

                    {/* Overlay Controls */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <div className="flex justify-between items-start">
                             <div className="flex gap-1">
                                <button 
                                    onClick={() => toggleFeatured(item.id)}
                                    className={cn(
                                        "p-1.5 rounded-full backdrop-blur-sm transition-colors",
                                        item.isFeatured ? "bg-amber-500 text-white" : "bg-white/20 text-white hover:bg-white/40"
                                    )}
                                    title="Toggle Featured"
                                >
                                    <Star className="w-4 h-4 fill-current" />
                                </button>
                             </div>
                             
                             <div className="flex gap-1">
                                <button 
                                    onClick={() => toggleVisibility(item.id)}
                                    className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm transition-colors"
                                    title={item.isVisible ? "Hide" : "Show"}
                                >
                                    {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => deleteMedia(item.id)}
                                    className="p-1.5 rounded-full bg-white/20 text-red-200 hover:bg-red-500/80 hover:text-white backdrop-blur-sm transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                        </div>

                        <div className="text-white">
                            <p className="font-medium text-sm line-clamp-1">{item.caption}</p>
                            <p className="text-[10px] text-white/70">{item.category}</p>
                        </div>
                    </div>
                  </div>
                  
                  {/* Status Badges (Always visible if relevant) */}
                  <div className="absolute top-2 left-2 flex gap-1 pointer-events-none">
                     {item.isFeatured && !item.isVisible && (
                         <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] h-5 px-1.5 border-amber-200 shadow-sm z-10">Featured (Hidden)</Badge>
                     )}
                  </div>
                </div>
              ))}
            </Masonry>
          </ResponsiveMasonry>
        )}
      </main>
    </div>
  );
};
