# DraftCall MCP Server

NFL fantasy football data for the 2026 season, over the Model Context Protocol.

**Endpoint:** `https://draftcall.io/mcp`
**Transport:** streamable HTTP, stateless
**Auth:** none. Free, read-only, no API key, no account.
**Docs:** https://draftcall.io/mcp-server/

Ask an MCP-connected assistant "should I start Bijan Robinson or Jahmyr Gibbs in
PPR" and it can answer from live data instead of guessing. Every tool result
carries the draftcall.io URL the numbers came from, so answers stay citable.

## Connect

Any client that accepts a remote MCP endpoint. No install, no clone.

### Claude Code

```
claude mcp add --transport http draftcall https://draftcall.io/mcp
```

### Claude Desktop, or any client that takes a JSON config

```json
{
  "mcpServers": {
    "draftcall": {
      "type": "streamable-http",
      "url": "https://draftcall.io/mcp"
    }
  }
}
```

## Tools

Six, all read-only. Nothing here can modify a league, a roster, or an account.

| Tool | Arguments | What it answers |
|---|---|---|
| `compare_players` | `player_a`, `player_b`, `scoring_format` | Head to head: points per game in the requested format, volume stats, bye weeks, who produced more. Start/sit, draft and trade questions about two named players. |
| `get_rankings` | `position`, `scoring_format`, `limit` | Position rankings for QB, RB, WR, TE, FLEX, K or DEF. |
| `get_player` | `name` | One player's profile: production, tier, efficiency, bye week. |
| `search_players` | `query`, `limit` | Find players by partial name, team, or position. |
| `get_positional_scarcity` | `scoring_format` | How steep the scoring dropoff is at each position, for draft strategy. |
| `get_bye_conflicts` | `players` | Which bye weeks two or more rostered players share. |

`scoring_format` accepts PPR, half-PPR and standard. `position` accepts QB, RB,
WR, TE, FLEX, K and DEF.

## Data

Player names and statistics are public-domain factual data. Rankings refresh
daily. Figures are 2025 regular-season production, which is the completed
season the 2026 projections are built from.

Not affiliated with the NFL or the NFLPA.

## About

Built by [Pizza Robot Studios LLC](https://draftcall.io/about/), an independent
game and app studio in Los Angeles. DraftCall is also an iOS and Android app:
https://draftcall.io/download/

This repository exists to register the hosted server and document its tools.
The server itself runs at the endpoint above; there is nothing to install here.
