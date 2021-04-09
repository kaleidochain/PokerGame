

安装cocos creator 2.3.2，安装步骤和android基本相同，但是cocos2.3.2 后android下目录结构变化导致有几点不同:

1. 将build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/app/src/org/cocos2dx/javascript/AppActivity.java中的修改拷贝至build/jsb-link/frameworks/runtime-src/proj.android-studio/app/src/org/cocos2dx/javascript/AppActivity.java

   注意 build/jsb-link/frameworks/runtime-src/proj.android-studio/app 下面可能没有src目录 需要自己创建

   同时删除掉 build/jsb-link/frameworks/runtime-src/proj.android-studio/src/org/cocos2dx/javascript/AppActivity.java  这个文件是cocos2.3.2 自动生成的

2.  将build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/app/src/io整个目录拷贝至build/jsb-link/frameworks/runtime-src/proj.android-studio/app/src/  这个保持不变，注意目录

3. 将build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/app/res/整个目录拷贝至build/jsb-link/frameworks/runtime-src/proj.android-studio/res/   注意 后面这个res目录，不是在app目录下面的

   下面几点保持不变 注意修改的一定是在app目录下面的

4. build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/app/proguard-rules.pro和build/jsb-link/frameworks/runtime-src/proj.android-studio/app/proguard-rules.pro，修改使其相同，修改点在文件最后添加:

```
 # keep kaleido for release.
-keep public class io.kaleidochain.** { *; }
-dontwarn io.kaleidochain.**
```
5. 比较build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/app/build.gradle
   和build/jsb-link/frameworks/runtime-src/proj.android-studio/app/build.gradle，
    修改点为将 minifyEnabled 和 shrinkResources 均设置为 false，和

``` 
       applicationId "io.kaleidochain.BlockPoker"
        minSdkVersion PROP_MIN_SDK_VERSION
        targetSdkVersion PROP_TARGET_SDK_VERSION
        versionCode 2
        versionName "1.0.1"
```
 和
``` 
        buildTypes {
        release {
            debuggable false
            jniDebuggable false
            renderscriptDebuggable false
            minifyEnabled false
            shrinkResources false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            if (project.hasProperty("RELEASE_STORE_FILE")) {
                signingConfig signingConfigs.release
            }
```

6. 对比 \build_kaleido\jsb-link\frameworks\runtime-src\proj.android-studio\app\AndroidManifest.xml 和
   \build_kaleido\jsb-link\frameworks\runtime-src\proj.android-studio\app\AndroidManifest.xml
   修改点：

``` 
      package="io.kaleidochain.BlockPoker"
      ...
     android:keepScreenOn="true"
```
7. 在build/jsb-link/frameworks/runtime-src/proj.android-studio/app/中创建libs目录，并将 gengine.aar 拷贝到libs目录。

8. 重新构建项目，选择 android ，andoird28， armv7 和armv8， 编译会生成最后apk包，apk包在
     build\jsb-link\frameworks\runtime-src\proj.android-studio\app\build\outputs\apk 目录

  注：如果在windows编译中修改了cocos 的安装目录的 如 D:\CocosCreator_2.2.2\resources\cocos2d-x\cocos\platform\CCApplication.h， 修改重点是：
```
      inline std::shared_ptr<Scheduler> getScheduler() const { return _scheduler; }
      改为
      inline Scheduler* getScheduler() const { return Application::_scheduler.get();}

          static std::shared_ptr<Scheduler> _scheduler;
       改为
       public ：
       static std::shared_ptr<Scheduler> _scheduler;
```
这样修改后在android编译也可能出现_scheduler = Application::getInstance()->getScheduler()的编译错误;，需要对对应的代码做修改：```_scheduler =  Application::getInstance()->getScheduler();``` 这个地方的全部改成
    ```_scheduler = Application::_scheduler;```
主要是 cocos目录下    D:\CocosCreator_2.2.2\resources\cocos2d-x\cocos\network文件 HttpClient-android.cpp

