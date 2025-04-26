#!/usr/bin/env bash
mkdir -p static/posts/paper/img
cp -R src/lib/posts/paper/img/* static/posts/paper/img/
echo "✅ images moved to static/posts/paper/img"
