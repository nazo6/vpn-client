import { QueryClient } from '@tanstack/react-query';
import { createClient } from '@rspc/client';
import { TauriTransport } from '@rspc/tauri';
import { useHydrateAtoms } from 'jotai/utils';
import type { Procedures } from './rspc/bindings';
import { rspc, useColorSchemeCustom } from './hooks';
import { Main } from './pages/Main';
import {
  ColorSchemeProvider,
  MantineProvider,
  createEmotionCache,
} from '@mantine/core';
import { appConfigAtom, vpnConfigAtom } from './atoms';

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
          <HydrateAtoms
            initialValues={[
              [appConfigAtom, config.data.app],
              [vpnConfigAtom, config.data.vpn],
            ]}
          >
            <Main />
          </HydrateAtoms>
        ) : (
          <></>
        )}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
function HydrateAtoms({
  initialValues,
  children,
}: {
  initialValues: any;
  children: React.ReactNode;
}) {
  useHydrateAtoms(initialValues);
  return <>{children}</>;
}

export default App;
