import { Button } from '@mantine/core';
import { rspc } from '../hooks';
import { runningStateAtom } from '../atoms';
import { useAtomValue } from 'jotai';
import { notifications } from '@mantine/notifications';

type StopVpnProps = {
  id?: string;
};
export function StopVpnButton(props: StopVpnProps) {
  const { mutateAsync: stopVpn } = rspc.useMutation('vpn.stop');

  const runningState = useAtomValue(runningStateAtom);
  const isConnected = runningState.status == 'Connected';
  const isActiveVpnConnected =
    runningState.status == 'Connected' && runningState.id == props.id;

  return (
    <Button
      disabled={!(props.id ? isActiveVpnConnected : isConnected)}
      onClick={async () => {
        try {
          await stopVpn(undefined);
        } catch (e) {
          console.log('failed to stop vpn');
          console.log(e);

          notifications.show({
            message: 'Failed to stop VPN',
            color: 'red',
          });
        }
      }}
    >
      Stop
    </Button>
  );
}
