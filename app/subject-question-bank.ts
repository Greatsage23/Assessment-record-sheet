import { curriculumTopicsFor } from "./curriculum-topics";

export type CurriculumQuestion = {
  id: number; className: string; subject: string; term: "All Terms"; topic: string;
  questionType: "Objective" | "Short Answer" | "Essay"; difficulty: "Easy" | "Moderate" | "Challenging";
  questionText: string; options: string[]; answer: string; marks: number;
  createdBy: string; createdAt: string; source: "Built-in";
};

const stems = [
  "Which learning activity most directly demonstrates understanding of {topic}?",
  "Which task should a teacher use to assess learners on {topic}?",
  "A learner is revising {topic}. Which approach is most appropriate?",
  "Which classroom outcome is most closely connected to {topic}?",
  "Which action shows that a learner can apply knowledge of {topic}?",
  "Which project would provide the best evidence of learning in {topic}?",
  "Which statement describes an effective way to study {topic}?",
  "Which assessment instruction is most relevant to {topic}?",
  "Which response best shows critical thinking about {topic}?",
  "Which learning product is best suited to the topic {topic}?",
];

const actions = ["explain its key ideas and apply them to a relevant example", "identify its main features and justify their importance", "compare its important ideas using suitable evidence", "solve a related problem and explain each decision", "analyse a realistic situation using its principles", "create an accurate example and evaluate the result", "interpret relevant information and draw a supported conclusion", "demonstrate the required skill and explain the procedure"];

