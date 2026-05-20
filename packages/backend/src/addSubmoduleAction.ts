import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import { execSync } from 'child_process';

export function createAddSubmoduleAction(
  githubToken: string,
) {
  return createTemplateAction<{
    repoName: string;
    repoUrl: string;
  }, {}>({
    id: 'custom:add-submodule',

    schema: {
      input: {
        required: ['repoName', 'repoUrl'],

        type: 'object',

        properties: {
          repoName: {
            type: 'string',
          },

          repoUrl: {
            type: 'string',
          },
        },
      },
    },

    async handler(ctx) {
      const { repoName, repoUrl } = ctx.input;

      const platformRepo = 'E:/platform_engineering/nifo-ref';

      ctx.logger.info(
        `Adding submodule ${repoName}`,
      );

      // Inject token temporarily for private GitHub repo clone, skip for AWS CodeCommit
      let authenticatedRepoUrl = repoUrl;
      if (repoUrl.includes('github.com')) {
        authenticatedRepoUrl = repoUrl.replace('https://', `https://${githubToken}@`);
      }

      // Add submodule
      try {
  execSync(
    `git -C "${platformRepo}" submodule add ${authenticatedRepoUrl} frontend/${repoName}`,
    {
      stdio: 'pipe',
    },
  );
} catch (error: any) {
  ctx.logger.error(
    error.stdout?.toString(),
  );

  ctx.logger.error(
    error.stderr?.toString(),
  );

  throw error;
}

      // Remove token from .gitmodules after clone
      execSync(
        `git -C "${platformRepo}" config -f .gitmodules submodule.frontend/${repoName}.url ${repoUrl}`,
        {
          stdio: 'inherit',
        },
      );

      // Git add
      execSync(
        `git -C "${platformRepo}" add .`,
        {
          stdio: 'inherit',
        },
      );

      // Commit
      execSync(
        `git -C "${platformRepo}" commit -m "Added ${repoName} submodule"`,
        {
          stdio: 'inherit',
        },
      );

      // Push changes
      execSync(
        `git -C "${platformRepo}" push`,
        {
          stdio: 'inherit',
        },
      );

      ctx.logger.info(
        `Submodule added successfully`,
      );
    },
  });
}