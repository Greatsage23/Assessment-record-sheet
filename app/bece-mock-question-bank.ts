import { curriculumTopicsFor } from "./curriculum-topics";
import { computingTopicsForClass } from "./computing-question-bank";

type MockQuestion = {
  id: number; className: string; subject: string; term: "All Terms"; topic: string;
  questionType: "Objective" | "Short Answer" | "Essay" | "Theory" | "Practical";
  difficulty: "Moderate" | "Challenging"; questionText: string; options: string[];
  answer: string; marks: number; createdBy: string; createdAt: string; source: "Built-in";
};

type Seed = { topic: string; type: MockQuestion["questionType"]; text: string; options?: string[]; answer: string; marks: number };

// Original practice items modelled on the skills and paper structures in WAEC's
// BECE Guidelines, Schemes and Structure (effective 2024). No past-paper item is copied.
const seeds: Record<string, Seed[]> = {
  "English Language": [
    { topic: "Writing", type: "Essay", text: "Your district assembly plans to close the only public library because few residents use it. Write a formal letter to the District Chief Executive explaining three ways the library can be improved and why it should remain open.", answer: "Formal-letter layout; clear purpose; three developed proposals; persuasive reasons; coherent paragraphs; accurate expression.", marks: 30 },
    { topic: "Grammar", type: "Objective", text: "Neither the teachers nor the headteacher ___ aware of the altered timetable.", options: ["was", "were", "are", "have been"], answer: "was", marks: 1 },
    { topic: "Vocabulary", type: "Objective", text: "In the sentence, ‘The committee’s decision was unanimous,’ unanimous means", options: ["agreed to by everyone", "announced unexpectedly", "opposed by the majority", "postponed indefinitely"], answer: "agreed to by everyone", marks: 1 },
  ],
  Mathematics: [
    { topic: "Ratio", type: "Objective", text: "A school mixes red and white paint in the ratio 3:5. If 24 litres of red paint are used, how many litres of white paint are required?", options: ["15", "29", "40", "64"], answer: "40", marks: 1 },
    { topic: "Mensuration", type: "Essay", text: "A rectangular school garden measures 18 m by 12 m. A path 1 m wide is built inside the garden along all four sides. Calculate (a) the area of the path and (b) the cost of paving it at GH¢45 per square metre. Show all working.", answer: "Outer area=216 m²; inner dimensions=16 m by 10 m; path area=56 m²; cost=GH¢2,520.", marks: 12 },
    { topic: "Statistics", type: "Objective", text: "The scores 6, 8, 8, 9 and 14 have a mean of", options: ["8", "9", "10", "45"], answer: "9", marks: 1 },
  ],
  Science: [
    { topic: "Investigation", type: "Essay", text: "A learner claims that light is necessary for green leaves to manufacture starch. Describe an investigation to test the claim. State the control, one safety precaution, the expected observations and the conclusion.", answer: "Destarch plant; cover part of leaf; expose to light; boil leaf safely, decolourise in warm alcohol and add iodine; exposed part turns blue-black while covered part remains brown; light is necessary for starch formation.", marks: 12 },
    { topic: "Electricity", type: "Objective", text: "Two identical bulbs are connected in parallel to a cell. If one bulb is removed, the other bulb", options: ["goes off", "remains lit", "becomes an open switch", "uses no current"], answer: "remains lit", marks: 1 },
    { topic: "Environment", type: "Objective", text: "Which action best reduces eutrophication in a community reservoir?", options: ["Reducing fertiliser runoff", "Adding more detergents", "Removing trees at the bank", "Burning refuse nearby"], answer: "Reducing fertiliser runoff", marks: 1 },
  ],
  "Social Studies": [
    { topic: "Environment", type: "Essay", text: "A fast-growing community experiences flooding after every heavy rain because waterways have been built on and drains are filled with refuse. Explain three causes of the problem and propose three actions the assembly and residents should take.", answer: "Causes may include poor waste disposal, building on waterways and inadequate drains. Actions should be explained and may include enforcement, desilting, improved collection, public education and restoring waterways.", marks: 12 },
    { topic: "Governance", type: "Objective", text: "Which practice most directly promotes accountability in local government?", options: ["Publishing audited expenditure", "Holding meetings in secret", "Appointing only relatives", "Preventing public questions"], answer: "Publishing audited expenditure", marks: 1 },
    { topic: "Citizenship", type: "Objective", text: "A responsible citizen who disagrees with a public decision should first", options: ["use lawful channels to seek redress", "destroy public property", "spread an unverified rumour", "threaten public officers"], answer: "use lawful channels to seek redress", marks: 1 },
  ],
  Computing: [
    { topic: "Spreadsheet", type: "Practical", text: "A school has supplied a worksheet containing the names and continuous-assessment scores of 20 learners. Using spreadsheet software: (a) enter suitable headings and format the title; (b) use formulae to calculate each learner’s total and percentage; (c) use a function to find the class average; (d) display the names and percentages in a suitable chart; and (e) save the file with the name CLASS_RESULTS.", answer: "Award for accurate data/headings and formatting (4), correct total and percentage formulae filled down (8), correct average function (4), suitable labelled chart (5), correct filename and saving (3).", marks: 24 },
    { topic: "Cyber", type: "Theory", text: "A learner receives a message claiming to be from a mobile-money company. The message asks for a PIN through a shortened web link. (a) Identify the cyber threat. (b) State three warning signs in the message. (c) Explain three actions the learner should take to stay safe.", answer: "Phishing/social engineering (2); any three credible signs (3); three explained actions such as do not click/reply, verify via official channel, report/block, protect credentials and enable strong authentication (7).", marks: 12 },
    { topic: "Algorithm", type: "Objective", text: "Which control structure is most suitable for repeatedly accepting scores until a value of -1 is entered?", options: ["Iteration", "Sequence only", "Selection only", "Translation"], answer: "Iteration", marks: 1 },
    { topic: "Database", type: "Objective", text: "In a student database, which field is the best primary key?", options: ["Unique admission number", "First name", "Class name", "Age"], answer: "Unique admission number", marks: 1 },
  ],
  "Religious and Moral Education": [
    { topic: "Moral", type: "Essay", text: "A learner finds an envelope containing money and the owner’s identity card. Using teachings shared by the major religions in Ghana, explain four reasons the learner should return it.", answer: "Any four well-explained values: honesty, love of neighbour, justice, accountability to God, respect for property, good name and social trust.", marks: 12 },
    { topic: "Stewardship", type: "Objective", text: "Religious stewardship of the environment requires a person to", options: ["use resources responsibly", "waste water freely", "destroy young trees", "ignore pollution"], answer: "use resources responsibly", marks: 1 },
    { topic: "Peace", type: "Objective", text: "The most constructive first step when two classmates disagree is to", options: ["listen to both sides calmly", "encourage retaliation", "publish insults online", "refuse every discussion"], answer: "listen to both sides calmly", marks: 1 },
  ],
  "Creative Arts and Design": [
    { topic: "Design", type: "Essay", text: "Design a poster that encourages learners to conserve water. Describe the target audience, dominant image, slogan, colour scheme and how visual hierarchy will guide the reader.", answer: "A purposeful design brief with suitable audience, original imagery, concise slogan, harmonious/contrasting colour and clear hierarchy from headline to action.", marks: 20 },
    { topic: "Colour", type: "Objective", text: "Which pair consists of complementary colours?", options: ["Blue and orange", "Blue and green", "Red and orange", "Yellow and green"], answer: "Blue and orange", marks: 1 },
    { topic: "Performance", type: "Objective", text: "In drama, blocking refers to the", options: ["planned movement of actors on stage", "sale of performance tickets", "painting of a backdrop", "memorising of only the final line"], answer: "planned movement of actors on stage", marks: 1 },
  ],
  "Career Technology": [
    { topic: "Safety", type: "Essay", text: "A learner enters a workshop wearing loose clothing and finds an exposed electrical cable beside a wet floor. Identify four hazards and explain the correct action for each one before work begins.", answer: "Responses should identify loose clothing, exposed cable, wet floor/electricity risk and unsafe access or lack of PPE, with isolation, reporting, drying/barriers and proper clothing/PPE.", marks: 12 },
    { topic: "Nutrition", type: "Objective", text: "Which meal is the most balanced for an adolescent?", options: ["Banku, okro stew with fish and orange", "Soft drink and biscuits", "Plain boiled rice only", "Fried yam and water"], answer: "Banku, okro stew with fish and orange", marks: 1 },
    { topic: "Design", type: "Objective", text: "The main purpose of evaluating a finished product against its specification is to", options: ["determine whether it meets the stated need", "increase the cost", "avoid user feedback", "replace all measurements"], answer: "determine whether it meets the stated need", marks: 1 },
  ],
  "Ghanaian Language": [
    { topic: "Writing", type: "Essay", text: "Write a well-organised article in the selected Ghanaian language for the school magazine on three ways young people can preserve respectful language and cultural values in digital communication.", answer: "Relevant title; three developed points; appropriate register and idiom; logical organisation; accurate grammar, spelling and punctuation in the selected language.", marks: 30 },
    { topic: "Oral", type: "Objective", text: "Which activity best preserves oral tradition for future generations?", options: ["Recording an elder’s narration with permission", "Changing every proverb randomly", "Ignoring community storytellers", "Deleting all local-language recordings"], answer: "Recording an elder’s narration with permission", marks: 1 },
    { topic: "Literature", type: "Essay", text: "Select a folktale studied in class. Explain how the actions and consequences of the main character communicate one moral lesson relevant to present-day community life.", answer: "Accurate reference to a known folktale; developed character/action evidence; clear moral lesson; convincing contemporary relevance; effective Ghanaian-language expression.", marks: 12 },
  ],
  French: [
    { topic: "Writing", type: "Essay", text: "Écris un courriel à ton ami(e) francophone pour décrire ta journée scolaire et expliquer deux activités que tu préfères. (80–100 mots)", answer: "Appropriate email form; coherent description; two justified preferences; suitable tense, vocabulary, agreement and spelling.", marks: 20 },
    { topic: "Health", type: "Objective", text: "Choisis la bonne phrase pour conseiller un ami malade.", options: ["Tu devrais aller à la clinique.", "Je vais au marché hier.", "Nous mangeons une chaise.", "Il fait ses devoirs demain matin passé."], answer: "Tu devrais aller à la clinique.", marks: 1 },
    { topic: "Communication", type: "Objective", text: "Le contraire de ‘toujours’ est", options: ["jamais", "souvent", "encore", "déjà"], answer: "jamais", marks: 1 },
  ],
};

function stableId(value: string) { let hash = 23; for (const char of value) hash = (hash * 33 + char.charCodeAt(0)) | 0; return -Math.abs(hash || 1); }
function resolveTopic(subject: string, className: string, hint: string) {
  const topics = subject === "Computing" ? computingTopicsForClass(className) : curriculumTopicsFor(subject, className); const words = hint.toLowerCase().split(/\W+/).filter((word) => word.length > 3);
  return topics.find((topic) => words.some((word) => topic.toLowerCase().includes(word))) ?? topics[0] ?? hint;
}

export function buildBeceMockQuestionBank(subject: string, className: string): MockQuestion[] {
  return (seeds[subject] ?? []).map((seed, index) => ({
    id: stableId(`waec-style:${subject}:${className}:${index}:${seed.text}`), className, subject, term: "All Terms",
    topic: resolveTopic(subject, className, seed.topic), questionType: seed.type, difficulty: index ? "Moderate" : "Challenging",
    questionText: seed.text, options: seed.options ?? [], answer: seed.answer, marks: seed.marks,
    createdBy: "WAEC-aligned mock bank", createdAt: "2026-10-04", source: "Built-in",
  }));
}
