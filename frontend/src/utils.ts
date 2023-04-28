import { Status, VpnConfig } from './rspc/bindings';

const interfaceKeyMap: Record<string, string> = {
  privatekey: 'private_key',
  address: 'address',
  dns: 'dns',
  mtu: 'mtu',
};
const peerKeyMap: Record<string, string> = {
  publickey: 'public_key',
  endpoint: 'endpoint',
  allowedips: 'allowed_ips',
  disallowedips: 'disallowed_ips',
  presharedkey: 'preshared_key',
  allowedapps: 'allowed_apps',
  disallowedapps: 'disallowed_apps',
};

export function parseWireguardConfig(id: string, str: string): VpnConfig {
  const config: VpnConfig = {
    id,
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
  };

  const lines = str.split('\n');
  lines.forEach((line) => {
    const matches = line.match(/(?<key>.+?) ?= ?(?<value>.+)/);
    if (matches?.groups) {
      const key = matches.groups['key'].toLowerCase();
      const value = matches.groups['value'];
      if (key && value) {
        if (key in interfaceKeyMap) {
          // @ts-expect-error this is fine
          config.interface[interfaceKeyMap[key]] = value;
        } else if (key in peerKeyMap) {
          // @ts-expect-error this is fine
          config.peer[peerKeyMap[key]] = value;
        }
      }
    }
  });

  return config;
}

export type ExtractedStatus =
  | {
      status: 'Disconnected';
    }
  | {
      status: 'Connecting' | 'Disconnecting' | 'Connected';
      id: string;
    };
export function extractStatus(status: Status): ExtractedStatus {
  if (status == 'Disconnected') {
    return { status: 'Disconnected' };
  } else if ('Connecting' in status) {
    return { status: 'Connecting', id: status.Connecting };
  } else if ('Connected' in status) {
    return { status: 'Connected', id: status.Connected };
  } else if ('Disconnecting' in status) {
    return { status: 'Disconnecting', id: status.Disconnecting };
  } else {
    throw Error('Unreachable');
  }
}
