// Mock data used to build the notebook and the inventory (issue #41)
// before the API is ready. It will be replaced by API responses once
// the POST /interroger route and the game state are available.

import type { Clue, NotebookEntry } from '../types/game.ts';

export const mockInventory: Clue[] = [
  {
    id: 'mouchoir',
    name: 'Mouchoir brodé « M. L. »',
    description: 'Taché de cire, trouvé sous le buffet.',
    location: 'Cuisine',
  },
  {
    id: 'verre-de-vin',
    name: 'Verre de vin à moitié plein',
    description: 'Laissé sur une table, près de la cheminée.',
    location: 'Salle commune',
  },
  {
    id: 'cle-cave',
    name: 'Clé de la cave',
    description: 'Une lourde clé en fer, encore froide.',
    location: 'Écurie',
  },
];

// type: "testimony" (no clue shown), "revelation" (the suspect cracks)
// or "no_effect" (the clue shown does not concern this suspect).
export const mockNotebook: NotebookEntry[] = [
  {
    id: 'entry-1',
    time: '00:00',
    suspectId: 'lenoir',
    suspectName: 'Marguerite Lenoir',
    type: 'testimony',
    clueName: null,
    text: "J'ai répété mes chansons dans ma chambre toute la soirée. Je n'ai rien entendu.",
  },
  {
    id: 'entry-2',
    time: '01:00',
    suspectId: 'vasseur',
    suspectName: 'Dr Armand Vasseur',
    type: 'testimony',
    clueName: null,
    text: "Je dormais. C'est le cri qui m'a réveillé, vers une heure du matin.",
  },
  {
    id: 'entry-3',
    time: '02:00',
    suspectId: 'anselme',
    suspectName: 'Père Anselme',
    type: 'no_effect',
    clueName: 'Verre de vin à moitié plein',
    text: 'Le prêtre regarde le verre sans réagir. « Je ne bois pas, mon fils. »',
  },
  {
    id: 'entry-4',
    time: '03:00',
    suspectId: 'lenoir',
    suspectName: 'Marguerite Lenoir',
    type: 'revelation',
    clueName: 'Mouchoir brodé « M. L. »',
    text:
      "Marguerite pâlit. Elle avoue être descendue en cuisine vers minuit, mais jure que l'aubergiste était encore vivant.",
  },
];
