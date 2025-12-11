// Tools data - easy to update by adding new objects to this array
const tools = [
    // LIVE TOOLS - For real clinical use
    {
        id: "als-app",
        name: "Cardiac Arrest App",
        description: "Real-time tool for managing and documenting actual cardiac arrest resuscitations in the emergency department",
        category: "Live Tools",
        tags: ["resuscitation", "ALS", "cardiac arrest", "documentation", "real-time"],
        url: "https://wmebemals.netlify.app",
        featured: true,
        icon: "cardiac",
        screenshot: "screenshots/als-app.png"
    },
    {
        id: "rsi-tool",
        name: "RSI Management Tool",
        description: "Structured tool to assist with planning, execution, and documentation of rapid sequence intubation in the ED",
        category: "Live Tools",
        tags: ["RSI", "intubation", "airway", "documentation", "checklist"],
        url: "https://wmebemrsi.netlify.app",
        featured: true,
        icon: "airway",
        screenshot: "screenshots/rsi-tool.png"
    },
    {
        id: "sedation",
        name: "Procedural Sedation Tool",
        description: "Comprehensive tool to help plan, run, and document procedural sedation safely in the emergency department",
        category: "Live Tools",
        tags: ["sedation", "procedures", "documentation", "safety", "monitoring"],
        url: "https://sedation.netlify.app",
        featured: true,
        icon: "procedure",
        screenshot: "screenshots/sedation.png"
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
        id: "rosc-management",
        name: "Post-ROSC Management",
        description: "Dedicated tool for the receipt and management of post-return of spontaneous circulation patients in the ED",
        category: "Live Tools",
        tags: ["ROSC", "post-arrest", "cardiac arrest", "resuscitation", "critical care"],
        url: "https://wmebemcardiacarrest.netlify.app",
        featured: true,
        icon: "cardiac",
        screenshot: "screenshots/rosc-management.png"
    },
    
    // SIMULATION TOOLS - For training
    {
        id: "em-simulator",
        name: "Emergency Medicine Simulator",
        description: "Advanced emergency medicine simulation platform for comprehensive scenario-based training and assessment",
        category: "Simulation",
        tags: ["simulation", "training", "assessment", "scenarios", "advanced"],
        url: "https://wmebemsim.netlify.app",
        featured: false,
        icon: "monitor",
        screenshot: "screenshots/em-simulator.png"
    },
    {
        id: "defib-sim",
        name: "Defibrillator Simulator",
        description: "Interactive defibrillator simulation tool for training in cardioversion, defibrillation, and external pacing",
        category: "Simulation",
        tags: ["defibrillator", "cardioversion", "pacing", "simulation", "equipment"],
        url: "https://wmebemdefib.netlify.app",
        featured: false,
        icon: "defib",
        screenshot: "screenshots/defib-sim.png"
    },
    
    // EDUCATION & ADVISORY TOOLS - Guidelines and references
    {
        id: "dvla-guide",
        name: "DVLA Driving Advice",
        description: "Up-to-date DVLA driving advice and regulations for a variety of medical conditions relevant to EM practice",
        category: "Education & Advisory",
        tags: ["DVLA", "driving", "regulations", "guidelines", "discharge advice"],
        url: "https://wmebemdvla.netlify.app",
        featured: false,
        icon: "guidelines",
        screenshot: "screenshots/dvla-guide.png"
    },
    {
        id: "tloc-tool",
        name: "Syncope & TLOC Assessment",
        description: "Evidence-based risk stratification and investigation guidance for syncope and transient loss of consciousness",
        category: "Education & Advisory",
        tags: ["syncope", "TLOC", "risk stratification", "investigation", "assessment"],
        url: "https://wmebemtloc.netlify.app",
        featured: false,
        icon: "assessment",
        screenshot: "screenshots/tloc-tool.png"
    },
    {
        id: "pericardiocentesis",
        name: "Emergency Pericardiocentesis",
        description: "Comprehensive guide to the emergency medicine approach to pericardiocentesis including indications and technique",
        category: "Education & Advisory",
        tags: ["pericardiocentesis", "procedures", "cardiac", "tamponade", "ultrasound"],
        url: "https://wmebempericardiocentesis.netlify.app",
        featured: false,
        icon: "procedure",
        screenshot: "screenshots/pericardiocentesis.png"
    }
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = tools;
}
