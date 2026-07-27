import { curriculumTopicsFor } from "./curriculum-topics";

export type CurriculumQuestion = {
  id: number; className: string; subject: string; term: "All Terms"; topic: string;
  questionType: "Objective"; difficulty: "Easy" | "Moderate" | "Challenging";
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

function stableId(value: string) { let hash = 13; for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) | 0; return -Math.abs(hash || 1); }

function rotate(correct: string, distractors: string[], index: number) {
  const options = distractors.slice(0, 3); const position = (index * 3) % 4; options.splice(position, 0, correct);
  return { options, answer: `${"ABCD"[position]}. ${correct}` };
}

export function buildSubjectQuestionBank(subject: string, className: string): CurriculumQuestion[] {
  const topics = curriculumTopicsFor(subject, className);
  return topics.flatMap((topic, topicIndex) => Array.from({ length: 40 }, (_, index) => {
    const action = actions[index % actions.length];
    const correct = `Study ${topic} by learning to ${action}.`;
    const otherTopics = [1, 2, 3].map((offset) => topics[(topicIndex + offset + index) % topics.length] ?? "an unrelated topic");
    const distractors = otherTopics.map((other, distractorIndex) => `Focus instead on ${other} and ${actions[(index + distractorIndex + 2) % actions.length]}.`);
    const choice = rotate(correct, distractors, index);
    return {
      id: stableId(`${subject}-${className}-${topic}-objective-${index + 1}`), className, subject, term: "All Terms", topic,
      questionType: "Objective" as const, difficulty: index < 12 ? "Easy" as const : index < 30 ? "Moderate" as const : "Challenging" as const,
      questionText: stems[index % stems.length].replace("{topic}", topic), options: choice.options, answer: choice.answer, marks: 1,
      createdBy: "Built-in NaCCA curriculum starter bank", createdAt: "", source: "Built-in" as const,
    };
  }));
}
