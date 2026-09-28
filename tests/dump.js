global.window={};
const fs=require('fs');
require('/workspace/ai-roadmap/data/phases.js');
const files=fs.readdirSync('/workspace/ai-roadmap/data').filter(f=>/^(weeks-\d+|w\d+|anthropic|extras)\.js$/.test(f)).sort();
for (const f of files) require('/workspace/ai-roadmap/data/'+f);
window.ROADMAP.weeks.sort((a,b)=>a.id-b.id);
console.log(JSON.stringify(window.ROADMAP));
