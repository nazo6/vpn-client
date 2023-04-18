import { QueryClient } from '@tanstack/solid-query';
import { createClient } from '@rspc/client';
import { createSolidQueryHooks } from '@rspc/solid';
import { TauriTransport } from '@rspc/tauri';

import type { Procedures } from './rspc/bindings';

const client = createClient<Procedures>({
  transport: new TauriTransport(),
});

const queryClient = new QueryClient();
const rspc = createSolidQueryHooks<Procedures>();

function SomeComponent() {
  const msg = rspc.createQuery(() => ['app.getAppName']);

  return (
    <>
      <p>{msg.data}</p>
    </>
  );
}

function App() {
  return (
    <rspc.Provider client={client} queryClient={queryClient}>
      <SomeComponent />
    </rspc.Provider>
  );
}

export default App;
