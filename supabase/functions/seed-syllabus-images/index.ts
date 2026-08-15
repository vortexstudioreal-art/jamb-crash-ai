import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

function toDataUri(svg: string): string {
  const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="500" height="350"><rect width="500" height="350" fill="#fff" rx="8"/><style>text{font-family:Arial,sans-serif;font-size:14px;fill:#333}line{stroke:#333;stroke-width:2}circle{fill:none;stroke:#333;stroke-width:2}polygon{fill:none;stroke:#333;stroke-width:2}rect.styled{fill:#f0f0f0;stroke:#333;stroke-width:2;rx:4}</style>${svg}</svg>`;
  const bytes = new TextEncoder().encode(full);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return "data:image/svg+xml;base64," + btoa(s);
}

const DIAGRAMS: Record<string, { keywords: string[]; svg: string }[]> = {
  physics: [
    {
      keywords: ["circuit", "current", "electricity", "series", "parallel"],
      svg: `<line x1="60" y1="300" x2="60" y2="200" stroke-width="3"/><line x1="40" y1="230" x2="80" y2="230" stroke-width="3"/><line x1="45" y1="245" x2="75" y2="245" stroke-width="3"/><line x1="60" y1="245" x2="60" y2="300" stroke-width="3"/><text x="15" y="320" font-size="12">Battery</text><line x1="60" y1="200" x2="180" y2="200"/><circle cx="230" cy="200" r="35"/><line x1="230" y1="165" x2="230" y2="235"/><text x="230" y="265" font-size="12" text-anchor="middle">Bulb</text><line x1="265" y1="200" x2="340" y2="200"/><line x1="340" y1="200" x2="340" y2="300"/><line x1="340" y1="300" x2="60" y2="300"/><text x="400" y="205" font-size="12">Switch</text><rect x="380" y="190" width="30" height="20" fill="none" stroke="#333" stroke-width="1.5"/><line x1="380" y1="200" x2="340" y2="200" stroke-dasharray="3"/><text x="60" y="50" font-size="16" font-weight="bold">Simple Electrical Circuit</text><text x="60" y="70" font-size="12" fill="#666">Current flows from battery → bulb → switch</text>`,
    },
    {
      keywords: ["velocity", "speed", "motion", "acceleration", "graph"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Velocity-Time Graph</text><line x1="60" y1="280" x2="460" y2="280" stroke-width="2"/><line x1="60" y1="280" x2="60" y2="40" stroke-width="2"/><text x="240" y="320" font-size="13" text-anchor="middle">Time (s)</text><text x="20" y="160" text-anchor="middle" transform="rotate(-90,20,160)" font-size="13">Velocity (m/s)</text><line x1="60" y1="280" x2="140" y2="200" stroke="#e74c3c" stroke-width="3"/><circle cx="140" cy="200" r="4" fill="#e74c3c"/><line x1="140" y1="200" x2="260" y2="200" stroke="#e74c3c" stroke-width="3"/><circle cx="260" cy="200" r="4" fill="#e74c3c"/><line x1="260" y1="200" x2="340" y2="240" stroke="#e74c3c" stroke-width="3"/><line x1="340" y1="240" x2="440" y2="280" stroke="#e74c3c" stroke-width="3"/><text x="65" y="295" font-size="11">0</text><text x="135" y="295" font-size="11">2</text><text x="255" y="295" font-size="11">6</text><text x="335" y="295" font-size="11">10</text><text x="435" y="295" font-size="11">14</text><text x="35" y="205" font-size="11">10</text><text x="35" y="285" font-size="11">0</text><text x="240" y="140" font-size="12" fill="#888" text-anchor="middle">Area under graph = total distance</text>`,
    },
    {
      keywords: ["force", "friction", "newton", "weight", "mass", "block"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Forces on a Block</text><rect x="170" y="130" width="160" height="100" fill="#e8f4f8" stroke="#333" stroke-width="2" rx="6"/><text x="210" y="185" font-size="16" text-anchor="middle" font-weight="bold">m</text><line x1="250" y1="130" x2="250" y2="50" stroke="#2ecc71" stroke-width="3"/><polygon points="245,55 250,45 255,55" fill="#2ecc71"/><text x="265" y="55" font-size="13" fill="#2ecc71">Normal (R)</text><line x1="250" y1="230" x2="250" y2="310" stroke="#e74c3c" stroke-width="3"/><polygon points="245,305 250,315 255,305" fill="#e74c3c"/><text x="265" y="315" font-size="13" fill="#e74c3c">Weight (mg)</text><line x1="330" y1="180" x2="430" y2="180" stroke="#3498db" stroke-width="3"/><polygon points="425,175 435,180 425,185" fill="#3498db"/><text x="410" y="168" font-size="13" fill="#3498db">F</text><line x1="170" y1="200" x2="70" y2="200" stroke="#f39c12" stroke-width="3"/><polygon points="75,195 65,200 75,205" fill="#f39c12"/><text x="30" y="190" font-size="13" fill="#f39c12">Friction (f)</text><text x="250" y="340" font-size="12" fill="#888" text-anchor="middle">ΣF = ma  →  F - f = ma</text>`,
    },
    {
      keywords: ["lens", "mirror", "ray", "optics", "light", "convex", "concave", "refraction", "reflection"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Convex Lens Ray Diagram</text><line x1="250" y1="40" x2="260" y2="55"/><line x1="260" y1="55" x2="265" y2="100"/><line x1="265" y1="100" x2="265" y2="280"/><line x1="265" y1="280" x2="260" y2="320"/><line x1="260" y1="320" x2="250" y2="335"/><text x="280" y="190" font-size="12">Lens</text><line x1="30" y1="190" x2="470" y2="190" stroke-dasharray="5,3"/><circle cx="150" cy="190" r="4" fill="#2ecc71"/><text x="135" y="178" font-size="11" fill="#2ecc71">F</text><circle cx="350" cy="190" r="4" fill="#2ecc71"/><text x="335" y="178" font-size="11" fill="#2ecc71">F'</text><circle cx="80" cy="190" r="3" fill="#3498db"/><text x="65" y="178" font-size="11" fill="#3498db">2F</text><line x1="80" y1="190" x2="80" y2="110" stroke="#e74c3c" stroke-width="3"/><polygon points="75,115 80,105 85,115" fill="#e74c3c"/><text x="60" y="95" font-size="12" fill="#e74c3c">Object</text><line x1="80" y1="110" x2="265" y2="110" stroke="#9b59b6" stroke-width="1.5"/><line x1="265" y1="110" x2="410" y2="210" stroke="#9b59b6" stroke-width="1.5" stroke-dasharray="4,3"/><line x1="80" y1="110" x2="380" y2="250" stroke="#e67e22" stroke-width="1.5"/><line x1="380" y1="190" x2="380" y2="230" stroke="#2c3e50" stroke-width="3"/><polygon points="375,225 380,235 385,225" fill="#2c3e50"/><text x="385" y="255" font-size="12">Image</text><text x="250" y="350" font-size="11" fill="#888" text-anchor="middle">Object at 2F → Image at 2F (real, same size)</text>`,
    },
  ],
  biology: [
    {
      keywords: ["cell", "plant cell", "animal cell", "organelle", "chloroplast"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Plant Cell Structure</text><rect x="50" y="70" width="400" height="250" fill="#e8f8e8" stroke="#27ae60" stroke-width="3" rx="12"/><text x="460" y="90" font-size="11" fill="#27ae60">Cell Wall</text><rect x="70" y="90" width="360" height="210" fill="#f0faf0" stroke="#2ecc71" stroke-width="1.5" rx="8"/><text x="455" y="110" font-size="11" fill="#2ecc71">Cell Membrane</text><circle cx="250" cy="150" r="40" fill="#f5e6ff" stroke="#8e44ad" stroke-width="2"/><text x="235" y="155" font-size="12" text-anchor="middle">Nucleus</text><circle cx="250" cy="135" r="8" fill="#8e44ad" fill-opacity="0.3"/><text x="315" y="110" font-size="11" fill="#8e44ad">Nucleus</text><ellipse cx="220" cy="270" rx="60" ry="25" fill="#d4e6f1" stroke="#5dade2" stroke-width="1.5"/><text x="185" y="275" font-size="11">Vacuole</text><ellipse cx="360" cy="210" rx="30" ry="18" fill="#58d68d" stroke="#27ae60" stroke-width="1.5"/><ellipse cx="360" cy="210" rx="12" ry="12" fill="#82e0aa"/><text x="340" y="240" font-size="11">Chloroplast</text><ellipse cx="140" cy="210" rx="25" ry="14" fill="#f5b041" stroke="#e67e22" stroke-width="1.5"/><text x="110" y="235" font-size="11">Mitochondrion</text><text x="250" y="335" font-size="12" fill="#888" text-anchor="middle">Plant cells have cell wall, chloroplasts, and large vacuole</text>`,
    },
    {
      keywords: ["heart", "circulation", "blood", "cardiac", "atrium", "ventricle"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Human Heart (Cross-Section)</text><path d="M 250 80 C 130 80 80 170 100 240 C 120 310 200 340 250 350 C 300 340 380 310 400 240 C 420 170 370 80 250 80 Z" fill="#fce4e4" stroke="#c0392b" stroke-width="2.5"/><line x1="250" y1="95" x2="250" y2="330" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="4,2"/><ellipse cx="195" cy="170" rx="40" ry="45" fill="#f5b7b1" fill-opacity="0.5" stroke="#c0392b" stroke-width="1.5"/><text x="195" y="160" font-size="12" text-anchor="middle" font-weight="bold">RA</text><ellipse cx="195" cy="270" rx="40" ry="45" fill="#d98880" fill-opacity="0.5" stroke="#c0392b" stroke-width="1.5"/><text x="195" y="270" font-size="12" text-anchor="middle" font-weight="bold">RV</text><ellipse cx="305" cy="170" rx="40" ry="45" fill="#f5b7b1" fill-opacity="0.5" stroke="#c0392b" stroke-width="1.5"/><text x="305" y="160" font-size="12" text-anchor="middle" font-weight="bold">LA</text><ellipse cx="305" cy="270" rx="42" ry="50" fill="#d98880" fill-opacity="0.5" stroke="#c0392b" stroke-width="1.5"/><text x="305" y="270" font-size="12" text-anchor="middle" font-weight="bold">LV</text><line x1="200" y1="125" x2="220" y2="60" stroke="#c0392b" stroke-width="2"/><line x1="300" y1="125" x2="280" y2="60" stroke="#c0392b" stroke-width="2"/><text x="85" y="170" font-size="11" fill="#666">Right</text><text x="85" y="182" font-size="11" fill="#666">Atrium</text><text x="85" y="270" font-size="11" fill="#666">Right</text><text x="85" y="282" font-size="11" fill="#666">Ventricle</text><text x="365" y="170" font-size="11" fill="#666">Left</text><text x="365" y="182" font-size="11" fill="#666">Atrium</text><text x="365" y="270" font-size="11" fill="#666">Left</text><text x="365" y="282" font-size="11" fill="#666">Ventricle</text><text x="250" y="375" font-size="11" fill="#888" text-anchor="middle">RA = Right Atrium, RV = Right Ventricle, LA = Left Atrium, LV = Left Ventricle</text>`,
    },
    {
      keywords: ["dna", "gene", "chromosome", "genetic", "heredity", "double helix"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">DNA Double Helix Structure</text><path d="M 120 70 C 180 110 80 140 140 180 C 200 220 100 250 160 290 C 220 330 120 360 180 390" fill="none" stroke="#3498db" stroke-width="3"/><path d="M 380 70 C 320 110 420 140 360 180 C 300 220 400 250 340 290 C 280 330 380 360 320 390" fill="none" stroke="#e74c3c" stroke-width="3"/><line x1="125" y1="80" x2="375" y2="80" stroke="#2ecc71" stroke-width="2"/><line x1="110" y1="130" x2="390" y2="130" stroke="#f39c12" stroke-width="2"/><line x1="130" y1="180" x2="370" y2="180" stroke="#2ecc71" stroke-width="2"/><line x1="115" y1="230" x2="385" y2="230" stroke="#9b59b6" stroke-width="2"/><line x1="130" y1="280" x2="370" y2="280" stroke="#2ecc71" stroke-width="2"/><line x1="110" y1="330" x2="390" y2="330" stroke="#f39c12" stroke-width="2"/><line x1="130" y1="380" x2="370" y2="380" stroke="#2ecc71" stroke-width="2"/><text x="115" y="410" font-size="11" fill="#888" text-anchor="middle">Blue strand = leading strand</text><text x="385" y="410" font-size="11" fill="#888" text-anchor="middle">Red strand = lagging strand</text><text x="250" y="430" font-size="11" fill="#888" text-anchor="middle">Rungs = complementary base pairs (A-T, G-C)</text>`,
    },
    {
      keywords: ["eye", "vision", "sight", "retina", "lens", "cornea"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Human Eye Structure</text><ellipse cx="250" cy="180" rx="180" ry="120" fill="#fef9e7" stroke="#333" stroke-width="2"/><ellipse cx="250" cy="180" rx="170" ry="110" fill="#fdf2e9" stroke="#666" stroke-width="1"/><!-- Cornea --><path d="M 90 160 Q 70 180 90 200" fill="#d4e6f1" stroke="#5dade2" stroke-width="2"/><text x="60" y="150" font-size="11">Cornea</text><!-- Lens --><ellipse cx="150" cy="180" rx="20" ry="30" fill="#f0e6d3" stroke="#e67e22" stroke-width="2"/><text x="125" y="185" font-size="11">Lens</text><!-- Iris --><ellipse cx="130" cy="160" rx="15" ry="8" fill="#5dade2" fill-opacity="0.3" stroke="#333" stroke-width="1"/><text x="105" y="155" font-size="11">Iris</text><!-- Pupil --><circle cx="130" cy="180" r="10" fill="#333"/><text x="110" y="215" font-size="11">Pupil</text><!-- Retina --><path d="M 380 130 Q 420 180 380 230" fill="none" stroke="#e74c3c" stroke-width="3"/><text x="395" y="150" font-size="11" fill="#e74c3c">Retina</text><!-- Optic nerve --><path d="M 380 180 Q 440 180 460 170" fill="none" stroke="#8e44ad" stroke-width="3"/><text x="400" y="240" font-size="11" fill="#8e44ad">Optic Nerve</text><!-- Ciliary muscles --><path d="M 120 130 Q 150 120 180 130" fill="none" stroke="#666" stroke-width="1"/><text x="130" y="125" font-size="10" fill="#666">Ciliary</text><text x="130" y="112" font-size="10" fill="#666">muscles</text><text x="250" y="320" font-size="12" fill="#888" text-anchor="middle">Light → Cornea → Pupil → Lens → Retina → Optic Nerve</text>`,
    },
  ],
  chemistry: [
    {
      keywords: ["periodic table", "element", "group", "period", "halogen", "alkali"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Periodic Table (Groups 1, 2, 17, 18)</text><rect x="40" y="80" width="70" height="55" fill="#ffcccc" stroke="#333" stroke-width="1.5" rx="3"/><text x="60" y="105" font-size="14" font-weight="bold">H</text><text x="60" y="125" font-size="10">1</text><rect x="390" y="80" width="70" height="55" fill="#ccffcc" stroke="#333" stroke-width="1.5" rx="3"/><text x="415" y="105" font-size="14" font-weight="bold">He</text><text x="415" y="125" font-size="10">2</text><rect x="40" y="145" width="70" height="55" fill="#ffcccc" stroke="#333" stroke-width="1.5" rx="3"/><text x="60" y="170" font-size="14" font-weight="bold">Li</text><text x="60" y="190" font-size="10">3</text><rect x="120" y="145" width="70" height="55" fill="#ccccff" stroke="#333" stroke-width="1.5" rx="3"/><text x="140" y="170" font-size="14" font-weight="bold">Be</text><text x="140" y="190" font-size="10">4</text><rect x="390" y="145" width="70" height="55" fill="#ccffcc" stroke="#333" stroke-width="1.5" rx="3"/><text x="410" y="170" font-size="14" font-weight="bold">Ne</text><text x="410" y="190" font-size="10">10</text><rect x="40" y="210" width="70" height="55" fill="#ffcccc" stroke="#333" stroke-width="1.5" rx="3"/><text x="55" y="235" font-size="14" font-weight="bold">Na</text><text x="55" y="255" font-size="10">11</text><rect x="120" y="210" width="70" height="55" fill="#ccccff" stroke="#333" stroke-width="1.5" rx="3"/><text x="135" y="235" font-size="14" font-weight="bold">Mg</text><text x="135" y="255" font-size="10">12</text><rect x="310" y="210" width="70" height="55" fill="#ffffcc" stroke="#333" stroke-width="1.5" rx="3"/><text x="330" y="235" font-size="14" font-weight="bold">Cl</text><text x="330" y="255" font-size="10">17</text><rect x="390" y="210" width="70" height="55" fill="#ccffcc" stroke="#333" stroke-width="1.5" rx="3"/><text x="410" y="235" font-size="14" font-weight="bold">Ar</text><text x="410" y="255" font-size="10">18</text><rect x="40" y="275" width="70" height="55" fill="#ffcccc" stroke="#333" stroke-width="1.5" rx="3"/><text x="60" y="300" font-size="14" font-weight="bold">K</text><text x="60" y="320" font-size="10">19</text><text x="60" y="80" font-size="11" fill="#ffcccc">●</text><text x="75" y="80" font-size="10" fill="#666">Group 1 (Alkali Metals)</text><text x="60" y="350" font-size="11" fill="#ffffcc">●</text><text x="75" y="350" font-size="10" fill="#666">Group 17 (Halogens)</text><text x="260" y="350" font-size="11" fill="#ccffcc">●</text><text x="275" y="350" font-size="10" fill="#666">Group 18 (Noble Gases)</text>`,
    },
    {
      keywords: ["electrolysis", "electrolyte", "electrode", "anode", "cathode"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Electrolysis Setup</text><rect x="120" y="90" width="260" height="180" fill="#d4e6f1" stroke="#5dade2" stroke-width="2" rx="6"/><text x="250" y="185" font-size="14" text-anchor="middle">Electrolyte</text><line x1="200" y1="100" x2="200" y2="260" stroke="#333" stroke-width="3"/><text x="200" y="280" font-size="12" text-anchor="middle">Cathode (−)</text><line x1="300" y1="100" x2="300" y2="260" stroke="#333" stroke-width="3"/><text x="300" y="280" font-size="12" text-anchor="middle">Anode (+)</text><!-- Battery --><rect x="220" y="50" width="60" height="40" fill="#f5b041" stroke="#e67e22" stroke-width="1.5" rx="3"/><text x="250" y="75" font-size="11" text-anchor="middle">Battery</text><line x1="200" y1="100" x2="230" y2="65"/><line x1="300" y1="100" x2="280" y2="65"/><text x="145" y="200" font-size="11">Negative ions</text><text x="335" y="200" font-size="11">Positive ions</text><text x="145" y="215" font-size="11">move to anode</text><text x="335" y="215" font-size="11">move to cathode</text><text x="60" y="90" font-size="10" fill="#e74c3c">−</text><text x="60" y="105" font-size="10" fill="#3498db">+</text><line x1="50" y1="100" x2="65" y2="100" stroke="#e74c3c" stroke-width="1.5"/><line x1="50" y1="109" x2="65" y2="109" stroke="#3498db" stroke-width="1.5"/><text x="40" y="133" font-size="10">DC</text><text x="40" y="145" font-size="10">Supply</text>`,
    },
  ],
  mathematics: [
    {
      keywords: ["triangle", "pythagoras", "right angle", "trigonometry"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Right-Angled Triangle</text><polygon points="80,300 330,300 80,70" fill="#e8f4f8" stroke="#333" stroke-width="2.5"/><line x1="80" y1="270" x2="110" y2="270" stroke="#333" stroke-width="1.5"/><line x1="110" y1="270" x2="110" y2="300" stroke="#333" stroke-width="1.5"/><text x="180" y="325" font-size="16" text-anchor="middle" font-weight="bold">b (adjacent)</text><text x="50" y="180" font-size="16" font-weight="bold">a (opposite)</text><text x="240" y="165" font-size="16" font-weight="bold">c (hypotenuse)</text><path d="M 80 300 L 100 300 L 100 280" fill="none" stroke="#e74c3c" stroke-width="2"/><text x="105" y="290" font-size="13" fill="#e74c3c">90°</text><text x="50" y="55" font-size="13">θ</text><path d="M 80 70 L 110 70 Q 80 100 80 70" fill="none" stroke="#3498db" stroke-width="1.5"/><text x="250" y="350" font-size="13" fill="#888" text-anchor="middle">Pythagoras: a² + b² = c²</text><text x="250" y="365" font-size="13" fill="#888" text-anchor="middle">sin θ = a/c, cos θ = b/c, tan θ = a/b</text>`,
    },
    {
      keywords: ["circle", "angle", "arc", "radius", "diameter", "chord", "tangent"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Circle Theorems</text><circle cx="250" cy="190" r="140" fill="#fef9e7" stroke="#333" stroke-width="2"/><circle cx="250" cy="190" r="4" fill="#333"/><text x="235" y="183" font-size="12">O</text><circle cx="160" cy="120" r="4" fill="#e74c3c"/><text x="140" y="112" font-size="14" fill="#e74c3c" font-weight="bold">A</text><circle cx="120" cy="260" r="4" fill="#e74c3c"/><text x="95" y="268" font-size="14" fill="#e74c3c" font-weight="bold">B</text><circle cx="350" cy="140" r="4" fill="#e74c3c"/><text x="355" y="133" font-size="14" fill="#e74c3c" font-weight="bold">C</text><line x1="160" y1="120" x2="120" y2="260" stroke="#3498db" stroke-width="2"/><line x1="120" y1="260" x2="350" y2="140" stroke="#3498db" stroke-width="2"/><line x1="160" y1="120" x2="350" y2="140" stroke="#3498db" stroke-width="2"/><line x1="250" y1="190" x2="160" y2="120" stroke="#e74c3c" stroke-width="1.5" stroke-dasharray="4,3"/><line x1="250" y1="190" x2="350" y2="140" stroke="#e74c3c" stroke-width="1.5" stroke-dasharray="4,3"/><text x="180" y="310" font-size="13" fill="#888">Angle at center (∠AOC)</text><text x="180" y="327" font-size="13" fill="#888">= 2 × Angle at circumference (∠ABC)</text><text x="180" y="344" font-size="13" fill="#888">∠AOC = 2 × ∠ABC</text>`,
    },
    {
      keywords: ["graph", "function", "parabola", "quadratic", "equation"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Quadratic Function Graph</text><text x="60" y="70" font-size="13" fill="#666">y = ax² + bx + c</text><line x1="60" y1="200" x2="460" y2="200" stroke="#333" stroke-width="2"/><line x1="260" y1="340" x2="260" y2="40" stroke="#333" stroke-width="2"/><line x1="130" y1="195" x2="130" y2="205"/><text x="125" y="225" font-size="11">1</text><line x1="195" y1="195" x2="195" y2="205"/><text x="190" y="225" font-size="11">2</text><line x1="325" y1="195" x2="325" y2="205"/><text x="320" y="225" font-size="11">3</text><line x1="390" y1="195" x2="390" y2="205"/><text x="385" y="225" font-size="11">4</text><line x1="255" y1="270" x2="265" y2="270"/><text x="270" y="275" font-size="11">1</text><line x1="255" y1="130" x2="265" y2="130"/><text x="270" y="135" font-size="11">-1</text><path d="M 90 340 Q 180 40 260 40 Q 340 40 430 340" fill="none" stroke="#e74c3c" stroke-width="3"/><circle cx="130" cy="200" r="4" fill="#2ecc71"/><text x="130" y="185" font-size="12" fill="#2ecc71" font-weight="bold">Root</text><circle cx="390" cy="200" r="4" fill="#2ecc71"/><text x="390" y="185" font-size="12" fill="#2ecc71" font-weight="bold">Root</text><circle cx="260" cy="40" r="4" fill="#9b59b6"/><text x="240" y="30" font-size="12" fill="#9b59b6" font-weight="bold">Vertex</text><text x="460" y="205" font-size="13" font-weight="bold">x</text><text x="250" y="40" font-size="13" font-weight="bold">y</text>`,
    },
  ],
  geography: [
    {
      keywords: ["atmosphere", "ozone", "layer", "troposphere", "stratosphere"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">Layers of the Atmosphere</text><ellipse cx="250" cy="340" rx="160" ry="35" fill="#58d68d"/><text x="250" y="350" font-size="14" text-anchor="middle" fill="#fff" font-weight="bold">Earth</text><rect x="40" y="280" width="420" height="35" fill="#d4e6f1" stroke="#333" stroke-width="1"/><text x="50" y="300" font-size="11">Troposphere (0-12 km)</text><rect x="40" y="205" width="420" height="75" fill="#aed6f1" stroke="#333" stroke-width="1"/><text x="50" y="225" font-size="11">Stratosphere (12-50 km)</text><text x="250" y="250" font-size="14" text-anchor="middle" fill="#e74c3c" font-weight="bold">← Ozone Layer →</text><rect x="40" y="155" width="420" height="50" fill="#85c1e9" stroke="#333" stroke-width="1"/><text x="50" y="175" font-size="11">Mesosphere (50-80 km)</text><rect x="40" y="60" width="420" height="95" fill="#5dade2" stroke="#333" stroke-width="1"/><text x="50" y="100" font-size="11">Thermosphere (80-700 km)</text><text x="250" y="380" font-size="12" fill="#888" text-anchor="middle">As altitude increases, temperature varies in each layer</text>`,
    },
    {
      keywords: ["rock", "cycle", "igneous", "sedimentary", "metamorphic", "geology"],
      svg: `<text x="60" y="50" font-size="16" font-weight="bold">The Rock Cycle</text><text x="250" y="75" font-size="11" fill="#666" text-anchor="middle">Earth's materials continuously change between rock types</text><!-- Igneous --><ellipse cx="140" cy="130" rx="70" ry="35" fill="#e74c3c" fill-opacity="0.2" stroke="#e74c3c" stroke-width="2"/><text x="115" y="135" font-size="13" font-weight="bold" fill="#e74c3c">Igneous</text><text x="140" y="155" font-size="10" text-anchor="middle">Cooling & Solidification</text><!-- Sedimentary --><ellipse cx="360" cy="130" rx="80" ry="35" fill="#f39c12" fill-opacity="0.2" stroke="#f39c12" stroke-width="2"/><text x="330" y="135" font-size="13" font-weight="bold" fill="#f39c12">Sedimentary</text><text x="235" y="140" font-size="10" text-anchor="middle">Weathering & Erosion →</text><!-- Metamorphic --><ellipse cx="250" cy="260" rx="80" ry="35" fill="#8e44ad" fill-opacity="0.2" stroke="#8e44ad" stroke-width="2"/><text x="225" y="265" font-size="13" font-weight="bold" fill="#8e44ad">Metamorphic</text><!-- Arrows --><line x1="190" y1="145" x2="280" y2="145" stroke="#555" stroke-width="1.5" marker-end="url(#arrow)"/><line x1="360" y1="165" x2="280" y2="225" stroke="#555" stroke-width="1.5" stroke-dasharray="5,3"/><text x="345" y="200" font-size="10">Heat & Pressure</text><line x1="140" y1="165" x2="220" y2="225" stroke="#555" stroke-width="1.5" stroke-dasharray="5,3"/><text x="125" y="200" font-size="10">Melting</text><line x1="250" y1="295" x2="170" y2="165" stroke="#555" stroke-width="1.5"/><text x="160" y="285" font-size="10">Uplift & Exposure</text><line x1="250" y1="295" x2="330" y2="165" stroke="#555" stroke-width="1.5"/><text x="345" y="285" font-size="10">Compaction</text>`,
    },
  ],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: allTopics } = await supabase
      .from('jamb_syllabus')
      .select('id, subject, topic')
      .is('image_url', null);

    if (!allTopics || allTopics.length === 0) {
      return new Response(JSON.stringify({ message: "All topics already have images or no topics found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updated = 0;
    const bySubject: Record<string, number> = {};

    for (const topic of allTopics) {
      const subjectDiagrams = DIAGRAMS[topic.subject];
      if (!subjectDiagrams) continue;

      const topicLower = topic.topic.toLowerCase();
      let matchedSvg: string | null = null;

      for (const diagram of subjectDiagrams) {
        if (diagram.keywords.some(kw => topicLower.includes(kw))) {
          matchedSvg = diagram.svg;
          break;
        }
      }

      if (matchedSvg) {
        await supabase.from('jamb_syllabus').update({
          image_url: toDataUri(matchedSvg),
        }).eq('id', topic.id);
        updated++;
        bySubject[topic.subject] = (bySubject[topic.subject] || 0) + 1;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Updated ${updated} syllabus topics with diagram images`,
      updated,
      by_subject: bySubject,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
