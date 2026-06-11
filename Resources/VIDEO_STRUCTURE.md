# Estructura del Video de Referencia - FixedGap Demo

## Datos Tecnicos
- **Archivo:** `VideoReferencia.mp4`
- **Duracion:** 1:15.60 (75.6 segundos)
- **Resolucion:** 1280x714
- **FPS:** 30
- **Codec video:** H.264 (High)
- **Codec audio:** AAC LC, 44100 Hz, stereo, 128 kb/s
- **Bitrate total:** 339 kb/s

---

## Estructura por Segmentos

### SEGMENTO 1 — Introduccion Narrativa (0:00 - 0:08)
**Tema:** Presentacion del personaje ficticio (la paciente Maria)

| Tiempo | Contenido Visual | Texto en Pantalla |
|--------|-----------------|-------------------|
| 0:00-0:03 | Fondo oscuro azul marino con efecto de linea luminosa horizontal (lens flare). Tipografia serif grande centrada. | "Meet **Maria**." (Maria en azul cyan) |
| 0:03-0:06 | Mismo fondo oscuro. Texto principal arriba, subtexto tipo terminal/monospace debajo con efecto de escritura (typewriter). | "**Stroke survivor.**" + "Next appointment: 6 weeks away." |
| 0:06-0:08 | Mismo fondo, el subtexto termina de revelarse completamente. | Texto completo visible: "Next appointment: 6 weeks away." |

**Estilo visual:** Fondo degradado azul muy oscuro/navy, particulas sutiles tipo estrellas, tipografia serif bold (estilo editorial/cinematic), acentos en azul cyan.

---

### SEGMENTO 2 — Demo del Juego + Propuesta de Valor Tecnica (0:09 - 0:14)
**Tema:** Mostrar la sesion gamificada y las capacidades tecnicas

| Tiempo | Contenido Visual | Texto en Pantalla |
|--------|-----------------|-------------------|
| 0:09-0:11 | Layout dividido: izquierda texto grande + badges, derecha mockup del juego de pesca pixel-art con webcam del paciente en esquina inferior izquierda. HUD arriba con graficos de rendimiento. | Izq: "**60** SECONDS." + badges "SESSION TIME 60s" y "SETUP TIME 0s" + "Any camera. Any device." + "WEBRTC - CV PIPELINE - NO SDK" |
| 0:12-0:14 | Mismo layout. En el juego aparece overlay de hand tracking (landmarks de mano en azul). Texto izquierdo cambia. | Izq: "**Zero** HARDWARE." + "**From home.**" + "21 HAND - 468 FACE - GAZE - Fp - SNR" |

**Estilo visual del juego:** Juego tipo pixel-art de pesca (barco, peces, oceano al atardecer). Header: "PATIENT SESSION - HOME ENVIRONMENT - CAM-01". Badge "BETWEEN VISITS". Graficos de rendimiento en tiempo real (barras + linea). Webcam con feed real del paciente.

**Estilo visual del texto izquierdo:** Tipografia serif italic muy grande para numeros/titulares, monospace pequeña para badges tecnicos, linea separadora cyan.

---

### SEGMENTO 3 — Dashboard de Observacion Directa / CV en Tiempo Real (0:15 - 0:23)
**Tema:** Interfaz clinica de monitoring con computer vision

