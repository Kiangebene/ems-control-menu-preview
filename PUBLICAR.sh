#!/usr/bin/env bash
set -euo pipefail

REPO="Kiangebene/ems-control-menu-preview"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
command -v git >/dev/null || { echo 'É necessário instalar git.'; exit 1; }
command -v python3 >/dev/null || { echo 'É necessário instalar python3.'; exit 1; }
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "A preparar publicação de $REPO (apenas o repositório de teste)..."
git clone "https://github.com/$REPO.git" "$TMP_DIR/repo"
[[ "$(git -C "$TMP_DIR/repo" remote get-url origin)" == "https://github.com/$REPO.git" ]] || { echo "Repositório inesperado"; exit 1; }
python3 - "$SOURCE_DIR" "$TMP_DIR/repo" <<'PY'
import os, shutil, sys
src,dst=sys.argv[1:]
for item in os.listdir(dst):
    if item=='.git': continue
    p=os.path.join(dst,item)
    if os.path.isdir(p) and not os.path.islink(p): shutil.rmtree(p)
    else: os.unlink(p)
for item in os.listdir(src):
    if item in {'.git','node_modules','dist'}: continue
    s=os.path.join(src,item);d=os.path.join(dst,item)
    if os.path.isdir(s) and not os.path.islink(s): shutil.copytree(s,d)
    else: shutil.copy2(s,d)
PY
cd "$TMP_DIR/repo"
git add -A
if git diff --cached --quiet; then echo 'Não existem alterações a publicar.';exit 0;fi
git commit -m "Restore original React EMS dashboard and premium sidebar"
git push origin main
cat <<'MSG'
Código enviado ao repositório de demonstração.
Para ativar o build React no GitHub Pages, abre:
https://github.com/Kiangebene/ems-control-menu-preview/settings/pages
Em "Build and deployment > Source", escolhe "GitHub Actions".
Depois consulta:
https://github.com/Kiangebene/ems-control-menu-preview/actions
URL público:
https://kiangebene.github.io/ems-control-menu-preview/
MSG
