# Design — Live Content Creator Academy

> Documentazione di design della pagina **https://livecontentcreator.com/academy/**
> Stack: WordPress + Elementor + WooCommerce (tema custom `livecontentcreator`).

---

## 1. Identità visiva

### Palette colori (token globali Elementor)

| Token | Hex | Uso |
|---|---|---|
| Primary / Accent | `#FE0000` | Rosso brand: bottoni, CTA, evidenziazioni |
| Secondary | `#FFFFFF` | Bianco: testi su fondo scuro, superfici chiare |
| Text | `#F2F4F3` | Off-white: testo corrente su fondo scuro |
| Dark | `#1F1E23` | Quasi-nero: sfondi delle sezioni e footer |
| Crimson | `#CD1936` | Rosso secondario di supporto |
| Purple | `#6F58A2` | Viola accent secondario |

L'impianto generale è **dark-first**: fondi scuri (`#1F1E23`), testo chiaro (`#F2F4F3`) e il rosso `#FE0000` come unico colore ad alto contrasto per le azioni.

### Tipografia

| Ruolo | Font | Peso |
|---|---|---|
| Heading primari (H1–H2) | Mango Grotesque | 600 |
| Heading secondari | Mango Grotesque | 400 |
| Accent / label | Mango Grotesque | 500 |
| Testo corrente | Open Sans (Google Fonts, 300–800 variabile) | 400 |

- I titoli usano **Mango Grotesque**, un grotesque condensato e display, che dà il carattere "creator/video" del brand.
- Il body copy usa **Open Sans** per la leggibilità.

### Bottoni

Stile globale (kit Elementor):

```css
background-color: #FE0000;   /* primary */
color: #FFF;
font-family: "Open Sans", sans-serif;
font-size: 21px;
border-radius: 10px;
padding: 17px 30px;
```

Varianti CTA presenti in pagina:
- **"Accedi"** — login alla piattaforma
- **"Scopri di più"** — approfondimento corso
- **"Acquista ora"** — conversione (WooCommerce)
- **"Parliamone subito"** — contatto (`/contatti/`)

---

## 2. Struttura della pagina

### Header / Navigazione
- Logo **Live Content Creator Hub** (SVG)
- Menu principale: **Production** (sottomenu: Homepage, Creator, Live Coverage, Snack production, Formazione) · **Academy** · **Chi siamo** · **Blog** · **Contatti** · **Accedi**
- Menu hamburger su mobile con la stessa struttura

### Hero
- H1: **"Content Creation da Smartphone"** (varianti: "Smartphone Video Production", "Mobile Videomaking")
- Claim: *"La piattaforma online per imparare a creare contenuti dal tuo smartphone"*
- CTA: "Accedi" + "Scopri di più"

### Sezione 2 — Introduzione ai percorsi
- Heading: **"Percorsi online con Gio Russo e il suo team"**
- Testo su lezioni on-demand e sessioni one-to-one personalizzate
- Immagine fotografica di produzione

### Sezione 3 — I 6 pilastri formativi
Griglia di moduli **icona SVG + titolo + testo**:

1. **Gira e monta video con facilità** — editing da smartphone, transizioni, software
2. **Rendi i tuoi contenuti unici** — storytelling creativo e transizioni innovative
3. **Lezioni pratiche con CapCut** — montaggio passo-passo, musica, transizioni
4. **Lavora in modo smart** — ottimizzazione del workflow
5. **Cresci grazie alla community** — ambiente di supporto e feedback
6. **Passa dal sapere alla pratica** — esercizi interattivi, podcast, valutazioni

### Sezione 4 — Manifesto del percorso
- Heading: *"Il nostro percorso formativo online è pensato per chi vuole dare un boost alla propria creatività e iniziare a creare contenuti straordinari"*
- Due immagini fotografiche di produzione

### Sezione 5 — Offerta corsi (card con prezzo)

| Corso | Prezzo | Link |
|---|---|---|
| **Content Pack** | €600,00 | `/academy/content-pack/` |
| **Live Session** (one-to-one) | €199,00 | `/academy/live-session-one-to-one/` |

Ogni card: thumbnail + prezzo + "Acquista ora" + "Scopri di più".

### Sezione 6 — Testimonianze (carousel Swiper)
Cinque recensioni a rotazione: **Dominic** (messa in pratica istantanea della teoria), **Alberto** (creatività dallo smartphone), **Gabriele** ("super pratico, divertente"), **Yellow** (montaggio rapido in un'ora), **Margherita** (valore del corso dal 2020).

### Sezione 7 — FAQ (accordion)
Nove voci espandibili: cos'è l'Academy, competenze apprese, prerequisiti, strumenti necessari, iscrizione, durata e struttura (20 videolezioni con moduli, teoria, esercizi e valutazioni), networking, gestione professionale dei social, differenza videomaker vs live content creator.

### Sezione 8 — CTA finale
- Heading: **"Hai domande o vuoi scoprire il percorso più adatto a te?"**
- Bottone "Parliamone subito" → `/contatti/`

### Footer
Quattro colonne:
1. **Brand** — logo + *"La prima piattaforma di Live Content Creator® in Italia"* · info@livecontentcreator.com · tel. 3485845775
2. **Navigazione** — Home, Blog, Chi siamo, Contatti
3. **Scopri** — Production, Academy
4. **Social & App** — Instagram/TikTok/LinkedIn (Production), Instagram (Academy), app Analyzer e Transformer

Barra inferiore: Privacy | Cookie | Terms · *GIO RUSSO SRL — Copyright © 2026* · Viale Zara 9, 20159 Milano · P.IVA 04221630983

---

## 3. Pattern di layout

- **Griglia responsive** multi-colonna con breakpoint custom Elementor (mobile ≤768px)
- **Card** per i corsi con prezzo e doppia CTA
- **Moduli icona + testo** per i pilastri formativi
- **Accordion** per le FAQ
- **Carousel** (Swiper 11) per le testimonianze
- Icone e logo in **SVG**, foto di produzione come supporto visivo

## 4. Tono e messaggi chiave

- Approccio **smartphone-first** alla produzione video professionale
- Apprendimento **pratico** ("dal sapere alla pratica") più che teorico
- Community e crescita collaborativa
- Competenza su **CapCut** come strumento di riferimento
- Target: dai principianti ai creator avanzati, focus su Reels/TikTok/Stories

## 5. Note tecniche

- CMS: WordPress 7.0 · Elementor 4.1.3 · WooCommerce 10.8.1
- Ottimizzazione: CSS/JS minificati via WP-Optimize, `font-display: swap`
- Font caricati da Google Fonts (Open Sans) + font proprietario (Mango Grotesque)
