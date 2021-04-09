var Log = require("Log")

var Global = cc.Class({
    extends: cc.Component,
    statics: {
        netControl: null,
        _handlers: null,
        _msgid: null,
        _eventName2handler: null,
        _subeventName2msgid: null,
        _unsubeventName2msgid: null,
        _subscriptionid2eventName: null,
        _eventName2subscriptionid: null,
        connected: false,
        _msgId:function() {
            return this._msgid++;
        },

        _addHandler:function(msgid, fn) {
            if(this._handlers[msgid]){
                console.log("msgid:" + msgid + "' handler has been registered.");
                return;
            }
            var handler = function(data){
                //console.log(event + "(" + typeof(data) + "):" + (data? data.toString():"null"));
                //if(typeof(data) == "string"){
                //    data = JSON.parse(data);
                //}
                fn(data);
            };
            
            this._handlers[msgid] = handler; 
        },

        /*
        connect:function(fnConnect, fnError, addr) {
            this._handlers = {};
            this._msgid = 0;
            this._eventName2handler = {};
            this._eventName2msgid = {};
            this._subscriptionid2eventName = {};
            this._eventName2subscriptionid = {};
            this.netControl = require('NetControl');
            this.netControl.connect(addr);
            this.messageFire = onfire.on("onopen", fnConnect.bind(this));
            this.messageFire = onfire.on("onclose", fnError.bind(this));
            this.messageFire = onfire.on("onmessage", this._onMessage.bind(this));
        },

        sendMsg:function(params, msgHandler) {
            var data = {
                jsonrpc: "2.0",
                method: "dgame_call",
                params: params,
                id: this._msgId(),
            };
            if (msgHandler != null && msgHandler != undefined) {
                this._addHandler(data.id, msgHandler.bind(this));
            }
            this.netControl.send(JSON.stringify(data));
        },
        */
        removeAllMsg:function() {
            Log.Trace("removeAllMsg");
            this._handlers = {}
        },

        _eventHandler:function(result) {
            this._subscriptionid2eventName
        },

        addEventListener:function(params, eventHandler) {
            var data = {
                jsonrpc: "2.0",
                method: "dgame_subscribe",
                params: params,
                id: this._msgId(),
            };
            this._eventName2handler[params[0]] = eventHandler;
            this._subeventName2msgid[params[0]] = data.id;
            //this.netControl.send(JSON.stringify(data));
            Log.Trace("addEventListener: " + JSON.stringify(data));
            if (cc.sys.isNative) {
                if (cc.sys.isMobile) {
                    if (cc.sys.os === cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod("NativeGengine", "GameSubscribe:andCallBack:", JSON.stringify(data), "cc.dgame.net.onMessage");
                    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", "GameSubscribeAndCallBack", "(Ljava/lang/String;Ljava/lang/String;)V", JSON.stringify(data), "cc.dgame.net.onMessage");
                    }    
                } else {
                    if (cc.sys.os === cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                        var ret = GameSubscribe(JSON.stringify(data));
                        Log.Debug("GameSubscribe ret = "+ret);
                        this.onMessage(ret);
                    }
                }
            }
        },

        removeEventListener:function(params) {
            Log.Trace("removeEventListener: " + params[0]);
            var data = {
                jsonrpc: "2.0",
                method: "dgame_unsubscribe",
                params: [this._eventName2subscriptionid[params[0]]],
                id: this._msgId(),
            };
            if (this._eventName2subscriptionid[params[0]] != null) {
                this._eventName2handler[params[0]] = null;
                Log.Trace("Remove EventName: " + params[0] + ", SubscriptionId: " + this._eventName2subscriptionid[params[0]]);
                this._unsubeventName2msgid[params[0]] = data.id;
                //this.netControl.send(JSON.stringify(data));
                if (cc.sys.isNative) {
                    if (cc.sys.isMobile) {
                        if (cc.sys.os === cc.sys.OS_IOS) {
                            jsb.reflection.callStaticMethod("NativeGengine", "GameCall:andCallBack:", JSON.stringify(data), "cc.dgame.net.onMessage");
                        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                            jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", "GameCallAndCallBack", "(Ljava/lang/String;Ljava/lang/String;)V", JSON.stringify(data), "cc.dgame.net.onMessage");
                        }
                    } else {
                        if (cc.sys.os === cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                            var ret = GameCall(JSON.stringify(data));
                            Log.Debug("removeEventListener GameCall ret = " + ret);
                            this.onMessage(ret);
                        }
                    }
                }
            }
        },

        _isSubscriptionMsgid:function(msgid) {
            for (var eventName in this._subeventName2msgid) {
                if (this._subeventName2msgid[eventName] == msgid)
                    return eventName;
            }
            return null;
        },

        _isUnsubscriptionMsgid:function(msgid) {
            for (var eventName in this._unsubeventName2msgid) {
                if (this._unsubeventName2msgid[eventName] == msgid)
                    return eventName;
            }
            return null;
        },
        /*
        _onMessage:function(obj){
            Log.Trace("_onMessage: " + JSON.stringify(obj.data));
            var jsonRpc = JSON.parse(obj.data);
            if (jsonRpc.id != undefined) {
                var eventName = this._isSubscriptionMsgid(jsonRpc.id);
                if (eventName != null) {
                    this._subscriptionid2eventName[jsonRpc.result] = eventName;
                    this._eventName2subscriptionid[eventName] = jsonRpc.result;
                    Log.Trace("Add EventName: " + eventName + ", SubscriptionId: " + jsonRpc.result);
                    this._eventName2msgid[eventName] = null;
                } else {
                    if (this._handlers[jsonRpc.id]) {
                        this._handlers[jsonRpc.id](jsonRpc.result);
                    }
                }
                this._handlers[jsonRpc.id] = null;
            } else {
                var subscriptionid = jsonRpc.params.subscription;
                if (this._eventName2handler[this._subscriptionid2eventName[subscriptionid]]) {
                    Log.Trace("Invoke SubscriptionId: " + subscriptionid + ", EventName: " + this._subscriptionid2eventName[subscriptionid] + ", data: " + obj.data);
                    this._eventName2handler[this._subscriptionid2eventName[subscriptionid]](jsonRpc.params.result);
                }
            }
        },
        */

        onMessage (jsonstr){
            Log.Trace("onMessage: " + jsonstr);
            var jsonRpc = JSON.parse(jsonstr);
            if (jsonRpc.id != undefined) {
                //call返回：{"jsonrpc":"2.0","id":9,"result":"{\"SeatStatus\":3}"}
                var subeventName = this._isSubscriptionMsgid(jsonRpc.id);
                var unsubeventName = this._isUnsubscriptionMsgid(jsonRpc.id);
                if (subeventName != null || unsubeventName != null) {
                    //subscribe返回：{"jsonrpc":"2.0","id":11,"result":"0x609c1054e40bab03aeed1a6c42a5b424"}
                    //unsubscribe返回：{"jsonrpc":"2.0","id":58,"result":true}
                    if (subeventName != null) {
                        this._subscriptionid2eventName[jsonRpc.result] = subeventName;
                        this._eventName2subscriptionid[subeventName] = jsonRpc.result;
                        Log.Trace("Add EventName: " + subeventName + ", SubscriptionId: " + jsonRpc.result);
                        this._subeventName2msgid[subeventName] = null;
                    }
                    if (unsubeventName != null) {
                        var subscriptionid = this._eventName2subscriptionid[unsubeventName];
                        Log.Trace("Remove EventName: " + unsubeventName + ", SubscriptionId: " + subscriptionid);
                        this._eventName2subscriptionid[unsubeventName] = null;
                        this._subscriptionid2eventName[subscriptionid] = null;
                        this._unsubeventName2msgid[unsubeventName] = null;
                    }
                } else {
                    if (this._handlers[jsonRpc.id]) {
                        this._handlers[jsonRpc.id](jsonRpc.result);
                    }
                }
                this._handlers[jsonRpc.id] = null;
            } else {
                //事件回调：{"jsonrpc":"2.0","method":"dgame_subscription","params":{"subscription":"0x609c1054e40bab03aeed1a6c42a5b424",
                //"result":{"Addr":"0x5806dc6556C3b2343ECC150A5eA8D3cB3ABA41F5","Amount":"20000","Errstr":
                //"SitDown Result Msg timeout","Pos":2,"Tableid":4222124650659841}}}
                var subscriptionid = jsonRpc.params.subscription;
                if (this._eventName2handler[this._subscriptionid2eventName[subscriptionid]]) {
                    Log.Trace("Invoke SubscriptionId: " + subscriptionid + ", EventName: " + this._subscriptionid2eventName[subscriptionid] + ", data: " + jsonstr);
                    this._eventName2handler[this._subscriptionid2eventName[subscriptionid]](jsonRpc.params.result);
                }
            }
        },

        init () {
            this._handlers = {};
            this._msgid = 0;
            this._eventName2handler = {};   //事件名称到响应函数的映射关系
            this._subeventName2msgid = {};     //订阅事件名称与订阅消息id映射关系
            this._unsubeventName2msgid = {};     //取消订阅事件名称与订阅消息id映射关系
            this._subscriptionid2eventName = {};    //订阅id与事件名称的映射关系
            this._eventName2subscriptionid = {};    //事件名称与订阅id的映射关系
        },

        gameCall (params, msgHandler) {
            var data = {
                jsonrpc: "2.0",
                method: "dgame_call",
                params: params,
                id: this._msgId(),
            };
            if (!this.connected && params[0] != "rungame" && params[0] != "selfaddress") {
                Log.Warn("gameCall: " + JSON.stringify(data) + " failed.");
                return;
            }
            if (msgHandler != null && msgHandler != undefined) {
                this._addHandler(data.id, msgHandler.bind(this));
            }
            Log.Trace("gameCall: " + JSON.stringify(data));
            if (cc.sys.isNative) {
                if (cc.sys.isMobile) {
                    if (cc.sys.os === cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod("NativeGengine", "AsyncGameCall:andCallBack:", JSON.stringify(data), "cc.dgame.net.onMessage");
                    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", "AsyncGameCallAndCallBack", "(Ljava/lang/String;Ljava/lang/String;)V", JSON.stringify(data), "cc.dgame.net.onMessage");
                    }
                } else {
                    if (cc.sys.os === cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                        AsyncGameCall(JSON.stringify(data), "cc.dgame.net.onMessage");
                    }
                }
            }
        },
    },
});