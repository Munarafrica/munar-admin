import React, { useState, useRef, useEffect } from 'react';
import { DPFrame } from '../components/event-dashboard/types';
import { Button } from '../components/ui/button';
import { Upload, Download, RefreshCw, Instagram, Facebook, Twitter, MessageCircle, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner@2.0.3';
import { Page } from '../App';
import { createShapeClipPath, drawShape } from '../utils/canvas-shapes';

interface DPMakerPublicProps {
  onNavigate?: (page: Page) => void;
}

export const DPMakerPublic: React.FC<DPMakerPublicProps> = ({ onNavigate }) => {
  // Mock frame data
  const [frame] = useState<DPFrame>({
    id: 'dp1',
    eventId: 'evt1',
    name: 'Lagos Tech Summit 2026',
    frameImageUrl: '',
    frameWidth: 1080,
    frameHeight: 1080,
    photoPlaceholder: {
      x: 340,
      y: 340,
      width: 400,
      height: 400,
      shape: 'heart',
      rotation: 0
    },
    textPlaceholder: {
      x: 540,
      y: 800,
      fontSize: 48,
      fontFamily: 'Raleway',
      color: '#1e293b',
      alignment: 'center'
    },
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [attendeePhoto, setAttendeePhoto] = useState<string | null>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0 });
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [generatedDP, setGeneratedDP] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttendeePhoto(event.target?.result as string);
      setPhotoZoom(1);
      setPhotoPosition({ x: 0, y: 0 });
      toast.success('Photo uploaded successfully');
    };
    reader.readAsDataURL(file);
  };
  
  // Generate final DP
  const generateDP = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    setGeneratedDP(dataUrl);
    toast.success('Your custom DP is ready!');
  };
  
  // Download DP
  const handleDownload = () => {
    if (!generatedDP) return;
    
    const link = document.createElement('a');
    link.download = `${attendeeName || 'My'}-DP-${frame.name}.png`;
    link.href = generatedDP;
    link.click();
    toast.success('Download started');
  };
  
  // Share functions
  const handleShare = (platform: string) => {
    const eventHashtag = '#LagosTechSummit2026';
    const shareText = `Check out my custom DP for ${frame.name}! ${eventHashtag}`;
    
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        break;
      case 'instagram':
        toast.info('Save your DP and share it on Instagram!');
        return;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        break;
    }
    
    if (url) window.open(url, '_blank');
  };
  
  // Reset everything
  const handleReset = () => {
    setAttendeePhoto(null);
    setAttendeeName('');
    setPhotoZoom(1);
    setPhotoPosition({ x: 0, y: 0 });
    setGeneratedDP(null);
  };
  
  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !frame) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (attendeePhoto && frame.photoPlaceholder) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        
        // Create clipping region
        createShapeClipPath(
          ctx,
          frame.photoPlaceholder!.shape,
          frame.photoPlaceholder!.x,
          frame.photoPlaceholder!.y,
          frame.photoPlaceholder!.width,
          frame.photoPlaceholder!.height
        );
        
        const photoWidth = img.width * photoZoom;
        const photoHeight = img.height * photoZoom;
        
        const centerX = frame.photoPlaceholder!.x + frame.photoPlaceholder!.width / 2;
        const centerY = frame.photoPlaceholder!.y + frame.photoPlaceholder!.height / 2;
        
        ctx.drawImage(
          img,
          centerX - photoWidth / 2 + photoPosition.x,
          centerY - photoHeight / 2 + photoPosition.y,
          photoWidth,
          photoHeight
        );
        
        ctx.restore();
        
        if (frame.frameImageUrl) {
          const frameImg = new Image();
          frameImg.onload = () => {
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
            drawText();
          };
          frameImg.src = frame.frameImageUrl;
        } else {
          drawText();
        }
      };
      img.src = attendeePhoto;
    } else if (!attendeePhoto && frame.photoPlaceholder) {
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      
      drawShape(
        ctx,
        frame.photoPlaceholder.shape,
        frame.photoPlaceholder.x,
        frame.photoPlaceholder.y,
        frame.photoPlaceholder.width,
        frame.photoPlaceholder.height,
        true
      );
      
      ctx.strokeStyle = '#94a3b8';
      drawShape(
        ctx,
        frame.photoPlaceholder.shape,
        frame.photoPlaceholder.x,
        frame.photoPlaceholder.y,
        frame.photoPlaceholder.width,
        frame.photoPlaceholder.height,
        false
      );
      
      ctx.setLineDash([]);
      ctx.fillStyle = '#64748b';
      ctx.font = '64px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        '👤',
        frame.photoPlaceholder.x + frame.photoPlaceholder.width / 2,
        frame.photoPlaceholder.y + frame.photoPlaceholder.height / 2 + 20
      );
      
      drawText();
    }
    
    function drawText() {
      if (!frame.textPlaceholder || !ctx) return;
      
      const displayName = attendeeName || 'Your Name';
      
      ctx.font = `${frame.textPlaceholder.fontSize}px ${frame.textPlaceholder.fontFamily}`;
      ctx.fillStyle = frame.textPlaceholder.color;
      ctx.textAlign = frame.textPlaceholder.alignment;
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(displayName, frame.textPlaceholder.x, frame.textPlaceholder.y);
      
      ctx.shadowColor = 'transparent';
    }
  }, [attendeePhoto, attendeeName, photoZoom, photoPosition, frame]);
  
  // Canvas mouse handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!attendeePhoto || !frame.photoPlaceholder) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const inPlaceholder = x >= frame.photoPlaceholder.x && x <= frame.photoPlaceholder.x + frame.photoPlaceholder.width &&
      y >= frame.photoPlaceholder.y && y <= frame.photoPlaceholder.y + frame.photoPlaceholder.height;
    
    if (inPlaceholder) {
      setIsDraggingPhoto(true);
      setDragStart({ x: x - photoPosition.x, y: y - photoPosition.y });
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingPhoto) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setPhotoPosition({
      x: x - dragStart.x,
      y: y - dragStart.y
    });
  };
  
  const handleCanvasMouseUp = () => {
    setIsDraggingPhoto(false);
  };
  
  // Touch handlers for mobile
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!attendeePhoto || !frame.photoPlaceholder) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    const inPlaceholder = x >= frame.photoPlaceholder.x && x <= frame.photoPlaceholder.x + frame.photoPlaceholder.width &&
      y >= frame.photoPlaceholder.y && y <= frame.photoPlaceholder.y + frame.photoPlaceholder.height;
    
    if (inPlaceholder) {
      setIsDraggingPhoto(true);
      setDragStart({ x: x - photoPosition.x, y: y - photoPosition.y });
    }
  };
  
  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingPhoto) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    setPhotoPosition({
      x: x - dragStart.x,
      y: y - dragStart.y
    });
  };
  
  const handleCanvasTouchEnd = () => {
    setIsDraggingPhoto(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col items-center justify-start p-4 md:p-8 font-['Raleway']">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Create Your Event DP
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 px-4">
            Upload your photo and personalize your display picture for {frame.name}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Left: Canvas Preview */}
          <div className="space-y-4 order-2 lg:order-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-4 md:p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm md:text-base">Preview</h2>
              
              <div className="bg-slate-100 dark:bg-slate-950 rounded-xl p-2 md:p-4 flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={frame.frameWidth}
                  height={frame.frameHeight}
                  className="max-w-full h-auto rounded-lg shadow-lg cursor-move touch-none"
                  style={{ maxHeight: '500px' }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onTouchStart={handleCanvasTouchStart}
                  onTouchMove={handleCanvasTouchMove}
                  onTouchEnd={handleCanvasTouchEnd}
                />
              </div>
              
              {attendeePhoto && (
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400">
                        Photo Zoom
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPhotoZoom(Math.max(0.5, photoZoom - 0.1))}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPhotoZoom(Math.min(3, photoZoom + 0.1))}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={photoZoom}
                      onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-slate-500 text-right">{Math.round(photoZoom * 100)}%</div>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                    💡 Drag your photo to reposition it within the frame
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Controls */}
          <div className="space-y-4 order-1 lg:order-2">
            {/* Upload Photo */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-4 md:p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm md:text-base">1. Upload Your Photo</h2>
              
              {!attendeePhoto ? (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 md:p-8 text-center">
                  <Upload className="w-10 h-10 md:w-12 md:h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Upload a square photo for best results
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Photo
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 md:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                    <img src={attendeePhoto} alt="Your photo" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-green-900 dark:text-green-100 truncate">Photo uploaded</p>
                    <p className="text-[10px] md:text-xs text-green-700 dark:text-green-300">Adjust zoom and position</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="shrink-0 text-xs">
                    Change
                  </Button>
                </div>
              )}
            </div>
            
            {/* Enter Name */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-4 md:p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm md:text-base">2. Enter Your Name</h2>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value.slice(0, 30))}
                  placeholder="Your Name"
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm md:text-base bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={30}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {attendeeName.length}/30 characters
                </p>
              </div>
            </div>
            
            {/* Generate Button */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-4 md:p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm md:text-base">3. Generate & Share</h2>
              
              <div className="space-y-3">
                <Button
                  onClick={generateDP}
                  disabled={!attendeePhoto || !attendeeName}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-10 md:h-11"
                >
                  Generate My DP
                </Button>
                
                {generatedDP && (
                  <>
                    <Button onClick={handleDownload} variant="outline" className="w-full gap-2 dark:bg-slate-800 dark:border-slate-700 h-10 md:h-11">
                      <Download className="w-4 h-4" />
                      Download DP
                    </Button>
                    
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Share on social media:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => handleShare('facebook')}
                          className="flex flex-col items-center gap-2 p-2.5 md:p-3 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <Facebook className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-[10px] md:text-xs text-blue-900 dark:text-blue-100">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="flex flex-col items-center gap-2 p-2.5 md:p-3 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20 dark:hover:bg-sky-900/30 transition-colors"
                        >
                          <Twitter className="w-4 h-4 md:w-5 md:h-5 text-sky-600 dark:text-sky-400" />
                          <span className="text-[10px] md:text-xs text-sky-900 dark:text-sky-100">Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare('instagram')}
                          className="flex flex-col items-center gap-2 p-2.5 md:p-3 rounded-lg bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/30 transition-colors"
                        >
                          <Instagram className="w-4 h-4 md:w-5 md:h-5 text-pink-600 dark:text-pink-400" />
                          <span className="text-[10px] md:text-xs text-pink-900 dark:text-pink-100">Instagram</span>
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="flex flex-col items-center gap-2 p-2.5 md:p-3 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                          <span className="text-[10px] md:text-xs text-green-900 dark:text-green-100">WhatsApp</span>
                        </button>
                      </div>
                    </div>
                    
                    <Button onClick={handleReset} variant="ghost" className="w-full gap-2 mt-2 h-10 md:h-11">
                      <RefreshCw className="w-4 h-4" />
                      Start Over
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Tips */}
        <div className="mt-6 md:mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 md:p-4">
          <div className="flex gap-2 md:gap-3">
            <div className="text-blue-600 dark:text-blue-400 shrink-0 text-base md:text-lg">💡</div>
            <div className="text-xs md:text-sm text-blue-900 dark:text-blue-100 space-y-1">
              <p className="font-semibold">Tips for best results:</p>
              <ul className="space-y-0.5 md:space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Use a high-quality, well-lit photo</li>
                <li>• Square photos work best for all frames</li>
                <li>• Adjust zoom and position for perfect framing</li>
                <li>• Keep your name short for better visibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
