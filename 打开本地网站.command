#!/bin/zsh

ROOT="/Users/zhouhao/Documents/Find Future."
URL="http://127.0.0.1:4173/portfolio-site/index.html"
LOG="/tmp/zhouhao-portfolio-preview.log"

if ! /usr/bin/curl -fsS "$URL" >/dev/null 2>&1; then
  /usr/bin/nohup /usr/bin/python3 -m http.server 4173 \
    --bind 127.0.0.1 \
    --directory "$ROOT" >"$LOG" 2>&1 &
  sleep 1
fi

/usr/bin/open "$URL"
