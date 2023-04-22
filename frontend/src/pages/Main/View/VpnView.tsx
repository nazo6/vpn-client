import { Button } from '@mantine/core';
import { rspc } from '../../../hooks';

type VpnViewProps = {
  id: string;
};
export function VpnView(props: VpnViewProps) {
  const { mutateAsync: startVpn } = rspc.useMutation('vpn.start');
  return (
    <>
      <div>{props.id}</div>
      <Button
        onClick={async () => {
          try {
            await startVpn(props.id);
          } catch (e) {
            console.log('failed to start vpn');
            console.log(e);
          }
        }}
      >
        Start
      </Button>
    </>
  );
}
