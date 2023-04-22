import { Badge, Button, Code, Group, ScrollArea } from '@mantine/core';
import { rspc } from '../../../hooks';
import { useAtomValue } from 'jotai';
import { logAtom, runningStateAtom } from '../../../atoms';
import { Level } from '../../../rspc/bindings';

export function Home() {
  const { mutateAsync: stopVpn } = rspc.useMutation('vpn.stop');

  const runningState = useAtomValue(runningStateAtom);
  const log = useAtomValue(logAtom);

  return (
    <div className="flex flex-col h-full">
      <Group>
        {runningState.status}
        {'id' in runningState ? ': ' + runningState.id : ''}
        <Button
          onClick={async () => {
            await stopVpn(undefined);
          }}
        >
          Stop
        </Button>
      </Group>
      <ScrollArea>
        {log.map((logEntry, i) => {
          if ('VpnLog' in logEntry) {
            return (
              <div className="flex flex-row gap-1" key={i}>
                <LevelBadge level={logEntry.VpnLog.level} />
                <Badge variant="light">{logEntry.VpnLog.vpn_id}</Badge>
                {logEntry.VpnLog.message}
              </div>
            );
          } else {
            return (
              <div className="flex flex-row gap-1" key={i}>
                <LevelBadge level={logEntry.AppLog.level} />
                {logEntry.AppLog.message}
              </div>
            );
          }
        })}
      </ScrollArea>
    </div>
  );
}

function LevelBadge({ level }: { level: Level }) {
  return (
    <>
      {level == 'Info' && (
        <Badge variant="outline" color="blue">
          INFO
        </Badge>
      )}
      {level == 'Warn' && (
        <Badge variant="outline" color="yellow">
          WARN
        </Badge>
      )}
      {level == 'Error' && (
        <Badge variant="outline" color="red">
          ERROR
        </Badge>
      )}
      {level == 'Debug' && (
        <Badge variant="outline" color="gray">
          DEBUG
        </Badge>
      )}
      {level == 'Trace' && (
        <Badge variant="outline" color="gray">
          TRACE
        </Badge>
      )}
    </>
  );
}
