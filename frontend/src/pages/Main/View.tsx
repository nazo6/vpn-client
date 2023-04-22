import { useAtomValue } from 'jotai';
import { activePageAtom } from '../../atoms';
import { Home } from './View/Home';
import { VpnView } from './View/VpnView';

export function View() {
  const activePage = useAtomValue(activePageAtom);
  return (
    <>
      {activePage.type === 'home' ? <Home /> : <VpnView id={activePage.id} />}
    </>
  );
}
