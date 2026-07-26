export type BuiltInQuestion = {
  id: number;
  className: string;
  subject: "Computing";
  term: "All Terms";
  topic: string;
  questionType: "Objective" | "Theory" | "Practical";
  difficulty: "Easy" | "Moderate" | "Challenging";
  questionText: string;
  options: string[];
  answer: string;
  marks: number;
  createdBy: string;
  createdAt: string;
  source: "Built-in";
};

type Concept = { term: string; meaning: string; use: string };
type TopicPack = { topic: string; resource: string; product: string; concepts: Concept[] };

const packs: TopicPack[] = [
  { topic: "Components of Computers and Computer Systems", resource: "computer system, component charts and system utilities", product: "a labelled computer-system diagram and maintenance report", concepts: [
    { term: "processor", meaning: "the component that interprets and executes instructions", use: "process instructions and coordinate computer operations" }, { term: "RAM", meaning: "temporary working memory used while programs are running", use: "hold active programs and data for quick access" }, { term: "storage device", meaning: "hardware that keeps data for future use", use: "save files even after power is switched off" }, { term: "input device", meaning: "hardware used to enter data and instructions", use: "capture text, images, sound or commands" }, { term: "output device", meaning: "hardware that presents processed information", use: "display, print or play the result of processing" }, { term: "motherboard", meaning: "the main circuit board connecting computer components", use: "allow internal components to communicate" }, { term: "operating system", meaning: "system software that manages hardware and applications", use: "provide an interface and manage computer resources" }, { term: "file management", meaning: "organising, naming, storing and retrieving digital files", use: "keep school documents easy to locate and protect" },
  ] },
  { topic: "Technology in the Community", resource: "internet-enabled device, community case studies and presentation software", product: "a community technology-impact presentation", concepts: [
    { term: "educational technology", meaning: "digital tools used to support teaching and learning", use: "deliver interactive lessons and access learning resources" }, { term: "health technology", meaning: "digital systems used to support healthcare", use: "manage patient records and assist diagnosis" }, { term: "financial technology", meaning: "technology used to provide financial services", use: "make secure digital payments and transfers" }, { term: "agricultural technology", meaning: "digital tools that improve farming decisions and production", use: "monitor weather, soil and market information" }, { term: "e-commerce", meaning: "buying and selling goods or services through electronic networks", use: "reach customers and process online orders" }, { term: "communication technology", meaning: "tools that transmit information between people", use: "support calls, messages and online meetings" }, { term: "assistive technology", meaning: "tools that improve access for persons with disabilities", use: "provide screen reading, magnification or alternative input" }, { term: "e-waste management", meaning: "safe handling, reuse and disposal of electronic waste", use: "reduce environmental and health harm from discarded devices" },
  ] },
  { topic: "Health and Safety in the Use of ICT Tools", resource: "computer workstation, safety checklist and camera", product: "a workstation risk-assessment checklist", concepts: [
    { term: "ergonomics", meaning: "designing a workspace to suit the user safely and comfortably", use: "reduce strain during prolonged computer use" }, { term: "correct posture", meaning: "sitting with supported back, relaxed shoulders and level screen", use: "prevent back, neck and wrist pain" }, { term: "screen break", meaning: "a regular pause that rests the eyes and body", use: "reduce fatigue and eye strain" }, { term: "cable management", meaning: "arranging and securing cables safely", use: "prevent trips and damaged connections" }, { term: "ventilation", meaning: "allowing air to circulate around equipment", use: "prevent devices from overheating" }, { term: "electrical safety", meaning: "safe use of sockets, plugs and powered equipment", use: "prevent electric shock, fire and equipment damage" }, { term: "equipment hygiene", meaning: "cleaning shared ICT tools with suitable methods", use: "reduce dirt, germs and component damage" }, { term: "risk assessment", meaning: "identifying hazards and deciding how to control them", use: "make a computer laboratory safer before work begins" },
  ] },
  { topic: "Introduction to Word Processing", resource: "computer and word-processing software", product: "a professionally formatted school document", concepts: [
    { term: "editing", meaning: "changing the content of a document", use: "insert, delete, move or correct text" }, { term: "formatting", meaning: "changing the appearance and arrangement of document content", use: "make headings and paragraphs clear and consistent" }, { term: "table", meaning: "information arranged in rows and columns", use: "present timetables, marks or structured data" }, { term: "hyperlink", meaning: "a clickable connection to another location or resource", use: "link a document to a webpage or another section" }, { term: "header and footer", meaning: "repeated information at the top or bottom of pages", use: "show titles, dates and page numbers consistently" }, { term: "find and replace", meaning: "a tool for locating text and changing repeated occurrences", use: "correct a repeated word efficiently" }, { term: "page layout", meaning: "settings controlling margins, orientation, size and columns", use: "prepare a document for appropriate printing" }, { term: "file format", meaning: "the structure used to store a document", use: "save an editable copy or export a shareable version" },
  ] },
  { topic: "Introduction to Presentation", resource: "computer, projector and presentation software", product: "a five-slide classroom presentation", concepts: [
    { term: "slide layout", meaning: "a predefined arrangement of placeholders on a slide", use: "organise titles, text and media consistently" }, { term: "theme", meaning: "a coordinated set of colours, fonts and effects", use: "give a presentation a consistent appearance" }, { term: "transition", meaning: "the visual effect used when moving between slides", use: "control how one slide changes to the next" }, { term: "animation", meaning: "an effect applied to an object on a slide", use: "control how text or images enter, move or leave" }, { term: "multimedia", meaning: "a combination of text, sound, images, animation or video", use: "explain ideas using suitable media" }, { term: "speaker notes", meaning: "private supporting notes attached to a slide", use: "guide the presenter without crowding the slide" }, { term: "slide show", meaning: "the full-screen delivery mode of a presentation", use: "present slides to an audience" }, { term: "visual hierarchy", meaning: "arranging elements to show their order of importance", use: "help an audience notice key information first" },
  ] },
  { topic: "Introduction to Desktop Publishing", resource: "computer and desktop-publishing software", product: "a school poster, brochure or newsletter", concepts: [
    { term: "publication", meaning: "a document designed for distribution to an audience", use: "communicate school information through print or digital media" }, { term: "template", meaning: "a predesigned starting layout for a publication", use: "create a consistent design efficiently" }, { term: "master page", meaning: "a page controlling repeated layout elements", use: "apply common headers, guides or backgrounds" }, { term: "text box", meaning: "a movable container used to position text", use: "place text precisely within a page design" }, { term: "image frame", meaning: "a container that positions and crops a picture", use: "control the placement of images" }, { term: "margin and guide", meaning: "non-printing boundaries used to align page elements", use: "keep content balanced and inside safe areas" }, { term: "alignment", meaning: "positioning objects in relation to each other", use: "create an orderly professional layout" }, { term: "preflight check", meaning: "reviewing a publication for layout, font and image problems", use: "identify errors before printing or exporting" },
  ] },
  { topic: "Introduction to Electronic Spreadsheet", resource: "computer and spreadsheet software", product: "a calculated worksheet with a chart", concepts: [
    { term: "cell", meaning: "the intersection of a row and column", use: "enter a single data value or formula" }, { term: "formula", meaning: "an expression that calculates a result and begins with an equals sign", use: "calculate totals, percentages or other results" }, { term: "function", meaning: "a predefined formula that performs a named calculation", use: "calculate SUM, AVERAGE, COUNT, MAX or MIN" }, { term: "cell reference", meaning: "the column letter and row number identifying a cell", use: "refer to worksheet values in calculations" }, { term: "relative reference", meaning: "a reference that changes when a formula is copied", use: "repeat a calculation across rows or columns" }, { term: "chart", meaning: "a graphical representation of worksheet data", use: "compare values and identify patterns visually" }, { term: "sorting", meaning: "arranging data according to a chosen order", use: "organise names, scores or dates" }, { term: "data validation", meaning: "rules that control what users may enter in cells", use: "reduce invalid entries in a worksheet" },
  ] },
  { topic: "Computer Networks", resource: "network diagram tool, computers and networking devices", product: "a labelled school network design", concepts: [
    { term: "LAN", meaning: "a network covering a limited area such as a school laboratory", use: "share local files, printers and internet access" }, { term: "WAN", meaning: "a network connecting devices across large geographical areas", use: "link branches in different towns or countries" }, { term: "network topology", meaning: "the physical or logical arrangement of network devices", use: "plan how devices and links are organised" }, { term: "switch", meaning: "a device that forwards data to the correct device within a local network", use: "connect computers efficiently on a LAN" }, { term: "router", meaning: "a device that directs data between different networks", use: "connect a school network to the internet" }, { term: "IP address", meaning: "a numerical identifier assigned to a device on a network", use: "identify the source and destination of network data" }, { term: "protocol", meaning: "an agreed set of rules for data communication", use: "allow devices to exchange data correctly" }, { term: "transmission medium", meaning: "the wired or wireless path through which data travels", use: "carry signals between network devices" },
  ] },
  { topic: "Internet and Social Media", resource: "internet-enabled device, email and approved social platform", product: "a digital-citizenship communication campaign", concepts: [
    { term: "email", meaning: "electronic messages sent through internet mail systems", use: "send formal messages and attachments" }, { term: "social network", meaning: "an online service where users connect and share content", use: "communicate and collaborate with a community" }, { term: "netiquette", meaning: "accepted rules for respectful online behaviour", use: "communicate responsibly in digital spaces" }, { term: "privacy setting", meaning: "a control that limits access to personal information", use: "manage who can view an account or post" }, { term: "digital footprint", meaning: "the record of a person's activities on digital services", use: "evaluate the lasting effect of online actions" }, { term: "cyberbullying", meaning: "using digital communication to intimidate or harm another person", use: "recognise, report and prevent online abuse" }, { term: "phishing", meaning: "a deceptive attempt to obtain sensitive information", use: "identify suspicious messages and links" }, { term: "online collaboration", meaning: "people working together through connected digital tools", use: "create and review shared school work" },
  ] },
  { topic: "Information Security", resource: "computer, security checklist and sample digital records", product: "an information-security plan for a school laboratory", concepts: [
    { term: "confidentiality", meaning: "ensuring information is available only to authorised people", use: "protect private learner records" }, { term: "integrity", meaning: "maintaining the accuracy and completeness of information", use: "prevent unauthorised changes to scores" }, { term: "availability", meaning: "ensuring authorised users can access information when needed", use: "keep systems and backups ready for school work" }, { term: "authentication", meaning: "verifying the identity of a user", use: "confirm who is attempting to sign in" }, { term: "authorisation", meaning: "granting an authenticated user approved permissions", use: "limit what each user may view or change" }, { term: "encryption", meaning: "converting readable data into protected coded form", use: "protect information during storage or transmission" }, { term: "firewall", meaning: "a security control that filters network traffic", use: "block unauthorised network connections" }, { term: "backup", meaning: "a separate copy used to restore lost or damaged data", use: "recover school files after failure or attack" },
  ] },
  { topic: "Web Technologies", resource: "internet-enabled computer, browser and simple web-authoring tool", product: "an evaluated webpage or school-club blog", concepts: [
    { term: "web browser", meaning: "software used to access and display web resources", use: "open, navigate and interact with webpages" }, { term: "search engine", meaning: "an online service that indexes and finds web information", use: "locate relevant digital resources" }, { term: "URL", meaning: "the address identifying a resource on the web", use: "navigate directly to a webpage or file" }, { term: "hyperlink", meaning: "a clickable connection between web resources", use: "move to related pages or sections" }, { term: "website", meaning: "a collection of related webpages under a domain", use: "publish organised information for an audience" }, { term: "blog", meaning: "a regularly updated website containing posts", use: "publish school or club news and invite comments" }, { term: "search operator", meaning: "a word or symbol that refines a web search", use: "find more accurate results using quotes, AND, OR or minus" }, { term: "web evaluation", meaning: "checking online information for accuracy, authority, currency and purpose", use: "decide whether a webpage is trustworthy" },
  ] },
  { topic: "Introduction to Programming", resource: "computer and age-appropriate programming environment", product: "a tested program with documented output", concepts: [
    { term: "variable", meaning: "a named storage location whose value may change", use: "store values used during program execution" }, { term: "constant", meaning: "a named value that should not change during execution", use: "represent a fixed value clearly" }, { term: "data type", meaning: "a classification describing the kind of value stored", use: "distinguish numbers, text and logical values" }, { term: "operator", meaning: "a symbol or word that performs an operation", use: "calculate, compare or combine program values" }, { term: "input", meaning: "data supplied to a program for processing", use: "receive a user's name, score or choice" }, { term: "output", meaning: "information produced by a program", use: "display a message or calculated result" }, { term: "IDE", meaning: "software combining tools for writing, running and debugging code", use: "develop and test a program in one environment" }, { term: "debugging", meaning: "finding and correcting errors in a program", use: "make a program produce the intended result" },
  ] },
  { topic: "Algorithm", resource: "flowchart symbols, paper and a programming environment", product: "a flowchart, pseudocode and traced solution", concepts: [
    { term: "sequence", meaning: "instructions executed in a stated order", use: "describe steps that occur one after another" }, { term: "selection", meaning: "choosing an action according to a condition", use: "make a decision such as pass or needs support" }, { term: "iteration", meaning: "repeating instructions while or until a condition is met", use: "process several learners or repeat a task" }, { term: "flowchart", meaning: "a diagram using standard symbols to show an algorithm", use: "visualise the flow of a solution" }, { term: "pseudocode", meaning: "a structured language-independent description of an algorithm", use: "plan program logic before coding" }, { term: "linear search", meaning: "checking items one by one until a target is found", use: "locate a name or value in a list" }, { term: "decomposition", meaning: "breaking a complex problem into manageable parts", use: "plan and solve each part separately" }, { term: "trace table", meaning: "a table recording variable values as an algorithm runs", use: "test logic and locate errors" },
  ] },
  { topic: "Robotics", resource: "robotics kit or paper simulation, sensors and programming environment", product: "a programmed or simulated robot solution", concepts: [
    { term: "robot", meaning: "a programmable machine that senses or acts in its environment", use: "perform a physical task automatically" }, { term: "sensor", meaning: "a component that detects a condition in the environment", use: "measure light, distance, touch or temperature" }, { term: "controller", meaning: "the processing unit that runs a robot's instructions", use: "make decisions from sensor input" }, { term: "actuator", meaning: "a component that creates physical movement or action", use: "turn a wheel, arm, light or buzzer" }, { term: "robot program", meaning: "instructions controlling how a robot behaves", use: "connect sensed conditions to actions" }, { term: "feedback", meaning: "information about the result of a robot's action", use: "adjust behaviour to reach a target" }, { term: "automation", meaning: "using technology to perform tasks with reduced human intervention", use: "repeat accurate or hazardous work" }, { term: "robot safety", meaning: "rules that reduce risks when building or operating robots", use: "protect users, equipment and surroundings" },
  ] },
  { topic: "Artificial Intelligence", resource: "internet-enabled computer and a safe AI or machine-learning demonstration", product: "an AI-system analysis or simple trained classification model", concepts: [
    { term: "artificial intelligence", meaning: "the field of creating systems that perform tasks associated with human intelligence", use: "recognise patterns, make predictions or support decisions" }, { term: "machine learning", meaning: "a method in which a system learns patterns from data", use: "classify examples or predict outcomes" }, { term: "training data", meaning: "examples used to teach a machine-learning model", use: "provide patterns from which a model learns" }, { term: "model", meaning: "the learned representation used to produce predictions", use: "apply learned patterns to new input" }, { term: "inference", meaning: "using a trained model to produce an output for new data", use: "classify or predict an unseen example" }, { term: "expert system", meaning: "a knowledge-based system that applies rules to give advice", use: "support decisions in a specialised domain" }, { term: "neural network", meaning: "a computing model of connected units that learns complex patterns", use: "recognise images, speech or other patterns" }, { term: "AI bias", meaning: "an unfair pattern in AI results caused by data or design choices", use: "evaluate whether an AI system treats groups fairly" },
  ] },
];

