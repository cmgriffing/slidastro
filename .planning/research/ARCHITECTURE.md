# Architecture: Slidastro (v2.0)

**Domain:** Astro-powered slide presentation tool
**Researched:** 2026-04-22
**Overall confidence:** MEDIUM-HIGH

## Recommended Architecture (v2.0)

Slidastro will continue using the successful SPA shell in Astro established in v1.0, but will shift its data and interactivity layer toward an **Edge-Native** model. This leverages the **Cloudflare-Astro synergy** for low-latency state synchronization and real-time interactive components.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Astro CLI** | Dev server, Build pipeline, AI generation | Astro Dev Server, Workers AI |
| **Edge Sync Layer** | Shared state management (page, clicks, live polls) | Cloudflare D1 (database), Durable Objects |
| **Server Islands** | On-demand dynamic fragments (live charts, poll results) | Cloudflare D1, Client components |
| **Shiki Magic Move** | Token-based animation engine for code morphing | Slide renderer, framework islands |
| **AI Authoring Engine** | Generates markdown/notes from text prompts | CLI, LLM (Workers AI) |

### Data Flow (v2.0 Live Presentation)

1. **Presenter** advances slide → Client emits `nav-change` event via WebSocket.
2. **Edge Worker** receives event → Updates **Cloudflare D1** with current presentation state.
3. **Viewer Clients** receive broadcast via **Durable Objects** → Update local `NavigationStore`.
4. **Server Island** (e.g. Live Poll) detects state change → Fetches latest data from **D1** and re-renders fragment.
5. **View Transition API** → Performs smooth, browser-native morphing between slide states.

## Patterns to Follow

### Pattern 1: Multi-Framework Magic Move
**What:** Coordinating code animations across different island frameworks (React, Svelte, etc.) using a shared Shiki instance.
**When:** Whenever code blocks are presented in a `magic-move` container.
**Example:**
```typescript
// Shared state store (Nano Stores) for Shiki tokens
export const shikiTokenStore = map<Record<string, Tokens>>({});

// React island subscribing to tokens
const ReactMagicMove = ({ id }) => {
  const tokens = useStore(shikiTokenStore)[id];
  return <MagicMove tokens={tokens} />;
};
```

### Pattern 2: Edge-Driven Live Interaction
**What:** Using Astro Server Islands to hydrate real-time data from Cloudflare D1.
**When:** For live audience participation (polls, feedback).
**Example:**
```astro
---
// LivePoll.astro (Server Island)
const { pollId } = Astro.props;
const results = await db.select().from(Polls).where({ id: pollId });
---
<div server:refresh>
  {results.map(r => <div>{r.label}: {r.count}</div>)}
</div>
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Heavy Framework-Specific Shell
**What:** Building the core navigation shell in a complex framework like React.
**Why bad:** Increases initial JS bundle, slows down "First-POST magic", and complicates multi-framework support.
**Instead:** Keep the shell in **Preact** or **Vanilla JS** with Nano Stores for state.

### Anti-Pattern 2: Local-Only Sync in Production
**What:** Relying solely on `BroadcastChannel` for production deployments.
**Why bad:** Prevents remote presentations and mobile-remote control across networks.
**Instead:** Default to **Edge-based synchronization** (Cloudflare-native) for production builds.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Live Sync | WebSockets / BroadcastChannel | Cloudflare Durable Objects | Regional Edge Clusters |
| D1 Database | Single D1 instance | D1 Read-Replicas | Sharded D1 database |
| Build Time | Standard Astro build | Incremental builds | Multi-process parallel build |

## Sources

- [Astro Server Islands Architecture](https://docs.astro.build/en/guides/server-islands/)
- [Cloudflare Durable Objects Documentation](https://developers.cloudflare.com/workers/learning/using-durable-objects/)
- [Shiki Magic Move Technical Implementation](https://shiki-magic-move.netlify.app/)
