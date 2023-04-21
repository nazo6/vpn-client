import { createContext, useContext } from 'solid-js';
import { SetStoreFunction, createStore } from 'solid-js/store';
import { Config } from './rspc/bindings';

type ContextType = {
  config: Config;
  setConfig: SetStoreFunction<Config>;
};
const AppContext = createContext<ContextType>();

type AppProviderType = {
  config: Config;
  children: any;
};
export function AppProvider(props: AppProviderType) {
  const [config, setConfig] = createStore(props.config);
  const store: ContextType = {
    config,
    setConfig,
  };
  return (
    <AppContext.Provider value={store}>{props.children}</AppContext.Provider>
  );
}
export function useApp() {
  return useContext(AppContext);
}
