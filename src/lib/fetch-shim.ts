// This is a shim to prevent @protobufjs/fetch from trying to overwrite window.fetch
// which causes a TypeError in some restrictive environments (like the AI Studio sandbox).

const fetch = window.fetch;
export default fetch;
export { fetch };
