// Genera las imágenes placeholder del sitio (productos, hero, nosotros, videos, OG, logo e íconos).
// Se generan como JPG/PNG reales (no SVG) para que next/image las optimice igual que a las fotos
// definitivas: reemplazar una foto es pisar el archivo con el mismo nombre, sin tocar código.
// Uso: npm run images:placeholders  (pisa los archivos existentes, no correrlo después de cargar fotos reales)
import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const INK = "#0E0F11";
const INK_2 = "#1A1C21";
const CHALK = "#F3F0E8";
const ACCENT = "#FF5B1F";
const LIME = "#D4FF3A";
const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";

const BIKES = [
    ["venzo-raptor-exo-29", "VENZO RAPTOR EXO", "MTB · R29"],
    ["olmo-wish-290", "OLMO WISH 290", "MTB · R29"],
    ["topmega-sunshine-26", "TOPMEGA SUNSHINE", "URBANA · R26"],
    ["raleigh-urban-2-700", "RALEIGH URBAN 2.0", "URBANA · 700C"],
    ["venzo-strada-700", "VENZO STRADA", "RUTA · 700C"],
    ["firebird-kids-16", "FIREBIRD KIDS", "INFANTIL · R16"],
    ["topmega-flash-20", "TOPMEGA FLASH", "INFANTIL · R20"],
    ["slp-e-city-26", "SLP E-CITY", "ELÉCTRICA · R26"],
];

const ACCESSORIES = [
    ["casco-urbano-vairo", "CASCO URBANO", "casco"],
    ["casco-mtb-raleigh-pro", "CASCO MTB PRO", "casco"],
    ["casco-infantil-gw", "CASCO INFANTIL", "casco"],
    ["kit-luces-led-usb", "KIT LUCES LED", "luz"],
    ["faro-delantero-800", "FARO 800 LM", "luz"],
    ["luz-trasera-sensor-freno", "LUZ TRASERA", "luz"],
    ["candado-u-lock", "U-LOCK", "candado"],
    ["cadena-candado-120", "CADENA 120 CM", "candado"],
    ["candado-espiral-llave", "CANDADO ESPIRAL", "candado"],
    ["inflador-pie-manometro", "INFLADOR DE PIE", "taller"],
    ["lubricante-cadena-seco", "LUBRICANTE SECO", "taller"],
    ["camara-29-presta", "CÁMARA R29", "taller"],
];

function speedLines(width, height, color, opacity) {
    let lines = "";
    for (let i = 0; i < 14; i++) {
        const y = Math.round(((i * 37) % 100) * (height / 100));
        const len = width * (0.15 + ((i * 13) % 30) / 100);
        const x = Math.round(((i * 53) % 100) * (width / 100) - len / 2);
        lines += `<rect x="${x}" y="${y}" width="${Math.round(len)}" height="${i % 3 === 0 ? 3 : 1.5}" rx="1.5" fill="${color}" opacity="${opacity}"/>`;
    }
    return lines;
}

function bikeArt(cx, cy, scale, frameColor, wheelColor) {
    const r = 120 * scale;
    const rear = [cx - 190 * scale, cy];
    const front = [cx + 190 * scale, cy];
    const bb = [cx - 20 * scale, cy];
    const seat = [cx - 70 * scale, cy - 170 * scale];
    const head = [cx + 120 * scale, cy - 160 * scale];
    const sw = 14 * scale;
    return `
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="${rear[0]}" cy="${rear[1]}" r="${r}" stroke="${wheelColor}" stroke-width="${sw}"/>
            <circle cx="${front[0]}" cy="${front[1]}" r="${r}" stroke="${wheelColor}" stroke-width="${sw}"/>
            <circle cx="${rear[0]}" cy="${rear[1]}" r="${r * 0.12}" fill="${wheelColor}"/>
            <circle cx="${front[0]}" cy="${front[1]}" r="${r * 0.12}" fill="${wheelColor}"/>
            <path d="M${rear[0]} ${rear[1]} L${bb[0]} ${bb[1]} L${seat[0]} ${seat[1]} Z M${bb[0]} ${bb[1]} L${head[0]} ${head[1]} L${seat[0]} ${seat[1]} M${head[0]} ${head[1]} L${front[0]} ${front[1]}"
                stroke="${frameColor}" stroke-width="${sw * 1.3}"/>
            <path d="M${seat[0] - 40 * scale} ${seat[1] - 18 * scale} L${seat[0] + 30 * scale} ${seat[1] - 18 * scale}" stroke="${wheelColor}" stroke-width="${sw * 1.4}"/>
            <path d="M${head[0]} ${head[1]} L${head[0] - 10 * scale} ${head[1] - 40 * scale} L${head[0] + 50 * scale} ${head[1] - 50 * scale}" stroke="${wheelColor}" stroke-width="${sw}"/>
            <circle cx="${bb[0]}" cy="${bb[1]}" r="${26 * scale}" stroke="${wheelColor}" stroke-width="${sw * 0.7}"/>
        </g>`;
}

