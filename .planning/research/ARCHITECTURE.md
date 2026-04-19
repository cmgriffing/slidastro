# Architecture Patterns: Slidastro v4.0

**Domain:** Presentation Tool / Slide Engine
**Researched:** 2026-04-18

## Recommended Architecture

The advanced features in v4.0 rely heavily on a shared **Slide Context** and **Click State** management. Components and directives need to reactive to the current "click index" of the slide.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `ClickContext` | Manages the total number of clicks and current click index for a slide. | `s-click`, `s-after`, `s-switch`, `s-mark` |
| `BuiltinComponents` | Wrappers for external libraries or standard HTML. | `ClickContext` (for timing), External Libs |
| `Directives` | Enhances DOM elements with click-reactive behavior. | `ClickContext`, DOM elements |

### Data Flow

1. Slide loads; `ClickContext` calculates the total number of clicks by scanning children (or children registering themselves).
2. User clicks/advances; `ClickContext` updates `currentClick`.
3. Reactive components (`s-switch`, `ShikiMagicMove`) and directives (`s-mark`) update their view based on `currentClick`.

## Patterns to Follow

### Pattern 1: Click Calculation via Registration
Instead of pre-scanning, children register their click requirements with the parent context.
**Example:**
```typescript
// In a child component/directive
const { register } = useClickContext()
onMounted(() => {
  register(id, { start: 1, end: 2 })
})
```

### Pattern 2: Slot-based Switching
Use named slots to represent different "states" of a component based on click ranges.
**Example:**
```html
<s-switch>
  <template #1>State 1</template>
  <template #2-4>State 2 (visible for 3 clicks)</template>
</s-switch>
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Global Click State for All Slides
**Why bad:** Navigation becomes difficult; entering a slide should reset or restore that slide's specific click state.
**Instead:** Maintain a per-slide click state, coordinated by a global router/navigator.

## Scalability Considerations

| Concern | At 10 slides | At 100 slides | At 1000 slides |
|---------|--------------|---------------|----------------|
| `Toc` Generation | Instant | Fast | Needs caching or incremental updates. |
| `ShikiMagicMove` | Negligible | Moderate memory | Ensure tokens are only loaded when needed. |

## Sources

- `_slidev/packages/client/context.ts`
- `_slidev/packages/client/modules/v-click.ts`