const passageThemes = [
  { title: "The Library That Changed Kumbungu", body: "For years, many children in Kumbungu completed their homework without reference books. When an unused storeroom was converted into a community library, residents donated books and local artisans repaired tables. At first, attendance was low because some learners thought the library was meant only for brilliant pupils. A volunteer librarian, Mariama, began weekly reading circles and invited parents to observe. Soon, learners who had been afraid to read aloud gained confidence. Examination results improved, but the greatest change was the new habit of asking questions. The library also became a meeting place where farmers listened to talks on soil conservation and traders learnt basic record keeping. The project succeeded because the community treated learning as a shared responsibility, not a service to be provided by outsiders.", main: "A community library improved learning and community development through shared effort.", details: ["Residents donated books and artisans repaired tables.", "Reading circles built confidence and examination results improved."], inference: "Community participation can make a development project sustainable.", word: "converted", meaning: "changed from one use or form into another", reference: "the project" },
  { title: "A Market Without Plastic", body: "After every heavy rain, plastic bags blocked the drains around Zogbeli Market and dirty water entered nearby shops. Complaints produced little change until a group of pupils investigated the problem. They counted the bags collected from three gutters and interviewed traders. Their report persuaded the market committee to introduce reusable baskets and clearly labelled waste bins. Some traders resisted because plastic bags were cheap and convenient. The pupils therefore demonstrated how customers could carry cloth bags and how organic waste could be turned into compost. Within two months, the drains flowed freely and the market looked cleaner. The exercise taught the pupils that evidence, patience and practical alternatives are more persuasive than angry accusations.", main: "Pupils used evidence and practical alternatives to reduce plastic waste at a market.", details: ["They counted plastic bags and interviewed traders.", "The committee introduced reusable baskets and labelled bins."], inference: "People accept change more readily when workable alternatives are provided.", word: "resisted", meaning: "opposed or refused to accept", reference: "the exercise" },
  { title: "The Honest Goalkeeper", body: "During an inter-school football final, the referee awarded a goal after the ball struck the outside of the net. Most spectators believed it had entered the goal, and the scoring team began to celebrate. Abdulai, the goalkeeper, knew the truth. Although his team would benefit from silence, he calmly informed the referee that the ball had not crossed the line. His teammates were disappointed, but play resumed. Later, Abdulai saved a penalty and his team won fairly. At assembly the following week, the headteacher praised him, explaining that victory without integrity damages both the winner and the game. Abdulai's decision showed that character is most clearly revealed when dishonesty offers an immediate advantage.", main: "Integrity is more valuable than an unfair advantage.", details: ["Abdulai told the referee that the ball had not crossed the line.", "He later saved a penalty and his team won fairly."], inference: "Abdulai valued honesty above personal gain.", word: "integrity", meaning: "the quality of being honest and morally upright", reference: "his decision" },
  { title: "When the Rains Failed", body: "The first rains arrived late, and the young maize plants in Nyankpala began to wither. In previous years, farmers had waited helplessly for better weather. This time, an agricultural officer encouraged them to collect water from roofs and dig shallow channels that reduced runoff. A women's group planted vegetables that required less water, while the youth repaired an abandoned reservoir. Not every idea worked immediately; one channel collapsed and had to be rebuilt with stones. By the end of the season, harvests were smaller than usual but no family lost its entire crop. The experience showed that climate challenges cannot always be prevented, yet careful planning and cooperation can reduce their effects.", main: "Planning and cooperation helped farmers reduce the effects of failed rains.", details: ["Farmers collected roof water and reduced runoff.", "The youth repaired an abandoned reservoir."], inference: "Adaptation can protect livelihoods even when weather cannot be controlled.", word: "withering", meaning: "drying up and becoming weak", reference: "the experience" },
  { title: "The Rumour on the Phone", body: "A message shared in a class group claimed that the school would close because of a dangerous disease. Without checking the source, several learners forwarded it to relatives. By evening, worried parents were calling teachers. Efua noticed that the message contained no date, official logo or named authority. She checked the school's verified page and asked the assistant headteacher, who confirmed that the claim was false. Efua posted the correction and explained the warning signs she had observed. The incident ended quickly, but it revealed how easily fear can travel through digital networks. Responsible users pause, verify evidence and consider the possible harm before sharing information.", main: "Digital information should be verified before it is shared.", details: ["The message had no date, logo or named authority.", "Efua checked the verified school page and asked the assistant headteacher."], inference: "Efua demonstrated responsible digital citizenship.", word: "verified", meaning: "checked and confirmed as true or accurate", reference: "the incident" },
  { title: "A Second Chance for Fuseini", body: "Fuseini often arrived late because he helped his mother arrange vegetables before school. His teachers initially assumed that he was careless. When his class teacher visited the family, she understood the difficulty and worked with them on a new routine. Fuseini prepared the baskets in the evening, while an older cousin handled the early customers. The teacher also gave him a timetable for completing missed exercises. Within a month, his punctuality and confidence improved. The experience reminded the class that discipline is important, but fair judgement requires an understanding of circumstances. Support does not remove responsibility; it helps a person meet it.", main: "Understanding circumstances and offering support can improve responsible behaviour.", details: ["The teacher visited Fuseini's family.", "The family changed its routine and Fuseini received a study timetable."], inference: "The teacher corrected her first judgement after gathering evidence.", word: "circumstances", meaning: "conditions or facts affecting a situation", reference: "the experience" },
  { title: "The Shea Cooperative", body: "Women in a small community produced excellent shea butter but earned little because each person sold separately. A cooperative officer suggested that they combine their products, agree on quality standards and keep accurate records. The members elected leaders and contributed small amounts for improved packaging. Disagreements arose over prices, yet regular meetings allowed every member to speak. Their labelled products eventually attracted buyers from Tamale, and profits increased. More importantly, members learnt to plan, save and solve problems together. Cooperation did not eliminate every difficulty, but it gave individuals greater bargaining power than they had possessed alone.", main: "Cooperation and good organisation improved the women's shea business.", details: ["Members agreed on quality standards and kept records.", "Improved packaging attracted buyers and increased profits."], inference: "Organised groups can negotiate more effectively than isolated individuals.", word: "bargaining", meaning: "negotiating the terms or price of an agreement", reference: "their labelled products" },
  { title: "The Nurse's Quiet Lesson", body: "At the clinic, a boy laughed when an elderly man struggled to explain his symptoms. The nurse did not scold the boy immediately. Instead, she asked him to imagine speaking in pain while others hurried him. She then listened patiently to the man, repeated his words to confirm her understanding and helped him to a seat. The boy became silent and later apologised. The nurse explained that respect is not merely polite language; it is the willingness to recognise another person's dignity, especially when that person is vulnerable. Her calm example taught more effectively than an angry lecture would have done.", main: "Respect and empathy are best demonstrated through patient, dignified treatment of others.", details: ["The nurse listened patiently and confirmed the man's words.", "The boy reflected on the man's difficulty and apologised."], inference: "The nurse preferred teaching by example to public punishment.", word: "vulnerable", meaning: "easily harmed or in need of special care", reference: "her calm example" },
  { title: "Saving the School Garden", body: "Goats repeatedly entered the school garden and destroyed young seedlings. The agriculture club first blamed nearby households, but accusations only created tension. The club mapped the damaged areas and discovered gaps beneath the old fence. Members collected discarded wood, repaired the gaps and asked animal owners to attend a meeting. Together they agreed on safer grazing routes. The club also planted strong local species along the fence. Months later, the garden supplied vegetables for practical lessons. By replacing blame with investigation and dialogue, the learners solved the immediate problem and improved relations with their neighbours.", main: "Investigation and dialogue solved the school garden problem better than blame.", details: ["The club mapped damage and found gaps beneath the fence.", "Members repaired the fence and agreed on safer grazing routes."], inference: "Evidence-based cooperation can prevent unnecessary conflict.", word: "tension", meaning: "uneasy or unfriendly relations", reference: "the immediate problem" },
  { title: "The Apprentice's Measurement", body: "On his first week at a carpentry workshop, Salifu was eager to impress. He measured a tabletop quickly and began cutting before his master checked the figures. The board became too short and could not be used. Salifu expected punishment, but the carpenter asked him to calculate the cost of the wasted wood and explain the error. He then taught him to measure twice, mark clearly and confirm units before cutting. Salifu repeated the task carefully and produced an accurate tabletop. He learnt that speed is useful only when it is supported by precision, patience and responsibility for materials.", main: "Careful measurement and responsibility are essential to quality work.", details: ["Salifu cut before checking and wasted a board.", "He measured twice and produced an accurate tabletop."], inference: "The carpenter used the mistake as a practical lesson.", word: "precision", meaning: "accuracy and exactness", reference: "the task" },
];