function accessoryArt(kind, cx, cy, s) {
    const stroke = `fill="none" stroke="${CHALK}" stroke-width="${16 * s}" stroke-linecap="round" stroke-linejoin="round"`;
    if (kind === "casco") {
        return `<path d="M${cx - 170 * s} ${cy + 40 * s} C${cx - 170 * s} ${cy - 150 * s} ${cx + 170 * s} ${cy - 150 * s} ${cx + 170 * s} ${cy + 40 * s} Z" ${stroke}/>
            <path d="M${cx - 80 * s} ${cy - 90 * s} L${cx - 40 * s} ${cy + 40 * s} M${cx} ${cy - 110 * s} L${cx} ${cy + 40 * s} M${cx + 80 * s} ${cy - 90 * s} L${cx + 40 * s} ${cy + 40 * s}" stroke="${ACCENT}" stroke-width="${14 * s}" stroke-linecap="round"/>`;
    }
    if (kind === "luz") {
        let rays = "";
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4;
            rays += `<path d="M${cx + Math.cos(a) * 120 * s} ${cy + Math.sin(a) * 120 * s} L${cx + Math.cos(a) * 170 * s} ${cy + Math.sin(a) * 170 * s}" stroke="${ACCENT}" stroke-width="${14 * s}" stroke-linecap="round"/>`;
        }
        return `<circle cx="${cx}" cy="${cy}" r="${80 * s}" ${stroke}/><circle cx="${cx}" cy="${cy}" r="${30 * s}" fill="${LIME}"/>${rays}`;
    }
    if (kind === "candado") {
        return `<path d="M${cx - 80 * s} ${cy - 10 * s} L${cx - 80 * s} ${cy - 90 * s} C${cx - 80 * s} ${cy - 200 * s} ${cx + 80 * s} ${cy - 200 * s} ${cx + 80 * s} ${cy - 90 * s} L${cx + 80 * s} ${cy - 10 * s}" ${stroke}/>
            <rect x="${cx - 130 * s}" y="${cy - 10 * s}" width="${260 * s}" height="${190 * s}" rx="${24 * s}" fill="${ACCENT}"/>
            <circle cx="${cx}" cy="${cy + 70 * s}" r="${20 * s}" fill="${INK}"/>`;
    }
    return `<path d="M${cx - 150 * s} ${cy + 150 * s} L${cx + 40 * s} ${cy - 40 * s}" ${stroke}/>
        <path d="M${cx + 40 * s} ${cy - 40 * s} m-40 -40 a${90 * s} ${90 * s} 0 1 1 ${80 * s} ${80 * s} l${40 * s} -${70 * s} l-${50 * s} -${50 * s} z" fill="${ACCENT}"/>`;
}

function label(x, y, title, subtitle, size) {
    return `
        <text x="${x}" y="${y}" font-family="${FONT}" font-weight="800" font-size="${size}" fill="${CHALK}" letter-spacing="1">${title}</text>
        <text x="${x}" y="${y + size * 0.9}" font-family="${FONT}" font-weight="700" font-size="${size * 0.45}" fill="${LIME}" letter-spacing="4">${subtitle}</text>`;
}

function placeholderTag(x, y) {
    return `<g><rect x="${x}" y="${y}" width="230" height="40" rx="20" fill="${CHALK}" opacity="0.12"/>
        <text x="${x + 115}" y="${y + 26}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="15" fill="${CHALK}" letter-spacing="3" opacity="0.8">FOTO PLACEHOLDER</text></g>`;
}

