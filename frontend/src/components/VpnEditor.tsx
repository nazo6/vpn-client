import { useForm } from '@mantine/form';
import { VpnConfig } from '../rspc/bindings';
import {
  Button,
  Divider,
  FileButton,
  Group,
  Loader,
  SimpleGrid,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { parseWireguardConfig } from '../utils';

type VpnEditorProps = {
  initialValue?: VpnConfig;
  onSubmit: (value: VpnConfig) => Promise<void>;
  close: () => void;
};
export function VpnEditor(props: VpnEditorProps) {
  const form = useForm({
    initialValues:
      props.initialValue ??
      ({
        id: '',
        interface: {
          private_key: '',
          address: '',
          dns: '',
          mtu: '',
        },
        peer: {
          public_key: '',
          endpoint: '',
          allowed_ips: '',
          disallowed_ips: '',
          preshared_key: '',
          allowed_apps: '',
          disallowed_apps: '',
        },
      } as VpnConfig),
  });

  const [loading, setLoading] = useState(false);
  const requestSubmit = async (config: VpnConfig) => {
    setLoading(true);
    try {
      await props.onSubmit(config);
    } catch (e) {
      notifications.show({ message: 'Failed to add vpn!', color: 'red' });
    } finally {
      setLoading(false);
    }
    props.close();
  };

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        requestSubmit(values);
      })}
    >
      <TextInput
        withAsterisk
        required
        label="id (name)"
        {...form.getInputProps('id')}
      />

      <Divider my="sm" />
      <p className="text-xl mb-2">Interface</p>
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
          label="Private Key"
          {...form.getInputProps('interface.private_key')}
        />
        <TextInput
          withAsterisk
          required
          label="Address"
          {...form.getInputProps('interface.address')}
        />
        <TextInput label="DNS" {...form.getInputProps('interface.dns')} />
        <TextInput label="MTU" {...form.getInputProps('interface.mtu')} />
      </SimpleGrid>

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

      <div className="w-full flex flex-row justify-between">
        <Group>
          <FileButton
            onChange={(file) => {
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const config = parseWireguardConfig(
                    file.name.replace(/\.[^/.]+$/, ''),
                    reader.result as string
                  );

                  form.setValues(config);
                };

                reader.readAsText(file);
              }
            }}
          >
            {(props) => (
              <Button mt="md" variant="light" disabled={loading} {...props}>
                Import file
              </Button>
            )}
          </FileButton>
        </Group>
        <Group position="right" mt="md">
          <Button variant="outline" onClick={props.close} disabled={loading}>
            Cancel
          </Button>
          <Button variant="filled" disabled={loading} type="submit">
            {loading ? <Loader size="sm" /> : 'Submit'}
          </Button>
        </Group>
      </div>
    </form>
  );
}