const compositionScenarios = [
  "the need for regular reading among junior high school learners", "ways of reducing plastic waste in the community", "why every school should maintain a functional library", "the benefits and risks of mobile-phone use by students", "how punctuality improves teaching and learning", "the importance of peaceful conflict resolution", "why communities should protect water sources", "the value of vocational and technical skills", "how parents can support adolescent education", "the need for honesty in public life",
];

function stableId(value: string) { let hash = 13; for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) | 0; return -Math.abs(hash || 1); }

function rotate(correct: string, distractors: string[], index: number) {
  const options = distractors.slice(0, 3); const position = (index * 3) % 4; options.splice(position, 0, correct);
  return { options, answer: `${"ABCD"[position]}. ${correct}` };
}

const dagbaniTopicNames: Record<string, string> = {
  "Oral Language and Listening": "Yɛltɔɣa Yɛlibu mini Wumibu",
  "Reading Comprehension": "Karimbu mini Yɛlkpana Baŋbu",
  "Grammar and Language Use": "Dagbani Sabbu Zalisi",
  "Vocabulary Development": "Bachi Pala Baŋbu",
  "Writing and Composition": "Sabbu mini Lahibali Nambu",
  "Language Structure": "Bachinima mini Ŋa Biɛhigu",
  "Language Structure and Translation": "Bachinima Biɛhigu mini Yɛltɔɣa Lɛbigibu",
  "Advanced Language Structure": "Bachinima Biɛhigu Gahindili",
  "Translation and Creative Writing": "Yɛltɔɣa Lɛbigibu mini Sabbu Palli",
  "Oral Literature": "Nolini Baŋsim",
  "Written Literature": "Sabirili Baŋsim",
  "Oral and Written Literature": "Nolini mini Sabirili Baŋsim",
  "Culture and Customs": "Dagbanli Kaya mini Taada",
  "Traditional Institutions and Values": "Kaya, Taada mini Bin yɛra",
  "Culture, Identity and Contemporary Life": "Dagbanli Kaya, Maŋmaŋa Baŋbu mini Zamaŋa Biɛhigu",
};

const dagbaniQuestionStems = [
  "Bɔhimbu tuma bo ka di wuhiri ka bɔhimbila baŋ {topic} viɛnyɛla?",
  "Tuma bo ka karimba ni tooi zaŋ n-vihi bɔhimbila baŋsim {topic} ni?",
  "Bɔhimbila bɔri ni o zahim {topic}. Soli bo ka di viɛli n-ti o?",
  "Lɛbigibu bo ka di wuhiri {topic} baŋsim viɛnyɛla?",
  "Tuma bo ka di wuhiri ka bɔhimbila tooi zaŋ {topic} baŋsim n-tum tuma?",
  "Bɔhimbu tuma bo ka di ni tooi ti {topic} baŋsim shahira ŋan viɛli pam?",
  "Soli bo ka di viɛli pam n-ti {topic} zahimbu?",
  "Sɔhigu bo ka di kpa {topic} polo viɛnyɛla?",
];

