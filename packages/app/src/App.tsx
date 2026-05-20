import { createApp } from '@backstage/frontend-defaults';

import catalogPlugin from '@backstage/plugin-catalog/alpha';

import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';

import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';

import { navModule } from './modules/nav';
export default createApp({
  features: [
    catalogPlugin,
    scaffolderPlugin,
    catalogImportPlugin,
    navModule,
  ],
});