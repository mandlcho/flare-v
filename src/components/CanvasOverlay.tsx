'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { ToolType, Annotation } from '@/types';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  activeTool: ToolType | null;
  strokeColor: string;
  currentTime: number;
  annotations: Annotation[];
}

export interface CanvasOverlayHandle {
  toJSON: () => string | null;
  clear: () => void;
  hasObjects: () => boolean;
}

const CanvasOverlay = forwardRef<CanvasOverlayHandle, Props>(
  ({ videoRef, activeTool, strokeColor, currentTime, annotations }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [fabricLoaded, setFabricLoaded] = useState(false);
    const lastShownAnnotationRef = useRef<string | null>(null);
    const isDrawingRef = useRef(false);
    const fabricModuleRef = useRef<any>(null);
    const activeToolRef = useRef<ToolType | null>(null);
    activeToolRef.current = activeTool;

    // Load fabric.js dynamically (client-only)
    useEffect(() => {
      import('fabric').then((mod) => {
        fabricModuleRef.current = mod;
        setFabricLoaded(true);
      });
    }, []);

    // Resize observer — update dimensions when container size changes
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const updateSize = () => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDimensions({ width: rect.width, height: rect.height });
        }
      };

      const observer = new ResizeObserver(updateSize);
      observer.observe(container);
      // Also update after video metadata loads
      const video = videoRef.current;
      if (video) {
        video.addEventListener('loadedmetadata', updateSize);
      }
      updateSize();

      return () => {
        observer.disconnect();
        if (video) video.removeEventListener('loadedmetadata', updateSize);
      };
    }, [videoRef]);

    // Initialize fabric canvas
    useEffect(() => {
      if (!fabricLoaded || !canvasRef.current || dimensions.width === 0) return;

      const fabric = fabricModuleRef.current;
      if (!fabricCanvasRef.current) {
        fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
          width: dimensions.width,
          height: dimensions.height,
          selection: true,
        });
      } else {
        fabricCanvasRef.current.setDimensions({
          width: dimensions.width,
          height: dimensions.height,
        });
      }
    }, [fabricLoaded, dimensions]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        }
      };
    }, []);

    // Handle tool changes
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !fabricModuleRef.current) return;

      const fabric = fabricModuleRef.current;

      canvas.isDrawingMode = activeTool === 'freehand';
      canvas.selection = activeTool === 'select' || activeTool === null;

      if (activeTool === 'freehand') {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = strokeColor;
        canvas.freeDrawingBrush.width = 3;
      }

      // Remove previous mouse handlers
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');

      if (activeTool === 'rect' || activeTool === 'circle' || activeTool === 'arrow') {
        let startX = 0;
        let startY = 0;
        let shape: any = null;

        canvas.on('mouse:down', (opt: any) => {
          if (opt.target) return;
          isDrawingRef.current = true;
          canvas.selection = false;
          const pointer = canvas.getScenePoint(opt.e);
          startX = pointer.x;
          startY = pointer.y;

          const tool = activeToolRef.current;
          if (tool === 'rect') {
            shape = new fabric.Rect({
              left: startX,
              top: startY,
              width: 0,
              height: 0,
              fill: 'transparent',
              stroke: strokeColor,
              strokeWidth: 3,
              strokeUniform: true,
            });
          } else if (tool === 'circle') {
            shape = new fabric.Ellipse({
              left: startX,
              top: startY,
              rx: 0,
              ry: 0,
              fill: 'transparent',
              stroke: strokeColor,
              strokeWidth: 3,
              strokeUniform: true,
            });
          } else if (tool === 'arrow') {
            shape = new fabric.Line([startX, startY, startX, startY], {
              stroke: strokeColor,
              strokeWidth: 3,
            });
          }

          if (shape) canvas.add(shape);
        });

        canvas.on('mouse:move', (opt: any) => {
          if (!isDrawingRef.current || !shape) return;
          const pointer = canvas.getScenePoint(opt.e);
          const tool = activeToolRef.current;

          if (tool === 'rect') {
            shape.set({
              left: Math.min(startX, pointer.x),
              top: Math.min(startY, pointer.y),
              width: Math.abs(pointer.x - startX),
              height: Math.abs(pointer.y - startY),
            });
          } else if (tool === 'circle') {
            shape.set({
              rx: Math.abs(pointer.x - startX) / 2,
              ry: Math.abs(pointer.y - startY) / 2,
              left: Math.min(startX, pointer.x),
              top: Math.min(startY, pointer.y),
            });
          } else if (tool === 'arrow') {
            shape.set({ x2: pointer.x, y2: pointer.y });
          }

          canvas.renderAll();
        });

        canvas.on('mouse:up', () => {
          isDrawingRef.current = false;
          shape = null;
        });
      }

      if (activeTool === 'text') {
        canvas.on('mouse:down', (opt: any) => {
          if (opt.target) return;
          const pointer = canvas.getScenePoint(opt.e);
          const text = new fabric.IText('Type here', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 20,
            fill: strokeColor,
            fontFamily: 'monospace',
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
        });
      }
    }, [activeTool, strokeColor]);

    // Update freehand brush color
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (canvas && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = strokeColor;
      }
    }, [strokeColor]);

    // Show/hide annotations based on current time
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !fabricModuleRef.current) return;
      if (isDrawingRef.current) return;

      const objectCount = canvas.getObjects().length;
      if (objectCount > 0 && !lastShownAnnotationRef.current) return;

      // Show annotation only on the exact frame (~1 frame at 30fps)
      const TOLERANCE = 0.05;
      const active = annotations.find(
        (a) => Math.abs(currentTime - a.timestamp) <= TOLERANCE
      );

      if (active && active.id !== lastShownAnnotationRef.current) {
        lastShownAnnotationRef.current = active.id;
        try {
          const json = JSON.parse(active.canvasJSON);
          canvas.loadFromJSON(json).then(() => {
            canvas.renderAll();
          });
        } catch {
          // ignore
        }
      } else if (!active && lastShownAnnotationRef.current) {
        lastShownAnnotationRef.current = null;
        canvas.clear();
      }
    }, [currentTime, annotations]);

    useImperativeHandle(ref, () => ({
      toJSON: () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return null;
        return JSON.stringify(canvas.toJSON());
      },
      clear: () => {
        const canvas = fabricCanvasRef.current;
        if (canvas) {
          canvas.clear();
          lastShownAnnotationRef.current = null;
        }
      },
      hasObjects: () => {
        const canvas = fabricCanvasRef.current;
        return canvas ? canvas.getObjects().length > 0 : false;
      },
    }));

    const isDrawingMode = activeTool !== null;

    return (
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          pointerEvents: isDrawingMode ? 'auto' : 'none',
          zIndex: isDrawingMode ? 20 : 5,
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    );
  }
);

CanvasOverlay.displayName = 'CanvasOverlay';
export default CanvasOverlay;
