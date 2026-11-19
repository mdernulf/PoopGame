# Rigg-spec: SVG-sprattelgubbar för "Sprattelgubben på äventyr"

Det här dokumentet beskriver det format spelet förväntar sig av exporterade
SVG-sprattelgubbar så att de kan droppas in i `svg-players/` och fungera
direkt. Konkret exempel: [`svg-players/royal.svg`](svg-players/royal.svg).

Spelet renderar varje `<g>`-grupp som en egen kanvas-bild och roterar
dem kring sina fasta ledpunkter — så det enda som verkligen spelar roll
är (a) grupp-IDn, (b) ledpunkternas koordinater, (c) viewBoxen.

---

## 1. Filformat

- Enda `<svg>`-rot, **viewBox="0 0 320 320"**
- Fötterna står på **y ≈ 282**
- Hela figuren inuti **`<g id="flip-wrapper">`** så den kan speglas horisontellt
  med `transform: scaleX(-1)` runt (160, 160) när figuren går åt vänster
  (spelet applicerar själv speglingen vid rendering)
- Två vyer i samma fil (överlagras, spelet visar en i taget):
  - **`<g id="character-front">`** — när figuren står stilla (`idle`-state)
  - **`<g id="character-side">`** — när figuren springer, hoppar eller simmar,
    ritad vänd åt höger

---

## 2. Obligatoriska grupp-IDn och ledpunkter

Spelet rör delarna genom att rotera varje `<g>` kring en fast ledpunkt.
Ledpunkterna är hårdkodade i spelet — om din export placerar en axel på
en annan koordinat kommer armen att rotera runt fel punkt.

Alla värden är i SVG-koordinater (viewBox-enheter, inte pixlar).

### `#character-front`

| Grupp-ID | Beskrivning | Ledpunkt (transform-origin) |
|---|---|:---:|
| `#front-torso-group` | Samlingsgrupp för bålen (bodyTilt) | `160 175` |
| `#front-head` | Huvud + ansikte | `160 130` (nackled) |
| `#front-tailOrCape` | Svans eller mantel bakom | `160 180` |
| `#front-armLeft` | Vänster arm | `128 150` (axelled) |
| `#front-armRight` | Höger arm | `192 150` (axelled) |
| `#front-legLeft` | Vänster ben | `143 208` (höftled) |
| `#front-legRight` | Höger ben | `177 208` (höftled) |

### `#character-side`

| Grupp-ID | Beskrivning | Ledpunkt (transform-origin) |
|---|---|:---:|
| `#side-torso-group` | Samlingsgrupp för bålen | `165 175` |
| `#side-head` | Huvud i profil, ansikte åt höger | `165 130` (nackled) |
| `#side-tailOrCape` | Svans / mantel bakom ryggen | `140 180` |
| `#side-armFront` | Främre arm | `164 148` (axelled) |
| `#side-armBack` | Bakre arm | `164 148` (axelled) |
| `#side-legFront` | Främre ben | `162 208` (höftled) |
| `#side-legBack` | Bakre ben | `162 208` (höftled) |

Varje grupp bör ha `style="transform-box: view-box; transform-origin: <x>px <y>px"`
så att externa CSS-animationer också kan använda samma pivots (spelet
använder inte stilen — det applicerar rotationen direkt på canvas — men
den är viktig för att din egen förhandsgranskning i webbläsaren ska se rätt ut).

---

## 3. Z-order (ritordning i filen)

XML-ordning = renderingsordning (bakifrån → framåt). Håll dig till denna
ordning inuti respektive `#*-torso-group`:

### Framifrån
1. `#front-tailOrCape`
2. `#front-legLeft`
3. `#front-legRight`
4. `#front-armLeft`
5. `#front-torso` (själva bålen + eventuella mässingsklämmor)
6. `#front-armRight`
7. `#front-head`

### Sidovy
1. `#side-tailOrCape`
2. `#side-legBack`
3. `#side-armBack`
4. `#side-torso`
5. `#side-head`
6. `#side-legFront`
7. `#side-armFront`

---

## 4. Tillstånd och animationer spelet kör

Spelet bestämmer tillstånd automatiskt och applicerar motsvarande
rotationsvinklar på respektive `<g>`.

| Tillstånd | Villkor | Vy |
|---|---|---|
| `idle` | Inte i spelsession | `#character-front` |
| `run` | Vanlig spring | `#character-side` |
| `jump` | `!isGrounded` i luften | `#character-side` |
| `swim` | `inLake` | `#character-side` |
| (extra) `fly`, `skate`, `umbrella`, `duck`, `charge` | diverse | `#character-side` |

