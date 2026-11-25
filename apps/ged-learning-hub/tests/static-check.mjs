import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const x=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const m=x.match(/<script>([\s\S]*?)<\/script>/);
if(!m)throw Error('Application script not found');
new Script(m[1]);
console.log('Application JavaScript parsed successfully.');
