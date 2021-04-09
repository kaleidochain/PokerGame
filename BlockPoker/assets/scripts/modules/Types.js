var ContractStatus = cc.Enum({
    NOTJOIN: 0,
    NOTSEATED: 1,
    SITTING: 2,
    SEATED: 3,
    PREREADY: 4,
    READY: 5,
    PLAYING: 6,
    DISCARD: 7,
    LEAVENEXT: 8,
    OFFLINE: 9,
    SHOWDOWNOFFLINE: 10,
    STANDBYNEXT: 11,
});

var PlayerOperationCode = cc.Enum({
    NOACTION: 0,
    STANDBY: 1,
    WAITING: 2,
    STRADDLE: 3,
    BUSTRADDLE: 4,
    DELAY: 5,
    CALL: 6,
    CHECK: 7,
    BET: 8,
    RAISE: 9,
    ALLIN: 10,
    FOLD: 11,
    END: 12,
});

var TexasStage = cc.Enum({
    INIT: 0,
    START: 1,
    PREFLOP: 2,
    FLOP: 3,
    TURN: 4,
    RIVER: 5,
    SHOWDOWN: 6,
});

var BuyinGoldType = cc.Enum({
    SITDOWN: 0,
    BACKTOPLAY: 1,
});

module.exports = {
    ContractStatus: ContractStatus,
    PlayerOP: PlayerOperationCode,
    TexasStage: TexasStage,
    BuyinGoldType: BuyinGoldType,
};