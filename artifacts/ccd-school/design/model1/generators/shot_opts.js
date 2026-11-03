const { chromium } = require('playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const cat='file://'+process.cwd()+'/ccd-cat.png';
 for (const f of process.argv.slice(2)){
  let h=fs.readFileSync('project/'+f,'utf8').replace(/\/_blob\/6cb473e03d86e151b5e534529d518ad5/g,cat).replace(/\/_blob\/[0-9a-f]{32}/g,'file://'+process.cwd()+'/shots/synth.png').replace('<script src="./support.js"></script>','');
  fs.writeFileSync('shots/tmp.html',h);
  await p.goto('file://'+process.cwd()+'/shots/tmp.html'); await p.waitForTimeout(600);
  await p.screenshot({path:'shots/'+f.replace('.dc.html','.png')});
 }
 await b.close();
})();
