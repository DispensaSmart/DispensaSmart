import{initializeApp}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import{getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,signOut,updateProfile,connectAuthEmulator}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import{initializeFirestore,persistentLocalCache,persistentMultipleTabManager,connectFirestoreEmulator,doc,getDoc,setDoc,updateDoc,deleteDoc,addDoc,collection,onSnapshot,writeBatch,arrayUnion,arrayRemove}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import{getAI,getGenerativeModel,GoogleAIBackend,Schema}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-ai.js";
import{firebaseConfig}from"./config.js";

/*DATA*/

// colazioni e prodotti per la colazione
[["lat","Latte","pro",64,3.3,4.8,1000,250],["mar","Marmellata","snk",250,.4,60,0,30],["fet","Fette biscottate","car",410,11,72,0,40],["fgf","Fette biscottate senza glutine","car",400,5,80,0,40]].forEach(a=>C.push({id:a[0],n:a[1],c:a[2],k:a[3],p:a[4],h:a[5],min:a[6],st:a[7]}));
GL.push("fet");SUB.fet="fgf";Object.assign(KW,{lat:/\blatte\b/,mar:/marmellat/,fet:/fette biscottate/,fgf:/(?!)/});MT.b="Colazione";
[["b1","Latte e biscotti","b",3,[["lat",250],["bis",40]]],["b2","Yogurt con avena e banana","b",5,[["yog",150],["avn",40],["ban",120]]],["b3","Pane e marmellata con latte","b",5,[["pan",60],["mar",30],["lat",200]]],["b4","Porridge con mela e mandorle","b",10,[["avn",50],["lat",200],["mel",150],["man",15]]],["b5","Uova strapazzate e pane tostato","b",10,[["uov",120],["pan",60]]],["b6","Fette biscottate, marmellata e yogurt","b",3,[["fet",40],["mar",30],["yog",150]]],["b7","Yogurt con mela e mandorle","b",4,[["yog",170],["mel",150],["man",20]]],["b8","Frullato di banana al cacao","b",5,[["lat",250],["ban",120],["cio",10]]]].forEach(a=>RC.push({id:a[0],n:a[1],m:a[2],t:a[3],g:a[4]}));
Object.assign(ST,{b1:"Scalda il latte e servilo con i biscotti.",b2:"Versa lo yogurt in una ciotola, aggiungi avena e banana a rondelle.",b3:"Tosta il pane, spalma la marmellata e servi con il latte caldo o freddo.",b4:"Cuoci l’avena nel latte 5 minuti mescolando, aggiungi mela a cubetti e mandorle.",b5:"Sbatti le uova e cuocile in padella mescolando 3 minuti. Servi con il pane tostato.",b6:"Spalma la marmellata sulle fette biscottate e servi con lo yogurt.",b7:"Taglia la mela a cubetti e mescolala con lo yogurt e le mandorle.",b8:"Frulla latte, banana e cioccolato fondente grattugiato per un minuto."});

Object.assign(CAT,{bev:["Bevande","🥤"],alt:["Condimenti e altro","🧂"]});
const EM={lat:"🥛",mar:"🍓",fet:"🍞",fgf:"🍞",pol:"🍗",uov:"🥚",ton:"🐟",len:"🫘",yog:"🥛",sal:"🍣",tof:"🧈",par:"🧀",pas:"🍝",ris:"🍚",pan:"🍞",avn:"🥣",pat:"🥔",vrs:"🥦",pom:"🍅",zuc:"🥒",ban:"🍌",mel:"🍎",evo:"🫒",man:"🌰",bis:"🍪",cio:"🍫",cec:"🫘",fag:"🫘",mzz:"🧀",pss:"🥫",cip:"🧅",car:"🥕",spi:"🥬",pep:"🫑",cus:"🍚",psg:"🍝",pgf:"🍞",agf:"🥣",qui:"🌾",bgf:"🍪"};
const COL=["#ff6b4a","#8b5cf6","#14a46c","#f59e0b","#0ea5e9","#ec4899","#64748b"];
const GSUB={...SUB,cus:"qui"},GFREE=Object.values(GSUB);
// Fabbisogno di riferimento per i minori (kcal/giorno, attività moderata): valori indicativi per fascia d'età
const KID={M:[[3,1000],[6,1400],[10,1800],[14,2300],[17,2800]],F:[[3,950],[6,1300],[10,1650],[14,2050],[17,2150]]};
const REF=2200;
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nf=(n,d=1)=>n.toLocaleString("it-IT",{maximumFractionDigits:d});
// campi letti da Gemini → chiave salvata nel prodotto, etichetta
const AIF=[["peso_g","g","Peso g"],["kcal","k","kcal"],["proteine","p","Proteine"],["carboidrati","h","Carboidrati"],["zuccheri","z","di cui zuccheri"],["grassi","f","Grassi"],["grassi_saturi","fs","di cui saturi"],["fibre","fib","Fibre"],["sale","sale","Sale"],["glutine","gl","Glutine"],["allergeni","alg","Allergeni"],["categoria","cat","Categoria"]];
const NUT=AIF.slice(1,9);
const fq=(c,q)=>c=="uov"?Math.max(1,Math.round(q/60))+(Math.round(q/60)==1?" uovo":" uova"):q>=1000?nf(q/1000,2)+" kg":Math.round(q)+" g";
const r5=q=>Math.max(5,Math.round(q/5)*5);

const emu=new URLSearchParams(location.search).has("emu");
let auth=null,db=null,aiModel=null;
if(firebaseConfig||emu){
  // in prova (?emu) si usa sempre il progetto finto, mai quello vero
  const app=initializeApp(emu||!firebaseConfig?{apiKey:"demo",projectId:"demo-dispensa",authDomain:"localhost"}:firebaseConfig);
  auth=getAuth(app);
  db=initializeFirestore(app,emu?{}:{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});
  try{aiModel=getGenerativeModel(getAI(app,{backend:new GoogleAIBackend()}),{model:"gemini-2.5-flash",generationConfig:{responseMimeType:"application/json",responseSchema:AISCHEMA()}})}catch(e){console.warn("AI non disponibile",e)}
  if(emu){connectAuthEmulator(auth,"http://127.0.0.1:9099",{disableWarnings:true});connectFirestoreEmulator(db,"127.0.0.1",8080)}
}

let U=null,UD=null,H=null,S={items:[],shop:[],waste:[],cooked:[],prof:[],plan:[],products:[],used:[],buys:[]},subs=[],hsub=null,usub=null;
let shot=null,wk=0,pmode="disp",view=db?"loading":"setup",am="login",amsg="",tab="home",lf="all",ord="cat",vmsg="",ri={p:0,c:0},mx=99,sheet=false,editP=null,busy=false,pe=null;

/* ---------- persone e fabbisogno ---------- */
function kcal(p){if(+p.eta<18){const t=KID[p.sesso=="F"?"F":"M"];return(t.find(x=>+p.eta<=x[0])||t[t.length-1])[1]}
  return(10*p.peso+6.25*p.alt-5*p.eta+(p.sesso=="F"?-161:5))*AT[p.att??2][1]*OB[p.ob||"mant"][1]}
const prot=p=>+p.eta<18?+p.peso:OB[p.ob||"mant"][2]*p.peso;
function fam(){const P=S.prof;let k=0,pr=0,F=0,Fg=0;P.forEach(p=>{const f=kcal(p)/REF;k+=kcal(p);pr+=prot(p);F+=f;if(p.sg)Fg+=f});
  if(!P.length){k=REF;pr=90;F=1}return{k,p:pr,F,Fg,Fn:F-Fg,n:P.length||1,sg:P.filter(p=>p.sg)}}
const isGL=id=>GL.includes(id)||!!K(id)?.gl;
// quanto pesa una soglia della spesa: i prodotti con glutine servono solo a chi lo mangia, i sostituti solo a chi è senza glutine
function scale(id,f){return isGL(id)?f.Fn:GFREE.includes(id)?f.Fg:f.F}

/* ---------- dispensa ---------- */
// prezzi medi stimati in euro al kg, usati quando lo scontrino non ha il prezzo
const PZ={pol:9,uov:4.5,ton:14,len:3.5,yog:5,sal:22,tof:10,par:22,pas:2.2,ris:2.5,pan:4,avn:3,pat:1.5,vrs:3.5,pom:2.5,zuc:2.2,ban:1.8,mel:2,evo:9,man:15,bis:4.5,cio:12,cec:2.5,fag:2.5,mzz:10,pss:1.8,cip:1.5,car:1.5,spi:4,pep:3,cus:3.5,psg:4.5,pgf:10,agf:7,qui:9,bgf:9,lat:1.5,mar:6,fet:5,fgf:11};
const CPZ={pro:12,car:3,veg:2.5,gra:10,snk:7,bev:1.5,alt:5};
function ppg(c){const k=K(c);if(!k)return .005;if(k.u){const p=S.products.find(x=>x.id==k.pid);if(p?.eur&&p.g)return p.eur/p.g;return(PZ[k.link]||CPZ[k.c]||5)/1000}return(PZ[c]||CPZ[k.c]||5)/1000}
const val=(i,q)=>q*(i.pg||ppg(i.c));
const eu=n=>n.toLocaleString("it-IT",{style:"currency",currency:"EUR"});
// consumato: se scadeva entro 3 giorni conta come salvato dallo spreco
const useRec=(b,i,q)=>b.set(doc(col("used")),{c:i.c,q,d:iso(0),eur:+val(i,q).toFixed(2),s:!!(i.e&&D(i.e)<=3)});
const has=(i,id)=>i.c==id||K(i.c)?.link==id;
const tot=id=>S.items.filter(i=>has(i,id)).reduce((a,i)=>a+i.q,0);
const byExp=(a,b)=>(a.e||"9")>(b.e||"9")?1:-1;
function take(b,c,q,bin){let r=q,w=0;S.items.filter(i=>has(i,c)).sort(byExp).forEach(i=>{const k=Math.min(i.q,r);if(k<=0)return;r-=k;w+=k;i.q-=k;
  if(i.q<=0)b.delete(dref("items",i.id));else b.update(dref("items",i.id),{q:i.q});if(bin)b.set(doc(col("waste")),{c:i.c,q:k,d:iso(0),eur:+val(i,k).toFixed(2)});else useRec(b,i,k)});return w}
function aut(f){const s={k:0,p:0,v:0};S.items.forEach(i=>{const c=K(i.c),q=i.q/100;s.k+=q*c.k;s.p+=q*c.p;if(c.c=="veg")s.v+=i.q});return{k:s.k/f.k,p:s.p/f.p,v:s.v/(500*f.F)}}
function adv(f,a){const r=[];if(a.p<3)r.push(["r","Proteine per meno di 3 giorni: aggiungi pollo, uova, legumi o tonno."]);else if(a.p<5)r.push(["y",`Proteine per ${fm(a.p)}: mettile nella prossima spesa.`]);
  if(a.v<4)r.push(["y",`Poca verdura e frutta: alla famiglia ne servono circa ${nf(500*f.F/1000)} kg al giorno.`]);
  const kc=i=>i.q/100*K(i.c).k,tk=S.items.reduce((s,i)=>s+kc(i),0),sn=S.items.filter(i=>K(i.c).c=="snk").reduce((s,i)=>s+kc(i),0);
  if(tk&&sn/tk>.15)r.push(["y","Gli snack pesano troppo sulla dispensa: meglio frutta secca o yogurt."]);
  if(!r.length)r.push(["g","Dispensa in ottima forma: nessuna emergenza."]);return r}

/* ---------- ricette per la famiglia ---------- */
function ing(r){const f=fam(),m={},put=(id,q)=>{if(q>0.001)m[id]=(m[id]||0)+q};
  r.g.forEach(([id,q])=>{if(isGL(id)&&f.Fg>0){put(id,q*f.Fn);put(GSUB[id],q*f.Fg)}else put(id,q*f.F)});
  return Object.entries(m).map(([id,q])=>[id,r5(q)])}