function frame(width, height, inner, from, to) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
            </linearGradient>
            <radialGradient id="glow" cx="0.7" cy="0.3" r="0.7">
                <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.35"/><stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
            </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <rect width="100%" height="100%" fill="url(#glow)"/>
        ${speedLines(width, height, CHALK, 0.07)}
        ${inner}
    </svg>`;
}

async function write(svg, file, format) {
    const out = path.join(PUBLIC, file);
    mkdirSync(path.dirname(out), { recursive: true });
    const img = sharp(Buffer.from(svg));
    if (format === "png") {
        await img.png().toFile(out);
    } else {
        await img.jpeg({ quality: 82, mozjpeg: true }).toFile(out);
    }
    console.log("✓", file);
}

async function bikes() {
    for (const [slug] of BIKES) {
        const svg = frame(
            1200,
            900,
            `${bikeArt(600, 500, 1.25, ACCENT, CHALK)}${placeholderTag(900, 50)}`,
            INK_2,
            INK,
        );
        await write(svg, `images/bikes/${slug}.jpg`);
    }
}

async function accessories() {
    for (const [slug, , kind] of ACCESSORIES) {
        const svg = frame(
            900,
            900,
            `${accessoryArt(kind, 450, 460, 1.2)}${placeholderTag(620, 40)}`,
            "#22252B",
            INK,
        );
        await write(svg, `images/accessories/${slug}.jpg`);
    }
}

async function scenes() {
    const hero = frame(
        1920,
        1080,
        `${bikeArt(1300, 700, 2.1, ACCENT, CHALK)}${speedLines(1920, 1080, ACCENT, 0.18)}${placeholderTag(1640, 60)}`,
        "#16181C",
        "#050506",
    );
    await write(hero, "images/hero-poster.jpg");

    const heroMobile = frame(
        1080,
        1920,
        `${bikeArt(560, 1250, 1.6, ACCENT, CHALK)}${speedLines(1080, 1920, ACCENT, 0.18)}${placeholderTag(800, 80)}`,
        "#16181C",
        "#050506",
    );
    await write(heroMobile, "images/hero-poster-mobile.jpg");

    const about = [
        ["about/local.jpg", 1600, 1100, "EL LOCAL", "MITRE 4701"],
        ["about/taller.jpg", 1200, 1500, "EL TALLER", "MANOS A LA OBRA"],
        ["about/equipo.jpg", 1200, 1500, "EL EQUIPO", "2 MECÁNICOS"],
    ];
    for (const [file, w, h, title, sub] of about) {
        const svg = frame(
            w,
            h,
            `${bikeArt(w / 2, h * 0.5, w / 1400, ACCENT, CHALK)}${label(70, h - 140, title, sub, 64)}${placeholderTag(w - 290, 50)}`,
            "#2A2D33",
            INK,
        );
        await write(svg, `images/${file}`);
    }

    const videos = [
        ["videos/poster-taller.jpg", "SERVICE EN VIVO"],
        ["videos/poster-local.jpg", "RECORRÉ EL LOCAL"],
        ["videos/poster-ruta.jpg", "SALIMOS A RODAR"],
    ];
    for (const [file] of videos) {
        const svg = frame(
            1080,
            1920,
            `${bikeArt(540, 820, 1.3, ACCENT, CHALK)}${placeholderTag(800, 80)}`,
            "#24262C",
            INK,
        );
        await write(svg, `images/${file}`);
    }
}

function wordmark(width, height, textColor) {
    const s = height / 200;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <g transform="translate(${100 * s} ${100 * s})">
            <circle r="${72 * s}" fill="none" stroke="${ACCENT}" stroke-width="${16 * s}"/>
            <circle r="${18 * s}" fill="${ACCENT}"/>
            ${[0, 60, 120, 180, 240, 300]
                .map(function (a) {
                    const rad = (a * Math.PI) / 180;
                    return `<path d="M0 0 L${Math.cos(rad) * 64 * s} ${Math.sin(rad) * 64 * s}" stroke="${ACCENT}" stroke-width="${6 * s}" stroke-linecap="round"/>`;
                })
                .join("")}
        </g>
        <text x="${200 * s}" y="${118 * s}" font-family="${FONT}" font-weight="900" font-style="italic" font-size="${96 * s}" fill="${textColor}" letter-spacing="${1 * s}">PEDALEA</text>
        <text x="${206 * s}" y="${168 * s}" font-family="${FONT}" font-weight="700" font-size="${36 * s}" fill="${ACCENT}" letter-spacing="${18 * s}">BIKES</text>
    </svg>`;
}

async function brand() {
    await write(wordmark(1400, 400, CHALK), "logo.png", "png");

    const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
        <rect width="512" height="512" rx="112" fill="${INK}"/>
        <g transform="translate(256 256)">
            <circle r="150" fill="none" stroke="${ACCENT}" stroke-width="34"/>
            <circle r="40" fill="${ACCENT}"/>
            ${[0, 60, 120, 180, 240, 300]
                .map(function (a) {
                    const rad = (a * Math.PI) / 180;
                    return `<path d="M0 0 L${Math.cos(rad) * 135} ${Math.sin(rad) * 135}" stroke="${ACCENT}" stroke-width="12" stroke-linecap="round"/>`;
                })
                .join("")}
        </g>
    </svg>`;
    await write(icon, "../src/app/icon.png", "png");
    await write(icon, "../src/app/apple-icon.png", "png");

    const og = frame(
        1200,
        630,
        `${bikeArt(880, 400, 1.05, ACCENT, CHALK)}
        <text x="70" y="250" font-family="${FONT}" font-weight="900" font-style="italic" font-size="120" fill="${CHALK}">PEDALEA</text>
        <text x="76" y="310" font-family="${FONT}" font-weight="700" font-size="40" fill="${ACCENT}" letter-spacing="20">BIKES</text>
        <text x="72" y="430" font-family="${FONT}" font-weight="700" font-size="34" fill="${CHALK}">Bicis, accesorios y taller</text>
        <text x="72" y="480" font-family="${FONT}" font-weight="500" font-size="28" fill="${LIME}">Mitre 4701 · Santa Fe Capital</text>`,
        "#16181C",
        INK,
    );
    await write(og, "../src/app/opengraph-image.jpg");
}

await bikes();
await accessories();
await scenes();
await brand();
