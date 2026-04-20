import { Question } from '../types';

export const IAT_QUESTIONS: Question[] = [
  // Physics
  {
    id: 'p1',
    subject: 'Physics',
    text: 'A particle moves in a circle of radius R with constant speed v. The magnitude of the change in velocity when it has moved through an angle of 60 degrees is:',
    options: ['v', 'v√2', 'v√3', '2v sin(30°)'],
    correctAnswer: 3,
    explanation: 'The change in velocity vector Δv = v2 - v1. The magnitude is |Δv| = 2v sin(θ/2). For θ = 60°, |Δv| = 2v sin(30°).',
  },
  {
    id: 'p2',
    subject: 'Physics',
    text: 'Which of the following is not a property of electromagnetic waves?',
    options: [
      'They are transverse in nature',
      'They require a medium for propagation',
      'They travel with the speed of light in vacuum',
      'They carry energy and momentum'
    ],
    correctAnswer: 1,
    explanation: 'Electromagnetic waves do not require a medium for propagation; they can travel through vacuum.',
  },
  // Chemistry
  {
    id: 'c1',
    subject: 'Chemistry',
    text: 'The hybridization of central atom in ClF3 is:',
    options: ['sp3', 'sp3d', 'sp3d2', 'sp2'],
    correctAnswer: 1,
    explanation: 'Chlorine has 7 valence electrons. It forms 3 bonds with Fluorine and has 2 lone pairs. Total electron pairs = 5, which corresponds to sp3d hybridization (T-shaped geometry).',
  },
  {
    id: 'c2',
    subject: 'Chemistry',
    text: 'Which of the following has the highest boiling point?',
    options: ['NH3', 'PH3', 'AsH3', 'SbH3'],
    correctAnswer: 0,
    explanation: 'Ammonia (NH3) has the highest boiling point among these due to strong intermolecular hydrogen bonding.',
  },
  // Biology
  {
    id: 'b1',
    subject: 'Biology',
    text: 'Which organelle is known as the "Powerhouse of the Cell"?',
    options: ['Nucleus', 'Golgi complex', 'Mitochondria', 'Endoplasmic reticulum'],
    correctAnswer: 2,
    explanation: 'Mitochondria are called the powerhouse of the cell because they produce ATP, the energy currency of the cell.',
  },
  {
    id: 'b2',
    subject: 'Biology',
    text: 'The process of conversion of atmospheric nitrogen to ammonia by bacteria is called:',
    options: ['Nitrification', 'Nitrogen fixation', 'Denitrification', 'Ammonification'],
    correctAnswer: 1,
    explanation: 'Nitrogen fixation is the process of converting atmospheric nitrogen (N2) into ammonia (NH3).',
  },
  // Mathematics
  {
    id: 'm1',
    subject: 'Mathematics',
    text: 'The value of ∫ sin²x dx from 0 to π/2 is:',
    options: ['π/2', 'π/4', 'π/8', '1'],
    correctAnswer: 1,
    explanation: '∫ sin²x dx = ∫ (1 - cos 2x)/2 dx = [x/2 - (sin 2x)/4]. Evaluated from 0 to π/2, it gives (π/4 - 0) - (0 - 0) = π/4.',
  },
  {
    id: 'm2',
    subject: 'Mathematics',
    text: 'If A and B are symmetric matrices of the same order, then AB - BA is a:',
    options: ['Symmetric matrix', 'Skew-symmetric matrix', 'Zero matrix', 'Identity matrix'],
    correctAnswer: 1,
    explanation: '(AB - BA)T = (AB)T - (BA)T = BT AT - AT BT. Since A, B are symmetric, AT = A and BT = B. So (AB - BA)T = BA - AB = -(AB - BA). Thus it is skew-symmetric.',
  }
];
