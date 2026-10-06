// Tools data - EMEvidence
const tools = [
    // --- HIGHLIGHTED APPS (isNew: true puts a tool in the Highlighted Apps row) ---
    {
        id: "em-simulator",
        name: "Medical Simulation App",
        description: "Interactive emergency medicine simulation cases for training and self-directed learning — resuscitation, majors, and paediatric scenarios",
        category: "Simulation",
        tags: ["simulation", "training", "education", "cases", "resuscitation"],
        url: "https://wmebemsim.netlify.app/",
        featured: true,
        isNew: true,
        icon: "monitor",
        screenshot: "screenshots/em-simulator.png"
    },
    {
        id: "frcem-revision",
        name: "FRCEM & MRCEM Revision App",
        description: "Exam revision tool for FRCEM and MRCEM candidates — practice questions, OSCE preparation, and high-yield topic revision",
        category: "Education & Advisory",
        tags: ["FRCEM", "MRCEM", "revision", "exams", "OSCE", "training"],
        url: "https://frcemosceprep.netlify.app/",
        featured: true,
        beta: true,
        isNew: true,
        icon: "assessment",
        screenshot: "screenshots/frcem-revision.png"
    },
    // --- BEDSIDE AIDS (Cognitive aids for use at the bedside) ---
    {
        id: "als-app",
        name: "Cardiac Arrest App",
        description: "Real-time tool for managing and documenting actual cardiac arrest resuscitations in the emergency department",
        category: "Bedside Aids",
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
        category: "Bedside Aids",
        tags: ["trauma", "ATLS", "primary survey", "secondary survey", "documentation"],
        url: "https://majortrauma.netlify.app",
        featured: true,
        icon: "trauma",
        screenshot: "screenshots/major-trauma.png"
    },
    {
        id: "trauma-briefing",
        name: "Trauma Briefing & Zero Point",
        description: "Digital aid for the zero point survey and team briefing prior to trauma patient arrival",
        category: "Bedside Aids",
        tags: ["trauma", "briefing", "leadership", "zero point", "team"],
        url: "https://wmebemtraumabriefing.netlify.app",
        featured: true,
        icon: "trauma",
        screenshot: "screenshots/trauma-briefing.png"
    },
    {
        id: "back-pain-proforma",
        name: "Back Pain Proforma",
        description: "Back Pain Proforma for BHH and GHH",
        category: "Bedside Aids",
        tags: ["documentation"],
        url: "https://bhhbackpain.netlify.app",
        featured: true,
        icon: "assessment",
        screenshot: "screenshots/back-pain.png"
    },
    {
        id: "sedation",
        name: "Procedural Sedation Tool",
        description: "Comprehensive tool to help plan, run, and document procedural sedation safely in the emergency department",
        category: "Bedside Aids",
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
        category: "Bedside Aids",
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
        category: "Bedside Aids",
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
        category: "Bedside Aids",
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
        category: "Bedside Aids",
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
        category: "Bedside Aids",
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
        category: "Bedside Aids",
        tags: ["ophthalmology", "eyes", "vision", "assessment"],
        url: "https://wmebemvisualacuity.netlify.app",
        featured: false,
        icon: "assessment",
        screenshot: "screenshots/visual-acuity.png"
    },
    {
        id: "paed-first-seizure",
        name: "Paediatric First Seizure Assessment",
        description: "Structured assessment and documentation tool for children presenting with a first seizure, referencing NICE CG137 / NG217 and RCPCH guidance, with red-flag prompts and a pre-populated EPR note",
        category: "Bedside Aids",
        tags: ["paediatrics", "seizure", "epilepsy", "NICE", "RCPCH", "documentation", "red flags"],
        url: "https://paedfirstseizure.netlify.app",
        featured: false,
        icon: "assessment",
        screenshot: "screenshots/paed-first-seizure.png"
    },
    {
        id: "major-incident-triage",
        openInNewTab: true,
        name: "Major Incident Triage Tool",
        description: "Offline-capable app for triaging and documenting casualties in a major incident (TST and MITT), with patient handover by QR code, METHANE reporting and casualty register export",
        category: "Bedside Aids",
        tags: ["major incident", "triage", "TST", "MITT", "METHANE", "handover", "offline"],
        url: "https://majorincident.netlify.app",
        featured: false,
        icon: "trauma",
        screenshot: "screenshots/major-incident-triage.png"
    },
    {
        id: "uhb-side-room",
        name: "ED Side-Room Prioritisation (UHB, preliminary)",
        description: "PRELIMINARY DRAFT (v5, Oct 2026), for IPC review and not yet Trust-approved. Who gets the side room first when rooms run out in UHB EDs: priority ladder, two-patients-one-room rules, suspicion thresholds and de-isolation",
        category: "Bedside Aids",
        tags: ["isolation", "side room", "infection control", "IPC", "UHB", "preliminary"],
        url: "https://uhbsideroom.netlify.app",
        featured: false,
        beta: true,
        icon: "guidelines",
        screenshot: "screenshots/uhb-side-room.png"
    },

    // --- SIMULATION (For Training) ---
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
        id: "paeds-guidelines",
        name: "Paediatric Guidelines 2025–28",
        description: "Searchable collection of paediatric guidelines, scores and calculators, with offline use, favourites and dark mode",
        category: "Education & Advisory",
        tags: ["paediatrics", "guidelines", "reference", "scores", "calculators", "offline"],
        url: "https://paedsguide.netlify.app",
        featured: false,
        icon: "guidelines",
        screenshot: "screenshots/paeds-guidelines.png"
    },
    {
        id: "bhh-who-sees-who",
        name: "BHH Who Sees Who",
        description: "Birmingham Heartlands specific who sees who guideline",
        category: "Education & Advisory",
        tags: ["guidelines", "BHH", "referrals", "workflow", "specialty"],
        url: "https://bhhwhoseeswho.netlify.app",
        featured: false,
        icon: "guidelines",
        screenshot: "screenshots/bhh-who-sees-who.png"
    },
    {
        id: "consultant-ai",
        name: "Consultant AI Dashboard",
        description: "Educational site on ways medical consultants can utilise AI in their working lives",
        category: "Education & Advisory",
        tags: ["AI", "education", "productivity", "management", "tech"],
        url: "https://consultantaidashboard.netlify.app",
        featured: false,
        icon: "monitor",
        screenshot: "screenshots/consultant-ai.png"
    },
    {
        id: "qip-assist",
        isNew: true,
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
        isNew: true,
        name: "HALO QRH",
        description: "Digital Quick Reference Handbook (QRH) for High Acuity Low Occurrence emergency situations",
        category: "Education & Advisory",
        tags: ["resuscitation", "guidelines", "checklist", "HALO"],
        url: "https://wmebemhaloqrh.netlify.app",
        featured: false,
        beta: true,
        icon: "guidelines",
        screenshot: "screenshots/halo-qrh.png"
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
        id: "af-in-the-ed",
        name: "AF in the ED",
        description: "Guide on managing new AF in the ED",
        category: "Education & Advisory",
        tags: ["guidelines", "cardiac"],
        url: "https://wmebemaf.netlify.app",
        featured: false,
        icon: "guidelines",
        screenshot: "screenshots/af.png"
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
    },
    {
        id: "teg-edu",
        name: "Viscoelastic Testing (TEG)",
        description: "Training and education on viscoelastic testing in emergency and critical care",
        category: "Education & Advisory",
        tags: ["TEG", "viscoelastic", "haematology", "bleeding", "education"],
        url: "https://wmebemteg.netlify.app",
        featured: false,
        icon: "monitor",
        screenshot: "screenshots/teg.png"
    },
    {
        id: "dog-bites",
        name: "Dog Bite Management",
        description: "Guidance on the assessment and management of dog bites in the emergency department",
        category: "Education & Advisory",
        tags: ["trauma", "wounds", "bites", "infection", "guidelines"],
        url: "https://wmebemdogbites.netlify.app",
        featured: false,
        icon: "procedure",
        screenshot: "screenshots/dog-bites.png"
    },
    {
        id: "ai-for-em",
        name: "AI for EM Clinicians",
        description: "Educational website teaching emergency medicine clinicians how to use artificial intelligence for portfolios, research, and critical appraisal",
        category: "Education & Advisory",
        tags: ["AI", "education", "research", "portfolio", "appraisal"],
        url: "https://wmebemaiforem.netlify.app",
        featured: false,
        icon: "monitor",
        screenshot: "screenshots/ai-for-em.png"
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = tools;
}