const miss=r=>ing(r).filter(x=>tot(x[0])<x[1]);
const urg=c=>{const L=S.items.filter(i=>has(i,c)&&i.e).map(i=>D(i.e));return L.length?Math.min(...L):null};
function sc(r){let s=0;r.g.forEach(x=>{const d=urg(x[0]);if(d!=null)s+=d<=1?4:d<=3?3:d<=7?1:0});const sn=Math.min(99,...S.cooked.filter(c=>c.r==r.id).map(c=>-D(c.d)));return s-(sn<=3?10:sn<=7?5:0)}
function sugg(m,skip){const L=RC.filter(r=>r.m.includes(m)&&r.id!=skip&&r.t<=mx&&!miss(r).length).sort((a,b)=>sc(b)-sc(a));return L.length?L[ri[m]%L.length]:null}
const porz=f=>`${f.n} ${f.n==1?"persona":"persone"} · ${nf(Math.round(f.F*2)/2)} porzioni`;



/* ---------- prodotti propri letti da Gemini ---------- */
// i prodotti della famiglia entrano nel catalogo come "u_<id>": se sono collegati a un prodotto base (link) contano per ricette e scorte
function syncProducts(){for(let i=C.length-1;i>=0;i--)if(C[i].u)C.splice(i,1);
  S.products.forEach(p=>{const b=p.link&&C.find(c=>c.id==p.link);C.push({id:"u_"+p.id,u:1,pid:p.id,n:p.n,brand:p.brand||"",c:CAT[p.cat]?p.cat:b?.c||"alt",sub:p.sub||"",link:p.link||null,k:+p.k||b?.k||0,p:+p.p||b?.p||0,h:+p.h||b?.h||0,f:p.f,fs:p.fs,z:p.z,fib:p.fib,sale:p.sale,gl:!!p.gl,alg:p.alg||[],unc:p.unc||[],min:0,st:+p.g||b?.st||100,loc:p.loc});
    KW["u_"+p.id]=/(?!)/;EM["u_"+p.id]=b?EM[b.id]:CAT[p.cat]?.[1]||"🛒"})}
const fam2=id=>{const k=K(id);return k?.link||id};
const AILIST=()=>C.filter(c=>!c.u).map(c=>c.id+"="+c.n).join(", ");
function AISCHEMA(){const n=Schema.number(),t=Schema.string();
  return Schema.object({properties:{prodotti:Schema.array({items:Schema.object({properties:{nome:t,marca:t,categoria:Schema.enumString({enum:Object.keys({pro:1,car:1,veg:1,gra:1,snk:1,bev:1,alt:1})}),sottocategoria:t,catalogo:t,peso_g:n,confezioni:n,scadenza:t,conservazione:Schema.enumString({enum:["dis","fri","con"]}),kcal:n,proteine:n,carboidrati:n,zuccheri:n,grassi:n,grassi_saturi:n,fibre:n,sale:n,glutine:Schema.boolean(),allergeni:Schema.array({items:t}),prezzo:n,incerti:Schema.array({items:Schema.enumString({enum:AIF.map(f=>f[0])})})},
    optionalProperties:["prezzo","incerti","marca","sottocategoria","catalogo","scadenza","kcal","proteine","carboidrati","zuccheri","grassi","grassi_saturi","fibre","sale","allergeni","confezioni"]})})}})}
const AIPROMPT=(m,nm)=>`Sei l'assistente di una dispensa di casa in Italia. ${m=="lab"?`La foto mostra l'etichetta (tabella nutrizionale, ingredienti o confezione) del prodotto «${nm}»: restituisci UN solo prodotto con tutto quello che leggi. Nel campo incerti metti solo i valori che non riesci a leggere dalla foto.`:m=="rec"?"La foto è uno SCONTRINO della spesa italiano. Leggilo riga per riga dall'alto in basso senza saltarne nessuna: ogni riga con un prezzo è un prodotto. Ignora intestazione, totale, subtotale, IVA, resto, pagamento, punti fedeltà e sacchetti. Le righe tipo "2 x 1,29" o "0,512 kg x 2,49 €/kg" si riferiscono al prodotto sopra. Elenca i prodotti alimentari e per la casa, interpretando le abbreviazioni (es. "LATTE PS GRAN 1L" = Latte parzialmente scremato Granarolo 1 L, "PASTA BAR SPAGH 5" = Spaghetti n.5 Barilla), con il numero di confezioni e il prezzo in euro di UNA confezione (se la riga dice 2 x 1,29 il prezzo è 1.29; considera gli sconti scritti sotto la riga). Non inventare la scadenza.":"La foto mostra uno o più PRODOTTI confezionati: leggi l'etichetta."}
Per ogni prodotto restituisci: nome chiaro in italiano, marca, categoria (pro=proteine e latticini, car=carboidrati, veg=verdura e frutta, gra=grassi e frutta secca, snk=snack e dolci, bev=bevande, alt=condimenti e altro), sottocategoria breve (es. "Pasta secca", "Formaggi", "Legumi in scatola"), peso netto in grammi di UNA confezione (per i liquidi 1 ml = 1 g), scadenza in formato AAAA-MM-GG solo se è leggibile, conservazione dopo l'acquisto (dis=dispensa, fri=frigo, con=freezer), valori nutrizionali per 100 g, glutine true se lo contiene o potrebbe contenerlo, allergeni.
Compila SEMPRE tutti i valori nutrizionali: se non sono leggibili (sempre, nel caso dello scontrino) usa i valori tipici di quel prodotto, della marca se la conosci. Fai lo stesso con il peso della confezione.
Nel campo incerti elenca i nomi dei campi che hai stimato o di cui non sei sicuro (es. ["kcal","grassi","peso_g"]): verranno evidenziati per farli controllare. Lascia incerti vuoto solo se hai letto tutto dall'etichetta.
Nel campo catalogo metti l'id del prodotto base più simile tra questi, oppure stringa vuota se nessuno è adatto: ${AILIST()}`;
async function aiRead(file,m,nm){const b64=await shrink(file,m=="rec"?3200:2000);
  if(window.__mockAI)return window.__mockAI(m,nm);
  if(!aiModel)throw new Error("noai");
  const r=await aiModel.generateContent([AIPROMPT(m,nm),{inlineData:{mimeType:"image/jpeg",data:b64}}]);return JSON.parse(r.response.text()).prodotti||[]}
// riduce la foto (scontrini più grandi: il testo è piccolo e lungo) per inviare meno dati
function shrink(file,mx=2000){return new Promise((ok,ko)=>{const im=new Image();im.onload=()=>{const k=Math.min(1,mx/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=im.width*k;cv.height=im.height*k;cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);URL.revokeObjectURL(im.src);ok(cv.toDataURL("image/jpeg",.9).split(",")[1])};im.onerror=ko;im.src=URL.createObjectURL(file)})}
// unisce quanto letto dalla foto dell'etichetta: i valori letti sostituiscono le stime e tolgono il giallo
function mergeLab(r,set,unc){const got=[];AIF.forEach(([f])=>{const v=r[f];if(v!=null&&v!==""&&!(Array.isArray(v)&&!v.length&&f!="allergeni")){set(f,v);got.push(f)}});
  if(okDate(r.scadenza))set("scadenza",r.scadenza);return[...unc.filter(f=>!got.includes(f)),...(r.incerti||[]).filter(f=>got.includes(f))]}
async function readLab(file,who){const nm=who=="pe"?pe.v.n:shot.list[who].nome,box=who=="pe"?pe:shot.list[who];box.lb=true;render();
  try{const r=(await aiRead(file,"lab",nm))[0];if(!r)throw 0;
    if(who=="pe"){const map=Object.fromEntries(AIF.map(f=>[f[0],f[1]]));
      const u=mergeLab(r,(f,v)=>{if(f=="scadenza")pe.e=v;else pe.v[map[f]]=f=="allergeni"?v.join(", "):v},pe.unc.map(c=>AIF.find(f=>f[1]==c)?.[0]).filter(Boolean));
      pe.unc=u.map(f=>map[f]);pe.msg="Valori aggiornati dall'etichetta."}
    else{const x=shot.list[who];x.incerti=mergeLab(r,(f,v)=>x[f]=v,x.incerti||[]);x.msg="Valori aggiornati dall'etichetta."}}
  catch(e){console.error(e);box.msg="Non riesco a leggere l'etichetta: riprova più vicino e con più luce."}
  box.lb=false;render()}
const labBtn=(who,b)=>b.lb?`<p class="mu">📷 Leggo l'etichetta…</p>`:`<label class="btn o cam lab">📷 Correggi con foto dell'etichetta<input type="file" accept="image/*" capture="environment" data-lab="${who}" hidden></label>${b.msg?`<p class="mu">${esc(b.msg)}</p>`:""}`;
function okDate(s){return/^\d{4}-\d{2}-\d{2}$/.test(s||"")?s:""}
async function saveShot(){const sel=shot.list.filter(x=>x.on);if(!sel.length)return;const w=writeBatch(db);let tot=0;
  sel.forEach(x=>{const eur=+x.prezzo>0?+(+x.prezzo).toFixed(2):null;let pid=S.products.find(p=>p.n.toLowerCase()==x.nome.toLowerCase()&&(p.brand||"")==(x.marca||""))?.id;if(pid&&eur)w.update(dref("products",pid),{eur});
    if(!pid){const r=doc(collection(db,"households",H.id,"products"));pid=r.id;const cat=x.categoria||"alt",link=C.find(c=>!c.u&&c.id==x.catalogo)?x.catalogo:null;
      w.set(r,{n:x.nome,brand:x.marca||"",cat,sub:x.sottocategoria||"",link,g:Math.round(+x.peso_g)||0,k:+x.kcal||0,p:+x.proteine||0,h:+x.carboidrati||0,z:x.zuccheri??null,f:x.grassi??null,fs:x.grassi_saturi??null,fib:x.fibre??null,sale:x.sale??null,gl:!!x.glutine,alg:x.allergeni||[],loc:x.conservazione||"dis",unc:AIF.filter(f=>(x.incerti||[]).includes(f[0])).map(f=>f[1]),eur,t:Date.now()})}
    const n=Math.max(1,Math.round(+x.confezioni||1)),q=(Math.round(+x.peso_g)||100)*n;x.nome=x.nome||"Prodotto";
    const g=Math.round(+x.peso_g)||100;if(eur)tot+=eur*n;
    w.set(doc(col("items")),{c:"u_"+pid,q,e:okDate(x.scadenza)||null,l:x.conservazione||"dis",...(eur?{pg:+(eur/g).toFixed(5)}:{})})});
  if(tot)w.set(doc(col("buys")),{d:iso(0),eur:+tot.toFixed(2),n:sel.length,by:myName()});
  await w.commit();vmsg=`Aggiunti ${sel.length} prodotti alla dispensa.`;shot=null}
function vShot(){if(shot.busy)return`<div class="scrim"></div><div class="sheet"><div class="grab"></div><h2>Leggo la foto…</h2><div class="logo spin" style="margin:20px auto">📷</div><p class="mu" style="text-align:center">Gemini sta leggendo ${shot.m=="rec"?"lo scontrino":"l’etichetta"}.</p></div>`;
  const L=shot.list;return`<div class="scrim" data-a="shotx"></div><div class="sheet"><div class="grab"></div><h2>${L.length?`Ho trovato ${L.length} ${L.length==1?"prodotto":"prodotti"}`:"Non ho trovato prodotti"}</h2><p class="mu">Controlla e correggi prima di aggiungere.${L.some(x=>x.incerti?.length)?' <span class="unc">In giallo</span> i valori stimati da Gemini.':""}</p>
  ${L.map((x,i)=>`<div class="pf ai" data-ai="${i}"><label class="ck2"><input type="checkbox" data-aif="on" ${x.on?"checked":""}> <b>${esc(x.nome)}</b>${x.marca?` · ${esc(x.marca)}`:""}</label>
  <div class="mu">${esc(CAT[x.categoria]?.[0]||"Altro")}${x.sottocategoria?" › "+esc(x.sottocategoria):""}${x.catalogo&&K(x.catalogo)?" · conta come "+K(x.catalogo).n.toLowerCase():""}${x.glutine?" · 🌾 glutine":""}</div>
  <div class="three"><label class="${uc(x,"peso_g")}">Peso g<input data-aif="peso_g" type="number" inputmode="numeric" value="${esc(x.peso_g||"")}"></label><label>Pezzi<input data-aif="confezioni" type="number" inputmode="numeric" value="${esc(x.confezioni||1)}"></label><label>Scadenza<input data-aif="scadenza" type="date" value="${esc(okDate(x.scadenza))}"></label></div>
  ${shot.m=="rec"||x.prezzo!=null?`<label class="pz">Prezzo € a confezione<input data-aif="prezzo" type="number" inputmode="decimal" step="0.01" value="${esc(x.prezzo??"")}"></label>`:""}
  <details class="nd" ${x.incerti?.some(f=>NUT.some(n=>n[0]==f))?"open":""}><summary>Valori per 100 g</summary><div class="nin">${NUT.map(([f,,l])=>`<label class="${uc(x,f)}">${l}<input data-aif="${f}" type="number" inputmode="decimal" step="any" value="${esc(x[f]??"")}"></label>`).join("")}</div></details>
  <div class="mu ${uc(x,"allergeni")}">${x.allergeni?.length?"Allergeni: "+esc(x.allergeni.join(", ")):"Nessun allergene indicato"}</div>${x.incerti?.length||x.msg||x.lb?labBtn(i,x):""}</div>`).join("")}
  ${L.length?`<button class="btn" data-a="shotok">Aggiungi ${L.filter(x=>x.on).length} alla dispensa</button>`:""}<button class="btn o" data-a="shotx">Annulla</button></div>`}
