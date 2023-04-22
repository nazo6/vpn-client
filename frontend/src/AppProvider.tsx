import { useState } from 'react';
import { AppConfig, VpnConfig } from './rspc/bindings';
import {
  ActivePageType,
  activePageContext,
  appConfigContext,
  setActivePageContext,
  setAppConfigContext,
  setVpnConfigContext,
  vpnConfigContext,
} from './appContext';

type AppProviderProps = {
  children: React.ReactNode;
  initialValues: {
    vpnConfig: VpnConfig[];
    appConfig: AppConfig;
  };
};
export function AppProvider(props: AppProviderProps) {
  const [vpnConfig, setVpnConfig] = useState<VpnConfig[]>(
    props.initialValues.vpnConfig
  );
  const [appConfig, setAppConfig] = useState<AppConfig>(
    props.initialValues.appConfig
  );

  const [activePage, setActivePage] = useState<ActivePageType>({
    type: 'home',
  });

  return (
    <vpnConfigContext.Provider value={vpnConfig}>
      <setVpnConfigContext.Provider value={setVpnConfig}>
        <appConfigContext.Provider value={appConfig}>
          <setAppConfigContext.Provider value={setAppConfig}>
            <activePageContext.Provider value={activePage}>
              <setActivePageContext.Provider value={setActivePage}>
                {props.children}
              </setActivePageContext.Provider>
            </activePageContext.Provider>
          </setAppConfigContext.Provider>
        </appConfigContext.Provider>
      </setVpnConfigContext.Provider>
    </vpnConfigContext.Provider>
  );
}
