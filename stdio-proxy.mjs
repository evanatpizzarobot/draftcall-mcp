#!/usr/bin/env node
//
// stdio bridge for the DraftCall MCP server.
//
// The canonical way to use DraftCall is the hosted endpoint at
// https://draftcall.io/mcp, which any client that accepts a remote MCP URL can
// take with nothing to install. This bridge exists for the clients and
// registries that only speak the stdio transport: it reads newline-delimited
// JSON-RPC on stdin, forwards each message verbatim to the hosted endpoint, and
// writes the response back on stdout.
//
// It holds no state and adds no behaviour of its own. Every tool, prompt and
// resource comes from the hosted server, so there is exactly one implementation
// to keep correct and this file can never drift from it.
//
// Dependencies: none. Node built-ins and global fetch only, which is what keeps
// the Docker build reproducible from the Dockerfile alone with no install step.

import { createInterface } from 'node:readline';

const ENDPOINT = process.env.DRAFTCALL_MCP_URL ?? 'https://draftcall.io/mcp';
const PROTOCOL_VERSION = '2025-06-18';

const RPC_PARSE_ERROR = -32700;
// "Internal error" is the closest standard code for "the transport broke".
const RPC_INTERNAL_ERROR = -32603;

// stdout is a single stream shared by every response, and a write large enough
// to fill the pipe buffer completes asynchronously. Two of those overlapping
// would interleave into unparseable output, so writes are queued even though
// the requests themselves run concurrently. Ordering between responses is not
// required by JSON-RPC (clients match on id); not interleaving them is.
let writes = Promise.resolve();

function writeLine(text) {
  writes = writes.then(
    () =>
      new Promise((resolve) => {
        if (process.stdout.write(`${text}\n`)) resolve();
        else process.stdout.once('drain', resolve);
      }),
  );
  return writes;
}

function writeMessage(payload) {
  return writeLine(JSON.stringify(payload));
}

/**
 * The ids carried by a payload, single or batched. A request that never gets an
 * answer hangs its client indefinitely, so a transport failure is reported once
 * per id rather than swallowed. Notifications carry no id and correctly yield
 * nothing here.
 */
function idsOf(message) {
  const list = Array.isArray(message) ? message : [message];
  return list.map((m) => m?.id).filter((id) => id !== undefined && id !== null);
}

async function forward(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    // Malformed input never reached the server, so answer locally with the
    // parse error the spec defines rather than forwarding garbage upstream.
    await writeMessage({ jsonrpc: '2.0', id: null, error: { code: RPC_PARSE_ERROR, message: 'Invalid JSON' } });
    return;
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'MCP-Protocol-Version': PROTOCOL_VERSION,
      },
      body: line,
    });

    // A notification is answered with 202 and no body. Writing anything at all
    // in that case would be a protocol violation, so an empty body is the one
    // outcome that produces no output.
    const text = (await response.text()).trim();
    if (!text) return;
    await writeLine(text);
  } catch (err) {
    for (const id of idsOf(message)) {
      await writeMessage({
        jsonrpc: '2.0',
        id,
        error: { code: RPC_INTERNAL_ERROR, message: `DraftCall endpoint unreachable: ${err.message}` },
      });
    }
  }
}

const input = createInterface({ input: process.stdin });

input.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  // Not awaited: requests run concurrently, and writeLine keeps the output
  // stream ordered on their behalf.
  void forward(trimmed);
});

// There is deliberately no exit handler here.
//
// Closing stdin is how a client says it has finished sending, but responses to
// messages already in flight still have to come back. Node exits on its own
// once nothing is left holding the event loop, and an in-flight request holds
// it through its socket while an unflushed stdout write holds it through the
// stream, so waiting for both is the default behaviour and the process ends
// with code 0 when they are done.
//
// The obvious-looking alternative, awaiting the pending work in an
// `input.on('close')` handler and then calling process.exit(0), is worse in two
// ways: it force-closes handles that are still flushing, which aborts on
// Windows with a libuv assertion in async.c rather than exiting cleanly, and it
// truncates any response that had not finished writing. Let the loop drain.
