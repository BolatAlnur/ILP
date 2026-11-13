// Custom CommonJS module holding initial LexiLearn dyslexia-friendly study materials

const initialMaterials = [
  {
    id: 101,
    title: 'Cellular Respiration & ATP Synthesis',
    subject: 'Biology 101',
    readingLevel: 'Beginner',
    estimatedMinutes: 12,
    isSimplified: true,
    audioAvailable: true
  },
  {
    id: 102,
    title: 'Keynesian Macroeconomics & Fiscal Policy',
    subject: 'Economics 204',
    readingLevel: 'Intermediate',
    estimatedMinutes: 18,
    isSimplified: true,
    audioAvailable: false
  },
  {
    id: 103,
    title: 'Algorithmic Complexity & Big-O Notation',
    subject: 'Computer Science',
    readingLevel: 'Intermediate',
    estimatedMinutes: 15,
    isSimplified: false,
    audioAvailable: true
  },
  {
    id: 104,
    title: 'Cognitive Load Theory in Neurodivergent Learning',
    subject: 'Psychology 102',
    readingLevel: 'Advanced',
    estimatedMinutes: 22,
    isSimplified: true,
    audioAvailable: true
  }
];

module.exports = {
  initialMaterials
};
