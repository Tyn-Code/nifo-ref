import { createBackendModule } from '@backstage/backend-plugin-api';
import { coreServices } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createAddSubmoduleAction } from '../addSubmoduleAction';
import { createPublishAwsAction } from '../publishAwsAction';

export const customScaffolderModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'custom-submodule-actions',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        const githubToken = config.getConfigArray('integrations.github')[0].getString('token');

        scaffolder.addActions(createAddSubmoduleAction(githubToken));
        scaffolder.addActions(createPublishAwsAction());
      },
    });
  },
});