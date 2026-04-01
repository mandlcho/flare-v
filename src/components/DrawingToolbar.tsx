'use client';

import { ToolType } from '@/types';

interface Props {
  activeTool: ToolType | null;
  onToolChange: (tool: ToolType | null) => void;
  strokeColor: string;
  onColorChange: (color: string) => void;
  onSave: () => void;
  onClear: () => void;
  hasDrawing: boolean;
}

const tools: { id: ToolType; label: string; icon: string }[] = [
  { id: 'select', label: 'SEL', icon: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z' },
  { id: 'rect', label: 'RECT', icon: 'M3 3h18v18H3z' },
  { id: 'circle', label: 'CIRC', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  { id: 'arrow', label: 'ARR', icon: 'M5 19L19 5m0 0v10m0-10H9' },
  { id: 'text', label: 'TXT', icon: 'M4 6h16M8 6v14m8-14v14' },
  { id: 'freehand', label: 'DRAW', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
];

const colors = ['#EF4444', '#F97316', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6', '#FFFFFF'];

export default function DrawingToolbar({
  activeTool,
  onToolChange,
  strokeColor,
  onColorChange,
  onSave,
  onClear,
  hasDrawing,
}: Props) {
  return (
    <div className="flex items-center gap-1 border-2 border-zinc-800 bg-black px-2 py-1.5">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(activeTool === tool.id ? null : tool.id)}
          title={tool.label}
          className={`p-2 transition-colors border ${
            activeTool === tool.id
              ? 'border-orange-300 bg-orange-300 text-black'
              : 'border-transparent text-zinc-500 hover:text-orange-300 hover:border-orange-300/50'
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="square" strokeLinejoin="miter" d={tool.icon} />
          </svg>
        </button>
      ))}

      <div className="mx-2 h-6 w-0.5 bg-zinc-800" />

      <div className="flex items-center gap-1">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`h-5 w-5 border-2 transition-transform ${
              strokeColor === color ? 'border-white scale-125' : 'border-zinc-800'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="mx-2 h-6 w-0.5 bg-zinc-800" />

      <button
        onClick={onClear}
        className="border border-zinc-700 px-3 py-1.5 text-base font-bold uppercase tracking-wider text-zinc-500 hover:border-red-500 hover:text-red-500 transition-colors"
      >
        Clear
      </button>
      <button
        onClick={onSave}
        disabled={!hasDrawing}
        className="border-2 border-orange-300 bg-orange-300 px-3 py-1.5 text-base font-black uppercase tracking-wider text-black hover:bg-orange-300 hover:border-orange-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Save
      </button>
    </div>
  );
}