function dagbaniQuestionBank(className: string, topics: string[]): CurriculumQuestion[] {
  return topics.flatMap((topic, topicIndex) => {
    const dagbaniTopic = dagbaniTopicNames[topic] ?? topic;
    return Array.from({ length: 40 }, (_, index) => {
      const otherTopics = [1, 2, 3].map((offset) => topics[(topicIndex + offset + index) % topics.length] ?? topic);
      const correct = `Karim ${dagbaniTopic}, kahigi di yɛlkpana ka zaŋ shɛhira n-wuhi a baŋsim.`;
      const distractors = otherTopics.map((other) => `Zaŋ saha maa zaa n-zahim ${dagbaniTopicNames[other] ?? other}, ka da kahigi ${dagbaniTopic} yɛlkpana.`);
      const choice = rotate(correct, distractors, index);
      return {
        id: stableId(`Dagbani-${className}-${topic}-objective-${index + 1}`), className, subject: "Ghanaian Language", term: "All Terms" as const, topic: dagbaniTopic,
        questionType: "Objective" as const, difficulty: index < 12 ? "Easy" as const : index < 30 ? "Moderate" as const : "Challenging" as const,
        questionText: dagbaniQuestionStems[index % dagbaniQuestionStems.length].replace("{topic}", dagbaniTopic), options: choice.options, answer: choice.answer, marks: 1,
        createdBy: "Built-in Dagbani NaCCA curriculum bank", createdAt: "", source: "Built-in" as const,
      };
    });
  });
}

function readingComprehensionBank(className: string): CurriculumQuestion[] {
  const openings = ["Read the following passage carefully and answer all the questions that follow.", "Study the passage below and answer the questions in complete sentences.", "Read the passage attentively before answering Questions (a) to (f).", "Use evidence from the passage to answer the questions that follow."];
  return Array.from({ length: 40 }, (_, index) => {
    const theme = passageThemes[index % passageThemes.length]; const variant = Math.floor(index / passageThemes.length);
    const passage = `${openings[variant]}\n\n${theme.title}\n${theme.body}`;
    const questions = `\n\n(a) What is the passage mainly about? [2 marks]\n(b) State two details from the passage that support its main idea. [4 marks]\n(c) What can the reader infer from the actions of the people in the passage? [3 marks]\n(d) Explain the meaning of “${theme.word}” as used in the passage. [2 marks]\n(e) What does the expression “${theme.reference}” refer to in the passage? [2 marks]\n(f) State one lesson from the passage and support it with evidence. [3 marks]\n(g) Give a suitable alternative title for the passage. [2 marks]\n(h) Identify one feature of the writer's language or organisation that makes the passage effective. [2 marks]`;
    return { id: stableId(`English-${className}-reading-passage-${index + 1}`), className, subject: "English Language", term: "All Terms", topic: "Reading Comprehension", questionType: "Short Answer", difficulty: index < 12 ? "Easy" : index < 30 ? "Moderate" : "Challenging", questionText: passage + questions, options: [], marks: 20, createdBy: "Built-in BECE comprehension bank", createdAt: "", source: "Built-in", answer: `(a) ${theme.main} (2 marks)\n(b) Any two: ${theme.details.join("; ")} (2 marks each)\n(c) ${theme.inference} (3 marks)\n(d) ${theme.meaning} (2 marks)\n(e) Award 2 marks for the correct contextual reference to ${theme.reference}.\n(f) Award 1 mark for a valid lesson and 2 marks for supporting evidence.\n(g) Accept a concise title reflecting: ${theme.main} (2 marks)\n(h) Accept a supported feature such as chronological order, contrast, cause and effect, descriptive detail or clear paragraphing (2 marks).` };
  });
}

