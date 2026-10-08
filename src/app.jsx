
const { useState, useEffect, useRef } = React;

const TASKS = [
  {
    id:"oil", cat:"Engine", name:"Engine Oil & Filter", interval:5000,
    intervalLabel:"Every 5k mi / 6 mo",
    torque:[
      ["Drain Plug","30 lb-ft","14mm"],
      ["Filter Cap","18 lb-ft","TOY640 / 24mm"],
      ["Filter Drain Plug","10 lb-ft","3/8\" sq drive"],
      ["Engine Under Cover","22 lb-ft","12mm"],
    ],
    parts:[
      ["Engine Oil 0W-20 ILSAC GF-5","00279-0WQTE-01","6.1–6.2 qts"],
      ["Drain Plug Gasket","90430-12031","1"],
      ["Oil Filter Element Kit","04152-YZZA1","1"],
    ],
    tools:["Assenmacher TOY640 oil filter socket (~$26)","5/8\" ID clear vinyl tubing for drain pipe (~$1 at Lowe's plumbing)"],
    tips:[
      "Remove the engine under-cover for access (4x 12mm bolts, 22 lb-ft on reinstall) — the Sport has a light splash shield, not a TRD skid plate",
      "Filter housing is permanent — kit includes element + 2 gaskets",
      "Use drain tube to avoid mess when removing filter drain plug",
      "Give filter drain plug a quick impact — too smooth and plug/housing spin together",
      "Proper filter cap torque prevents cap spinning off before plug on next change",
    ],
    videos:[
      ["Oil Change: 2-Minute Guide (Team Oil Drop)","https://www.youtube.com/watch?v=EqN16HccF9U"],
      ["Ultimate Tacoma Maintenance Guide (Team Oil Drop)","https://www.youtube.com/watch?v=0aEkJhPr5u4"],
    ],
  },
  {
    id:"tires", cat:"Wheels", name:"Tire Rotation", interval:5000,
    intervalLabel:"Every 5k mi / 6 mo",
    torque:[["Lug Nuts","83 lb-ft","21mm"]],
    parts:[],
    tools:["Torque wrench","21mm socket"],
    tips:["Front-to-back on each side (not cross-rotation)","Re-check torque ~1,000 miles after rotation"],
    videos:[],
  },
  {
    id:"propgrease", cat:"Drivetrain", name:"Propeller Shaft Lubrication", interval:15000,
    intervalLabel:"Every 15k mi / 18 mo (severe: 5k)",
    torque:[],
    parts:[["NLGI #2 Lithium Chassis Grease","Mobil 1 Synthetic Grease","As needed"]],
    tools:["Pistol-grip grease gun w/ flex hose (Lincoln 1134 or similar)"],
    tips:[
      "Grease until fresh grease purges from all 4 u-joint seals — uneven purge = problem",
      "Do NOT lube center support bearing — it is sealed and not serviceable",
      "4WD trucks only — 2WD Tacoma has no zerk fittings",
    ],
    videos:[],
  },
  {
    id:"proptorque", cat:"Drivetrain", name:"Prop Shaft Bolt Re-Torque", interval:15000,
    intervalLabel:"Every 15k mi / 18 mo (severe: 5k)",
    torque:[
      ["U-Joint Flange Bolts","65 lb-ft","14mm/17mm box-end ONLY"],
      ["Center Support Bearing","27 lb-ft","—"],
    ],
    parts:[],
    tools:[
      "14mm & 17mm box-end or flarenut wrenches (sockets won't fit the flanges)",
      "Flarenut crowfoot + torque wrench",
    ],
    tips:[
      "Xfer case flanges: 17mm bolt head / 14mm nut",
      "Diff flanges: 14mm bolt / 14mm nut",
      "Use torque correction when using crowfoot: cncexpo.com/TorqueAdapter.aspx",
      "Must remove heat shield at rear of xfer case (12mm bolts)",
      "If center bearing was loose, realignment may be needed after re-torque",
    ],
    videos:[],
  },
  {
    id:"leafspring", cat:"Suspension", name:"Leaf Spring U-Bolt Re-Torque", interval:0,
    intervalLabel:"After any lift/install, periodically",
    torque:[["Leaf Spring U-Bolts","~52 lb-ft (UNVERIFIED)","19mm"]],
    parts:[],tools:[],
    tips:[
      "⚠️ This spec is genuinely unresolved. FSM literal print ~37 lb-ft (widely believed a misprint); dealer-corrected ~52 lb-ft; many techs run 80–90 lb-ft and re-torque.",
      "Verify against a current 2019 FSM before relying on any single figure.",
    ],
    videos:[],
  },
  {
    id:"cabin", cat:"Filters", name:"Cabin Air Filter", interval:20000,
    intervalLabel:"Every 20k mi / 24 mo",
    torque:[],
    parts:[
      ["Standard Cabin Filter","88508-01010","1"],
      ["Deodorant Filter (often cheaper!)","88508-04010","1"],
    ],
    tools:[],
    tips:[
      "Procedure is in your glove box owner's manual",
      "The deodorant filter (88508-04010) is surprisingly cheaper — worth checking",
    ],
    videos:[],
  },
  {
    id:"airfilter", cat:"Filters", name:"Engine Air Filter", interval:20000,
    intervalLabel:"Every 20k mi / 24 mo",
    torque:[],
    parts:[["Engine Air Filter","17801-0P100","1"]],
    tools:[],
    tips:[
      "Check new filter for holes/tears before installing",
      "Clean the housing before opening the new filter box",
      "Ensure a good seal around the entire edge of the filter",
    ],
    videos:[],
  },
  {
    id:"brakesfront", cat:"Brakes", name:"Front Brakes", interval:5000,
    intervalLabel:"Visual every 5k / Measurements every 30k",
    torque:[["Caliper Mounting Bolts","91 lb-ft","—"]],
    serviceSpecs:[
      ["Pad Min Thickness","1.0 mm"],
      ["Rotor Min Thickness","26.0 mm"],
      ["Max Rotor Runout","0.05 mm"],
    ],
    parts:[
      ["Front Rotors (OEM)","43512-04052","2"],
      ["Front Brake Pads (OEM)","04465-04090","1 set"],
    ],
    tools:[],
    tips:[
      "Measure runout 10mm from outer edge with ALL 6 lug nuts torqued to 83 lb-ft",
      "If runout exceeds max: check bearing play and axle hub runout before buying new rotors",
      "Use an M8-1.25 bolt in the rotor holes to break a stuck rotor free",
      "Install rotors in the position with least runout",
    ],
    videos:[],
  },
  {
    id:"brakesrear", cat:"Brakes", name:"Rear Brakes (Drums)", interval:5000,
    intervalLabel:"Visual every 5k / Measurements every 30k",
    torque:[],
    serviceSpecs:[
      ["Drum Max Diameter","10.08 in"],
      ["Shoe Min Thickness","1.0 mm"],
    ],
    parts:[],tools:[],tips:[],videos:[],
  },
  {
    id:"diff", cat:"Drivetrain", name:"Differential Oil", interval:15000,
    intervalLabel:"Inspect every 15k / Replace as needed (severe: every 15k)",
    torque:[
      ["Rear Diff Drain Plug","36 lb-ft","24mm / 15/16\""],
      ["Rear Diff Fill Plug","36 lb-ft","24mm / 15/16\""],
      ["Front Diff Drain Plug","48 lb-ft","10mm hex"],
      ["Front Diff Fill Plug","29 lb-ft","10mm hex"],
    ],
    parts:[
      ["Diff Gear Oil LT 75W-85 GL-5","08885-02506","Front 1.6 qt / Rear ~3.1 qt (OPEN diff)"],
      ["Rear Drain & Fill Gaskets","12157-10010","2"],
      ["Front Drain Plug Gasket","90430-24003","1"],
      ["Front Fill Plug Gasket","12157-10010","1"],
    ],
    tools:["Bottle pump (for front diff)","24mm socket or 15/16\" socket"],
    tips:[
      "⚠️ ALWAYS confirm fill plug can be removed BEFORE draining",
      "This truck has the OPEN rear diff: ~2.9–3.1 L (~3.1 qt). NO friction modifier needed.",
      "⚠️ The ~4 qt figure is the LOCKING diff (TRD Off-Road/Pro). Using it here OVERFILLS your diff.",
      "Perform with vehicle level",
      "Proper fill level: within 5mm of the bottom of the fill hole",
      "Re-check level after a short drive",
      "Save new fill plug washer for final check",
      "Remove the engine under-cover (4x 12mm bolts) for front diff access — reinstall to 22 lb-ft",
    ],
    videos:[
      ["Front Differential Fluid (Team Oil Drop)","https://www.youtube.com/watch?v=PyshL2Lvs7s"],
      ["Rear Differential Fluid (Team Oil Drop)","https://www.youtube.com/watch?v=qyauqDyk7cg"],
    ],
  },
  {
    id:"xfer", cat:"Drivetrain", name:"Transfer Case Oil", interval:30000,
    intervalLabel:"Inspect every 30k / Replace as needed (severe: every 30k)",
    torque:[
      ["Drain Plug","27 lb-ft","24mm / 15/16\""],
      ["Fill Plug","27 lb-ft","24mm / 15/16\""],
    ],
    parts:[
      ["SAE 75W Transfer Gear Oil LF","08885-81080","1.1 qts"],
      ["Drain & Fill Gaskets","90430-A0003","2"],
    ],
    tools:[],
    tips:[
      "⚠️ Confirm fill plug can be removed BEFORE draining",
      "After filling: leave plug out ~5 min, recheck level, add if needed",
    ],
    videos:[
      ["Transfer Case Fluid (Team Oil Drop)","https://www.youtube.com/watch?v=udX9mONzMfI"],
    ],
  },
  {
    id:"atf", cat:"Drivetrain", name:"Automatic Transmission Fluid", interval:30000,
    intervalLabel:"Inspect every 30k / Replace every 60k",
    torque:[
      ["Drain Plug","15 lb-ft","14mm"],
      ["Overflow Plug","15 lb-ft","5mm hex"],
      ["Fill Plug","29 lb-ft","24mm / 15/16\""],
    ],
    parts:[
      ["Toyota ATF WS Fluid","00289-ATFWS","~10–12 qts total (3 cycles)"],
      ["Drain & Overflow Plug Gaskets","35178-30010","2"],
      ["Fill Plug Gasket","90301-15004","1"],
    ],
    tools:["Toyota SST 09843-18040 or OBD jumper wire","Bottle pump for filling"],
    tips:[
      "⚠️⚠️ ENGINE MUST BE RUNNING during the entire fluid level check — critical",
      "Full service = 3 drain/refill/circulate cycles (~10–12 qts total)",
      "2019 Tacomas are commonly under-filled from the factory — worth checking early",
      "Many owners report major shift quality improvement after correct fill",
    ],
    videos:[],
  },
  {
    id:"coolant", cat:"Engine", name:"Engine Coolant", interval:100000,
    intervalLabel:"Inspect every 15k / Replace at 100k then every 50k",
    torque:[
      ["Engine Under Cover No. 1","22 lb-ft","12mm"],
      ["Radiator Drain Cock","Hand tight","—"],
      ["Cylinder Block Drain Cock","9 lb-ft","—"],
    ],
    parts:[
      ["Toyota SLLC 50/50 Pre-Diluted","00272-SLLC2","9.1–11.1 qts (model dependent)"],
      ["Radiator Cap","16401-31830","1"],
    ],
    tools:[],
    tips:[
      "⚠️ Special fill sequence required — follow FSM to eliminate air pockets",
      "Use Toyota SLLC ONLY — do not mix with other coolant types",
      "Factory service manual Doc ID: RM0000017DS053X",
    ],
    videos:[
      ["Coolant Drain & Fill (Team Oil Drop)","https://www.youtube.com/watch?v=hHj-3wU1cZE"],
    ],
  },
  {
    id:"plugs", cat:"Engine", name:"Spark Plugs", interval:120000,
    intervalLabel:"Every 120k mi (V6). PAST DUE at 128k.",
    torque:[["Spark Plugs","13 lb-ft","5/8\" spark plug socket"]],
    parts:[
      ["Spark Plug — Toyota 90919-01263 (Denso FK20HBR8 / Denso 3491)","90919-01263","6"],
      ["Spark Plug Socket","GearWrench 80546 (5/8\")","1"],
    ],
    tools:["5/8\" spark plug socket (GearWrench 80546)","Extension"],
    tips:[
      "Gap: 0.031–0.032 in (0.8 mm) — FACTORY PRE-GAPPED. Do NOT re-gap iridium.",
      "⚠️ The 0.043 in (1.1 mm) figure belongs to the FK20HBR11 — a DIFFERENT plug. Not yours.",
      "⚠️ 90919-01287 is the 2.7L 4-cylinder plug. 90919-01253 does not match the 2GR-FKS. Correct PN is 90919-01263.",
      "V6 interval is 120k mi — the 60k figure is the 4-cylinder interval, widely mis-applied.",
      "Ignition coil hold-down bolts: only ~69 in-lb (7.5 lb-ft) — do not over-torque.",
      "Factory FSM calls for intake removal — can be done without it (see TacomaWorld)",
      "Rear bank plugs are tight — take your time, don't rush",
      "Factory service manual Doc IDs: RM000000SKC05EX (removal), RM000000SKA05HX (install)",
    ],
    videos:[
      ["Spark Plug Replacement (Team Oil Drop)","https://www.youtube.com/watch?v=tc9FYrD7vUw"],
    ],
  },
];

