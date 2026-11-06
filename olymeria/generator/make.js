// Usage: node make.js stills <quiz.json> | node make.js video <quiz.json> <sortie.mp4>
const {chromium}=require('playwright'),{spawn,execFileSync}=require('child_process'),fs=require('fs'),path=require('path');
const FPS=30,SCENES=[[0,3.5],[3.5,8.5],[8.5,13.3],[13.3,17],[17,20]],B=path.join(__dirname,'build');
const [mode,quizPath,outPath]=process.argv.slice(2);
function validate(q){const e=[];
  for(const k of ['date','question','options','correct','answer','subtitle','map','fact','caption','sources'])if(q[k]===undefined)e.push('champ manquant: '+k);
  if(q.options?.length!==4)e.push('il faut 4 réponses');
  if(!(q.correct>=0&&q.correct<4))e.push('correct doit valoir 0 à 3');
  if(q.correct===0||q.correct===undefined)console.warn('Attention: la bonne réponse est en A, varier sa position.');
  if(!q.map?.focus)e.push('map.focus manquant');
  if(!q.sources?.length)e.push('au moins une source requise');
  if(e.length)throw new Error(e.join('\n'));}
(async()=>{
  const quiz=JSON.parse(fs.readFileSync(quizPath,'utf8'));validate(quiz);
  fs.mkdirSync(B,{recursive:true});
  fs.writeFileSync(path.join(B,'quiz.js'),'window.QUIZ='+JSON.stringify(quiz)+';');
  fs.writeFileSync(path.join(B,'world.js'),'window.WORLD='+fs.readFileSync(path.join(__dirname,'node_modules/world-atlas/countries-50m.json'),'utf8')+';');
  const b=await chromium.launch({args:['--allow-file-access-from-files']});
  const pg=await b.newPage({viewport:{width:1080,height:1920}});
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+path.join(__dirname,'page.html'));
  await pg.evaluate(()=>window.ready);
  if(errs.length)throw new Error(errs.join('\n'));
  await pg.evaluate(()=>setT(16));
  const bad=await pg.evaluate(()=>overflow());
  if(bad.length)throw new Error('Mise en page:\n'+bad.join('\n'));
  if(mode==='stills'){
    for(const t of [0,6,8.8,12.8,15.8,18.5]){await pg.evaluate(t=>setT(t),t);await pg.screenshot({path:path.join(B,`still_${t}.jpg`),type:'jpeg',quality:90})}
    console.log('Images dans',B);await b.close();return;
  }
  for(let i=0;i<SCENES.length;i++){
    const [a,z]=SCENES[i],tmp=path.join(B,`scene${i}.tmp.mp4`);
    const f=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',''+FPS,'-c:v','mjpeg','-i','-','-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','-r',''+FPS,tmp],{stdio:['pipe','inherit','inherit']});
    const n=Math.round((z-a)*FPS);
    for(let k=0;k<n;k++){await pg.evaluate(t=>setT(t),a+k/FPS);const jpg=await pg.screenshot({type:'jpeg',quality:92});
      if(!f.stdin.write(jpg))await new Promise(r=>f.stdin.once('drain',r));}
    f.stdin.end();
    const code=await new Promise(r=>f.on('close',r));if(code!==0)throw new Error('ffmpeg '+code);
    fs.renameSync(tmp,path.join(B,`scene${i}.mp4`));
  }
  await b.close();
  if(errs.length)throw new Error(errs.join('\n'));
  fs.writeFileSync(path.join(B,'list.txt'),SCENES.map((_,i)=>`file 'scene${i}.mp4'`).join('\n'));
  const semi=[...quiz.date].reduce((s,c)=>s+c.charCodeAt(0),0)%5-2;
  execFileSync('python3',[path.join(__dirname,'audio.py'),path.join(B,'sound.wav'),''+semi],{stdio:'inherit'});
  execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',path.join(B,'list.txt'),'-c','copy',path.join(B,'joined.mp4')]);
  const tmp=path.join(B,'final.tmp.mp4');
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',path.join(B,'joined.mp4'),'-i',path.join(B,'sound.wav'),'-map','0:v','-map','1:a','-c:v','copy','-af','loudnorm=I=-14:TP=-1.5:LRA=11','-ar','44100','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',tmp]);
  fs.mkdirSync(path.dirname(path.resolve(outPath)),{recursive:true});fs.renameSync(tmp,outPath);
  console.log('Vidéo:',outPath);
})().catch(e=>{console.error(e.message);process.exit(1)});