function expositoryPersuasiveBank(className: string): CurriculumQuestion[] {
  const formats = [
    (subject: string) => `Write an article for publication in your school magazine explaining ${subject}.`,
    (subject: string) => `Write a speech to be delivered at assembly persuading your fellow students about ${subject}.`,
    (subject: string) => `Write a letter to the District Director of Education presenting your views on ${subject}.`,
    (subject: string) => `Write an essay for an inter-school competition discussing ${subject}.`,
  ];
  return compositionScenarios.flatMap((scenario, scenarioIndex) => formats.map((format, formatIndex) => ({
    id: stableId(`English-${className}-expository-persuasive-${scenarioIndex}-${formatIndex}`), className, subject: "English Language", term: "All Terms", topic: "Expository and Persuasive Writing", questionType: "Essay" as const, difficulty: formatIndex < 2 ? "Moderate" as const : "Challenging" as const,
    questionText: `${format(scenario)} Your composition should be well organised, use appropriate language for its purpose and audience, and be not less than 250 words. [30 marks]`, options: [], marks: 30,
    answer: "BECE composition rubric — Content and relevance: 10 marks; organisation and paragraphing: 5 marks; expression, vocabulary and sentence variety: 10 marks; mechanical accuracy (grammar, spelling and punctuation): 5 marks. For persuasive tasks, award content marks for a clear position, developed reasons, supporting examples and an effective conclusion. For expository tasks, reward accurate explanation, logical development and suitable examples.",
    createdBy: "Built-in BECE composition bank", createdAt: "", source: "Built-in" as const,
  })));
}

function writtenResponseBank(className: string, topic: string, type: "Short Answer" | "Essay"): CurriculumQuestion[] {
  const shortStems = ["State four key points about", "Explain three important features of", "Distinguish between two ideas commonly studied in", "Give three examples that demonstrate", "Summarise the main rules or procedures used in", "Read a suitable classroom text and answer five questions on", "Prepare brief notes under four headings on", "Identify and correct four common errors connected with"];
  const essayStems = ["Write a well-organised composition demonstrating", "Write an article for your school magazine applying", "Write a formal letter that demonstrates", "Write a speech for assembly using the principles of", "Develop a clear five-paragraph response on", "Write a composition with an effective introduction, body and conclusion on", "Produce a functional text that correctly applies", "Write at least 250 words to demonstrate your understanding of"];
  return Array.from({ length: 40 }, (_, index) => ({
    id: stableId(`English-${className}-${topic}-${type}-${index + 1}`), className, subject: "English Language", term: "All Terms", topic, questionType: type,
    difficulty: index < 12 ? "Easy" : index < 30 ? "Moderate" : "Challenging",
    questionText: type === "Short Answer" ? `${shortStems[index % shortStems.length]} ${topic}. Support each answer with an appropriate example. [10 marks]` : `${essayStems[index % essayStems.length]} ${topic}. Use accurate language, logical paragraphing and relevant details. [30 marks]`,
    options: [], marks: type === "Short Answer" ? 10 : 30,
    answer: type === "Short Answer" ? "Award marks for relevant, accurate points and suitable examples: content 6 marks; clarity and organisation 2 marks; grammatical accuracy 2 marks." : "BECE writing rubric: content and relevance 10 marks; organisation 5 marks; expression and vocabulary 10 marks; grammar, spelling and punctuation 5 marks.",
    createdBy: `Built-in English ${type.toLowerCase()} bank`, createdAt: "", source: "Built-in",
  }));
}

