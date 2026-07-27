import { COMPUTING_SCHEMES_2026, TERM_DATES_2026, type ComputingSchemeRow } from "./computing-scheme-data";
import { CURRICULUM_TOPICS } from "./curriculum-topics";

export const BUILT_IN_SCHEME_SUBJECTS = ["Computing", ...Object.keys(CURRICULUM_TOPICS)];

export const BUILT_IN_TERM_DETAILS = {
  "Term 1": { label: "First Term", summary: "8 September–17 December 2026", dates: TERM_DATES_2026 },
  "Term 2": { label: "Second Term", summary: "5 January–25 March 2027", dates: [
    "5–8 January 2027", "11–15 January 2027", "18–22 January 2027", "25–29 January 2027",
    "1–5 February 2027", "8–12 February 2027", "15–19 February 2027", "22–26 February 2027",
    "1–5 March 2027", "8–12 March 2027", "15–19 March 2027", "22–25 March 2027",
  ] },
  "Term 3": { label: "Third Term", summary: "20 April–22 July 2027", dates: [
    "20–23 April 2027", "26–30 April 2027", "3–7 May 2027", "10–14 May 2027",
    "17–21 May 2027", "24–28 May 2027", "31 May–4 June 2027", "7–11 June 2027",
    "14–18 June 2027", "21–25 June 2027", "28 June–2 July 2027", "5–9 July 2027",
    "12–16 July 2027", "19–22 July 2027",
  ] },
} as const;

export type BuiltInTerm = keyof typeof BUILT_IN_TERM_DETAILS;

const computingTopics: Record<"Basic 7" | "Basic 8" | "Basic 9", string[]> = {
  "Basic 7": ["Computer Networks", "Internet and Web Services", "Digital Communication", "Information Security", "Algorithms", "Introduction to Programming", "Robotics", "Artificial Intelligence", "Digital Citizenship"],
  "Basic 8": ["Network Devices and Topologies", "Online Collaboration", "Cybersecurity", "Data and Information", "Algorithms and Flowcharts", "Programming with Selection", "Programming with Iteration", "Robotics and Automation", "Artificial Intelligence Applications"],
  "Basic 9": ["Network Administration", "Web Design", "Data Protection and Cybersecurity", "Database Concepts", "Problem Solving and Algorithms", "Programming Projects", "Robotics Systems", "Machine Learning and AI", "Responsible Technology Use"],
};

const resources: Record<string, string> = {
  Computing: "Computers or laptops, projector, internet or local network where available, NaCCA-approved Computing textbook, demonstration files and practical task sheets.",
  "English Language": "NaCCA-approved English textbook, The Beacon of Light where applicable, projector, audio recordings, charts, word/sentence cards, dictionaries, library books and worksheets.",
  Mathematics: "NaCCA-approved Mathematics textbook, projector, number cards, graph sheets, mathematical instruments, counters, measuring tools, calculators and practical worksheets.",
  Science: "NaCCA-approved Science textbook, projector, charts, videos, laboratory apparatus, specimens, models, measuring instruments, locally available materials and safety equipment.",
  "Social Studies": "NaCCA-approved Social Studies textbook, projector, maps, atlas, charts, photographs, videos, newspapers, community resource persons and internet resources.",
  "Religious and Moral Education": "NaCCA-approved RME textbook, sacred texts, charts, pictures, videos, story cards, community resource persons and locally available cultural artefacts.",
  "Creative Arts and Design": "NaCCA-approved Creative Arts textbook, projector, artworks, musical instruments, drawing and painting materials, modelling tools, fabrics, audio/video recordings and performance space.",
  "Career Technology": "NaCCA-approved Career Technology textbook, projector, safety charts, food and textile materials, workshop tools, measuring instruments, drawing equipment, models and practical equipment.",
  "Ghanaian Language": "NaCCA-approved Ghanaian Language textbook, projector, alphabet/word cards, audio recordings, dictionaries, readers, cultural artefacts, folktales and worksheets.",
  French: "NaCCA-approved French textbook, projector, audio recordings, flashcards, pictures, dialogue cards, bilingual dictionaries, videos, realia and language-learning internet resources.",
};

