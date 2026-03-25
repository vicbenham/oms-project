// Contexte de l'événement transmis à chaque action
// Contient toutes les données disponibles au moment du déclenchement
export interface EventContext {
  userId?: string;
  orderId?: string;
  amount?: number;
  status?: string;
  email?: string;
  workflowId?: string;
  [key: string]: unknown; // permet d'étendre le contexte sans casser le typage
}

// Interface Strategy — chaque handler implémente cette interface
// Le moteur ne connaît que cette interface, pas les implémentations concrètes
export interface ActionHandler {
  execute(context: EventContext): Promise<string>; // retourne un message de résultat
}