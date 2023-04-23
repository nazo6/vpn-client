import { useForm } from '@mantine/form';
import { AppConfig } from '../rspc/bindings';
import {
  Button,
  Checkbox,
  Divider,
  Group,
  Loader,
  SimpleGrid,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { appConfigAtom } from '../atoms';
import { rspc } from '../hooks';

type SettingsEditorProps = {
  close: () => void;
};
export function SettingsEditor(props: SettingsEditorProps) {
  const [appConfig, setAppConfig] = useAtom(appConfigAtom);
  const { mutateAsync: rspcSetAppConfig } = rspc.useMutation(
    'config.setAppConfig'
  );
  const form = useForm({
    initialValues: appConfig,
  });

  const [loading, setLoading] = useState(false);
  const requestSubmit = async (config: AppConfig) => {
    setLoading(true);
    try {
      await rspcSetAppConfig(config);
      setAppConfig(config);
      props.close();
    } catch (e) {
      notifications.show({ message: 'Failed to add vpn!', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        requestSubmit(values);
      })}
    >
      <p className="text-xl mb-2">Proxy</p>
      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 2, spacing: 'md' },
          { maxWidth: 'sm', cols: 1, spacing: 'sm' },
        ]}
      >
        <Checkbox
          label="Enabled"
          {...form.getInputProps('proxy.enabled', { type: 'checkbox' })}
        />
        <TextInput label="Port" {...form.getInputProps('proxy.proxy_port')} />
      </SimpleGrid>

      <Divider my="sm" />
      <p className="text-xl mb-2">Auto start</p>
      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 2, spacing: 'md' },
          { maxWidth: 'sm', cols: 1, spacing: 'sm' },
        ]}
      >
        <Checkbox
          label="Start app on windows startup"
          {...form.getInputProps('auto_start.app', { type: 'checkbox' })}
        />

        <Checkbox
          label="Hide window when app starts"
          {...form.getInputProps('auto_start.hide_window', {
            type: 'checkbox',
          })}
        />

        <TextInput
          label="VPN id to auto start"
          {...form.getInputProps('auto_start.vpn')}
        />
      </SimpleGrid>

      <Group position="right" mt="md">
        <Button variant="outline" onClick={props.close} disabled={loading}>
          Cancel
        </Button>
        <Button variant="filled" disabled={loading} type="submit">
          {loading ? <Loader size="sm" /> : 'Apply'}
        </Button>
      </Group>
    </form>
  );
}
