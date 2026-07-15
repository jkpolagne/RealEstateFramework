import { useRef, useState } from 'react';

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
}

function pointFromEvent(canvas: HTMLCanvasElement, e: { clientX: number; clientY: number }) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

export function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  function getContext() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#132135';
    }
    return ctx;
  }

  function startDraw(e: { clientX: number; clientY: number }) {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    drawingRef.current = true;
    const { x, y } = pointFromEvent(canvas, e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function moveDraw(e: { clientX: number; clientY: number }) {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx || !drawingRef.current) return;
    const { x, y } = pointFromEvent(canvas, e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSignature) setHasSignature(true);
  }

  function endDraw() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas && hasSignature) onChange(canvas.toDataURL('image/png'));
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  }

  return (
    <div className="signature-pad">
      <canvas
        ref={canvasRef}
        width={420}
        height={140}
        className="signature-pad-canvas"
        onMouseDown={(e) => startDraw(e)}
        onMouseMove={(e) => moveDraw(e)}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={(e) => startDraw(e.touches[0])}
        onTouchMove={(e) => {
          e.preventDefault();
          moveDraw(e.touches[0]);
        }}
        onTouchEnd={endDraw}
      />
      <div className="signature-pad-footer">
        <span className="text-muted">{hasSignature ? 'Signature captured.' : 'Draw your signature above.'}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleClear} disabled={!hasSignature}>
          Clear
        </button>
      </div>
    </div>
  );
}
