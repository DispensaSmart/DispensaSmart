#!/bin/sh
# Unisce dati, logica e grafica in un unico public/index.html
cd "$(dirname "$0")"
mkdir -p public
python3 - <<'PY'
d=open("data.js").read();a=open("src/app.js").read().replace("/*DATA*/",d);s=open("src/shell.html").read().replace("/*APP*/",a)
# versione nel nome di config.js: il browser non tiene in memoria una configurazione vecchia
import time;s=s.replace('from"./config.js"','from"./config.js?v=%d"'%time.time())
open("public/index.html","w").write(s)
PY
[ -f public/config.js ] || cp config.example.js public/config.js
