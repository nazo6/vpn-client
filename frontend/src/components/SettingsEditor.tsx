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
    } catch (e) {
      notifications.show({ message: 'Failed to add vpn!', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const Grid = (props: { children: React.ReactNode }) => (
    <SimpleGrid
      cols={3}
      spacing="lg"
      breakpoints={[
        { maxWidth: 'md', cols: 2, spacing: 'md' },
        { maxWidth: 'sm', cols: 1, spacing: 'sm' },
      ]}
    >
      {props.children}
    </SimpleGrid>
  );

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        requestSubmit(values);
      })}
    >
      <p className="text-xl mb-2">Proxy</p>
      <Grid>
        <Checkbox
          label="Enabled"
          {...form.getInputProps('proxy.enabled', { type: 'checkbox' })}
        />
        <TextInput label="Port" {...form.getInputProps('proxy.proxy_port')} />
      </Grid>

      <Divider my="sm" />
      <p className="text-xl mb-2">Peer</p>
      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 2, spacing: 'md' },
          { maxWidth: 'sm', cols: 1, spacing: 'sm' },
        ]}
      >
        <TextInput
          withAsterisk
          required
          label="Public Key"
          {...form.getInputProps('peer.public_key')}
        />
        <TextInput
          withAsterisk
          required
          label="Endpoint"
          {...form.getInputProps('peer.endpoint')}
        />
        <TextInput
          withAsterisk
          required
          label="Allowed IPs"
          {...form.getInputProps('peer.allowed_ips')}
        />
        <TextInput
          label="Disallowed IPs"
          {...form.getInputProps('peer.disallowed_ips')}
        />
        <TextInput
          label="Preshared Key"
          {...form.getInputProps('peer.preshared_key')}
        />
        <TextInput
          label="Allowed Apps"
          {...form.getInputProps('peer.allowed_apps')}
        />
        <TextInput
          label="Disallowed Apps"
          {...form.getInputProps('peer.disallowed_apps')}
        />
      </SimpleGrid>

      <Group position="right" mt="md">
        <Button variant="outline" onClick={props.close} disabled={loading}>
          Cancel
        </Button>
        <Button variant="filled" disabled={loading} type="submit">
          {loading ? <Loader size="sm" /> : 'Add'}
        </Button>
      </Group>
    </form>
  );
}
