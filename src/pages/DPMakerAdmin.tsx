import React, { useState, useRef, useEffect } from 'react';
import { TopBar } from '../components/dashboard/TopBar';
import { Page, DPFrame, PhotoPlaceholder, TextPlaceholder, PlaceholderShape, TextAlignment } from '../components/event-dashboard/types';
import { Button } from '../components/ui/button';
import { ArrowLeft, Upload, Circle, Square, Eye, Save, AlertCircle, X, Menu, Hexagon, Star, Heart, Link as LinkIcon, ExternalLink, Copy } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner@2.0.3';
import { drawShape, createShapeClipPath } from '../utils/canvas-shapes';
import { eventsService } from '../services';
import { getCurrentEventId } from '../lib/event-storage';

interface DPMakerAdminProps {
  onNavigate?: (page: Page) => void;
}

export const DPMakerAdmin: React.FC<DPMakerAdminProps> = ({ onNavigate }) => {
  const eventId = getCurrentEventId();

  const [step, setStep] = useState<'upload' | 'configure' | 'preview'>('upload');
  const [frameImage, setFrameImage] = useState<string | null>(null);
  const [frameDimensions, setFrameDimensions] = useState({ width: 1080, height: 1080 });
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  
  const [photoPlaceholder, setPhotoPlaceholder] = useState<PhotoPlaceholder>({
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    shape: 'circle',
    rotation: 0
  });
  
  const [textPlaceholder, setTextPlaceholder] = useState<TextPlaceholder>({
    x: 100,
    y: 350,
    fontSize: 32,
    fontFamily: 'Raleway',
    color: '#000000',
    alignment: 'center',
    maxWidth: 400
  });
  
  const [selectedElement, setSelectedElement] = useState<'photo' | 'text' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);

  const eventName = 'Lagos Tech Summit 2026';
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'event';

  const dpPublicUrl = `https://${slugify(eventName)}.munar.com/dp`;

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle frame upload
  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setFrameDimensions({ width: img.width, height: img.height });
        setFrameImage(event.target?.result as string);
        setStep('configure');
        toast.success('Frame uploaded successfully');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !frameImage) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw photo placeholder
      if (photoPlaceholder) {
        ctx.save();
        ctx.strokeStyle = selectedElement === 'photo' ? '#6366f1' : '#94a3b8';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        
        drawShape(
          ctx,
          photoPlaceholder.shape,
          photoPlaceholder.x,
          photoPlaceholder.y,
          photoPlaceholder.width,
          photoPlaceholder.height,
          false
        );
        
        // Draw resize handle
        if (selectedElement === 'photo') {
          ctx.fillStyle = '#6366f1';
          ctx.setLineDash([]);
          ctx.fillRect(
            photoPlaceholder.x + photoPlaceholder.width - 10,
            photoPlaceholder.y + photoPlaceholder.height - 10,
            20,
            20
          );
        }
        
        ctx.restore();
      }
      
      // Draw text placeholder
      if (textPlaceholder) {
        ctx.save();
        ctx.font = `${textPlaceholder.fontSize}px ${textPlaceholder.fontFamily}`;
        ctx.fillStyle = selectedElement === 'text' ? '#6366f1' : textPlaceholder.color;
        ctx.textAlign = textPlaceholder.alignment;
        ctx.fillText('Sample Name', textPlaceholder.x, textPlaceholder.y);
        
        if (selectedElement === 'text') {
          const metrics = ctx.measureText('Sample Name');
          const textWidth = metrics.width;
          const textHeight = textPlaceholder.fontSize;
          
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          
          let textX = textPlaceholder.x;
          if (textPlaceholder.alignment === 'center') textX -= textWidth / 2;
          else if (textPlaceholder.alignment === 'right') textX -= textWidth;
          
          ctx.strokeRect(textX, textPlaceholder.y - textHeight, textWidth, textHeight + 10);
        }
        
        ctx.restore();
      }
    };
    img.src = frameImage;
  }, [frameImage, photoPlaceholder, textPlaceholder, selectedElement]);
  
  // Canvas mouse handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check if clicking on photo placeholder
    if (photoPlaceholder) {
      const inPhoto = x >= photoPlaceholder.x && x <= photoPlaceholder.x + photoPlaceholder.width &&
        y >= photoPlaceholder.y && y <= photoPlaceholder.y + photoPlaceholder.height;
      
      const inResizeHandle = x >= photoPlaceholder.x + photoPlaceholder.width - 10 &&
        x <= photoPlaceholder.x + photoPlaceholder.width + 10 &&
        y >= photoPlaceholder.y + photoPlaceholder.height - 10 &&
        y <= photoPlaceholder.y + photoPlaceholder.height + 10;
      
      if (inResizeHandle && selectedElement === 'photo') {
        setIsResizing(true);
        setDragStart({ x, y });
        return;
      }
      
      if (inPhoto) {
        setSelectedElement('photo');
        setIsDragging(true);
        setDragStart({ x: x - photoPlaceholder.x, y: y - photoPlaceholder.y });
        return;
      }
    }
    
    // Check if clicking on text placeholder
    if (textPlaceholder) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = `${textPlaceholder.fontSize}px ${textPlaceholder.fontFamily}`;
        const metrics = ctx.measureText('Sample Name');
        const textWidth = metrics.width;
        const textHeight = textPlaceholder.fontSize;
        
        let textX = textPlaceholder.x;
        if (textPlaceholder.alignment === 'center') textX -= textWidth / 2;
        else if (textPlaceholder.alignment === 'right') textX -= textWidth;
        
        if (x >= textX && x <= textX + textWidth &&
            y >= textPlaceholder.y - textHeight && y <= textPlaceholder.y + 10) {
          setSelectedElement('text');
          setIsDragging(true);
          setDragStart({ x: x - textPlaceholder.x, y: y - textPlaceholder.y });
          return;
        }
      }
    }
    
    setSelectedElement(null);
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && !isResizing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (isResizing && selectedElement === 'photo') {
      const newWidth = Math.max(50, x - photoPlaceholder.x);
      const newHeight = Math.max(50, y - photoPlaceholder.y);
      setPhotoPlaceholder({
        ...photoPlaceholder,
        width: newWidth,
        height: newHeight
      });
    } else if (isDragging && selectedElement === 'photo') {
      setPhotoPlaceholder({
        ...photoPlaceholder,
        x: x - dragStart.x,
        y: y - dragStart.y
      });
    } else if (isDragging && selectedElement === 'text') {
      setTextPlaceholder({
        ...textPlaceholder,
        x: x - dragStart.x,
        y: y - dragStart.y
      });
    }
  };
  
  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };
  
  const handleSave = () => {
    if (!frameImage) {
      toast.error('Please upload a frame image');
      return;
    }
    eventsService.updateModuleCount(eventId, 'DP & Cover Maker', 1, 'DP frame saved', 'image');
    toast.success('DP Frame saved successfully');
  };
  
  const shapes: { value: PlaceholderShape; icon: React.ReactNode; label: string }[] = [
    { value: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
    { value: 'square', icon: <Square className="w-4 h-4" />, label: 'Square' },
    { 
      value: 'rounded-square', 
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"/></svg>, 
      label: 'Rounded' 
    },
    { value: 'hexagon', icon: <Hexagon className="w-4 h-4" />, label: 'Hexagon' },
    { value: 'star', icon: <Star className="w-4 h-4" />, label: 'Star' },
    { value: 'heart', icon: <Heart className="w-4 h-4" />, label: 'Heart' },
  ];
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-4 md:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                <button onClick={() => onNavigate?.('event-dashboard')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Configure Event Frame</h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
                Create a custom frame for attendees to generate branded profile pictures
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200">
                <LinkIcon className="w-4 h-4 text-indigo-600" />
                <span className="truncate max-w-[180px]" title={dpPublicUrl}>{dpPublicUrl}</span>
                <button onClick={() => copyLink(dpPublicUrl)} className="p-1 hover:text-indigo-600" title="Copy link">
                  <Copy className="w-4 h-4" />
                </button>
                <a href={dpPublicUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-indigo-600" title="Open">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep('preview')} className="dark:bg-slate-900 dark:border-slate-800">
                <Eye className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Preview</span>
              </Button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={() => setStep('preview')} variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 dark:bg-slate-900 dark:border-slate-800">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button onClick={handleSave} size="sm" className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Save className="w-4 h-4" />
              Save & Publish
            </Button>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className={cn(
            "flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-all whitespace-nowrap text-xs md:text-sm",
            step === 'upload' ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400" : "bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800"
          )}>
            <Upload className="w-3 h-3 md:w-4 md:h-4" />
            <span className="font-medium">1. Upload</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-all whitespace-nowrap text-xs md:text-sm",
            step === 'configure' ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400" : "bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800"
          )}>
            <Circle className="w-3 h-3 md:w-4 md:h-4" />
            <span className="font-medium">2. Position</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-all whitespace-nowrap text-xs md:text-sm",
            step === 'preview' ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400" : "bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800"
          )}>
            <Eye className="w-3 h-3 md:w-4 md:h-4" />
            <span className="font-medium">3. Preview</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 relative">
          {/* Canvas Area */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 shadow-sm">
              {step === 'upload' && !frameImage ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                  <Upload className="w-12 h-12 md:w-16 md:h-16 text-slate-400 mb-4" />
                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Upload Event Frame</h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md px-4">
                    Upload a square image (1080×1080 recommended). Transparent PNGs work best for overlays.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFrameUpload}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">Canvas Preview</h3>
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs">
                      Change
                    </Button>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-950 rounded-lg p-2 md:p-4 flex justify-center">
                    <canvas
                      ref={canvasRef}
                      width={frameDimensions.width}
                      height={frameDimensions.height}
                      className="max-w-full h-auto border border-slate-300 dark:border-slate-700 rounded-lg cursor-move"
                      style={{ maxHeight: '70vh' }}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                    />
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4 flex gap-2 md:gap-3">
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs md:text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-semibold mb-1">Canvas Controls:</p>
                      <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                        <li>• Click elements to select them</li>
                        <li>• Drag to move selected elements</li>
                        <li>• Use controls panel to customize</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls Panel */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
              className="lg:hidden w-full mb-4 bg-indigo-600 text-white px-4 py-3 rounded-lg flex items-center justify-between font-medium"
            >
              <span>Element Controls</span>
              {isMobilePanelOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {/* Controls Panel Content */}
            <div className={cn(
              "bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 shadow-sm space-y-4 md:space-y-6",
              "lg:block",
              isMobilePanelOpen ? "block" : "hidden"
            )}>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm md:text-base">Element Controls</h3>
                
                {/* Photo Placeholder Controls */}
                <div className="space-y-3 md:space-y-4 pb-4 md:pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Photo Placeholder</label>
                    <Button
                      size="sm"
                      variant={selectedElement === 'photo' ? 'default' : 'outline'}
                      onClick={() => setSelectedElement('photo')}
                      className={cn("text-xs h-7 md:h-8", selectedElement === 'photo' && "bg-indigo-600 text-white")}
                    >
                      Select
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Shape</label>
                    <div className="grid grid-cols-3 gap-2">
                      {shapes.map(shape => (
                        <button
                          key={shape.value}
                          onClick={() => setPhotoPlaceholder({ ...photoPlaceholder, shape: shape.value })}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1.5 p-2 md:p-3 rounded-lg border transition-all",
                            photoPlaceholder.shape === shape.value
                              ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700"
                          )}
                        >
                          {shape.icon}
                          <span className="text-[10px] md:text-xs font-medium">{shape.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Width</label>
                      <input
                        type="number"
                        value={Math.round(photoPlaceholder.width)}
                        onChange={(e) => setPhotoPlaceholder({
                          ...photoPlaceholder,
                          width: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-2 md:px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs md:text-sm bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Height</label>
                      <input
                        type="number"
                        value={Math.round(photoPlaceholder.height)}
                        onChange={(e) => setPhotoPlaceholder({
                          ...photoPlaceholder,
                          height: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-2 md:px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs md:text-sm bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Text Placeholder Controls */}
                <div className="space-y-3 md:space-y-4 pt-4 md:pt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Name Text</label>
                    <Button
                      size="sm"
                      variant={selectedElement === 'text' ? 'default' : 'outline'}
                      onClick={() => setSelectedElement('text')}
                      className={cn("text-xs h-7 md:h-8", selectedElement === 'text' && "bg-indigo-600 text-white")}
                    >
                      Select
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Font Size</label>
                    <input
                      type="range"
                      min="16"
                      max="72"
                      value={textPlaceholder.fontSize}
                      onChange={(e) => setTextPlaceholder({ ...textPlaceholder, fontSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-xs text-slate-500 text-right">{textPlaceholder.fontSize}px</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Font Family</label>
                    <select
                      value={textPlaceholder.fontFamily}
                      onChange={(e) => setTextPlaceholder({ ...textPlaceholder, fontFamily: e.target.value })}
                      className="w-full px-2 md:px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs md:text-sm bg-white dark:bg-slate-800"
                    >
                      <option value="Raleway">Raleway</option>
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textPlaceholder.color}
                        onChange={(e) => setTextPlaceholder({ ...textPlaceholder, color: e.target.value })}
                        className="w-10 md:w-12 h-9 md:h-10 rounded border border-slate-200 dark:border-slate-700"
                      />
                      <input
                        type="text"
                        value={textPlaceholder.color}
                        onChange={(e) => setTextPlaceholder({ ...textPlaceholder, color: e.target.value })}
                        className="flex-1 px-2 md:px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs md:text-sm bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Alignment</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['left', 'center', 'right'] as TextAlignment[]).map(align => (
                        <button
                          key={align}
                          onClick={() => setTextPlaceholder({ ...textPlaceholder, alignment: align })}
                          className={cn(
                            "px-2 md:px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-all",
                            textPlaceholder.alignment === align
                              ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700"
                          )}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFrameUpload}
        className="hidden"
      />
    </div>
  );
};