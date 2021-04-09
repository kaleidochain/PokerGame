local log = require("log")

require("init")

game_seat = class()		-- 定义一个基类 game_seat
 
local SeatStatusType = CreateEnumTable({"NOTJOIN", "NOTSEATED", "SITTING", "SEATED", "PREADY", "READY", "PLAYING", "DISCARD", "NEXTLEAVE", "OFFLINE"},-1)
local PlayerOp = CreateEnumTable({"None", "StandBy", "Waiting", "Straddle", "BuStraddle", "Delay", "Call", "Check", "Bet", "Raise", "Allin", "Fold"},-1)

function game_seat:ctor(id, balance, ad)	-- 定义 game_seat 的构造函数
	log.Trace("game_seat ctor, id", id, "balance", balance:String(), "addr", ad)
    self.id = id
    self.balance = balance:Uint64()
    self.ad = ad
    self.status = 0

    self.turnbet = 0
    self.lasttotalbet = 0
    self.action = PlayerOp.None
    self.totalbet = 0
    self.anteBet = 0
    self.sidepot = 0
    self.privateCard = {}
    self.privateIndex = {}
    self.publicCard = {}
    self.publicIndex = {}
    self.rmtCard = {} --二维，而publicCard只有一维
    self.rmtIndex = {}
    self.Fold = false
    self.Allin = false
    self.agreeRMT = false
end
 
function game_seat:IsAllin(bet)
    return self.balance <= bet
end

function game_seat:IsPlaying()
    return self.status == SeatStatusType.PLAYING or self.status == SeatStatusType.NEXTLEAVE
end

function game_seat:AddBet(bet)
    if self.balance <= bet then
        bet = self.balance
        self.Allin = true
    end
    self.balance = self.balance - bet
    self.turnbet = self.turnbet + bet
    self.totalbet = self.totalbet + bet
end

function game_seat:GetTurnBet()
    return self.turnbet
end

return game_seat
