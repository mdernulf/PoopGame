/**
 * Papperssilhuett-effekten: dilaterar siluetten, bygger en vit "saxklippt"
 * kant och en flerskiktad mjuk pappersskugga. Används runt alla större
 * ritningar i spelet.
 *
 * Exportar också vaxkrit-mönster + ritprimitiver (fillRoundRect, drawHandLine,
 * drawBrassFastener) som andra ritmoduler använder.
 *
 * `PAPER` är ett mutabelt inställningsobjekt som dev-panelen skriver till.
 */
import { ctx } from "./state.js";

export const PAPER = {
  playerEdge: 10,
  objectsEdge: 4.5,
  shadowOpacity: 0.5,
  softShadowOpacity: 0.06,
  shadowOffsetX: -3,
  shadowOffsetY: 0,
  softShadowOffsetX: 0.5,
  softShadowOffsetY: 3.5,
};

export let crayonPattern = null;
export function createCrayonPattern() {
  const pCanvas = document.createElement("canvas");
  pCanvas.width = 96;
  pCanvas.height = 96;
  const pCtx = pCanvas.getContext("2d");

  pCtx.strokeStyle = "rgba(255, 255, 255, 0.24)";
  pCtx.lineWidth = 2.2;
  for (let i = -96; i < 192; i += 6) {
    pCtx.beginPath();
    pCtx.moveTo(i, 0);
    pCtx.lineTo(i + 96, 96);
    pCtx.stroke();
  }

  pCtx.fillStyle = "rgba(44, 39, 36, 0.045)";
  for (let i = 0; i < 160; i++) {
    pCtx.fillRect((i * 37) % 96, (i * 53) % 96, 2, 2);
  }
  crayonPattern = ctx.createPattern(pCanvas, "repeat");
  return crayonPattern;
}

const cutoutCanvas = document.createElement("canvas");
const cutoutCtx = cutoutCanvas.getContext("2d");
const whiteMaskCanvas = document.createElement("canvas");
const whiteMaskCtx = whiteMaskCanvas.getContext("2d");
const shadowMaskCanvas = document.createElement("canvas");
const shadowMaskCtx = shadowMaskCanvas.getContext("2d");

/**
 * Ritar en figur som ett äkta, ojämnt saxklippt pappersurklipp med
 * kritvit ram & autentisk pappersskugga.
 */
export function drawWithPaperCutout(drawFn, boundsW = 220, boundsH = 220, originX = 110, originY = 110) {
  const w = Math.max(240, boundsW);
  const h = Math.max(240, boundsH);
  if (cutoutCanvas.width !== w || cutoutCanvas.height !== h) {
    cutoutCanvas.width = w;
    cutoutCanvas.height = h;
    whiteMaskCanvas.width = w;
    whiteMaskCanvas.height = h;
    shadowMaskCanvas.width = w;
    shadowMaskCanvas.height = h;
  }

  cutoutCtx.clearRect(0, 0, w, h);
  cutoutCtx.save();
  cutoutCtx.translate(originX, originY);
  drawFn(cutoutCtx);
  cutoutCtx.restore();

  whiteMaskCtx.clearRect(0, 0, w, h);
  whiteMaskCtx.globalCompositeOperation = "source-over";
  const radius = PAPER.objectsEdge;
  const steps = 32;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const snippedR = radius + Math.sin(a * 3) * 1.1 + Math.cos(a * 5) * 0.6;
    whiteMaskCtx.drawImage(cutoutCanvas, Math.cos(a) * snippedR, Math.sin(a) * snippedR);
  }
  whiteMaskCtx.globalCompositeOperation = "source-in";
  whiteMaskCtx.fillStyle = "#ffffff";
  whiteMaskCtx.fillRect(0, 0, w, h);
  whiteMaskCtx.globalCompositeOperation = "source-over";

  shadowMaskCtx.clearRect(0, 0, w, h);
  shadowMaskCtx.drawImage(whiteMaskCanvas, 0, 0);
  shadowMaskCtx.globalCompositeOperation = "source-in";
  shadowMaskCtx.fillStyle = "#3b332e";
  shadowMaskCtx.fillRect(0, 0, w, h);
  shadowMaskCtx.globalCompositeOperation = "source-over";

  ctx.save();
  ctx.globalAlpha = PAPER.softShadowOpacity;
  for (let s = 0; s < 6; s++) {
    const sa = (s / 6) * Math.PI * 2;
    ctx.drawImage(
      shadowMaskCanvas,
      -originX + PAPER.softShadowOffsetX + Math.cos(sa) * 3.5,
      -originY + PAPER.softShadowOffsetY + Math.sin(sa) * 3.5,
    );
  }
  ctx.globalAlpha = PAPER.shadowOpacity;
  ctx.drawImage(shadowMaskCanvas, -originX + PAPER.shadowOffsetX, -originY + PAPER.shadowOffsetY);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.drawImage(shadowMaskCanvas, -originX - 0.8, -originY - 0.8);
  ctx.drawImage(shadowMaskCanvas, -originX + 1.2, -originY + 1.2);
  ctx.restore();
  ctx.drawImage(whiteMaskCanvas, -originX, -originY);
  ctx.drawImage(cutoutCanvas, -originX, -originY);
}

export function drawHandLine(c, x1, y1, x2, y2, width = 3, color = "#2c2724") {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(x1, y1);
  const mx = (x1 + x2) * 0.5 + Math.sin(x1 + y1) * 1.5;
  const my = (y1 + y2) * 0.5 + Math.cos(x2 + y2) * 1.5;
  c.quadraticCurveTo(mx, my, x2, y2);
  c.stroke();
  c.restore();
}

export function fillRoundRect(c, x, y, w, h, r) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  c.beginPath();
  c.moveTo(x + rad, y);
  c.lineTo(x + w - rad, y);
  c.quadraticCurveTo(x + w, y, x + w, y + rad);
  c.lineTo(x + w, y + h - rad);
  c.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  c.lineTo(x + rad, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - rad);
  c.lineTo(x, y + rad);
  c.quadraticCurveTo(x, y, x + rad, y);
  c.closePath();
}

// Init kritmönstret direkt när modulen laddas (ctx finns p.g.a. state.js-importen).
createCrayonPattern();

export function drawBrassFastener(c, x, y, r = 4.2) {
  c.save();
  c.fillStyle = "#f4a261";
  c.strokeStyle = "#2c2724";
  c.lineWidth = 2;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  c.stroke();

  c.fillStyle = "#fff3b0";
  c.beginPath();
  c.arc(x - 1, y - 1, r * 0.38, 0, Math.PI * 2);
  c.fill();
  c.restore();
}
