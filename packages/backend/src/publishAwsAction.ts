import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { execSync } from 'child_process';

export function createPublishAwsAction() {
  return createTemplateAction<{
    repoName: string;
    description: string;
  }, {}>({
    id: 'custom:publish-aws-codecommit',
    schema: {
      input: {
        required: ['repoName'],
        type: 'object',
        properties: {
          repoName: { type: 'string' },
          description: { type: 'string' }
        },
      },
    },
    async handler(ctx) {
      const { repoName, description } = ctx.input;
      
      ctx.logger.info(`Creating AWS CodeCommit repository: ${repoName}`);
      
      // 1. Create the repository in AWS using the locally configured AWS credentials
      try {
        execSync(
          `aws codecommit create-repository --repository-name ${repoName} --repository-description "${description || ''}"`,
          { stdio: 'pipe' }
        );
        ctx.logger.info(`Successfully created AWS CodeCommit repository: ${repoName}`);
      } catch (e: any) {
        // Log warning if repo creation fails (it might already exist)
        ctx.logger.warn(`Repository creation notice: ${e.stderr?.toString()}`);
      }

      // Construct the HTTP Git URL for AWS CodeCommit
      const remoteUrl = `https://git-codecommit.us-east-1.amazonaws.com/v1/repos/${repoName}`;

      ctx.logger.info(`Initializing local git and pushing to ${remoteUrl}`);

      // 2. Initialize Git, commit the scaffolded workspace, and push it to AWS CodeCommit
      const workspacePath = ctx.workspacePath;
      
      try {
        execSync(`git init`, { cwd: workspacePath, stdio: 'pipe' });
        execSync(`git branch -m main`, { cwd: workspacePath, stdio: 'pipe' });
        execSync(`git add .`, { cwd: workspacePath, stdio: 'pipe' });
        // Use a generic git user if none exists in the workspace
        execSync(`git config user.name "Backstage Scaffolder"`, { cwd: workspacePath, stdio: 'pipe' });
        execSync(`git config user.email "scaffolder@backstage.io"`, { cwd: workspacePath, stdio: 'pipe' });
        execSync(`git commit -m "Initial commit from Backstage Scaffolder"`, { cwd: workspacePath, stdio: 'pipe' });
        execSync(`git remote add origin ${remoteUrl}`, { cwd: workspacePath, stdio: 'pipe' });
        execSync(`git push -u origin main`, { cwd: workspacePath, stdio: 'pipe' });
        ctx.logger.info(`Successfully pushed code to AWS CodeCommit!`);
      } catch (e: any) {
        ctx.logger.error(`Git push failed: ${e.stderr?.toString()}`);
        throw e;
      }
      
      // 3. Export the remote URL so the submodule action can consume it
      ctx.output('remoteUrl', remoteUrl);
      ctx.output('repoContentsUrl', remoteUrl);
    },
  });
}