const uc=(x,f)=>x.incerti?.includes(f)?"unc":"";
const nv=(v,u="g")=>v==null||v===""?"–":nf(+v)+" "+u;
const nutRow=(k,p,h,z,f,fs,fib,sa,u=[])=>[["k",k,"🔥",""],["p",p,"Proteine"],["h",h,"Carboidrati"],["z",z,"di cui zuccheri"],["f",f,"Grassi"],["fs",fs,"di cui saturi"],["fib",fib,"Fibre"],["sale",sa,"Sale"]].map(([c,v,l,x])=>`<span class="${u.includes(c)?"unc":""}">${l} ${nv(v,x==""?"kcal":"g")}</span>`).join("");
/* ---------- piano pasti ---------- */
const SL=[["b","Colazione","☕"],["p","Pranzo","🍝"],["c","Cena","🌙"]];
const GG=["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
function monday(o){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7+7*o);return d}
const isoD=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const weekDays=o=>{const m=monday(o);return[...Array(7)].map((_,i)=>{const d=new Date(m);d.setDate(m.getDate()+i);return isoD(d)})};
const planDoc=o=>S.plan.find(p=>p.id==isoD(monday(o)))||{m:{}};
const slot=(o,d,k)=>planDoc(o).m?.[d]?.[k]||"";
const fits=(r,k)=>r.m.includes(k);
// riempie i pasti vuoti della settimana: "disp" usa prima la dispensa e ciò che scade, "var" alterna i piatti principali
function fillWeek(o,mode){const days=weekDays(o),today=iso(0),stock={},used={},out={};S.items.forEach(i=>stock[i.c]=(stock[i.c]||0)+i.q);
  let last=[];
  days.forEach((d,di)=>{if(d<today)return;SL.forEach(([k])=>{const cur=slot(o,d,k);if(cur){if(cur!="x"){used[cur]=(used[cur]||0)+1;last.push(RC.find(r=>r.id==cur)?.g[0][0])}return}
    const C2=RC.filter(r=>fits(r,k)).map(r=>{const g=ing(r);let cov=0,tq=0,urgB=0;g.forEach(([id,q])=>{tq+=q;cov+=Math.min(q,Math.max(0,stock[id]||0));const u=urg(id);if(u!=null&&u-di<=3&&u-di>=0)urgB+=1});
      const main=r.g[0][0],rp=(used[r.id]||0)*(mode=="var"?8:3)+(last.slice(-2).includes(main)?(mode=="var"?4:1):0);
      const sc=mode=="var"?Math.random()*2-rp+cov/tq:cov/tq*6+urgB*1.5-rp+Math.random()*.5;return{r,g,sc}}).sort((a,b)=>b.sc-a.sc);
    const best=C2[0];if(!best)return;out[d]=out[d]||{};out[d][k]=best.r.id;used[best.r.id]=(used[best.r.id]||0)+1;last.push(best.r.g[0][0]);best.g.forEach(([id,q])=>stock[id]=(stock[id]||0)-q)})});
  return out}
// ingredienti che mancano per i pasti da oggi in poi, tolto quello che è già in dispensa o nella spesa
function planNeeds(o){const need={},today=iso(0);weekDays(o).forEach(d=>{if(d<today)return;SL.forEach(([k])=>{const id=slot(o,d,k);const r=RC.find(x=>x.id==id);if(r)ing(r).forEach(([c,q])=>need[c]=(need[c]||0)+q)})});
  return Object.entries(need).map(([c,q])=>{const inShop=S.shop.filter(s=>s.c==c&&!s.done).reduce((a,s)=>a+(s.q||K(c).st),0);return{c,q:Math.ceil((q-tot(c)-inShop)/K(c).st)*K(c).st}}).filter(x=>x.q>0)}
