chcp 65001
xcopy C:\go_proj\src\BlockPoker-new\build_kaleido\jsb-link\frameworks\runtime-src\proj.android-studio\app\src\org\cocos2dx\javascript\AppActivity.java C:\go_proj\src\BlockPoker-new\build\jsb-link\frameworks\runtime-src\proj.android-studio\app\src\org\cocos2dx\javascript\ /Y
xcopy C:\go_proj\src\BlockPoker-new\build_kaleido\jsb-link\frameworks\runtime-src\proj.android-studio\app\src\io C:\go_proj\src\BlockPoker-new\build\jsb-link\frameworks\runtime-src\proj.android-studio\app\src\io /I /E /Y
xcopy C:\go_proj\src\BlockPoker-new\build_kaleido\jsb-link\frameworks\runtime-src\proj.android-studio\app\res C:\go_proj\src\BlockPoker-new\build\jsb-link\frameworks\runtime-src\proj.android-studio\app\res /I /E /Y
xcopy C:\go_proj\src\BlockPoker-new\build_kaleido\jsb-link\frameworks\runtime-src\proj.android-studio\app\proguard-rules.pro C:\go_proj\src\BlockPoker-new\build\jsb-link\frameworks\runtime-src\proj.android-studio\app\ /Y
xcopy C:\go_proj\src\BlockPoker-new\build_kaleido\jsb-link\frameworks\runtime-src\proj.android-studio\app\AndroidManifest.xml C:\go_proj\src\BlockPoker-new\build\jsb-link\frameworks\runtime-src\proj.android-studio\app\ /Y
xcopy C:\go_proj\src\github.com\kaleidochain\kaleido\build\bin\gengine.aar C:\go_proj\src\BlockPoker-new\build\jsb-link\frameworks\runtime-src\proj.android-studio\app\libs\ /Y
REM 还需要手动修改build\jsb-link\frameworks\runtime-src\proj.android-studio\app\build.gradle
REM versionCode改为： 2
REM versionName改为： "1.0.1"
REM minifyEnabled改为: false
REM shrinkResources改为: false
pause