const proseStudyAreas = [
  "main events and their logical sequence", "central conflict and its development", "setting and its influence on events", "the protagonist, with evidence for the choice", "the development of one major character", "a comparison of two characters", "a decision that changes the course of events", "an internal conflict and its effect", "an external conflict and its resolution", "the main theme, supported by two incidents", "a secondary theme and its development", "two moral lessons linked to events", "the significance of the title", "the narrative point of view and its effect", "the mood at the opening and how it is created", "the mood at the ending", "an instance of suspense and its effect", "an instance of irony and its effect", "a symbol or important object and what it represents", "how dialogue reveals character", "a striking image and the picture it creates", "a figure of speech and its contextual meaning", "the writer's use of contrast", "descriptive language in an important scene", "the role of a minor character", "the changing relationship between two characters", "the climax as the turning point", "the effectiveness of the ending", "a social issue and the writer's attitude to it", "the relevance of one problem to Ghanaian society", "a Ghanaian cultural value or practice", "a character's commendable action", "a character's poor decision and a better alternative", "a text-supported character sketch", "an incident retold from another character's viewpoint", "a justified prediction after the ending", "how another setting would change the story", "the importance of a passage selected by the teacher", "how character, conflict and setting communicate a lesson", "the story's relevance to JHS learners",
];
const dramaStudyAreas = [
  "the action and central conflict", "the exposition and what it reveals", "how the opening prepares the audience", "setting and its contribution to the action", "the protagonist, supported with evidence", "the opposing force and its effect", "an important changing relationship", "a major character's motivation", "a comparison of two characters", "a text-supported character sketch", "the role of a minor character", "rising action and the creation of tension", "the climax as turning point", "the resolution of the main conflict", "the main theme, supported by two moments", "a secondary theme", "two lessons for the audience", "the significance of the title", "dramatic irony and its effect", "suspense and how it is created", "humour and its dramatic purpose", "how dialogue reveals character", "the meaning and importance of a speech selected by the teacher", "conflict expressed through dialogue", "the purpose of a stage direction", "gesture and movement suitable for one scene", "costume and props suitable for one scene", "sound or lighting that communicates mood", "a figure of speech in the dialogue", "repetition or contrast used for emphasis", "a social issue relevant to Ghana", "a cultural value presented or questioned", "a judgement of one character's action", "an alternative decision and its likely result", "an incident rewritten as narrative", "a diary entry after a major event", "a justified prediction after the final scene", "the effectiveness of the ending", "how character, dialogue and stagecraft develop a theme", "the play's relevance to JHS learners",
];
const poetryStudyAreas = [
  "the subject matter in your own words", "the persona, supported with evidence", "the situation that gives rise to the poem", "the significance of the title", "the central theme, supported by two details", "a secondary theme", "two lessons for the reader", "the persona's attitude", "the dominant tone and how it is created", "the mood created in the reader", "a change in tone", "the poem's meaningful parts", "structure and its contribution to meaning", "line length and arrangement", "stanza arrangement and its effect", "the rhyme pattern and its effect", "rhythm and how it supports meaning", "repetition and its effect", "alliteration or consonance and its effect", "onomatopoeia, where present", "visual imagery and its effect", "sound imagery and its effect", "a metaphor and its contextual meaning", "a simile and its comparison", "personification and its effect", "a symbol and what it represents", "contrast and the idea it emphasises", "an important expression selected by the teacher", "a stanza paraphrased in clear prose", "the connection between opening and closing lines", "appeal to the senses", "word choice and atmosphere", "a social or moral issue", "the message's relevance to Ghana today", "a cultural value reflected in the poem", "the most effective image, with justification", "a comparison of two images or ideas", "whether the persona achieves the poem's purpose", "how two poetic devices communicate a theme", "a critical appreciation covering subject matter, theme, tone and style",
];

