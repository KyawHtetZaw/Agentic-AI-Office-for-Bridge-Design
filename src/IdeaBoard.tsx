import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

/** A decorative, fictional concept sketch. No engineering values or calculations. */
export function IdeaBoard() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f4f0dd';
    ctx.fillRect(0, 0, 1024, 384);
    ctx.fillStyle = '#53786a';
    ctx.font = 'bold 29px sans-serif';
    ctx.fillText('THE NEXT BIG LITTLE BRIDGE', 52, 58);
    ctx.font = '16px monospace';
    ctx.fillStyle = '#8c9e86';
    ctx.fillText('WILLOW CROSSING  /  CONCEPT 03', 52, 92);
    ctx.strokeStyle = '#678f82';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(70, 175); ctx.lineTo(660, 175);
    ctx.moveTo(70, 194); ctx.lineTo(660, 194);
    for (const x of [160, 350, 550]) {
      ctx.moveTo(x, 194); ctx.lineTo(x, 264);
      ctx.moveTo(x - 25, 264); ctx.lineTo(x + 25, 264);
    }
    ctx.stroke();
    ctx.strokeStyle = '#c3a062';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 181);
    ctx.bezierCurveTo(200, 220, 280, 148, 370, 181);
    ctx.bezierCurveTo(480, 215, 550, 155, 650, 181);
    ctx.stroke();
    ctx.font = '15px monospace';
    ctx.fillStyle = '#8b9c82';
    ctx.fillText('pretend tendon path', 335, 240);
    ctx.fillStyle = '#e8d89f'; ctx.fillRect(747, 129, 207, 120);
    ctx.fillStyle = '#8c8559';
    ctx.font = '21px monospace';
    ctx.fillText('ideas + coffee', 759, 164);
    ctx.fillText('= possibilities', 751, 201);
    ctx.font = '17px monospace';
    ctx.fillText('keep imagining :)', 746, 276);
    ctx.fillStyle = '#849681';
    ctx.font = '16px monospace';
    ctx.fillText('FICTIONAL SKETCH ONLY  ·  NO REAL ENGINEERING', 52, 341);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[0, 0, .085]}><planeGeometry args={[3.13, 1.15]} /><meshBasicMaterial map={texture} /></mesh>;
}
