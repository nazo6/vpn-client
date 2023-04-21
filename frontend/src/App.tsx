import { QueryClient } from '@tanstack/solid-query';
import { createClient } from '@rspc/client';
import { TauriTransport } from '@rspc/tauri';
import { Procedures } from './rspc/bindings';
import { Menu } from './components/Menu';
import { For, Match, Switch, createSignal } from 'solid-js';
import { rspc } from './hooks';
import { AppProvider } from './AppContext';
import { AppBar } from './components/AppBar';

const client = createClient<Procedures>({
  transport: new TauriTransport(),
});

const queryClient = new QueryClient();

function Top() {
  const [selectedVpn, setSelectedVpn] = createSignal<string | null>(null);

  const [logs, setLogs] = createSignal<string[]>([]);
  const rspcClient = rspc.useContext().client;
  // @ts-ignore
  rspcClient.addSubscription(['app.vpnLog'], {
    onData: (data) => {
      setLogs((prev) => [...prev, data]);
    },
  });

  const configQuery = rspc.createQuery(() => ['config.getConfig']);

  return (
    <div class="h-full">
      <Switch>
        <Match when={configQuery.data}>
          {(config) => (
            <AppProvider config={config()}>
              <div class="h-full flex flex-col">
                <AppBar />
                <div class="flex flex-row min-h-0 h-full w-full">
                  <Menu
                    changeSelectedVpn={(id: string) => setSelectedVpn(id)}
                  />
                  <div class="w-full">
                    <For each={logs()}>{(log) => <div>{log}</div>}</For>
                  </div>
                </div>
              </div>
            </AppProvider>
          )}
        </Match>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <rspc.Provider client={client} queryClient={queryClient}>
      <Top />
    </rspc.Provider>
  );
}

export default App;