const literatureFocuses: Record<string, string[]> = {
  "Kissiwaa the Heroine": ["Kissiwaa's challenge to five-time draughts champion Bediako", "the villagers' belief that a woman could not defeat Bediako", "Kissiwaa's 3-0 victory", "Ababio's insult during the heated contest", "Old Soldier's rebuke of the adults", "the Nyamedua tree in Asempayetia", "the crowd's hostile chants and later celebration", "Kissiwaa's victory as a challenge to gender stereotypes"],
  "A Beacon of Light": ["Ms Adjei's discovery of Osmond's singing talent in Obane", "Osmond's movement from cattle herding in Obane to schooling in Accra", "the support of Tetteh, Akua and Nene Attiapa", "Osmond's friendship and musical partnership with Ama", "the Best New Artist award", "Osmond's StarTalk interview with Kwame Ofosu", "Mrs Adwoa Konadu and Empower Ghana's work in Obane", "music and light as symbols of hope and opportunity"],
  "Fly Like an Eagle": ["Maame Tutuwa's loneliness and struggle with a limp", "the eagles Maame Tutuwa observes from the stone outside her home", "The Majesty of Eagles and its influence on Maame Tutuwa", "Akua's friendship and encouragement at the bookshop", "Auntie Ama's support", "Mrs Owusu's difficult Mathematics problem", "Efua's recognition of Maame Tutuwa's change", "the eagle as a symbol of focus, freedom and resilience"],
  "A Medal from Grandpa": ["the contrast between the Labour Day celebration and the littered Titanic Beach", "the protagonist's decision to organise a beach clean-up", "Mr Alhassan's Sanitation Week announcement", "Mrs Darko's support for the clean-up", "the Young Champion Leads Beach Cleanup report", "the formation of environmental clubs", "Grandpa's medal as recognition and legacy", "the transformed beach as a symbol of collective action"],
  "The Family That Cared": ["Samuel hiding under a tree to eat gari soaking", "Jerry exposing Samuel's poverty to the class", "Abigail defending Samuel from ridicule", "Abigail's experience of neglect by her stepmother", "Mrs Adjei's lesson on The Family That Cared", "Jerry's change from mockery to compassion", "the class becoming a supportive family", "the farewell party and the students' lasting bond"],
  "A Calabash of Saha": ["the community's water problem", "Saha as clear water and a symbol of renewal", "the young innovators' response to hardship", "the calabash as a culturally meaningful object", "resistance to a new solution", "perseverance during the water project", "community responsibility for development", "the relationship between knowledge, innovation and progress"],
  "Forest Gold": ["Osmond's discovery of gold in Daakye Asem", "Chief Daakye Asem's support for mining and later regret", "pollution of the Daakye River", "Elder Onyimdze's defence of the community's heritage", "Zakari's growth from farmer to environmental activist", "the villagers' shutdown of the mining site", "gold as a symbol of greed and exploitation", "the permanently scarred river and the community's continuing hope"],
  "Beyond Light and Shadow": ["the decline of Cedar of Lebanon School under Ashes Flame", "Mrs Janet Acquah's decision to reform the school", "Tina Bells' discovery of the secret student group", "Benson's conflict between Tina and loyalty to Ashes Flame", "Nkrabea's manipulation of the head-prefect position", "Ashes Flame's attack on Benson", "the arrest of Nkrabea and dismantling of the group", "the Rebuilding Hope programme and the school's rebirth"],
  "Oliver Asks for More": ["Oliver's hunger in the workhouse", "the boys' decision that one of them must request more food", "Oliver's famous request for another serving", "Mr Bumble's shocked reaction", "the workhouse authorities' punishment of Oliver", "Mrs Mann's treatment of the children", "the contrast between the officials' comfort and the children's deprivation", "Oliver's courage as a criticism of institutional cruelty"],
  "Dawuni's Dream": ["Dawuni's dream and its warning to the community", "the drought and suffering of the land", "Dawuni's movement from failure to responsible leadership", "Prince Andi's comparison with the kingdom's founder", "the role of the elders and ancestors", "the rebirth of the land after hardship", "the conflict between personal ambition and communal duty", "ancestral blessing as confirmation of legitimate leadership"],
  "Spreading Light": ["Asantewaa's plan to bring solar electricity to her village", "Iddrisu's movement from apathy to partnership", "Sir Nii's encouragement of practical learning", "Kwansah's jealousy and sabotage", "the stolen solar panels", "Asantewaa's hut as the site of invention and conflict", "the exposure of Kwansah and his mother's reaction", "solar light as a symbol of education, innovation and progress"],
  "Mark Antony Mourns Caesar": ["Brutus' claim that Caesar's ambition threatened Rome", "Antony's repeated description of the conspirators as honourable men", "Caesar's refusal of the crown as evidence in Antony's speech", "Antony's display of Caesar's wounded body", "Caesar's will and gifts to the Roman citizens", "the plebeians' rapid change of allegiance", "Antony's use of rhetoric to provoke rebellion", "the danger of mob justice after Caesar's funeral"],
  "The Monday Breeze": ["the ironic contrast between the calm title and the frantic Monday morning", "blaring horns and screaming voices as auditory imagery", "running legs as synecdoche", "the children settling in the van", "Mummy returning for her forgotten purse", "Daddy's repeated yelling", "short action-filled lines that create a hurried rhythm", "blame and lack of cooperation within the family"],
  "Real Illusioned Beckley": ["the strange industrial suburb remembered by the persona", "the thin path that people feared to walk alone", "the mysterious quiet house linked to Dr Beckley", "lost heads and walking legs as synecdoche", "Real Illusioned as an oxymoron", "the frightening stories surrounding Dr Beckley", "new houses around the high-tension zone", "the failure to find Dr Beckley's home and the power of childhood fear"],
  "A Mystic Figure from Ghana": ["Okomfo Anokye's whispered incantations", "the Golden Stool descending from the celestial halls", "twilight as the boundary between physical and spiritual worlds", "the people's reverent gathering", "the Golden Stool as the soul and unity of Asante", "the eight rhyming couplets", "mystical imagery and a reverent tone", "the poem's preservation of Ghanaian cultural heritage"],
  "The Unseen Painter": ["the white canvas that suddenly becomes darker", "God as the poem's central unseen painter", "sunlight, moon and twinkling stars as the painter's colours", "white cloudy human forms", "the images of a pregnant woman and a mother cuddling a child", "the contrast between light and darkness", "human beings painting God as Black, White, Indian or Caucasian", "free verse as a form for reflecting on creation and human perception"],
};

