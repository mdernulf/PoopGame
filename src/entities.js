/**
 * Entiteter: djur och hinder som rör sig genom världen.
 * Här bor ritfunktionerna för varje typ + spawnParticles-hjälparen.
 *
 * Varje djur ritas med drawWithPaperCutout för att få den karaktäristiska
 * vita saxklippta kanten + skugga. Positionering/spawning sköts av main-loopen
 * och levels.js; den här modulen ansvarar bara för UTSEENDET.
 *
 * För att göra ett djur snabbare/långsammare, redigera spawn-/update-koden i
 * main-loopen — inte här.
 */
import { ctx, state } from "./state.js";
import { drawWithPaperCutout, drawHandLine, fillRoundRect, crayonPattern } from "./paper-cutout.js";

export function drawBananaPeel(peel) {
  ctx.save();
  ctx.translate(peel.x, peel.y);

  drawWithPaperCutout(
    (c) => {
      c.strokeStyle = "#2c2724";
      c.lineWidth = 2.8;
      c.lineJoin = "round";
      c.lineCap = "round";

      // Bakre bananskal-flikar (ljusgul insida)
      c.fillStyle = "#fff3b0";
      c.beginPath();
      c.moveTo(-2, -16);
      c.quadraticCurveTo(-18, -14, -22, 0);
      c.quadraticCurveTo(-11, -2, -3, -10);
      c.closePath();
      c.fill();
      c.stroke();

      c.beginPath();
      c.moveTo(2, -16);
      c.quadraticCurveTo(18, -14, 22, 0);
      c.quadraticCurveTo(11, -2, 3, -10);
      c.closePath();
      c.fill();
      c.stroke();

      // Främre gula bananskal-flikar
      c.fillStyle = "#ffd166";
      c.beginPath();
      c.moveTo(-2, -17);
      c.quadraticCurveTo(-24, -4, -27, 4);
      c.quadraticCurveTo(-14, 5, -3, -8);
      c.closePath();
      c.fill();
      if (crayonPattern) {
        c.fillStyle = crayonPattern;
        c.fill();
      }
      c.stroke();

      c.fillStyle = "#ffd166";
      c.beginPath();
      c.moveTo(0, -17);
      c.quadraticCurveTo(-3, -3, -7, 6);
      c.quadraticCurveTo(0, 7, 7, 6);
      c.quadraticCurveTo(3, -3, 0, -17);
      c.closePath();
      c.fill();
      if (crayonPattern) {
        c.fillStyle = crayonPattern;
        c.fill();
      }
      c.stroke();

      c.fillStyle = "#ffd166";
      c.beginPath();
      c.moveTo(2, -17);
      c.quadraticCurveTo(24, -4, 27, 4);
      c.quadraticCurveTo(14, 5, 3, -8);
      c.closePath();
      c.fill();
      if (crayonPattern) {
        c.fillStyle = crayonPattern;
        c.fill();
      }
      c.stroke();

      // Små bruna mognadsprickar på bananskalet
      c.fillStyle = "#6f4e37";
      c.beginPath();
      c.arc(-12, -3, 1.4, 0, Math.PI * 2);
      c.arc(11, -4, 1.4, 0, Math.PI * 2);
      c.arc(0, -2, 1.3, 0, Math.PI * 2);
      c.fill();

      // Mörkbrun bananknopp längst upp
      c.fillStyle = "#4a3219";
      fillRoundRect(c, -4, -24, 8, 8, 2);
      c.fill();
      c.stroke();
    },
    82,
    58,
    41,
    44,
  );

  ctx.restore();
}

