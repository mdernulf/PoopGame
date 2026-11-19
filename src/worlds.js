/**
 * Bakgrundsvärldar + sjö + markgeometri + initial clouds/props-spawn.
 *
 * Här bor allt som ritar själva miljön: himmel, kullar, propser,
 * sjöar och den dekorativa godiskiosken i slutet. Lägg till en ny värld:
 *   1. Lägg en post i WORLDS-arrayen i state.js (id, färger, propTypes)
 *   2. Lägg till en gren här i drawWorldBackground-switchen för unika detaljer
 *   3. Lägg till en knapp i #worldPicker i index.html med rätt data-world-index
 */
import { WORLDS, canvas, ctx, state } from "./state.js";
import { crayonPattern, fillRoundRect } from "./paper-cutout.js";

/**
 * =========================================================================
 * 5. BAKGRUNDSVÄRLDAR, HANDRITAD SJÖ & ROLIG GODISKIOSK
 * =========================================================================
 */
export function getGroundY(h) {
  return Math.floor(h * 0.78);
}

export function resizeCanvas() {
  const oldGround = getGroundY(canvas.height || window.innerHeight);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const newGround = getGroundY(canvas.height);
  if (state.player.isGrounded) {
    state.player.y = newGround;
  } else {
    state.player.y += newGround - oldGround;
  }
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

export function drawWorldBackground(width, height, groundY) {
  const world = WORLDS[state.worldIndex];

  // 1. Vaxkrit-himmel + skissbokslinjer
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, world.skyTop);
  skyGrad.addColorStop(1, world.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, groundY);
  if (crayonPattern) {
    ctx.fillStyle = crayonPattern;
    ctx.fillRect(0, 0, width, groundY);
  }

  ctx.strokeStyle = "rgba(130, 160, 200, 0.14)";
  ctx.lineWidth = 1;
  for (let ly = 36; ly < groundY; ly += 32) {
    ctx.beginPath();
    ctx.moveTo(0, ly);
    ctx.lineTo(width, ly);
    ctx.stroke();
  }

  // 2. Sol / Måne fasttejpad i skissboken (klickbar!)
  ctx.save();
  ctx.translate(width - 110, 95);
  const sunScale = state.sunSmileTimer > 0 ? 1 + Math.sin(state.sunSmileTimer * 18) * 0.12 : 1;
  ctx.scale(sunScale, sunScale);
  drawWithPaperCutout(
    (c) => {
      c.fillStyle = state.sunSmileTimer > 0 ? "#ffbe0b" : "#ffd166";
      c.strokeStyle = "#2c2724";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(0, 0, 32, 0, Math.PI * 2);
      c.fill();
      if (crayonPattern) {
        c.fillStyle = crayonPattern;
        c.fill();
      }
      c.stroke();

      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + state.wobbleTime * (state.sunSmileTimer > 0 ? 1.8 : 0.2);
        c.beginPath();
        c.moveTo(Math.cos(a) * 38, Math.sin(a) * 38);
        c.lineTo(Math.cos(a) * 48, Math.sin(a) * 48);
        c.stroke();
      }

      // Glatt ansikte på solen (extra glatt när man petar på den!)
      c.fillStyle = "#2c2724";
      c.beginPath();
      c.arc(-10, -6, 2.6, 0, Math.PI * 2);
      c.fill();
      if (state.sunSmileTimer > 0) {
        // Blinkar med ena ögat!
        c.beginPath();
        c.moveTo(6, -6);
        c.lineTo(14, -6);
        c.stroke();
        c.fillStyle = "#ff758f";
        c.beginPath();
        c.arc(-15, 2, 4, 0, Math.PI * 2);
        c.arc(15, 2, 4, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.arc(0, 3, 12, 0.1 * Math.PI, 0.9 * Math.PI);
        c.stroke();
      } else {
        c.beginPath();
        c.arc(10, -6, 2.6, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.arc(0, 3, 8, 0.15 * Math.PI, 0.85 * Math.PI);
        c.stroke();
      }
    },
    120,
    120,
    60,
    60,
  );

  ctx.fillStyle = "rgba(244, 226, 156, 0.85)";
  ctx.strokeStyle = "rgba(90, 82, 76, 0.45)";
  ctx.lineWidth = 1.5;
  ctx.fillRect(-24, -42, 48, 14);
  ctx.strokeRect(-24, -42, 48, 14);
  ctx.restore();

  // 3. Fjärran berg med blyertsskuggning
  ctx.save();
  ctx.fillStyle = "#e9ecef";
  ctx.strokeStyle = "#2c2724";
  ctx.lineWidth = 2.5;
  const mScroll = (state.worldDistance * 0.12) % 400;
  for (let mx = -400; mx < width + 400; mx += 400) {
    const bx = mx - mScroll;
    ctx.beginPath();
    ctx.moveTo(bx, groundY);
    ctx.lineTo(bx + 120, groundY - 170);
    ctx.lineTo(bx + 240, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bx + 180, groundY);
    ctx.lineTo(bx + 300, groundY - 135);
    ctx.lineTo(bx + 420, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
  // 4. Moln i pappersurklipp (klickbara!)
  for (const cloud of state.clouds) {
    ctx.save();
    const cBounce = cloud.bounceTimer > 0 ? Math.sin(cloud.bounceTimer * 25) * 6 : 0;
    ctx.translate(cloud.x, cloud.y + cBounce);
    drawWithPaperCutout(
      (c) => {
        c.fillStyle = cloud.bounceTimer > 0 ? "#e0fbfc" : "#ffffff";
        c.strokeStyle = "#2c2724";
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(-22, 4, 18, 0, Math.PI * 2);
        c.arc(0, -4, 24, 0, Math.PI * 2);
        c.arc(24, 4, 18, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      },
      110,
      74,
      55,
      42,
    );
    ctx.restore();
  }

  // 5. Mjuka kullar i mellangrunden
  ctx.save();
  ctx.fillStyle = world.hillColor;
  ctx.strokeStyle = "#2c2724";
  ctx.lineWidth = 3;
  const hScroll = (state.worldDistance * 0.35) % 480;
  for (let hx = -480; hx < width + 480; hx += 480) {
    const x0 = hx - hScroll;
    ctx.beginPath();
    ctx.moveTo(x0, groundY);
    ctx.quadraticCurveTo(x0 + 140, groundY - 95, x0 + 280, groundY);
    ctx.quadraticCurveTo(x0 + 380, groundY - 65, x0 + 480, groundY);
    ctx.closePath();
    ctx.fill();
    if (crayonPattern) {
      ctx.fillStyle = crayonPattern;
      ctx.fill();
      ctx.fillStyle = world.hillColor;
    }
    ctx.stroke();
  }
  ctx.restore();

  // 6. Världsspecifika handritade pappersbyggnader & träd
  for (const prop of state.bgElements) {
    if (prop.worldId !== world.id) continue;
    ctx.save();
    ctx.translate(prop.x, groundY);
    drawWithPaperCutout(
      (c) => {
        c.strokeStyle = "#2c2724";
        c.lineWidth = 2.8;
        if (prop.type === "castle") {
          c.fillStyle = "#cdb4db";
          fillRoundRect(c, -45, -135, 90, 135, 6);
          c.fill();
          c.stroke();
          c.fillStyle = "#ffafcc";
          c.beginPath();
          c.moveTo(-52, -135);
          c.lineTo(0, -185);
          c.lineTo(52, -135);
          c.closePath();
          c.fill();
          c.stroke();
          c.fillStyle = "#7f4f24";
          c.beginPath();
          c.arc(0, 0, 22, Math.PI, 0);
          c.fill();
          c.stroke();
        } else if (prop.type === "mushroom") {
          c.fillStyle = "#fff3b0";
          fillRoundRect(c, -18, -60, 36, 60, 8);
          c.fill();
          c.stroke();
          c.fillStyle = "#ff595e";
          c.beginPath();
          c.arc(0, -60, 46, Math.PI, 0);
          c.closePath();
          c.fill();
          c.stroke();
          c.fillStyle = "#ffffff";
          c.beginPath();
          c.arc(-18, -78, 7, 0, Math.PI * 2);
          c.arc(14, -84, 8, 0, Math.PI * 2);
          c.arc(4, -68, 6, 0, Math.PI * 2);
          c.fill();
        } else if (prop.type === "duck_pond") {
          // Liten handritad ankdamm i Parken
          c.fillStyle = "#4cc9f0";
          c.beginPath();
          c.ellipse(0, -8, 56, 16, 0, 0, Math.PI * 2);
          c.fill();
          if (crayonPattern) {
            c.fillStyle = crayonPattern;
            c.fill();
          }
          c.stroke();

          // Liten anka på dammen
          c.fillStyle = "#ffd166";
          c.beginPath();
          c.ellipse(-10, -14, 11, 6, 0, 0, Math.PI * 2);
          c.arc(-18, -21, 5.5, 0, Math.PI * 2);
          c.fill();
          c.stroke();
        } else if (prop.type === "park_bench") {
          // Parkbänk + gammaldags lyktstolpe
          c.fillStyle = "#9c6644";
          fillRoundRect(c, -36, -34, 72, 10, 4);
          c.fill();
          c.stroke();
          fillRoundRect(c, -36, -20, 72, 8, 3);
          c.fill();
          c.stroke();
          fillRoundRect(c, -30, -20, 6, 20, 2);
          c.fill();
          c.stroke();
          fillRoundRect(c, 24, -20, 6, 20, 2);
          c.fill();
          c.stroke();

          c.fillStyle = "#3d405b";
          fillRoundRect(c, 44, -110, 6, 110, 3);
          c.fill();
          c.stroke();
          c.fillStyle = "#ffd166";
          c.beginPath();
          c.arc(47, -118, 12, 0, Math.PI * 2);
          c.fill();
          c.stroke();
        } else if (prop.type === "traffic_light") {
          // Trafikljus & postlåda i Staden
          c.fillStyle = "#495057";
          fillRoundRect(c, -4, -95, 8, 95, 3);
          c.fill();
          c.stroke();
          fillRoundRect(c, -16, -135, 32, 56, 8);
          c.fill();
          c.stroke();
          c.fillStyle = "#ff595e";
          c.beginPath();
          c.arc(0, -121, 6.5, 0, Math.PI * 2);
          c.fill();
          c.stroke();
          c.fillStyle = "#ffd166";
          c.beginPath();
          c.arc(0, -107, 6.5, 0, Math.PI * 2);
          c.fill();
          c.stroke();
          c.fillStyle = "#06d6a0";
          c.beginPath();
          c.arc(0, -93, 6.5, 0, Math.PI * 2);
          c.fill();
          c.stroke();
        } else if (prop.type === "ball_pit") {
          // Färgglatt bollhav i Leklandet
          c.fillStyle = "#ff758f";
          fillRoundRect(c, -52, -32, 104, 32, 8);
          c.fill();
          c.stroke();
          const ballCols = ["#ffd166", "#4cc9f0", "#06d6a0", "#c77dff", "#ff9f1c"];
          for (let b = 0; b < 9; b++) {
            c.fillStyle = ballCols[b % ballCols.length];
            c.beginPath();
            c.arc(-38 + b * 9.5, -34 - (b % 2) * 6, 8, 0, Math.PI * 2);
            c.fill();
            c.stroke();
          }
        } else if (prop.type === "blocks") {
          // Staplade leksaksklossar i Leklandet
          c.fillStyle = "#4cc9f0";
          fillRoundRect(c, -42, -38, 38, 38, 6);
          c.fill();
          c.stroke();
          c.fillStyle = "#ffd166";
          fillRoundRect(c, 2, -38, 38, 38, 6);
          c.fill();
          c.stroke();
          c.fillStyle = "#ff595e";
          fillRoundRect(c, -20, -76, 38, 38, 6);
          c.fill();
          c.stroke();
        } else if (prop.type === "balloon_cart") {
          // Ballongvagn på Tivolit
          c.fillStyle = "#ff9f1c";
          fillRoundRect(c, -34, -44, 68, 32, 8);
          c.fill();
          c.stroke();
          c.fillStyle = "#3d405b";
          c.beginPath();
          c.arc(-18, -10, 10, 0, Math.PI * 2);
          c.arc(18, -10, 10, 0, Math.PI * 2);
          c.fill();
          c.stroke();

          const cartCols = ["#ff595e", "#ffd166", "#4cc9f0", "#c77dff"];
          for (let b = 0; b < 4; b++) {
            const bx = -22 + b * 15;
            const by = -95 - (b % 2) * 14;
            c.beginPath();
            c.moveTo(0, -44);
            c.lineTo(bx, by + 14);
            c.stroke();
            c.fillStyle = cartCols[b];
            c.beginPath();
            c.ellipse(bx, by, 12, 15, 0, 0, Math.PI * 2);
            c.fill();
            c.stroke();
          }
        } else if (prop.type === "bakery" || prop.type === "apartment") {
          c.fillStyle = prop.type === "bakery" ? "#ffd166" : "#a8dadc";
          fillRoundRect(c, -48, -145, 96, 145, 6);
          c.fill();
          c.stroke();
          c.fillStyle = "#ffffff";
          fillRoundRect(c, -30, -122, 22, 24, 4);
          c.fill();
          c.stroke();
          fillRoundRect(c, 8, -122, 22, 24, 4);
          c.fill();
          c.stroke();
          c.fillStyle = "#ff595e";
          fillRoundRect(c, -52, -62, 104, 16, 5);
          c.fill();
          c.stroke();
        } else if (prop.type === "ferris_wheel") {
          c.beginPath();
          c.moveTo(-36, 0);
          c.lineTo(0, -110);
          c.lineTo(36, 0);
          c.stroke();
          c.beginPath();
          c.arc(0, -110, 62, 0, Math.PI * 2);
          c.stroke();
          for (let k = 0; k < 8; k++) {
            const ang = (k / 8) * Math.PI * 2 + state.wobbleTime * 0.4;
            const gx = Math.cos(ang) * 62;
            const gy = -110 + Math.sin(ang) * 62;
            c.beginPath();
            c.moveTo(0, -110);
            c.lineTo(gx, gy);
            c.stroke();
            c.fillStyle = k % 2 === 0 ? "#ffd166" : "#ff595e";
            c.beginPath();
            c.arc(gx, gy, 8, 0, Math.PI * 2);
            c.fill();
            c.stroke();
          }
        } else if (prop.type === "circus_tent" || prop.type === "slide") {
          c.fillStyle = "#ff595e";
          c.beginPath();
          c.moveTo(-58, 0);
          c.lineTo(-48, -95);
          c.lineTo(0, -145);
          c.lineTo(48, -95);
          c.lineTo(58, 0);
          c.closePath();
          c.fill();
          c.stroke();
          c.fillStyle = "#ffd166";
          c.beginPath();
          c.moveTo(-24, 0);
          c.lineTo(0, -145);
          c.lineTo(24, 0);
          c.closePath();
          c.fill();
          c.stroke();
        } else if (prop.type === "gingerbread_house") {
          // Pepparkakshus med glasyr & nonstop i Godislandet!
          c.fillStyle = "#b07d62";
          fillRoundRect(c, -46, -115, 92, 115, 8);
          c.fill();
          c.stroke();
          c.fillStyle = "#ff758f";
          c.beginPath();
          c.moveTo(-54, -115);
          c.lineTo(0, -165);
          c.lineTo(54, -115);
          c.closePath();
          c.fill();
          c.stroke();
          // Vit glasyr på taket
          c.strokeStyle = "#ffffff";
          c.lineWidth = 5;
          c.beginPath();
          c.moveTo(-50, -115);
          c.lineTo(0, -161);
          c.lineTo(50, -115);
          c.stroke();
          c.strokeStyle = "#2c2724";
          c.lineWidth = 2.8;
          // Godisdörr & fönster
          c.fillStyle = "#ffd166";
          c.beginPath();
          c.arc(0, 0, 20, Math.PI, 0);
          c.fill();
          c.stroke();
          c.fillStyle = "#4cc9f0";
          c.beginPath();
          c.arc(-22, -75, 10, 0, Math.PI * 2);
          c.arc(22, -75, 10, 0, Math.PI * 2);
          c.fill();
          c.stroke();
        } else if (prop.type === "lollipop_tree") {
          // Jätte-klubba som träd i Godislandet!
          c.fillStyle = "#ffffff";
          fillRoundRect(c, -7, -95, 14, 95, 4);
          c.fill();
          c.stroke();
          c.fillStyle = "#ff595e";
          c.beginPath();
          c.arc(0, -125, 38, 0, Math.PI * 2);
          c.fill();
          c.stroke();
          c.strokeStyle = "#ffffff";
          c.lineWidth = 5;
          c.beginPath();
          c.arc(0, -125, 22, 0.2, Math.PI * 1.65);
          c.stroke();
          c.beginPath();
          c.arc(0, -125, 10, 0.4, Math.PI * 1.8);
          c.stroke();
        } else if (prop.type === "candy_cane") {
          // Polkagrisstång i Godislandet!
          c.strokeStyle = "#ff595e";
          c.lineWidth = 14;
          c.lineCap = "round";
          c.beginPath();
          c.moveTo(0, -4);
          c.lineTo(0, -115);
          c.arc(18, -115, 18, Math.PI, 0, false);
          c.stroke();
          c.strokeStyle = "#ffffff";
          c.lineWidth = 14;
          c.setLineDash([12, 14]);
          c.stroke();
          c.setLineDash([]);
        } else if (prop.type === "unicorn_statue") {
          // Magisk enhörning i papper & guldhorn i Magic Unicorn World!
          c.fillStyle = "#ffffff";
          fillRoundRect(c, -26, -54, 48, 26, 12);
          c.fill();
          c.stroke();
          // Ben
          fillRoundRect(c, -20, -30, 7, 30, 3);
          c.fill();
          c.stroke();
          fillRoundRect(c, 10, -30, 7, 30, 3);
          c.fill();
          c.stroke();
          // Hals & huvud
          c.beginPath();
          c.moveTo(-22, -46);
          c.lineTo(-34, -82);
          c.lineTo(-16, -84);
          c.lineTo(-10, -50);
          c.closePath();
          c.fill();
          c.stroke();
          c.beginPath();
          c.ellipse(-34, -84, 15, 10, -0.25, 0, Math.PI * 2);
          c.fill();
          c.stroke();
          // Regnbågsman & svans
          const maneCols = ["#ff595e", "#ffd166", "#06d6a0", "#4cc9f0", "#c77dff"];
          maneCols.forEach((mc, idx) => {
            c.fillStyle = mc;
            c.beginPath();
            c.arc(-16 + idx * 1.5, -78 + idx * 6, 5.5, 0, Math.PI * 2);
            c.arc(24 + idx * 2, -46 + idx * 4, 6, 0, Math.PI * 2);
            c.fill();
          });
          // Guldhorn!
          c.fillStyle = "#ffd166";
          c.beginPath();
          c.moveTo(-38, -92);
          c.lineTo(-48, -116);
          c.lineTo(-30, -94);
          c.closePath();
          c.fill();
          c.stroke();
          // Glatt öga
          c.fillStyle = "#2c2724";
          c.beginPath();
          c.arc(-38, -84, 2.2, 0, Math.PI * 2);
          c.fill();
        } else if (prop.type === "rainbow_arch") {
          // Stor vaxkrit-regnbåge i Magic Unicorn World!
          const rb = ["#ff595e", "#ff9f1c", "#ffd166", "#06d6a0", "#4cc9f0", "#c77dff"];
          rb.forEach((col, idx) => {
            c.strokeStyle = col;
            c.lineWidth = 7;
            c.beginPath();
            c.arc(0, 0, 74 - idx * 7, Math.PI, 0);
            c.stroke();
          });
          c.strokeStyle = "#2c2724";
          c.lineWidth = 2.6;
          c.beginPath();
          c.arc(0, 0, 78, Math.PI, 0);
          c.stroke();
          // Moln vid fötterna
          c.fillStyle = "#ffffff";
          c.beginPath();
          c.arc(-68, -6, 16, 0, Math.PI * 2);
          c.arc(-52, -8, 18, 0, Math.PI * 2);
          c.arc(52, -8, 18, 0, Math.PI * 2);
          c.arc(68, -6, 16, 0, Math.PI * 2);
          c.fill();
          c.stroke();
        } else if (prop.type === "crystal_castle") {
          // Pastell-slott med glittrande spira i Magic Unicorn World!
          c.fillStyle = "#ffccd5";
          fillRoundRect(c, -44, -130, 88, 130, 8);
          c.fill();
          c.stroke();
          c.fillStyle = "#bde0fe";
          c.beginPath();
          c.moveTo(-50, -130);
          c.lineTo(0, -185);
          c.lineTo(50, -130);
          c.closePath();
          c.fill();
          c.stroke();
          c.fillStyle = "#ffd166";
          c.beginPath();
          c.arc(0, -192, 8, 0, Math.PI * 2);
          c.fill();
          c.stroke();
          c.fillStyle = "#cdb4db";
          c.beginPath();
          c.arc(0, 0, 22, Math.PI, 0);
          c.fill();
          c.stroke();
        } else {
          // Lummigt vaxkrit-träd
          c.fillStyle = "#7f4f24";
          fillRoundRect(c, -12, -75, 24, 75, 4);
          c.fill();
          c.stroke();
          c.fillStyle = "#52b788";
          c.beginPath();
          c.arc(-22, -92, 28, 0, Math.PI * 2);
          c.arc(22, -92, 28, 0, Math.PI * 2);
          c.arc(0, -118, 34, 0, Math.PI * 2);
          c.fill();
          if (crayonPattern) {
            c.fillStyle = crayonPattern;
            c.fill();
          }
          c.stroke();
        }
      },
      160,
      210,
      80,
      195,
    );
    ctx.restore();
  }

  // 7. Roliga Godiskiosken med glad vinkande kioskförsäljare vid målgång!
  if (state.candyKiosk) {
    const kx = state.candyKiosk.x;
    ctx.save();
    ctx.translate(kx, groundY);
    drawWithPaperCutout(
      (c) => {
        c.strokeStyle = "#2c2724";
        c.lineWidth = 3;

        // Kioskens bakvägg
        c.fillStyle = "#fff3b0";
        fillRoundRect(c, -68, -145, 136, 145, 8);
        c.fill();
        c.stroke();

        // Öppen lucka
        c.fillStyle = "#2c2724";
        fillRoundRect(c, -48, -115, 96, 56, 6);
        c.fill();

        // Glad kioskförsäljare i luckan som vinkar!
        const wave = Math.sin(state.wobbleTime * 8) * 0.35;
        // Kropp / skjorta
        c.fillStyle = "#4cc9f0";
        c.beginPath();
        c.arc(0, -58, 22, Math.PI, 0);
        c.fill();
        c.stroke();

        // Röd fluga
        c.fillStyle = "#ff595e";
        c.beginPath();
        c.moveTo(0, -68);
        c.lineTo(-8, -73);
        c.lineTo(-8, -63);
        c.closePath();
        c.moveTo(0, -68);
        c.lineTo(8, -73);
        c.lineTo(8, -63);
        c.closePath();
        c.fill();

        // Huvud
        c.fillStyle = "#ffe5d9";
        c.beginPath();
        c.arc(0, -86, 16, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        // Vit kioskhatt
        c.fillStyle = "#ffffff";
        fillRoundRect(c, -14, -108, 28, 10, 4);
        c.fill();
        c.stroke();

        // Glada ögon, rosiga kinder & brett leende
        c.fillStyle = "#ff758f";
        c.beginPath();
        c.arc(-8, -83, 3.2, 0, Math.PI * 2);
        c.arc(8, -83, 3.2, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#2c2724";
        c.beginPath();
        c.arc(-5, -88, 2, 0, Math.PI * 2);
        c.arc(5, -88, 2, 0, Math.PI * 2);
        c.fill();

        c.beginPath();
        c.arc(0, -83, 7, 0.1 * Math.PI, 0.9 * Math.PI);
        c.stroke();

        // Vinkande hand!
        c.save();
        c.translate(26, -72);
        c.rotate(wave);
        c.fillStyle = "#ffe5d9";
        c.beginPath();
        c.arc(0, -14, 6.5, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.restore();

        // Godisburkar på disken
        c.fillStyle = "#ff758f";
        fillRoundRect(c, -52, -74, 14, 16, 4);
        c.fill();
        c.stroke();
        c.fillStyle = "#06d6a0";
        fillRoundRect(c, 38, -74, 14, 16, 4);
        c.fill();
        c.stroke();

        // Kioskdisken & skylten "GODIS"
        c.fillStyle = "#ff758f";
        fillRoundRect(c, -74, -58, 148, 58, 6);
        c.fill();
        c.stroke();

        c.fillStyle = "#ffffff";
        fillRoundRect(c, -46, -46, 92, 28, 6);
        c.fill();
        c.stroke();

        c.fillStyle = "#2c2724";
        c.font = "bold 18px sans-serif";
        c.textAlign = "center";
        c.fillText("GODIS 🍭", 0, -26);

        // Randig markis
        for (let s = 0; s < 6; s++) {
          c.fillStyle = s % 2 === 0 ? "#ff595e" : "#ffffff";
          fillRoundRect(c, -76 + s * 25.3, -158, 25.3, 22, 5);
          c.fill();
          c.stroke();
        }

        // Målflagga på taket
        c.beginPath();
        c.moveTo(0, -158);
        c.lineTo(0, -198);
        c.stroke();
        c.fillStyle = "#ffd166";
        c.beginPath();
        c.moveTo(0, -198);
        c.lineTo(36, -186);
        c.lineTo(0, -174);
        c.closePath();
        c.fill();
        c.stroke();
      },
      190,
      230,
      95,
      210,
    );
    ctx.restore();
  }

  // 8. Marken + Handritade sjöar att simma i!
  ctx.save();
  ctx.fillStyle = world.groundColor;
  ctx.fillRect(0, groundY, width, height - groundY);
  if (crayonPattern) {
    ctx.fillStyle = crayonPattern;
    ctx.fillRect(0, groundY, width, height - groundY);
  }

  // Rita marklinje där det INTE är sjö
  ctx.strokeStyle = "#2c2724";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(width, groundY);
  ctx.stroke();

  // Rita varje sjö utskuren i marken
  const lakeDepth = Math.min(130, (height - groundY) * 0.72);
  for (const lake of state.lakes) {
    if (lake.x + lake.width < -50 || lake.x > width + 50) continue;

    // Vaxkrit-blått sjövatten
    ctx.fillStyle = "#4cc9f0";
    ctx.beginPath();
    ctx.moveTo(lake.x, groundY);
    ctx.quadraticCurveTo(lake.x + 25, groundY + lakeDepth, lake.x + 80, groundY + lakeDepth);
    ctx.lineTo(lake.x + lake.width - 80, groundY + lakeDepth);
    ctx.quadraticCurveTo(lake.x + lake.width - 25, groundY + lakeDepth, lake.x + lake.width, groundY);
    ctx.closePath();
    ctx.fill();
    if (crayonPattern) {
      ctx.fillStyle = crayonPattern;
      ctx.fill();
    }

    // Sjöbotten-kontur
    ctx.strokeStyle = "#2c2724";
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Vågor på vattenytan
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let wx = lake.x + 12; wx <= lake.x + lake.width - 12; wx += 24) {
      const wy = groundY + Math.sin(state.wobbleTime * 5 + wx * 0.05) * 4;
      if (wx === lake.x + 12) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.stroke();

    // Små pappersfiskar nere i vattnet
    for (let f = 0; f < 3; f++) {
      const fx = lake.x + 140 + f * 220 + Math.sin(state.wobbleTime * 2 + f) * 24;
      const fy = groundY + lakeDepth * 0.55 + (f % 2 === 0 ? -12 : 12);
      if (fx > lake.x + 40 && fx < lake.x + lake.width - 40) {
        ctx.fillStyle = f % 2 === 0 ? "#ff9f1c" : "#ff758f";
        ctx.strokeStyle = "#2c2724";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 11, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fx + 10, fy);
        ctx.lineTo(fx + 17, fy - 5);
        ctx.lineTo(fx + 17, fy + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}
export function initCloudsAndProps() {
  state.clouds = [];
  for (let i = 0; i < 6; i++) {
    state.clouds.push({
      x: i * 260 + Math.random() * 120,
      y: 65 + Math.random() * 110,
      speed: 18 + Math.random() * 16,
      bounceTimer: 0,
    });
  }
  state.bgElements = [];
  const world = WORLDS[state.worldIndex];
  for (let i = 0; i < 6; i++) {
    state.bgElements.push({
      x: i * 320 + 180,
      worldId: world.id,
      type: world.propTypes[i % world.propTypes.length],
    });
  }
}
