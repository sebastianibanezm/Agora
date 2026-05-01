const FLAGS: Record<string, string> = {
  USA: '🇺🇸',
  Netherlands: '🇳🇱',
  Germany: '🇩🇪',
  China: '🇨🇳',
  India: '🇮🇳',
  UAE: '🇦🇪',
  Peru: '🇵🇪',
  Chile: '🇨🇱',
};

export function getPodFlag(pod: string): string {
  const country = pod.split(',').at(-1)?.trim() ?? '';
  return FLAGS[country] ?? '';
}