### Riktning
Spelet scrollar höger, så `facing = "right"` är default. När/om figuren
ska vända sig åt vänster speglas hela `#flip-wrapper` horisontellt
(`ctx.scale(-1, 1)` på canvas-nivå — samma visuella resultat som
`scaleX(-1)` i CSS).

### Rotationsvinklar per del (radianer)

Huvudet, armarna och benen får vinklar från ett antal fallgropar.
Siffrorna är de som den procedurella figuren använder sedan tidigare —
behöver inte vara exakt lika i din SVG men påverkar ej själva formatet.

| Delstat | Vilka delar | Vinkel (ca) |
|---|---|---|
| Spring, cykel från `runCycle` | `legFront` / `legBack` | `±sin(rc) * 0.68` |
| Spring, cykel | `armFront` / `armBack` | `∓sin(rc) * 0.62` |
| Hopp i luften | `armFront` / `armBack` | `−1.0 / −0.4` |
| Hopp-laddning (`isChargingJump`) | `armFront` / `armBack` | `0.5…1.0 / 0.65…1.2` |
| Hopp-laddning | `legFront` / `legBack` | knäböj motriktad `~−0.9 / +0.9` |
| Huka (`isDucking`) | `legFront` / `legBack` | `−0.65 / 0.65` |
| Simma (crawl) | `armFront` / `armBack` | kontinuerlig rotation, 180° motfas |
| Simma | `legFront` / `legBack` | snabb sparkcykel `±sin(t*15) * 0.34` |
| Ballongflyg | `armFront` / `armBack` | sträckt uppåt `−2.45` resp `−0.4` |
| Skateboard | `armFront` / `armBack` | ute åt sidorna `±0.85` |

---

## 5. Färger

Spelet färglägger inte dina paths — alla fills/strokes behålls som de är
i din export. Men för ev. framtida användaraval rekommenderas att
klassificera paths så det går att återfärglägga via CSS-klass:

| Klass | Vad den målar | Rekommenderad default |
|---|---|---|
| `.part-body` | Bar hud / päls | `#ffe5d9` |
| `.part-clothes` | Dräkt / mantel | spelarens valda färg |
| `.part-pants` | Byxor | `#3d405b` |
| `.part-shoes` | Skor | `#ff595e` |
| `.part-cheeks` | Rosiga kinder | `#ff758f` |

Konturer: alla strokes `stroke="#2c2724"`, `stroke-width="1.5"`,
`stroke-linecap/-linejoin="round"`.

---

## 6. Vad händer under huven i spelet

1. `svg-players/<karaktär>.svg` fetchas och parsas vid karaktärsval
2. Varje `<g>` i §2 extraheras och renderas som en 320×320 canvas-bild
3. I varje bildruta:
   - Spelet avgör vilken vy som är aktiv (front/side)
   - Beräknar en rotationsvinkel per del utifrån tillståndet
   - Ritar varje del i canvas, med `rotate` kring delens ledpunkt
   - Hela figuren placeras i spelets lokala koordinatsystem (fötter
     vid y=5, huvud vid y=−90, feet-mitt vid x=0) med skalfaktor 0.5
     från SVG-enheter
4. Pappersklippt kant + skugga läggs på automatiskt av spelets
   `drawWithPaperCutout` — behövs **inte** i din SVG

---

## 7. Checklista

- [ ] `<svg viewBox="0 0 320 320">`
- [ ] Allt inuti `<g id="flip-wrapper">`
- [ ] Separata `#character-front` och `#character-side` grupper
- [ ] Alla IDn från §2 finns och ligger på exakt rätt
      transform-origin-koordinat
- [ ] Z-order enligt §3
- [ ] Fötterna står på y ≈ 282
- [ ] Inga inline `transform="..."`-attribut på grupperna
      (bara `style="transform-origin: …"` – spelet styr själv rotationerna)

---

## 8. Dropp-in: byt eller lägg till figur

- Döp filen till en av de fem karaktärsnycklarna och lägg i `svg-players/`:
  `royal.svg`, `knight.svg`, `wizard.svg`, `fairy.svg`, `dragon.svg`.
- Vid karaktärsval i spelet laddas rätt fil automatiskt.
- Om filen saknas eller har fel i rigg-strukturen fångas undantaget i
  konsolen och spelet faller tillbaka till den gamla procedurella
  figuren (så spelet aldrig kraschar).

Vill du stödja fler karaktärer än de fem: lägg till en knapp i
`#charPicker` i `index.html` och en motsvarande nyckel i objektet
`SVG_PLAYER_SOURCES` som pekar på din nya .svg-fil.
