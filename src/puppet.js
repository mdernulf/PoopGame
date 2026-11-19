/**
 * SVG-riggade spelkaraktärer.
 * - Upptäcker figurer automatiskt genom att lista svg-players/ på servern
 * - Bygger karaktärsväljaren dynamiskt
 * - Injicerar vald SVG inline i .puppet-wrapper över canvasen
 * - Styr animationstillstånd (idle/run/jump/swim + flip/backflip/sit) via klass-byten
 *
 * CSS-reglerna för rotation/animation ligger i styles/puppet.css.
 */
import { state } from "./state.js";
import { sound } from "./audio.js";

/**
 * =========================================================================
 * SVG-RIGGADE SPELKARAKTÄRER (inline SVG + CSS-animationer)
 * =========================================================================
 * Riggade .svg-filer från extern studio droppas in i svg-players/.
 * Vi hämtar filen, injicerar den inline i <div class="puppet-wrapper">
 * och låter studions CSS (längst ned i <style>) sköta alla rotationer
 * via klass-byten (anim-idle / anim-run / anim-jump / anim-swim +
 * facing-left). Ingen JS rör de animerade grupperna.
 */
// Kända karaktärer med etikett + emoji. Okända filer i svg-players/
// får ett automatiskt namn (filnamnet med stor första bokstav) och
// en standard-emoji — editera här för att ge dem riktiga namn.
export const CHARACTER_META = {
  royal: { label: "Prins / Prinsessa", emoji: "👑" },
  knight: { label: "Riddaren", emoji: "🛡️" },
  wizard: { label: "Trollkarlen", emoji: "🧙" },
  fairy: { label: "Älvan", emoji: "🧚" },
  dragon: { label: "Draken", emoji: "🐲" },
};
export const FALLBACK_CHARACTERS = Object.keys(CHARACTER_META);

export function puppetSrcFor(characterKey) {
  return characterKey ? `svg-players/${characterKey}.svg` : null;
}

export function characterLabel(key) {
  if (CHARACTER_META[key]) return CHARACTER_META[key].label;
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/[-_]/g, " ");
}
export function characterEmoji(key) {
  return CHARACTER_META[key] ? CHARACTER_META[key].emoji : "🎭";
}

// Python http.server returnerar en HTML-lista med <a href="X.svg">-länkar
// när man hämtar en katalog. Vi parsar den för att lista alla tillgängliga
// figurer. Faller tillbaka till FALLBACK_CHARACTERS om listningen misslyckas
// (t.ex. om spelet serveras från en server som inte har directory listing).
export async function discoverCharacters() {
  try {
    const res = await fetch("svg-players/");
    if (!res.ok) throw new Error("fetch " + res.status);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const anchors = doc.querySelectorAll("a[href]");
    const keys = [];
    anchors.forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (!href.toLowerCase().endsWith(".svg")) return;
      const filename = href.split("/").pop();
      const key = filename.replace(/\.svg$/i, "");
      if (key && !keys.includes(key)) keys.push(key);
    });
    return keys;
  } catch (err) {
    console.warn("Kunde inte lista svg-players/:", err);
    return null;
  }
}

export function renderCharPicker(keys) {
  const picker = document.getElementById("charPicker");
  if (!picker) return;
  picker.innerHTML = "";
  keys.forEach((key) => {
    const btn = document.createElement("button");
    btn.className = "crayon-btn choice-chip char-chip" + (key === state.character ? " active" : "");
    btn.dataset.char = key;
    btn.title = characterLabel(key);
    // Rendera figuren själv som miniatyr — ingen emoji behövs.
    const img = document.createElement("img");
    img.src = puppetSrcFor(key);
    img.alt = characterLabel(key);
    img.className = "char-thumb";
    img.onerror = () => {
      // Fallback till emoji om SVG saknas
      btn.textContent = characterEmoji(key);
    };
    btn.appendChild(img);
    btn.addEventListener("click", () => {
      picker.querySelectorAll(".choice-chip").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.character = key;
      loadPuppet(key);
      sound.playPop();
    });
    picker.appendChild(btn);
  });
  // Om nuvarande state.character inte finns i listan: välj första tillgängliga
  if (!keys.includes(state.character)) {
    state.character = keys[0] || "royal";
    const first = picker.querySelector(".choice-chip");
    if (first) first.classList.add("active");
    loadPuppet(state.character);
  }
}

