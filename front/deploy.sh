#!bash

TAG=$1
zipfile="crosswords-${TAG}.tar.tz"
npm run build

cd build
tar -czvf $zipfile .
gsutil cp $zipfile gs://alster-crosswords/$zipfile
rm $zipfile

#https://storage.googleapis.com/alster-crosswords/$zipfile

