export enum RegionalMapMessageType {
  Ready = 'mapReady',
  Error = 'mapError',
  SelectCity = 'selectCity'
}

type RegionalMapMessage = { type: RegionalMapMessageType.Ready | RegionalMapMessageType.Error }
  | { type: RegionalMapMessageType.SelectCity; city: string; state: string };

export function parseRegionalMapMessage(message: string): RegionalMapMessage | null {
  try {
    const parsed: unknown = JSON.parse(message);
    if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) return null;
    if (parsed.type === RegionalMapMessageType.Ready || parsed.type === RegionalMapMessageType.Error) return { type: parsed.type };
    if (parsed.type === RegionalMapMessageType.SelectCity && 'city' in parsed && 'state' in parsed && typeof parsed.city === 'string' && typeof parsed.state === 'string') {
      return { type: parsed.type, city: parsed.city, state: parsed.state };
    }
  } catch {
    return null;
  }
  return null;
}