/* ---------- firestore ---------- */
const col=n=>collection(db,"households",H.id,n);
const dref=(n,id)=>doc(db,"households",H.id,n,id);
const me=()=>S.prof.find(p=>p.uid==U.uid);
const myName=()=>me()?.name||UD?.name||"Io";
function code(){const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";const r=crypto.getRandomValues(new Uint32Array(6));r.forEach(x=>s+=a[x%a.length]);return s}
function stopAll(){subs.forEach(f=>f());subs=[];if(hsub){hsub();hsub=null}S={items:[],shop:[],waste:[],cooked:[],prof:[],plan:[],products:[],used:[],buys:[]};syncProducts();H=null}
function listenHH(hid,tries=0){if(H&&H.id==hid&&!tries)return;stopAll();H={id:hid};
  hsub=onSnapshot(doc(db,"households",hid),s=>{if(!s.exists()){view="nohh";render();return}H={id:hid,...s.data()};if(!H.members.includes(U.uid)){view="nohh";render();return}view="app";render()},()=>{stopAll();if(tries<3&&UD?.hh==hid)setTimeout(()=>listenHH(hid,tries+1),1500);else{view="nohh";render()}});
  ["items","shop","waste","cooked","prof","plan","products","used","buys"].forEach(n=>subs.push(onSnapshot(collection(db,"households",hid,n==="prof"?"profiles":n),q=>{S[n]=q.docs.map(d=>({id:d.id,...d.data()}));if(n=="shop")S.shop.sort((a,b)=>(a.t||0)-(b.t||0));if(n=="prof")S.prof.sort((a,b)=>(a.o||0)-(b.o||0));if(n=="products")syncProducts();render()},()=>{})))}
if(auth)onAuthStateChanged(auth,u=>{U=u;if(usub){usub();usub=null}stopAll();UD=null;
  if(!u){view="auth";render();return}
  view="loading";render();
  usub=onSnapshot(doc(db,"users",u.uid),s=>{UD=s.exists()?s.data():null;if(UD?.hh)listenHH(UD.hh);else{stopAll();view="nohh";render()}},()=>{view="nohh";render()})});

async function createHH(name){const hid=doc(collection(db,"households")).id,c=code(),b=writeBatch(db),nm=U.displayName||"Io";
  b.set(doc(db,"households",hid),{name:name||"La mia famiglia",owner:U.uid,members:[U.uid],code:c});
  b.set(doc(db,"invites",c),{hh:hid});
  await b.commit();
  await setDoc(doc(db,"households",hid,"profiles",U.uid),{name:nm,uid:U.uid,sesso:"M",eta:35,peso:70,alt:170,att:2,ob:"mant",sg:false,color:COL[0],o:Date.now()});
  // l'utente punta alla famiglia solo quando ne fa già parte, così l'ascolto in tempo reale non viene rifiutato
  await setDoc(doc(db,"users",U.uid),{name:nm,hh:hid,email:U.email})}
async function joinHH(c){c=c.trim().toUpperCase();const inv=await getDoc(doc(db,"invites",c));if(!inv.exists())throw new Error("code");const hid=inv.data().hh,nm=U.displayName||"Io";
  await setDoc(doc(db,"users",U.uid),{name:nm,hh:null,join:c,email:U.email});
  await updateDoc(doc(db,"households",hid),{members:arrayUnion(U.uid)});
  await setDoc(doc(db,"households",hid,"profiles",U.uid),{name:nm,uid:U.uid,sesso:"M",eta:35,peso:70,alt:170,att:2,ob:"mant",sg:false,color:COL[Math.floor(Math.random()*COL.length)],o:Date.now()});
  await setDoc(doc(db,"users",U.uid),{name:nm,hh:hid,join:c,email:U.email})}
async function leaveHH(){const hid=H.id;await deleteDoc(doc(db,"households",hid,"profiles",U.uid)).catch(()=>{});await updateDoc(doc(db,"households",hid),{members:arrayRemove(U.uid)});await setDoc(doc(db,"users",U.uid),{name:UD.name,hh:null,email:U.email})}
async function newCode(){const c=code(),b=writeBatch(db);b.set(doc(db,"invites",c),{hh:H.id});if(H.code)b.delete(doc(db,"invites",H.code));b.update(doc(db,"households",H.id),{code:c});await b.commit()}
function demoItems(){return[["pol",600,2],["uov",360,9],["ton",160,300],["len",500,400],["yog",250,3],["pas",1000,300],["ris",500,300],["pan",400,1],["avn",500,200],["vrs",500,120],["pom",300,4],["ban",360,2],["mel",600,7],["evo",500,300],["man",150,150],["bis",400,60],["cio",100,90],["cec",480,200],["pss",700,250],["cip",400,20],["car",500,10],["spi",300,3],["mzz",250,5],["psg",500,300],["pgf",400,4],["agf",300,200]].map(a=>({c:a[0],q:a[1],e:iso(a[2]),l:dl(a[0])}))}
function oldData(){try{const r=localStorage.getItem("dispensa-smart");return r?JSON.parse(r):null}catch(e){return null}}
async function importItems(L,extra){const b=writeBatch(db);L.slice(0,400).forEach(i=>b.set(doc(col("items")),{c:i.c,q:i.q,e:i.e||null,l:i.l||dl(i.c)}));if(extra)extra(b);await b.commit()}

/* ---------- dettato ---------- */
function qty(s,c){const m=s.match(/\b(\d+(?:[.,]\d+)?|mezz[oa]|uno|una|un|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|dodici)\b\s*(kg|chil\w*|etti|etto|grammi|gr?)?\b/);if(!m)return null;const n=W[m[1]]??parseFloat(m[1].replace(",","."));const u=m[2]||"";return n*(/^(kg|chil)/.test(u)?1000:/^ett/.test(u)?100:u?1:/pacc/.test(s)?500:c.st)}
// ogni pezzo della frase ha il suo verbo; se manca vale quello del pezzo prima ("ho mangiato 2 uova e il riso")
function verb(t){return/compr|aggiung|acquist|\bpres[oi]\b/.test(t)?"add":/butt/.test(t)?"bin":/mang|usat|consum|finit|cucinat|cott[oi]/.test(t)?"out":null}
function say(t){t=(t||"").toLowerCase();let v=verb(t);const log=[];
  if(!v)return"Non ho capito: prova con “ho comprato 6 uova” oppure “ho finito il riso”.";
  const b=writeBatch(db);v=null;
  t.split(/,|\be\b/).forEach(sg=>{v=verb(sg)||v;let c=C.find(c=>KW[c.id].test(sg));if(!c||!v)return;if(SUB[c.id]&&/senza glutine|gluten free/.test(sg))c=K(SUB[c.id]);let q=qty(sg,c);
    if(v=="add"){q=Math.round(q??c.st);b.set(doc(col("items")),{c:c.id,q,e:null,l:dl(c.id)});log.push(`➕ ${q} g di ${c.n.toLowerCase()}`);return}
    q=q??(/finit|butt/.test(sg)||v=="bin"?tot(c.id):c.st);const w=take(b,c.id,q,v=="bin");
    log.push(w?`${v=="bin"?"🗑":"➖"} ${Math.round(w)} g di ${c.n.toLowerCase()}`:`${c.n} non c’è in dispensa`)});
  b.commit();return log.length?log.join(", "):"Non ho trovato nessun prodotto della tua dispensa nella frase."}

/* ---------- pezzi di interfaccia ---------- */
const av=(p,cls="")=>`<span class="av ${cls}" style="background:${p.color||COL[0]}">${esc((p.name||"?")[0].toUpperCase())}${p.sg?"<small>🌾</small>":""}</span>`;
function bd(d){if(d==null)return`<span class="tag g">Senza scadenza</span>`;return`<span class="tag ${d<=3?"r":d<=7?"y":"g"}">${d<0?"Scaduto":d==0?"Oggi":d==1?"Domani":d+" gg"}</span>`}
const ic=c=>`<span class="ic" style="background:var(--t-${CAT[K(c)?.c]?K(c).c:"alt"})">${EM[c]||"🥫"}</span>`;
const glt=c=>fam().Fg>0&&isGL(c)?` <span class="gl" title="Contiene glutine">🌾</span>`:"";
const greet=()=>{const h=new Date().getHours();return h<12?"Buongiorno":h<18?"Buon pomeriggio":"Buonasera"};
const sec=(t,a)=>`<div class="sec"><h2>${t}</h2>${a||""}</div>`;
function ago(t){if(!t)return"";const m=Math.round((Date.now()-t)/6e4);return m<1?"ora":m<60?m+" min fa":Math.round(m/60)+" h fa"}

function vHome(){const f=fam(),a=aut(f),tips=adv(f,a),soon=S.items.filter(i=>{const d=D(i.e);return K(i.c)&&d!=null&&d<=3}).sort((x,y)=>D(x.e)-D(y.e)),
  m=new Date().getHours()<10?"b":new Date().getHours()<15?"p":"c",r=sugg(m),deg=Math.min(a.k,14)/14*100;
  return`<div class="fam" data-t="fam">${S.prof.map(p=>av(p)).join("")}<span class="av add">+</span><span class="famtx">${esc(H.name)}<br><b>${f.n} ${f.n==1?"persona":"persone"}</b></span></div>
  <div class="hero"><div class="ring" style="background:conic-gradient(#fff 0 ${deg}%,#ffffff40 ${deg}% 100%)"><div><b>${a.k>=99?"99+":nf(a.k)}</b><span>giorni</span></div></div>
  <div><h3>Scorte per ${f.n==1?"te":"tutta la famiglia"}</h3><p>${esc(tips[0][1])}</p><span class="pill">${S.items.length} prodotti</span><span class="pill">🥦 ${fm(a.v)}</span></div></div>
  ${nextShop()!=null&&nextShop()<=0?`<div class="tip r due" data-t="shop">🛒 <b>È ora della spesa:</b> sono passati ${-D(H.last)} giorni dall’ultima. ${S.shop.filter(s=>!s.done).length?`In lista ci sono ${S.shop.filter(s=>!s.done).length} prodotti.`:"Apri la lista per vedere i suggerimenti."}</div>`:""}
  ${tips.slice(1).map(t=>`<div class="tip ${t[0]}">${esc(t[1])}</div>`).join("")}
  ${vmsg?`<div class="tip g">✅ ${esc(vmsg)}</div>`:""}
  ${sec("Da usare subito",`<a data-a="scad">Scadenze</a>`)}
  ${soon.length?`<div class="hs">${soon.map(i=>`<div class="tile">${bd(D(i.e))}${ic(i.c)}<div class="n">${esc(K(i.c)?.n||"")}${glt(i.c)}</div><div class="q">${fq(i.c,i.q)} · ${LOC[loc(i)][0].toLowerCase()}</div></div>`).join("")}</div>`:`<div class="card mu">Niente in scadenza nei prossimi 3 giorni.</div>`}
  ${todayPlan()}
  ${sec(m=="b"?"Idea per colazione":m=="p"?"Idea per pranzo":"Idea per stasera",`<a data-t="idee">Altre idee</a>`)}
  ${r?ideaCard(m,r):`<div class="card mu">Con le scorte attuali non esce una ricetta completa: guarda le idee “quasi pronte”.</div>`}
  ${wcard()}`}
function todayPlan(){const d=iso(0),L=SL.map(([k,l,e])=>[l,e,slot(0,d,k)]).filter(x=>x[2]);
  return sec("Oggi in tavola",`<a data-t="plan">Piano settimana</a>`)+(L.length?`<div class="card">${L.map(([l,e,id])=>{const r=RC.find(x=>x.id==id);return`<div class="row"><span>${e} <b>${l}</b> · ${id=="x"?"fuori casa":r?.n||""}</span>${r?`<button class="chip" data-a="cook" data-r="${r.id}" ${miss(r).length?"disabled":""}>${miss(r).length?"Manca "+miss(r).length:"Lo cucino"}</button>`:""}</div>`}).join("")}</div>`:`<div class="card mu">Nessun pasto in programma oggi. <a data-t="plan"><b>Crea il piano della settimana</b></a></div>`)}
function ideaCard(m,r){const g=ing(r),u=r.g.map(x=>[x[0],urg(x[0])]).filter(x=>x[1]!=null&&x[1]<=7);
  return`<div class="idea"><div class="pic">${EM[r.g[0][0]]||"🍽️"}</div><div class="ib"><h4>${r.n}</h4><p>${porz(fam())}${u.length?" · usa "+u.map(x=>K(x[0]).n.toLowerCase()).join(", "):""}</p>
  <details><summary>Ingredienti e preparazione</summary><p>${g.map(x=>K(x[0]).n.toLowerCase()+" "+fq(x[0],x[1])).join(", ")}</p><p class="st">${ST[r.id]||""}</p></details>
  <div class="ia"><button class="go" data-a="cook" data-r="${r.id}">Lo cucino</button><button class="ghost" data-a="idea" data-m="${m}">Un’altra</button><span class="tm">⏱ ${r.t} min</span></div></div></div>`}
/* ---------- report spreco e risparmio ---------- */
let rmo=0;
const monthKey=o=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()+o);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")};
const MESI=["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const mName=m=>MESI[+m.slice(5)-1]+" "+m.slice(0,4);
const wEur=w=>w.eur??val(w,w.q);
function monthStats(m){const W=S.waste.filter(w=>(w.d||"").startsWith(m)),U2=S.used.filter(u=>(u.d||"").startsWith(m)),B=S.buys.filter(b=>(b.d||"").startsWith(m));
  return{W,U:U2,bin:W.reduce((s,w)=>s+wEur(w),0),kg:W.reduce((s,w)=>s+w.q,0)/1000,saved:U2.filter(u=>u.s).reduce((s,u)=>s+(u.eur||0),0),nsav:U2.filter(u=>u.s).length,used:U2.reduce((s,u)=>s+(u.eur||0),0),spent:B.reduce((s,b)=>s+(b.eur||0),0),nb:B.length}}
function vReport(){const m=monthKey(rmo),st=monthStats(m),pv=monthStats(monthKey(rmo-1)),six=[-5,-4,-3,-2,-1,0].map(o=>({m:monthKey(rmo+o),...monthStats(monthKey(rmo+o))})),mx=Math.max(1,...six.map(x=>Math.max(x.bin,x.saved)));
  const by={};st.W.forEach(w=>{by[w.c]=by[w.c]||{q:0,e:0};by[w.c].q+=w.q;by[w.c].e+=wEur(w)});const top=Object.keys(by).sort((a,b)=>by[b].e-by[a].e).slice(0,3);
  const pct=st.used+st.bin?Math.round(st.bin/(st.used+st.bin)*100):0,dif=st.bin-pv.bin;
  return`<div class="wk"><button class="sm" data-a="rmo" data-v="-1" aria-label="Mese prima">‹</button><b>${mName(m)}</b><button class="sm" data-a="rmo" data-v="1" ${rmo>=0?"disabled":""} aria-label="Mese dopo">›</button></div>
  <div class="tiles rep"><div class="tile r"><span>🗑 Buttato</span><b>${eu(st.bin)}</b><small>${nf(st.kg,2)} kg${pv.bin||st.bin?` · ${dif<=0?"▼":"▲"} ${eu(Math.abs(dif))} sul mese prima`:""}</small></div>
  <div class="tile g"><span>💚 Salvato</span><b>${eu(st.saved)}</b><small>${st.nsav} ${st.nsav==1?"prodotto usato":"prodotti usati"} prima che scadesse${st.nsav==1?"":"ro"}</small></div>
  <div class="tile"><span>🧾 Speso</span><b>${eu(st.spent)}</b><small>${st.nb?`da ${st.nb} ${st.nb==1?"scontrino":"scontrini"}`:"fotografa gli scontrini per vederlo"}</small></div>
  <div class="tile"><span>♻️ Spreco</span><b>${pct}%</b><small>di quello che avete consumato o buttato</small></div></div>
  ${sec("Ultimi 6 mesi")}<div class="card"><div class="bars">${six.map(x=>`<div class="bar"><div class="bb"><i class="r" style="height:${x.bin/mx*100}%"></i><i class="g" style="height:${x.saved/mx*100}%"></i></div><span>${MESI[+x.m.slice(5)-1].slice(0,3)}</span></div>`).join("")}</div><p class="mu"><span class="dot r"></span> buttato &nbsp; <span class="dot g"></span> salvato</p></div>
  ${top.length?sec("Cosa buttate di più")+`<div class="card">${top.map(c=>`<div class="row"><div class="l">${ic(c)}<div><div>${esc(K(c).n)}</div><div class="mu">${fq(c,by[c].q)}</div></div></div><b>${eu(by[c].e)}</b></div>`).join("")}<p class="mu">Comprate ${esc(K(top[0]).n.toLowerCase())} in confezioni più piccole o mettetelo in freezer appena arriva.</p></div>`:st.U.length?`<div class="card"><p class="mu">🎉 Niente buttato in questo mese.</p></div>`:""}
  <p class="mu">I valori usano i prezzi degli scontrini; dove mancano, un prezzo medio stimato.</p>`}
function wcard(){const mo=iso(0).slice(0,7),L=S.waste.filter(w=>(w.d||"").startsWith(mo)),st=monthStats(mo);if(!L.length)return st.U.length?sec("Questo mese",`<a data-t="report">Report</a>`)+`<div class="card"><div class="row"><span class="big g">${eu(st.saved)}</span><span class="mu">salvati, niente buttato 🎉</span></div></div>`:"";const g=L.reduce((s,w)=>s+w.q,0),by={};L.forEach(w=>by[w.c]=(by[w.c]||0)+w.q);const top=Object.keys(by).sort((a,b)=>by[b]-by[a])[0];
  return sec("Sprechi del mese",`<a data-t="report">Report</a>`)+`<div class="card"><div class="row"><span class="big ${g>500?"r":g>200?"y":"g"}">${eu(st.bin)} · ${Math.round(g)} g</span><span class="mu">${st.saved?eu(st.saved)+" salvati":Math.round(L.reduce((s,w)=>s+w.q/100*K(w.c).k,0))+" kcal buttate"}</span></div><p class="mu">Butti soprattutto ${K(top).n.toLowerCase()}: compralo in quantità più piccole.</p></div>`}
function vIdee(){const p=sugg("p"),c=sugg("c",p&&p.id),nr=RC.filter(r=>miss(r).length==1&&r.t<=mx).sort((a,b)=>sc(b)-sc(a)).slice(0,4),
  L=RC.filter(r=>r.t<=mx).map(r=>({r,n:miss(r).length})).sort((a,b)=>a.n-b.n||a.r.t-b.r.t),f=fam();
  return`<div class="chips">${TF.map(x=>`<button class="chip ${mx==x[0]?"on":""}" data-a="mx" data-v="${x[0]}">${x[1]}</button>`).join("")}</div>
  ${f.Fg?`<div class="tip g">🌾 ${f.sg.map(p=>esc(p.name)).join(", ")} ${f.sg.length==1?"mangia":"mangiano"} senza glutine: le loro porzioni usano pasta, pane e avena senza glutine, e quinoa al posto del couscous.</div>`:""}
  ${vmsg?`<div class="tip g">✅ ${esc(vmsg)}</div>`:""}
  ${sec("Pranzo")}${p?ideaCard("p",p):`<div class="card mu">Nessuna ricetta completa per pranzo.</div>`}
  ${sec("Cena")}${c?ideaCard("c",c):`<div class="card mu">Nessuna ricetta completa per cena.</div>`}
  ${sec("Quasi pronti")}<div class="card">${nr.length?nr.map(r=>{const x=miss(r)[0];return`<div class="row"><div><div>${r.n}</div><div class="mu">Manca: ${K(x[0]).n.toLowerCase()}</div></div><button class="chip" data-a="toshop" data-c="${x[0]}" data-q="${x[1]}">🛒 Aggiungi</button></div>`}).join(""):`<p class="mu">Nessuna ricetta a un ingrediente di distanza.</p>`}</div>
  ${sec("Ricettario",`<span class="mu">${porz(f)}</span>`)}<div class="card">${L.map(x=>`<details><summary><div><div>${x.r.n}</div><div class="mu">${MT[x.r.m]}, ${x.r.t} min</div></div><span class="tag ${x.n==0?"g":x.n==1?"y":"r"}">${x.n==0?"Pronta":"Manca "+x.n}</span></summary><p>${ing(x.r).map(g=>(tot(g[0])>=g[1]?"✓ ":"✗ ")+K(g[0]).n.toLowerCase()+" "+fq(g[0],g[1])).join(", ")}</p><p class="mu">${ST[x.r.id]||""}</p></details>`).join("")}</div>`}
function vPlan(){const days=weekDays(wk),today=iso(0),need=planNeeds(wk),f=fam(),pd=planDoc(wk),filled=days.some(d=>SL.some(([k])=>pd.m?.[d]?.[k]));
  const opt=(k,cur)=>`<option value="">— Vuoto</option><option value="x" ${cur=="x"?"selected":""}>🚪 Fuori casa</option>`+RC.filter(r=>fits(r,k)).map(r=>`<option value="${r.id}" ${cur==r.id?"selected":""}>${r.n}${miss(r).length?"":" ✓"}</option>`).join("");
  const m0=monday(wk),m6=new Date(m0);m6.setDate(m0.getDate()+6);
  return`<div class="wk"><button class="chip" data-a="wk" data-v="-1" aria-label="Settimana prima">‹</button><b>${wk==0?"Questa settimana":wk==1?"Prossima settimana":wk==-1?"Settimana scorsa":"Settimana"} <span class="mu">${m0.getDate()}/${m0.getMonth()+1} – ${m6.getDate()}/${m6.getMonth()+1}</span></b><button class="chip" data-a="wk" data-v="1" aria-label="Settimana dopo">›</button></div>
  <div class="card"><h2>Riempi i pasti vuoti</h2><div class="chips">${[["disp","🥫 Prima la dispensa"],["var","🌈 Più varietà"],["man","✍️ A mano"]].map(x=>`<button class="chip ${pmode==x[0]?"on":""}" data-a="pmode" data-v="${x[0]}">${x[1]}</button>`).join("")}</div>
  <p class="mu">${pmode=="disp"?"Sceglie ricette con quello che hai, partendo da ciò che scade: compri il meno possibile.":pmode=="var"?"Alterna carne, pesce, legumi e uova senza ripetere i piatti.":"Scegli tu ogni pasto dal menu qui sotto."}</p>
  ${pmode!="man"?`<button class="btn" data-a="pfill">Crea il piano</button>`:""}${filled?`<button class="btn o" data-a="pclear">Svuota la settimana</button>`:""}</div>
  ${vmsg?`<div class="tip g">✅ ${esc(vmsg)}</div>`:""}
  ${need.length?`<div class="tip y">🛒 Per questo piano mancano ${need.length} prodotti. <a data-a="pshop"><b>Aggiungili alla spesa</b></a></div>`:filled?`<div class="tip g">✅ ${days.some(d=>d>=today&&SL.some(([k])=>{const r=RC.find(x=>x.id==slot(wk,d,k));return r&&miss(r).length}))?"Quello che manca è già nella lista della spesa.":"Hai tutto per i pasti di questa settimana."}</div>`:""}
  ${days.map((d,i)=>{const past=d<today;return`<div class="card day ${d==today?"today":""} ${past?"past":""}"><h2>${GG[i]} ${+d.slice(8)}${d==today?" · oggi":""}</h2>${SL.map(([k,l,e])=>{const cur=slot(wk,d,k),r=RC.find(x=>x.id==cur),ms=r?miss(r):[];
    return`<div class="ps"><span class="pl">${e} ${l}</span><select data-ps="${d}|${k}" aria-label="${l} di ${GG[i]}" ${past?"disabled":""}>${opt(k,cur)}</select>${r&&!past?`<span class="tag ${ms.length?"y":"g"}">${ms.length?"Manca "+ms.length:"Pronto"}</span>`:""}${r&&d==today&&!ms.length?`<button class="chip" data-a="cook" data-r="${r.id}">Lo cucino</button>`:""}</div>`}).join("")}</div>`}).join("")}
  <p class="mu fine">${porz(f)} per ogni pasto. Il piano è condiviso con tutta la famiglia.</p>`}
function vDisp(){const chips=`<div class="chips">${FL.map(x=>`<button class="chip ${lf==x[0]?"on":""}" data-a="lf" data-v="${x[0]}">${x[1]}</button>`).join("")}<button class="chip ${ord=="scad"?"on":""}" data-a="ord">⏰ Per scadenza</button></div>`;
  const F=S.items.filter(i=>K(i.c)&&(lf=="all"||loc(i)==lf));
  const row=i=>{const k=K(i.c);return`<div class="row it"><button class="l open" data-a="ped" data-i="${i.id}" aria-label="Apri ${esc(k.n)}">${ic(i.c)}<div><div>${esc(k.n)}${glt(i.c)}</div><div class="mu">${k.brand?esc(k.brand)+" · ":""}${fq(i.c,i.q)} · ${LOC[loc(i)][1]}${k.unc?.length?' · <span class="unc">da controllare</span>':""}</div></div></button><div class="rt">${bd(D(i.e))}<div class="ctl"><button class="sm" data-a="dec" data-i="${i.id}" aria-label="Diminuisci">−</button><button class="sm" data-a="inc" data-i="${i.id}" aria-label="Aumenta">+</button></div></div></div>`};
  let body;if(ord=="scad"){const L=F.filter(i=>i.e).sort((a,b)=>D(a.e)-D(b.e));body=L.length?`<div class="card">${L.map(i=>row(i)+(D(i.e)<=7&&R[i.c]?`<div class="idea2">💡 ${R[i.c]}</div>`:"")).join("")}</div>`:`<div class="card mu">Nessun prodotto con data di scadenza.</div>`}
  else body=Object.keys(CAT).map(k=>{const L=F.filter(i=>K(i.c)?.c==k).sort((a,b)=>(K(a.c).sub||"").localeCompare(K(b.c).sub||""));let ls=null;return L.length?`${sec(CAT[k][1]+" "+CAT[k][0])}<div class="card">${L.map(i=>{const sb=K(i.c).sub||"";const h=sb&&sb!=ls?`<div class="subh">${esc(sb)}</div>`:"";ls=sb;return h+row(i)}).join("")}</div>`:""}).join("")||`<div class="card mu">La dispensa è vuota: tocca + per aggiungere il primo prodotto.</div>`;
  return chips+body}
// la soglia minima di ogni prodotto vale per un adulto e una settimana: la scalo sulla famiglia e sui giorni tra una spesa e l'altra
const DAYS=[[3,"Ogni 3-4 giorni"],[7,"Una volta a settimana"],[14,"Ogni 2 settimane"]];
const days=()=>H?.days||7;
// giorni che mancano alla prossima spesa (negativo = in ritardo); null finché non si è fatta la prima spesa con l'app
const nextShop=()=>H?.last?days()+D(H.last):null;
function shopNeeds(){const f=fam(),g=days()/7;return C.filter(c=>c.min>0&&scale(c.id,f)>0).map(c=>({c,need:c.min*scale(c.id,f)*g,have:tot(c.id)})).filter(x=>x.have<x.need&&!S.shop.some(s=>s.c==x.c.id&&!s.done)).map(x=>({c:x.c,q:Math.ceil((x.need-x.have)/x.c.st)*x.c.st}))}
/* ---------- corsie del supermercato ---------- */
const CORSIE={frutta:["Frutta e verdura","🥦"],pane:["Pane e forno","🥖"],carne:["Carne e pesce","🍗"],frigo:["Latticini, uova e salumi","🧀"],past:["Pasta, riso e legumi","🍝"],scat:["Scatolame e conserve","🥫"],cond:["Olio e condimenti","🫒"],dolc:["Colazione e dolci","🍪"],bev:["Bevande","🥤"],surg:["Surgelati","❄️"],casa:["Casa e igiene","🧽"],alt:["Altro","🛒"]};
const CID={pol:"carne",sal:"carne",uov:"frigo",yog:"frigo",tof:"frigo",par:"frigo",mzz:"frigo",lat:"frigo",ton:"scat",cec:"scat",fag:"scat",pss:"scat",len:"past",pas:"past",ris:"past",cus:"past",psg:"past",qui:"past",pan:"pane",pgf:"pane",fet:"pane",fgf:"pane",avn:"dolc",agf:"dolc",bis:"dolc",bgf:"dolc",cio:"dolc",mar:"dolc",vrs:"surg",evo:"cond",pat:"frutta",pom:"frutta",zuc:"frutta",ban:"frutta",mel:"frutta",man:"frutta",cip:"frutta",car:"frutta",spi:"frutta",pep:"frutta"};
// parole chiave in ordine: la prima che corrisponde vince (es. "fette biscottate" va nel pane prima che "biscott" la porti nei dolci)
const CKW=[["surg",/surgel|gelat|bastoncin/],["frigo",/latte|yogurt|formagg|mozzarell|burro|uov|panna|ricott|parmig|grana|prosciutt|salum|wurstel|stracchin/],["carne",/pollo|carne|manzo|maial|tacchin|pesce|salmon|macinat|bistecc|hamburger|salsicc/],["pane",/\bpane|panin|grissin|cracker|piadin|fette biscott|focacc/],["past",/pasta|spaghett|penne|fusill|\briso\b|farin|couscous|quinoa|legum|lenticch/],["scat",/scatol|passata|pelati|tonno|ceci|fagiol|conserv|sugo|piselli/],["cond",/olio|aceto|\bsale\b|spezi|condiment|ketchup|maionese|senape/],["dolc",/biscott|cioccolat|merend|cereal|marmell|nutella|zucchero|caff|\bt[eè]\b|miele|snack|patatin|avena/],["bev",/acqua|birra|vino|succo|bibit|cola\b|bevand/],["casa",/detersiv|sapone|carta|shampoo|dentifric|spugn|sacchett|igien|pannolin|ammorbid|candeggin|rotol|pellicol|alluminio/],["frutta",/frutt|verdur|insalat|mel[ae]\b|banan|pomodor|zucchin|patat|cipoll|carot|spinac|pepero|limon|aranc|aglio/]];
const CCAT={pro:"frigo",car:"past",veg:"frutta",gra:"cond",snk:"dolc",bev:"bev",alt:"alt"};
function aisleOf(s){if(s.ai&&CORSIE[s.ai])return s.ai;const k=s.c&&K(s.c);if(k&&CID[k.id])return CID[k.id];if(k?.link&&CID[k.link])return CID[k.link];
  const t=((k?.n||s.n||"")+" "+(k?.sub||"")).toLowerCase(),m=CKW.find(([,r])=>r.test(t));return m?m[0]:k?CCAT[k.c]||"alt":"alt"}
const aisles=()=>{const o=(H.aisles||[]).filter(a=>CORSIE[a]);return[...o,...Object.keys(CORSIE).filter(a=>!o.includes(a))]};
let ced=false;
function vCorsie(){const o=aisles();return`<div class="card"><p class="mu">Metti le corsie nell'ordine in cui le trovi nel tuo supermercato. Vale per tutta la famiglia.</p>${o.map((a,i)=>`<div class="row"><div class="l"><span class="cn">${i+1}</span>${CORSIE[a][1]} ${CORSIE[a][0]}</div><div class="ctl"><button class="sm" data-a="cup" data-v="${a}" ${i?"":"disabled"} aria-label="Su">↑</button><button class="sm" data-a="cdn" data-v="${a}" ${i<o.length-1?"":"disabled"} aria-label="Giù">↓</button></div></div>`).join("")}<div class="two"><button class="btn" data-a="cok">Fatto</button><button class="btn o" data-a="crst">Ordine tipico</button></div></div>`}
function vShop(){const L=S.shop,done=L.filter(s=>s.done),last=done.slice().sort((a,b)=>(b.dt||0)-(a.dt||0))[0],deg=L.length?done.length/L.length*100:0,need=shopNeeds().sort((x,y)=>aisles().indexOf(aisleOf({c:x.c.id}))-aisles().indexOf(aisleOf({c:y.c.id}))),f=fam();
  const nm=s=>s.c?esc(K(s.c).n):esc(s.n),todo=L.filter(s=>!s.done),li=s=>`<div class="li"><button class="ck ${s.done?"on":""}" data-a="stog" data-i="${s.id}" aria-label="Preso">${s.done?"✓":""}</button><span class="t">${s.c&&EM[s.c]?EM[s.c]+" ":""}${s.done?`<s>${nm(s)}</s>`:nm(s)}${s.q&&s.c?", "+fq(s.c,s.q):""}${s.sgf?" 🌾":""}<div class="mu">${s.done?"preso da "+esc(s.doneBy)+" · "+ago(s.dt):s.auto?"suggerito: scorte basse":s.plan?"per il piano pasti":"aggiunto da "+esc(s.by)}</div></span>${s.done?"":`<label class="mvw" title="Cambia corsia">${CORSIE[aisleOf(s)][1]}<select data-sai="${s.id}" aria-label="Cambia corsia">${aisles().map(c=>`<option value="${c}" ${c==aisleOf(s)?"selected":""}>${CORSIE[c][1]} ${CORSIE[c][0]}</option>`).join("")}</select></label>`}<button class="x" data-a="sdel" data-i="${s.id}" aria-label="Togli">✕</button></div>`;
  return`<div class="hero green"><div class="ring" style="background:conic-gradient(#fff 0 ${deg}%,#ffffff40 ${deg}% 100%)"><div><b>${done.length}/${L.length}</b><span>presi</span></div></div>
  <div><h3>${last?esc(last.doneBy)+" sta facendo la spesa":"Lista di tutta la famiglia"}</h3><p>${last?"Ultimo preso "+ago(last.dt)+".":"Chi va al supermercato spunta i prodotti e gli altri lo vedono subito."}</p><span class="live"><i></i>In tempo reale</span></div></div>
  <div class="card add"><div class="two"><input id="sq" placeholder="Aggiungi: es. latte, detersivo…" aria-label="Prodotto da comprare"><button class="go" data-a="sadd">Aggiungi</button></div>
  ${f.Fg?`<label class="ck2"><input type="checkbox" id="sgf"> Senza glutine (per ${f.sg.map(p=>esc(p.name)).join(", ")})</label>`:""}</div>
  ${sec("Da comprare",`<a data-a="ced">${ced?"":"Ordina corsie"}</a>`)}
  ${ced?vCorsie():L.length?aisles().map(a=>{const g=todo.filter(s=>aisleOf(s)==a);return g.length?`<div class="aisle"><div class="ah">${CORSIE[a][1]} ${CORSIE[a][0]}<span>${g.length}</span></div><div class="card shop">${g.map(li).join("")}</div></div>`:""}).join("")+(done.length?`<div class="aisle"><div class="ah">✓ Già presi<span>${done.length}</span></div><div class="card shop">${done.map(li).join("")}</div></div>`:""):`<div class="card shop"><p class="mu">La lista è vuota.</p></div>`}
  ${done.length?`<button class="btn" data-a="sdone">Metti in dispensa ${done.length==1?"il prodotto preso":`i ${done.length} presi`}</button>`:""}
  ${need.length?sec("Suggeriti dalle scorte",`<a data-a="sall">Aggiungi tutti</a>`)+`<div class="card">${need.map(x=>`<div class="row"><div class="l">${ic(x.c.id)}<div><div>${x.c.n}</div><div class="mu">circa ${fq(x.c.id,x.q)} per ${f.n} ${f.n==1?"persona":"persone"}, ${days()} giorni</div></div></div><button class="chip" data-a="toshop" data-c="${x.c.id}" data-q="${x.q}" data-auto="1">+</button></div>`).join("")}</div>`:""}`}
// tema: "auto" segue il telefono, altrimenti forzato chiaro o scuro
const theme=()=>{try{return localStorage.getItem("theme")||"auto"}catch(e){return"auto"}};
function applyTheme(){const k=theme(),r=document.documentElement;if(k=="auto")delete r.dataset.theme;else r.dataset.theme=k;
  const dk=k=="dark"||k=="auto"&&matchMedia("(prefers-color-scheme: dark)").matches;document.querySelector('meta[name=theme-color]')?.setAttribute("content",dk?"#16111d":"#fff7ec")}
applyTheme();matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",applyTheme);
function vFam(){const f=fam(),old=oldData();
  return`<div class="hero"><div class="fam big">${S.prof.map(p=>av(p)).join("")}</div><div><h3>${esc(H.name)}</h3><p>${porz(f)} · ${Math.round(f.k)} kcal al giorno in tutto</p></div></div>
  ${sec("Invita in famiglia")}<div class="card"><p class="mu">Chi si registra può entrare con questo codice e vedrà la stessa dispensa.</p><div class="code">${esc(H.code||"")}</div><div class="two"><button class="btn" data-a="share">Condividi</button><button class="btn o" data-a="newcode">Nuovo codice</button></div></div>
  ${sec("Aspetto")}<div class="card"><p class="mu">Vale solo su questo telefono. Automatico segue le impostazioni del telefono.</p><div class="chips">${[["auto","Automatico"],["light","☀️ Chiaro"],["dark","🌙 Scuro"]].map(([k,l])=>`<button class="chip ${theme()==k?"on":""}" data-a="theme" data-v="${k}">${l}</button>`).join("")}</div></div>
  ${sec("La spesa")}<div class="card"><p class="mu">Ogni quanto fate la spesa grande? I suggerimenti coprono questo periodo e, quando è passato, l’app vi ricorda di farla.</p><div class="chips">${DAYS.map(d=>`<button class="chip ${days()==d[0]?"on":""}" data-a="days" data-v="${d[0]}">${d[1]}</button>`).join("")}</div><p class="mu">${H.last?(nextShop()>0?`Prossima spesa fra ${nextShop()} ${nextShop()==1?"giorno":"giorni"}.`:"È ora della spesa."):"Il conto parte quando mettete in dispensa i prodotti presi."}</p></div>
  ${sec("Persone",`<a data-a="padd">+ Aggiungi</a>`)}<div class="card">${S.prof.map(p=>editP==p.id?pForm(p):`<div class="row"><div class="l">${av(p)}<div><div>${esc(p.name)}${p.uid==U.uid?" (tu)":p.uid?"":" · senza account"}</div><div class="mu">${p.sesso=="F"?"Donna":"Uomo"}, ${p.eta} anni · ${Math.round(kcal(p))} kcal${p.sg?" · senza glutine":""}</div></div></div><button class="chip" data-a="pedit" data-i="${p.id}">Modifica</button></div>`).join("")}${editP=="new"?pForm({id:"new",name:"",sesso:"F",eta:8,peso:25,alt:125,att:2,ob:"mant",sg:false}):""}</div>
  <p class="mu fine">Fabbisogni stimati con la formula di Mifflin-St Jeor per gli adulti e con valori di riferimento per età per i minori: non sostituiscono il parere di un medico o di un dietista.</p>
  ${sec("Dati")}<div class="card">${old?`<button class="btn o" data-a="imp">Importa i dati della vecchia app (${(old.items||[]).length} prodotti)</button>`:""}<button class="btn o" data-a="demo">Carica prodotti di esempio</button></div>
  ${sec("Account")}<div class="card"><div class="mu">${esc(U.email)}</div><div class="two"><button class="btn o" data-a="logout">Esci</button><button class="btn o warn" data-a="leave">Lascia la famiglia</button></div></div>`}
function pForm(p){const n=(k,l,t="number")=>`<label>${l}<input data-p="${k}" type="${t}" ${t=="number"?'inputmode="decimal"':""} value="${esc(p[k])}"></label>`;
  return`<div class="pf" data-pid="${p.id}"><div class="two">${n("name","Nome","text")}<label>Sesso<select data-p="sesso"><option value="M" ${p.sesso!="F"?"selected":""}>Uomo</option><option value="F" ${p.sesso=="F"?"selected":""}>Donna</option></select></label></div>
  <div class="three">${n("eta","Età")}${n("peso","Peso kg")}${n("alt","Altezza cm")}</div>
  <div class="two"><label>Attività<select data-p="att">${AT.map((a,i)=>`<option value="${i}" ${i==p.att?"selected":""}>${a[0]}</option>`).join("")}</select></label><label>Obiettivo<select data-p="ob">${Object.keys(OB).map(k=>`<option value="${k}" ${k==p.ob?"selected":""}>${OB[k][0]}</option>`).join("")}</select></label></div>
  <label class="ck2"><input type="checkbox" data-p="sg" ${p.sg?"checked":""}> Mangia senza glutine</label>
  <div class="two"><button class="btn" data-a="psave">Salva</button>${p.id!="new"&&!p.uid?`<button class="btn o warn" data-a="pdel">Elimina</button>`:`<button class="btn o" data-a="pcancel">Annulla</button>`}</div></div>`}
// modifica di una voce della dispensa: quantità e scadenza; per i prodotti di famiglia anche nome, marca e valori
function openPE(it){const k=K(it.c),p=k.u&&S.products.find(x=>x.id==k.pid);
  pe={iid:it.id,c:it.c,l:loc(it),pid:p?.id||null,n:k.n,q:it.q,e:it.e||"",v:p?{n:p.n,brand:p.brand||"",cat:p.cat||"alt",sub:p.sub||"",g:p.g??"",k:p.k??"",p:p.p??"",h:p.h??"",z:p.z??"",f:p.f??"",fs:p.fs??"",fib:p.fib??"",sale:p.sale??"",gl:!!p.gl,alg:(p.alg||[]).join(", ")}:null,unc:[...(p?.unc||[])]}}
function vPE(){const v=pe.v,u=c=>pe.unc.includes(c)?"unc":"",inp=(c,l,t="number")=>`<label class="${u(c)}">${l}<input data-pe="${c}" type="${t}" ${t=="number"?'inputmode="decimal" step="any"':""} value="${esc(v[c])}"></label>`;
  const k=K(pe.c);
  return`<div class="scrim" data-a="pex"></div><div class="sheet"><div class="grab"></div><div class="peh">${ic(pe.c)}<div><h2>${esc(pe.n)}</h2><div class="mu">${k.brand?esc(k.brand)+" · ":""}${k.sub?esc(k.sub):esc(CAT[k.c]?.[0]||"")}</div></div></div>
  <div class="three acts"><button class="btn o" data-a="del" data-i="${pe.iid}">✓ Finito</button><button class="btn o warn" data-a="waste" data-i="${pe.iid}">🗑 Buttato</button><button class="btn o" data-a="pecook">🍳 Ricette</button></div>
  <div class="chips">${Object.keys(LOC).map(l=>`<button class="chip ${pe.l==l?"on":""}" data-a="peloc" data-v="${l}">${LOC[l][1]} ${LOC[l][0]}</button>`).join("")}</div>
  <div class="two"><label>Quantità g<input data-pe="q" type="number" inputmode="numeric" value="${esc(pe.q)}"></label><label>Scadenza<input data-pe="e" type="date" value="${esc(pe.e)}"></label></div>
  ${v?`${pe.unc.length?'<p class="mu"><span class="unc">In giallo</span> i valori stimati da Gemini: correggili o confermali.</p>':""}
  <div class="two">${inp("n","Nome","text")}${inp("brand","Marca","text")}</div>
  <div class="two"><label class="${u("cat")}">Categoria<select data-pe="cat">${Object.keys(CAT).map(c=>`<option value="${c}" ${c==v.cat?"selected":""}>${CAT[c][0]}</option>`).join("")}</select></label>${inp("sub","Sottocategoria","text")}</div>
  <div class="nin">${inp("g","Peso confezione g")}${NUT.map(([,c,l])=>inp(c,l)).join("")}</div>
  ${inp("alg","Allergeni (separati da virgola)","text")}<label class="ck2 ${u("gl")}"><input type="checkbox" data-pe="gl" ${v.gl?"checked":""}> Contiene glutine</label>
  ${labBtn("pe",pe)}${pe.unc.length?'<button class="btn o" data-a="peok">Confermo tutti i valori</button>':""}${k.link?`<p class="mu">Conta come ${esc(K(k.link).n.toLowerCase())} per ricette e scorte.</p>`:""}`:`<details class="nd"><summary>Valori nutrizionali per 100 g</summary><div class="nut">${nutRow(k.k,k.p,k.h)}</div></details>`}
  <button class="btn" data-a="pesave">Salva</button><button class="btn o" data-a="pex">Annulla</button></div>`}
async function savePE(){const q=Math.max(0,Math.round(+pe.q)||0);
  await updateDoc(dref("items",pe.iid),{q,e:okDate(pe.e)||null,l:pe.l});
  if(pe.v){const v=pe.v,num=c=>v[c]===""||v[c]==null?null:+v[c];
    await updateDoc(dref("products",pe.pid),{n:v.n.trim()||"Prodotto",brand:v.brand.trim(),cat:v.cat,sub:v.sub.trim(),g:Math.round(+v.g)||0,k:+v.k||0,p:+v.p||0,h:+v.h||0,z:num("z"),f:num("f"),fs:num("fs"),fib:num("fib"),sale:num("sale"),gl:!!v.gl,alg:v.alg.split(",").map(x=>x.trim()).filter(Boolean),unc:pe.unc})}
  pe=null;vmsg="Modifiche salvate."}
function vSheet(){const opt=Object.keys(CAT).map(k=>`<optgroup label="${CAT[k][0]}">${C.filter(c=>c.c==k).map(c=>`<option value="${c.id}">${c.n}</option>`).join("")}</optgroup>`).join("");
  return`<div class="scrim" data-a="close"></div><div class="sheet"><div class="grab"></div><h2>Aggiungi alla dispensa</h2>
  <div class="two"><label class="btn cam">📷 Foto prodotto<input type="file" accept="image/*" capture="environment" data-shot="prod" hidden></label><label class="btn cam o">🧾 Scontrino<input type="file" accept="image/*" capture="environment" data-shot="rec" hidden></label></div>
  <p class="mu">Gemini legge nome, marca, peso, scadenza e valori nutrizionali.</p><div class="or">oppure scrivi o detta</div>
  <div class="two v"><input id="vt" placeholder="ho comprato 6 uova e 500 g di pasta" aria-label="Frase"><button class="mic" data-a="mic" aria-label="Parla">🎤</button></div>
  <button class="btn" data-a="say">Aggiorna con la frase</button>${vmsg?`<p class="mu">${esc(vmsg)}</p>`:""}
  <div class="or">oppure</div>
  <select id="ns">${opt}</select><label>Dove lo metti<select id="nl">${Object.keys(LOC).map(k=>`<option value="${k}" ${k==dl(C[0].id)?"selected":""}>${LOC[k][1]} ${LOC[k][0]}</option>`).join("")}</select></label>
  <div class="two"><label>Quantità in grammi<input id="nq" type="number" min="1" inputmode="numeric" placeholder="500"></label><label>Scadenza<input id="nd" type="date"></label></div>
  <button class="btn" data-a="add">Aggiungi</button><button class="btn o" data-a="close">Chiudi</button></div>`}

function vAuth(){const r=am=="reg",f=am=="reset";
  return`<div class="auth"><div class="logo">🥫</div><h1>Dispensa smart</h1><p class="mu">La dispensa di tutta la famiglia, sempre aggiornata.</p>
  <div class="card">${r?`<label>Nome<input id="an" autocomplete="given-name"></label>`:""}<label>Email<input id="ae" type="email" autocomplete="email"></label>
  ${f?"":`<label>Password<input id="ap" type="password" autocomplete="${r?"new-password":"current-password"}"></label>`}
  ${amsg?`<div class="tip ${amsg[0]}">${esc(amsg[1])}</div>`:""}
  <button class="btn" data-a="${r?"reg":f?"reset":"login"}" ${busy?"disabled":""}>${r?"Crea account":f?"Invia email di recupero":"Entra"}</button>
  <div class="links">${am!="login"?`<a data-a="am" data-v="login">Ho già un account</a>`:`<a data-a="am" data-v="reg">Crea un account</a><a data-a="am" data-v="reset">Password dimenticata?</a>`}</div></div></div>`}
function vNoHH(){return`<div class="auth"><div class="logo">👨‍👩‍👧‍👦</div><h1>Ciao ${esc(UD?.name||U.displayName||"")}!</h1><p class="mu">Crea la tua famiglia oppure entra in quella di qualcun altro con il codice di invito.</p>
  ${amsg?`<div class="tip ${amsg[0]}">${esc(amsg[1])}</div>`:""}
  <div class="card"><h2>Crea una famiglia</h2><input id="hn" placeholder="Es. Famiglia Rossi"><button class="btn" data-a="hcreate" ${busy?"disabled":""}>Crea</button></div>
  <div class="card"><h2>Ho un codice di invito</h2><input id="hc" placeholder="Es. K7P2QX" maxlength="6" autocapitalize="characters"><button class="btn o" data-a="hjoin" ${busy?"disabled":""}>Entra nella famiglia</button></div>
  <a class="out" data-a="logout">Esci dall’account</a></div>`}
const AE={"auth/invalid-credential":"Email o password non corrette.","auth/wrong-password":"Email o password non corrette.","auth/user-not-found":"Email o password non corrette.","auth/email-already-in-use":"Esiste già un account con questa email.","auth/weak-password":"La password deve avere almeno 6 caratteri.","auth/invalid-email":"L’email non è valida.","auth/missing-password":"Scrivi la password.","auth/too-many-requests":"Troppi tentativi: riprova tra qualche minuto.","auth/network-request-failed":"Connessione assente: controlla internet."};

// gli aggiornamenti in tempo reale ridisegnano la pagina: conservo quello che si sta scrivendo e il campo attivo
const fkey=e=>e.id||(e.dataset.aif&&e.closest("[data-ai]")?"ai"+e.closest("[data-ai]").dataset.ai+":"+e.dataset.aif:null)||(e.dataset.pe?"pe:"+e.dataset.pe:null)||(e.dataset.p&&e.closest(".pf")?e.closest(".pf").dataset.pid+":"+e.dataset.p:null);
function render(){const kept={},fa=document.activeElement,fk=fa&&fkey(fa),sel=fa&&fa.selectionStart!=null?[fa.selectionStart,fa.selectionEnd]:null;
  document.querySelectorAll("#v input,#v select").forEach(e=>{const k=fkey(e);if(k&&e.type!="checkbox")kept[k]=e.value;else if(k)kept[k]=e.checked});
  draw();
  document.querySelectorAll("#v input,#v select").forEach(e=>{const k=fkey(e);if(!k||!(k in kept))return;if(e.type=="checkbox")e.checked=kept[k];else if(!e.value||e.tagName=="SELECT"||e.dataset.p)e.value=kept[k]});
  if(fk){const e=[...document.querySelectorAll("#v input,#v select")].find(x=>fkey(x)==fk);if(e){e.focus({preventScroll:true});try{sel&&e.setSelectionRange(...sel)}catch(x){}}}}
function draw(){const v=$("#v"),hd=$("#hd"),nav=$("nav");
  if(view=="setup"){hd.innerHTML="";nav.hidden=true;v.innerHTML=`<div class="auth"><div class="logo">⚙️</div><h1>Manca la configurazione</h1><p class="mu">Incolla i dati del tuo progetto Firebase nel file config.js: trovi i passaggi nel file LEGGIMI.</p></div>`;return}
  if(view=="loading"){hd.innerHTML="";nav.hidden=true;v.innerHTML=`<div class="auth"><div class="logo spin">🥫</div></div>`;return}
  if(view=="auth"){hd.innerHTML="";nav.hidden=true;v.innerHTML=vAuth();return}
  if(view=="nohh"){hd.innerHTML="";nav.hidden=true;v.innerHTML=vNoHH();return}
  nav.hidden=false;const soonN=S.items.filter(i=>{const d=D(i.e);return d!=null&&d<=3}).length;
  const T={home:[greet()+", "+esc(myName())+" 👋","La tua dispensa"],idee:["Cosa cucino","Idee"],disp:[S.items.length+" prodotti in casa","Dispensa"],shop:[esc(H.name),"Spesa condivisa"],fam:["Impostazioni","Famiglia"],plan:[esc(H.name),"Piano pasti"],report:[esc(H.name),"Spreco e risparmio"]}[tab];
  hd.innerHTML=`<div>${tab=="idee"||tab=="plan"||tab=="report"?`<a class="back" data-t="home">‹ Oggi</a>`:`<div class="hi">${T[0]}</div>`}<h1>${T[1]}</h1></div><button class="bell" data-a="scad" aria-label="Scadenze">🔔${soonN||(nextShop()!=null&&nextShop()<=0)?"<i></i>":""}</button>`;
  v.innerHTML={home:vHome,idee:vIdee,disp:vDisp,shop:vShop,fam:vFam,plan:vPlan,report:vReport}[tab]()+(shot?vShot():pe?vPE():sheet?vSheet():"");
  document.querySelectorAll("nav [data-t]").forEach(b=>b.classList.toggle("on",b.dataset.t==tab||((tab=="idee"||tab=="plan"||tab=="report")&&b.dataset.t=="home")))}

function readP(box){const o={};box.querySelectorAll("[data-p]").forEach(e=>{const k=e.dataset.p;o[k]=e.type=="checkbox"?e.checked:["eta","peso","alt","att"].includes(k)?+e.value:e.value.trim()});return o}
async function act(a,b){const it=S.items.find(x=>x.id==b.dataset.i);if((a=="del"||a=="waste")&&pe){pe=null;render()}
  try{
  if(a=="am"){am=b.dataset.v;amsg="";return render()}
  if(a=="login"||a=="reg"||a=="reset"){const e=$("#ae").value.trim(),p=$("#ap")?.value||"",n=$("#an")?.value.trim();busy=true;amsg="";render();
    try{if(a=="login")await signInWithEmailAndPassword(auth,e,p);
      if(a=="reg"){if(!n)throw{code:"name"};const c=await createUserWithEmailAndPassword(auth,e,p);await updateProfile(c.user,{displayName:n});U=c.user;await setDoc(doc(db,"users",c.user.uid),{name:n,hh:null,email:e})}
      if(a=="reset"){await sendPasswordResetEmail(auth,e);amsg=["g","Ti ho mandato un’email per scegliere una nuova password."]}}
    catch(x){amsg=["r",x.code=="name"?"Scrivi il tuo nome.":AE[x.code]||"Qualcosa non ha funzionato: riprova."]}
    busy=false;render();return}
  if(a=="logout"){await signOut(auth);tab="home";return}
  if(a=="hcreate"||a=="hjoin"){const hn=$("#hn").value.trim(),hc=$("#hc").value;busy=true;amsg="";render();try{a=="hcreate"?await createHH(hn):await joinHH(hc)}catch(x){amsg=["r",x.message=="code"?"Codice non trovato: controlla le lettere.":"Non è stato possibile: riprova."];if(x.message!="code")console.error(x)}busy=false;render();return}
  if(a=="close"){sheet=false;vmsg="";return render()}
  if(a=="scad"){tab="disp";ord="scad";lf="all";sheet=false;render();return scrollTo(0,0)}
  if(a=="inc"&&it)return updateDoc(dref("items",it.id),{q:it.q+K(it.c).st});
  if(a=="dec"&&it){const q=it.q-K(it.c).st,w=writeBatch(db);useRec(w,it,Math.min(it.q,K(it.c).st));if(q<=0)w.delete(dref("items",it.id));else w.update(dref("items",it.id),{q});return w.commit()}
  if(a=="del"&&it){const w=writeBatch(db);useRec(w,it,it.q);w.delete(dref("items",it.id));return w.commit()}
  if(a=="waste"&&it){const w=writeBatch(db);w.set(doc(col("waste")),{c:it.c,q:it.q,d:iso(0),eur:+val(it,it.q).toFixed(2)});w.delete(dref("items",it.id));return w.commit()}
  if(a=="mv"&&it){const ks=Object.keys(LOC);return updateDoc(dref("items",it.id),{l:ks[(ks.indexOf(loc(it))+1)%3]})}
  if(a=="lf"){lf=b.dataset.v;return render()}
  if(a=="ord"){ord=ord=="scad"?"cat":"scad";return render()}
  if(a=="idea"){ri[b.dataset.m]++;return render()}
  if(a=="mx"){mx=+b.dataset.v;ri.p=0;ri.c=0;return render()}
  if(a=="cook"){const r=RC.find(x=>x.id==b.dataset.r),w=writeBatch(db);ing(r).forEach(x=>take(w,x[0],x[1]));w.set(doc(col("cooked")),{r:r.id,d:iso(0),by:myName()});ri.p=0;ri.c=0;vmsg="Buon appetito! Ho scalato gli ingredienti dalla dispensa.";render();return w.commit()}
  if(a=="say"){vmsg=say($("#vt").value);$("#vt").value="";return render()}
  if(a=="mic"){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){vmsg="Il microfono non è disponibile qui: scrivi la frase oppure usa il microfono della tastiera.";return render()}const r=new SR();r.lang="it-IT";r.onresult=ev=>{vmsg=say(ev.results[0][0].transcript);render()};r.onerror=()=>{vmsg="Non riesco ad ascoltare: controlla il permesso del microfono o scrivi la frase.";render()};try{r.start();vmsg="Ti ascolto…";render()}catch(x){}return}
  if(a=="add"){const c=K($("#ns").value),q=+$("#nq").value;$("#nq").value="";await addDoc(col("items"),{c:c.id,q:q>0?q:c.st,e:$("#nd").value||null,l:$("#nl").value});vmsg=`Aggiunto: ${c.n.toLowerCase()}.`;return render()}
  if(a=="sadd"){const t=$("#sq").value.trim();if(!t)return;$("#sq").value="";const gf=$("#sgf")?.checked;let c=C.find(c=>KW[c.id].test(t.toLowerCase()));if(c&&gf&&GSUB[c.id])c=K(GSUB[c.id]);
    const o={by:myName(),done:false,t:Date.now()};if(c){o.c=c.id;const q=qty(t.toLowerCase(),c);if(q)o.q=Math.round(q)}else o.n=t;if(gf)o.sgf=true;return addDoc(col("shop"),o)}
  if(a=="toshop"){const c=b.dataset.c;await addDoc(col("shop"),{c,q:+b.dataset.q||K(c).st,by:myName(),done:false,t:Date.now(),...(b.dataset.auto?{auto:true}:{})});if(tab=="idee"){vmsg=`${K(c).n} è nella spesa condivisa.`;render()}return}
  if(a=="sall"){const w=writeBatch(db);shopNeeds().forEach((x,k)=>w.set(doc(col("shop")),{c:x.c.id,q:x.q,by:myName(),done:false,auto:true,t:Date.now()+k}));return w.commit()}
  if(a=="stog"){const s=S.shop.find(x=>x.id==b.dataset.i);return updateDoc(dref("shop",s.id),s.done?{done:false,doneBy:null,dt:null}:{done:true,doneBy:myName(),dt:Date.now()})}
  if(a=="sdel")return deleteDoc(dref("shop",b.dataset.i));
  if(a=="sdone"){const w=writeBatch(db);S.shop.filter(s=>s.done).forEach(s=>{if(s.c)w.set(doc(col("items")),{c:s.c,q:s.q||K(s.c).st,e:null,l:dl(s.c)});w.delete(dref("shop",s.id))});w.update(doc(db,"households",H.id),{last:iso(0)});return w.commit()}
  if(a=="share"){const t=`Entra nella nostra dispensa “${H.name}” su Dispensa smart con il codice ${H.code}: ${location.origin+location.pathname}`;if(navigator.share)return navigator.share({text:t}).catch(()=>{});await navigator.clipboard?.writeText(t);return alert("Invito copiato: incollalo in un messaggio.")}
  if(a=="newcode"){if(confirm("Il vecchio codice smetterà di funzionare. Continuo?"))return newCode();return}
  if(a=="wk"){wk+=+b.dataset.v;return render()}
  if(a=="pmode"){pmode=b.dataset.v;return render()}
  if(a=="pfill"){const o=fillWeek(wk,pmode);if(!Object.keys(o).length)return alert("Non ci sono pasti vuoti da riempire.");return setDoc(doc(db,"households",H.id,"plan",isoD(monday(wk))),{m:o},{merge:true})}
  if(a=="pclear"){if(!confirm("Svuoto tutti i pasti di questa settimana?"))return;return setDoc(doc(db,"households",H.id,"plan",isoD(monday(wk))),{m:{}})}
  if(a=="pshop"){const w=writeBatch(db);planNeeds(wk).forEach((x,k)=>w.set(doc(col("shop")),{c:x.c,q:x.q,by:myName(),done:false,plan:true,t:Date.now()+k}));await w.commit();vmsg="Ingredienti del piano aggiunti alla spesa.";return render()}
  if(a=="shotx"){shot=null;return render()}
  if(a=="ced"){ced=true;return render()}
  if(a=="theme"){try{b.dataset.v=="auto"?localStorage.removeItem("theme"):localStorage.setItem("theme",b.dataset.v)}catch(e){}applyTheme();return render()}
  if(a=="rmo"){rmo=Math.min(0,rmo+ +b.dataset.v);return render()}
  if(a=="cok"){ced=false;return render()}
  if(a=="cup"||a=="cdn"){const o=aisles(),i=o.indexOf(b.dataset.v),j=i+(a=="cup"?-1:1);[o[i],o[j]]=[o[j],o[i]];H.aisles=o;render();return updateDoc(doc(db,"households",H.id),{aisles:o})}
  if(a=="crst"){H.aisles=[];render();return updateDoc(doc(db,"households",H.id),{aisles:[]})}
  if(a=="ped"&&it){openPE(it);return render()}
  if(a=="pex"){pe=null;return render()}
  if(a=="peok"){pe.unc=[];return render()}
  if(a=="peloc"){pe.l=b.dataset.v;return render()}
  if(a=="pecook"){pe=null;tab="idee";vmsg="";render();return scrollTo(0,0)}
  if(a=="pesave"){await savePE();return render()}
  if(a=="shotok"){readShot();await saveShot();sheet=false;return render()}
  if(a=="days")return updateDoc(doc(db,"households",H.id),{days:+b.dataset.v});
  if(a=="padd"){editP="new";return render()}
  if(a=="pedit"){editP=b.dataset.i;return render()}
  if(a=="pcancel"){editP=null;return render()}
  if(a=="psave"){const box=b.closest(".pf"),o=readP(box);if(!o.name)return alert("Scrivi il nome.");if(!(o.eta>=1&&o.peso>0&&o.alt>0))return alert("Controlla età, peso e altezza.");const id=box.dataset.pid;editP=null;
    if(id=="new")return addDoc(collection(db,"households",H.id,"profiles"),{...o,uid:null,color:COL[S.prof.length%COL.length],o:Date.now()});
    await updateDoc(doc(db,"households",H.id,"profiles",id),o);if(S.prof.find(p=>p.id==id)?.uid==U.uid)await updateDoc(doc(db,"users",U.uid),{name:o.name});return}
  if(a=="pdel"){const id=b.closest(".pf").dataset.pid;if(confirm("Elimino questa persona?")){editP=null;return deleteDoc(doc(db,"households",H.id,"profiles",id))}return}
  if(a=="demo"){if(confirm("Aggiungo 26 prodotti di esempio alla dispensa della famiglia?"))return importItems(demoItems());return}
  if(a=="imp"){const o=oldData();if(!confirm(`Importo ${(o.items||[]).length} prodotti e il profilo dalla vecchia app?`))return;
    await importItems(o.items||[],w=>{(o.waste||[]).slice(0,50).forEach(x=>w.set(doc(col("waste")),x));if(o.prof&&me())w.update(doc(db,"households",H.id,"profiles",U.uid),{eta:o.prof.eta,peso:o.prof.peso,alt:o.prof.alt,att:o.prof.att,ob:o.prof.ob,sg:!!o.sg})});return alert("Fatto: i dati della vecchia app sono nella dispensa della famiglia.")}
  if(a=="leave"){if(H.owner==U.uid)return alert("Hai creato tu questa famiglia, quindi non puoi lasciarla.");if(confirm("Lasci la famiglia? Non vedrai più questa dispensa."))return leaveHH();return}
  }catch(x){console.error(x);vmsg="Qualcosa non ha funzionato: controlla la connessione e riprova.";render()}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-a],[data-t]");if(!b)return;
  if(b.dataset.t){tab=b.dataset.t;vmsg="";sheet=false;editP=null;render();scrollTo(0,0);return}
  if(b.dataset.a=="plus"){sheet=true;vmsg="";render();return}
  act(b.dataset.a,b)});