| Tiempo | Contenido Visual | Texto en Pantalla |
|--------|-----------------|-------------------|
| 0:15-0:17 | Dashboard completo "STEAMVAC - INFORME CLINICO EN TIEMPO REAL". Feed de camara con face mesh + hand landmarks. Panel derecho con metricas. Panel inferior con indice de recuperacion. | Header: "CAM-01 - DIRECT OBSERVATION - LIVE". Metricas: ALZAR: NO, APERTURA: 85, DEDOS: 5/5, VEL. PALMA: 0 m/s, ARCO MINICA: 164, TEMBLOR: 100 (ALERT!). FACIAL-SIMETRIA: 0.97/1, SONRISA: NO. INDICE: 93/100 OPTIMO |
| 0:18-0:20 | Misma interfaz pero con texto overlay a la izquierda que aparece progresivamente. | Overlay izq: "SIGNAL - MULTIMODAL - SYNCHRONIZED" + "**21** hand landmarks." + "**468** facial landmarks." |
| 0:21-0:23 | Texto overlay completo revelado. | Overlay completo: + "**Gaze. Pinch. Symmetry. Voice.**" + "ALL CAPTURED. SIMULTANEOUSLY." + "[FRAME-SYNC - 30FPS - CV PIPELINE - LATENCY <40MS]" |

**Estilo visual dashboard:** Fondo oscuro con bordes azul/cyan tipo HUD futurista. Feed de camara real con overlay de face mesh (puntos verdes ojos, contorno blanco cara) y hand landmarks (puntos azules articulaciones mano). Panel derecho organizado en grid 2x4 con metricas numericasgrandes y badges OK/ALERT. Grafico de tendencia en la parte inferior.

---

### SEGMENTO 4 — Notificacion al Medico (0:24 - 0:26)
**Tema:** El sistema notifica automaticamente al clinico cuando la sesion termina

| Tiempo | Contenido Visual | Texto en Pantalla |
|--------|-----------------|-------------------|
| 0:24-0:26 | Fondo completamente negro. Notificacion push estilo iOS/macOS centrada. Linea azul horizontal cruza la pantalla. | Notificacion: Gmail icon + "Gmail - now" + "**Maria D. — Session complete.**" + "Report ready. All markers within range. ↗" + Texto pequeño derecha: "REPORT PENDING COMP - VER 08 SS:19" |

**Estilo visual:** Fondo negro puro, contraste con la tarjeta de notificacion gris oscura con bordes redondeados. Linea horizontal azul cyan sutil.

---

### SEGMENTO 5 — Reporte Clinico Generado Automaticamente (0:27 - 0:32)
**Tema:** Dashboard/reporte completo que recibe el medico

| Tiempo | Contenido Visual | Texto en Pantalla |
|--------|-----------------|-------------------|
| 0:27-0:32 | Dashboard web completo con header "CLINICAL REPORT - SESSION COMPLETE". Datos del paciente, metricas por dominio, grafico de tendencia, highlights de sesion. Lineas decorativas con valores salen del dashboard hacia las esquinas. | Paciente: Maria Diaz Varela, Age 71, Post-stroke rehabilitation, Session Today May 13 2026, Status: PRESERVED/On track. CRI: 86/100 "Functionally preserved". Domain: PINCH 88, HAND OPENING 84, SMILE 82, VOICE 90. Trend chart May 7-13. Highlights: Hand ROM 94% (+12%), Reaction time 112ms (+8%), Facial symmetry 0.97. Footer: FixedGap, HIPAA COMPLIANT, Report generated automatically, Session duration 62 seconds, Secure connection |

**Estilo visual:** Dashboard con sidebar izquierdo (Home, Patients, Analytics, Reports, Alerts, Settings con badge "2"). Paleta azul oscuro/verde para positivos, cyan para acentos. Lineas punteadas decorativas salen del dashboard con etiquetas: "CLINICAL RECOVERY INDEX 86/100", "MOTOR FUNCTION 88%", "FACIAL SYMMETRY 82%", "VOICE QUALITY 90%".

---

### SEGMENTO 6 — Metricas por Dominio (Datos Objetivos) (0:33 - 0:41)
**Tema:** Desglose de metricas por dominio, enfasis en datos objetivos vs. subjetivos

