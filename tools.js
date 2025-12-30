// Tools data - WMEBEM
const tools = [
    // --- LIVE TOOLS (For Real Clinical Use) ---
    {
        id: "als-app",
        name: "Cardiac Arrest App",
        description: "Real-time tool for managing and documenting actual cardiac arrest resuscitations in the emergency department",
        category: "Live Tools",
        tags: ["resuscitation", "cardiac", "ALS", "documentation", "real-time"],
        url: "https://wmebemals.netlify.app",
        featured: true,
        icon: "cardiac",
        screenshot: "screenshots/als-app.png"
    },
    {
        id: "major-trauma",
        name: "Major Trauma Management",
        description: "Complete app to run and document major trauma cases including primary and secondary survey protocols",
        category: "Live Tools",
        tags: ["trauma", "ATLS", "primary survey", "secondary survey", "documentation"],
        url: "https://majortrauma.netlify.app",
        featured: true,
        icon: "trauma",
        screenshot: "screenshots/major-trauma.png"
    },
    {
        id: "back-pain-proforma",
        name: "BHH/GHH Back Pain Assessment",
        description: "Structured assessment pro forma for low back pain presentations. **NOTE: For use at BHH & GHH Emergency Departments ONLY.**",
        category: "Live Tools",
        tags: ["orthopaedics", "back pain", "assessment", "BHH", "GHH", "spinal"],
        url: "https://INSERT-URL-HERE", 
        featured: false,
        icon: "assessment",
        screenshot: "screenshots/back-pain.png"
    },
    {
        id: "trauma-briefing",
        name: "Trauma Briefing & Zero Point",
        description: "Digital aid for the zero point survey and team briefing prior to trauma patient arrival",
        category: "Live Tools",
        tags: ["trauma", "briefing", "leadership", "zero point", "team"],
        url: "https://wmebemtraumabriefing.netlify.app",
        featured: true,
        icon: "trauma",
        screenshot: "screenshots/trauma-briefing.png"
    },
    {
        id: "sedation",
        name: "Procedural Sedation Tool",
        description: "Comprehensive tool to help plan, run, and document procedural sedation safely in the emergency department",
        category: "Live Tools",
        tags: ["sedation", "procedures", "safety", "documentation", "monitoring"],
        url: "https://sedation.netlify.app",
        featured: true,
        icon: "procedure",
        screenshot: "screenshots/sedation.png"
    },
    {
        id: "rsi-tool",
        name: "RSI Management Tool",
        description: "Structured tool to assist with planning, execution, and documentation of rapid sequence intubation in the ED",
        category: "Live Tools",
        tags: ["RSI", "airway", "intubation", "safety", "checklist"],
        url: "https://wmebemrsi.netlify.app",
        featured: true,
        icon: "airway",
        screenshot: "screenshots/rsi-tool.png"
    },
    {
        id: "rosc-management",
        name: "Post-ROSC Management",
        description: "Dedicated tool for the receipt and management of post-return of spontaneous circulation patients in the ED",
        category: "Live Tools",
        tags: ["cardiac", "resuscitation", "ROSC", "critical care"],
        url: "https://wmebemcardiacarrest.netlify.app",
        featured: false,
        icon: "cardiac",
        screenshot: "screenshots/rosc-management.png"
    },
    {
        id: "em-obstetrics",
        name: "Obstetric Emergencies",
        description: "Real-time cognitive aid for managing obstetric emergencies including PPH, eclampsia, and maternal resuscitation",
        category: "Live Tools",
        tags: ["obstetrics", "pregnancy", "emergency", "PPH", "resuscitation"],
        url: "https://emobstetrics.netlify.app",
        featured: true,
        icon: "procedure",
        screenshot: "screenshots/em-obstetrics.png"
    },
    {
        id: "sedation-agitated",
        name: "Agitated Patient Sedation",
        description: "Protocol for the safe sedation and management of patients with acute behavioural disturbance",
        category: "Live Tools",
        tags: ["sedation", "mental health", "agitated", "ABD", "safety"],
        url: "https://wmebemsedationagitated.netlify.app",
        featured: false,
        icon: "procedure",
        screenshot: "screenshots/sedation-agitated.png"
    },
    {
        id: "paeds-trauma-imaging",
        name: "Paeds Trauma Imaging",
        description: "Decision support tool for CT imaging in paediatric trauma based on latest Royal College of Radiology advice",
        category: "Live Tools",
        tags: ["paediatrics", "trauma", "imaging", "radiology", "CT"],
        url: "https://wmebempaedstraumaimaging.netlify.app",
        featured: false,
        icon: "monitor",
        screenshot: "screenshots/paeds-trauma.png"
    },
    {
        id: "visual-acuity",
        name: "Visual Acuity Screen",
        description: "Digital visual acuity testing chart for bedside eye assessment",
        category: "Live Tools",
        tags: ["ophthalmology", "eyes", "vision", "assessment"],
        url: "https://wmebemvisualacuity.netlify.app",
        featured: false,
        icon: "assessment",
        screenshot: "screenshots/visual-acuity.png"
    },

    // --- SIMULATION (For Training) ---
    {
        id: "em-simulator",
        name: "Emergency Medicine Simulator",
        description: "Advanced emergency medicine simulation platform for comprehensive scenario-based training and assessment",
        category: "Simulation",
        tags: ["simulation", "training", "scenarios", "education"],
        url: "https://wmebemsim.netlify.app",
        featured: true,
        icon: "monitor",
        screenshot: "screenshots/em-simulator.png"
    },
    {
        id: "incident-game",
        name: "Major Incident Game",
        description: "Interactive simulation game for training in major incident command, control, and triage",
        category: "Simulation",
        tags: ["major incident", "simulation", "triage", "command", "game"],
        url: "https://wmebemincident.netlify.app",
        featured: false,
        beta: true,
        icon: "trauma",
        screenshot: "screenshots/incident-game.png"
    },
    {
        id: "mass-casualty-triage",
        name: "Mass Casualty Triage",
        description: "Training application for mass casualty triage sorting using standard sieve and sort methods",
        category: "Simulation",
        tags: ["major incident", "triage", "training", "sieve", "sort"],
        url: "https://tstmitt.netlify.app",
        featured: false,
        icon: "trauma",
        screenshot: "screenshots/mass-casualty.png"
    },
    {
        id: "defib-sim",
        name: "Defibrillator Simulator",
        description: "Interactive defibrillator simulation tool for training in cardioversion, defibrillation, and external pacing",
        category: "Simulation",
        tags: ["simulation", "cardiac", "defibrillator", "pacing", "equipment"],
        url: "https://wmebemdefib.netlify.app",
        featured: false,
        icon: "defib",
        screenshot: "screenshots/defib-sim.png"
    },

    // --- EDUCATION & ADVISORY (Reference & Guidelines) ---
    {
        id: "qip-assist",
        name: "QIP Assist",
        description: "Interactive guide to help doctors design, execute and visualize RCEM Quality Improvement Projects",
        category: "Education & Advisory",
        tags: ["QIP", "audit", "governance", "education", "management"],
        url: "https://wmebemqipassist.netlify.app",
        featured: false,
        beta: true,
        icon: "guidelines",
        screenshot: "screenshots/qip-assist.png"
    },
    {
        id: "halo-qrh",
        name: "HALO QRH",
        description: "Digital Quick Reference Handbook (QRH) for High Acuity Low Occurrence emergency situations",
        category: "Education & Advisory",
        tags: ["resuscitation", "guidelines", "checklist", "HALO"],
        url: "https://wmebemhaloqrh.netlify.app",
        featured: false,
        beta: true,
        icon: "guidelines",
        screenshot: "screenshots/halo.png"
    },
    {
        id: "limping-child",
        name: "Limping Child Pathway",
        description: "Clinical pathway for the assessment, risk stratification, and management of the limping child",
        category: "Education & Advisory",
        tags: ["paediatrics", "orthopaedics", "limp", "septic arthritis", "pathway"],
        url: "https://wmebemlimpingchild.netlify.app",
        featured: false,
        icon: "assessment",
        screenshot: "screenshots/limping-child.png"
    },
    {
        id: "hyponatraemia",
        name: "Hyponatraemia Guide",
        description: "Interactive guide for the assessment and safe management of hyponatraemia in the emergency department",
        category: "Education & Advisory",
        tags: ["metabolic", "sodium", "guidelines", "endocrine"],
        url: "https://wmebemhyponatraemia.netlify.app",
        featured: false,
        icon: "guidelines",
        screenshot: "screenshots/hyponatraemia.png"
    },
    {
        id: "tloc-tool",
        name: "Syncope & TLOC Assessment",
        description: "Evidence-based risk stratification and investigation guidance for syncope and transient loss of consciousness",
        category: "Education & Advisory",
        tags: ["cardiac", "syncope", "neuro", "risk", "assessment"],
        url: "https://wmebemtloc.netlify.app",
        featured: false,
        icon: "assessment",
        screenshot: "screenshots/tloc-tool.png"
    },
    {
        id: "dvla-guide",
        name: "DVLA Driving Advice",
        description: "Up-to-date DVLA driving advice and regulations for a variety of medical conditions relevant to EM practice",
        category: "Education & Advisory",
        tags: ["DVLA", "legal", "discharge", "guidelines"],
        url: "https://wmebemdvla.netlify.app",
        featured: false,
        icon: "guidelines",
        screenshot: "screenshots/dvla-guide.png"
    },
    {
        id: "omi-stemi",
        name: "OMI / STEMI Education",
        description: "Educational resource covering the new OMI (Occlusion MI) paradigm and STEMI recognition",
        category: "Education & Advisory",
        tags: ["cardiac", "ECG", "education", "STEMI", "OMI"],
        url: "https://wmebemstemitoomi.netlify.app",
        featured: false,
        icon: "cardiac",
        screenshot: "screenshots/omi.png"
    },
    {
        id: "fluid-sid",
        name: "Fluid & Electrolyte Resus",
        description: "Guide for fluid resuscitation strategies and Strong Ion Difference (SID) calculation and interpretation",
        category: "Education & Advisory",
        tags: ["resuscitation", "metabolic", "fluids", "education"],
        url: "https://wmebemsid.netlify.app/",
        featured: false,
        icon: "monitor",
        screenshot: "screenshots/fluid-sid.png"
    },
    {
        id: "hot-joint",
        name: "Hot Joint Education",
        description: "Educational resource covering the assessment, investigation, and management of the hot swollen joint",
        category: "Education & Advisory",
        tags: ["orthopaedics", "septic arthritis", "joint", "education"],
        url: "https://wmebemhotjoint.netlify.app",
        featured: false,
        icon: "assessment",
        screenshot: "screenshots/hot-joint.png"
    },
    {
        id: "antiemetics",
        name: "Antiemetics Guidance",
        description: "Evidence-based advice and guidance on antiemetic selection and dosing for various presentations",
        category: "Education & Advisory",
        tags: ["pharmacology", "guidelines", "vomiting"],
        url: "https://wmebemantiemetics2.netlify.app",
        featured: false,
        icon: "procedure",
        screenshot: "screenshots/antiemetics.png"
    },
    {
        id: "triage-app",
        name: "Experimental Triage",
        description: "Experimental digital triage support tool for initial patient assessment and categorization",
        category: "Education & Advisory",
        tags: ["triage", "assessment", "experimental"],
        url: "https://wmebemtriage.netlify.app",
        featured: false,
        beta: true,
        icon: "assessment",
        screenshot: "screenshots/triage.png"
    },
    {
        id: "box-breathing",
        name: "Box Breathing App",
        description: "Visual pacing tool for box breathing techniques to manage stress, anxiety, and performance",
        category: "Education & Advisory",
        tags: ["wellbeing", "stress", "mental health"],
        url: "https://wmebemboxbreathing.netlify.app/",
        featured: false,
        icon: "monitor",
        screenshot: "screenshots/box-breathing.png"
    },
    {
        id: "ct-risk",
        name: "CT Risk in Children",
        description: "Educational summary and critical appraisal regarding radiation risk and malignancy from CT scans in children",
        category: "Education & Advisory",
        tags: ["paediatrics", "radiology", "risk", "education"],
        url: "https://wmebemctrisk.netlify.app",
        featured: false,
        icon: "monitor",
        screenshot: "screenshots/ct-risk.png"
    },
    {
        id: "sedation-edu",
        name: "Sedation Education",
        description: "Educational modules covering pharmacology, safety, and techniques for procedural sedation",
        category: "Education & Advisory",
        tags: ["sedation", "education", "training"],
        url: "https://wmebemsedation.netlify.app",
        featured: false,
        icon: "procedure",
        screenshot: "screenshots/sedation-edu.png"
    },
    {
        id: "dvla-poster",
        name: "DVLA Advice Poster",
        description: "Quick-reference visual poster summarizing common DVLA driving restrictions for ED patients",
        category: "Education & Advisory",
        tags: ["DVLA", "legal", "poster", "reference"],
        url: "https://dvlaemposter.netlify.app",
        featured: false,
        icon: "guidelines",
        screenshot: "screenshots/dvla-poster.png"
    },
    {
        id: "pericardiocentesis",
        name: "Emergency Pericardiocentesis",
        description: "Comprehensive guide to the emergency medicine approach to pericardiocentesis including indications and technique",
        category: "Education & Advisory",
        tags: ["procedures", "cardiac", "guide"],
        url: "https://wmebempericardiocentesis.netlify.app",
        featured: false,
        icon: "procedure",
        screenshot: "screenshots/pericardiocentesis.png"
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = tools;
}
