import { Button, Modal } from '@mantine/core';
import { rspc } from '../../../hooks';
import {
  activePageAtom,
  runningStateAtom,
  vpnConfigAtom,
} from '../../../atoms';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { VpnEditor } from '../../../components/VpnEditor';
import { useDisclosure } from '@mantine/hooks';
import { StartVpnButton } from '../../../components/StartVpnButton';
import { StopVpnButton } from '../../../components/StopVpnButton';

type VpnViewProps = {
  id: string;
};
export function VpnView(props: VpnViewProps) {
  const { mutateAsync: rspcSetVpnConfig } = rspc.useMutation(
    'config.setVpnConfig'
  );
  const { mutateAsync: stopVpn } = rspc.useMutation('vpn.stop');
  const { mutateAsync: startVpn } = rspc.useMutation('vpn.start');

  const [vpnConfig, setVpnConfig] = useAtom(vpnConfigAtom);
  const setActivePage = useSetAtom(activePageAtom);
  const runningState = useAtomValue(runningStateAtom);
  const isActiveVpn =
    runningState.status != 'Disconnected' && runningState.id == props.id;

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal size="70vw" opened={opened} onClose={close} title="Edit vpn">
        <VpnEditor
          initialValue={vpnConfig.find((c) => c.id == props.id)}
          onSubmit={async (config) => {
            const updatedConfig = vpnConfig.map((c) =>
              c.id == props.id ? config : c
            );
            await rspcSetVpnConfig(updatedConfig);
            setVpnConfig(updatedConfig);

            if (isActiveVpn) {
              await stopVpn(undefined);
              await startVpn(props.id);
            }
            setActivePage({ type: 'vpn', id: config.id });
          }}
          close={close}
        />
      </Modal>
      <div className="flex flex-col gap-1">
        <div>{props.id}</div>
        <div className="flex flex-row gap-1">
          <StartVpnButton id={props.id} forceStart={true} />
          <StopVpnButton />
        </div>
        <div className="flex flex-row gap-1">
          <Button onClick={open}>Edit</Button>
          <Button
            onClick={() => {
              setVpnConfig(vpnConfig.filter((c) => c.id != props.id));
              setActivePage({ type: 'home' });
            }}
            color="red"
          >
            Delete
          </Button>
        </div>
      </div>
    </>
  );
}