function strandFor(subject: string, topic: string) {
  if (subject === "English Language" || subject === "Ghanaian Language") {
    if (/Oral|Listening/i.test(topic)) return "Oral Language";
    if (/Reading|Library|Media/i.test(topic)) return "Reading";
    if (/Grammar|Vocabulary|Language Structure|Translation/i.test(topic)) return "Grammar and Language Use";
    if (/Writing|Composition|Summary|Note-Making|Functional|Examination/i.test(topic)) return "Writing";
    return "Literature";
  }
  if (subject === "Mathematics") {
    if (/Number|Fraction|Decimal|Percentage|Ratio|Rate|Sets|Indices|Surds|Financial|Consumer/i.test(topic)) return "Number";
    if (/Algebra|Pattern|Relation|Equation|Inequal|Mapping|Function|Variation/i.test(topic)) return "Algebra";
    if (/Data|Statistics|Probability/i.test(topic)) return "Handling Data";
    return "Geometry and Measurement";
  }
  if (subject === "Science") {
    if (/Material|Mixture|Atom|Element|Compound|Acid|Base|Salt/i.test(topic)) return "Diversity of Matter";
    if (/Cell|Life Cycle|Reproduction|Growth|Genetic|Variation/i.test(topic)) return "Cycles";
    if (/Energy|Force|Motion|Work|Machine|Wave|Electric|Magnet|Heat|Light/i.test(topic)) return "Forces and Energy";
    if (/Body|Nutrition|Digestion|Disease|Immunity|Health/i.test(topic)) return "Humans and the Environment";
    return "Systems";
  }
  if (subject === "Social Studies") {
    if (/Environment|Map|Resource|Population|Settlement/i.test(topic)) return "Environment";
    if (/Adolescen|Family|Marriage|Identity|Culture|Social/i.test(topic)) return "Individuals, Family and Society";
    if (/Citizenship|Law|Authority|Governance|Democracy|Rights|Constitution|Integration|International/i.test(topic)) return "Governance, Politics and Stability";
    return "Socio-economic Development";
  }
  if (subject === "Religious and Moral Education") {
    if (/God|Creation|Humanity|Environment/i.test(topic)) return "God, Creation and Attributes";
    if (/Religion|Scripture|Worship|Prayer|Faith|Festival|Rite/i.test(topic)) return "Religious Practices";
    if (/Leader|Leadership|Authority|Service|Work/i.test(topic)) return "Religious Leaders and Leadership";
    return "The Family, Morality and Society";
  }
  if (subject === "Creative Arts and Design") {
    if (/Drawing|Colour|Textile|Print|Sculpture|Visual|Modelling|Pattern/i.test(topic)) return "Visual Arts";
    if (/Music/i.test(topic)) return "Music";
    if (/Dance|Movement|Choreography/i.test(topic)) return "Dance";
    if (/Drama|Theatre|Storytelling/i.test(topic)) return "Drama";
    return "Design and Creative Practice";
  }
  if (subject === "Career Technology") {
    if (/Safety|Health/i.test(topic)) return "Health and Safety";
    if (/Food|Meal|Catering|Nutrition|Hospitality/i.test(topic)) return "Food and Nutrition";
    if (/Textile|Fabric|Garment|Clothing/i.test(topic)) return "Textiles and Clothing";
    if (/Drawing|Design|Graphic|CAD/i.test(topic)) return "Designing and Making";
    if (/Enterprise|Entrepreneur|Consumer|Career/i.test(topic)) return "Entrepreneurship";
    return "Materials, Tools and Processes";
  }
  if (subject === "French") {
    if (/Grammar|Vocabulary|Written|Writing/i.test(topic)) return "Language Structures";
    if (/Culture|Francophone/i.test(topic)) return "Francophone Culture";
    return "Communication";
  }
  return "Curriculum Studies";
}

const firstApproach: Record<string, string> = {
  Computing: "Develop the concept through demonstration, guided exploration and a short individual or group practical task.",
  "English Language": "Develop listening, speaking, reading or writing competence through modelling, guided practice and a short formative task.",
  Mathematics: "Develop the concept using worked examples, manipulatives, mathematical language and guided problem solving.",
  Science: "Explore the concept through observation, prediction, investigation and accurate recording of findings.",
  "Social Studies": "Build understanding through discussion, source analysis, local examples and an enquiry activity.",
  "Religious and Moral Education": "Explore beliefs and values through stories, sacred texts, discussion, reflection and real-life application.",
  "Creative Arts and Design": "Explore the elements, tools and processes through demonstration, appreciation and studio or performance practice.",
  "Career Technology": "Introduce relevant materials, tools, safety rules and processes through demonstration and supervised practical work.",
  "Ghanaian Language": "Develop oral, reading, structural or writing competence through modelling, shared practice and culturally relevant texts.",
  French: "Develop listening and speaking first, then reinforce vocabulary and structures through dialogue, reading and short writing.",
};

