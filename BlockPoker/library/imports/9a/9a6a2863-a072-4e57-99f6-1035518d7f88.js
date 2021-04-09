"use strict";
cc._RF.push(module, '9a6a2hjoHJOV5n2EDVRjX+I', 'PositionData');
// scripts/modules/PositionData.js

"use strict";

var CommunityCardPositions = [{
  x: -230,
  y: 0
}, {
  x: -115,
  y: 0
}, {
  x: 0,
  y: 0
}, {
  x: 115,
  y: 0
}, {
  x: 230,
  y: 0
}];
var RMTCommunityCardPositions = [[{
  x: -230,
  y: 0
}, {
  x: -115,
  y: 0
}, {
  x: 0,
  y: 0
}, {
  x: 115,
  y: 0
}, {
  x: 230,
  y: 0
}], [{
  x: -230,
  y: -65
}, {
  x: -115,
  y: -65
}, {
  x: 0,
  y: -65
}, {
  x: 115,
  y: -65
}, {
  x: 230,
  y: -65
}], [{
  x: -230,
  y: -130
}, {
  x: -115,
  y: -130
}, {
  x: 0,
  y: -130
}, {
  x: 115,
  y: -130
}, {
  x: 230,
  y: -130
}], [{
  x: -230,
  y: -195
}, {
  x: -115,
  y: -195
}, {
  x: 0,
  y: -195
}, {
  x: 115,
  y: -195
}, {
  x: 230,
  y: -195
}]];
var HoleCardPositions = [{
  x: -57,
  y: 0
}, {
  x: 57,
  y: 0
}];
var SidePotPositions = [{
  x: 0,
  y: 0
}, {
  x: 0,
  y: 60
}, {
  x: -160,
  y: 0
}, {
  x: 160,
  y: 0
}, {
  x: 0,
  y: -60
}, {
  x: -160,
  y: 60
}, {
  x: 160,
  y: 60
}, {
  x: -160,
  y: -60
}, {
  x: 160,
  y: -60
}]; //玩家在短桌上相对于桌子背景中心点(0,0)的相对位置

var GameTablePlayerAnchorPositions = [{
  x: 0,
  y: -750
}, {
  x: -440,
  y: -180
}, {
  x: -440,
  y: 185
}, {
  x: -440,
  y: 550
}, {
  x: -140,
  y: 760
}, {
  x: 140,
  y: 760
}, {
  x: 440,
  y: 550
}, {
  x: 440,
  y: 185
}, {
  x: 440,
  y: -180
}]; //玩家在长桌上相对于桌子背景中心点(0,0)的相对位置

var GameTableLongPlayerAnchorPositions = [{
  x: 0,
  y: -840
}, {
  x: -440,
  y: -280
}, {
  x: -440,
  y: 150
}, {
  x: -440,
  y: 570
}, {
  x: -165,
  y: 840
}, {
  x: 165,
  y: 840
}, {
  x: 440,
  y: 570
}, {
  x: 440,
  y: 150
}, {
  x: 440,
  y: -280
}]; //玩家在牌局回放中相对于桌子背景中心点(0,0)的相对位置

var ReplayPlayerAnchorPositions = [{
  x: 0,
  y: -705
}, {
  x: -355,
  y: -410
}, {
  x: -355,
  y: -60
}, {
  x: -355,
  y: 290
}, {
  x: -110,
  y: 535
}, {
  x: 110,
  y: 535
}, {
  x: 355,
  y: 290
}, {
  x: 355,
  y: -60
}, {
  x: 355,
  y: -410
}]; //玩家各组件相对于玩家中心点(0, 0)的相对位置

