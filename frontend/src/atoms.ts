import { atom } from 'jotai';
import { AppConfig, LogEntry, VpnConfig } from './rspc/bindings';
import { ExtractedStatus } from './utils';

export const appConfigAtom = atom<AppConfig>({} as AppConfig);
export const vpnConfigAtom = atom<VpnConfig[]>([]);

export type ActivePageType =
  | {
      type: 'home';
    }
  | {
      type: 'vpn';
      id: string;
    };
export const activePageAtom = atom<ActivePageType>({ type: 'home' });

export const runningStateAtom = atom<ExtractedStatus>({
  status: 'Disconnected',
});

export const logAtom = atom<LogEntry[]>([]);
