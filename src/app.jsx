
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
OIL CHANGE (5k-10k mi): Drain plug 30lb-ft/14mm | Filter cap 18lb-ft/TOY640 | Filter drain plug 10lb-ft/3/8"sq | Under cover 22lb-ft/12mm. Parts: Oil #00279-0WQTE-01, Drain gasket #90430-12031, Filter #04152-YZZA1. Note: TOY640 filter socket essential. Filter housing is permanent. Must remove skid plate.
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

function TacomaHub() {
  const [tab, setTab] = useState("schedule");
  const [mileage, setMileage] = useState(0);
  const [mileInput, setMileInput] = useState("");
  const [logs, setLogs] = useState({});
  const [task, setTask] = useState(null);
  const [msgs, setMsgs] = useState([
    { role:"assistant", content:"Ready. Ask me anything about your 2019 Tacoma TRD Sport — torque specs, step-by-step guides, troubleshooting, part numbers.\n\nAt 128,342 mi you are past due on spark plugs and coolant.\n\n⚠️ AI chat needs an Anthropic API key and a signal. Everything else in this app works offline. Add your key via the ⚙ button." }
  ]);
  const [inputText, setInputText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("taco-apikey") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const chatEnd = useRef(null);

  useEffect(() => {
    const m = localStorage.getItem("taco-mi");
    if (m) { setMileage(parseInt(m)); setMileInput(m); }
    const l = localStorage.getItem("taco-log");
    if (l) { try { setLogs(JSON.parse(l)); } catch(e) {} }
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, aiLoading]);

  const saveMiles = () => {
    const n = parseInt(mileInput.replace(/,/g,""));
    if (!isNaN(n) && n > 0) { setMileage(n); localStorage.setItem("taco-mi", String(n)); }
  };

  const markDone = (id) => {
    if (!mileage) { alert("Set your current mileage first."); return; }
    const updated = { ...logs, [id]:{ mileage, date:new Date().toISOString() } };
    setLogs(updated);
    localStorage.setItem("taco-log", JSON.stringify(updated));
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

  const send = async () => {
    if (!inputText.trim() || aiLoading) return;
    if (!apiKey) { setShowSettings(true); return; }
    const userMsg = inputText.trim();
    setInputText("");
    const taskCtx = task ? `\n\nUser is viewing the "${task.name}" task.` : "";
    const next = [...msgs, { role:"user", content:userMsg }];
    setMsgs(next);
    setAiLoading(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": apiKey,
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true"
        },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: SYS_PROMPT + taskCtx,
          messages: next.map(m => ({ role:m.role, content:m.content }))
        })
      });
      const d = await r.json();
      if (d.error) {
        setMsgs(p => [...p, { role:"assistant", content:`API Error: ${d.error.message}\n\nCheck your API key in ⚙ Settings.` }]);
      } else {
        const reply = d.content?.find(c => c.type==="text")?.text || "No response received.";
        setMsgs(p => [...p, { role:"assistant", content:reply }]);
      }
    } catch(e) {
      setMsgs(p => [...p, { role:"assistant", content:"Connection error. Check your internet connection and try again." }]);
    }
    setAiLoading(false);
  };

  const sorted = [...TASKS].sort((a,b) => {
    const order = { overdue:0, due:1, unknown:2, ok:3, manual:4 };
    return order[getStatus(a,mileage,logs[a.id]).status] - order[getStatus(b,mileage,logs[b.id]).status];
  });

  const filtered = TASKS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.cat.toLowerCase().includes(search.toLowerCase())
  );

  const T = {
    wrap:{ background:"#0d0d0d", color:"#f0f0f0", height:"100%", display:"flex", flexDirection:"column", fontSize:"14px" },
    hdr:{ background:"#111", borderBottom:"3px solid #cc0000", padding:"14px 16px", flexShrink:0 },
    truckRow:{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" },
    redBar:{ width:"4px", height:"40px", background:"#cc0000", borderRadius:"2px", flexShrink:0 },
    title:{ fontFamily:"Impact, 'Arial Narrow Bold', sans-serif", fontSize:"22px", letterSpacing:"0.04em", textTransform:"uppercase", lineHeight:1 },
    sub:{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#888", letterSpacing:"0.06em", textTransform:"uppercase", marginTop:"3px" },
    settingsBtn:{ marginLeft:"auto", background:"transparent", border:"1px solid #2a2a2a", borderRadius:"4px", color: apiKey ? "#22c55e" : "#666", fontSize:"16px", padding:"5px 9px", cursor:"pointer" },
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
    modalBox:{ background:"#161616", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"24px", width:"100%", maxWidth:"440px", margin:"16px" },
    modalTitle:{ fontFamily:"Impact, sans-serif", fontSize:"18px", letterSpacing:"0.06em", textTransform:"uppercase", color:"#f0f0f0", marginBottom:"4px" },
    modalSub:{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#888", marginBottom:"16px", lineHeight:1.6 },
    modalInput:{ width:"100%", background:"#0d0d0d", border:"1px solid #cc0000", borderRadius:"4px", color:"#f0f0f0", fontFamily:"'Courier New', monospace", fontSize:"13px", padding:"10px 12px", outline:"none", marginBottom:"10px" },
    modalBtn:{ background:"#cc0000", border:"none", borderRadius:"4px", color:"#fff", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"14px", padding:"9px 20px", cursor:"pointer", marginRight:"8px" },
    modalCancel:{ background:"transparent", border:"1px solid #333", borderRadius:"4px", color:"#888", fontFamily:"Impact, sans-serif", letterSpacing:"0.06em", fontSize:"14px", padding:"9px 20px", cursor:"pointer" },
    modalClear:{ background:"transparent", border:"none", color:"#ef4444", fontFamily:"'Courier New', monospace", fontSize:"11px", cursor:"pointer", marginTop:"12px", display:"block" },
    link:{ color:"#f5a623", textDecoration:"underline" },
    chevron:{ color:"#333", fontSize:"16px", flexShrink:0 },
    divider:{ height:"16px" },
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
          {log && <div style={{ ...T.tSub, color:"#3a3a3a" }}>last: {log.mileage.toLocaleString()} mi · {new Date(log.date).toLocaleDateString()}</div>}
        </div>
        <div style={T.statusLbl(st.color)}>{st.label}</div>
        <div style={T.chevron}>›</div>
      </div>
    );
  }

  function Detail({ t }) {
    const st = getStatus(t, mileage, logs[t.id]);
    const log = logs[t.id];
    return (
      <div>
        <button style={T.backBtn} onClick={() => setTask(null)}>← BACK</button>
        <div style={T.taskHdr}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px" }}>
            <div style={{ flex:1 }}>
              <div style={T.taskTitle}>{CAT_ICONS[t.cat]} {t.name}</div>
              <div style={T.taskInt}>{t.intervalLabel}</div>
              {log && <div style={T.lastDone}>Last: {log.mileage.toLocaleString()} mi · {new Date(log.date).toLocaleDateString()}</div>}
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ ...T.statusLbl(st.color), fontSize:"12px", marginBottom:"8px" }}>● {st.label}</div>
              <button style={T.doneBtn} onClick={() => markDone(t.id)}>✓ MARK DONE</button>
            </div>
          </div>
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
            <div style={T.modalTitle}>⚙ API Key Setup</div>
            <div style={T.modalSub}>
              Your key is stored locally on this device only — never transmitted anywhere except directly to Anthropic's API.<br /><br />
              Get a free key at <a href="https://console.anthropic.com" target="_blank" style={T.link}>console.anthropic.com</a> → API Keys → Create key.<br />
              Pay-per-use. AI chat costs fractions of a cent per conversation.
            </div>
            <input
              style={T.modalInput}
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveApiKey()}
              placeholder="sk-ant-api03-..."
              autoFocus
            />
            <div>
              <button style={T.modalBtn} onClick={saveApiKey}>SAVE KEY</button>
              <button style={T.modalCancel} onClick={() => setShowSettings(false)}>CANCEL</button>
            </div>
            {apiKey && (
              <button style={T.modalClear} onClick={clearApiKey}>
                Clear saved key
              </button>
            )}
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
          <button style={T.settingsBtn} onClick={() => { setApiKeyInput(""); setShowSettings(true); }} title={apiKey ? "API key set ✓" : "Set API key"}>
            {apiKey ? "⚙✓" : "⚙"}
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
            {task && <div style={T.ctxBanner}>CONTEXT: {task.name}</div>}
            {!apiKey && (
              <div style={T.noKey}>
                ⚙ No API key set. Click the ⚙ button in the header to add your Anthropic API key.<br />
                Get one free at console.anthropic.com — pay per use, fractions of a cent per chat.
              </div>
            )}
            <div style={T.chatMsgs}>
              {msgs.map((m,i) => (
                <div key={i} style={m.role==="user" ? T.userBub : T.aiBub}>{m.content}</div>
              ))}
              {aiLoading && <div style={T.typingBub}>⟳  Thinking...</div>}
              <div ref={chatEnd} />
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
                placeholder={apiKey ? "Ask anything about your Tacoma... (Enter to send)" : "Add API key via ⚙ to enable AI chat"}
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
