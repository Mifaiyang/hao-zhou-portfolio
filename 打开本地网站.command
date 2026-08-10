#!/bin/zsh

SITE_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
PORT=4173
LOG="/tmp/zhouhao-portfolio-preview.log"

is_portfolio() {
  /usr/bin/curl -fsS "$1" 2>/dev/null | /usr/bin/grep -q "周灏｜内容 × 影像 × AI"
}

URL="http://127.0.0.1:${PORT}/index.html"
LEGACY_URL="http://127.0.0.1:${PORT}/portfolio-site/index.html"

if is_portfolio "$URL"; then
  :
elif is_portfolio "$LEGACY_URL"; then
  URL="$LEGACY_URL"
else
  while /usr/sbin/lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
    PORT=$((PORT + 1))
  done
  URL="http://127.0.0.1:${PORT}/index.html"
  /usr/bin/nohup /usr/bin/python3 -m http.server "$PORT" \
    --bind 127.0.0.1 \
    --directory "$SITE_DIR" >"$LOG" 2>&1 &

  for _ in {1..30}; do
    is_portfolio "$URL" && break
    sleep 0.1
  done

  if ! is_portfolio "$URL"; then
    /bin/echo "本地预览启动失败，日志：$LOG"
    exit 1
  fi
fi

/usr/bin/open "$URL"
