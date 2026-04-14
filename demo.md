---
title: Slidastro Ecosystem Demo
---

# Mermaid Diagram

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Check Logs]
```

---

# Monaco Editor

Try editing this code! Type safety (ATA) should kick in for the `nanostores` import.

```ts {monaco}
import { atom } from 'nanostores'

const counter = atom(0)

counter.subscribe(v => {
  console.log('Value changed:', v)
})

console.log('Current value:', counter.get())
```

---

# Mermaid in step-click

<step-click>

```mermaid
pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15
```

</step-click>