const SYS_PROMPT = `You are a specialized DIY mechanic assistant for a 2019 Toyota Tacoma TRD Sport, 3.5L V6 (2GR-FKS), 6-speed Aisin automatic transmission, 4WD. Help the owner with maintenance, torque specs, troubleshooting, and step-by-step guidance. Be direct, concise, and practical.

VEHICLE: VIN 3TMCZ5AN4KM264896 | Model GRN305L-PRTSHA | Built June 2019 Tijuana | Paint 4V6 Quicksand | ~128,342 mi
SPECS: Engine 3.5L V6 2GR-FKS (D-4S) | Oil 6.1-6.2 qts 0W-20 ILSAC GF-5 | Trans Aisin AC60F 6AT | Drive part-time 4WD | Axle ratio 3.909
TRIM IS TRD SPORT, NOT TRD PRO. This matters constantly - Pro specs will be wrong.

COMPLETE TORQUE & SPEC REFERENCE:
OIL CHANGE (5k-10k mi): Drain plug 30lb-ft/14mm | Filter cap 18lb-ft/TOY640 | Filter drain plug 10lb-ft/3/8"sq | Under cover 22lb-ft/12mm. Parts: Oil #00279-0WQTE-01, Drain gasket #90430-12031, Filter #04152-YZZA1. Note: TOY640 filter socket essential. Filter housing is permanent. Must remove the engine under-cover (the Sport has no skid plate).
TIRE ROTATION (5k): Lug nuts 83lb-ft/21mm | Front-to-back same side | Re-check at 1k mi
PROP SHAFT LUBE (15k): NLGI #2 lithium grease. Grease until purges all 4 seals evenly. 4WD only has zerks.
PROP SHAFT TORQUE (15k): U-joint flanges 65lb-ft 14/17mm BOX-END ONLY | Center bearing 27lb-ft. Xfer case: 17mm bolt/14mm nut. Diffs: 14mm/14mm.
DIFF OIL (inspect 15k): Rear drain/fill 36lb-ft/24mm | Front drain 48lb-ft/10mm hex | Front fill 29lb-ft/10mm hex. Fluid: 75W-85 GL-5 #08885-02506, Front 1.6qt, Rear ~3.1qt (OPEN diff, NO friction modifier). CRITICAL: confirm fill plug out BEFORE draining. The ~4qt figure is the LOCKING diff (Off-Road/Pro) and would OVERFILL this truck. Fill to within 5mm of the bottom of the fill hole, truck level - level not volume is the real spec.
TRANSFER CASE (30k): Drain/fill 27lb-ft/24mm. Fluid: SAE 75W #08885-81080, 1.1qt.
ATF (inspect 30k, replace 60k): CRITICAL: ENGINE MUST BE RUNNING for level check. Drain 15lb-ft/14mm | Overflow 15lb-ft/5mm hex | Fill 29lb-ft/24mm. Fluid: ATF WS #00289-ATFWS, ~10-12qt for 3 cycles. 2019s commonly under-filled from factory.
COOLANT (100k first, then 50k - OVERDUE at 128k): Special fill sequence required. Toyota SLLC only #00272-SLLC2 pre-mixed 50/50, do not dilute, 9.1-11.1qt. Inspect the water pump weep hole while the system is open - 2GR water pumps commonly fail in the 100k-150k window.
SPARK PLUGS (120k interval, PAST DUE at 128k): 13lb-ft/5/8" socket. Toyota 90919-01263 = Denso FK20HBR8 (Denso 3491) x6. Gap 0.031-0.032in (0.8mm) FACTORY PRE-GAPPED - do NOT re-gap. NOT 90919-01287 (that is the 2.7L 4-cyl plug) and NOT 90919-01253. The 0.043in/1.1mm figure is the FK20HBR11, a different plug. Coil hold-down bolts only 69 in-lb.
FRONT BRAKES: Caliper bolts 91lb-ft | Pad min 1.0mm | Rotor min 26.0mm | Max runout 0.05mm. Rotors #43512-04052, Pads #04465-04090.
REAR DRUMS: Max diameter 10.08in | Shoe min 1.0mm
CABIN FILTER (20k): #88508-01010 or #88508-04010
ENGINE FILTER (20k): #17801-0P100
LEAF SPRING U-BOLTS: UNRESOLVED. FSM literal ~37lb-ft (likely misprint), dealer-corrected ~52lb-ft, many techs 80-90lb-ft. Tell the user to verify against a current FSM rather than quoting one number.

WHAT THIS TRUCK DOES NOT HAVE (never diagnose these - they were never fitted): NO electronically locking rear differential. NO Crawl Control. NO Multi-Terrain Select. NO FOX shocks. NO TRD skid plate. If the user reports one of these not working, tell them the feature was never installed on a TRD Sport.
WHAT IT DOES HAVE: part-time 2-speed transfer case (2H/4H/4L), A-TRAC, brake-based Auto LSD, open rear diff, Hitachi/Tokico blue sport-tuned twin-tube shocks (front strut 48510-04222, rear shock 48530-04101), 17in alloys on P265/65R17 at 29 PSI cold, hood scoop (styling only).
RECALLS TO CHECK BY VIN at toyota.com/recall: low-pressure fuel pump NHTSA 20V-012 (most important), brake master cylinder NHTSA 18V-888. TSB T-SB-0062-18 = ECM reflash for gear hunting/shudder at 35-45mph - first-line fix before any mechanical diagnosis.
KEY TIPS: The Sport has a lightweight engine UNDER-COVER, not a TRD skid plate - remove it (4x 12mm bolts, 22 lb-ft on reinstall) for oil and diff work. TOY640 filter socket essential. Team Oil Drop YouTube: https://www.youtube.com/playlist?list=PLn_AlHagLpdUbx1L2CmpYDTtIHlQOMwoA. FSM: https://drive.google.com/open?id=1cx5nnlnCzlhI45D1vbBMj1ni983SKdKf

Multi-step procedures: use numbered steps. Flag safety-critical items clearly. Always include torque specs and part numbers when relevant.`;

