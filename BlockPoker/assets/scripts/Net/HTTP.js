//var URL = "http://127.0.0.1:9000";
//var URL = "http://152.32.254.75";
var URL = "http://106.75.184.214";
var Log = require("Log")

var HTTP = cc.Class({
    extends: cc.Component,

    statics:{
        sessionId : 0,
        userId : 0,
        master_url:URL,
        url:URL,
        sendRequest : function(path,data,handler,extraUrl){
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = 5000;
            xhr.ontimeout = function() {
                xhr.abort();
                if (handler !== null) {
                    handler(null, extraUrl);
                }
            };

            var timerId = setTimeout(xhr.ontimeout, 5000);
            var str = "?";
            for(var k in data){
                if(str != "?"){
                    str += "&";
                }
                str += k + "=" + data[k];
            }
            if(extraUrl == null){
                extraUrl = HTTP.url;
            }
            var requestURL = extraUrl + path;
            if (str != "?") {
                requestURL += encodeURI(str);
            }
            Log.Trace("RequestURL:" + requestURL);
            xhr.open("GET",requestURL, true);
            if (cc.sys.isNative){
                xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8");
                //xhr.setRequestHeader("Host","enode.kalscan.io");
            }
            
            xhr.onreadystatechange = function() {
                console.log(cc.dgame.utils.getNowFormatDate() + " xhr.readyState: " + xhr.readyState)
                if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)){
                    clearTimeout(timerId);
                    Log.Trace("http res("+ xhr.responseText.length + "):" + xhr.responseText);
                    try {
                        var ret = JSON.parse(xhr.responseText);
                        if (handler !== null){
                            handler(ret, extraUrl);
                        }                        /* code */
                    } catch (e) {
                        Log.Trace("err:" + e);
                        //handler(null);
                    }
                    finally{
                        if(cc.vv && cc.vv.wc){
                        //       cc.vv.wc.hide();    
                        }
                    }
                }
            };
            
            if(cc.vv && cc.vv.wc){
                //cc.vv.wc.show();
            }
            console.log(cc.dgame.utils.getNowFormatDate() + " before xhr.send");
            xhr.send();
            console.log(cc.dgame.utils.getNowFormatDate() + " after xhr.send");
            return xhr;
        },
    },
});
