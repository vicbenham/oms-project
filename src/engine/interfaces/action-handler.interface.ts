/***
 Définition du contexte de l'evenement que l'on transmet a chaque action
 Le contexte doit contenir toutes les données disponible au moment du déclenchement
  d'un event

 On ajoute un dernier champ [key: string] de type unknown pour pouvoir étendre
  le contexte à n'importe quel ajout qui n'aurait pas été précedemment établi
 ***/
export interface EventContext {
  userId?: string;
  orderId?: string;
  amount?: number;
  status?: string;
  email?: string;
  workflowId?: string;
  [key: string]: unknown;
}

/***
 C'est l'interface de notre pattern Strategy pour nos ActionHandlers.
 On ne donne au moteur que cette interface pour qu'il reste agnostique des implémentations
  concrètes des handlers.
 La fonction execute nous retourne un message de resultat
 ***/
export interface ActionHandler {
  execute(context: EventContext): Promise<string>;
}