// Cloud model for AI Wrench. Before changing, check
// https://platform.claude.com/docs/en/about-claude/model-deprecations — a retired ID makes
// every chat fail (the Sonnet 4 snapshot this app first shipped with was retired 2026-06-15).
// Guarded by tests/ai-contract.test.js.
const CLOUD_MODEL = "claude-sonnet-5-5";

// Offline AI for the cyberdeck: a model running on this same computer, reached through the
// OpenAI-compatible chat API that Ollama, llama.cpp server and LM Studio all expose.
// Loopback only: chat text never goes to another machine. Guarded by tests/ai-contract.test.js.
const LOCAL_DEFAULTS = { endpoint:"http://127.0.0.1:11434", model:"llama3.2:3b" };
const LOCAL_HISTORY = 6; // recent turns sent per question; keeps a small CPU model fast

const LOCAL_PREAMBLE = `You are running as a small offline model on a workbench computer with no internet. Answer ONLY from the reference below. Quote torque values, fluid capacities and part numbers exactly as written there. If a figure is not in the reference, say it is not in the offline reference and tell the user to check the Library tab or the factory service manual. Never guess a torque value. Keep answers short.

`;

const CLOUD_GREETING = "Ready. Ask me anything about your 2019 Tacoma TRD Sport — torque specs, step-by-step guides, troubleshooting, part numbers.\n\nAt 128,342 mi you are past due on spark plugs and coolant.\n\n⚠️ AI chat needs an Anthropic API key and a signal. Everything else in this app works offline. Add your key via the ⚙ button.";
const LOCAL_GREETING = "Offline mode. Ask me anything about your 2019 Tacoma TRD Sport.\n\nI'm a small model running on this computer with no internet, answering from the specs built into this app. I'm slower than the cloud version and I can be wrong — confirm any torque value in the Library before final torque.\n\nAt 128,342 mi you are past due on spark plugs and coolant.";

function isLoopbackEndpoint(url) {
  try {
    const u = new URL(url);
    return (u.protocol === "http:" || u.protocol === "https:") && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  } catch (e) {
    return false;
  }
}

// One line of a streamed (server-sent events) chat response -> the text it adds.
function parseStreamLine(line) {
  const s = line.trim();
  if (!s.startsWith("data:")) return "";
  const data = s.slice(5).trim();
  if (!data || data === "[DONE]") return "";
  try {
    const j = JSON.parse(data);
    return (j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content) || "";
  } catch (e) {
    return "";
  }
}

// Talk-back. The device's built-in voice (speechSynthesis) is the default: free, no key, works
// with no signal and on the deck. ElevenLabs is opt-in, needs a signal, and receives only the
// text of the answer being read aloud. Guarded by tests/voice-contract.test.js.
const ELEVEN_API = "https://api.elevenlabs.io";
const ELEVEN_DEFAULTS = { voice:"JBFqnCBsd6RMkjVDRZzb", model:"eleven_flash_v2_5" };

function isElevenVoiceId(id) {
  return typeof id === "string" && /^[A-Za-z0-9]{8,40}$/.test(id);
}

