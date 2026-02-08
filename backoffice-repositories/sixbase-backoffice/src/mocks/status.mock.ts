import { FilterOption } from '../interfaces/analytics.interface';

export const statusOptions: FilterOption[] = [
  { value: '1', label: 'Aguardando pagamento' },
  { value: '2', label: 'Pago' },
  { value: '3', label: 'Negado' },
  { value: '4', label: 'Reembolsado' },
  { value: '5', label: 'Chargedback' },
  { value: '6', label: 'Reembolso solicitado' },
  { value: '7', label: 'Expirado' },
  { value: '8', label: 'Chargedback em disputa' },
];

export const statusMapping: Record<string, string> = {
  '1': 'Aguardando pagamento',
  '2': 'Pago',
  '3': 'Negado',
  '4': 'Reembolsado',
  '5': 'Chargedback',
  '6': 'Reembolso solicitado',
  '7': 'Expirado',
  '8': 'Chargedback em disputa',
};