var PlayerComponentPositions = [[], //0人
[], //1人
[], //2人
[], //3人
[], //4人
[], //5人
[], //6人
[], //7人
[], //8人
[{
  PlayingOperateLayer: {
    x: 0,
    y: 307
  },
  //玩的时候
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 140,
    y: 350
  },
  DealerMark: {
    x: -105,
    y: 27
  },
  Winloss: {
    x: 0,
    y: 250
  },
  WinlossLayer: 2
}, {
  PlayingOperateLayer: {
    x: 0,
    y: 110
  },
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 140,
    y: -85
  },
  DealerMark: {
    x: 130,
    y: 27
  },
  Winloss: {
    x: 0,
    y: 60
  },
  WinlossLayer: 2
}, {
  PlayingOperateLayer: {
    x: 0,
    y: 110
  },
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 140,
    y: -70
  },
  DealerMark: {
    x: 130,
    y: 27
  },
  Winloss: {
    x: 0,
    y: 60
  },
  WinlossLayer: 2
}, {
  PlayingOperateLayer: {
    x: 0,
    y: 110
  },
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 140,
    y: -100
  },
  DealerMark: {
    x: 140,
    y: -43
  },
  Winloss: {
    x: 0,
    y: 60
  },
  WinlossLayer: 2
}, {
  PlayingOperateLayer: {
    x: 0,
    y: 110
  },
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 0,
    y: -180
  },
  DealerMark: {
    x: 85,
    y: -145
  },
  Winloss: {
    x: 0,
    y: 60
  },
  WinlossLayer: 2
}, {
  PlayingOperateLayer: {
    x: 0,
    y: 110
  },
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 0,
    y: -180
  },
  DealerMark: {
    x: 85,
    y: -145
  },
  Winloss: {
    x: 0,
    y: 60
  },
  WinlossLayer: 2
}, {
  PlayingOperateLayer: {
    x: 0,
    y: 110
  },
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: -140,
    y: -100
  },
  DealerMark: {
    x: -140,
    y: -43
  },
  Winloss: {
    x: 0,
    y: 60
  },
  WinlossLayer: 2
}, {
  PlayingOperateLayer: {
    x: 0,
    y: 110
  },
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: -140,
    y: -70
  },
  DealerMark: {
    x: -130,
    y: 27
  },
  Winloss: {
    x: 0,
    y: 60
  },
  WinlossLayer: 2
}, {
  PlayingOperateLayer: {
    x: 0,
    y: 110
  },
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: -140,
    y: -85
  },
  DealerMark: {
    x: -130,
    y: 27
  },
  Winloss: {
    x: 0,
    y: 60
  },
  WinlossLayer: 2
}] //9人
]; //玩家各组件相对于玩家中心点(0, 0)的相对位置

var ReplayPlayerComponentPositions = [[], //0人
[], //1人
[], //2人
[], //3人
[], //4人
[], //5人
[], //6人
[], //7人
[], //8人
[{
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 140,
    y: 110
  },
  DealerMark: {
    x: -110,
    y: 35
  },
  Winloss: {
    x: 0,
    y: 70
  },
  WinlossLayer: 2
}, {
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 140,
    y: -100
  },
  DealerMark: {
    x: 130,
    y: 27
  },
  Winloss: {
    x: 0,
    y: 70
  },
  WinlossLayer: 2
}, {
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 140,
    y: -100
  },
  DealerMark: {
    x: 130,
    y: 27
  },
  Winloss: {
    x: 0,
    y: 70
  },
  WinlossLayer: 2
}, {
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 140,
    y: -100
  },
  DealerMark: {
    x: 130,
    y: 27
  },
  Winloss: {
    x: 0,
    y: 70
  },
  WinlossLayer: 2
}, {
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 0,
    y: -180
  },
  DealerMark: {
    x: 85,
    y: -145
  },
  Winloss: {
    x: 0,
    y: 70
  },
  WinlossLayer: 2
}, {
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: 0,
    y: -180
  },
  DealerMark: {
    x: 85,
    y: -145
  },
  Winloss: {
    x: 0,
    y: 70
  },
  WinlossLayer: 2
}, {
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: -140,
    y: -100
  },
  DealerMark: {
    x: -130,
    y: 27
  },
  Winloss: {
    x: 0,
    y: 70
  },
  WinlossLayer: 2
}, {
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: -140,
    y: -100
  },
  DealerMark: {
    x: -130,
    y: 27
  },
  Winloss: {
    x: 0,
    y: 70
  },
  WinlossLayer: 2
}, {
  OperateLayer: {
    x: 0,
    y: 110
  },
  FirstCard: {
    x: 56,
    y: -40,
    degree: 0
  },
  SecondCard: {
    x: 77,
    y: -40,
    degree: 0
  },
  BetLayer: {
    x: -140,
    y: -85
  },
  DealerMark: {
    x: -130,
    y: 27
  },
  Winloss: {
    x: 0,
    y: 70
  },
  WinlossLayer: 2
}] //9人
];
module.exports = {
  CommunityCardPositions: CommunityCardPositions,
  RMTCommunityCardPositions: RMTCommunityCardPositions,
  HoleCardPositions: HoleCardPositions,
  SidePotPositions: SidePotPositions,
  GameTablePlayerAnchorPositions: GameTablePlayerAnchorPositions,
  GameTableLongPlayerAnchorPositions: GameTableLongPlayerAnchorPositions,
  ReplayPlayerAnchorPositions: ReplayPlayerAnchorPositions,
  PlayerComponentPositions: PlayerComponentPositions,
  ReplayPlayerComponentPositions: ReplayPlayerComponentPositions
};

cc._RF.pop();