const applicationApproach: Record<string, string> = {
  Computing: "Apply the skill in a practical computing task, explain the process and correct errors through guided feedback.",
  "English Language": "Apply the skill in a BECE-style comprehension, composition, language or literature task; provide feedback and remediation.",
  Mathematics: "Apply the concept to multi-step, practical and BECE-style problems; assess strategies and correct misconceptions.",
  Science: "Complete a practical investigation or application task, interpret evidence, draw conclusions and address misconceptions.",
  "Social Studies": "Apply learning to a Ghanaian community issue through case study, group presentation, project or structured response.",
  "Religious and Moral Education": "Apply the teaching to moral decision-making, community life and a structured written or oral assessment.",
  "Creative Arts and Design": "Create, perform, present and evaluate an individual or group work using agreed criteria.",
  "Career Technology": "Produce and evaluate a safe practical outcome, design or product using appropriate tools and quality criteria.",
  "Ghanaian Language": "Apply the skill in oral presentation, comprehension, creative writing, translation or literature response with feedback.",
  French: "Apply vocabulary and structures in a role-play, listening task, functional text or short presentation; assess pronunciation and accuracy.",
};

function buildRows(subject: string, level: string, term: BuiltInTerm): ComputingSchemeRow[] {
  const curriculumLevel = level as "Basic 7" | "Basic 8" | "Basic 9";
  if (subject === "Computing" && term === "Term 1") return COMPUTING_SCHEMES_2026[curriculumLevel].map((item) => item.week === "9" ? { ...item, subStrand: `${item.subStrand} Mid-term break: Thursday, 5 and Friday, 6 November; plan teaching for three days.` } : item);
  const termDetails = BUILT_IN_TERM_DETAILS[term];
  const teachingWeekCount = termDetails.dates.length - 2;
  const allTopics = subject === "Computing" ? computingTopics[curriculumLevel] : CURRICULUM_TOPICS[subject]?.[curriculumLevel] ?? [];
  const termOffset = term === "Term 1" ? 0 : term === "Term 2" ? Math.ceil(allTopics.length / 3) : Math.ceil(allTopics.length * 2 / 3);
  const topics = [...allTopics.slice(termOffset), ...allTopics.slice(0, termOffset)];
  const seen = new Set<string>();
  const teachingRows = Array.from({ length: teachingWeekCount }, (_, index) => {
    if (term === "Term 3" && curriculumLevel === "Basic 9" && (index === 2 || index === 3)) {
      return { week: String(index + 1), date: termDetails.dates[index], strand: "Basic Education Certificate Examination", subStrand: index === 2 ? "BECE begins on Wednesday, 5 May 2027. Candidate preparation and scheduled examination papers." : "BECE continues and ends on Wednesday, 12 May 2027. Complete scheduled papers and candidate clearance.", resources: "WAEC/GES examination timetable, candidate index cards, approved examination materials and school examination arrangements." };
    }
    const topic = topics[Math.min(topics.length - 1, Math.floor(index * topics.length / teachingWeekCount))];
    const repeated = seen.has(topic); seen.add(topic);
    const firstTermNote = term === "Term 1" && index === 2 ? " Public holiday is observed on Monday." : term === "Term 1" && index === 8 ? " Mid-term break: Thursday, 5 and Friday, 6 November; plan teaching for three days." : term === "Term 1" && index === 12 ? " Public holiday is observed on Friday." : "";
    const laterTermNote = term !== "Term 1" && index === Math.floor(teachingWeekCount / 2) ? " Allow for the two-day mid-term break when GES confirms the term-specific dates." : "";
    const approach = repeated ? applicationApproach[subject] : firstApproach[subject];
    return { week: String(index + 1), date: termDetails.dates[index], strand: strandFor(subject, topic), subStrand: `${topic} — ${approach}${firstTermNote}${laterTermNote}`, resources: resources[subject] };
  });
  const revisionIndex = termDetails.dates.length - 2;
  const examIndex = termDetails.dates.length - 1;
  return [...teachingRows,
    { week: String(revisionIndex + 1), date: termDetails.dates[revisionIndex], strand: "Revision", subStrand: `Revision, integration and remediation of all ${subject} strands taught during the term.`, resources: `${resources[subject]} Revision worksheets, learner portfolios, practical tasks and previous exercises.` },
    { week: String(examIndex + 1), date: termDetails.dates[examIndex], strand: "End-of-Term Examination", subStrand: "End-of-term assessment, feedback and correction of common errors.", resources: "Question papers, answer booklets, practical or oral assessment materials where applicable, marking scheme and learner portfolios." },
  ];
}

export function getBuiltInScheme(subject: string, level: string, term: BuiltInTerm = "Term 1") {
  return buildRows(subject, level, term);
}
