import React, { useState } from 'react';
import { Page } from '../App';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ArrowLeft, PlayCircle, X, Download, Share2, Calendar, MapPin, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../components/ui/utils';

interface GalleryPublicProps {
  onNavigate?: (page: Page) => void;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption: string;
  date: string;
  category: string;
  isFeatured: boolean;
}

// Mock Data (Same as Admin)
const MOCK_MEDIA: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1669670617524-5f08060c8dcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBldmVudHxlbnwxfHx8fDE3NjkzNDYxNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Main stage crowd during the opening keynote',
    date: '2026-06-12T10:30:00',
    category: 'Day 1',
    isFeatured: true
  },
  {
    id: '2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwc3BlYWtlciUyMHN0YWdlfGVufDF8fHx8MTc2OTM3MDAzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Sarah Johnson discussing the future of AI',
    date: '2026-06-12T11:45:00',
    category: 'Speakers',
    isFeatured: true
  },
  {
    id: '3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1675716921224-e087a0cca69a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ldHdvcmtpbmclMjBldmVudHxlbnwxfHx8fDE3NjkzOTQxNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Networking session at the VIP lounge',
    date: '2026-06-12T14:00:00',
    category: 'Networking',
    isFeatured: false
  },
  {
    id: '4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000',
    caption: 'Highlight reel from Day 1',
    date: '2026-06-12T18:00:00',
    category: 'Highlights',
    isFeatured: false
  }
];

export const GalleryPublic: React.FC<GalleryPublicProps> = ({ onNavigate }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos'>('all');

  const filteredMedia = MOCK_MEDIA.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'photos') return item.type === 'image';
    if (activeTab === 'videos') return item.type === 'video';
    return true;
  });

  const featuredMedia = MOCK_MEDIA.filter(item => item.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-['Raleway']">
      {/* Public Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => onNavigate?.('gallery-admin')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors text-slate-500"
                title="Back to Admin (Demo Purpose)"
             >
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
                <h1 className="font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100 leading-none">Lagos Tech Summit 2026</h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Official Event Gallery</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium transition-colors">
                Register for 2027
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Featured Section */}
        {featuredMedia.length > 0 && activeTab === 'all' && (
          <div className="mb-12 md:mb-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {featuredMedia.map((item, index) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer",
                            index === 0 ? "md:col-span-2 md:aspect-[2/1] lg:aspect-[2/1]" : ""
                        )}
                        onClick={() => setSelectedMedia(item)}
                    >
                        <img 
                            src={item.type === 'video' ? (item.thumbnail || item.url) : item.url} 
                            alt={item.caption}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                        
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            {item.type === 'video' && (
                                <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                                    <PlayCircle className="w-3.5 h-3.5" />
                                    <span>Watch Video</span>
                                </div>
                            )}
                            <h3 className={cn(
                                "font-bold text-white mb-1",
                                index === 0 ? "text-2xl md:text-3xl" : "text-xl"
                            )}>
                                {item.caption}
                            </h3>
                            <p className="text-white/80 text-sm">{item.category} • {new Date(item.date).toLocaleDateString()}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* Gallery Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sticky top-20 z-20 bg-white dark:bg-slate-950 py-4">
             <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-full w-fit">
                <button 
                    onClick={() => setActiveTab('all')}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        activeTab === 'all' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                >
                    All Moments
                </button>
                <button 
                    onClick={() => setActiveTab('photos')}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        activeTab === 'photos' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                >
                    Photos
                </button>
                <button 
                    onClick={() => setActiveTab('videos')}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        activeTab === 'videos' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                >
                    Videos
                </button>
             </div>

             <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span>{filteredMedia.length} memories captured</span>
             </div>
        </div>

        {/* Masonry Grid */}
        <ResponsiveMasonry columnsCountBreakPoints={{350: 1, 750: 2, 900: 3, 1200: 3}}>
            <Masonry gutter="24px">
                {filteredMedia.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "100px" }}
                        transition={{ delay: 0.05 * (index % 5) }}
                        className="group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-zoom-in break-inside-avoid"
                        onClick={() => setSelectedMedia(item)}
                    >
                        {item.type === 'image' ? (
                            <img 
                                src={item.url} 
                                alt={item.caption}
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                        ) : (
                            <div className="relative aspect-video">
                                <img 
                                    src={item.thumbnail || item.url} 
                                    alt={item.caption}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                        <PlayCircle className="w-6 h-6 fill-current" />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <p className="text-white font-medium text-sm line-clamp-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                {item.caption}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </Masonry>
        </ResponsiveMasonry>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
                onClick={() => setSelectedMedia(null)}
            >
                {/* Close Button */}
                <button 
                    className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMedia(null);
                    }}
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Content */}
                <div 
                    className="relative w-full max-w-6xl max-h-full flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Media Container */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative flex-1 flex items-center justify-center max-h-[80vh] md:max-h-[90vh] w-full"
                    >
                        {selectedMedia.type === 'image' ? (
                            <img 
                                src={selectedMedia.url} 
                                alt={selectedMedia.caption}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            />
                        ) : (
                            <video 
                                src={selectedMedia.url} 
                                controls 
                                autoPlay
                                className="max-w-full max-h-full rounded-lg shadow-2xl bg-black"
                            />
                        )}
                    </motion.div>

                    {/* Info Sidebar (Desktop) / Bottom Sheet (Mobile) */}
                    <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="w-full md:w-80 shrink-0 text-white"
                    >
                        <h3 className="text-xl font-bold mb-2">{selectedMedia.caption}</h3>
                        <div className="flex flex-wrap gap-2 mb-6 text-sm text-white/60">
                            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(selectedMedia.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                                <MapPin className="w-3.5 h-3.5" />
                                {selectedMedia.category}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg font-bold hover:bg-slate-200 transition-colors">
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                             <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-colors">
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
