import {
  ActionIcon,
  Divider,
  Modal,
  NavLink,
  Navbar,
  ScrollArea,
} from '@mantine/core';
import {
  useActivePage,
  useSetActivePage,
  useSetVpnConfig,
  useVpnConfig,
} from '../../appContext';
import { IconPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { VpnEditor } from '../../components/VpnEditor';
import { rspc } from '../../hooks';

export function MyNavBar() {
  const vpnConfig = useVpnConfig();
  const setVpnConfig = useSetVpnConfig();
  const activePage = useActivePage();
  const setActivePage = useSetActivePage();

  const [opened, { open, close }] = useDisclosure(false);

  const { mutate } = rspc.useMutation('config.setVpnConfig');

  return (
    <>
      <Modal size="70vw" opened={opened} onClose={close} title="Add vpn">
        <VpnEditor
          onSubmit={async (config) => {
            mutate([...vpnConfig, config]);
            setVpnConfig([...vpnConfig, config]);
          }}
          close={close}
        />
      </Modal>
      <Navbar p="xs" width={{ base: 300 }}>
        <Navbar.Section>
          <NavLink
            active={activePage.type == 'home'}
            label={'home'}
            onClick={() => setActivePage({ type: 'home' })}
          />
          <Divider my="sm" />
        </Navbar.Section>
        <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
          <div className="w-full flex justify-center mb-2">
            <ActionIcon variant="outline" onClick={open}>
              <IconPlus size="1rem" />
            </ActionIcon>
          </div>
          {vpnConfig.map((vpn) => (
            <NavLink
              key={vpn.id}
              active={activePage.type == 'vpn' && activePage.id == vpn.id}
              label={vpn.id}
              onClick={() => setActivePage({ type: 'vpn', id: vpn.id })}
            />
          ))}
        </Navbar.Section>
      </Navbar>
    </>
  );
}