import { IconSun, IconMoonStars, IconSettings } from '@tabler/icons-react';
import { Group, ActionIcon, useMantineColorScheme, Modal } from '@mantine/core';
import { MyNavBar } from './Main/MyNavbar';
import { View } from './Main/View';
import { useSetAtom } from 'jotai';
import { logAtom, runningStateAtom } from '../atoms';
import { rspc } from '../hooks';
import { extractStatus } from '../utils';
import { SettingsEditor } from '../components/SettingsEditor';
import { useDisclosure } from '@mantine/hooks';

export function Main() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const setRunningState = useSetAtom(runningStateAtom);
  const setLog = useSetAtom(logAtom);

  const [opened, { open, close }] = useDisclosure(false);

  rspc.useSubscription(['app.connectionStatus'], {
    onData: (data) => {
      setRunningState(extractStatus(data));
    },
  });

  rspc.useSubscription(['app.log'], {
    onData: (data) => {
      setLog((prev) => [...prev, data]);
    },
  });

  return (
    <>
      <Modal
        size="70vw"
        opened={opened}
        onClose={close}
        title="Global settings"
      >
        <SettingsEditor close={close} />
      </Modal>
      <div className="flex flex-col h-full">
        <div className="flex flex-row h-full min-h-0">
          <div className="w-[30%] max-w-xl">
            <MyNavBar />
          </div>
          <div className="flex-1 h-full">
            <View />
          </div>
        </div>

        <div className="h-12 bg-blue-50">
          <Group sx={{ height: '100%' }} px={20} position="left">
            <ActionIcon
              variant="default"
              onClick={() => toggleColorScheme()}
              size={30}
            >
              {colorScheme === 'dark' ? (
                <IconSun size="1rem" />
              ) : (
                <IconMoonStars size="1rem" />
              )}
            </ActionIcon>
            <ActionIcon variant="default" onClick={() => open()} size={30}>
              <IconSettings size="1rem" />
            </ActionIcon>
          </Group>
        </div>
      </div>
    </>
  );
}