const levelTopics: Record<string, string[]> = {
  "Basic 7": packs.filter((pack) => pack.topic !== "Introduction to Desktop Publishing").map((pack) => pack.topic),
  "Basic 8": packs.map((pack) => pack.topic),
  "Basic 9": packs.map((pack) => pack.topic),
};

function levelFromClass(className: string) {
  return className.startsWith("Basic 7") ? "Basic 7" : className.startsWith("Basic 9") ? "Basic 9" : "Basic 8";
}

export function computingTopicsForClass(className: string) {
  return levelTopics[levelFromClass(className)];
}

function stableId(value: string) {
  let hash = 7;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return -Math.abs(hash || 1);
}

function rotateOptions(correct: string, distractors: string[], questionNumber: number) {
  const options = distractors.slice(0, 3);
  const position = (questionNumber * 3) % 4;
  options.splice(position, 0, correct);
  return { options, position, label: "ABCD"[position] };
}

function difficulty(index: number): BuiltInQuestion["difficulty"] {
  return index < 15 ? "Easy" : index < 40 ? "Moderate" : "Challenging";
}

function objectiveQuestions(className: string, pack: TopicPack): BuiltInQuestion[] {
  const level = levelFromClass(className);
  return Array.from({ length: 50 }, (_, index) => {
    const concept = pack.concepts[index % pack.concepts.length];
    const other = pack.concepts.filter((item) => item.term !== concept.term);
    const number = index + 1;
    let questionText: string;
    let correct: string;
    let distractors: string[];
    if (index < 15) {
      questionText = `Which statement best describes ${concept.term} in ${pack.topic.toLowerCase()}?`;
      correct = concept.meaning;
      distractors = other.slice(index % other.length).concat(other).slice(0, 3).map((item) => item.meaning);
    } else if (index < 30) {
      questionText = `A ${level} learner needs to ${concept.use}. Which option is most appropriate?`;
      correct = concept.term;
      distractors = other.slice(index % other.length).concat(other).slice(0, 3).map((item) => item.term);
    } else if (index < 40) {
      questionText = `A school team is analysing how to ${concept.use}. Which concept should be central to its solution?`;
      correct = concept.term;
      distractors = other.slice((index + 2) % other.length).concat(other).slice(0, 3).map((item) => item.term);
    } else if (index < 45) {
      questionText = `Which action would be the most effective and responsible way to ${concept.use}?`;
      correct = `Apply ${concept.term} because it involves ${concept.meaning}`;
      distractors = other.slice(index % other.length).concat(other).slice(0, 3).map((item) => `Apply ${item.term} because it involves ${item.meaning}`);
    } else {
      questionText = `During a practical lesson, Adwoa must ${concept.use}. What should she use first?`;
      correct = concept.term;
      distractors = other.slice((index + 1) % other.length).concat(other).slice(0, 3).map((item) => item.term);
    }
    const choice = rotateOptions(correct, distractors, number);
    return { id: stableId(`${className}-${pack.topic}-objective-${number}`), className, subject: "Computing", term: "All Terms", topic: pack.topic, questionType: "Objective", difficulty: difficulty(index), questionText, options: choice.options, answer: `${choice.label}. ${correct}. ${concept.term} is ${concept.meaning} and is used to ${concept.use}.`, marks: 1, createdBy: "Built-in NaCCA Computing bank", createdAt: "", source: "Built-in" };
  });
}

