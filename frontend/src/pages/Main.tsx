import { IconSun, IconMoonStars } from '@tabler/icons-react';
import {
  AppShell,
  Group,
  ActionIcon,
  useMantineColorScheme,
  Footer,
} from '@mantine/core';
import { MyNavBar } from './Main/MyNavbar';

export function Main() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      padding="md"
      fixed={false}
      className="h-full min-h-0"
      navbar={<MyNavBar />}
      footer={
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
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      content
    </AppShell>
  );
}
