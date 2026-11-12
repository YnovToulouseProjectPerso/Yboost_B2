import type { AccuseDefinition } from './accuse.ts';
import type { SummaryDefinition } from './summary.ts';

// Provisional definition until the real scenario is loaded (#16, #21): replace this module, not its users
export const scenario: AccuseDefinition & SummaryDefinition = {
  suspects: [
    { id: 's_marchand', name: 'Le marchand' },
    { id: 's_servante', name: 'La servante' },
  ],
  clues: [
    { id: 'i_gant', title: 'Gant taché de cire', evidenceAgainst: 's_marchand' },
    { id: 'i_lettre', title: 'Lettre de créance déchirée', evidenceAgainst: 's_marchand' },
    { id: 'i_bougie', title: 'Bougie éteinte', evidenceAgainst: null },
  ],
  solution: {
    culprit: 's_marchand',
    motive: 'Une dette que l’aubergiste menaçait de révéler.',
    timeline: [
      { time: '23h30', text: 'Le marchand quitte la salle commune.' },
      { time: '0h45', text: 'Il rejoint l’aubergiste dans le bureau.' },
    ],
  },
};