| Tiempo | Contenido Visual | Texto en Pantalla |
|--------|-----------------|-------------------|
| 0:33-0:41 | Fondo negro con 4 columnas de metricas grandes. Header tecnico arriba. Texto statement abajo. | Header: "§6 - DOMAIN BREAKDOWN - PER-DOMAIN PERFORMANCE - 0-100". Columnas: **PINCH** 88/100 (THUMB-INDEX OPPOSITION, Δ +2.4) / **HAND OPENING** 84/100 (FINGER EXTENSION HOLD, Δ +2.4) / **SMILE** 82/100 (SYMMETRY & AMPLITUDE, Δ +3.1) / **VOICE** 90/100 (PHONATION QUALITY, Δ +0.6). Statement: "*Objective data. Not 'how are you feeling?'*" + "[DELTA - WK-OVER-WK - MOTOR +2.4 - FACIAL +1.8 - VOCAL +0.6]" |

**Estilo visual:** Fondo negro total. Numeros enormes en tipografia serif bold (estilo editorial). Labels en azul cyan monospace. Lineas separadoras azul. Texto statement en italic serif. Datos delta en texto pequeno debajo de cada metrica.

---

### SEGMENTO 7 — Transicion: Monitoreo Continuo (0:42 - 0:50)
**Tema:** Contraste entre monitoreo intermitente (problema) vs. continuo (solucion)

| Tiempo | Contenido Visual | Texto en Pantalla |
|--------|-----------------|-------------------|
| 0:42-0:44 | Fondo negro, transicion. Texto pequeño header. | "MULTIMODAL CAPTURE - REAL-TIME ANALYSIS" (inicio transicion) |
| 0:45-0:47 | Fondo oscuro degradado rojizo/dramatico. Linea EKG roja horizontal con un solo latido y luego linea plana. | Header rojo: "MONITORING - OFFLINE - NO SIGNAL". Texto: "**Last data point:**" + linea EKG roja + "GAP: 6 WEEKS" |
| 0:48-0:50 | Transicion dramatica: cambia a azul. Texto grande. Linea de datos continua aparece abajo. | Header verde: "MONITORING - ONLINE - LIVE". Texto: "Last data point:" (pequeño arriba) + "**This morning.**" (enorme, azul cyan). Grafico de linea continua aparece abajo con punto "LIVE" verde. |

**Estilo visual:** Contraste dramatico rojo (offline/problema) vs. azul/verde (online/solucion). La linea EKG roja con gap simboliza la falta de datos entre citas. La transicion a azul con datos continuos muestra la propuesta de valor.

---

### SEGMENTO 8 — Deployment / Plataforma (0:51 - 0:54)
**Tema:** Facilidad de despliegue, sin instalacion

| Tiempo | Contenido Visual | Texto en Pantalla |
|--------|-----------------|-------------------|
| 0:51-0:54 | Fondo azul oscuro con particulas. Linea azul horizontal en la parte superior. | Footer centrado: "DEPLOYMENT - BROWSER-NATIVE - NO INSTALL" |

**Estilo visual:** Minimalista, mismo fondo azul oscuro con particulas del inicio. Transicion rapida.

---

### SEGMENTO 9 — Estadisticas de Impacto (0:54 - 0:57)
**Tema:** Numero de pacientes validados / traccion

| Tiempo | Contenido Visual | Texto en Pantalla |
|--------|-----------------|-------------------|
| 0:54-0:57 | Fondo azul oscuro. Numero grande centrado con circulo animado alrededor. | "**14**" (numero grande cyan brillante con glow, circulo animado rodeandolo) |

**Estilo visual:** Numero cyan/turquesa neon con efecto glow. Circulo delgado animado alrededor. Fondo azul oscuro uniforme con particulas sutiles.

---

### SEGMENTO 10 — El Problema / Manifiesto (0:57 - 1:02)
**Tema:** Declaracion del gap en el sistema de salud