function theoryQuestions(className: string, pack: TopicPack): BuiltInQuestion[] {
  return Array.from({ length: 10 }, (_, index) => {
    const concept = pack.concepts[index % pack.concepts.length];
    const related = pack.concepts[(index + 1) % pack.concepts.length];
    const number = index + 1;
    const questionText = `(a) Explain the term “${concept.term}”. [3 marks]\n(b) State two ways ${concept.term} is useful in ${pack.topic.toLowerCase()}. [4 marks]\n(c) A learner needs to ${concept.use}. Describe how the learner should apply ${concept.term} and give one reason it is more suitable than ${related.term}. [5 marks]`;
    const answer = `(a) ${concept.meaning}. Award 3 marks for a complete explanation.\n(b) Award 2 marks each for two valid uses, including: ${concept.use}; and another relevant curriculum-based use. Total: 4 marks.\n(c) Correct application of ${concept.term}: 2 marks; clear procedure or example: 2 marks; valid comparison with ${related.term}: 1 mark. Total: 5 marks.\nQuestion total: 12 marks.`;
    return { id: stableId(`${className}-${pack.topic}-theory-${number}`), className, subject: "Computing", term: "All Terms", topic: pack.topic, questionType: "Theory", difficulty: index < 3 ? "Easy" : index < 7 ? "Moderate" : "Challenging", questionText, options: [], answer, marks: 12, createdBy: "Built-in NaCCA Computing bank", createdAt: "", source: "Built-in" };
  });
}

