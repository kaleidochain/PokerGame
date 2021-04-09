local log = require("log")
local ge = require("flowcontrol")
local json = require("json")
local tx = require("texas")
local rlp = require("rlp")
require("init")

RMTStatus = CreateEnumTable({"None", "ShowRMTOption", "HandCardConsensus", "RMTTimesConsensus", "PublicCards", "PublicCardsConsensus", "End"},-1)
RMTStatusStr = {}
RMTStatusStr[0] = "None(0)"
RMTStatusStr[1] = "ShowRMTOption(1)"
RMTStatusStr[2] = "HandCardConsensus(2)"
RMTStatusStr[3] = "RMTTimesConsensus(3)"
RMTStatusStr[4] = "PublicCards(4)"
RMTStatusStr[5] = "PublicCardsConsensus(5)"
RMTStatusStr[6] = "End(6)"

runmultitimes = class()		-- 定义一个基类 runmultitimes

function runmultitimes:ctor()	-- 定义 insurance 的构造函数
    log.Trace("runmultitimes","ctor")
    self.rmtstatus = RMTStatus.None
    self.rmtTimes = 1
    self.turnWin = -1
end

function runmultitimes:unInit()
    log.Trace("runmultitimes","unInit")
    self.rmtstatus = RMTStatus.None
    self.rmtTimes = 1
    self.turnWin = -1
end

function runmultitimes:rmtHasOuts() --多牌剩两张牌判断是否可超过
    local seats = gt.seats
    --local oldpublicCard = gt.publicCard
    local curMax = gt:GetTempWinner(seats, false)

    --log.Debug("getOuts() oldpublicCard", oldpublicCard, "curMax", curMax)

    --2个人时

    --3个人时，多个底池，最多3个池，2个公共，最后一个不算

    local exist = {}
    for k, v in ipairs(seats) do
        if v.status == SeatStatusType.PLAYING and not v.Fold then
            exist[v.privateCard[1]+1] = true --第1张底牌
            exist[v.privateCard[2]+1] = true --第2张底牌
            for kk, vv in ipairs(v.publicCard) do
                exist[vv+1] = true
            end
        end
    end

    --local oldpublicCard = {}
    log.Debug("rmtHasOuts() exist", exist)
    --local outs = {}
    for i = 1, 52 do --花色有影响
        for j = i+1, 52 do --从j到52
            if exist[i] == nil and exist[j] == nil then--要去重
                for k, v in ipairs(seats) do
                    if v.status == SeatStatusType.PLAYING and not v.Fold then
                        table.insert(v.publicCard, i-1)
                        table.insert(v.publicCard, j-1)
                    end
                end
                local newMax = gt:GetTempWinner(seats, false) --与多牌区别，不能并列时按座位号取

                for k, v in ipairs(seats) do
                    --恢复原值
                    if v.status == SeatStatusType.PLAYING and not v.Fold then
                        --v.publicCard = oldpublicCard
                        table.remove(v.publicCard)
                        table.remove(v.publicCard)
                    end
                end

                if newMax ~= curMax then
                    log.Debug("rmtHasOuts() i", i, "j", j, "newMax", newMax)
                    --local out = {i-1, j-1}
                    --table.insert(outs, out)

                    return true --只要找到一个就可以了
                end

            end
        end
    end

    log.Debug("rmtHasOuts()", "false")
    return false
end

--能否显示多牌选择界面的条件
--1. 桌子属性是多牌桌
--2. 之前没显示过多牌选择
--3. 公共牌还没到河牌那轮
--4. 发了三张公共牌且剩余两张公共牌有反转可能
function runmultitimes:canShowRMTOption()
    local isRMTTable = BitAnd(TableProps_RMT, gt.tableInfo.TableProps) ~= 0
    log.Debug("canShowRMTOption, gt.tableInfo.TableProps", gt.tableInfo.TableProps, "isRMTTable", isRMTTable)
    if not isRMTTable then
        return false
    end

    log.Debug("canShowRMTOption, self.rmtstatus", RMTStatusStr[self.rmtstatus])
    if self.rmtstatus > RMTStatus.None then
        return false
    end

    local playingSeats = gt:GetPlayingSeats()
    local seat = gt:GetSeat(playingSeats[1])
    log.Debug("canShowRMTOption, seat.publicCard", seat.publicCard)
    if #seat.publicCard >= 5 then
        return false
    end

    if #seat.publicCard == 3 and not self:rmtHasOuts() then
        log.Debug("canShowRMTOption return false, seat.publicCard", seat.publicCard, "rmtHasOuts", "false")
        return false
    end

    self.waitingRMT = true
    self.rmtstatus = RMTStatus.HandCardConsensus
    log.Info("canShowRMTOption, set self.rmtstatus", RMTStatusStr[self.rmtstatus])
    return true
