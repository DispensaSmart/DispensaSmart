#!/bin/sh
# Unisce dati, logica, grafica e configurazione Firebase in un unico public/index.html
cd "$(dirname "$0")"
mkdir -p public
[ -f public/config.js ] || cp config.example.js public/config.js
python3 - <<'PY'
d=open("data.js").read();a=open("src/app.js").read().replace("/*DATA*/",d)
# la configurazione va dentro la pagina: così il browser non può tenerne in memoria una vecchia
c=open("public/config.js").read().replace("export const firebaseConfig","const firebaseConfig")
imp='import{firebaseConfig}from"./config.js";'
assert imp in a
a=a.replace(imp,c)
s=open("src/shell.html").read().replace("/*APP*/",a)
open("public/index.html","w").write(s)
PY
