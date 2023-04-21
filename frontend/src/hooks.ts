import { createSolidQueryHooks } from '@rspc/solid';
import { Procedures } from './rspc/bindings';

export const rspc = createSolidQueryHooks<Procedures>();
