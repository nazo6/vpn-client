import { ActionIcon, Divider, Modal, NavLink, ScrollArea } from '@mantine/core';
import { IconCircle, IconPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAtom, useAtomValue } from 'jotai';
import { VpnEditor } from '../../components/VpnEditor';
import { rspc } from '../../hooks';
import { vpnConfigAtom, activePageAtom, runningStateAtom } from '../../atoms';

export function MyNavBar() {
  const [vpnConfig, setVpnConfig] = useAtom(vpnConfigAtom);
  const [activePage, setActivePage] = useAtom(activePageAtom);
  const connectionStatus = useAtomValue(runningStateAtom);

  const [opened, { open, close }] = useDisclosure(false);

  const { mutateAsync: rspcSetVpnConfig } = rspc.useMutation(
    'config.setVpnConfig'
  );

  return (
    <div className="p-2">
      <Modal size="70vw" opened={opened} onClose={close} title="Add vpn">
        <VpnEditor
          onSubmit={async (config) => {
            await rspcSetVpnConfig([...vpnConfig, config]);
            setVpnConfig([...vpnConfig, config]);
          }}
          close={close}
        />
      </Modal>
      <div className="flex flex-col">
        <div>
          <NavLink
            active={activePage.type == 'home'}
            label={'home'}
            onClick={() => setActivePage({ type: 'home' })}
          />
          <Divider my="sm" />
        </div>
        <ScrollArea>
          <div className="w-full flex justify-center mb-2">
            <ActionIcon variant="outline" onClick={open}>
              <IconPlus size="1rem" />
            </ActionIcon>
          </div>
          {vpnConfig.map((vpn) => (
            <NavLink
              icon={
                <IconCircle
                  size="1rem"
                  fill={
                    'id' in connectionStatus && connectionStatus.id == vpn.id
                      ? 'green'
                      : 'red'
                  }
                  color={
                    'id' in connectionStatus && connectionStatus.id == vpn.id
                      ? 'green'
                      : 'red'
                  }
                />
              }
              key={vpn.id}
              active={activePage.type == 'vpn' && activePage.id == vpn.id}
              label={vpn.id}
              onClick={() => setActivePage({ type: 'vpn', id: vpn.id })}
            />
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
