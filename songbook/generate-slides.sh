#! /bin/bash

OPTION="$1"

if [ "$OPTION" = '-f' ]; then
	export FORCE=1
fi

if [ "$OS" = 'Darwin' ]; then
	export MSCORE='/Applications/MuseScore.app/Contents/MacOS/mscore'
else
	export MSCORE='mscore'
fi

_generate() {
	SCORE="$1"
	DIR=$(dirname $SCORE)
	PDF=$DIR/score.pdf
	if [ "$FORCE" ] || [ ! -f "${DIR}/slides/01.svg" ]; then
		echo "Generate ${PDF}"
		"$MSCORE" --export-to "${PDF}" "${SCORE}" > /dev/null 2>&1
		mkdir "${DIR}/slides" > /dev/null 2>&1
		pdf2svg "${PDF}" "${DIR}/slides/%02d.svg" all
		echo "Generate image files: $(ls "${DIR}/slides")"
		rm -f ${PDF}
	fi
}

export -f _generate

find "." \
	-iname "score.mscx" \
	-exec bash -c '_generate "$0"' {} \;
exit
