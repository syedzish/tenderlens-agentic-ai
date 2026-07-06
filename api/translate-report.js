const proxy = require("./_proxy.js");

module.exports = function handler(req, res) {
  return proxy(req, res, "/api/translate-report");
};
