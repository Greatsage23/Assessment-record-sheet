type Level = "Basic 7" | "Basic 8" | "Basic 9";

const sharedLanguage = ["Oral Language and Listening", "Reading Comprehension", "Grammar and Language Use", "Vocabulary Development", "Writing and Composition"];
const beaconOfLightLiterature = [
  "Literature — Prose: Beyond Light and Shadow", "Literature — Prose: Oliver Asks for More",
  "Literature — Prose: The Family That Cared", "Literature — Prose: Forest Gold",
  "Literature — Prose: A Calabash of Saha", "Literature — Prose: Kissiwaa the Heroine",
  "Literature — Prose: Fly Like an Eagle", "Literature — Prose: A Medal from Grandpa",
  "Literature — Prose: A Beacon of Light", "Literature — Drama: Dawuni's Dream",
  "Literature — Drama: Spreading Light", "Literature — Drama: Mark Antony Mourns Caesar",
  "Literature — Poetry: The Monday Breeze", "Literature — Poetry: Real Illusioned Beckley",
  "Literature — Poetry: A Mystic Figure from Ghana", "Literature — Poetry: The Unseen Painter",
];

export const CURRICULUM_TOPICS: Record<string, Record<Level, string[]>> = {
  "English Language": {
    "Basic 7": [...sharedLanguage, "Narrative and Descriptive Writing", "Library and Study Skills", ...beaconOfLightLiterature],
    "Basic 8": [...sharedLanguage, "Expository and Persuasive Writing", "Summary Writing", "Media Literacy", ...beaconOfLightLiterature],
    "Basic 9": [...sharedLanguage, "Argumentative and Functional Writing", "Summary and Note-Making", "Examination Language Skills", ...beaconOfLightLiterature],
  },
  Mathematics: {
    "Basic 7": ["Place Value and Number Operations", "Fractions, Decimals and Percentages", "Ratio and Proportion", "Sets", "Algebraic Expressions", "Patterns and Relations", "Lines, Angles and Shapes", "Measurement", "Data Collection and Presentation", "Probability"],
    "Basic 8": ["Real Numbers and Standard Form", "Rates, Ratio and Proportion", "Percentages and Financial Mathematics", "Algebraic Expressions and Factorisation", "Linear Equations and Inequalities", "Mappings and Relations", "Geometric Constructions", "Mensuration", "Statistics", "Probability"],
    "Basic 9": ["Number and Consumer Arithmetic", "Indices and Surds", "Algebraic Expressions and Equations", "Functions and Graphs", "Variation", "Similarity and Transformation", "Pythagoras and Trigonometry", "Mensuration", "Statistics", "Probability"],
  },
  Science: {
    "Basic 7": ["Nature of Science", "Materials and Their Properties", "Cells and Living Organisms", "Life Cycles", "The Solar System", "Ecosystems", "Energy", "Forces and Motion", "Human Body Systems", "Health and Sanitation"],
    "Basic 8": ["Scientific Investigation", "Mixtures and Separation", "Atoms and Elements", "Reproduction and Growth", "Weather and Climate", "Food Chains and Ecosystems", "Electricity and Magnetism", "Heat and Light", "Nutrition and Digestion", "Environmental Resources"],
    "Basic 9": ["Scientific Investigation and Technology", "Chemical Compounds and Reactions", "Acids, Bases and Salts", "Genetics and Variation", "Earth and Space", "Biodiversity and Conservation", "Work, Energy and Machines", "Waves and Electricity", "Disease and Immunity", "Climate Change and Sustainability"],
  },
  "Social Studies": {
    "Basic 7": ["The Environment and Environmental Issues", "Mapping Skills", "Adolescent Development", "The Family and Socialisation", "Culture and National Identity", "Citizenship", "Law, Order and Authority", "Production and Entrepreneurship", "Financial Literacy"],
    "Basic 8": ["Natural and Human Resources", "Population and Settlement", "Responsible Adolescence", "Marriage and Family Life", "Peace and Conflict Resolution", "Governance and Democracy", "Human Rights and Responsibilities", "Economic Activities", "Science, Technology and Society"],
    "Basic 9": ["Sustainable Environmental Management", "Population and National Development", "Self-Identity and Life Goals", "Social Change", "National Integration", "Constitution and Governance", "Ghana and the International Community", "Economic Development", "Globalisation"],
  },
  "Religious and Moral Education": {
    "Basic 7": ["God, Creation and Attributes", "The Three Major Religions in Ghana", "Religious Worship and Practices", "Religious Leaders", "The Family and Community", "Moral Values", "Work and Service", "Religious Festivals"],
    "Basic 8": ["Purpose and Stewardship of Creation", "Sacred Scriptures and Oral Traditions", "Prayer and Worship", "Lives of Religious Leaders", "Adolescence and Chastity", "Moral Decision-Making", "Authority and Obedience", "Religious Festivals and Rites"],
    "Basic 9": ["Humanity and the Environment", "Religious Teachings and Social Life", "Commitment and Faith", "Leadership and Service", "Marriage and Family Responsibilities", "Integrity and Responsible Citizenship", "Peace and Conflict Resolution", "Religion and National Development"],
  },
  "Creative Arts and Design": {
    "Basic 7": ["Elements and Principles of Design", "Drawing and Colour Work", "Pattern and Printmaking", "Modelling and Construction", "Music Elements and Performance", "Dance and Movement", "Drama and Storytelling", "Creative Arts Appreciation"],
    "Basic 8": ["Design Thinking", "Observational and Imaginative Drawing", "Textiles and Surface Design", "Sculpture and Assemblage", "Music Composition and Performance", "Choreography", "Drama Creation and Production", "Arts, Culture and Technology"],
    "Basic 9": ["Creative Design Process", "Visual Communication", "Textile and Product Design", "Sculpture and Environmental Art", "Music Arrangement and Performance", "Dance Production", "Theatre Production", "Portfolio, Exhibition and Entrepreneurship"],
  },
  "Career Technology": {
    "Basic 7": ["Health and Safety", "Tools, Equipment and Materials", "Food and Nutrition", "Food Preparation", "Textiles and Clothing", "Wood, Metal and Plastics", "Technical Drawing", "Designing and Making", "Entrepreneurial Skills"],
    "Basic 8": ["Workshop and Kitchen Safety", "Material Properties and Selection", "Meal Planning and Nutrition", "Food Processing and Preservation", "Fabric Construction", "Structures and Mechanisms", "Graphic Communication", "Design and Production", "Enterprise and Consumer Skills"],
    "Basic 9": ["Occupational Health and Safety", "Sustainable Materials", "Catering and Hospitality", "Food Product Development", "Garment and Textile Production", "Construction and Maintenance", "Technical Drawing and CAD", "Product Design and Evaluation", "Entrepreneurship and Career Pathways"],
  },
  "Ghanaian Language": {
    "Basic 7": [...sharedLanguage, "Language Structure", "Oral Literature", "Written Literature", "Culture and Customs"],
    "Basic 8": [...sharedLanguage, "Language Structure and Translation", "Oral Literature", "Written Literature", "Traditional Institutions and Values"],
    "Basic 9": [...sharedLanguage, "Advanced Language Structure", "Translation and Creative Writing", "Oral and Written Literature", "Culture, Identity and Contemporary Life"],
  },
  French: {
    "Basic 7": ["Greetings and Introductions", "Personal Identity", "Family and Relationships", "School Life", "Numbers, Dates and Time", "Daily Activities", "Food and Drink", "Home and Local Environment", "Basic Grammar and Vocabulary"],
    "Basic 8": ["Describing People and Places", "School and Education", "Health and Well-being", "Shopping and Services", "Travel and Transport", "Weather and Leisure", "Communication and Technology", "Francophone Culture", "Grammar and Written Communication"],
    "Basic 9": ["Personal Plans and Ambitions", "Community and Citizenship", "Education and Careers", "Health and Environment", "Travel and Tourism", "Media and Technology", "Social Issues", "Francophone Culture", "Functional Writing and Conversation"],
  },
};

export function curriculumTopicsFor(subject: string, className: string) {
  const level = (className.startsWith("Basic 7") ? "Basic 7" : className.startsWith("Basic 9") ? "Basic 9" : "Basic 8") as Level;
  return CURRICULUM_TOPICS[subject]?.[level] ?? [];
}