| Tiempo | Contenido Visual | Texto en Pantalla |
|--------|-----------------|-------------------|
| 0:57-0:59 | Fondo negro total. Texto centrado en dos lineas, estilo manifiesto. | "673 patients per clinician. No one is watching at home. There is a **GAP**" (GAP en rojo) + "Stroke recovery happens in 12 weeks. Clinicians see 2 of them. There is a" |
| 1:00-1:02 | Continua. Segunda declaracion completa. | "Stroke recovery happens in 12 weeks. Clinicians see 2 of them. There is a" (se desvanece arriba) + "**The data exists. The camera exists. The patient exists. There is a GAP**" (GAP en rojo con particulas) |

**Estilo visual:** Fondo negro puro. Tipografia serif italic mediana-grande. "GAP" resaltado en rojo con efecto sparkle/particulas rojas. Estilo tipo pitch deck / presentacion cinematic.

---

### SEGMENTO 11 — Cierre / CTA (1:03 - 1:15)
**Tema:** Call to action final con la marca

| Tiempo | Contenido Visual | Texto en Pantalla |
|--------|-----------------|-------------------|
| 1:03-1:12 | Fondo negro total. Logo/URL centrado. | "**FIXEDGAP**.com" (FIXEDGAP en blanco, .com en azul cyan/glow) |
| 1:13-1:15 | Fade a negro total. | (negro) |

**Estilo visual:** Tipografia sans-serif bold/uppercase para "FIXEDGAP", ".com" en azul con efecto glow sutil. Fondo negro puro. Permanece varios segundos para dar peso al cierre.

---

## Paleta de Colores General

| Uso | Color | Hex aproximado |
|-----|-------|----------------|
| Fondo principal | Azul muy oscuro / Navy | #0a1628 |
| Fondo alternativo | Negro puro | #000000 |
| Acento principal | Cyan / Azul claro | #00b4d8 |
| Acento secundario | Azul medio (glow) | #4a90d9 |
| Texto principal | Blanco | #ffffff |
| Texto secundario | Gris claro | #a0a0a0 |
| Alerta / Negativo | Rojo | #e63946 |
| Positivo / OK | Verde | #2ecc71 |
| Monospace/labels | Cyan apagado | #5a8a9a |

## Tipografias Observadas

- **Titulares grandes:** Serif bold/italic (tipo Playfair Display o similar editorial)
- **Numeros enormes:** Serif bold con alto contraste (tipo Didot/Bodoni)
- **Labels tecnicos/badges:** Monospace uppercase tracking amplio (tipo JetBrains Mono o similar)
- **Texto body/statements:** Serif italic
- **Notificacion:** Sans-serif (SF Pro / system font)

## Elementos Recurrentes

1. **Particulas flotantes** — puntos blancos/grises sutiles tipo estrellas en fondo oscuro
2. **Lineas horizontales luminosas** — cyan/azul que cruzan la pantalla en transiciones
3. **Badges/headers tecnicos** — texto monospace uppercase con separadores " - " (ej: "SIGNAL - MULTIMODAL - SYNCHRONIZED")
4. **Efecto typewriter** — texto que se escribe caracter a caracter
5. **Bordes HUD** — esquinas tipo brackets [ ] en las cuatro esquinas del frame (segmento juego)
6. **Glow/bloom** — numeros y textos destacados con efecto de brillo difuso
7. **Transiciones** — cortes directos entre segmentos, sin fades suaves (excepto el final)

## Musica/Audio

- Banda sonora tipo cinematic/electronic ambient (basado en la presencia de audio AAC estero)
- Probablemente musica de fondo sin voz en off (pendiente confirmacion)

---

## Notas para Edicion Futura

- Los segmentos mas susceptibles de edicion son los que muestran datos especificos de la plataforma (metricas, numeros de pacientes, screenshots de la app)
- El segmento del juego de pesca (Seg. 2) muestra la interfaz de gameplay con overlays de CV
- El dashboard clinico (Seg. 3 y 5) muestra la UI actual de la plataforma
- Las metricas numericas (Seg. 6, 9) pueden necesitar actualizacion si cambian los datos
- El manifiesto/pitch (Seg. 10) contiene estadisticas del problema que podrian actualizarse