end

function fnRMTTimesDeclareTimeout()
    log.Trace("fnRMTTimesDeclareTimeout() stopTimer", "rmtTimesDeclareTimer")
    StopTimer("rmtTimesDeclareTimer")

    local tinfo = gt:GetNoOpTurnInfo(-1)
    tinfo["RmtIns"] = {}
    local json = {}
    json["Times"] = rmt.rmtTimes
    json["seatTurn"] = rmt.turnWin
    tinfo["RmtIns"]["RMTTimesChoose"] = json
    local json = {}
    json["Times"] = rmt.rmtTimes
    tinfo["RmtIns"]["RMTTimesResult"] = json
    gt.record:addTurnInfo(tinfo)
    gt:TrySendGameReplay()

    --非领先者表决超时，默认同意，按领先者选择的次数发牌
    rmt.rmtstatus = RMTStatus.PublicCards
    gt:DealRMTCards()

    log.Trace("fnRMTTimesDeclareTimeout", "SaveState")
    SaveState()
end

--领先者选择次数或者领先者选择超时会调用此函数
function runmultitimes:processRMTTimesChoose(nTimes)
    self.waitingRMT = false
    self.rmtTimes = nTimes
    local seat = gt:GetSeat(self.turnWin)
    seat.agreeRMT = true
    if self.rmtTimes == 1 then  --1次也不用经过非领先者表决是否同意，直接发牌
        self.rmtstatus = RMTStatus.End

        local tinfo = gt:GetNoOpTurnInfo(-1)
        tinfo["RmtIns"] = {}
        local json = {}
        json["Times"] = nTimes
        json["seatTurn"] = self.turnWin
        tinfo["RmtIns"]["RMTTimesChoose"] = json
        local json = {}
        json["Times"] = self.rmtTimes
        tinfo["RmtIns"]["RMTTimesResult"] = json
        gt.record:addTurnInfo(tinfo)
        gt:TrySendGameReplay()

        --领先者多牌次数选择超时，默认一次，走普通Allin发牌逻辑
        gt:processAllin()

        log.Trace("processRMTTimesChoose rmttimes == 1", "SaveState")
        SaveState()
        return
    end

    log.Trace("processRMTTimesChoose() resetTimer", "rmtTimesDeclareTimer", "expired", os.date("%X", os.time() + Timeout_RmtDeclareOp / 1000))
    StopTimer("rmtTimesDeclareTimer")
    StartTimer("rmtTimesDeclareTimer", Timeout_RmtDeclareOp)

    local tinfo = gt:GetNoOpTurnInfo(-1)
    tinfo["RmtIns"] = {}
    local json = {}
    json["Times"] = nTimes
    json["seatTurn"] = self.turnWin
    tinfo["RmtIns"]["RMTTimesChoose"] = json
    gt.record:addTurnInfo(tinfo)
    gt:TrySendGameReplay()

    log.Trace("processRMTTimesChoose", "SaveState")
    SaveState()
end

function fnRMTTimesChooseTimeout()
    log.Trace("fnRMTTimesChooseTimeout() stopTimer", "rmtTimesChooseTimer")
    StopTimer("rmtTimesChooseTimer")

    rmt:processRMTTimesChoose(1)
end

