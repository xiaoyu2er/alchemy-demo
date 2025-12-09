import type { worker } from "../alchemy.run";
import { DurableObject } from "cloudflare:workers";
import { env } from "cloudflare:workers";
export class Counter extends DurableObject {
  declare env: typeof worker.Env;
  private count: number;

  constructor(ctx: DurableObjectState, env: typeof worker.Env) {
    super(ctx, env);
    // Initialize count from storage or 0
    this.count = Number(this.ctx.storage.kv.get('count') || 0);
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/increment") {
      this.count++;
    } else if (path === "/decrement") {
      this.count--;
    }

    // Update count in storage
    this.ctx.storage.kv.put('count', this.count.toString());
    return Response.json({ count: this.count });
  }
}



export default {
  async fetch(request: Request) {
    const _url = new URL(request.url);

    // Create an ID for the Counter (different IDs = different Counter instances)
    const id = env.COUNTER.idFromName("A");

    // Get a stub for the Counter instance
    const stub = env.COUNTER.get(id);

    // Forward the request to the Durable Object
    return stub.fetch(request);
  },
};