#!/bin/bash

rm -rf tempFolder/
unzip gengine.aar -d tempFolder
rm -vf tempFolder/jni/x86/libgojni.so
rm -vf tempFolder/jni/x86_64/libgojni.so
jar cvf newgengine.aar -C tempFolder/ .
rm -vf gengine.aar
mv newgengine.aar gengine.aar