--通知客户端显示多牌，并设置领先者多牌选择超时定时器，领先者超时后按一次多牌发牌
function runmultitimes:ShowRMTOption()
    log.Trace("ShowRMTOption() resetTimer", "rmtTimesChooseTimer", "expired", os.date("%X", os.time() + Timeout_RmtOp / 1000))
    StopTimer("rmtTimesChooseTimer")
    StartTimer("rmtTimesChooseTimer", Timeout_RmtOp)

    self.turnWin = gt:GetTempWinner(gt.seats)
    local tinfo = gt:GetNoOpTurnInfo(-1)
    tinfo["RmtIns"] = {}
    tinfo["RmtIns"]["ShowRMTOption"] = {}
    tinfo["RmtIns"]["ShowRMTOption"]["seatTurn"] = self.turnWin
    gt.record:addTurnInfo(tinfo)
    gt:TrySendGameReplay()

    log.Trace("ShowRMTOption", "SaveState")
    SaveState()
end

function runmultitimes:RMTTimesEx(seat, nTimes)
    log.Trace("RMTTimesEx(), seat", seat, "self.turnWin", self.turnWin, "nTimes", nTimes)
    if seat ~= self.turnWin then
        log.Error("RMTTimesEx", "invalid RMTTimes action")
        return false
    end

    if nTimes < 1 or nTimes > 4 then
        log.Error("RMTTimesEx", "invalid RMTTimes")
        return false
    end

    self:processRMTTimesChoose(nTimes)
    return true
end

function runmultitimes:RMTDeclareEx(seat, RMTAgree)
    log.Trace("RMTDeclareEx(), seat", seat, "gt.turnWin", gt.turnWin, "RMTAgree", RMTAgree)
    if seat == gt.turnWin then
        log.Error("RMTDeclareEx", "invalid RMTAgree action")
        return false
    end

    local rmtseat = gt:GetSeat(seat)
    if rmtseat == nil then
        log.Error("RMTDeclareEx", "invalid seatID")
        return false
    end
    rmtseat.agreeRMT = (RMTAgree ~= 0)
    if RMTAgree == 0 then   --有玩家不同意，按一次发牌
        if rmtTimesDeclareTimer ~= nil then
            log.Trace("RMTDeclareEx() not agree, stopTimer", "rmtTimesDeclareTimer")
            StopTimer("rmtTimesDeclareTimer")
        end
        self.rmtstatus = RMTStatus.PublicCards

        local tinfo = gt:GetNoOpTurnInfo(-1)
        tinfo["RmtIns"] = {}
        local json = {}
        json["Times"] = self.rmtTimes
        json["seatTurn"] = self.turnWin
        tinfo["RmtIns"]["RMTTimesChoose"] = json
        local json = {}
        json["Times"] = 1
        tinfo["RmtIns"]["RMTTimesResult"] = json
        gt.record:addTurnInfo(tinfo)
        gt:TrySendGameReplay()
        self.rmtTimes = 1
        self.rmtstatus = RMTStatus.End

        gt:processAllin()

        log.Trace("RMTDeclareEx RMTAgree == 0", "SaveState")
        SaveState()
        return true
    end

    local allAgree = true
    local playingSeats = gt:GetPlayingSeats()
    for i, v in ipairs(playingSeats) do
        local seat = gt:GetSeat(v)
        if not seat.agreeRMT then
            log.Debug("RMTDeclareEx, seatNum", string.format("%d not agree yet", v))
            allAgree = false
            break
        end
    end

    if allAgree then
        if rmtTimesDeclareTimer ~= nil then
            log.Trace("RMTDeclareEx() allAgree, stopTimer", "rmtTimesDeclareTimer")
            StopTimer("rmtTimesDeclareTimer")
        end

        local tinfo = gt:GetNoOpTurnInfo(-1)
        tinfo["RmtIns"] = {}
        local json = {}
        json["Times"] = self.rmtTimes
        json["seatTurn"] = self.turnWin
        tinfo["RmtIns"]["RMTTimesChoose"] = json
        local json = {}
        json["Times"] = self.rmtTimes
        tinfo["RmtIns"]["RMTTimesResult"] = json
        gt.record:addTurnInfo(tinfo)
        gt:TrySendGameReplay()

        --非领先者表决超时，默认同意，按领先者选择的次数发牌
        self.rmtstatus = RMTStatus.PublicCards
        gt:DealRMTCards()

        log.Trace("RMTDeclareEx allAgree", "SaveState")
        SaveState()
    end
    return true
end

rmt = runmultitimes:new()
