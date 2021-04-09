cc.Class({
    extends: cc.Component,

    properties: {
    },

    addToggleClickEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var checkEvents = node.getComponent(cc.Toggle).checkEvents;
        checkEvents.push(eventHandler);
    },

    addClickEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
    
    addSlideEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
    },

    addTextChangedEvent:function(node,target,component,handler){
        var editboxEventHandler = new cc.Component.EventHandler();
        editboxEventHandler.target = target; //这个 node 节点是你的事件处理代码组件所属的节点
        editboxEventHandler.component = component;
        editboxEventHandler.handler = handler;

        var editbox = node.getComponent(cc.EditBox);
        editbox.textChanged.push(editboxEventHandler);
    },

    //提示轮播
    tipsCarousel(node,label,content,delayTime) {
        node.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.callFunc(function () {
                        label.string = content + ".";
                    }, this),
                    cc.delayTime(delayTime),
                    cc.callFunc(function () {
                        label.string = content + "..";
                    }, this),
                    cc.delayTime(delayTime),
                    cc.callFunc(function () {
                        label.string = content + "...";
                    }, this),
                    cc.delayTime(delayTime),
                )
            )
        );
    },

    parseRichTextFloat (str) {
        let v = /^(?:<[^>]+>)+([^<]+)(?:<\/[^>]+>)+$/g.exec(str);
        if (!!v && v.length == 2) {
            return parseFloat(v[1]);
        } else {
            return 0;
        }
    },

    formatRichText(val, color, isBold, isItalic) {
        let result = "<color=" + color + ">" + val + "</c>";
        if (isBold) {
            result = "<b>" + result + "</b>";
        }
        if (isItalic) {
            result = "<i>" + result + "</i>";
        }
        return result;
    },

    getCard (cardstr) {
        if (cardstr == '' || typeof(cardstr) != 'string') {
            return 52;
        }
        //根据texas.lua中PokerString的牌点定义
        let color = cardstr.slice(0, 2);
        let num = cardstr.slice(2, 4);
        let result = 0;
        if (color === '黑桃') {
            result = 0;
        } else if (color === '红心') {
            result = 1;
        } else if (color === '梅花') {
            result = 2;
        } else if (color === '方块') {
            result = 3;
        }
        result *= 13;
        if (num === 'J') {
            result += 9;
        } else if (num === 'Q') {
            result += 10;
        } else if (num === 'K') {
            result += 11;
        } else if (num === 'A') {
            result += 12;
        } else {
            result += parseInt(num) - 2;
        }
        return result;
    },

    getCardType (str) {
        if (str == "皇家同花顺") {
            return "Royal flush";
        } else if (str == "同花顺") {
            return "Straight flush";
        } else if (str == "四条") {
            return "Four of a kind";
        } else if (str == "葫芦") {
            return "Full house";
        } else if (str == "同花") {
            return "Flush";
        } else if (str == "顺子") {
            return "Straight";
        } else if (str == "三条") {
            return "Three of a kind";
        } else if (str == "两对") {
            return "Two pairs";
        } else if (str == "对子") {
            return "One pair";
        } else if (str == "高牌") {
            return "High card";
        } else {
            return "";
        }
    },

    getNowFormatDate () {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var hour = date.getHours();
        if (hour >= 0 && hour <= 9) {
            hour = "0" + hour;
        }
        var mins = date.getMinutes();
        if (mins >= 0 && mins <= 9) {
            mins = "0" + mins;
        }
        var secs = date.getSeconds();
        if (secs >= 0 && secs <= 9) {
            secs = "0" + secs;
        }
    
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + hour + seperator2 + mins + seperator2 + secs;
        return currentdate;
    },
    
    formatValue (value) {
        if (parseFloat(value) >= 1e9) {
            return Math.round(value/1e9 * 1e2) / 1e2 + "B";
        } else if (parseFloat(value) >= 1e6) {
            return Math.round(value/1e6 * 1e2) / 1e2 + "M";
        } else if (parseFloat(value) >= 1e3) {
            return Math.round(value/1e3 * 1e2) / 1e2 + "K";
        } else {
            return Math.round(value * 1e2) / 1e2;
        }
    },

    formatClubID (clubID) {
        if (clubID < 10) {
            return "00000" + clubID;
        } else if (clubID < 100) {
            return "0000" + clubID;
        } else if (clubID < 1000) {
            return "000" + clubID;
        } else if (clubID < 10000) {
            return "00" + clubID;
        } else if (clubID < 100000) {
            return "0" + clubID;
        } else {
            return "" + clubID;
        }
    },

    numberToString (value) {
        let ePlusPos = value.toString().indexOf("e+");
        if (ePlusPos == -1) {
            return value.toString();
        }
        let ptPos = value.toString().indexOf(".");
        if (ptPos == -1) {
            let zeroNum = value.toString().substring(ePlusPos + 2);
            let result = value.toString().substring(0, ePlusPos);
            for (let i = 0; i < zeroNum; i++) {
                result += "0";
            }
            return result;
        }
        let fraction = ePlusPos - ptPos - 1;
        let result = value.toString().substring(0, ePlusPos) * Math.pow(10, fraction);
        let zeroNum = value.toString().substring(ePlusPos + 2) - fraction;
        for (let i = 0; i < zeroNum; i++) {
            result += "0";
        }
        return result;
    },

    setOriginValue (attr,val,color="white") {
        attr.value = val.toString();
        let formatValue = cc.dgame.utils.formatValue(val);
        console.log("setOriginValue val:" + val + ', formatValue:' + formatValue);
        let colorVal = "";
        if (color == "white") {
            colorVal = "#FFFFFF";
        } else if (color == "yellow") {
            colorVal = "#FFBC1D";
        } else if (color == "brown") {
            colorVal = "#663708";
        }
        if (colorVal) {
            attr.string = cc.dgame.utils.formatRichText(formatValue, colorVal, true, false);
        } else {
            attr.string = formatValue;
        }
    },

    getOriginValue (attr) {
        if (!attr.value) {
            attr.value = "0";
        }
        return parseFloat(attr.value)
    },

    timestampToTime (timestamp) {
        const dateObj = new Date(+timestamp) // ps, 必须是数字类型，不能是字符串, +运算符把字符串转化为数字，更兼容
        const year = dateObj.getFullYear() // 获取年，
        const month = dateObj.getMonth() + 1 // 获取月，必须要加1，因为月份是从0开始计算的
        const date = dateObj.getDate() // 获取日，记得区分getDay()方法是获取星期几的。
        const hours = this.pad(dateObj.getHours())  // 获取时, pad函数用来补0
        const minutes = this.pad(dateObj.getMinutes()) // 获取分
        const seconds = this.pad(dateObj.getSeconds()) // 获取秒
        return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds
    },

    timestampToDate (timestamp) {
        const dateObj = new Date(+timestamp) // ps, 必须是数字类型，不能是字符串, +运算符把字符串转化为数字，更兼容
        const year = dateObj.getFullYear() // 获取年，
        const month = dateObj.getMonth() + 1 // 获取月，必须要加1，因为月份是从0开始计算的
        const date = dateObj.getDate() // 获取日，记得区分getDay()方法是获取星期几的。
        return date + '-' + month + '-' + year
    },

    timestampToHourMin (timestamp) {
        const dateObj = new Date(+timestamp) // ps, 必须是数字类型，不能是字符串, +运算符把字符串转化为数字，更兼容
        const hours = this.pad(dateObj.getHours())  // 获取时, pad函数用来补0
        const minutes = this.pad(dateObj.getMinutes()) // 获取分
        return hours + ':' + minutes
    },

    //note: time < 24 hours
    timeToHMS (time) {
        let hours = this.pad(Math.floor(time/3600));
        let remain = time - 3600*hours;
        let minutes = this.pad(Math.floor(remain/60));
        let sec = this.pad(Math.floor(remain%60));
        return hours + ':' + minutes + ':' + sec
    },
    
    pad (str) {
        return +str >= 10 ? str : '0' + str
    },
    
});