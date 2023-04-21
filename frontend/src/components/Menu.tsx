import Cloud from '@suid/icons-material/Cloud';
import ContentCopy from '@suid/icons-material/ContentCopy';
import ContentCut from '@suid/icons-material/ContentCut';
import ContentPaste from '@suid/icons-material/ContentPaste';
import {
  Divider,
  Paper,
  MenuList,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Modal,
} from '@suid/material';
import { AddVpn } from '../pages/AddVpn';
import { For, createSignal } from 'solid-js';
import { useApp } from '../AppContext';
import { rspc } from '../hooks';

type MenuProps = {
  changeSelectedVpn: (id: string) => void;
};
export function Menu(props: MenuProps) {
  const [open, setOpen] = createSignal(false);
  const { config } = useApp()!;

  const rspcVpnStart = rspc.createMutation('vpn.start');
  const rspcVpnStop = rspc.createMutation('vpn.stop');

  return (
    <Paper
      sx={{
        width: 320,
        maxWidth: '100%',
        height: '100%',
      }}
    >
      <Modal
        open={open()}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <AddVpn complete={() => setOpen(false)} />
      </Modal>
      <MenuList>
        <MenuItem onClick={() => setOpen(true)}>
          <ListItemIcon>
            <Cloud fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add VPN</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={async () => {
            let res = await rspcVpnStop.mutateAsync(undefined);
            console.log(res);
          }}
        >
          <ListItemIcon>
            <Cloud fontSize="small" />
          </ListItemIcon>
          <ListItemText>Stop VPN</ListItemText>
        </MenuItem>
        <Divider />
        <For each={config.vpn}>
          {(vpn) => (
            <MenuItem onClick={() => rspcVpnStart.mutate(vpn.Id)}>
              <ListItemIcon>
                <ContentCut fontSize="small" />
              </ListItemIcon>
              <ListItemText>{vpn.Id}</ListItemText>
            </MenuItem>
          )}
        </For>
      </MenuList>
    </Paper>
  );
}
