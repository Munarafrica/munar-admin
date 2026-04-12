import { DpCoverMakerShape, DpCoverMakerVariant } from './types';

export type RenderDpCoverOptions = {
  attendeePhotoUrl?: string | null;
  attendeeName?: string;
  photoZoom?: number;
  photoOffset?: { x: number; y: number };
  frameUrlOverride?: string | null;
  drawEditorGuides?: boolean;
  selectedElement?: 'photo' | 'text' | null;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });

export const drawDpCoverShape = (
  ctx: CanvasRenderingContext2D,
  shape: DpCoverMakerShape,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  ctx.beginPath();

  if (shape === 'circle') {
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    return;
  }

  if (shape === 'square') {
    ctx.rect(x, y, width, height);
    return;
  }

  if (shape === 'rounded') {
    const radius = Math.min(width, height) * 0.18;
    ctx.roundRect(x, y, width, height, radius);
    return;
  }

  if (shape === 'hexagon') {
    const inset = height / 4;
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width, y + inset);
    ctx.lineTo(x + width, y + height - inset);
    ctx.lineTo(x + width / 2, y + height);
    ctx.lineTo(x, y + height - inset);
    ctx.lineTo(x, y + inset);
    ctx.closePath();
    return;
  }

  if (shape === 'star') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const outer = Math.min(width, height) / 2;
    const inner = outer * 0.45;
    let angle = -Math.PI / 2;
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? outer : inner;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
      angle += Math.PI / 5;
    }
    ctx.closePath();
    return;
  }

  const top = y + height * 0.28;
  ctx.moveTo(x + width / 2, y + height);
  ctx.bezierCurveTo(x + width * 0.05, y + height * 0.68, x, y + height * 0.42, x, top);
  ctx.bezierCurveTo(x, y + height * 0.02, x + width * 0.34, y, x + width / 2, y + height * 0.26);
  ctx.bezierCurveTo(x + width * 0.66, y, x + width, y + height * 0.02, x + width, top);
  ctx.bezierCurveTo(x + width, y + height * 0.42, x + width * 0.95, y + height * 0.68, x + width / 2, y + height);
  ctx.closePath();
};

export async function renderDpCoverVariant(
  canvas: HTMLCanvasElement,
  variant: DpCoverMakerVariant,
  options: RenderDpCoverOptions = {},
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = variant.canvas.width;
  canvas.height = variant.canvas.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = variant.canvas.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const photo = variant.photoPlaceholder;
  const photoUrl = options.attendeePhotoUrl;
  if (photoUrl) {
    try {
      const img = await loadImage(photoUrl);
      const zoom = options.photoZoom ?? 1;
      const offset = options.photoOffset ?? { x: 0, y: 0 };
      const scale = Math.max(photo.width / img.width, photo.height / img.height) * zoom;
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const centerX = photo.x + photo.width / 2;
      const centerY = photo.y + photo.height / 2;

      ctx.save();
      drawDpCoverShape(ctx, photo.shape, photo.x, photo.y, photo.width, photo.height);
      ctx.clip();
      ctx.drawImage(img, centerX - drawWidth / 2 + offset.x, centerY - drawHeight / 2 + offset.y, drawWidth, drawHeight);
      ctx.restore();
    } catch {
      // Keep rendering the rest of the frame.
    }
  } else {
    ctx.save();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.18)';
    drawDpCoverShape(ctx, photo.shape, photo.x, photo.y, photo.width, photo.height);
    ctx.fill();
    ctx.setLineDash([18, 14]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.lineWidth = 6;
    drawDpCoverShape(ctx, photo.shape, photo.x, photo.y, photo.width, photo.height);
    ctx.stroke();
    ctx.restore();
  }

  const frameUrl = options.frameUrlOverride ?? variant.frameAsset?.url;
  if (frameUrl) {
    try {
      const frame = await loadImage(frameUrl);
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
    } catch {
      // A broken frame should not block placeholder/text preview.
    }
  }

  if (variant.nameText.enabled) {
    const text = variant.nameText;
    ctx.save();
    ctx.font = `${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
    ctx.fillStyle = text.color;
    ctx.textAlign = text.align;
    ctx.textBaseline = 'top';
    const x = text.align === 'center' ? text.x + text.width / 2 : text.align === 'right' ? text.x + text.width : text.x;
    ctx.fillText(options.attendeeName?.trim() || text.placeholder, x, text.y, text.width);
    ctx.restore();
  }

  if (options.drawEditorGuides) {
    ctx.save();
    ctx.setLineDash([14, 10]);
    ctx.lineWidth = 5;
    ctx.strokeStyle = options.selectedElement === 'photo' ? '#6366f1' : 'rgba(148, 163, 184, 0.75)';
    drawDpCoverShape(ctx, photo.shape, photo.x, photo.y, photo.width, photo.height);
    ctx.stroke();
    if (options.selectedElement === 'photo') {
      ctx.setLineDash([]);
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(photo.x + photo.width - 18, photo.y + photo.height - 18, 36, 36);
    }
    if (options.selectedElement === 'text' && variant.nameText.enabled) {
      const text = variant.nameText;
      ctx.strokeStyle = '#6366f1';
      ctx.setLineDash([14, 10]);
      ctx.strokeRect(text.x, text.y, text.width, text.height);
    }
    ctx.restore();
  }
}

