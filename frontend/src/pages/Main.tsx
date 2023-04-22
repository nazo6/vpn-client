import { IconSun, IconMoonStars } from '@tabler/icons-react';
import {
  AppShell,
  Group,
  ActionIcon,
  useMantineColorScheme,
  Footer,
} from '@mantine/core';
import { MyNavBar } from './Main/MyNavbar';
import { View } from './Main/View';
import { useSetAtom } from 'jotai';
import { logAtom, runningStateAtom } from '../atoms';
import { rspc } from '../hooks';
import { extractStatus } from '../utils';

export function Main() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const setRunningState = useSetAtom(runningStateAtom);
  const setLog = useSetAtom(logAtom);

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
    <div className="flex flex-col h-full">
      <div className="flex flex-row h-full min-h-0">
        <div className="w-[30%] max-w-xl">
          <MyNavBar />
        </div>
        <div className="flex-1 h-full">
          <View />
        </div>
      </div>

      <Footer height={40}>
        <Group sx={{ height: '100%' }} px={20} position="apart">
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
        </Group>
      </Footer>
    </div>
  );
}
