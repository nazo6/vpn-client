import { Button } from '@mantine/core';
import { rspc } from '../hooks';
import { runningStateAtom } from '../atoms';
import { useAtomValue } from 'jotai';
import { notifications } from '@mantine/notifications';

type StartVpnButtonProps = {
  id: string;
  /// Whether to start the VPN even if it is already running.
  forceStart: boolean;
};
export function StartVpnButton(props: StartVpnButtonProps) {
  const { mutateAsync: startVpn } = rspc.useMutation('vpn.start');
  const { mutateAsync: stopVpn } = rspc.useMutation('vpn.stop');

  const runningState = useAtomValue(runningStateAtom);
  const isActiveVpn =
    runningState.status != 'Disconnected' && runningState.id == props.id;

  return (
    <Button
      disabled={
        props.forceStart ? isActiveVpn : runningState.status != 'Disconnected'
      }
      onClick={async () => {
        try {
          if (runningState.status == 'Disconnected') {
            await startVpn(props.id);
          } else {
            if (props.forceStart) {
              await stopVpn(undefined);
              await startVpn(props.id);
            } else {
              throw Error("This shouldn't happen");
            }
          }
        } catch (e) {
          console.log('failed to start vpn');
          console.log(e);

          notifications.show({
            message: 'Failed to Start VPN',
            color: 'red',
          });
        }
      }}
    >
      Start
    </Button>
  );
}
