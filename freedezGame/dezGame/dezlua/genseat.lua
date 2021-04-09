require("init") 
local tx = require("texas")
local json = require("json")
local log = require("log")

GenSeat = class() 

function GenSeat:ctor(bet, fold, seat, sidepot)
    self.Bet = bet
    self.Fold = fold
    self.Seat = seat
    self.Cards = {}
    self.balance = 0
    self.won = 0
    self.level = -1
    self.templevel = -1
    self.levelname = ""
    self.gen = {}
    self.genStr = {}
    self.privateCardStr = {}
    self.publicCardStr = {}
    self.sidepot = sidepot
end

function GenSeat:GenCards()
    local handpokers = tx.MapCards(self.Cards)
    local colorBucket = tx.calColorBucket(handpokers)
    local numBucket = tx.calNumBucket(handpokers)

    self.level, self.gen = tx.checkLevel(handpokers, colorBucket, numBucket)
    if self.Fold == false then --没有弃牌才参与分筹码
        self.templevel = self.level
    end

    local genstr = json.encode(self.gen)
    log.Trace("GenCards() genStr", genstr)

    --打印成牌 
    self.levelname = tx.getLevelName(self.level)
    if self.level == nil or self.gen == nil then 
        log.Trace("level", self.level, "gen", self.gen)
        return 
    end 

    self.genStr = tx.GetPokerStringTable(self.gen)
    log.Trace("Seat", self.Seat, "handlevel " .. tostring(self.level) .. " " .. self.levelname .." 成牌", json.encode(self.genStr))
end

function compareCards(s1, s2)
    if s1.level > s2.level then
        return 1
    elseif s1.level < s2.level then
        return -1
    else
        local nComp = tx.compareInLevel(s1.gen, s2.gen, s1.level)
        log.Trace("Compare() nComp", nComp)
        return nComp
    end
end
