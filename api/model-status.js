import { proxy } from "./_proxy.js";

export default async function handler(req, res) {
  return proxy(req, res, "/api/model-status");
}
