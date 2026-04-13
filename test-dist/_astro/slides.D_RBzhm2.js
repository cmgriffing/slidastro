typeof Promise=="function"&&Promise.prototype.then.bind(Promise.resolve()),Math.random().toString(8);let o=[],u=(e,i)=>{let n=[],t={get(){return t.lc||t.listen(()=>{})(),t.value},l:0,lc:0,listen(a,l){return t.lc=n.push(a,l||t.l)/2,()=>{let d=n.indexOf(a);~d&&(n.splice(d,2),--t.lc||t.off())}},notify(a,l){let d=!o.length;for(let s=0;s<n.length;s+=2)o.push(n[s],n[s+1],t.value,a,l);if(d){for(let s=0;s<o.length;s+=5){let h;for(let f=s+1;!h&&(f+=5)<o.length;)o[f]<o[s+1]&&(h=o.push(o[s],o[s+1],o[s+2],o[s+3],o[s+4]));h||o[s](o[s+2],o[s+3],o[s+4])}o.length=0}},off(){},set(a){let l=t.value;l!==a&&(t.value=a,t.notify(l))},subscribe(a,l){let d=t.listen(a,l);return a(t.value),d},value:e};return t};const c=u(1),m=u(0),g=u(0),p={status:"stopped",elapsed:0,slideElapsed:0,lastStarted:0},S=typeof localStorage<"u"&&Number(localStorage.getItem("slidastro-elapsed"))||0,r=u({...p,elapsed:S});function T(){const e=r.get();if(e.status==="running"){const i=Date.now(),n=i-e.lastStarted;r.set({...e,elapsed:e.elapsed+n,slideElapsed:0,lastStarted:i})}else r.set({...e,slideElapsed:0})}function y(e){if(e<1)return;const i=c.get(),n=Math.floor(e);i!==n&&(c.set(n),T())}function k(e){e<0||m.set(Math.floor(e))}function b(e){e<0||g.set(Math.floor(e))}function E(){const e=r.get();e.status!=="running"&&r.set({...e,status:"running",lastStarted:Date.now()})}function L(){const e=r.get();if(e.status!=="running")return;const n=Date.now()-e.lastStarted,t=e.elapsed+n,a=e.slideElapsed+n;r.set({...e,status:"paused",elapsed:t,slideElapsed:a,lastStarted:0}),typeof localStorage<"u"&&localStorage.setItem("slidastro-elapsed",String(t))}function R(){r.set(p),typeof localStorage<"u"&&localStorage.removeItem("slidastro-elapsed")}function v(e){r.set(e),typeof localStorage<"u"&&localStorage.setItem("slidastro-elapsed",String(e.elapsed))}const w="slidastro";function M(){let e=!1;const i={page:[c,y],clicks:[m,k],timer:[r,v]};if(typeof BroadcastChannel<"u"){const n=new BroadcastChannel(w);for(const[t,[a,l]]of Object.entries(i))a.listen(d=>{e||n.postMessage({type:t,value:d})});n.onmessage=t=>{const{type:a,value:l}=t.data;if(i[a]){e=!0;try{i[a][1](l)}finally{e=!1}}}}}const x={slides:[{filepath:"/Volumes/T7/repos/slidastro/tests/slides.md",index:0,start:0,contentStart:3,end:7,raw:`---
theme: test
---

# Slide 1
This should have a pinkish background.
`,contentRaw:`
# Slide 1
This should have a pinkish background.
`,content:`# Slide 1
This should have a pinkish background.`,frontmatter:{theme:"test"},frontmatterRaw:"theme: test",source:{filepath:"/Volumes/T7/repos/slidastro/tests/slides.md",index:0,start:0,contentStart:3,end:7,raw:`---
theme: test
---

# Slide 1
This should have a pinkish background.
`,contentRaw:`
# Slide 1
This should have a pinkish background.
`,content:`# Slide 1
This should have a pinkish background.`,frontmatter:{theme:"test"},frontmatterRaw:"theme: test"},contentHTML:`<h1>Slide 1</h1>
<p>This should have a pinkish background.</p>
`,slots:{default:`<h1>Slide 1</h1>
<p>This should have a pinkish background.</p>
`}},{filepath:"/Volumes/T7/repos/slidastro/tests/slides.md",index:1,start:8,contentStart:3,end:15,raw:`---
layout: ThemeLayout
---

# Slide 2
This should use the layout from the theme.
`,contentRaw:`
# Slide 2
This should use the layout from the theme.
`,content:`# Slide 2
This should use the layout from the theme.`,frontmatter:{layout:"ThemeLayout"},frontmatterRaw:"layout: ThemeLayout",source:{filepath:"/Volumes/T7/repos/slidastro/tests/slides.md",index:1,start:8,contentStart:3,end:15,raw:`---
layout: ThemeLayout
---

# Slide 2
This should use the layout from the theme.
`,contentRaw:`
# Slide 2
This should use the layout from the theme.
`,content:`# Slide 2
This should use the layout from the theme.`,frontmatter:{layout:"ThemeLayout"},frontmatterRaw:"layout: ThemeLayout"},contentHTML:`<h1>Slide 2</h1>
<p>This should use the layout from the theme.</p>
`,slots:{default:`<h1>Slide 2</h1>
<p>This should use the layout from the theme.</p>
`}}],config:{canvasWidth:980,canvasHeight:551}};export{c as $,k as a,r as b,E as c,x as d,m as e,b as f,M as i,L as p,R as r,y as s};
