import { Box, Button, CircularProgress, TextField } from '@suid/material';
import useTheme from '@suid/material/styles/useTheme';
import { createStore } from 'solid-js/store';
import { rspc } from '../hooks';
import { VpnConfig } from '../rspc/bindings';
import { For, Match, Switch, createSignal } from 'solid-js';
import { useApp } from '../AppContext';

type AddVpnProps = {
  complete: () => void;
};
export function AddVpn(props: AddVpnProps) {
  const theme = useTheme();
  const { config, setConfig } = useApp()!;
  const nullableFields = [
    'DNS',
    'MTU',
    'AllowedIPs',
    'PresharedKey',
    'AllowedApps',
    'DisallowedApps',
    'DisallowedIPs',
  ];
  const [formState, setFormState] = createStore<VpnConfig>({
    Id: '',
    Interface: {
      PrivateKey: '',
      Address: '',
      DNS: '',
      MTU: '',
    },
    Peer: {
      PublicKey: '',
      AllowedIPs: '',
      Endpoint: '',
      PresharedKey: '',
      AllowedApps: '',
      DisallowedApps: '',
      DisallowedIPs: '',
    },
  });
  const [loading, setLoading] = createSignal(false);

  const rspcSetConfig = rspc.createMutation('config.setVpnConfig');

  function handleSubmit(e: any) {
    e.preventDefault();
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: '24px',
        p: 4,
      }}
    >
      <form onSubmit={handleSubmit} style="">
        <span>Id</span>
        <TextField type="text" onChange={(_, v) => setFormState('Id', v)} />
        <p>Interface</p>
        <For each={Object.keys(formState.Interface)}>
          {(key) => (
            <div>
              <span>{key}</span>
              <TextField
                type="text"
                // @ts-ignore
                onChange={(_, v) => setFormState(`Interface`, key, v)}
              />
            </div>
          )}
        </For>
        <p>Peer</p>
        <For each={Object.keys(formState.Peer)}>
          {(key) => (
            <div>
              <span>{key}</span>
              <TextField
                type="text"
                // @ts-ignore
                onChange={(_, v) => setFormState(`Peer`, key, v)}
              />
            </div>
          )}
        </For>
        <Switch
          fallback={
            <Button
              onClick={async () => {
                let earlyReturn = false;
                if (formState.Id === '') {
                  alert('Id is required');
                  return;
                }
                Object.keys(formState.Interface).forEach((key) => {
                  // @ts-ignore
                  if (formState.Interface[key] === '') {
                    if (nullableFields.includes(key)) {
                      // @ts-ignore
                      formState.Interface[key] = null;
                    } else {
                      alert(`Interface.${key} is required`);
                      earlyReturn = true;
                      return;
                    }
                  }
                });
                if (earlyReturn) return;
                Object.keys(formState.Peer).forEach((key) => {
                  // @ts-ignore
                  if (formState.Interface[key] === '') {
                    if (nullableFields.includes(key)) {
                      // @ts-ignore
                      formState.Interface[key] = null;
                    } else {
                      alert(`Interface.${key} is required`);
                      earlyReturn = true;
                      return;
                    }
                  }
                });
                if (earlyReturn) return;
                setLoading(true);
                await rspcSetConfig.mutateAsync([...config.vpn, formState]);
                rspcSetConfig.mutate([...config.vpn, formState]);
                setConfig('vpn', [...config.vpn, formState]);
                setLoading(false);
                props.complete();
              }}
            >
              Submit
            </Button>
          }
        >
          <Match when={loading()}>
            <CircularProgress color="secondary" />
          </Match>
        </Switch>
      </form>
    </Box>
  );
}
