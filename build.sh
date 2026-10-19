#!/bin/sh
# Unisce dati, logica e grafica in un unico public/index.html
cd "$(dirname "$0")"
mkdir -p public
python3 - <<'PY'
d=open("data.js").read();a=open("src/app.js").read().replace("/*DATA*/",d);s=open("src/shell.html").read().replace("/*APP*/",a)
open("public/index.html","w").write(s)
PY
[ -f public/config.js ] || cp config.example.js public/config.js