const focusedQuestionForms = [
  (focus: string) => `Explain the circumstances surrounding ${focus} and state its immediate result.`,
  (focus: string) => `What does ${focus} reveal about a named character, speaker or community in the text?`,
  (focus: string) => `Show how the writer uses ${focus} to develop a specific theme.`,
  (focus: string) => `Identify the literary or dramatic technique connected with ${focus} and explain its effect.`,
  (focus: string) => `Assess the importance of ${focus} to the title, conflict or final message of the work.`,
];

function beaconLiteratureBank(className: string, topic: string): CurriculumQuestion[] {
  const title = topic.split(": ").slice(1).join(": ");
  const focuses = literatureFocuses[title] ?? [];
  return Array.from({ length: 40 }, (_, index) => {
    const focus = focuses[index % focuses.length];
    const task = focusedQuestionForms[Math.floor(index / focuses.length)](focus);
    return ({
    id: stableId(`English-${className}-Beacon-${title}-${index + 1}`), className, subject: "English Language", term: "All Terms", topic,
    questionType: index < 30 ? "Short Answer" as const : "Essay" as const,
    difficulty: index < 12 ? "Easy" as const : index < 30 ? "Moderate" as const : "Challenging" as const,
    questionText: `In “${title}”, ${task} Support your answer with a precise incident or expression from the text.`,
    options: [], marks: index < 12 ? 4 : index < 30 ? 6 : 10,
    answer: index < 30 ? `Expected focus: ${focus}. Award for an accurate explanation and specific supporting evidence from “${title}”; do not award unsupported general statements.` : `Expected focus: ${focus}. Literature rubric: accurate knowledge and relevance 4 marks; analysis with textual evidence 3 marks; organisation 1 mark; expression and mechanical accuracy 2 marks.`,
    createdBy: "Built-in The Beacon of Light literature bank", createdAt: "", source: "Built-in" as const,
    });
  });
}

export function buildSubjectQuestionBank(subject: string, className: string): CurriculumQuestion[] {
  const topics = curriculumTopicsFor(subject, className);
  if (subject === "Ghanaian Language") return dagbaniQuestionBank(className, topics);
  const shortAnswerTopics = new Set(["Summary Writing", "Summary and Note-Making", "Media Literacy", "Library and Study Skills"]);
  const essayTopics = new Set(["Writing and Composition", "Narrative and Descriptive Writing", "Argumentative and Functional Writing"]);
  const special: CurriculumQuestion[] = subject === "English Language" ? [
    ...readingComprehensionBank(className),
    ...(topics.includes("Expository and Persuasive Writing") ? expositoryPersuasiveBank(className) : []),
    ...topics.filter((topic) => shortAnswerTopics.has(topic)).flatMap((topic) => writtenResponseBank(className, topic, "Short Answer")),
    ...topics.filter((topic) => essayTopics.has(topic)).flatMap((topic) => writtenResponseBank(className, topic, "Essay")),
    ...topics.filter((topic) => topic.startsWith("Literature —")).flatMap((topic) => beaconLiteratureBank(className, topic)),
  ] : [];
  const responseTopics = new Set(["Reading Comprehension", "Expository and Persuasive Writing", ...shortAnswerTopics, ...essayTopics, ...topics.filter((topic) => topic.startsWith("Literature —"))]);
  const standardTopics = topics.filter((topic) => !(subject === "English Language" && responseTopics.has(topic)));
  const standard = standardTopics.flatMap((topic, topicIndex) => Array.from({ length: 40 }, (_, index) => {
    const action = actions[index % actions.length];
    const correct = `Study ${topic} by learning to ${action}.`;
    const otherTopics = [1, 2, 3].map((offset) => topics[(topicIndex + offset + index) % topics.length] ?? "an unrelated topic");
    const distractors = otherTopics.map((other, distractorIndex) => `Focus instead on ${other} and ${actions[(index + distractorIndex + 2) % actions.length]}.`);
    const choice = rotate(correct, distractors, index);
    return {
      id: stableId(`${subject}-${className}-${topic}-objective-${index + 1}`), className, subject, term: "All Terms" as const, topic,
      questionType: "Objective" as const, difficulty: index < 12 ? "Easy" as const : index < 30 ? "Moderate" as const : "Challenging" as const,
      questionText: stems[index % stems.length].replace("{topic}", topic), options: choice.options, answer: choice.answer, marks: 1,
      createdBy: "Built-in NaCCA curriculum starter bank", createdAt: "", source: "Built-in" as const,
    };
  }));
  return [...special, ...standard];
}
