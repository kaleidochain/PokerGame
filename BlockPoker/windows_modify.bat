xcopy C:\go_proj\src\BlockPoker\build_kaleido\jsb-link\frameworks\runtime-src\Classes\cocos2.3.2\AppDelegate.cpp C:\go_proj\src\BlockPoker\build\jsb-link\frameworks\runtime-src\Classes\ /Y
xcopy C:\go_proj\src\BlockPoker\build_kaleido\jsb-link\frameworks\runtime-src\Classes\jsb_module_register.cpp C:\go_proj\src\BlockPoker\build\jsb-link\frameworks\runtime-src\Classes\ /Y
xcopy C:\go_proj\src\BlockPoker\build_kaleido\jsb-link\frameworks\runtime-src\proj.win32\main.cpp C:\go_proj\src\BlockPoker\build\jsb-link\frameworks\runtime-src\proj.win32\ /Y
xcopy C:\go_proj\src\github.com\kaleidochain\kaleido\cmd\window_gengine\windows_gengine.h C:\go_proj\src\BlockPoker\build\jsb-link\frameworks\runtime-src\proj.win32\ /Y
xcopy C:\go_proj\src\github.com\kaleidochain\kaleido\cmd\window_gengine\windows_gengine.lib C:\go_proj\src\BlockPoker\build\jsb-link\frameworks\runtime-src\proj.win32\ /Y
xcopy C:\go_proj\src\github.com\kaleidochain\kaleido\cmd\window_gengine\windows_gengine.dll C:\go_proj\src\BlockPoker\build\jsb-link\frameworks\runtime-src\proj.win32\Release.win32\ /Y
REM xcopy C:\go_proj\src\BlockPoker\build_kaleido\jsb-link\frameworks\runtime-src\proj.android-studio\app\res\raw\portal.lua C:\go_proj\src\BlockPoker\build\jsb-link\frameworks\runtime-src\proj.win32\Release.win32\ /Y
REM windows_gengine.h need modify
REM NOTE portal.lua
REM removed build dir need modify BlockPoker.vcxproj
pause