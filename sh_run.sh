#!/bin/bash


# tsc

# npx tsc src/ts-framework/browser/index.ts --declaration --module amd --outFile ./build/out.js


# npx bun run ./configs/rollupjs-build.js build-options-debug

# exit 0





# npx webidl-dts-gen -ed -n bulletjs -i bulletjs.idl -o index.d.ts


# sh sh_build.sh




#!/bin/bash

my_border_print() {
  BORDER_SIZE=${1}
  for index in $(seq 1 "$BORDER_SIZE")
  do
    echo -n "#"
  done
  echo ""
}

my_title_print() {
  MESSAGE=${1}
  MESSAGE_SIZE=${#1}
  BORDER_SIZE=$(($MESSAGE_SIZE + 6))

  my_border_print ${BORDER_SIZE}
  echo "## ${MESSAGE} ##"
  my_border_print ${BORDER_SIZE}
}

my_title_print "BUILDING"

echo ""
echo "Shell => ${SHELL}"
echo ""
echo "Build what?"
echo "=> Bullet Wrapper options: 1"
echo "=> ts samples basic:       2"
echo "=> ts samples server:      3"
# echo "=> ts samples battlefield: 4"
echo ""

read USER_INPUT

case ${USER_INPUT} in
  1)
    echo "=> Bullet Wrapper options"

    cd ./src/wasm-build || exit 1
    sh sh_build.sh
    ;;
  2)
    echo "=> ts samples basic"

    # npm run bunjs-build-basic-debug
    npm run rollupjs-build-basic-release
    ;;
  3)
    echo "=> ts samples server"

    # npm run bunjs-build-server-debug
    npm run rollupjs-build-server-release
    ;;
  # 4)
  #   echo "=> ts samples battlefield"

  #   npm run bunjs-build-battlefield-debug
  #   # npm run rollupjs-build-server-debug
  #   ;;
  *)
    echo "=> INVALID CHOICE"
    ;;
esac
