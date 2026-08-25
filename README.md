# DraftCall MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-io.draftcall%2Ffantasy--football-10B981)](https://registry.modelcontextprotocol.io/v0/servers?search=draftcall)

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

Nine, all read-only. Nothing here can modify a league, a roster, or an account.

| Tool | Arguments | What it answers |
|---|---|---|
| `compare_players` | `player_a`, `player_b`, `scoring_format` | Head to head: points per game in the requested format, volume stats, bye weeks, who produced more. Start/sit, draft and trade questions about two named players. |
| `get_rankings` | `position`, `scoring_format`, `limit` | Position rankings for QB, RB, WR, TE, FLEX, K or DEF. |
| `get_player` | `name` | One player's profile: production, tier, efficiency, bye week. |
| `search_players` | `query`, `limit` | Find players by partial name, team, or position. |
| `get_positional_scarcity` | `scoring_format` | How steep the scoring dropoff is at each position, for draft strategy. |
| `get_bye_conflicts` | `players` | Which bye weeks two or more rostered players share. |
| `get_weekly_matchup` | `player`, `week`, `scoring_format` | Who a player faces in a given week of the season, home or away, and how generous that opponent has been to the position. In-season start/sit questions that name a week. |
| `get_strength_of_schedule` | `team` + `position`, or `player`, or `position` alone | How easy or hard a schedule is for one position, over the full season and over fantasy playoff weeks 14 through 17. A position on its own ranks all 32 teams, easiest first. |
| `verify_claim` | `player`, `metric`, `value`, `scoring_format` | Check a stated figure (points per game, games played, bye week, rank, or any season stat) against the data. Confirms it, or returns the real number. Call it before quoting a stat from memory. |

## Prompts and resources

Three prompts, for clients that surface them in a picker or slash menu: `start_sit`, `draft_pick`, and `bye_planning`. Each one names the exact tools to call and the order to call them.

One resource, `draftcall://methodology`, a single markdown page describing how every derived figure is computed: season basis, scoring formats, tiers, scarcity, opponent difficulty, and strength of schedule.

`scoring_format` accepts PPR, half-PPR and standard. `position` accepts QB, RB,
WR, TE, FLEX, K and DEF. `week` accepts 1 through 18.

## Data

Player names and statistics are public-domain factual data. Rankings refresh
daily. Every figure is labelled inline with the season it describes (2025
regular-season production until the 2026 season accrues a usable sample), and
every response carries a `stats_season` field, so a model cannot mistake a
completed season for a projection. DraftCall publishes no projections, ADP, or
injury status through this server.

## License

MIT, for the contents of this repository. See [LICENSE](LICENSE) and
[NOTICE](NOTICE) for what that does and does not cover.

Not affiliated with the NFL or the NFLPA.

## About

Built by [Pizza Robot Studios LLC](https://draftcall.io/about/), an independent
game and app studio in Los Angeles. DraftCall is also an iOS and Android app:
https://draftcall.io/download/

This repository exists to register the hosted server and document its tools.
The server itself runs at the endpoint above; there is nothing to install here.

## License

The contents of this repository (the registry manifest and these docs) are MIT
licensed. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

That covers this repo only. The DraftCall service, the data it returns, and the
DraftCall name are not covered: use of the endpoint is governed by
https://draftcall.io/terms/, and DraftCall is a trademark of Pizza Robot Studios
LLC (USPTO Serial 99762133).
