#! /bin/bash

JS_PATH=/home/django/acapp/game/static/js/
JS_PATH2=/home/django/acapp/static/js/              #! This is used for the acapp/static
JS_PATH_DIST=${JS_PATH}dist/
JS_PATH_SRC=${JS_PATH}src/
JS_PATH2_DIST=${JS_PATH2}dist/
JS_PATH2_SRC=${JS_PATH2}src/

find ${JS_PATH_SRC} -type f -name '*.js' | sort | xargs cat > ${JS_PATH_DIST}game.js
find ${JS_PATH2_SRC} -type f -name '*.js' | sort | xargs cat > ${JS_PATH2_DIST}game.js
echo "yes" | python3 ../manage.py collectstatic
