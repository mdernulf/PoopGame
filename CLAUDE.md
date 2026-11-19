# Sprattelgubben på äventyr

Ett självförsörjande 2D-sidscrollande spel i handritad papper- & vaxkrit-stil
för 3–6-åringar. Allt körs i webbläsaren direkt från filsystemet eller en enkel
lokal HTTP-server — inget bygg-steg, inget npm, inga beroenden.

## Projektstruktur

```
index.html          ← hela spelet (HTML + CSS + JS inline, ca 4500 rader)
assets/audio/       ← WAV-ljud (enda externa resurserna)
  buildup.wav         spelas när man håller inne Hoppa! och laddar superhopp
  Balloon.wav         spelas när tredje ballongen plockas och flygfasen startar
  Banana.wav          spelas när spelaren halkar på ett bananskal
  Prutt A / C / D / E / in stereo.wav   randomiserad pool via sound.playFart()
```

## Köra spelet

```
python3 -m http.server 8000
# öppna http://127.0.0.1:8000/ i webbläsaren
```

(Filen måste serveras via HTTP, inte `file://`, för att `fetch()` av WAV-filerna
ska fungera.)

## Arkitektur i index.html

En enda `<script>`-tagg i botten innehåller:

- **`CrayonSoundEngine`** — ljudmotor med Web Audio API. Oscillator-baserade
  "blipp"-ljud (jump, pop, star, oops, quack, bird, bark, fanfare, musiknot)
  plus WAV-samples (buildup, balloon, banana, pruttpool).
- **`state`** — hela speltillståndet (mode, spelare, fiender, collectibles,
  värld, sjöar, partiklar, timers). Ingen extern state management.
- **Ritfunktioner** — `drawSprattelgubbe`, `drawDog`, `drawBird`, `drawCrab`,
  `drawSeahorse`, `drawRubberDuck`, `drawBananaPeel`, `drawPoop`,
  `drawCollectible`, `drawWorldBackground`. Alla använder hjälparen
  `drawWithPaperCutout()` som ger den karaktäristiska saxklippta pappersramen.
- **`update(dt)` / `draw()` / `gameLoop()`** — vanlig requestAnimationFrame-loop.
- **UI-handlers** — pekar- och tangentbordskontroller för Hoppa!/Huka!,
  figurval, färgval, världsval, godiskiosken, mute/fart-knappar.

## Konventioner

- All text i UI och speechbubblor är på svenska.
- Emojis används fritt i UI och pratbubblor (målgruppen är förskolebarn).
- Volymbalans: WAV-pruttar och buildup är avsiktligt höga (2.8–3.0 gain),
  blipp-ljud (särskilt `playStar`) är nedtonade så att de inte dominerar
  vid täta stjärnplock.
- Nya ljudfiler läggs i `assets/audio/` och registreras i `loadFartSounds()`
  (för pruttar) eller `oneShots`-listan (för unika ljud) i `CrayonSoundEngine`.
