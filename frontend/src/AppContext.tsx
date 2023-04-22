import { Dispatch, SetStateAction, createContext, useContext } from 'react';
import { AppConfig, VpnConfig } from './rspc/bindings';

export const vpnConfigContext = createContext<VpnConfig[]>(undefined!);
export const setVpnConfigContext = createContext<
  Dispatch<SetStateAction<VpnConfig[]>>
>(() => undefined);

export const appConfigContext = createContext<AppConfig>(undefined!);
export const setAppConfigContext = createContext<
  Dispatch<SetStateAction<AppConfig>>
>(() => undefined);

export type ActivePageType =
  | {
      type: 'home';
    }
  | {
      type: 'vpn';
      id: string;
    };
export const activePageContext = createContext<ActivePageType>(undefined!);
export const setActivePageContext = createContext<
  Dispatch<SetStateAction<ActivePageType>>
>(() => undefined);

export const useVpnConfig = () => useContext(vpnConfigContext);
export const useSetVpnConfig = () => useContext(setVpnConfigContext);
export const useAppConfig = () => useContext(appConfigContext);
export const useSetAppConfig = () => useContext(setAppConfigContext);

export const useActivePage = () => useContext(activePageContext);
export const useSetActivePage = () => useContext(setActivePageContext);
