// Transcribed from "Minor Programmes for First Degree Students at BITS"
// (Students' Academic Cell, BITS Pilani). General rules that apply to every
// minor (not encoded per-course here): Core max 4 courses/12 units, Electives
// min 2 courses/6 units, Total min 5 courses/15 units, cumulative GPA >= 4.5
// in the courses applied to the minor. At most 2 courses/6 units of the
// total requirement may overlap with your major's general institute
// requirement or discipline core(s). "Water and Sanitation" (minor #16) was
// missing from the supplied PDF export — add it once you have that page.
export interface MinorDefinition {
  id: string;
  name: string;
  coreRequirement: string;
  totalRequirement: string;
  // Every minor uses the general-rule floor (5 courses/15 units) — see
  // totalRequirement above for what each minor's own program page states,
  // kept only for display, not enforced.
  totalMinCourses: number;
  totalMinUnits: number;
}

export interface MinorCourseEntry {
  minorId: string;
  code: string;
  title: string;
  credits: number;
  role: "core" | "elective";
}

interface MinorSpec {
  id: string;
  name: string;
  coreRequirement: string;
  totalRequirement: string;
  core: [string, string, number][];
  electives: [string, string, number][];
}

const MINOR_SPECS: MinorSpec[] = [
  {
    id: "aeronautics",
    name: "Aeronautics",
    coreRequirement: "3 core courses",
    totalRequirement: "6 courses (min), 18 units (min)",
    core: [
      ["AN F311", "Principles of Aerodynamics", 3],
      ["AN F312", "Aircraft Propulsion", 3],
      ["AN F313", "Flight Mechanics and Controls", 3],
    ],
    electives: [
      ["AN F314", "Introduction to Flight", 3],
      ["AN F315", "Aircraft Structures", 3],
      ["ME F415", "Gas Dynamics", 3],
      ["ME F418", "Rocket and Spacecraft Propulsion", 3],
      ["ME F452", "Composite Materials and Design", 3],
      ["ME F482", "Combustion", 3],
      ["ME F485", "Numerical Techniques for Fluid Flow & Heat Transfer", 3],
      ["EEE F242", "Control Systems", 3],
      ["EEE F417", "Computer Based Control Systems", 3],
      ["ME F376", "Design Project", 3],
    ],
  },
  {
    id: "computational-economics",
    name: "Computational Economics",
    coreRequirement: "3 core courses",
    totalRequirement: "5 courses (min), 15 units (min)",
    core: [
      ["ECON F215", "Computational Methods for Economics", 3],
      ["ECON F241", "Econometric Methods", 3],
      ["ECON F242", "Microeconomics", 3],
    ],
    electives: [
      ["BITS F314", "Game Theory and its Applications", 3],
      ["BITS F464", "Machine Learning", 3],
      ["CS F320", "Foundations of Data Science", 3],
      ["ECON F342", "Applied Econometrics", 3],
      ["ECON F419", "Advanced Microeconomics", 3],
      ["ECON F420", "Applied Macroeconometrics", 3],
      ["MATH F424", "Applied Stochastic Process", 4],
    ],
  },
  {
    id: "computing-and-intelligence",
    name: "Computing and Intelligence",
    coreRequirement: "3 core courses",
    totalRequirement: "6 courses (min), 18 units (min) — exclusive to non-CS majors",
    core: [
      ["BITS F232", "Foundations of Data Structures and Algorithms", 4],
      ["CS F372", "Operating Systems", 3],
      ["CS F407", "Artificial Intelligence", 3],
    ],
    electives: [
      ["BITS F311", "Image Processing", 3],
      ["BITS F452", "Blockchain Technology", 3],
      ["BITS F463", "Cryptography", 3],
      ["BITS F464", "Machine Learning", 3],
      ["CS F212", "Database Systems", 4],
      ["CS F213", "Object Oriented Programming", 4],
      ["CS F301", "Principles of Programming Languages", 2],
      ["CS F303", "Computer Networks", 4],
      ["CS F314", "Software Development for Portable Devices", 3],
      ["CS F315", "Information and Communication Technologies and Development", 3],
      ["CS F415", "Data Mining", 3],
      ["IS F311", "Computer Graphics", 3],
      ["IS F341", "Software Engineering", 4],
    ],
  },
  {
    id: "data-science",
    name: "Data Science",
    coreRequirement: "3 core courses",
    totalRequirement: "5 courses (min), 15 units (min)",
    core: [
      ["BITS F464", "Machine Learning", 3],
      ["CS F320", "Foundations of Data Science", 3],
      ["MATH F432", "Applied Statistical Methods", 3],
    ],
    electives: [
      ["BITS F453", "Computational Learning Theory", 3],
      ["BITS F454", "Bio-Inspired Intelligence: Algorithms and Applications", 3],
      ["CS F317", "Reinforcement Learning", 3],
      ["CS F407", "Artificial Intelligence", 3],
      ["CS F415", "Data Mining", 3],
      ["CS F425", "Deep Learning", 3],
      ["CS F426", "Graph Mining", 4],
      ["CS F429", "Natural Language Processing", 3],
      ["CS F432", "Brain-inspired Deep Learning", 3],
      ["CS F433", "Computational Neuroscience", 3],
      ["CS F469", "Information Retrieval", 3],
      ["CS G519", "Social Media Analytics", 4],
      ["MATH F212", "Optimization", 3],
      ["MATH F353", "Statistical Inference and Applications", 3],
      ["MATH F424", "Applied Stochastic Processes", 4],
      ["MATH F471", "Nonlinear Optimization", 3],
    ],
  },
  {
    id: "english-studies",
    name: "English Studies",
    coreRequirement: "2 core courses",
    totalRequirement: "5 courses (min), 15 units (min)",
    core: [
      ["GS F241", "Creative Writing", 3],
      ["HSS F337", "English Literary Forms and Movements", 3],
    ],
    electives: [
      ["GS F221", "Business Communication", 3],
      ["GS F244", "Reporting and Writing for Media", 3],
      ["GS F245", "Effective Public Speaking", 3],
      ["HSS F222", "Linguistics", 3],
      ["HSS F227", "Cross Cultural Skills", 3],
      ["HSS F228", "Phonetics and Spoken English", 3],
      ["HSS F342", "Advanced Communicative English", 3],
      ["GS F242", "Cultural Studies", 3],
      ["GS F322", "Critical Analysis of Literature and Cinema", 3],
      ["HSS F221", "Readings from Drama", 3],
      ["HSS F226", "Postmodernism", 3],
      ["HSS F237", "Contemporary Indian English Fiction", 3],
      ["HSS F316", "Popular Literature and Culture of South Asia", 3],
      ["HSS F327", "Contemporary Drama", 3],
      ["HSS F330", "Appreciation of Art", 3],
      ["HSS F332", "Cinematic Arts", 3],
      ["HSS F335", "Literary Criticism", 3],
      ["HSS F336", "Modern Fiction", 3],
      ["HSS F338", "Comparative Indian Literature", 3],
      ["HSS F340", "Postcolonial Literatures", 3],
      ["HSS F349", "Ecocriticism", 3],
      ["HSS F373", "Shakespeare and Popular Culture", 3],
      ["HSS F399", "Introduction to American Literature", 3],
    ],
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    coreRequirement: "3 core courses",
    totalRequirement: "5 courses (min), 15 units (min)",
    core: [
      ["BITS F468", "New Venture Creation", 3],
      ["BITS F482", "Creating and Leading Entrepreneurial Organizations (or ECON F414)", 3],
      ["ECON F212", "Fundamentals of Finance and Accounting", 3],
    ],
    electives: [
      ["BITS F322", "Venture Team Development and Organization", 3],
      ["BITS F323", "Venture Finance", 3],
      ["BITS F324", "Strategy for Entrepreneurs", 3],
      ["BITS F325", "New Product and Service Design", 3],
      ["BITS F326", "Design Thinking for Innovation & Entrepreneurship", 3],
      ["BITS F427", "Digital Marketing", 3],
    ],
  },
  {
    id: "film-and-media",
    name: "Film and Media",
    coreRequirement: "3 core courses",
    totalRequirement: "6 courses (min), 18 units (min)",
    core: [
      ["GS F223", "Introduction to Mass Communication", 3],
      ["GS F244", "Reporting and Writing for Media", 3],
      ["GS F322", "Critical Analysis of Literature and Cinema", 3],
    ],
    electives: [
      ["GS F224", "Print and Audio Visual Advertising", 3],
      ["GS F242", "Cultural Studies", 3],
      ["GS F321", "Mass Media Content and Design", 3],
      ["GS F343", "Short Film and Video Production", 3],
      ["HSS F332", "Cinematic Arts", 3],
    ],
  },
  {
    id: "finance",
    name: "Finance",
    coreRequirement: "2 core courses",
    totalRequirement: "5 courses (min), 15 units (min)",
    core: [
      ["ECON F212", "Fundamentals of Finance and Accounting", 3],
      ["FIN F315", "Financial Management", 3],
    ],
    electives: [
      ["ECON F241", "Econometric Methods", 3],
      ["ECON F312", "Money Banking and Financial Markets", 3],
      ["ECON F355", "Business Analysis & Valuation", 3],
      ["ECON F411", "Project Appraisal", 3],
      ["ECON F413", "Financial Engineering", 3],
      ["FIN F242", "Introduction to Financial Mathematics", 3],
      ["FIN F243", "Functions & Working of Stock Exchanges", 3],
      ["FIN F311", "Derivatives & Risk Management", 3],
      ["FIN F312", "Fundamentals of Taxation and Audit", 3],
      ["FIN F313", "Security Analysis & Portfolio Management", 3],
      ["FIN F314", "Investment Banking & Financial Services", 3],
      ["FIN F414", "Financial Risk Analytics and Management", 3],
    ],
  },
  {
    id: "management",
    name: "Management",
    coreRequirement: "3 core courses",
    totalRequirement: "5 courses (min), 15 units (min)",
    core: [
      ["BITS F428", "Essentials of Strategic Management", 3],
      ["MGTS F211", "Principles of Management", 3],
      ["MGTS F314", "Essentials of Financial Management", 3],
    ],
    electives: [
      ["BITS F326", "Design Thinking for Innovation and Entrepreneurship", 3],
      ["ECON F415", "New Venture Creation", 3],
      ["ECON F434", "International Business", 3],
      ["ECON F435", "Marketing Research", 3],
      ["HSS F328", "Human Resources Development", 3],
      ["MF F219", "Operations Management", 3],
      ["MF F319", "Supply Chain Management", 3],
      ["ME F443", "Quality Control, Assurance and Reliability", 3],
      ["MGTS F311", "Marketing", 3],
      ["MGTS F313", "Product and Brand Management", 3],
      ["MGTS F315", "Foundations of Business Analytics", 3],
      ["MGTS F316", "Managerial and Leadership Skills", 3],
      ["MGTS F351", "Organizational Behaviour", 3],
    ],
  },
  {
    id: "materials-science-engineering",
    name: "Materials Science and Engineering",
    coreRequirement: "3 core courses",
    totalRequirement: "5 courses (min), 15 units (min)",
    core: [
      ["CHE F243", "Materials Science and Engineering (or ME F213)", 3],
      ["MST F331", "Materials Characterization", 4],
      ["MST F332", "Materials Processing", 3],
    ],
    electives: [
      ["BITS F416", "Introduction to Nanoscience", 3],
      ["CHE F433", "Corrosion Engineering", 3],
      ["CHEM F223", "Colloid and Surface Chemistry", 3],
      ["CHEM F326", "Solid State Chemistry", 3],
      ["CHEM F336", "Nanochemistry", 4],
      ["ME F452", "Composite Materials and Design", 3],
      ["MST F333", "Introduction to Biomaterials", 3],
      ["MST F334", "Materials for Catalytic Applications", 3],
      ["MST F335", "Coating and Thin Film Technology", 3],
      ["MST F336", "Glass Technology", 3],
      ["MST F337", "Materials for Energy Applications", 3],
      ["MST F338", "Metals and Alloys", 3],
      ["MST F339", "Polymer Materials", 3],
      ["PHY F379", "Thin Film Technology", 3],
      ["PHY F414", "Physics of Advanced Materials", 4],
      ["PHY F416", "Soft Condensed Matter Physics", 4],
    ],
  },
  {
    id: "pep",
    name: "Philosophy, Economics and Politics (PEP)",
    coreRequirement: "3 core courses",
    totalRequirement: "6 courses (min), 18 units (min)",
    core: [
      ["ECON F211", "Principles of Economics", 3],
      ["GS F211", "Modern Political Concepts", 3],
      ["HSS F235", "Introductory Philosophy", 3],
    ],
    electives: [
      ["BITS F385", "Introduction to Gender Studies", 3],
      ["GS F231", "Dynamics of Social Change", 3],
      ["GS F234", "Development Economics", 3],
      ["GS F243", "Current Affairs", 3],
      ["GS F312", "Applied Philosophy", 3],
      ["GS F313", "Marxian Thoughts", 3],
      ["GS F332", "Contemporary India", 3],
      ["GS F333", "Public Administration", 3],
      ["HSS F236", "Symbolic Logic", 3],
      ["HSS F315", "Society, Business, and Politics", 3],
      ["HSS F322", "Social and Political Ecology", 3],
      ["HSS F331", "Sankara's Thoughts", 3],
      ["HSS F333", "Comparative Religion", 3],
      ["HSS F343", "Professional Ethics", 3],
      ["HSS F345", "Gandhian Thoughts", 3],
      ["HSS F346", "International Relations", 3],
      ["HSS F350", "Human Rights: History, Theory and Practice", 3],
      ["HSS F353", "Philosophy of Aesthetics", 3],
      ["HSS F354", "Introduction to Islamic Economy", 3],
      ["HSS F355", "Dictatorship, Democracy & Development", 3],
      ["HSS F356", "Social Movements and Protest Politics", 3],
    ],
  },
  {
    id: "physics",
    name: "Physics",
    coreRequirement: "3 core courses",
    totalRequirement: "5 courses (min), 15 units (min)",
    core: [
      ["PHY F212", "Electromagnetic Theory – 1 (or ECE/EEE/INSTR F212)", 3],
      ["PHY F242", "Quantum Mechanics – 1", 3],
      ["PHY F312", "Statistical Mechanics", 3],
    ],
    electives: [
      ["BITS F316", "Nonlinear Dynamics and Chaos", 3],
      ["BITS F386", "Quantum Information and Computing", 3],
      ["PHY F211", "Classical Mechanics", 4],
      ["PHY F213", "Optics", 3],
      ["PHY F214", "Electricity Magnetism and Optics Lab", 2],
      ["PHY F215", "Introduction to Astronomy and Astrophysics", 3],
      ["PHY F241", "Electromagnetic Theory – 2", 4],
      ["PHY F243", "Mathematical Method of Physics", 3],
      ["PHY F244", "Modern Physics Lab", 2],
      ["PHY F311", "Quantum Mechanics – 2", 3],
      ["PHY F313", "Computational Physics", 3],
      ["PHY F315", "Theory of Relativity", 3],
      ["PHY F341", "Solid State Physics", 3],
      ["PHY F342", "Atomic and Molecular Physics", 3],
      ["PHY F343", "Nuclear and Particle Physics", 3],
      ["PHY F346", "Laser Science and Technology", 3],
      ["PHY F418", "Lasers and Applications", 4],
      ["PHY F426", "Physics of Semiconductor Devices", 4],
      ["PHY F427", "Atmospheric Physics", 3],
      ["PHY F428", "Quantum Information Theory", 3],
    ],
  },
  {
    id: "public-policy",
    name: "Public Policy",
    coreRequirement: "2 core courses",
    totalRequirement: "5 courses (min), 15 units (min)",
    core: [
      ["GS F233", "Public Policy", 3],
      ["GS F333", "Public Administration", 3],
    ],
    electives: [
      ["HSS F232", "Introduction to Development Studies", 3],
      ["HSS F317", "Introduction to Globalisation", 3],
      ["HSS F322", "Social and Political Ecology", 3],
      ["HSS F361", "Urban Policy and Governance", 3],
      ["HSS F362", "Local Governance and Participation", 3],
      ["HSS F363", "Disaster and Development", 3],
    ],
  },
  {
    id: "robotics-and-automation",
    name: "Robotics and Automation",
    coreRequirement: "3 core courses",
    totalRequirement: "5 courses (min), 15 units (min)",
    core: [
      ["BITS F441", "Robotics", 3],
      ["EEE F242", "Control Systems (or INSTR/ECE F242)", 3],
      ["BITS F327", "Artificial Intelligence for Robotics", 3],
    ],
    electives: [
      ["BITS F312", "Neural Network & Fuzzy Logic", 3],
      ["BITS F415", "Introduction to MEMS", 4],
      ["BITS F442", "Remote Sensing and Image Processing", 3],
      ["BITS F464", "Machine Learning", 3],
      ["ECE F434", "Digital Signal Processing", 4],
      ["EEE F411", "Internet of Things (IoT)", 4],
      ["EEE F422", "Modern Control Systems", 3],
      ["EEE G512", "Embedded System Design", 4],
      ["INSTR F343", "Industrial Instrumentation and Control", 3],
      ["INSTR G611", "Advanced Control Systems", 5],
      ["ME F221", "Mechanisms and Machines (or MF F221)", 3],
      ["ME F432", "Computer Aided Manufacturing", 3],
      ["MF F311", "Mechatronics & Automation", 3],
      ["MSE G511", "Mechatronics", 5],
    ],
  },
  {
    id: "supply-chain-analytics",
    name: "Supply Chain Analytics",
    coreRequirement: "3 core courses",
    totalRequirement: "5 courses (min), 15 units (min)",
    core: [
      ["BITS F455", "Analytics for Supply Chain", 3],
      ["MF F319", "Supply Chain Management", 3],
      ["MF F422", "Supply Chain Modelling and Empirical Analysis", 4],
    ],
    electives: [
      ["ME F443", "Quality Control Assurance and Reliability", 3],
      ["MF F321", "Procurement Management", 3],
      ["MF F418", "Lean Manufacturing", 3],
      ["MF F485", "Sustainable Manufacturing", 3],
      ["MATH F212", "Optimization (or ME F320 / MF F320)", 3],
      ["MATH F242", "Operations Research", 3],
      ["MATH F353", "Statistical Inference and Applications", 3],
    ],
  },
];

// Every minor uses the general 5-course/15-unit floor — no per-minor
// override, even for minors whose own program page lists a higher total.
export const minorDefinitions: MinorDefinition[] = MINOR_SPECS.map(({ id, name, coreRequirement, totalRequirement }) => ({
  id,
  name,
  coreRequirement,
  totalRequirement,
  totalMinCourses: 5,
  totalMinUnits: 15,
}));

export const minorCourseEntries: MinorCourseEntry[] = MINOR_SPECS.flatMap((spec) => [
  ...spec.core.map(([code, title, credits]) => ({
    minorId: spec.id,
    code,
    title,
    credits,
    role: "core" as const,
  })),
  ...spec.electives.map(([code, title, credits]) => ({
    minorId: spec.id,
    code,
    title,
    credits,
    role: "elective" as const,
  })),
]);
