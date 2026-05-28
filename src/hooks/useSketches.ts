import { useState, useEffect } from 'react';

export type SketchType = 'SKETCH_01' | 'SKETCH_02' | 'SKETCH_03' | 'SKETCH_04' | 'NONE';

export function useSketches() {
  const [activeSketch, setActiveSketch] = useState<SketchType>('NONE');

  const triggerSketch = (sketch: SketchType, duration: number) => {
    setActiveSketch(sketch);
    // Auto-limpeza após o tempo da animação
    setTimeout(() => setActiveSketch('NONE'), duration);
  };

  return { activeSketch, triggerSketch };
}