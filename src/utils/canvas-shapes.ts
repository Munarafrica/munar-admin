import { PlaceholderShape } from '../components/event-dashboard/types';

export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shape: PlaceholderShape,
  x: number,
  y: number,
  width: number,
  height: number,
  isFilled: boolean = false
) => {
  ctx.beginPath();
  
  switch (shape) {
    case 'circle':
      ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
      break;
      
    case 'square':
      ctx.rect(x, y, width, height);
      break;
      
    case 'rounded-square':
      const radius = Math.min(width, height) * 0.2;
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      break;
      
    case 'hexagon':
      const hexWidth = width / 2;
      const hexHeight = height / 4;
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + hexHeight);
      ctx.lineTo(x + width, y + height - hexHeight);
      ctx.lineTo(x + width / 2, y + height);
      ctx.lineTo(x, y + height - hexHeight);
      ctx.lineTo(x, y + hexHeight);
      ctx.closePath();
      break;
      
    case 'star':
      const spikes = 5;
      const outerRadius = width / 2;
      const innerRadius = outerRadius / 2.5;
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      
      ctx.moveTo(centerX, centerY - outerRadius);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(centerX + Math.cos(rot) * outerRadius, centerY + Math.sin(rot) * outerRadius);
        rot += step;
        ctx.lineTo(centerX + Math.cos(rot) * innerRadius, centerY + Math.sin(rot) * innerRadius);
        rot += step;
      }
      ctx.lineTo(centerX, centerY - outerRadius);
      ctx.closePath();
      break;
      
    case 'heart':
      const heartWidth = width;
      const heartHeight = height;
      const topCurveHeight = heartHeight * 0.3;
      ctx.moveTo(x + heartWidth / 2, y + topCurveHeight);
      
      // Top left curve
      ctx.bezierCurveTo(
        x + heartWidth / 2, y,
        x, y,
        x, y + topCurveHeight
      );
      
      // Bottom left curve
      ctx.bezierCurveTo(
        x, y + (heartHeight + topCurveHeight) / 2,
        x + heartWidth / 2, y + (heartHeight + topCurveHeight) / 1.2,
        x + heartWidth / 2, y + heartHeight
      );
      
      // Bottom right curve
      ctx.bezierCurveTo(
        x + heartWidth / 2, y + (heartHeight + topCurveHeight) / 1.2,
        x + heartWidth, y + (heartHeight + topCurveHeight) / 2,
        x + heartWidth, y + topCurveHeight
      );
      
      // Top right curve
      ctx.bezierCurveTo(
        x + heartWidth, y,
        x + heartWidth / 2, y,
        x + heartWidth / 2, y + topCurveHeight
      );
      break;
  }
  
  if (isFilled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
};

export const createShapeClipPath = (
  ctx: CanvasRenderingContext2D,
  shape: PlaceholderShape,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  drawShape(ctx, shape, x, y, width, height, false);
  ctx.clip();
};
