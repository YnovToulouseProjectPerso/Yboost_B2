import type { AccuseDefinition } from './accuse.ts';
import type { MoveDefinition } from './move.ts';
import type { SummaryDefinition } from './summary.ts';

// Provisional definition until the real scenario is loaded (#16, #21): replace this module, not its users
export const scenario: AccuseDefinition & SummaryDefinition & MoveDefinition = {
  rooms: [
    { id: 'hall', name: 'Salle commune', description: 'Le feu crépite encore dans la cheminée.', adjacent: ['cuisine', 'couloir', 'ecurie'], requiredKey: null },
    { id: 'cuisine', name: 'Cuisine', description: 'Une cuisine encore tiède, odeur de vin épicé.', adjacent: ['hall', 'cellar'], requiredKey: null },
    { id: 'cellar', name: 'Cave', description: 'Un escalier humide descend dans l’obscurité.', adjacent: ['cuisine'], requiredKey: null },
    { id: 'couloir', name: 'Couloir des chambres', description: 'Une enfilade de portes closes sous un plafond bas.', adjacent: ['hall', 'office'], requiredKey: null },
    { id: 'office', name: 'Bureau d’Armand', description: 'Des registres s’empilent sur une table de chêne.', adjacent: ['couloir'], requiredKey: 'key_office' },
    { id: 'ecurie', name: 'Écurie', description: 'Les chevaux piaffent dans la paille froide.', adjacent: ['hall'], requiredKey: null },
  ],
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
