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
        onClick={() => {
          startVpn(props.id);
        }}
      >
        Start
      </Button>
    </>
  );
}
