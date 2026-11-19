/**
 * Insamlingsbara objekt (collectibles).
 * drawCollectible dispatcherar på item.type — stjärnor, ballonger,
 * skateboards, paraplyer, äpplen, magneter, godis.
 *
 * För att lägga till en ny collectible:
 *   1. Lägg till en ny type-sträng + dess ritkod här
 *   2. Lägg till spawn-logik i levels.js (spawnTimer-grenen i main)
 *   3. Lägg till kollisions-/plockupp-logik i main-loopen
 */
import { ctx, state, MAGNET_ICONS } from "./state.js";
import { drawWithPaperCutout, fillRoundRect, crayonPattern } from "./paper-cutout.js";

export function drawCollectible(item) {
  ctx.save();
  const bobY = Math.sin(state.wobbleTime * 5 + item.x * 0.02) * 6;
  ctx.translate(item.x, item.y + bobY);

  if (item.type === "balloon") {
    drawWithPaperCutout(
      (c) => {
        c.strokeStyle = "#2c2724";
        c.lineWidth = 2.6;

        // Ballongsnöre
        c.beginPath();
        c.moveTo(0, 18);
        c.quadraticCurveTo(6, 29, -3, 39);
        c.stroke();

        // Ballongkropp
        c.fillStyle = item.color || "#ff595e";
        c.beginPath();
        c.ellipse(0, -2, 16, 20, 0, 0, Math.PI * 2);
        c.fill();
        if (crayonPattern) {
          c.fillStyle = crayonPattern;
          c.fill();
        }
        c.stroke();

        // Ballongknut
        c.beginPath();
        c.moveTo(-4, 18);
        c.lineTo(4, 18);
        c.lineTo(0, 22);
        c.closePath();
        c.fill();
        c.stroke();

        // Ljusblänk
        c.fillStyle = "rgba(255,255,255,0.65)";
        c.beginPath();
        c.ellipse(-6, -9, 3.5, 6.5, -0.35, 0, Math.PI * 2);
        c.fill();
      },
      76,
      92,
      38,
      36,
    );
  } else if (item.type === "skateboard") {
    ctx.rotate(Math.sin(state.wobbleTime * 4) * 0.12);
    drawWithPaperCutout(
      (c) => {
        c.strokeStyle = "#2c2724";
        c.lineWidth = 2.8;

        // Skateboard-bräda
        c.fillStyle = "#ff9f1c";
        c.beginPath();
        c.moveTo(-26, -3);
        c.quadraticCurveTo(-32, -8, -28, -11);
        c.lineTo(28, -11);
        c.quadraticCurveTo(32, -8, 26, -3);
        c.closePath();
        c.fill();
        if (crayonPattern) {
          c.fillStyle = crayonPattern;
          c.fill();
        }
        c.stroke();

        // Flamma / stjärndekor
        c.fillStyle = "#ff595e";
        c.beginPath();
        c.arc(0, -7, 4, 0, Math.PI * 2);
        c.fill();

        // Hjul
        c.fillStyle = "#4cc9f0";
        c.beginPath();
        c.arc(-16, 4, 6, 0, Math.PI * 2);
        c.arc(16, 4, 6, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(-16, 4, 2, 0, Math.PI * 2);
        c.arc(16, 4, 2, 0, Math.PI * 2);
        c.fill();
      },
      90,
      56,
      45,
      30,
    );
  } else if (item.type === "umbrella") {
    ctx.rotate(Math.sin(state.wobbleTime * 3.5) * 0.14);
    drawWithPaperCutout(
      (c) => {
        c.strokeStyle = "#2c2724";
        c.lineWidth = 2.8;

        // Paraplykrycka
        c.beginPath();
        c.moveTo(0, -24);
        c.lineTo(0, 14);
        c.arc(-5, 14, 5, 0, Math.PI, false);
        c.stroke();

        // Paraplyskärm
        c.fillStyle = "#9b5de5";
        c.beginPath();
        c.arc(0, -4, 24, Math.PI, 0, false);
        c.quadraticCurveTo(16, -9, 8, -4);
        c.quadraticCurveTo(0, -9, -8, -4);
        c.quadraticCurveTo(-16, -9, -24, -4);
        c.closePath();
        c.fill();
        if (crayonPattern) {
          c.fillStyle = crayonPattern;
          c.fill();
        }
        c.stroke();
      },
      80,
      74,
      40,
      38,
    );
  } else if (item.type === "apple") {
    drawWithPaperCutout(
      (c) => {
        c.strokeStyle = "#2c2724";
        c.lineWidth = 2.6;

        c.fillStyle = "#80ed99";
        c.beginPath();
        c.arc(-5, 2, 13, 0, Math.PI * 2);
        c.arc(5, 2, 13, 0, Math.PI * 2);
        c.fill();
        if (crayonPattern) {
          c.fillStyle = crayonPattern;
          c.fill();
        }
        c.stroke();

        // Stjälk & blad
        c.beginPath();
        c.moveTo(0, -9);
        c.lineTo(3, -19);
        c.stroke();

        c.fillStyle = "#38b000";
        c.beginPath();
        c.ellipse(9, -16, 7, 4, -0.3, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      },
      66,
      66,
      33,
      36,
    );
  } else if (item.type === "candy") {
    // Handritad polkagris-klubba / godisbit i Godislandet!
    ctx.rotate(Math.sin(state.wobbleTime * 4 + item.x * 0.01) * 0.16);
    drawWithPaperCutout(
      (c) => {
        c.strokeStyle = "#2c2724";
        c.lineWidth = 2.6;

        if (item.candyKind === "wrapped") {
          // Inslagen godiskaramell
          c.fillStyle = item.color || "#ff595e";
          c.beginPath();
          c.moveTo(-22, -9);
          c.lineTo(-12, 0);
          c.lineTo(-22, 9);
          c.closePath();
          c.moveTo(22, -9);
          c.lineTo(12, 0);
          c.lineTo(22, 9);
          c.closePath();
          c.fill();
          c.stroke();

          c.beginPath();
          c.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2);
          c.fill();
          if (crayonPattern) {
            c.fillStyle = crayonPattern;
            c.fill();
          }
          c.stroke();

          c.strokeStyle = "#ffffff";
          c.lineWidth = 2.5;
          c.beginPath();
          c.moveTo(-5, -8);
          c.lineTo(-5, 8);
          c.moveTo(5, -8);
          c.lineTo(5, 8);
          c.stroke();
        } else {
          // Virvelklubba på pinne
          c.fillStyle = "#ffffff";
          fillRoundRect(c, -2.5, 4, 5, 22, 2);
          c.fill();
          c.stroke();

          c.fillStyle = item.color || "#ff758f";
          c.beginPath();
          c.arc(0, -4, 15, 0, Math.PI * 2);
          c.fill();
          if (crayonPattern) {
            c.fillStyle = crayonPattern;
            c.fill();
          }
          c.stroke();

          c.strokeStyle = "#ffffff";
          c.lineWidth = 2.4;
          c.beginPath();
          c.arc(0, -4, 9, 0.2, Math.PI * 1.6);
          c.stroke();
        }
      },
      68,
      72,
      34,
      34,
    );
  } else {
    // Stjärna
    ctx.rotate(Math.sin(state.wobbleTime * 4 + item.x * 0.01) * 0.16);
    drawWithPaperCutout(
      (c) => {
        c.fillStyle = "#ffd166";
        c.strokeStyle = "#2c2724";
        c.lineWidth = 2.8;
        c.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? 19 : 8.5;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          if (i === 0) c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        c.closePath();
        c.fill();
        if (crayonPattern) {
          c.fillStyle = crayonPattern;
          c.fill();
        }
        c.stroke();

        // Glatt litet ansikte i stjärnan
        c.fillStyle = "#2c2724";
        c.beginPath();
        c.arc(-4, -1, 1.8, 0, Math.PI * 2);
        c.arc(4, -1, 1.8, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.arc(0, 2, 3.5, 0.1 * Math.PI, 0.9 * Math.PI);
        c.stroke();
      },
      68,
      68,
      34,
      34,
    );
  }
  ctx.restore();
}

