import alchemy from "alchemy";
import { GitHubComment } from "alchemy/github";
import { CloudflareStateStore } from "alchemy/state";
import { Worker, DurableObjectNamespace } from "alchemy/cloudflare";

const app = await alchemy("alchemy-demo", {
  stateStore: (scope) => new CloudflareStateStore(scope),
});

const counter = DurableObjectNamespace("counter", {
  className: "Counter",
  // whether you want a sqllite db per DO (usually yes!)
  sqlite: true,
});

export const worker = await Worker("worker", {
  entrypoint: "src/worker.ts",
  url: true,
  bindings: {
    // bind the Durable Object namespace to your Worker
    COUNTER: counter,
  },
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
