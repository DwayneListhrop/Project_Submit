import {cp,mkdir,readdir,readFile,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=new URL('../',import.meta.url),dest=new URL('../dist/',import.meta.url);
await rm(dest,{recursive:true,force:true});await mkdir(new URL('vendor/',dest),{recursive:true});
for(const [source,target] of [
 ['node_modules/pdfjs-dist/legacy/build/pdf.min.mjs','vendor/pdf.min.mjs'],
 ['node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs','vendor/pdf.worker.min.mjs'],
 ['node_modules/pdfjs-dist/cmaps','vendor/cmaps'],['node_modules/pdfjs-dist/standard_fonts','vendor/standard_fonts'],
 ['node_modules/tesseract.js/dist/tesseract.min.js','vendor/tesseract.min.js'],
 ['node_modules/tesseract.js/dist/worker.min.js','vendor/worker.min.js'],
 ['node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz','vendor/eng.traineddata.gz']])await cp(new URL(source,root),new URL(target,dest),{recursive:true});
await mkdir(new URL('vendor/core/',dest));for(const f of await readdir(new URL('node_modules/tesseract.js-core/',root)))if(f.endsWith('.wasm')||f.endsWith('.wasm.js'))await cp(new URL('node_modules/tesseract.js-core/'+f,root),new URL('vendor/core/'+f,dest));
await mkdir(new URL('licenses/',dest));
for(const [source,target] of [['node_modules/tesseract.js/LICENSE.md','tesseract-js.txt'],['node_modules/tesseract.js-core/LICENSE','tesseract-core.txt'],['node_modules/pdfjs-dist/LICENSE','pdfjs.txt'],['node_modules/tesseract.js/dist/tesseract.min.js.LICENSE.txt','tesseract-bundle.txt'],['node_modules/tesseract.js/dist/worker.min.js.LICENSE.txt','tesseract-worker.txt']])await cp(new URL(source,root),new URL('licenses/'+target,dest));
await writeFile(new URL('licenses/english-data.txt',dest),'English model from @tesseract.js-data/eng 1.0.0 (MIT package); upstream trained data: https://github.com/tesseract-ocr/tessdata_best (Apache-2.0). See bundled Apache license in tesseract-core.txt.\n');
for(const f of ['index.html','README.md','RELEASE_STATUS.md'])await cp(new URL(f,root),new URL(f,dest));
const manifest={};async function walk(dir,rel=''){for(const entry of await readdir(dir,{withFileTypes:true})){const name=path.posix.join(rel,entry.name),url=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())await walk(url,name);else manifest[name]=createHash('sha256').update(await readFile(url)).digest('hex')}}await walk(dest);await writeFile(new URL('SHA256SUMS.json',dest),JSON.stringify(manifest,null,2));
console.log(`Built ${Object.keys(manifest).length} files with local OCR/PDF dependencies and SHA-256 manifest.`);