export function drawCrab(crab) {
  ctx.save();
  ctx.translate(crab.x, crab.y);
  const scuttle = Math.sin(state.wobbleTime * 14 + crab.x * 0.05) * 3;
  const pinch = Math.abs(Math.sin(state.wobbleTime * 10));

  drawWithPaperCutout(
    (c) => {
      c.strokeStyle = "#2c2724";
      c.lineWidth = 2.6;
      c.lineCap = "round";

      // Små krabben åt båda sidor
      for (const side of [-1, 1]) {
        for (let leg = 0; leg < 3; leg++) {
          const lx = side * (16 + leg * 5);
          const ly = -8 + leg * 2 + (leg % 2 === 0 ? scuttle * 0.4 : -scuttle * 0.4);
          c.beginPath();
          c.moveTo(side * 12, -10);
          c.lineTo(lx, ly);
          c.lineTo(lx + side * 4, 0);
          c.stroke();
        }
      }

      // Stora klor som kniper!
      for (const side of [-1, 1]) {
        c.save();
        c.translate(side * 18, -18);
        c.rotate(side * (0.25 - pinch * 0.22));
        c.fillStyle = "#ff595e";
        c.beginPath();
        c.arc(side * 6, -8, 9, 0.2 * Math.PI, 1.75 * Math.PI);
        c.lineTo(side * 6, -8);
        c.closePath();
        c.fill();
        c.stroke();
        c.restore();
      }

      // Krabbans runda röda skal
      c.fillStyle = "#ff595e";
      c.beginPath();
      c.ellipse(0, -12, 20, 12, 0, 0, Math.PI * 2);
      c.fill();
      if (crayonPattern) {
        c.fillStyle = crayonPattern;
        c.fill();
      }
      c.stroke();

      // Ögon på skaft
      c.beginPath();
      c.moveTo(-7, -22);
      c.lineTo(-9, -31);
      c.moveTo(7, -22);
      c.lineTo(9, -31);
      c.stroke();

      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(-9, -32, 4.5, 0, Math.PI * 2);
      c.arc(9, -32, 4.5, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      c.fillStyle = "#2c2724";
      c.beginPath();
      c.arc(-9, -32, 2, 0, Math.PI * 2);
      c.arc(9, -32, 2, 0, Math.PI * 2);
      c.fill();

      // Busig mun
      c.beginPath();
      c.arc(0, -11, 6, 0.1 * Math.PI, 0.9 * Math.PI);
      c.stroke();
    },
    96,
    72,
    48,
    56,
  );

  ctx.restore();
}

export function drawSeahorse(seahorse) {
  ctx.save();
  const bobY = Math.sin(state.wobbleTime * 3.8 + seahorse.x * 0.03) * 8;
  const sway = Math.cos(state.wobbleTime * 3.2 + seahorse.x * 0.03) * 0.08;
  ctx.translate(seahorse.x, seahorse.y + bobY);
  ctx.rotate(sway);

  drawWithPaperCutout(
    (c) => {
      c.strokeStyle = "#2c2724";
      c.lineWidth = 2.6;
      c.lineCap = "round";
      c.lineJoin = "round";

      // Liten gullig ryggfena som viftar
      const finWave = Math.sin(state.wobbleTime * 14) * 3;
      c.fillStyle = "#ffd166";
      c.beginPath();
      c.moveTo(6, -6);
      c.quadraticCurveTo(20 + finWave, -12, 18 + finWave, 2);
      c.quadraticCurveTo(12, 6, 6, 2);
      c.closePath();
      c.fill();
      c.stroke();

      // Sjöhästens svängda kropp & knorr-svans
      c.fillStyle = seahorse.color || "#ff8fab";
      c.beginPath();
      c.moveTo(-4, -22);
      c.quadraticCurveTo(10, -12, 7, 6);
      c.quadraticCurveTo(4, 24, -6, 26);
      c.quadraticCurveTo(-15, 26, -13, 18);
      c.quadraticCurveTo(-11, 14, -6, 16);
      c.quadraticCurveTo(-3, 18, -3, 12);
      c.quadraticCurveTo(-3, 4, -8, -4);
      c.quadraticCurveTo(-10, -14, -4, -22);
      c.closePath();
      c.fill();
      if (crayonPattern) {
        c.fillStyle = crayonPattern;
        c.fill();
      }
      c.stroke();

      // Små gulliga magränder
      c.strokeStyle = "#fff3b0";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-6, -4);
      c.lineTo(1, -4);
      c.moveTo(-5, 2);
      c.lineTo(2, 2);
      c.moveTo(-4, 8);
      c.lineTo(1, 8);
      c.stroke();

      // Huvud & liten trumpet-nos (vänd åt vänster mot simmaren)
      c.strokeStyle = "#2c2724";
      c.lineWidth = 2.6;
      c.fillStyle = seahorse.color || "#ff8fab";
      c.beginPath();
      c.arc(-4, -23, 10, 0, Math.PI * 2);
      c.fill();
      if (crayonPattern) {
        c.fillStyle = crayonPattern;
        c.fill();
      }
      c.stroke();

      // Trumpetnos
      fillRoundRect(c, -21, -25, 11, 6, 3);
      c.fill();
      c.stroke();

      // Liten krona/tofs på huvudet
      c.fillStyle = "#ffd166";
      c.beginPath();
      c.moveTo(-6, -32);
      c.lineTo(-2, -39);
      c.lineTo(2, -32);
      c.closePath();
      c.fill();
      c.stroke();

      // Snällt öga & rosiga kinder
      c.fillStyle = "#2c2724";
      c.beginPath();
      c.arc(-7, -24, 2.2, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = "#ff595e";
      c.beginPath();
      c.arc(-3, -20, 2.5, 0, Math.PI * 2);
      c.fill();
    },
    84,
    96,
    42,
    48,
  );

  ctx.restore();
}

export function drawRubberDuck(duck) {
  ctx.save();
  const bobY = Math.sin(state.wobbleTime * 6 + duck.x * 0.04) * 4;
  const tilt = Math.cos(state.wobbleTime * 5 + duck.x * 0.04) * 0.1;
  ctx.translate(duck.x, duck.y + bobY);
  ctx.rotate(tilt);

  drawWithPaperCutout(
    (c) => {
      c.strokeStyle = "#2c2724";
      c.lineWidth = 2.8;

      // Badankans gula kropp
      c.fillStyle = "#ffd166";
      c.beginPath();
      c.moveTo(-22, 2);
      c.quadraticCurveTo(-24, -14, -8, -12);
      c.quadraticCurveTo(6, -12, 16, -6);
      c.lineTo(24, -15);
      c.quadraticCurveTo(22, 4, 8, 8);
      c.quadraticCurveTo(-12, 10, -22, 2);
      c.closePath();
      c.fill();
      if (crayonPattern) {
        c.fillStyle = crayonPattern;
        c.fill();
      }
      c.stroke();

      // Liten vinge
      c.fillStyle = "#ffb703";
      c.beginPath();
      c.ellipse(2, -2, 9, 5, -0.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Huvud
      c.fillStyle = "#ffd166";
      c.beginPath();
      c.arc(-11, -20, 11, 0, Math.PI * 2);
      c.fill();
      if (crayonPattern) {
        c.fillStyle = crayonPattern;
        c.fill();
      }
      c.stroke();

      // Orange anknäbb
      c.fillStyle = "#ff7b00";
      c.beginPath();
      c.moveTo(-21, -21);
      c.quadraticCurveTo(-32, -20, -29, -15);
      c.quadraticCurveTo(-24, -13, -20, -16);
      c.closePath();
      c.fill();
      c.stroke();

      // Öga
      c.fillStyle = "#2c2724";
      c.beginPath();
      c.arc(-14, -22, 2.3, 0, Math.PI * 2);
      c.fill();
    },
    82,
    66,
    42,
    44,
  );

  ctx.restore();
}

export function drawPoop(poop) {
  ctx.save();
  ctx.translate(poop.x, poop.y);

  if (poop.fromBird) {
    // Svartvitt fågelbajs!
    drawWithPaperCutout(
      (c) => {
        c.strokeStyle = "#2c2724";
        c.lineWidth = 2.4;

        // Vit yttre klick
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.moveTo(-14, 0);
        c.quadraticCurveTo(-18, -11, -7, -14);
        c.quadraticCurveTo(0, -21, 8, -13);
        c.quadraticCurveTo(17, -10, 14, 0);
        c.quadraticCurveTo(4, 4, -14, 0);
        c.closePath();
        c.fill();
        c.stroke();

        // Mörk kärna i mitten
        c.fillStyle = "#3d405b";
        c.beginPath();
        c.ellipse(0, -7, 6.5, 4.5, -0.15, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(-2, -8, 1.8, 0, Math.PI * 2);
        c.fill();
      },
      64,
      54,
      32,
      36,
    );
  } else {
    // Brun bajshög från hundarna
    drawWithPaperCutout(
      (c) => {
        c.fillStyle = "#7f4f24";
        c.strokeStyle = "#2c2724";
        c.lineWidth = 2.6;

        // Nedersta ringen
        c.beginPath();
        c.ellipse(0, -6, 18, 7, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        // Mellersta ringen
        c.beginPath();
        c.ellipse(0, -14, 13, 6, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        // Toppsnurren
        c.beginPath();
        c.moveTo(-7, -18);
        c.quadraticCurveTo(-2, -29, 5, -26);
        c.quadraticCurveTo(2, -22, 7, -18);
        c.closePath();
        c.fill();
        c.stroke();

        // Små stanklinjer
        c.strokeStyle = "#588157";
        c.lineWidth = 2;
        for (const sx of [-9, 0, 9]) {
          c.beginPath();
          c.moveTo(sx, -31);
          c.quadraticCurveTo(sx - 3, -36, sx + 2, -41);
          c.stroke();
        }
      },
      66,
      70,
      33,
      52,
    );
  }
  ctx.restore();
}

export function drawDog(dog) {
  ctx.save();
  ctx.translate(dog.x, dog.y);
  const isPooping = dog.poopTimer > 0 && dog.poopTimer < 0.7;
  const walkBob = isPooping ? 4 : Math.abs(Math.sin(state.wobbleTime * 11 + dog.x * 0.05)) * 4;

  drawWithPaperCutout(
    (c) => {
      c.strokeStyle = "#2c2724";
      c.lineWidth = 2.8;

      if (dog.breed === "dachshund") {
        // Lång, låg Tax
        c.fillStyle = "#bc6c25";
        fillRoundRect(c, -34, -22 + walkBob, 56, 15, 7);
        c.fill();
        if (crayonPattern) {
          c.fillStyle = crayonPattern;
          c.fill();
        }
        c.stroke();

        // Korta ben
        c.fillStyle = "#9c6644";
        fillRoundRect(c, -26, -8, 6, 8, 3);
        c.fill();
        c.stroke();
        fillRoundRect(c, 12, -8, 6, 8, 3);
        c.fill();
        c.stroke();

        // Huvud & lång nos
        c.fillStyle = "#bc6c25";
        c.beginPath();
        c.arc(-34, -24 + walkBob, 11, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        fillRoundRect(c, -49, -25 + walkBob, 16, 9, 4);
        c.fill();
        c.stroke();

        // Hängande öra
        c.fillStyle = "#7f4f24";
        c.beginPath();
        c.ellipse(-29, -19 + walkBob, 5, 9, 0.2, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        // Svans
        c.beginPath();
        c.moveTo(22, -19 + walkBob);
        c.lineTo(31, -28 + walkBob);
        c.stroke();
      } else if (dog.breed === "stbernard") {
        // Stor, lurvig Sankt Bernhard
        c.fillStyle = "#f8edeb";
        fillRoundRect(c, -28, -42 + walkBob, 54, 28, 12);
        c.fill();
        c.stroke();

        // Brun fläck på ryggen
        c.fillStyle = "#9c6644";
        c.beginPath();
        c.ellipse(4, -34 + walkBob, 16, 10, 0, 0, Math.PI * 2);
        c.fill();

        // Kraftiga ben
        c.fillStyle = "#f8edeb";
        fillRoundRect(c, -22, -16, 9, 16, 4);
        c.fill();
        c.stroke();
        fillRoundRect(c, 12, -16, 9, 16, 4);
        c.fill();
        c.stroke();

        // Stort huvud
        c.fillStyle = "#9c6644";
        c.beginPath();
        c.arc(-28, -42 + walkBob, 16, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        c.fillStyle = "#f8edeb";
        fillRoundRect(c, -43, -41 + walkBob, 16, 12, 5);
        c.fill();
        c.stroke();
      } else {
        // Fluffig rosa/vit Pudel
        c.fillStyle = "#ffccd5";
        fillRoundRect(c, -24, -32 + walkBob, 44, 20, 10);
        c.fill();
        c.stroke();

        // Smala ben med fluffbollar
        fillRoundRect(c, -18, -14, 6, 14, 3);
        c.fill();
        c.stroke();
        fillRoundRect(c, 10, -14, 6, 14, 3);
        c.fill();
        c.stroke();
        c.beginPath();
        c.arc(-15, -6, 5, 0, Math.PI * 2);
        c.arc(13, -6, 5, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        // Fluffigt huvud
        c.beginPath();
        c.arc(-24, -34 + walkBob, 13, 0, Math.PI * 2);
        c.arc(-24, -45 + walkBob, 8, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        // Svansboll
        c.beginPath();
        c.arc(23, -30 + walkBob, 6, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      }

      // Gemensamt öga & nos
      const headX = dog.breed === "dachshund" ? -38 : dog.breed === "stbernard" ? -33 : -28;
      const headY = dog.breed === "dachshund" ? -26 : dog.breed === "stbernard" ? -45 : -36;
      c.fillStyle = "#2c2724";
      c.beginPath();
      c.arc(headX, headY + walkBob, 2.5, 0, Math.PI * 2);
      c.fill();
    },
    130,
    96,
    65,
    82,
  );

  ctx.restore();
}

export function drawBird(bird) {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  const flap = Math.sin(state.wobbleTime * 15 + bird.x * 0.04) * 14;

  drawWithPaperCutout(
    (c) => {
      c.strokeStyle = "#2c2724";
      c.lineWidth = 2.6;

      let bodyColor = "#3d405b";
      let beakColor = "#ff9f1c";
      if (bird.species === "seagull") {
        bodyColor = "#f8f9fa";
        beakColor = "#ffd166";
      } else if (bird.species === "parrot") {
        bodyColor = "#ff595e";
        beakColor = "#ffd166";
      }

      // Kropp
      c.fillStyle = bodyColor;
      c.beginPath();
      c.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
      c.fill();
      if (crayonPattern) {
        c.fillStyle = crayonPattern;
        c.fill();
      }
      c.stroke();

      // Huvud
      c.beginPath();
      c.arc(-15, -5, 9, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Näbb
      c.fillStyle = beakColor;
      c.beginPath();
      c.moveTo(-23, -6);
      c.lineTo(-33, -3);
      c.lineTo(-23, 0);
      c.closePath();
      c.fill();
      c.stroke();

      // Fladdrande vinge
      c.fillStyle = bird.species === "parrot" ? "#1982c4" : bodyColor;
      c.beginPath();
      c.moveTo(-4, -3);
      c.quadraticCurveTo(4, -22 + flap, 14, -4);
      c.closePath();
      c.fill();
      c.stroke();

      // Öga
      c.fillStyle = "#2c2724";
      c.beginPath();
      c.arc(-17, -7, 2.2, 0, Math.PI * 2);
      c.fill();
    },
    92,
    74,
    46,
    40,
  );

  ctx.restore();
}


/**
 * =========================================================================
 * 6. SPRATTELGUBBEN MED LEDADE ARMAR & BEN FÖR ALLA RÖRELSESÄTT
 * =========================================================================
 */

export function spawnParticles(x, y, color, count = 10, burst = false) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = burst ? 90 + Math.random() * 170 : 35 + Math.random() * 95;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (burst ? 90 : 40),
      size: 3 + Math.random() * 4.5,
      color,
      life: 0.45 + Math.random() * 0.35,
    });
  }
}

