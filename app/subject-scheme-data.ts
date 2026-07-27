import { COMPUTING_SCHEMES_2026, TERM_DATES_2026, type ComputingSchemeRow } from "./computing-scheme-data";
import { CURRICULUM_TOPICS } from "./curriculum-topics";

export const BUILT_IN_SCHEME_SUBJECTS = ["Computing", ...Object.keys(CURRICULUM_TOPICS)];

const resources: Record<string, string> = {
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

function buildRows(subject: string, level: string): ComputingSchemeRow[] {
  const curriculumLevel = level as "Basic 7" | "Basic 8" | "Basic 9";
  if (subject === "Computing") return COMPUTING_SCHEMES_2026[curriculumLevel];
  const topics = CURRICULUM_TOPICS[subject]?.[curriculumLevel] ?? [];
  const seen = new Set<string>();
  const teachingRows = Array.from({ length: 13 }, (_, index) => {
    const topic = topics[Math.min(topics.length - 1, Math.floor(index * topics.length / 13))];
    const repeated = seen.has(topic); seen.add(topic);
    const holiday = index === 2 ? " Founder’s Day is observed on Monday." : index === 12 ? " Farmer’s Day is observed on Friday." : "";
    return { week: String(index + 1), date: TERM_DATES_2026[index], strand: strandFor(subject, topic), subStrand: `${topic} — ${repeated ? applicationApproach[subject] : firstApproach[subject]}${holiday}`, resources: resources[subject] };
  });
  return [...teachingRows,
    { week: "14", date: TERM_DATES_2026[13], strand: "Revision", subStrand: `Revision, integration and remediation of all ${subject} strands taught during the term.`, resources: `${resources[subject]} Revision worksheets, learner portfolios, practical tasks and previous exercises.` },
    { week: "15", date: TERM_DATES_2026[14], strand: "End-of-Term Examination", subStrand: "End-of-term assessment, feedback and correction of common errors.", resources: "Question papers, answer booklets, practical or oral assessment materials where applicable, marking scheme and learner portfolios." },
  ];
}

export function getBuiltInScheme(subject: string, level: string) {
  return buildRows(subject, level);
}
