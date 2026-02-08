export interface ContactStatusSummary {
  NAO_CONTATADO: number;
  EM_ANDAMENTO: number;
  SEM_RETORNO: number;
  FINALIZADO: number;
}

export interface ContactStatusSectionProps {
  contactStatusSummary: ContactStatusSummary;
  loading: boolean;
}

