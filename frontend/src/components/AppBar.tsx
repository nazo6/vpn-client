import MenuIcon from '@suid/icons-material/Menu';
import {
  AppBar as SuAppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from '@suid/material';
import { rspc } from '../hooks';
import { createSignal } from 'solid-js';

export function AppBar() {
  const [connectionStatus, setConnectionStatus] = createSignal('');
  const rspcClient = rspc.useContext().client;
  // @ts-ignore
  rspcClient.addSubscription(['app.connectionStatus'], {
    onData: (data) => {
      console.log(data);
      setConnectionStatus(data);
    },
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <SuAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Wiresock gui
          </Typography>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {connectionStatus()}
          </Typography>
        </Toolbar>
      </SuAppBar>
    </Box>
  );
}
