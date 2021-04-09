// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        //房间类型
        roomTypes: [cc.Toggle],
        //盲注设置
        blindInfo: cc.Label,                //大小盲，共11档，1、2、5、10、20、25、50、100、200、300、500、1k
        buyinGoldMin: cc.Label,             //最小带入金币数，100BB*最小倍数
        smallBlindSlider: cc.Slider,        //小盲注滑动条
        smallBlindProgress: cc.ProgressBar, //小盲注滑块进度条
        smallBlindSliderBtn: cc.Node,       //小盲注滑动条滑块
        //人数设置
        maxPlayersSlider: cc.Slider,        //人数设置滑动条
        maxPlayersSliderBtn: cc.Node,       //人数设置滑动条滑块
        maxPlayersNodes: [cc.Label],        //人数设置各档节点
        //牌局时长设置
        gameLengthSlider: cc.Slider,        //牌局时长设置滑动条
        gameLengthSliderBtn: cc.Node,       //牌局时长设置滑动条滑块
        gameLengthNodes: [cc.Label],        //牌局时长设置各档节点
        //前注设置，8档长度840，间隔120；9档长度840，间隔105；10档长度846，间隔94
        //盲注1(8): 0, 1, 2, 4, 8, 16, 20, 30
        //盲注2(9): 0, 1, 2, 4, 8, 16, 32, 40, 60
        //盲注5(10): 0, 1, 2, 5, 10, 20, 40, 80, 100, 150
        //盲注10(10): 0, 2, 5, 10, 20, 40, 80, 160, 200, 300
        //盲注20(10): 0, 5, 10, 20, 40, 80, 160, 320, 400, 600
        //盲注25(10): 0, 5, 10, 25, 50, 100, 200, 400, 500, 750
        //盲注50(10): 0, 10, 25, 50, 100, 200, 400, 800, 1000, 1500
        //盲注100(10): 0, 25, 50, 100, 200, 400, 800, 1600, 2000, 3000
        //盲注200(10): 0, 50, 100, 200, 400, 800, 1600, 3200, 4000, 6000
        //盲注300(10): 0, 75, 150, 300, 600, 1200, 2400, 4800, 6000, 9000
        //盲注500(10): 0, 125, 250, 500, 1000, 2000, 4000, 8000, 10000, 15000
        //盲注1000(10): 0, 250, 500, 1000, 2000, 4000, 8000, 16000, 20000, 30000
        slots8AnteSlider: cc.Slider,        //8档前注设置滑动条
        slots9AnteSlider: cc.Slider,        //9档前注设置滑动条
        slots10AnteSlider: cc.Slider,       //10档前注设置滑动条
        slots8AnteSliderBtn: cc.Node,       //8档前注设置滑动条滑块
        slots9AnteSliderBtn: cc.Node,       //9档前注设置滑动条滑块
        slots10AnteSliderBtn: cc.Node,      //10档前注设置滑动条滑块
        slots8AnteNodes: [cc.Label],        //8档前注
        slots9AnteNodes: [cc.Label],        //9档前注
        slots10AnteNodes: [cc.Label],       //10档前注
        //开局人数设置
        slots3AutoStartSlider: cc.Slider,   //3档开局人数设置滑动条
        slots5AutoStartSlider: cc.Slider,   //5档开局人数设置滑动条
        slots8AutoStartSlider: cc.Slider,   //8档开局人数设置滑动条
        slots3AutoStartSliderBtn: cc.Node,  //3档开局人数设置滑动条滑块
        slots5AutoStartSliderBtn: cc.Node,  //5档开局人数设置滑动条滑块
        slots8AutoStartSliderBtn: cc.Node,  //8档开局人数设置滑动条滑块
        slots3AutoStartNodes: [cc.Label],   //3档开局人数
        slots5AutoStartNodes: [cc.Label],   //5档开局人数
        slots8AutoStartNodes: [cc.Label],   //8档开局人数
        //带入金币倍数设置
        buyinGoldMinSlider: cc.Slider,      //带入金币最小倍数滑动条
        buyinGoldMaxSlider: cc.Slider,      //带入金币最大倍数滑动条
        buyinGoldProgress: cc.ProgressBar,  //带入金币倍数进度条
        buyinGoldMinSliderBtn: cc.Node,     //带入金币最小倍数滑块
        buyinGoldMaxSliderBtn: cc.Node,     //带入金币最大倍数滑块
        buyinGoldProgressNode: cc.Node,     //带入金币倍数进度条节点
        buyinGoldTimesNodes: [cc.Label],    //带入金币倍数各档节点
        //强制盲注设置
        btnStraddleOn: cc.Node,             //强制盲注开
        btnStraddleOff: cc.Node,            //强制盲注关
        //多牌设置
        btnRMTOn: cc.Node,                  //多牌开
        btnRMTOff: cc.Node,                 //多牌关
        //保险设置
        insuranceOnLayer: cc.Node,          //保险开设置图层
        insuranceOffLayer: cc.Node,         //保险关设置图层
        insuranceTypes: [cc.Toggle],        //保险类型
        btnCustomOddsSetting: cc.Button,    //自定义赔率设置按钮
        customOddsSetting: cc.RichText,     //自定义赔率设置按钮文字
        customOddsSettingLayer: cc.Node,    //自定义赔率设置图层
        editboxCustomOdds: [cc.EditBox],    //自定义赔率编辑框
        //等待界面
        normalLoadingLayer: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:
    _formatBlindInfo (blindnum) {
        return blindnum >= 1000 ? blindnum / 1000 + 'k' : blindnum;
    },

    _formatGoldNum (goldnum) {
        goldnum = '' + goldnum;
        return goldnum.length >= 4 ? goldnum.substring(0, goldnum.length - 3) + ',000' : goldnum; 
    },

    //根据小盲注滑动条更新盲注信息
    _updateBlindInfo () {
        this.bigBlind = 2 * this.smallBlind;
        this.blindInfo.string = this._formatBlindInfo(this.smallBlind) + '/' + this._formatBlindInfo(this.bigBlind);
        this.buyinGoldMin.string = this._formatGoldNum(this.bigBlind * 100 * this._buyinGoldMinTimes);
        this.buyinMin = this.bigBlind * 100 * this.buyinGoldTimesArr[parseInt(this.buyinGoldMinSlider.progress * (this.buyinGoldTimesNodes.length - 1))];
        this.buyinMax = this.bigBlind * 100 * this.buyinGoldTimesArr[parseInt(this.buyinGoldMaxSlider.progress * (this.buyinGoldTimesNodes.length - 1))];
        this.smallBlindProgress.progress = this.smallBlindSlider.progress;
        this.slots8AnteSlider.progress = 0;
        this.slots9AnteSlider.progress = 0;
        this.slots10AnteSlider.progress = 0;
    },

    //根据当前小盲的大小改变前注的档位
    _updateAnteSettings () {
        if (this.smallBlind == 1) {
            this.slots8AnteSlider.node.active = true;
            this.slots9AnteSlider.node.active = false;
            this.slots10AnteSlider.node.active = false;
            //滑块在哪个点上哪个点上的数字颜色高亮
            for (let i = 0; i < this.slots8AnteNodes.length; i++) {
                let anteNode = this.slots8AnteNodes[i];
                anteNode.string = this._formatBlindInfo(this.anteArr[this.smallBlind + ''][i]);
                if (i == parseInt(this.slots8AnteSlider.progress * (this.slots8AnteNodes.length - 1))) {
                    anteNode.node.color = new cc.color(255, 224, 152, 255);
                    this.ante = this.anteArr[this.smallBlind + ''][i];
                } else {
                    anteNode.node.color = new cc.color(175, 198, 221, 255);
                }
            }
        } else if (this.smallBlind == 2) {
            this.slots8AnteSlider.node.active = false;
            this.slots9AnteSlider.node.active = true;
            this.slots10AnteSlider.node.active = false;
            //滑块在哪个点上哪个点上的数字颜色高亮
            for (let i = 0; i < this.slots9AnteNodes.length; i++) {
                let anteNode = this.slots9AnteNodes[i];
                anteNode.string = this._formatBlindInfo(this.anteArr[this.smallBlind + ''][i]);
                if (i == parseInt(this.slots9AnteSlider.progress * (this.slots9AnteNodes.length - 1))) {
                    anteNode.node.color = new cc.color(255, 224, 152, 255);
                    this.ante = this.anteArr[this.smallBlind + ''][i];
                } else {
                    anteNode.node.color = new cc.color(175, 198, 221, 255);
                }
            }
        } else {
            this.slots8AnteSlider.node.active = false;
            this.slots9AnteSlider.node.active = false;
            this.slots10AnteSlider.node.active = true;
            //滑块在哪个点上哪个点上的数字颜色高亮
            for (let i = 0; i < this.slots10AnteNodes.length; i++) {
                let anteNode = this.slots10AnteNodes[i];
                anteNode.string = this._formatBlindInfo(this.anteArr[this.smallBlind + ''][i]);
                if (i == parseInt(this.slots10AnteSlider.progress * (this.slots10AnteNodes.length - 1))) {
                    anteNode.node.color = new cc.color(255, 224, 152, 255);
                    this.ante = this.anteArr[this.smallBlind + ''][i];
                } else {
                    anteNode.node.color = new cc.color(175, 198, 221, 255);
                }
            }
        }
    },

    //根据人数设置滑动条更新人数的颜色
    _updateMaxPlayersInfo () {
        //滑块在哪个点上哪个点上的数字颜色高亮
        for (let i = 0; i < this.maxPlayersNodes.length; i++) {
            let playerNode = this.maxPlayersNodes[i];
            if (i == parseInt(this.maxPlayersSlider.progress * (this.maxPlayersNodes.length - 1))) {
                playerNode.node.color = new cc.color(255, 224, 152, 255);
                this.playerMax = this.playerMaxArr[i];
            } else {
                playerNode.node.color = new cc.color(175, 198, 221, 255);
            }
        }
        if (this.playerMax == 4) {
            this.slots3AutoStartSlider.node.active = true;
            this.slots5AutoStartSlider.node.active = false;
            this.slots8AutoStartSlider.node.active = false;
            //滑块在哪个点上哪个点上的数字颜色高亮
            for (let i = 0; i < this.slots3AutoStartNodes.length; i++) {
                let autoStartNode = this.slots3AutoStartNodes[i];
                if (i == parseInt(this.slots3AutoStartSlider.progress * (this.slots3AutoStartNodes.length - 1))) {
                    autoStartNode.node.color = new cc.color(255, 224, 152, 255);
                    this.playerMin = this.playerMinArr[i];
                } else {
                    autoStartNode.node.color = new cc.color(175, 198, 221, 255);
                }
            }
        } else if (this.playerMax == 6) {
            this.slots3AutoStartSlider.node.active = false;
            this.slots5AutoStartSlider.node.active = true;
            this.slots8AutoStartSlider.node.active = false;
            //滑块在哪个点上哪个点上的数字颜色高亮
            for (let i = 0; i < this.slots5AutoStartNodes.length; i++) {
                let autoStartNode = this.slots5AutoStartNodes[i];
                if (i == parseInt(this.slots5AutoStartSlider.progress * (this.slots5AutoStartNodes.length - 1))) {
                    autoStartNode.node.color = new cc.color(255, 224, 152, 255);
                    this.playerMin = this.playerMinArr[i];
                } else {
                    autoStartNode.node.color = new cc.color(175, 198, 221, 255);
                }
            }
        } else if (this.playerMax == 9) {
            this.slots3AutoStartSlider.node.active = false;
            this.slots5AutoStartSlider.node.active = false;
            this.slots8AutoStartSlider.node.active = true;
            //滑块在哪个点上哪个点上的数字颜色高亮
            for (let i = 0; i < this.slots8AutoStartNodes.length; i++) {
                let autoStartNode = this.slots8AutoStartNodes[i];
                if (i == parseInt(this.slots8AutoStartSlider.progress * (this.slots8AutoStartNodes.length - 1))) {
                    autoStartNode.node.color = new cc.color(255, 224, 152, 255);
                    this.playerMin = this.playerMinArr[i];
                } else {
                    autoStartNode.node.color = new cc.color(175, 198, 221, 255);
                }
            }
        }
    },

    //根据牌局时长设置滑动条更新牌局时长的颜色
    _updateGameLengthInfo () {
        //滑块在哪个点上哪个点上的数字颜色高亮
        for (let i = 0; i < this.gameLengthNodes.length; i++) {
            let gameLenNode = this.gameLengthNodes[i];
            if (i == parseInt(this.gameLengthSlider.progress * (this.gameLengthNodes.length - 1))) {
                gameLenNode.node.color = new cc.color(255, 224, 152, 255);
                this.gameLength = this.gameLengthArr[i];
            } else {
                gameLenNode.node.color = new cc.color(175, 198, 221, 255);
            }
        }
    },

    //根据带入金币最小最大倍数的滑块更新进度条
    _updateBuyinGoldTimesInfo () {
        //最小倍数的滑块不能超过最大倍数的滑块，若是拉动最小倍数滑块至两者一致，则隐藏最大滑块
        //若是拉动最小倍数滑块至两者一致，则隐藏最小滑块
        if (this.buyinGoldMinSlider.progress >= this.buyinGoldMaxSlider.progress) {
            if (this._operateBar == this.buyinGoldMinSliderBtn) {
                this.buyinGoldMinSliderBtn.active = true;
                this.buyinGoldMaxSliderBtn.active = false;
                this.buyinGoldMinSlider.progress = this.buyinGoldMaxSlider.progress;
            } else {
                this.buyinGoldMinSliderBtn.active = false;
                this.buyinGoldMaxSliderBtn.active = true;
                this.buyinGoldMaxSlider.progress = this.buyinGoldMinSlider.progress;
            }
        } else {
            this.buyinGoldMinSliderBtn.active = true;
            this.buyinGoldMaxSliderBtn.active = true;
        }
        //进度条起始位置为最小倍数滑块，长度为最大倍数滑块与最小倍数滑块的距离
        this.buyinGoldProgressNode.x = this.buyinGoldMinSliderBtn.x;
        this.buyinGoldProgress.progress = (this.buyinGoldMaxSliderBtn.x - this.buyinGoldMinSliderBtn.x) / this.buyinGoldMinSlider.node.width;
        //滑块在哪个点上哪个点上的数字颜色高亮
        for (let i = 0; i < this.buyinGoldTimesNodes.length; i++) {
            let timesNode = this.buyinGoldTimesNodes[i];
            if (i == parseInt(this.buyinGoldMinSlider.progress * (this.buyinGoldTimesNodes.length - 1))) {
                timesNode.node.color = new cc.color(255, 224, 152, 255);
                this.buyinMin = this.bigBlind * 100 * this.buyinGoldTimesArr[i];
            } else if (i == parseInt(this.buyinGoldMaxSlider.progress * (this.buyinGoldTimesNodes.length - 1))) {
                timesNode.node.color = new cc.color(255, 224, 152, 255);
                this.buyinMax = this.bigBlind * 100 * this.buyinGoldTimesArr[i];
            } else {
                timesNode.node.color = new cc.color(175, 198, 221, 255);
            }
        }
        //更新带入金币最低倍数
        this._buyinGoldMinTimes = this.buyinGoldTimesArr[parseInt(this.buyinGoldMinSlider.progress * (this.buyinGoldTimesNodes.length - 1))];
        this.buyinGoldMin.string = this._formatGoldNum(this.bigBlind * 100 * this._buyinGoldMinTimes);
    },

    onLoad () {
        Log.Trace("[CreateTable:onLoad]");
        //12档小盲
        this.smallBlindArr = [1, 2, 5, 10, 20, 25, 50, 100, 200, 300, 500, 1000];
        //8档带入金币倍数
        this.buyinGoldTimesArr = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
        //3档最大玩家数
        this.playerMaxArr = [4, 6, 9];
        //8档牌局时长
        this.gameLengthArr = [3600, 3600 * 1.5, 3600 * 2, 3600 * 2.5, 3600 * 3, 3600 * 4, 3600 * 5, 3600 * 6];
        //8档最小玩家数
        this.playerMinArr = [2, 3, 4, 5, 6, 7, 8, 9];
        //各盲注对应各档前注
        this.anteArr = {};
        this.anteArr['1'] = [0, 1, 2, 4, 8, 16, 20, 30];
        this.anteArr['2'] = [0, 1, 2, 4, 8, 16, 32, 40, 60];
        this.anteArr['5'] = [0, 1, 2, 5, 10, 20, 40, 80, 100, 150];
        this.anteArr['10'] = [0, 2, 5, 10, 20, 40, 80, 160, 200, 300];
        this.anteArr['20'] = [0, 5, 10, 20, 40, 80, 160, 320, 400, 600];
        this.anteArr['25'] = [0, 5, 10, 25, 50, 100, 200, 400, 500, 750];
        this.anteArr['50'] = [0, 10, 25, 50, 100, 200, 400, 800, 1000, 1500];
        this.anteArr['100'] = [0, 25, 50, 100, 200, 400, 800, 1600, 2000, 3000];
        this.anteArr['200'] = [0, 50, 100, 200, 400, 800, 1600, 3200, 4000, 6000];
        this.anteArr['300'] = [0, 75, 150, 300, 600, 1200, 2400, 4800, 6000, 9000];
        this.anteArr['500'] = [0, 125, 250, 500, 1000, 2000, 4000, 8000, 10000, 15000];
        this.anteArr['1000'] = [0, 250, 500, 1000, 2000, 4000, 8000, 16000, 20000, 30000];
        //牌桌默认属性
        this.tableProps = 0;
        this.insuranceOdds = [31, 16, 10, 8, 6, 5, 4, 3.5, 3, 2.5, 2.3, 2, 1.8, 1.6, 1.4, 1.3, 1.2, 1.1, 1.0, 0.8];
        for (let i = 0; i < cc.dgame.settings.setting.CustomOdds.length; i++) {
            this.editboxCustomOdds[i].string = cc.dgame.settings.setting.CustomOdds[i];
        }
        //小盲默认为1
        this.smallBlindSlider.progress = 0;
        this.smallBlind = this.smallBlindArr[parseInt(this.smallBlindSlider.progress * 11)];
        //牌桌时长默认2小时
        this.gameLengthSlider.progress = 2 / (this.gameLengthNodes.length - 1);
        this._updateBlindInfo();
        this._updateAnteSettings();
        this._updateMaxPlayersInfo();
        this._updateGameLengthInfo();
        //带入金币最小倍数默认1倍，最大倍数默认4倍
        this.buyinGoldMinSlider.progress = 1 / (this.buyinGoldTimesNodes.length - 1);
        this.buyinGoldMaxSlider.progress = 1;
        this._operateBar = null;
        this._updateBuyinGoldTimesInfo();
        //强制盲注默认为false
        this.straddle = 0;
        //盲注进度条跟随盲注滑块
        this.smallBlindSlider.node.on('slide', function(event) {
            this.smallBlindSlider.progress = parseInt(this.smallBlindSlider.progress * (this.smallBlindArr.length - 1)) / (this.smallBlindArr.length - 1);
            this.smallBlind = this.smallBlindArr[parseInt(this.smallBlindSlider.progress * (this.smallBlindArr.length - 1))];
            this._updateBlindInfo();
            this._updateAnteSettings();
        }, this);
        let progress = this.smallBlindSlider.progress;
        this.smallBlindSlider.progress = 0;
        this.smallBlindSliderBtnStartPos = this.smallBlindSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.smallBlindSlider.progress = 1;
        this.smallBlindSliderBtnEndPos = this.smallBlindSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.smallBlindSlider.progress = progress;
        this.smallBlindSliderBtn.on('touchmove', function (event) {
            let worldPoint = event.getLocation();
            if (worldPoint.x >= this.smallBlindSliderBtnEndPos.x) {
                this.smallBlindSlider.progress = 1;
            } else if (worldPoint.x <= this.smallBlindSliderBtnStartPos.x) {
                this.smallBlindSlider.progress = 0;
            } else {
                let progress = (worldPoint.x - this.smallBlindSliderBtnStartPos.x) / (this.smallBlindSliderBtnEndPos.x - this.smallBlindSliderBtnStartPos.x);
                this.smallBlindSlider.progress = progress;
            }
            this.smallBlindSlider.progress = parseInt(this.smallBlindSlider.progress * (this.smallBlindArr.length - 1)) / (this.smallBlindArr.length - 1);
            this.smallBlind = this.smallBlindArr[parseInt(this.smallBlindSlider.progress * (this.smallBlindArr.length - 1))];
            this._updateBlindInfo();
            this._updateAnteSettings();
        }, this);

        //人数设置进度条
        this.maxPlayersSlider.node.on('slide', function(event) {
            let i = this.gameLengthNodes.length - 1;
            for (; i > 0; i--) {
                if (this.maxPlayersSlider.progress > (i - 0.5) / (this.maxPlayersNodes.length - 1)) {
                    this.maxPlayersSlider.progress = i / (this.maxPlayersNodes.length - 1);
                    break;
                }
            }
            if (i == 0) {
                this.maxPlayersSlider.progress = 0;
            }
            this._updateMaxPlayersInfo();
        }, this);
        progress = this.maxPlayersSlider.progress;
        this.maxPlayersSlider.progress = 0;
        this.maxPlayersSliderBtnStartPos = this.maxPlayersSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.maxPlayersSlider.progress = 1;
        this.maxPlayersSliderBtnEndPos = this.maxPlayersSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.maxPlayersSlider.progress = progress;
        this.maxPlayersSliderBtn.on('touchmove', function (event) {
            let worldPoint = event.getLocation();
            if (worldPoint.x >= this.maxPlayersSliderBtnEndPos.x) {
                this.maxPlayersSlider.progress = 1;
            } else if (worldPoint.x <= this.maxPlayersSliderBtnStartPos.x) {
                this.maxPlayersSlider.progress = 0;
            } else {
                let progress = (worldPoint.x - this.maxPlayersSliderBtnStartPos.x) / (this.maxPlayersSliderBtnEndPos.x - this.maxPlayersSliderBtnStartPos.x);
                let i = this.maxPlayersNodes.length - 1;
                for (; i > 0; i--) {
                    if (progress > (i - 0.5) / (this.maxPlayersNodes.length - 1)) {
                        this.maxPlayersSlider.progress = i / (this.maxPlayersNodes.length - 1);
                        break;
                    }
                }
                if (i == 0) {
                    this.maxPlayersSlider.progress = 0;
                }
            }
            this.maxPlayersSlider.progress = parseInt(this.maxPlayersSlider.progress * (this.maxPlayersNodes.length - 1)) / (this.maxPlayersNodes.length - 1);
            this._updateMaxPlayersInfo();
        }, this);

        //牌局时长设置进度条
        this.gameLengthSlider.node.on('slide', function(event) {
            let i = this.gameLengthNodes.length - 1;
            for (; i > 0; i--) {
                if (this.gameLengthSlider.progress > (i - 0.5) / (this.gameLengthNodes.length - 1)) {
                    this.gameLengthSlider.progress = i / (this.gameLengthNodes.length - 1);
                    break;
                }
            }
            if (i == 0) {
                this.gameLengthSlider.progress = 0;
            }
            this._updateGameLengthInfo();
        }, this);
        progress = this.gameLengthSlider.progress;
        this.gameLengthSlider.progress = 0;
        this.gameLengthSliderBtnStartPos = this.gameLengthSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.gameLengthSlider.progress = 1;
        this.gameLengthSliderBtnEndPos = this.gameLengthSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.gameLengthSlider.progress = progress;
        this.gameLengthSliderBtn.on('touchmove', function (event) {
            let worldPoint = event.getLocation();
            if (worldPoint.x >= this.gameLengthSliderBtnEndPos.x) {
                this.gameLengthSlider.progress = 1;
            } else if (worldPoint.x <= this.gameLengthSliderBtnStartPos.x) {
                this.gameLengthSlider.progress = 0;
            } else {
                let progress = (worldPoint.x - this.gameLengthSliderBtnStartPos.x) / (this.gameLengthSliderBtnEndPos.x - this.gameLengthSliderBtnStartPos.x);
                let i = this.gameLengthNodes.length - 1;
                for (; i > 0; i--) {
                    if (progress > (i - 0.5) / (this.gameLengthNodes.length - 1)) {
                        this.gameLengthSlider.progress = i / (this.gameLengthNodes.length - 1);
                        break;
                    }
                }
                if (i == 0) {
                    this.gameLengthSlider.progress = 0;
                }
            }
            this.gameLengthSlider.progress = parseInt(this.gameLengthSlider.progress * (this.gameLengthNodes.length - 1)) / (this.gameLengthNodes.length - 1);
            this._updateGameLengthInfo();
        }, this);

        //8档前注设置进度条
        this.slots8AnteSlider.node.on('slide', function(event) {
            let i = this.slots8AnteNodes.length - 1;
            for (; i > 0; i--) {
                if (this.slots8AnteSlider.progress > (i - 0.5) / (this.slots8AnteNodes.length - 1)) {
                    this.slots8AnteSlider.progress = i / (this.slots8AnteNodes.length - 1);
                    break;
                }
            }
            if (i == 0) {
                this.slots8AnteSlider.progress = 0;
            }
            this._updateAnteSettings();
        }, this);
        progress = this.slots8AnteSlider.progress;
        this.slots8AnteSlider.progress = 0;
        this.slots8AnteSliderBtnStartPos = this.slots8AnteSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots8AnteSlider.progress = 1;
        this.slots8AnteSliderBtnEndPos = this.slots8AnteSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots8AnteSlider.progress = progress;
        this.slots8AnteSliderBtn.on('touchmove', function (event) {
            let worldPoint = event.getLocation();
            if (worldPoint.x >= this.slots8AnteSliderBtnEndPos.x) {
                this.slots8AnteSlider.progress = 1;
            } else if (worldPoint.x <= this.slots8AnteSliderBtnStartPos.x) {
                this.slots8AnteSlider.progress = 0;
            } else {
                let progress = (worldPoint.x - this.slots8AnteSliderBtnStartPos.x) / (this.slots8AnteSliderBtnEndPos.x - this.slots8AnteSliderBtnStartPos.x);
                let i = this.slots8AnteNodes.length - 1;
                for (; i > 0; i--) {
                    if (progress > (i - 0.5) / (this.slots8AnteNodes.length - 1)) {
                        this.slots8AnteSlider.progress = i / (this.slots8AnteNodes.length - 1);
                        break;
                    }
                }
                if (i == 0) {
                    this.slots8AnteSlider.progress = 0;
                }
            }
            this.slots8AnteSlider.progress = parseInt(this.slots8AnteSlider.progress * (this.slots8AnteNodes.length - 1)) / (this.slots8AnteNodes.length - 1);
            this._updateAnteSettings();
        }, this);

        //9档前注设置进度条
        this.slots9AnteSlider.node.on('slide', function(event) {
            let i = this.slots9AnteNodes.length - 1;
            for (; i > 0; i--) {
                if (this.slots9AnteSlider.progress > (i - 0.5) / (this.slots9AnteNodes.length - 1)) {
                    this.slots9AnteSlider.progress = i / (this.slots9AnteNodes.length - 1);
                    break;
                }
            }
            if (i == 0) {
                this.slots9AnteSlider.progress = 0;
            }
            this._updateAnteSettings();
        }, this);
        progress = this.slots9AnteSlider.progress;
        this.slots9AnteSlider.progress = 0;
        this.slots9AnteSliderBtnStartPos = this.slots9AnteSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots9AnteSlider.progress = 1;
        this.slots9AnteSliderBtnEndPos = this.slots9AnteSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots9AnteSlider.progress = progress;
        this.slots9AnteSliderBtn.on('touchmove', function (event) {
            let worldPoint = event.getLocation();
            if (worldPoint.x >= this.slots9AnteSliderBtnEndPos.x) {
                this.slots9AnteSlider.progress = 1;
            } else if (worldPoint.x <= this.slots9AnteSliderBtnStartPos.x) {
                this.slots9AnteSlider.progress = 0;
            } else {
                let progress = (worldPoint.x - this.slots9AnteSliderBtnStartPos.x) / (this.slots9AnteSliderBtnEndPos.x - this.slots9AnteSliderBtnStartPos.x);
                let i = this.slots9AnteNodes.length - 1;
                for (; i > 0; i--) {
                    if (progress > (i - 0.5) / (this.slots9AnteNodes.length - 1)) {
                        this.slots9AnteSlider.progress = i / (this.slots9AnteNodes.length - 1);
                        break;
                    }
                }
                if (i == 0) {
                    this.slots9AnteSlider.progress = 0;
                }
            }
            this.slots9AnteSlider.progress = parseInt(this.slots9AnteSlider.progress * (this.slots9AnteNodes.length - 1)) / (this.slots9AnteNodes.length - 1);
            this._updateAnteSettings();
        }, this);

        //10档前注设置进度条
        this.slots10AnteSlider.node.on('slide', function(event) {
            let i = this.slots10AnteNodes.length - 1;
            for (; i > 0; i--) {
                if (this.slots10AnteSlider.progress > (i - 0.5) / (this.slots10AnteNodes.length - 1)) {
                    this.slots10AnteSlider.progress = i / (this.slots10AnteNodes.length - 1);
                    break;
                }
            }
            if (i == 0) {
                this.slots10AnteSlider.progress = 0;
            }
            this._updateAnteSettings();
        }, this);
        progress = this.slots10AnteSlider.progress;
        this.slots10AnteSlider.progress = 0;
        this.slots10AnteSliderBtnStartPos = this.slots10AnteSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots10AnteSlider.progress = 1;
        this.slots10AnteSliderBtnEndPos = this.slots10AnteSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots10AnteSlider.progress = progress;
        this.slots10AnteSliderBtn.on('touchmove', function (event) {
            let worldPoint = event.getLocation();
            if (worldPoint.x >= this.slots10AnteSliderBtnEndPos.x) {
                this.slots10AnteSlider.progress = 1;
            } else if (worldPoint.x <= this.slots10AnteSliderBtnStartPos.x) {
                this.slots10AnteSlider.progress = 0;
            } else {
                let progress = (worldPoint.x - this.slots10AnteSliderBtnStartPos.x) / (this.slots10AnteSliderBtnEndPos.x - this.slots10AnteSliderBtnStartPos.x);
                let i = this.slots10AnteNodes.length - 1;
                for (; i > 0; i--) {
                    if (progress > (i - 0.5) / (this.slots10AnteNodes.length - 1)) {
                        this.slots10AnteSlider.progress = i / (this.slots10AnteNodes.length - 1);
                        break;
                    }
                }
                if (i == 0) {
                    this.slots10AnteSlider.progress = 0;
                }
            }
            this.slots10AnteSlider.progress = parseInt(this.slots10AnteSlider.progress * (this.slots10AnteNodes.length - 1)) / (this.slots10AnteNodes.length - 1);
            this._updateAnteSettings();
        }, this);

        //3档开局人数设置进度条
        this.slots3AutoStartSlider.node.on('slide', function(event) {
            let i = this.slots3AutoStartNodes.length - 1;
            for (; i > 0; i--) {
                if (this.slots3AutoStartSlider.progress > (i - 0.5) / (this.slots3AutoStartNodes.length - 1)) {
                    this.slots3AutoStartSlider.progress = i / (this.slots3AutoStartNodes.length - 1);
                    break;
                }
            }
            if (i == 0) {
                this.slots3AutoStartSlider.progress = 0;
            }
            this._updateMaxPlayersInfo();
        }, this);
        progress = this.slots3AutoStartSlider.progress;
        this.slots3AutoStartSlider.progress = 0;
        this.slots3AutoStartSliderBtnStartPos = this.slots3AutoStartSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots3AutoStartSlider.progress = 1;
        this.slots3AutoStartSliderBtnEndPos = this.slots3AutoStartSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots3AutoStartSlider.progress = progress;
        this.slots3AutoStartSliderBtn.on('touchmove', function (event) {
            let worldPoint = event.getLocation();
            if (worldPoint.x >= this.slots3AutoStartSliderBtnEndPos.x) {
                this.slots3AutoStartSlider.progress = 1;
            } else if (worldPoint.x <= this.slots3AutoStartSliderBtnStartPos.x) {
                this.slots3AutoStartSlider.progress = 0;
            } else {
                let progress = (worldPoint.x - this.slots3AutoStartSliderBtnStartPos.x) / (this.slots3AutoStartSliderBtnEndPos.x - this.slots3AutoStartSliderBtnStartPos.x);
                let i = this.slots3AutoStartNodes.length - 1;
                for (; i > 0; i--) {
                    if (progress > (i - 0.5) / (this.slots3AutoStartNodes.length - 1)) {
                        this.slots3AutoStartSlider.progress = i / (this.slots3AutoStartNodes.length - 1);
                        break;
                    }
                }
                if (i == 0) {
                    this.slots3AutoStartSlider.progress = 0;
                }
            }
            this.slots3AutoStartSlider.progress = parseInt(this.slots3AutoStartSlider.progress * (this.slots3AutoStartNodes.length - 1)) / (this.slots3AutoStartNodes.length - 1);
            this._updateMaxPlayersInfo();
        }, this);

        //5档开局人数设置进度条
        this.slots5AutoStartSlider.node.on('slide', function(event) {
            let i = this.slots5AutoStartNodes.length - 1;
            for (; i > 0; i--) {
                if (this.slots5AutoStartSlider.progress > (i - 0.5) / (this.slots5AutoStartNodes.length - 1)) {
                    this.slots5AutoStartSlider.progress = i / (this.slots5AutoStartNodes.length - 1);
                    break;
                }
            }
            if (i == 0) {
                this.slots5AutoStartSlider.progress = 0;
            }
            this._updateMaxPlayersInfo();
        }, this);
        progress = this.slots5AutoStartSlider.progress;
        this.slots5AutoStartSlider.progress = 0;
        this.slots5AutoStartSliderBtnStartPos = this.slots5AutoStartSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots5AutoStartSlider.progress = 1;
        this.slots5AutoStartSliderBtnEndPos = this.slots5AutoStartSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots5AutoStartSlider.progress = progress;
        this.slots5AutoStartSliderBtn.on('touchmove', function (event) {
            let worldPoint = event.getLocation();
            if (worldPoint.x >= this.slots5AutoStartSliderBtnEndPos.x) {
                this.slots5AutoStartSlider.progress = 1;
            } else if (worldPoint.x <= this.slots5AutoStartSliderBtnStartPos.x) {
                this.slots5AutoStartSlider.progress = 0;
            } else {
                let progress = (worldPoint.x - this.slots5AutoStartSliderBtnStartPos.x) / (this.slots5AutoStartSliderBtnEndPos.x - this.slots5AutoStartSliderBtnStartPos.x);
                let i = this.slots5AutoStartNodes.length - 1;
                for (; i > 0; i--) {
                    if (progress > (i - 0.5) / (this.slots5AutoStartNodes.length - 1)) {
                        this.slots5AutoStartSlider.progress = i / (this.slots5AutoStartNodes.length - 1);
                        break;
                    }
                }
                if (i == 0) {
                    this.slots5AutoStartSlider.progress = 0;
                }
            }
            this.slots5AutoStartSlider.progress = parseInt(this.slots5AutoStartSlider.progress * (this.slots5AutoStartNodes.length - 1)) / (this.slots5AutoStartNodes.length - 1);
            this._updateMaxPlayersInfo();
        }, this);

        //8档开局人数设置进度条
        this.slots8AutoStartSlider.node.on('slide', function(event) {
            let i = this.slots8AutoStartNodes.length - 1;
            for (; i > 0; i--) {
                if (this.slots8AutoStartSlider.progress > (i - 0.5) / (this.slots8AutoStartNodes.length - 1)) {
                    this.slots8AutoStartSlider.progress = i / (this.slots8AutoStartNodes.length - 1);
                    break;
                }
            }
            if (i == 0) {
                this.slots8AutoStartSlider.progress = 0;
            }
            this._updateMaxPlayersInfo();
        }, this);
        progress = this.slots8AutoStartSlider.progress;
        this.slots8AutoStartSlider.progress = 0;
        this.slots8AutoStartSliderBtnStartPos = this.slots8AutoStartSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots8AutoStartSlider.progress = 1;
        this.slots8AutoStartSliderBtnEndPos = this.slots8AutoStartSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.slots8AutoStartSlider.progress = progress;
        this.slots8AutoStartSliderBtn.on('touchmove', function (event) {
            let worldPoint = event.getLocation();
            if (worldPoint.x >= this.slots8AutoStartSliderBtnEndPos.x) {
                this.slots8AutoStartSlider.progress = 1;
            } else if (worldPoint.x <= this.slots8AutoStartSliderBtnStartPos.x) {
                this.slots8AutoStartSlider.progress = 0;
            } else {
                let progress = (worldPoint.x - this.slots8AutoStartSliderBtnStartPos.x) / (this.slots8AutoStartSliderBtnEndPos.x - this.slots8AutoStartSliderBtnStartPos.x);
                let i = this.slots8AutoStartNodes.length - 1;
                for (; i > 0; i--) {
                    if (progress > (i - 0.5) / (this.slots8AutoStartNodes.length - 1)) {
                        this.slots8AutoStartSlider.progress = i / (this.slots8AutoStartNodes.length - 1);
                        break;
                    }
                }
                if (i == 0) {
                    this.slots8AutoStartSlider.progress = 0;
                }
            }
            this.slots8AutoStartSlider.progress = parseInt(this.slots8AutoStartSlider.progress * (this.slots8AutoStartNodes.length - 1)) / (this.slots8AutoStartNodes.length - 1);
            this._updateMaxPlayersInfo();
        }, this);

        //带入金币倍数进度条跟随最小倍数滑块与最大倍数滑块的位置进行调整
        this.buyinGoldMinSlider.node.on('slide', function(event) {
            this._operateBar = this.buyinGoldMinSliderBtn;
            let i = this.buyinGoldTimesNodes.length - 1;
            for (; i > 0; i--) {
                if (this.buyinGoldMinSlider.progress > (i - 0.5) / (this.buyinGoldTimesNodes.length - 1)) {
                    this.buyinGoldMinSlider.progress = i / (this.buyinGoldTimesNodes.length - 1);
                    break;
                }
            }
            if (i == 0) {
                this.buyinGoldMinSlider.progress = 0;
            }
            this._updateBuyinGoldTimesInfo();
        }, this);
        progress = this.buyinGoldMinSlider.progress;
        this.buyinGoldMinSlider.progress = 0;
        this.buyinGoldMinSliderBtnStartPos = this.buyinGoldMinSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.buyinGoldMinSlider.progress = 1;
        this.buyinGoldMinSliderBtnEndPos = this.buyinGoldMinSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.buyinGoldMinSlider.progress = progress;
        this.buyinGoldMinSliderBtn.on('touchmove', function (event) {
            let worldPoint = event.getLocation();
            if (worldPoint.x >= this.buyinGoldMinSliderBtnEndPos.x) {
                this.buyinGoldMinSlider.progress = 1;
            } else if (worldPoint.x <= this.buyinGoldMinSliderBtnStartPos.x) {
                this.buyinGoldMinSlider.progress = 0;
            } else {
                let progress = (worldPoint.x - this.buyinGoldMinSliderBtnStartPos.x) / (this.buyinGoldMinSliderBtnEndPos.x - this.buyinGoldMinSliderBtnStartPos.x);
                let i = this.buyinGoldTimesNodes.length - 1;
                for (; i > 0; i--) {
                    if (progress > (i - 0.5) / (this.buyinGoldTimesNodes.length - 1)) {
                        this.buyinGoldMinSlider.progress = i / (this.buyinGoldTimesNodes.length - 1);
                        break;
                    }
                }
                if (i == 0) {
                    this.buyinGoldMinSlider.progress = 0;
                }
            }
            this.buyinGoldMinSlider.progress = parseInt(this.buyinGoldMinSlider.progress * (this.buyinGoldTimesNodes.length - 1)) / (this.buyinGoldTimesNodes.length - 1);
            this._updateBuyinGoldTimesInfo();
        }, this);

        this.buyinGoldMaxSlider.node.on('slide', function(event) {
            this._operateBar = this.buyinGoldMaxSliderBtn;
            let i = this.buyinGoldTimesNodes.length - 1;
            for (; i > 0; i--) {
                if (this.buyinGoldMaxSlider.progress > (i - 0.5) / (this.buyinGoldTimesNodes.length - 1)) {
                    this.buyinGoldMaxSlider.progress = i / (this.buyinGoldTimesNodes.length - 1);
                    break;
                }
            }
            if (i == 0) {
                this.buyinGoldMaxSlider.progress = 0;
            }
            this._updateBuyinGoldTimesInfo();
        }, this);
        progress = this.buyinGoldMaxSlider.progress;
        this.buyinGoldMaxSlider.progress = 0;
        this.buyinGoldMaxSliderBtnStartPos = this.buyinGoldMaxSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.buyinGoldMaxSlider.progress = 1;
        this.buyinGoldMaxSliderBtnEndPos = this.buyinGoldMaxSliderBtn.convertToWorldSpaceAR(cc.v2(0, 0));
        this.buyinGoldMaxSlider.progress = progress;
        this.buyinGoldMaxSliderBtn.on('touchmove', function (event) {
            let worldPoint = event.getLocation();
            if (worldPoint.x >= this.buyinGoldMaxSliderBtnEndPos.x) {
                this.buyinGoldMaxSlider.progress = 1;
            } else if (worldPoint.x <= this.buyinGoldMaxSliderBtnStartPos.x) {
                this.buyinGoldMaxSlider.progress = 0;
            } else {
                let progress = (worldPoint.x - this.buyinGoldMaxSliderBtnStartPos.x) / (this.buyinGoldMaxSliderBtnEndPos.x - this.buyinGoldMaxSliderBtnStartPos.x);
                let i = this.buyinGoldTimesNodes.length - 1;
                for (; i > 0; i--) {
                    if (progress > (i - 0.5) / (this.buyinGoldTimesNodes.length - 1)) {
                        this.buyinGoldMaxSlider.progress = i / (this.buyinGoldTimesNodes.length - 1);
                        break;
                    }
                }
                if (i == 0) {
                    this.buyinGoldMaxSlider.progress = 0;
                }
            }
            this.buyinGoldMaxSlider.progress = parseInt(this.buyinGoldMaxSlider.progress * (this.buyinGoldTimesNodes.length - 1)) / (this.buyinGoldTimesNodes.length - 1);
            this._updateBuyinGoldTimesInfo();
        }, this);
        cc.dgame.roomEventMgr.startListen();
        cc.dgame.roomEventMgr.handleCreateTable = this._handleCreateTable.bind(this);
    },

    onBtnStraddleOnClicked () {
        this.btnStraddleOn.active = false;
        this.btnStraddleOff.active = true;
        this.straddle = 0;
    },

    onBtnStraddleOffClicked () {
        this.btnStraddleOn.active = true;
        this.btnStraddleOff.active = false;
        this.straddle = 1;
    },

    onBtnRMTOnClicked () {
        this.btnRMTOn.active = false;
        this.btnRMTOff.active = true;
        this.tableProps &= ~(1<<1);
    },

    onBtnRMTOffClicked () {
        this.btnRMTOn.active = true;
        this.btnRMTOff.active = false;
        this.tableProps |= 1<<1;
        if (this.insuranceOnLayer.active) {
            this.onBtnInsuranceOnClicked();
        }
    },

    onBtnInsuranceOnClicked () {
        this.insuranceOnLayer.active = false;
        this.insuranceOffLayer.active = true;
        this.tableProps &= ~(1<<2);
        this.tableProps &= ~(1<<3);
        this.scrollView.scrollToBottom();
    },

    onBtnInsuranceOffClicked () {
        this.insuranceOnLayer.active = true;
        this.insuranceOffLayer.active = false;
        if (this.insuranceTypes[0].isChecked) {
            this.tableProps |= 1<<2;
            this.btnCustomOddsSetting.interactable = false;
            this.customOddsSetting.string = "<u><color=#5F5F5F>Setting</c></u>"
        } else if (this.insuranceTypes[1].isChecked) {
            this.tableProps |= 1<<3;
            this.btnCustomOddsSetting.interactable = true;
            this.customOddsSetting.string = "<u><color=#AFC6DD>Setting</c></u>";
        }
        this.scrollView.scrollToBottom();
        if (this.btnRMTOn.active) {
            this.onBtnRMTOnClicked();
        }
    },

    onBack () {
        cc.director.loadScene('ClubHall');
    },

    _handleCreateTable (data) {
        Log.Trace('[_handleCreateTable] currentScene: ' + cc.director.getScene().name + ', ' + JSON.stringify(data));
        cc.dgame.normalLoading.stopInvokeWaiting();
        if (data.Errstr != "") {
            cc.dgame.tips.showTips(data.Errstr);
            return;
        }
        cc.director.loadScene('ClubHall');
    },

    onBtnCreateTableClicked () {
        cc.dgame.normalLoading.startInvokeWaiting();
        let subCreateTable_cmd = {
            OwnerAddr: this.ownerAddr,
        }
        cc.dgame.net.gameCall(["subscribeCreateTable", JSON.stringify(subCreateTable_cmd)]);
        if (this.tableProps & (1<<3)) {
            this.insuranceOdds = new Array();
            for (let i = 0; i < this.editboxCustomOdds.length; i++) {
                this.insuranceOdds.push(parseFloat(this.editboxCustomOdds[i].string));
            }
        }
        Log.Trace("[onBtnCreateTableClicked] CustomOdds: " + JSON.stringify(cc.dgame.settings.setting.CustomOdds));
        Log.Trace("[onBtnCreateTableClicked] tableProps: " + this.tableProps + ", INS: " + (this.tableProps & (1<<2)) + ", C-INS: " + (this.tableProps & (1<<3)) + ", insuranceOdds: " + this.insuranceOdds);
        var createtable_cmd = {
            ClubID: cc.dgame.settings.account.ClubID,
            Minimum: this.playerMin,
            Maximum: this.playerMax,
            BuyinMin: this.buyinMin,
            BuyinMax: this.buyinMax,
            SmallBlind: this.smallBlind,
            Straddle: this.straddle,
            Ante: this.ante,
            TableProps: this.tableProps,
            GameLength: this.gameLength,
            InsuranceOdds: this.insuranceOdds,
        };
        this.scheduleOnce(function () {
            cc.dgame.net.gameCall(['createtable', JSON.stringify(createtable_cmd)]);
        }, 0.1);
    },

    onBtnRoomTypeClicked (toggle) {
        if (this.roomTypes.indexOf(toggle) == 0) {
            this.tableProps |= 1<<0;
        } else {
            this.tableProps &= ~(1<<0);
        }
    },

    onBtnInsuranceTypeClicked (toggle) {
        if (this.insuranceTypes.indexOf(toggle) == 0) {
            this.tableProps |= 1<<2;
            this.tableProps &= ~(1<<3);
            this.btnCustomOddsSetting.interactable = false;
            this.customOddsSetting.string = "<u><color=#5F5F5F>Setting</c></u>"
        } else {
            this.tableProps &= ~(1<<2);
            this.tableProps |= 1<<3;
            this.btnCustomOddsSetting.interactable = true;
            this.customOddsSetting.string = "<u><color=#AFC6DD>Setting</c></u>";
        }
    },

    onBtnCustomOddsSettingClicked () {
        this.customOddsSettingLayer.active = true;
    },

    onBtnCloseCustomOddsSettingClicked () {
        this.customOddsSettingLayer.active = false;
    },

    onBtnCustomOddsResetClicked () {
        this.editboxCustomOdds[0].string = 31;
        this.editboxCustomOdds[1].string = 16;
        this.editboxCustomOdds[2].string = 10;
        this.editboxCustomOdds[3].string = 8;
        this.editboxCustomOdds[4].string = 6;
        this.editboxCustomOdds[5].string = 5;
        this.editboxCustomOdds[6].string = 4;
        this.editboxCustomOdds[7].string = 3.5;
        this.editboxCustomOdds[8].string = 3;
        this.editboxCustomOdds[9].string = 2.5;
        this.editboxCustomOdds[10].string = 2.3;
        this.editboxCustomOdds[11].string = 2;
        this.editboxCustomOdds[12].string = 1.8;
        this.editboxCustomOdds[13].string = 1.6;
        this.editboxCustomOdds[14].string = 1.4;
        this.editboxCustomOdds[15].string = 1.3;
        this.editboxCustomOdds[16].string = 1.2;
        this.editboxCustomOdds[17].string = 1.1;
        this.editboxCustomOdds[18].string = 1.0;
        this.editboxCustomOdds[19].string = 0.8;
    },

    onBtnCustomOddsSaveClicked () {
        for (let i = 0; i < this.editboxCustomOdds.length; i++) {
            if (i < 14 && (i + 1) * parseFloat(this.editboxCustomOdds[i].string) > 43) {
                cc.dgame.tips.showTips("Odds too high");
                this.editboxCustomOdds[i].focus();
                return;
            }
        }
        this.customOddsSettingLayer.active = false;
        cc.dgame.settings.setting.CustomOdds = new Array();
        for (let i = 0; i < this.editboxCustomOdds.length; i++) {
            cc.dgame.settings.setting.CustomOdds.push(parseFloat(this.editboxCustomOdds[i].string));
        }
        cc.sys.localStorage.setItem("setting", JSON.stringify(cc.dgame.settings.setting));
    },

    onCustomOdds1TextChanged () {
        if (1 * parseFloat(this.editboxCustomOdds[0].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[0].focus();
        }
    },

    onCustomOdds2TextChanged () {
        if (2 * parseFloat(this.editboxCustomOdds[1].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[1].focus();
        }
    },

    onCustomOdds3TextChanged () {
        if (3 * parseFloat(this.editboxCustomOdds[2].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[2].focus();
        }
    },

    onCustomOdds4TextChanged () {
        if (4 * parseFloat(this.editboxCustomOdds[3].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[3].focus();
        }
    },

    onCustomOdds5TextChanged () {
        if (5 * parseFloat(this.editboxCustomOdds[4].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[4].focus();
        }
    },

    onCustomOdds6TextChanged () {
        if (6 * parseFloat(this.editboxCustomOdds[5].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[5].focus();
        }
    },

    onCustomOdds7TextChanged () {
        if (7 * parseFloat(this.editboxCustomOdds[6].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[6].focus();
        }
    },

    onCustomOdds8TextChanged () {
        if (8 * parseFloat(this.editboxCustomOdds[7].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[7].focus();
        }
    },

    onCustomOdds9TextChanged () {
        if (9 * parseFloat(this.editboxCustomOdds[8].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[8].focus();
        }
    },

    onCustomOdds10TextChanged () {
        if (10 * parseFloat(this.editboxCustomOdds[9].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[9].focus();
        }
    },

    onCustomOdds11TextChanged () {
        if (11 * parseFloat(this.editboxCustomOdds[10].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[10].focus();
        }
    },

    onCustomOdds12TextChanged () {
        if (12 * parseFloat(this.editboxCustomOdds[11].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[11].focus();
        }
    },

    onCustomOdds13TextChanged () {
        if (13 * parseFloat(this.editboxCustomOdds[12].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[12].focus();
        }
    },

    onCustomOdds14TextChanged () {
        if (14 * parseFloat(this.editboxCustomOdds[13].string) > 43) {
            cc.dgame.tips.showTips("Odds too high");
            this.editboxCustomOdds[13].focus();
        }
    },
    // update (dt) {},
});