// An answer as it should sound: no markdown, no URLs read letter by letter, units spoken.
// Long answers are cut at a sentence so a read-aloud (and an ElevenLabs bill) stays bounded.
function speakableText(text, max = 2500) {
  let s = String(text || "");
  s = s.replace(/```[\s\S]*?```/g, " ");
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  s = s.replace(/https?:\/\/\S+/g, "link on screen");
  s = s.replace(/\blb[-\s]?ft\b/gi, "pound-feet");
  s = s.replace(/\bin[-\s]?lbs?\b/gi, "inch-pounds");
  s = s.replace(/\bN[·\s-]?m\b/g, "newton-meters");
  s = s.replace(/⚠️?/g, ". Warning: ");
  s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "");
  s = s.replace(/[*`#>|]+/g, "").replace(/(^|\s)_+|_+(\s|$)/g, "$1$2");
  s = s.replace(/^\s*[-•]\s+/gm, "");
  s = s.replace(/([^\s.!?:;,])[ \t]*\n+/g, "$1. ");
  s = s.replace(/\s+/g, " ").replace(/ \./g, ".").replace(/([.!?:;])(\s*\.)+/g, "$1").replace(/^[\s.]+/, "").trim();
  if (s.length > max) {
    const cut = Math.max(s.lastIndexOf(". ", max), s.lastIndexOf("? ", max), s.lastIndexOf("! ", max));
    s = s.slice(0, cut > max / 2 ? cut + 1 : max).trim() + " The rest is on screen.";
  }
  return s;
}

// Device voices stall or cut off on long utterances (iOS especially), so read in short pieces.
// Splits only at punctuation followed by a space, so "4.5 qt" and "0.028 in" stay whole.
function splitForSpeech(text, max = 220) {
  const parts = String(text || "").replace(/([.!?;:])\s+/g, "$1\u0000").split("\u0000");
  const chunks = [];
  let cur = "";
  const push = () => { if (cur.trim()) chunks.push(cur.trim()); cur = ""; };
  for (let p of parts) {
    p = p.trim();
    if (!p) continue;
    while (p.length > max) {
      let cut = p.lastIndexOf(" ", max);
      if (cut <= 0) cut = max;
      push();
      chunks.push(p.slice(0, cut).trim());
      p = p.slice(cut).trim();
    }
    if (cur && (cur + " " + p).length > max) push();
    cur = cur ? cur + " " + p : p;
  }
  push();
  return chunks;
}

// A tiny silent WAV. Played from a tap so iOS lets later, non-tap audio (an answer that
// arrives seconds after Send) play through the same element.
function silentWavBlob() {
  const b = new DataView(new ArrayBuffer(46));
  const str = (o, t) => { for (let i = 0; i < t.length; i++) b.setUint8(o + i, t.charCodeAt(i)); };
  str(0, "RIFF"); b.setUint32(4, 38, true); str(8, "WAVE"); str(12, "fmt ");
  b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true);
  b.setUint32(24, 8000, true); b.setUint32(28, 16000, true); b.setUint16(32, 2, true); b.setUint16(34, 16, true);
  str(36, "data"); b.setUint32(40, 2, true); b.setInt16(44, 0, true);
  return new Blob([b.buffer], { type:"audio/wav" });
}

// Best English voice this device has. iOS "Enhanced"/"Premium" voices sound far less robotic.
function pickDeviceVoice(voices) {
  const en = (voices || []).filter(v => /^en([-_]|$)/i.test(v.lang || ""));
  const good = v => /premium|enhanced|neural|natural/i.test(v.name || "");
  const us = v => /en[-_]US/i.test(v.lang || "");
  return en.find(v => good(v) && us(v)) || en.find(good) || en.find(v => v.default) || en.find(us) || en[0] || null;
}

// The deck's kiosk opens /?ai=local&endpoint=…&model=… so it boots straight into offline
// mode. Applied once, saved to this device, then removed from the address bar.
(function applyLaunchParams() {
  try {
    const q = new URLSearchParams(window.location.search);
    if (!["ai", "endpoint", "model"].some(k => q.has(k))) return;
    if (q.get("ai") === "local" || q.get("ai") === "cloud") localStorage.setItem("taco-ai", q.get("ai"));
    const ep = q.get("endpoint");
    if (ep && isLoopbackEndpoint(ep)) localStorage.setItem("taco-local-endpoint", ep);
    const m = q.get("model");
    if (m && /^[\w.:\/-]{1,100}$/.test(m)) localStorage.setItem("taco-local-model", m);
    window.history.replaceState(null, "", window.location.pathname);
  } catch (e) {}
})();

const CAT_ICONS = { Engine:"⚙️", Wheels:"🔄", Drivetrain:"⛓️", Suspension:"🔩", Filters:"🌬️", Brakes:"🛑" };

function getStatus(task, mileage, log) {
  if (task.interval === 0) return { status:"manual", label:"Manual check", color:"#6b7280" };
  if (!mileage) return { status:"unknown", label:"Set mileage", color:"#4b5563" };
  if (!log) return { status:"unknown", label:"No record", color:"#4b5563" };
  const since = mileage - log.mileage;
  const pct = since / task.interval;
  if (pct >= 1.0) return { status:"overdue", label:`${(since - task.interval).toLocaleString()} mi overdue`, color:"#ef4444" };
  if (pct >= 0.8) return { status:"due", label:`${(task.interval - since).toLocaleString()} mi left`, color:"#f59e0b" };
  return { status:"ok", label:`${(task.interval - since).toLocaleString()} mi left`, color:"#22c55e" };
}

// How a log entry reads. "Never done" is stored as a baseline at 0 mi.
function describeLog(log) {
  if (log.baseline && log.mileage === 0) return "factory original";
  const d = log.date ? new Date(log.date) : null;
  const when = d && !isNaN(d.getTime()) ? d.toLocaleDateString() : "date not recorded";
  return log.mileage.toLocaleString() + " mi · " + when;
}

// Backup file contents: mileage and the service log. Never the API key.
function buildBackup(mileage, logs) {
  return { app:"tacoma-world", version:1, exportedAt:new Date().toISOString(), mileage, logs };
}

// Merge a backup into current data so the phone and the deck can trade files in either
// direction. Never deletes. Per task, the higher-mileage record wins; a tie keeps what's here.
function mergeBackup(current, incoming, taskIds) {
  if (!incoming || incoming.app !== "tacoma-world" || !incoming.logs || typeof incoming.logs !== "object") {
    throw new Error("That file isn't a Tacoma World backup.");
  }
  const logs = { ...current.logs };
  let added = 0, updated = 0;
  for (const id of Object.keys(incoming.logs)) {
    const r = incoming.logs[id];
    if (!taskIds.includes(id) || !r || !Number.isFinite(r.mileage) || r.mileage < 0) continue;
    const rec = { mileage:Math.floor(r.mileage), date: typeof r.date === "string" ? r.date : null };
    if (r.baseline === true) rec.baseline = true;
    if (!logs[id]) { logs[id] = rec; added++; }
    else if (rec.mileage > logs[id].mileage) { logs[id] = rec; updated++; }
  }
  const inMi = Number.isFinite(incoming.mileage) && incoming.mileage > 0 ? Math.floor(incoming.mileage) : 0;
  return { mileage:Math.max(current.mileage || 0, inMi), logs, added, updated };
}

function TacomaHub() {
  const [tab, setTab] = useState("schedule");
  const [mileage, setMileage] = useState(0);
  const [mileInput, setMileInput] = useState("");
  const [logs, setLogs] = useState({});
  const [task, setTask] = useState(null);
  // The greeting is rendered separately (it depends on the AI source) and is never history.
  const [msgs, setMsgs] = useState([]);
  const [inputText, setInputText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("taco-apikey") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [backupMsg, setBackupMsg] = useState("");
  const [provider, setProvider] = useState(() => localStorage.getItem("taco-ai") === "local" ? "local" : "cloud");
  const [localCfg, setLocalCfg] = useState(() => ({
    endpoint: localStorage.getItem("taco-local-endpoint") || LOCAL_DEFAULTS.endpoint,
    model: localStorage.getItem("taco-local-model") || LOCAL_DEFAULTS.model,
  }));
  const [endpointInput, setEndpointInput] = useState("");
  const [modelInput, setModelInput] = useState("");
  const [localStatus, setLocalStatus] = useState("idle");
  const localRun = useRef(0);
  const [voiceOn, setVoiceOn] = useState(() => localStorage.getItem("taco-voice") === "on");
  const [voiceEngine, setVoiceEngine] = useState(() => localStorage.getItem("taco-voice-engine") === "elevenlabs" ? "elevenlabs" : "device");
  const [elevenKey, setElevenKey] = useState(() => localStorage.getItem("taco-elevenlabs-key") || "");
  const [elevenKeyInput, setElevenKeyInput] = useState("");
  const [elevenVoice, setElevenVoice] = useState(() => localStorage.getItem("taco-elevenlabs-voice") || ELEVEN_DEFAULTS.voice);
  const [voiceIdInput, setVoiceIdInput] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState("");
  const voiceOnRef = useRef(voiceOn);
  const speechRun = useRef(0);
  const audioRef = useRef(null);
  const importRef = useRef(null);
  const chatEnd = useRef(null);

  useEffect(() => {
    const m = localStorage.getItem("taco-mi");
    if (m) { setMileage(parseInt(m)); setMileInput(m); }
    const l = localStorage.getItem("taco-log");
    if (l) { try { setLogs(JSON.parse(l)); } catch(e) {} }
  }, []);

  useEffect(() => { try { navigator.storage?.persist?.().catch(() => {}); } catch (e) {} }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, aiLoading]);

  const saveMiles = () => {
    const n = parseInt(mileInput.replace(/,/g,""));
    if (!isNaN(n) && n > 0) { setMileage(n); localStorage.setItem("taco-mi", String(n)); }
  };

  const saveLogs = (updated) => {
    setLogs(updated);
    localStorage.setItem("taco-log", JSON.stringify(updated));
  };

  const markDone = (id) => {
    if (!mileage) { alert("Set your current mileage first."); return; }
    saveLogs({ ...logs, [id]:{ mileage, date:new Date().toISOString() } });
  };

  // Record work done before this app existed. 0 mi = never done (factory original).
  const logPast = (id, mi) => {
    if (!Number.isFinite(mi) || mi < 0) { alert("Enter the odometer reading from when it was last done."); return false; }
    if (mileage && mi > mileage) { alert(`That's higher than the current mileage (${mileage.toLocaleString()} mi).`); return false; }
    saveLogs({ ...logs, [id]:{ mileage:Math.floor(mi), date:null, baseline:true } });
    return true;
  };

  const exportLog = async () => {
    const data = JSON.stringify(buildBackup(mileage, logs), null, 2);
    const name = `tacoma-world-backup-${new Date().toISOString().slice(0,10)}.json`;
    try {
      const file = new File([data], name, { type:"application/json" });
      if (navigator.canShare && navigator.canShare({ files:[file] })) {
        await navigator.share({ files:[file], title:"Tacoma World backup" });
        setBackupMsg("Backup shared.");
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
    const url = URL.createObjectURL(new Blob([data], { type:"application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBackupMsg(`Saved ${name}.`);
  };

  const importLog = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    try {
      let incoming;
      try { incoming = JSON.parse(await f.text()); } catch (err) { throw new Error("That file isn't a Tacoma World backup."); }
      const res = mergeBackup({ mileage, logs }, incoming, TASKS.map(t => t.id));
      saveLogs(res.logs);
      if (res.mileage > mileage) { setMileage(res.mileage); setMileInput(String(res.mileage)); localStorage.setItem("taco-mi", String(res.mileage)); }
      setBackupMsg(`Imported: ${res.added} new, ${res.updated} updated. Records already here with higher mileage were kept.`);
    } catch (err) {
      setBackupMsg("Import failed. " + err.message);
    }
  };

  const saveApiKey = () => {
    const k = apiKeyInput.trim();
    if (k) { localStorage.setItem("taco-apikey", k); setApiKey(k); }
    setApiKeyInput("");
    setShowSettings(false);
  };

  const clearApiKey = () => {
    localStorage.removeItem("taco-apikey");
    setApiKey("");
    setApiKeyInput("");
  };

  const chooseProvider = (p) => {
    setProvider(p);
    localStorage.setItem("taco-ai", p);
  };

  const saveLocal = () => {
    const endpoint = endpointInput.trim().replace(/\/+$/, "");
    const model = modelInput.trim();
    if (!isLoopbackEndpoint(endpoint)) { setLocalStatus("badurl"); return; }
    if (!/^[\w.:\/-]{1,100}$/.test(model)) { setLocalStatus("badmodel"); return; }
    localStorage.setItem("taco-local-endpoint", endpoint);
    localStorage.setItem("taco-local-model", model);
    setLocalCfg({ endpoint, model });
  };

  // Find the offline model, then load it and cache the reference prompt with a one-token
  // request, so the first real question doesn't pay that cost.
  const checkLocal = async (cfg) => {
    const run = ++localRun.current;
    const base = cfg.endpoint.replace(/\/+$/, "");
    if (!isLoopbackEndpoint(base)) { setLocalStatus("badurl"); return; }
    setLocalStatus("checking");
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 4000);
      const r = await fetch(base + "/v1/models", { signal:ctl.signal });
      clearTimeout(timer);
      const j = await r.json();
      if (run !== localRun.current) return;
      if (!(j.data || []).some(m => m.id === cfg.model)) { setLocalStatus("nomodel"); return; }
      setLocalStatus("warming");
      const w = await fetch(base + "/v1/chat/completions", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:cfg.model, stream:false, max_tokens:1,
          messages:[{ role:"system", content:LOCAL_PREAMBLE + SYS_PROMPT }, { role:"user", content:"Ready?" }] }),
      });
      if (run === localRun.current) setLocalStatus(w.ok ? "ready" : "down");
    } catch (e) {
      if (run === localRun.current) setLocalStatus("down");
    }
  };

  useEffect(() => {
    if (provider === "local") checkLocal(localCfg);
    else localRun.current++;
  }, [provider, localCfg.endpoint, localCfg.model]);

  // ---- Talk-back ----

  const getAudio = () => {
    if (!audioRef.current) {
      const a = new Audio();
      a.setAttribute("playsinline", "");
      audioRef.current = a;
    }
    return audioRef.current;
  };

  const releaseAudio = (a) => {
    a.pause();
    const src = a.getAttribute("src") || "";
    if (src.startsWith("blob:")) URL.revokeObjectURL(src);
    a.removeAttribute("src");
  };

  const stopSpeaking = () => {
    speechRun.current++;
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    if (audioRef.current) releaseAudio(audioRef.current);
    setSpeaking(false);
  };

  // Call from a tap (toggle, Send, Test, Read). iOS only lets audio start from a user gesture;
  // this "spends" the gesture so the answer can play when it arrives later.
  const unlockAudio = () => {
    try {
      const synth = window.speechSynthesis;
      if (synth && typeof SpeechSynthesisUtterance !== "undefined" && !synth.speaking) {
        const u = new SpeechSynthesisUtterance(" ");
        u.volume = 0;
        synth.speak(u);
      }
    } catch (e) {}
    if (voiceEngine === "elevenlabs") {
      try {
        const a = getAudio();
        if (!a.getAttribute("src")) {
          a.src = URL.createObjectURL(silentWavBlob());
          a.play().catch(() => {});
        }
      } catch (e) {}
    }
  };

  const speakDevice = (text, run) => {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
      setVoiceMsg("This browser can't read aloud.");
      setSpeaking(false);
      return;
    }
    const chunks = splitForSpeech(text);
    if (!chunks.length) { setSpeaking(false); return; }
    const voice = pickDeviceVoice(synth.getVoices());
    chunks.forEach((c, i) => {
      const u = new SpeechSynthesisUtterance(c);
      if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-US";
      if (i === chunks.length - 1) u.onend = u.onerror = () => { if (run === speechRun.current) setSpeaking(false); };
      synth.speak(u);
    });
    setSpeaking(true);
  };

  const speakEleven = async (text, run) => {
    let r;
    try {
      r = await fetch(`${ELEVEN_API}/v1/text-to-speech/${encodeURIComponent(elevenVoice)}?output_format=mp3_44100_64`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Accept":"audio/mpeg", "xi-api-key": elevenKey },
        body: JSON.stringify({ text, model_id:ELEVEN_DEFAULTS.model }),
      });
    } catch (e) {
      throw new Error("No connection to ElevenLabs");
    }
    if (!r.ok) {
      let detail = "";
      try { const j = await r.json(); detail = (j.detail && (j.detail.message || j.detail.status)) || ""; } catch (e) {}
      const hint = r.status === 401 ? " (check the ElevenLabs key in ⚙)" : "";
      throw new Error(`ElevenLabs error ${r.status}${detail ? ": " + String(detail).slice(0, 140) : ""}${hint}`);
    }
    const blob = await r.blob();
    if (run !== speechRun.current) return;
    const a = getAudio();
    releaseAudio(a);
    const url = URL.createObjectURL(blob);
    a.onended = () => { URL.revokeObjectURL(url); if (run === speechRun.current) setSpeaking(false); };
    a.src = url;
    try {
      await a.play();
    } catch (e) {
      throw new Error("The phone blocked audio playback. Tap ▶ READ on the answer");
    }
  };

  // Read one answer aloud. ElevenLabs when chosen and keyed; the device voice otherwise and
  // whenever ElevenLabs fails, so a dead signal never means silence.
  const speak = async (raw) => {
    stopSpeaking();
    const run = speechRun.current;
    const text = speakableText(raw);
    if (!text) return;
    if (voiceEngine === "elevenlabs" && elevenKey && isElevenVoiceId(elevenVoice)) {
      setSpeaking(true);
      try {
        await speakEleven(text, run);
        if (run === speechRun.current) setVoiceMsg("");
        return;
      } catch (e) {
        if (run !== speechRun.current) return;
        setVoiceMsg(`${e.message}. Using the device voice.`);
      }
    }
    speakDevice(text, run);
  };

  const toggleVoice = () => {
    if (speaking) { stopSpeaking(); return; }
    const on = !voiceOn;
    setVoiceOn(on);
    voiceOnRef.current = on;
    localStorage.setItem("taco-voice", on ? "on" : "off");
    setVoiceMsg("");
    if (on) unlockAudio();
  };

  const chooseVoiceEngine = (e) => {
    stopSpeaking();
    setVoiceEngine(e);
    localStorage.setItem("taco-voice-engine", e);
    setVoiceMsg("");
  };

  const saveElevenKey = () => {
    const k = elevenKeyInput.trim();
    if (k) { localStorage.setItem("taco-elevenlabs-key", k); setElevenKey(k); setVoiceMsg("ElevenLabs key saved."); }
    setElevenKeyInput("");
  };

  const clearElevenKey = () => {
    localStorage.removeItem("taco-elevenlabs-key");
    setElevenKey("");
    setElevenKeyInput("");
    setVoiceMsg("ElevenLabs key cleared. The device voice will read answers.");
  };

  const saveVoiceId = () => {
    const v = voiceIdInput.trim() || ELEVEN_DEFAULTS.voice;
    if (!isElevenVoiceId(v)) { setVoiceMsg("A voice ID is letters and numbers only, from the ElevenLabs voice library."); return; }
    localStorage.setItem("taco-elevenlabs-voice", v);
    setElevenVoice(v);
    setVoiceIdInput(v);
    setVoiceMsg("Voice saved.");
  };

  const testVoice = () => {
    unlockAudio();
    speak("Voice check. AI Wrench will read its answers like this while you work.");
  };

  const readAloud = (text) => {
    unlockAudio();
    speak(text);
  };

  const sendCloud = async (history, taskCtx) => {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-api-key": apiKey,
        "anthropic-version":"2023-06-01",
        "anthropic-dangerous-direct-browser-access":"true"
      },
      body: JSON.stringify({
        model:CLOUD_MODEL,
        max_tokens:1000,
        system: SYS_PROMPT + taskCtx,
        messages: history
      })
    });
    const d = await r.json();
    if (!r.ok || d.error) {
      const type = d.error?.type || `HTTP ${r.status}`;
      const hint = type === "authentication_error" ? "\n\nCheck your API key in ⚙ Settings." : "";
      setMsgs(p => [...p, { role:"assistant", ui:true, content:`API error (${type}): ${d.error?.message || "no details"}${hint}` }]);
    } else {
      const reply = d.content?.find(c => c.type==="text")?.text || "No response received.";
      setMsgs(p => [...p, { role:"assistant", content:reply }]);
      if (voiceOnRef.current) speak(reply);
    }
  };

  const sendLocal = async (history, taskCtx) => {
    const base = localCfg.endpoint.replace(/\/+$/, "");
    if (!isLoopbackEndpoint(base)) throw new Error("The offline model address must be on this device (localhost).");
    const recent = history.slice(-LOCAL_HISTORY);
    while (recent.length && recent[0].role !== "user") recent.shift();
    const r = await fetch(base + "/v1/chat/completions", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        model:localCfg.model, stream:true, temperature:0.2, max_tokens:700,
        messages:[{ role:"system", content:LOCAL_PREAMBLE + SYS_PROMPT + taskCtx }, ...recent],
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      throw new Error(`Offline model error ${r.status}${detail ? ": " + detail.slice(0, 200) : ""}`);
    }
    // Stream tokens into one growing bubble; a CPU model is slow and a blank wait feels broken.
    const show = (t) => setMsgs(p => {
      const c = p.slice();
      if (c.length && c[c.length - 1].streaming) c[c.length - 1] = { role:"assistant", content:t, streaming:true };
      else c.push({ role:"assistant", content:t, streaming:true });
      return c;
    });
    let text = "";
    if ((r.headers.get("content-type") || "").includes("application/json") || !r.body) {
      const j = await r.json(); // server ignored stream:true
      text = j.choices?.[0]?.message?.content || "";
      if (text) show(text);
    } else {
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream:true });
        const lines = buf.split("\n");
        buf = lines.pop();
        const added = lines.map(parseStreamLine).join("");
        if (added) { text += added; show(text); }
      }
      const tail = parseStreamLine(buf);
      if (tail) { text += tail; show(text); }
    }
    if (!text) throw new Error("The offline model returned an empty answer.");
    if (voiceOnRef.current) speak(text);
  };

  const send = async () => {
    if (!inputText.trim() || aiLoading) return;
    if (provider === "cloud" && !apiKey) { setShowSettings(true); return; }
    const userMsg = inputText.trim();
    setInputText("");
    stopSpeaking();
    if (voiceOnRef.current) unlockAudio();
    const taskCtx = task ? `\n\nUser is viewing the "${task.name}" task.` : "";
    const next = [...msgs, { role:"user", content:userMsg }];
    setMsgs(next);
    setAiLoading(true);
    // UI-only lines (error notices) are never sent as history.
    const history = next.filter(m => !m.ui).map(m => ({ role:m.role, content:m.content }));
    const settle = (p) => p.map(m => m.streaming ? { role:m.role, content:m.content } : m);
    try {
      if (provider === "local") await sendLocal(history, taskCtx);
      else await sendCloud(history, taskCtx);
      setMsgs(settle);
    } catch (e) {
      // Browsers report "server not there" as a TypeError, each with different wording.
      const unreachable = !e || e.name === "TypeError" || /Failed to fetch|NetworkError|Load failed/i.test(e.message || "");
      const note = provider === "local"
        ? (unreachable ? "Can't reach the offline model. On the deck, run: systemctl status ollama" : e.message)
        : "No connection to Anthropic. Specs and the service log still work offline.";
      setMsgs(p => [...settle(p), { role:"assistant", ui:true, content:note }]);
    }
    setAiLoading(false);
  };

  const sorted = [...TASKS].sort((a,b) => {
    const order = { overdue:0, due:1, unknown:2, ok:3, manual:4 };
    return order[getStatus(a,mileage,logs[a.id]).status] - order[getStatus(b,mileage,logs[b.id]).status];
  });

  const unlogged = TASKS.filter(t => t.interval > 0 && !logs[t.id]).length;

  const filtered = TASKS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.cat.toLowerCase().includes(search.toLowerCase())
  );

  const aiReady = provider === "cloud" ? !!apiKey : localStatus === "ready";
  const localStatusText = {
    idle: "Offline model not checked yet.",
    checking: "Looking for the offline model…",
    nomodel: `The AI server is running but ${localCfg.model} isn't installed. With internet, run: ollama pull ${localCfg.model}`,
    warming: "Loading the offline model into memory. The first answer can take a minute or two.",
    ready: "Offline model ready.",
    down: `Can't reach the offline model at ${localCfg.endpoint}. On the deck, run: systemctl status ollama`,
    badurl: "The address must be on this device, e.g. http://127.0.0.1:11434",
    badmodel: "Enter a model name, e.g. llama3.2:3b",
  }[localStatus];

  const T = {
    wrap:{ background:"#0d0d0d", color:"#f0f0f0", height:"100%", display:"flex", flexDirection:"column", fontSize:"14px" },
    hdr:{ background:"#111", borderBottom:"3px solid #cc0000", padding:"14px 16px", flexShrink:0 },
    truckRow:{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" },
    redBar:{ width:"4px", height:"40px", background:"#cc0000", borderRadius:"2px", flexShrink:0 },
    title:{ fontFamily:"Impact, 'Arial Narrow Bold', sans-serif", fontSize:"22px", letterSpacing:"0.04em", textTransform:"uppercase", lineHeight:1 },
    sub:{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#888", letterSpacing:"0.06em", textTransform:"uppercase", marginTop:"3px" },
    settingsBtn:{ marginLeft:"auto", background:"transparent", border:"1px solid #2a2a2a", borderRadius:"4px", color: aiReady ? "#22c55e" : "#666", fontSize:"16px", padding:"5px 9px", cursor:"pointer" },
    mileRow:{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" },
    mileLabel:{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#666", textTransform:"uppercase", letterSpacing:"0.06em" },
    mileIn:{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"4px", color:"#f0f0f0", fontFamily:"'Courier New', monospace", fontSize:"13px", padding:"5px 10px", width:"110px" },
    setBtn:{ background:"#cc0000", border:"none", borderRadius:"4px", color:"#fff", fontFamily:"Impact, sans-serif", fontSize:"14px", letterSpacing:"0.06em", padding:"5px 14px", cursor:"pointer" },
    mileVal:{ fontFamily:"'Courier New', monospace", fontSize:"14px", color:"#f5a623", fontWeight:"bold" },
    tabNav:{ display:"flex", background:"#0f0f0f", borderBottom:"1px solid #1e1e1e", flexShrink:0 },
    tab:(a) => ({ flex:1, padding:"10px 0", textAlign:"center", border:"none", cursor:"pointer", background: a?"#161616":"transparent", color: a?"#cc0000":"#555", borderBottom: a?"2px solid #cc0000":"2px solid transparent", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"13px" }),
    content:{ flex:1, overflowY:"auto" },
    taskRow:(h) => ({ display:"flex", alignItems:"center", gap:"12px", padding:"11px 16px", borderBottom:"1px solid #1a1a1a", background:h?"#161616":"#111", cursor:"pointer", transition:"background 0.1s" }),
    dot:(c) => ({ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0 }),
    tName:{ fontFamily:"Impact, sans-serif", fontSize:"16px", letterSpacing:"0.04em", textTransform:"uppercase", lineHeight:1.2 },
    tSub:{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#555", marginTop:"2px" },
    statusLbl:(c) => ({ fontFamily:"'Courier New', monospace", fontSize:"11px", color:c, fontWeight:"bold", textAlign:"right", minWidth:"90px" }),
    warn:{ padding:"12px 16px", background:"#1a0a00", borderBottom:"1px solid #330", color:"#f5a623", fontSize:"13px", fontFamily:"'Courier New', monospace" },
    backBtn:{ background:"transparent", border:"none", color:"#cc0000", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"14px", cursor:"pointer", padding:"12px 16px", display:"block" },
    taskHdr:{ padding:"14px 16px", background:"#161616", borderBottom:"1px solid #222" },
    taskTitle:{ fontFamily:"Impact, sans-serif", fontSize:"22px", letterSpacing:"0.04em", textTransform:"uppercase" },
    taskInt:{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#666", marginTop:"4px" },
    lastDone:{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#444", marginTop:"3px" },
    doneBtn:{ background:"#0a1f0a", border:"1px solid #1a4a1a", color:"#22c55e", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"13px", padding:"5px 12px", cursor:"pointer", borderRadius:"3px", flexShrink:0 },
    sec:{ padding:"14px 16px 0" },
    secTitle:{ fontFamily:"'Courier New', monospace", fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"#cc0000", marginBottom:"8px", paddingBottom:"5px", borderBottom:"1px solid #1e1e1e" },
    specRow:{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:"8px", alignItems:"center", padding:"6px 0", borderBottom:"1px solid #181818", fontSize:"13px" },
    monoVal:{ fontFamily:"'Courier New', monospace", fontSize:"12px", color:"#f5a623", textAlign:"right", whiteSpace:"nowrap" },
    toolTag:{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"3px", padding:"2px 6px", fontSize:"10px", fontFamily:"'Courier New', monospace", color:"#666", whiteSpace:"nowrap" },
    partRow:{ padding:"7px 0", borderBottom:"1px solid #181818" },
    partNum:{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#f5a623", background:"#180800", border:"1px solid #2a1200", borderRadius:"3px", padding:"1px 7px", display:"inline-block" },
    partQty:{ fontSize:"11px", color:"#555", marginLeft:"8px" },
    tip:{ padding:"6px 0 6px 12px", borderLeft:"2px solid #292929", fontSize:"13px", color:"#bbb", marginBottom:"4px" },
    vidLink:{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"4px", color:"#f0f0f0", marginBottom:"6px", fontSize:"13px", cursor:"pointer" },
    askBtn:{ background:"#cc0000", border:"none", borderRadius:"4px", color:"#fff", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"15px", padding:"11px 16px", cursor:"pointer", width:"100%", textAlign:"center" },
    searchIn:{ width:"100%", background:"#111", border:"none", borderBottom:"2px solid #cc0000", color:"#f0f0f0", fontSize:"14px", padding:"12px 16px", outline:"none", display:"block" },
    chatWrap:{ display:"flex", flexDirection:"column", height:"100%" },
    chatMsgs:{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:"10px" },
    userBub:{ alignSelf:"flex-end", background:"#cc0000", color:"#fff", borderRadius:"12px 12px 2px 12px", padding:"9px 13px", maxWidth:"82%", fontSize:"13px", lineHeight:1.5, whiteSpace:"pre-wrap" },
    aiBub:{ alignSelf:"flex-start", background:"#161616", border:"1px solid #222", color:"#e8e8e8", borderRadius:"2px 12px 12px 12px", padding:"9px 13px", maxWidth:"92%", fontSize:"13px", lineHeight:1.6, whiteSpace:"pre-wrap" },
    typingBub:{ alignSelf:"flex-start", background:"#161616", border:"1px solid #222", color:"#555", borderRadius:"2px 12px 12px 12px", padding:"9px 13px", fontSize:"13px" },
    quickBar:{ padding:"6px 16px", background:"#0f0f0f", borderTop:"1px solid #1a1a1a", display:"flex", gap:"6px", flexWrap:"wrap", flexShrink:0 },
    quickBtn:{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"12px", color:"#888", fontSize:"11px", padding:"4px 10px", cursor:"pointer", fontFamily:"'Courier New', monospace" },
    chatInputRow:{ display:"flex", padding:"10px 14px", gap:"8px", background:"#111", borderTop:"1px solid #1e1e1e", flexShrink:0 },
    chatTa:{ flex:1, background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"6px", color:"#f0f0f0", fontSize:"14px", padding:"8px 12px", resize:"none", outline:"none", lineHeight:1.5 },
    sendBtn:{ background:"#cc0000", border:"none", borderRadius:"6px", color:"#fff", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"14px", padding:"8px 18px", cursor:"pointer", flexShrink:0, alignSelf:"flex-end" },
    ctxBanner:{ padding:"7px 16px", background:"#0a1500", borderBottom:"1px solid #1a2800", fontSize:"11px", color:"#4ade80", fontFamily:"'Courier New', monospace", flexShrink:0 },
    noKey:{ margin:"16px", padding:"14px", background:"#1a0a00", border:"1px solid #330", borderRadius:"4px", color:"#f5a623", fontSize:"13px", lineHeight:1.7, fontFamily:"'Courier New', monospace" },
    modal:{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
    modalBox:{ background:"#161616", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"24px", width:"100%", maxWidth:"440px", margin:"16px", maxHeight:"90%", overflowY:"auto" },
    modalTitle:{ fontFamily:"Impact, sans-serif", fontSize:"18px", letterSpacing:"0.06em", textTransform:"uppercase", color:"#f0f0f0", marginBottom:"4px" },
    modalSub:{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#888", marginBottom:"16px", lineHeight:1.6 },
    modalInput:{ width:"100%", background:"#0d0d0d", border:"1px solid #cc0000", borderRadius:"4px", color:"#f0f0f0", fontFamily:"'Courier New', monospace", fontSize:"13px", padding:"10px 12px", outline:"none", marginBottom:"10px" },
    modalBtn:{ background:"#cc0000", border:"none", borderRadius:"4px", color:"#fff", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"14px", padding:"9px 20px", cursor:"pointer", marginRight:"8px" },
    modalCancel:{ background:"transparent", border:"1px solid #333", borderRadius:"4px", color:"#888", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"14px", padding:"9px 20px", cursor:"pointer" },
    modalClear:{ background:"transparent", border:"none", color:"#ef4444", fontFamily:"'Courier New', monospace", fontSize:"11px", cursor:"pointer", marginTop:"12px", display:"block" },
    link:{ color:"#f5a623", textDecoration:"underline" },
    chevron:{ color:"#333", fontSize:"16px", flexShrink:0 },
    divider:{ height:"16px" },
    hint:{ padding:"10px 16px", background:"#121212", borderBottom:"1px solid #1e1e1e", color:"#9a9a9a", fontSize:"12px", lineHeight:1.5 },
    pastRow:{ display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap", marginTop:"12px", paddingTop:"10px", borderTop:"1px solid #222" },
    pastLabel:{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#888", marginRight:"2px" },
    pastIn:{ background:"#0d0d0d", border:"1px solid #2a2a2a", borderRadius:"4px", color:"#f0f0f0", fontFamily:"'Courier New', monospace", padding:"5px 8px", width:"110px" },
    pastBtn:{ background:"transparent", border:"1px solid #333", borderRadius:"3px", color:"#bbb", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"12px", padding:"5px 10px", cursor:"pointer" },
    setSec:{ marginTop:"18px" },
    setRow:{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" },
    statusLine:(c) => ({ fontFamily:"'Courier New', monospace", fontSize:"11px", color:c, marginTop:"10px", lineHeight:1.6 }),
    seg:(a) => ({ flex:1, background: a ? "#cc0000" : "transparent", border: a ? "1px solid #cc0000" : "1px solid #333", borderRadius:"4px", color: a ? "#fff" : "#888", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"14px", padding:"9px 12px", cursor:"pointer" }),
    offlineBanner:{ padding:"7px 16px", background:"#1a1200", borderBottom:"1px solid #2a2000", fontSize:"11px", color:"#f5a623", fontFamily:"'Courier New', monospace", flexShrink:0 },
    voiceBar:{ display:"flex", alignItems:"center", gap:"10px", padding:"6px 16px", background:"#0f0f0f", borderTop:"1px solid #1a1a1a", flexShrink:0, flexWrap:"wrap" },
    voiceBtn:(on, live) => ({ background: live ? "#cc0000" : on ? "#0a1f0a" : "transparent", border: live ? "1px solid #cc0000" : on ? "1px solid #1a4a1a" : "1px solid #333", borderRadius:"14px", color: live ? "#fff" : on ? "#22c55e" : "#888", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"13px", padding:"5px 14px", cursor:"pointer", flexShrink:0 }),
    voiceNote:{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#666", flex:1, minWidth:"140px", lineHeight:1.4 },
    readBtn:{ display:"block", marginTop:"6px", background:"transparent", border:"none", padding:0, color:"#666", fontFamily:"'Courier New', monospace", fontSize:"11px", cursor:"pointer" },
    modalDone:{ background:"transparent", border:"1px solid #333", borderRadius:"4px", color:"#f0f0f0", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"14px", padding:"9px 20px", cursor:"pointer", marginTop:"20px", width:"100%" },
  };

  function TaskHover({ t }) {
    const [hov, setHov] = useState(false);
    const st = getStatus(t, mileage, logs[t.id]);
    const log = logs[t.id];
    return (
      <div
        style={T.taskRow(hov)}
        onClick={() => { setTask(t); if (tab === "schedule") setTab("library"); }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <div style={T.dot(st.color)} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={T.tName}>{t.name}</div>
          <div style={T.tSub}>{CAT_ICONS[t.cat]} {t.cat} · {t.intervalLabel}</div>
          {log && <div style={{ ...T.tSub, color:"#4a4a4a" }}>last: {describeLog(log)}</div>}
        </div>
        <div style={T.statusLbl(st.color)}>{st.label}</div>
        <div style={T.chevron}>›</div>
      </div>
    );
  }

  function Detail({ t }) {
    const st = getStatus(t, mileage, logs[t.id]);
    const log = logs[t.id];
    const [pastMi, setPastMi] = useState("");
    return (
      <div>
        <button style={T.backBtn} onClick={() => setTask(null)}>← BACK</button>
        <div style={T.taskHdr}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px" }}>
            <div style={{ flex:1 }}>
              <div style={T.taskTitle}>{CAT_ICONS[t.cat]} {t.name}</div>
              <div style={T.taskInt}>{t.intervalLabel}</div>
              {log && <div style={T.lastDone}>Last: {describeLog(log)}</div>}
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ ...T.statusLbl(st.color), fontSize:"12px", marginBottom:"8px" }}>● {st.label}</div>
              <button style={T.doneBtn} onClick={() => markDone(t.id)}>✓ MARK DONE</button>
            </div>
          </div>
          {t.interval > 0 && (
            <div style={T.pastRow}>
              <span style={T.pastLabel}>Done before?</span>
              <input style={T.pastIn} inputMode="numeric" value={pastMi} onChange={e => setPastMi(e.target.value)}
                onKeyDown={e => e.key === "Enter" && logPast(t.id, parseInt(pastMi.replace(/,/g,""), 10)) && setPastMi("")}
                placeholder="odometer" aria-label="Mileage when last done" />
              <button style={T.pastBtn} onClick={() => { if (logPast(t.id, parseInt(pastMi.replace(/,/g,""), 10))) setPastMi(""); }}>LOG</button>
              <button style={T.pastBtn} onClick={() => logPast(t.id, 0)}>NEVER DONE</button>
            </div>
          )}
        </div>

        {t.torque?.length > 0 && (
          <div style={T.sec}>
            <div style={T.secTitle}>TORQUE SPECS</div>
            {t.torque.map(([spec,val,tool],i) => (
              <div key={i} style={T.specRow}>
                <span style={{ color:"#ccc" }}>{spec}</span>
                <span style={T.monoVal}>{val}</span>
                <span style={T.toolTag}>{tool}</span>
              </div>
            ))}
          </div>
        )}

        {t.serviceSpecs?.length > 0 && (
          <div style={T.sec}>
            <div style={T.secTitle}>SERVICE SPECS</div>
            {t.serviceSpecs.map(([spec,val],i) => (
              <div key={i} style={{ ...T.specRow, gridTemplateColumns:"1fr auto" }}>
                <span style={{ color:"#ccc" }}>{spec}</span>
                <span style={T.monoVal}>{val}</span>
              </div>
            ))}
          </div>
        )}

        {t.parts?.length > 0 && (
          <div style={T.sec}>
            <div style={T.secTitle}>PARTS</div>
            {t.parts.map(([name,num,qty],i) => (
              <div key={i} style={T.partRow}>
                <div style={{ fontSize:"13px", marginBottom:"3px", color:"#e0e0e0" }}>{name}</div>
                <span style={T.partNum}>{num}</span>
                {qty && <span style={T.partQty}>{qty}</span>}
              </div>
            ))}
          </div>
        )}

        {t.tools?.length > 0 && (
          <div style={T.sec}>
            <div style={T.secTitle}>TOOLS NEEDED</div>
            {t.tools.map((tool,i) => (
              <div key={i} style={T.tip}>🔧 {tool}</div>
            ))}
          </div>
        )}

        {t.tips?.length > 0 && (
          <div style={T.sec}>
            <div style={T.secTitle}>TIPS & NOTES</div>
            {t.tips.map((tip,i) => (
              <div key={i} style={T.tip}>{tip}</div>
            ))}
          </div>
        )}

        {t.videos?.length > 0 && (
          <div style={T.sec}>
            <div style={T.secTitle}>VIDEO GUIDES</div>
            {t.videos.map(([title,url],i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={T.vidLink}>
                <span style={{ fontSize:"20px", color:"#cc0000" }}>▶</span>
                <span>{title}</span>
              </a>
            ))}
          </div>
        )}

        <div style={T.sec}>
          <div style={T.divider} />
          <button style={T.askBtn} onClick={() => { setTab("wrench"); setInputText(`I'm about to do the ${t.name}. `); }}>
            🔧 ASK AI ABOUT THIS JOB
          </button>
        </div>
        <div style={{ height:"24px" }} />
      </div>
    );
  }

  return (
    <div style={T.wrap}>

      {/* Settings Modal */}
      {showSettings && (
        <div style={T.modal} onClick={e => e.target === e.currentTarget && setShowSettings(false)}>
          <div style={T.modalBox}>
            <div style={T.modalTitle}>⚙ Settings</div>
            <div style={T.setSec}>
            <div style={T.secTitle}>AI WRENCH SOURCE</div>
            <div style={{ ...T.setRow, marginBottom:"12px" }}>
              <button style={T.seg(provider === "cloud")} onClick={() => chooseProvider("cloud")}>CLOUD</button>
              <button style={T.seg(provider === "local")} onClick={() => chooseProvider("local")}>OFFLINE</button>
            </div>
            {provider === "local" ? (
              <div>
                <div style={T.modalSub}>
                  Uses a model running on this computer. No internet needed. This is for the
                  cyberdeck; a phone can't run the model. It's slower and less reliable than
                  cloud, so confirm torque values in the Library.
                </div>
                <input style={T.modalInput} value={endpointInput} onChange={e => setEndpointInput(e.target.value)}
                  placeholder={LOCAL_DEFAULTS.endpoint} aria-label="Offline model address" />
                <input style={T.modalInput} value={modelInput} onChange={e => setModelInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveLocal()} placeholder={LOCAL_DEFAULTS.model} aria-label="Offline model name" />
                <div style={T.setRow}>
                  <button style={T.modalBtn} onClick={saveLocal}>SAVE</button>
                  <button style={T.modalCancel} onClick={() => checkLocal(localCfg)}>CHECK AGAIN</button>
                </div>
                <div style={T.statusLine(localStatus === "ready" ? "#22c55e" : "#f5a623")}>{localStatusText}</div>
              </div>
            ) : (
            <div>
            <div style={T.modalSub}>
              Needs a signal. Your key is stored on this device only — never transmitted anywhere except directly to Anthropic's API.<br /><br />
              Get a free key at <a href="https://console.anthropic.com" target="_blank" style={T.link}>console.anthropic.com</a> → API Keys → Create key.<br />
              Set a monthly spend limit in the console too.
            </div>
            <input
              style={T.modalInput}
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveApiKey()}
              placeholder="sk-ant-api03-..."
              aria-label="Anthropic API key"
            />
            <div>
              <button style={T.modalBtn} onClick={saveApiKey}>SAVE KEY</button>
            </div>
            {apiKey && (
              <button style={T.modalClear} onClick={clearApiKey}>
                Clear saved key
              </button>
            )}
            </div>
            )}
            </div>

            <div style={T.setSec}>
              <div style={T.secTitle}>VOICE · READ ANSWERS ALOUD</div>
              <div style={{ ...T.setRow, marginBottom:"12px" }}>
                <button style={T.seg(voiceEngine === "device")} onClick={() => chooseVoiceEngine("device")}>DEVICE</button>
                <button style={T.seg(voiceEngine === "elevenlabs")} onClick={() => chooseVoiceEngine("elevenlabs")}>ELEVENLABS</button>
              </div>
              {voiceEngine === "device" ? (
                <div style={T.modalSub}>
                  Your device's built-in voice. Free, no key, and works with no signal and on the deck.<br /><br />
                  iPhone: for a much better voice, open Settings → Accessibility → Spoken Content →
                  Voices → English, and download one marked Enhanced or Premium.
                </div>
              ) : (
                <div>
                  <div style={T.modalSub}>
                    Natural voice. Needs a signal. While this is on, the text of each answer being read
                    aloud is sent to ElevenLabs. Your key is stored on this device only and sent only to
                    api.elevenlabs.io. With no signal or an error, the device voice reads instead.<br /><br />
                    Create a key at <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" style={T.link}>elevenlabs.io</a> → API Keys.
                    Restrict it to Text to Speech and set a credit limit.
                  </div>
                  <input style={T.modalInput} type="password" value={elevenKeyInput} onChange={e => setElevenKeyInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveElevenKey()} placeholder={elevenKey ? "Key saved · paste to replace" : "ElevenLabs API key"} aria-label="ElevenLabs API key" />
                  <div style={T.setRow}>
                    <button style={T.modalBtn} onClick={saveElevenKey}>SAVE KEY</button>
                  </div>
                  {elevenKey && <button style={T.modalClear} onClick={clearElevenKey}>Clear saved ElevenLabs key</button>}
                  <div style={{ ...T.modalSub, marginTop:"14px", marginBottom:"6px" }}>
                    Voice ID (optional): copy one from the ElevenLabs voice library. Blank = default voice.
                  </div>
                  <input style={T.modalInput} value={voiceIdInput} onChange={e => setVoiceIdInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveVoiceId()} placeholder={ELEVEN_DEFAULTS.voice} aria-label="ElevenLabs voice ID" />
                  <div style={T.setRow}>
                    <button style={T.modalCancel} onClick={saveVoiceId}>SAVE VOICE</button>
                  </div>
                </div>
              )}
              <div style={{ ...T.setRow, marginTop:"10px" }}>
                <button style={T.modalCancel} onClick={speaking ? stopSpeaking : testVoice}>{speaking ? "■ STOP" : "▶ TEST VOICE"}</button>
              </div>
              {voiceMsg && <div style={T.statusLine("#f5a623")}>{voiceMsg}</div>}
            </div>

            <div style={T.setSec}>
              <div style={T.secTitle}>SERVICE LOG BACKUP</div>
              <div style={T.modalSub}>
                Export a file, then import it on your other device. Imports merge: for each task the
                higher-mileage record wins and nothing is deleted. The API key is never included.
              </div>
              <div style={T.setRow}>
                <button style={T.modalBtn} onClick={exportLog}>EXPORT LOG</button>
                <button style={T.modalCancel} onClick={() => importRef.current && importRef.current.click()}>IMPORT BACKUP</button>
              </div>
              <input ref={importRef} type="file" accept="application/json,.json" style={{ display:"none" }} onChange={importLog} />
              {backupMsg && <div style={T.statusLine("#f5a623")}>{backupMsg}</div>}
            </div>

            <button style={T.modalDone} onClick={() => setShowSettings(false)}>DONE</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={T.hdr}>
        <div style={T.truckRow}>
          <div style={T.redBar} />
          <div style={{ flex:1 }}>
            <div style={T.title}>2019 Tacoma TRD Sport</div>
            <div style={T.sub}>3.5L V6 · 6-Speed Auto · 4WD</div>
          </div>
          <button style={T.settingsBtn} onClick={() => { setApiKeyInput(""); setBackupMsg(""); setEndpointInput(localCfg.endpoint); setModelInput(localCfg.model); setElevenKeyInput(""); setVoiceIdInput(elevenVoice); setVoiceMsg(""); setShowSettings(true); }} title={aiReady ? "AI ready ✓" : "Settings"} aria-label="Settings">
            {aiReady ? "⚙✓" : "⚙"}
          </button>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
          <span style={{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#666", textTransform:"uppercase", letterSpacing:"0.06em" }}>Mileage:</span>
          <input style={T.mileIn} value={mileInput} onChange={e => setMileInput(e.target.value)} onKeyDown={e => e.key === "Enter" && saveMiles()} placeholder="e.g. 45000" />
          <button style={T.setBtn} onClick={saveMiles}>SET</button>
          {mileage > 0 && <span style={T.mileVal}>{mileage.toLocaleString()} mi</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={T.tabNav}>
        {[["schedule","📋 SCHEDULE"],["library","📚 LIBRARY"],["wrench","🔧 AI WRENCH"]].map(([id,label]) => (
          <button key={id} style={T.tab(tab===id)} onClick={() => { setTab(id); if (id !== "library") setTask(null); }}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={T.content}>

        {tab === "schedule" && (
          <div>
            {!mileage && <div style={T.warn}>⚠ Enter your current mileage above to see maintenance status</div>}
            {mileage > 0 && unlogged > 0 && (
              <div style={T.hint}>{unlogged} {unlogged === 1 ? "task has" : "tasks have"} no service record, so {unlogged === 1 ? "it can't" : "they can't"} show as overdue. Open one and log when it was last done, or tap Never done.</div>
            )}
            {sorted.map(t => <TaskHover key={t.id} t={t} />)}
            <div style={{ padding:"12px 16px", borderTop:"1px solid #1a1a1a" }}>
              <a href="https://www.youtube.com/playlist?list=PLn_AlHagLpdUbx1L2CmpYDTtIHlQOMwoA" target="_blank" rel="noopener noreferrer"
                style={{ ...T.vidLink, background:"#0f0f0f", border:"1px solid #1e1e1e" }}>
                <span style={{ fontSize:"18px", color:"#cc0000" }}>▶</span>
                <span style={{ fontSize:"12px", color:"#888" }}>Team Oil Drop · Tacoma DIY Playlist (51 videos)</span>
              </a>
            </div>
          </div>
        )}

        {tab === "library" && (
          task ? <Detail t={task} /> : (
            <div>
              <input style={T.searchIn} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." />
              {filtered.map(t => <TaskHover key={t.id} t={t} />)}
            </div>
          )
        )}

        {tab === "wrench" && (
          <div style={T.chatWrap}>
            {provider === "local" && <div style={T.offlineBanner}>OFFLINE AI · {localCfg.model} · confirm torque values in the Library</div>}
            {task && <div style={T.ctxBanner}>CONTEXT: {task.name}</div>}
            {provider === "local" && localStatus !== "ready" && <div style={T.noKey}>{localStatusText}</div>}
            {provider === "cloud" && !apiKey && (
              <div style={T.noKey}>
                ⚙ No API key set. Click the ⚙ button in the header to add your Anthropic API key.<br />
                Get one free at console.anthropic.com — pay per use, fractions of a cent per chat.
              </div>
            )}
            <div style={T.chatMsgs}>
              <div style={T.aiBub}>{provider === "local" ? LOCAL_GREETING : CLOUD_GREETING}</div>
              {msgs.map((m,i) => (
                <div key={i} style={m.role==="user" ? T.userBub : T.aiBub}>
                  {m.content}
                  {m.role === "assistant" && !m.ui && !m.streaming && (
                    <button style={T.readBtn} onClick={() => readAloud(m.content)} aria-label="Read this answer aloud">▶ READ</button>
                  )}
                </div>
              ))}
              {aiLoading && msgs[msgs.length - 1]?.role === "user" && (
                <div style={T.typingBub}>⟳  Thinking...{provider === "local" ? " (offline model: this can take a minute)" : ""}</div>
              )}
              <div ref={chatEnd} />
            </div>
            <div style={T.voiceBar}>
              <button style={T.voiceBtn(voiceOn, speaking)} onClick={toggleVoice} aria-pressed={voiceOn}
                aria-label={speaking ? "Stop reading" : voiceOn ? "Turn voice off" : "Turn voice on"}>
                {speaking ? "■ STOP" : voiceOn ? "🔊 VOICE ON" : "🔈 VOICE OFF"}
              </button>
              <span style={T.voiceNote}>
                {voiceMsg || (voiceOn
                  ? (voiceEngine === "elevenlabs" && elevenKey ? "ElevenLabs voice · reads each answer" : "Device voice · reads each answer")
                  : "Tap to hear answers read aloud")}
              </span>
            </div>
            <div style={T.quickBar}>
              {["Torque specs for oil change?","How do I check ATF level?","Diff fluid — fill plug first?","Spark plug gap spec?"].map(q => (
                <button key={q} style={T.quickBtn} onClick={() => setInputText(q)}>{q}</button>
              ))}
            </div>
            <div style={T.chatInputRow}>
              <textarea
                style={T.chatTa}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
                placeholder={provider === "local" ? "Ask the offline mechanic... (Enter to send)" : apiKey ? "Ask anything about your Tacoma... (Enter to send)" : "Add API key via ⚙ to enable AI chat"}
                rows={2}
              />
              <button style={T.sendBtn} onClick={send} disabled={aiLoading}>SEND</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<TacomaHub />);
