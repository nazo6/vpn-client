import { QueryClient } from '@tanstack/react-query';
import { createClient } from '@rspc/client';
import { TauriTransport } from '@rspc/tauri';

import type { Procedures } from './rspc/bindings';
import { rspc, useColorSchemeCustom } from './hooks';
import { Main } from './pages/Main';
import {
  ColorSchemeProvider,
  MantineProvider,
  createEmotionCache,
} from '@mantine/core';
import { AppProvider } from './AppProvider';

const client = createClient<Procedures>({
  transport: new TauriTransport(),
});
const queryClient = new QueryClient();

function App() {
  return (
    <rspc.Provider client={client} queryClient={queryClient}>
      <Providers />
    </rspc.Provider>
  );
}

const appendCache = createEmotionCache({ key: 'mantine', prepend: false });

function Providers() {
  const [colorScheme, toggleColorScheme] = useColorSchemeCustom();

  const config = rspc.useQuery(['config.getConfig']);
  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        emotionCache={appendCache}
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: colorScheme,
        }}
      >
        {config.data ? (
          <AppProvider
            initialValues={{
              appConfig: config.data.app,
              vpnConfig: config.data.vpn,
            }}
          >
            <Main />
          </AppProvider>
        ) : (
          <></>
        )}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;