document.addEventListener("keydown",e=>{if(e.key!="Enter")return;const id=e.target.id;
  if(id=="vt"){vmsg=say(e.target.value);e.target.value="";render()}
  if(id=="sq")act("sadd",e.target);
  if(id=="ap")$("[data-a=login],[data-a=reg]")?.click();
  if(id=="hc")$("[data-a=hjoin]")?.click()});
function readShot(){document.querySelectorAll("[data-ai]").forEach(box=>{const x=shot.list[+box.dataset.ai];box.querySelectorAll("[data-aif]").forEach(e=>{const f=e.dataset.aif;x[f]=e.type=="checkbox"?e.checked:e.value})})}
// scrivere su un valore lo toglie dagli incerti
document.addEventListener("input",e=>{const t=e.target,f=t.dataset.aif,c=t.dataset.pe,val=t.type=="checkbox"?t.checked:t.value;
  if(f&&f!="on"&&shot){const x=shot.list[+t.closest("[data-ai]").dataset.ai];x[f]=val;if(x.incerti?.includes(f)){x.incerti=x.incerti.filter(y=>y!=f);t.closest("label")?.classList.remove("unc")}}
  if(c&&pe){if(c=="q"||c=="e")pe[c]=val;else{pe.v[c]=val;if(pe.unc.includes(c)){pe.unc=pe.unc.filter(y=>y!=c);(t.closest("label"))?.classList.remove("unc")}}}});
