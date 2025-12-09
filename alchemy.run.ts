import alchemy from "alchemy";
import { Worker, } from "alchemy/cloudflare";
import { GitHubComment } from "alchemy/github";
import { CloudflareStateStore } from "alchemy/state";

const app = await alchemy("alchemy-demo", {
  stateStore: (scope) => new CloudflareStateStore(scope),
  
});

export const worker = await Worker("worker", {
  entrypoint: "src/worker.ts",
});

console.log(worker.url);


if (process.env.PULL_REQUEST) {
  // if this is a PR, add a comment to the PR with the preview URL
  // it will auto-update with each push
  await GitHubComment("preview-comment", {
    owner: "xiaoyu2er",
    repository: "alchemy-demo",
    issueNumber: Number(process.env.PULL_REQUEST),
    body: `
     ## 🚀 Preview Deployed

     Your changes have been deployed to a preview environment:

     **🌐 Worker:** ${worker.url}

     Built from commit ${process.env.GITHUB_SHA?.slice(0, 7)}

     ---
     <sub>🤖 This comment updates automatically with each push.</sub>`,
  });
}

await app.finalize();
