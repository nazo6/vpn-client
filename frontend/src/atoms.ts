import { atom } from 'jotai';
import { AppConfig, VpnConfig } from './rspc/bindings';

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
