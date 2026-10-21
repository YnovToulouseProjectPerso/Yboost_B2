// Shared types for the game data displayed by the frontend.
// They must stay in line with the API contract.

export interface Clue {
  id: string;
  name: string;
  description: string;
  location: string;
}

// "testimony": no clue shown; "revelation": the suspect cracks;
// "no_effect": the clue shown does not concern this suspect.
export type NotebookEntryType = 'testimony' | 'revelation' | 'no_effect';

export interface NotebookEntry {
  id: string;
  time: string;
  suspectId: string;
  suspectName: string;
  type: NotebookEntryType;
  clueName: string | null;
  text: string;
}