export async function initCharacterPicker() {
  // Visa fallback-listan direkt så startskärmen inte är tom under tiden.
  renderCharPicker(FALLBACK_CHARACTERS);
  const discovered = await discoverCharacters();
  if (!discovered || discovered.length === 0) return;
  // Sortera: kända figurer i deras definitionsordning, nya alfabetiskt sist.
  const known = FALLBACK_CHARACTERS.filter((k) => discovered.includes(k));
  const unknown = discovered.filter((k) => !FALLBACK_CHARACTERS.includes(k)).sort();
  const ordered = [...known, ...unknown];
  // Omrita bara om listan faktiskt ändrats (undviker att nollställa aktivt val).
  const current = Array.from(document.querySelectorAll("#charPicker .choice-chip")).map(
    (b) => b.dataset.char,
  );
  if (current.join(",") !== ordered.join(",")) renderCharPicker(ordered);
}

// SVG:n är 320×320 med fötter på y≈282. Vi placerar wrapperns (160, 282)
// vid spelarens (player.x, player.y) och skalar ner så att figuren blir
// ~95 skärmpixlar hög (matchar spelets gamla procedurella storlek).
export const PUPPET_SCALE = 0.42;
export const PUPPET_FEET_X = 160;
export const PUPPET_FEET_Y = 282;

export const PUPPET = {
  ready: false,
  currentSrc: null,
  wrapper: null,
  animClass: null,
  facingLeft: false,
  scale: 0.55, // speglas från dev-sliderns playerScale i applyDevSettings
};


export async function loadPuppet(characterKey) {
  if (!PUPPET.wrapper) PUPPET.wrapper = document.querySelector(".puppet-wrapper");
  const src = puppetSrcFor(characterKey);
  if (!src || !PUPPET.wrapper) {
    PUPPET.ready = false;
    if (PUPPET.wrapper) PUPPET.wrapper.innerHTML = "";
    return;
  }
  if (PUPPET.currentSrc === src && PUPPET.ready) return;
  PUPPET.ready = false;
  PUPPET.currentSrc = src;
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error("fetch " + res.status);
    const text = await res.text();
    if (PUPPET.currentSrc !== src) return; // nyare laddning hann starta
    // Ta bort ev. XML-/DOCTYPE-prolog så det kan injiceras som HTML.
    const clean = text
      .replace(/<\?xml[^?]*\?>/i, "")
      .replace(/<!DOCTYPE[^>]*>/i, "")
      .trim();
    PUPPET.wrapper.innerHTML = clean;
    PUPPET.ready = true;
    PUPPET.animClass = null; // tvinga ny klassificering nästa updatePuppet
  } catch (err) {
    console.warn("Kunde inte ladda puppet-SVG", src, err);
    PUPPET.ready = false;
    if (PUPPET.wrapper) PUPPET.wrapper.innerHTML = "";
  }
}

export function puppetAnimStateFor(player) {
  if (state.mode !== "PLAYING") return "anim-idle";
  // Bananskal: sittande fas har högst prioritet (spelaren står på marken
  // men är "låst" i sitt-pose), därefter luftvolt bakåt under flip-fasen.
  if (player.slipTimer > 0 && player.slipPhase === "sit") return "anim-sit";
  if (player.slipTimer > 0 && player.slipPhase === "flip") return "anim-backflip";
  // Volt vid dubbelhopp (framåt-snurr i luften).
  if (player.spinAngle !== 0 && player.spinDir === 1 && !player.isGrounded) return "anim-flip";
  if (state.inLake) return "anim-swim";
  if (player.flyTimer > 0) return "anim-jump";
  if (!player.isGrounded) return "anim-jump";
  if (player.isChargingJump) return "anim-idle";
  return "anim-run";
}

export function updatePuppet(player) {
  const w = PUPPET.wrapper;
  if (!w) return;
  if (!PUPPET.ready) {
    w.style.visibility = "hidden";
    return;
  }
  w.style.visibility = "";
  const desiredAnim = puppetAnimStateFor(player);
  // Simning: #character-side roterar 76° kring (165, 175) vilket ger
  // figurens tyngdpunkt ~120 viewBox-enheter ovanför fot-ankaret. Vi
  // skjuter wrappern nedåt proportionellt mot skalan så att huvudet
  // precis rör vattenytan istället för att sväva ovanför den.
  const swimDrop = desiredAnim === "anim-swim" ? 120 * PUPPET.scale : 0;
  w.style.left = player.x - PUPPET_FEET_X + "px";
  w.style.top = player.y - PUPPET_FEET_Y + swimDrop + "px";
  if (desiredAnim !== PUPPET.animClass) {
    if (PUPPET.animClass) w.classList.remove(PUPPET.animClass);
    w.classList.add(desiredAnim);
    PUPPET.animClass = desiredAnim;
  }
  // Spelet scrollar höger → figuren tittar alltid höger just nu.
  const faceLeft = false;
  if (faceLeft !== PUPPET.facingLeft) {
    w.classList.toggle("facing-left", faceLeft);
    PUPPET.facingLeft = faceLeft;
  }
}
