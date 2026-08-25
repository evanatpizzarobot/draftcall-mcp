# A locally runnable build of the DraftCall MCP server, for clients and
# registries that require one.
#
# The canonical way to use DraftCall is the hosted endpoint at
# https://draftcall.io/mcp with nothing to install. This image runs the stdio
# bridge in stdio-proxy.mjs, which forwards stdio JSON-RPC to that same
# endpoint, so a client limited to the stdio transport gets identical tools,
# prompts and resources from the one server implementation.
#
# Run it:
#   docker build -t draftcall-mcp .
#   docker run --rm -i draftcall-mcp
#
# Point it somewhere else (staging, a preview deploy) with DRAFTCALL_MCP_URL.

FROM node:22-alpine

WORKDIR /app

# The bridge uses only Node built-ins and global fetch, so there is no manifest
# to install from and no lockfile to drift. The single COPY is the whole build.
COPY stdio-proxy.mjs ./

# Fail at build time if the bridge ever stops parsing. Without this the first
# symptom is a client reporting nothing more useful than "server exited".
RUN node --check stdio-proxy.mjs

# Unprivileged by default. The bridge reads stdin, writes stdout and makes one
# outbound HTTPS request; it needs nothing that root would provide.
USER node

ENTRYPOINT ["node", "/app/stdio-proxy.mjs"]
