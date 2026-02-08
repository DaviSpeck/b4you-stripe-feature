export enum DeviceLevel {
  DEVICE = 'device',
  BROWSER = 'browser',
  OS = 'os',
  ORIGIN = 'origin',
}

export const deviceLevelLabels: Record<DeviceLevel, string> = {
  [DeviceLevel.DEVICE]: 'Dispositivo',
  [DeviceLevel.BROWSER]: 'Navegador',
  [DeviceLevel.OS]: 'Sistema Operacional',
  [DeviceLevel.ORIGIN]: 'Origem',
};
