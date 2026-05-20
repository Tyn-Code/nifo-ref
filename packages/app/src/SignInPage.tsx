import React from 'react';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SignInPage } from '@backstage/core-components';

const customSignInPageExtension = SignInPageBlueprint.make({
  params: {
    loader: async () => props => (
      <SignInPage
        {...props}
        auto
        provider={{
          id: 'guest',
          title: 'Guest',
          message: 'Sign in for Local Development',
        }}
      />
    ),
  },
});

export const customAuthModule = createFrontendModule({
  pluginId: 'app',
  extensions: [customSignInPageExtension],
});