function practicalQuestions(className: string, pack: TopicPack): BuiltInQuestion[] {
  return Array.from({ length: 5 }, (_, index) => {
    const concept = pack.concepts[(index * 2) % pack.concepts.length];
    const number = index + 1;
    const questionText = `TASK SCENARIO\nYour teacher asks you to demonstrate ${concept.term} in a school activity that will ${concept.use}.\n\nRESOURCES\n${pack.resource}.\n\nINSTRUCTIONS\n1. Plan the task and identify the required data or materials.\n2. Apply ${concept.term} correctly.\n3. Test or inspect the work and correct any errors.\n4. Produce ${pack.product}.\n5. Save the work as “${levelFromClass(className).replace(" ", "")}_${number}_${concept.term.replaceAll(" ", "_")}" in the class folder.\n\nEXPECTED OUTPUT\n${pack.product} showing correct use of ${concept.term}.\n\nTIME ALLOWED\n45 minutes.\n\nLIMITED-COMPUTER ALTERNATIVE\nDraw or write a labelled paper simulation showing every step and the expected screen or physical output.`;
    const answer = `PRACTICAL ASSESSMENT RUBRIC — 24 MARKS\nAccuracy and correct application of ${concept.term}: 8 marks.\nLogical procedure and completion of required steps: 5 marks.\nFunctional or technically valid output: 5 marks.\nPresentation, clarity and appropriate design: 3 marks.\nCorrect filename, location and file management: 3 marks.\nAccept an equivalent paper simulation where computer access is limited.`;
    return { id: stableId(`${className}-${pack.topic}-practical-${number}`), className, subject: "Computing", term: "All Terms", topic: pack.topic, questionType: "Practical", difficulty: index < 2 ? "Moderate" : "Challenging", questionText, options: [], answer, marks: 24, createdBy: "Built-in NaCCA Computing bank", createdAt: "", source: "Built-in" };
  });
}

export function buildComputingQuestionBank(className: string): BuiltInQuestion[] {
  const allowed = new Set(computingTopicsForClass(className));
  return packs.filter((pack) => allowed.has(pack.topic)).flatMap((pack) => [
    ...objectiveQuestions(className, pack),
    ...theoryQuestions(className, pack),
    ...practicalQuestions(className, pack),
  ]);
}