document.addEventListener("change",async e=>{if(e.target.dataset.sai)return updateDoc(dref("shop",e.target.dataset.sai),{ai:e.target.value});const lb=e.target.dataset.lab;if(lb!=null&&e.target.files[0]){if(lb!="pe")readShot();return readLab(e.target.files[0],lb=="pe"?"pe":+lb)}
  const sh=e.target.dataset.shot;if(sh&&e.target.files[0]){shot={m:sh,busy:true,list:[]};render();
    try{shot.list=(await aiRead(e.target.files[0],sh)).map(x=>({...x,on:true,confezioni:x.confezioni||1}))}catch(x){console.error(x);shot=null;vmsg=x.message=="noai"?"La lettura con Gemini non è attiva: controlla Firebase AI Logic (vedi LEGGIMI).":"Non sono riuscito a leggere la foto: riprova con più luce, oppure aggiungi a mano.";sheet=true}
    if(shot)shot.busy=false;render();return}
  if(e.target.dataset.aif=="on"){readShot();render();return}
if(e.target.id=="ns")$("#nl").value=dl(e.target.value);
  const ps=e.target.dataset.ps;if(ps){const[d,k]=ps.split("|");setDoc(doc(db,"households",H.id,"plan",isoD(monday(wk))),{m:{[d]:{[k]:e.target.value}}},{merge:true})}});
render();
// apertura: dura meno di 3 secondi, si salta con un tocco
const sp=$("#splash");if(sp){const bye=()=>sp.remove();sp.addEventListener("click",bye);sp.addEventListener("animationend",e=>{if(e.target==sp)bye()});setTimeout(bye,2900)}
