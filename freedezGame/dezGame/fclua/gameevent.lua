local ge = require("flowcontrol")
local log = require("log")
local json = require("json")
local rlp = require("rlp")
local log = require("log")

SeatStatusType = CreateEnumTable({"NOTJOIN", "NOTSEATED", "SITTING", "SEATED", "PREADY", "READY", "PLAYING", "DISCARD", "NEXTLEAVE", "OFFLINE", "SHOWDOWNOFFLINE", "NEXTSTANDBY"},-1)

SeatStatusTypeStr = {}
SeatStatusTypeStr[0] = "NOTJOIN(0)"
SeatStatusTypeStr[1] = "NOTSEATED(1)"
SeatStatusTypeStr[2] = "SITTING(2)"
SeatStatusTypeStr[3] = "SEATED(3)"
SeatStatusTypeStr[4] = "PREADY(4)"
SeatStatusTypeStr[5] = "READY(5)"
SeatStatusTypeStr[6] = "PLAYING(6)"
SeatStatusTypeStr[7] = "DISCARD(7)"
SeatStatusTypeStr[8] = "NEXTLEAVE(8)"
SeatStatusTypeStr[9] = "OFFLINE(9)"
SeatStatusTypeStr[10] = "SHOWDOWNOFFLINE(10)"
SeatStatusTypeStr[11] = "NEXTSTANDBY(11)"

GameStatusType = CreateEnumTable({"DeskState_Init", "DeskState_Start", "DeskState_Preflop", "DeskState_Flop", "DeskState_Turn", "DeskState_River", "DeskState_ShowDown"},-1)
GameStatusTypeStr = {}
GameStatusTypeStr[0] = "DeskState_Init(0)"
GameStatusTypeStr[1] = "DeskState_Start(1)"
GameStatusTypeStr[2] = "DeskState_Preflop(2)"
GameStatusTypeStr[3] = "DeskState_Flop(3)"
GameStatusTypeStr[4] = "DeskState_Turn(4)"
GameStatusTypeStr[5] = "DeskState_River(5)"
GameStatusTypeStr[6] = "DeskState_ShowDown(6)"

DealStatusType = CreateEnumTable({"None", "Self", "All"},-1)

BackupMsgTypes = CreateEnumTable({"CHECKOUT", "RMT", "TURNCARD", "RIVERCARD"}, 0)

BackupMsgTypesStr = {}
BackupMsgTypesStr[1] = "CHECKOUT(1)"
BackupMsgTypesStr[2] = "RMT(2)"
BackupMsgTypesStr[3] = "TURNCARD(3)"
BackupMsgTypesStr[4] = "RIVERCARD(4)"

PlayerOp = CreateEnumTable({"None", "StandBy", "Waiting", "Straddle", "BuStraddle", "Delay", "Call", "Check", "Bet", "Raise", "Allin", "Fold"},-1)
PlayerOpStr = {}
PlayerOpStr[0] = "None(0)"
PlayerOpStr[1] = "StandBy(1)"
PlayerOpStr[2] = "Waiting(2)"
PlayerOpStr[3] = "Straddle(3)"
PlayerOpStr[4] = "BuStraddle(4)"
PlayerOpStr[5] = "Delay(5)"
PlayerOpStr[6] = "Call(6)"
PlayerOpStr[7] = "Check(7)"
PlayerOpStr[8] = "Bet(8)"
PlayerOpStr[9] = "Raise(9)"
PlayerOpStr[10] = "Allin(10)"
PlayerOpStr[11] = "Fold(11)"

TableProps_TOKEN = 0x01 --Token
TableProps_RMT = 0x02   --Run in Multi Times
TableProps_INS = 0x04   --insurance
TableProps_CINS = 0x08  --custom insurance

BetDataCode = 0x1000 --下注消息
CheckOutDataCode = 0x1001 --弃牌消息
SyncGameReplaysMsgCode = 0x1004 --同步所有GameReplay消息
SyncGameReplaysRespMsgCode = 0x1005 --牌桌最小的有效座位号回应当局所有GameReplay消息
SyncGameReplayRespMsgCode = 0x1006 --牌桌最小的有效座位号回应当局最新GameReplay消息
DealCardMsgCode = 0x1007 --发牌点密钥
ExtendDeclareTimeMsgCode = 0x1008   --延长操作时间消息，只有每一局首位操作者发出才有效果，因为客户端UI显示上一句结算动画可能过长，导致下一局时间不足15秒

RMTTimesMsgCode = 0x1010 --最大者作出选择
RMTTimesRespMsgCode = 0x1011 --非最大者表态同意或反对

INSBuyMsgCode = 0x1020  --领先者购买保险

Timeout_ShuffleCard = 30*1000
Timeout_Dealcard = 15*1000
Timeout_Declare = 23*1000
Timeout_GetBackupKeyCard = 5*1000
Timeout_RmtOp = 35*1000
Timeout_RmtDeclareOp = 20*1000
Timeout_InsOnePotOp = 38*1000   --额外多8秒包含界面1秒，上链打包4-5秒，误差2秒
Timeout_InsTwoPotOp = 48*1000
Timeout_Renotify = 11*1000  --客户端重发间隔10秒，共9次

--只有多牌是影响流程的，需要状态控制，保险是独立的，附属的，有保险一定有多牌（即使桌子属性没启用多牌）
RMTStatus = CreateEnumTable({"None", "ShowRMTOption", "HandCardConsensus", "RMTTimesConsensus", "PublicCards", "PublicCardsConsensus", "End"},-1)
RMTStatusStr = {}
RMTStatusStr[0] = "None(0)"
RMTStatusStr[1] = "ShowRMTOption(1)"
RMTStatusStr[2] = "HandCardConsensus(2)"
RMTStatusStr[3] = "RMTTimesConsensus(3)"
RMTStatusStr[4] = "PublicCards(4)"
RMTStatusStr[5] = "PublicCardsConsensus(5)"
RMTStatusStr[6] = "End(6)"

NetworkError = "Network disconnected"

function ShuffleCardResult(tableid, hand, srcSeat, result)
    log.Info("ShuffleCardResult, tableid", tableid, "TableID", TableID, "hand", hand, "srcSeat", srcSeat, "result", result, "gt.gameInfo", json.encode(gt.gameInfo))
    if hand ~= gt.gameInfo.CurrentHand or tableid ~= TableID then
        log.Warn("ShuffleCardResult", "error tableid or error hand")
        return
    end

    local seat = gt:GetSeat(srcSeat)
    if seat ~= nil then
        seat.shuffleFinish = true
    end

    local unfinishShuffleSeatIDs = gt:unfinishShuffleSeatIDs()
    if #unfinishShuffleSeatIDs ~= 0 then
        log.Info("ShuffleCardResult, DealCardSequence", gt.gameInfo.DealCardSequence, "unfinishShuffleSeatIDs", unfinishShuffleSeatIDs)
        return
    end

    log.Trace("ShuffleCardResult, stopTimer", "shuffleTimer")
    StopTimer("shuffleTimer")
    gt.gamestate = GameStatusType.DeskState_Preflop
    log.Info("set gt.gamestate", GameStatusTypeStr[gt.gamestate] or gt.gamestate)

    gt:AnteBlindBet()
    gt:DealHoleCards()
end

--正常/牌点解备份流程都会调用到此函数，正常流程SeatTo为其他玩家座位号或公共牌座位号，牌点解备份SeatTo为255
function DecPartionDealCardResult(srcSeat, seatTo, index, hand, result)
    log.Info("DecPartionDealCardResult srcSeat", srcSeat, "seatTo", seatTo, "index", index, "hand", hand, "CurrentHand", gt.gameInfo.CurrentHand, "result", result, "getBackupKeyCardTimer", getBackupKeyCardTimer)

    if hand ~= gt.gameInfo.CurrentHand then
        log.Error("DecPartionDealCardResult", "invalid hand")
        return
    end

    if not result then
        log.Error("DecPartionDealCardResult", "decrypt failed")
        return
    end

    gt:CheckDealCardResult(srcSeat, seatTo, index)
end

function ProcessDealCardResult(seat, index, card)
    log.Info("ProcessDealCardResult seat", seat, "index", index, "card", card, "gt.gamestate", GameStatusTypeStr[gt.gamestate] or gt.gamestate)
    for i, v in ipairs(gt.seats) do
        if v.id == seat then
            log.Info("before v.privateIndex", v.privateIndex, "v.privateCard", v.privateCard)
            for ii, vi in ipairs(index) do
                local found = false
                for iii, cur in ipairs(v.privateIndex) do
                    if cur == vi then
                        found = true
                        break
                    end
                end
                log.Info("vi", vi, "found", found)
                if not found then
                    table.insert(v.privateIndex, vi)
                    table.insert(v.privateCard, card[ii])
                else
                    v.privateCard[ii] = card[ii]
                end
            end

            log.Info("after v.privateIndex", v.privateIndex, "v.privateCard", v.privateCard)
        elseif seat == gt.tableInfo.MaxNum + 1 then
            log.Debug("before seatNum", v.id, "publicIndex", v.publicIndex, "publicCard", v.publicCard)
            for ii, vi in ipairs(index) do
                if not isItemExist(v.publicIndex, vi) then
                    table.insert(v.publicIndex, vi)
                end
            end

            if rmt.rmtstatus == RMTStatus.PublicCards then
                local nLen = #card / rmt.rmtTimes
                log.Debug("nLen", nLen)
                for i = 1, rmt.rmtTimes do
                    local cards = {}
                    for j = 1, nLen do
                        log.Debug("(i-1)*nLen+j", (i-1)*nLen+j)
                        table.insert(cards, card[(i-1)*nLen+j])
                    end
                    table.insert(v.rmtCard, cards)
                end
                log.Debug("#v.rmtCard", #v.rmtCard)
            else
                for ic, vc in ipairs(card) do
                    if not isItemExist(v.publicCard, vc) then
                        table.insert(v.publicCard, vc)
                    end
                end
            end
            log.Debug("after seatNum", v.id, "publicIndex", v.publicIndex, "publicCard", v.publicCard)
        end
    end

    if rmt.rmtstatus == RMTStatus.PublicCards then
        gt:DoGameOver()
        return
    end

    --尝试结算
    if gt.gamestate >= GameStatusType.DeskState_ShowDown then
        gt:TryMultiRemainSettle()
        return
    end

    if seat == gt.tableInfo.MaxNum + 1 or gt.gamestate < GameStatusType.DeskState_ShowDown then
        gt:TryStartBetTurn()
    end
end

--DealFlopCards、DealTurnCard、DealRiverCard、RevealHoleCards不超时的情况下解出牌点都会调到这里
function DealCardResult(seat, index, card, hand)--有card一定有对应的index，但有index不一定有对应的card，有可能发暗牌
    log.Info("DealCardResult seat", seat, "index", index, "card", card, "gt.gamestate", GameStatusTypeStr[gt.gamestate] or gt.gamestate, "hand", hand, "gt.index2card", gt.index2card, "getBackupKeyCardTimer", getBackupKeyCardTimer)

    local done = true
    for i, v in ipairs(index) do
        if gt.index2card[tostring(v)] == nil then
            done = false
        end
    end

    if done then
        log.Warn("DealCardResult", "decrypted before")
        return
    end

    for i, v in ipairs(index) do
        gt.index2card[tostring(v)] = card[i]
    end
    log.Debug("DealCardResult gt.index2card", gt.index2card)

    if getBackupKeyCardTimer ~= nil then
        log.Info("DealCardResult", "ignore when getting backupKeyCard")
        return
    else
        local clearDecRecordByIndex = function (decRecord, index)
            for seatId, v in pairs(decRecord) do
                for idx, vv in pairs(v) do
                    if tostring(idx) == tostring(index) then
                        decRecord[seatId][idx] = nil
                    end
                end
            end
        end
        for i, v in ipairs(index) do
            log.Trace("DealCardResult before gt.decRecordBeforeGetBackup", gt.decRecordBeforeGetBackup, "gt.decRecord", gt.decRecord)
            clearDecRecordByIndex(gt.decRecordBeforeGetBackup, v)
            clearDecRecordByIndex(gt.decRecord, v)
            log.Trace("DealCardResult after gt.decRecordBeforeGetBackup", gt.decRecordBeforeGetBackup, "gt.decRecord", gt.decRecord)
        end
    end

--[[
    if #index == 2 and #card==2 then
        if seat==7 then
            card = {39, 13}
        elseif seat == 2 then
            card = {29, 41}
        elseif seat == 4 then
            card = {8, 26}
        end
    elseif #index==3 then
        card = {51,5,31}
    elseif gt.gamestate == GameStatusType.DeskState_Turn then
        card = {45}
    elseif #card==1 then
        card = {47}   --insurance Hit
        --card = {40} --insurance not hit
    end
]]
--[[
    if #index == 2 and #card==2 then
        if seat==7 then
            card = {32, 17} --梅花8，红心6
        elseif seat == 2 then
            card = {33, 11} --梅花9，黑桃K
        elseif seat == 4 then
            card = {18, 1}  --红心7，黑桃3
        end
    elseif #index==3 then
        card = {35, 13, 27} --梅花J，红心2，梅花3
    elseif gt.gamestate == GameStatusType.DeskState_Turn then
        card = {40} --方块3
    elseif #card==1 then
        card = {47}   --insurance Hit
        --card = {40} --insurance not hit
    end
]]
--[[    --保险桌outs为0
    if #index == 2 and #card==2 then
        if seat==0 then
            card = {44, 37} --方块7，梅花K
        elseif seat == 5 then
            card = {42, 29} --方块5，梅花5
        end
    elseif #index==3 then
        card = {16, 11, 13} --红心5，黑桃K，红心2
    elseif gt.gamestate == GameStatusType.DeskState_Turn then
        card = {6} --黑桃8
    elseif #card==1 then
        card = {7} --黑桃9
    end
]]
    --[[ 发第四张牌后outs为0，领先者即使已买过保险也不用买最小保险了
    if #index == 2 and #card==2 then
        if seat==7 then
            card = {0, 21} --黑桃2,红心10
        elseif seat == 2 then
            card = {49, 9} --方块Q,黑桃J
        end
    elseif #index==3 then
        card = {20, 24, 1} --红心9,红心K,黑桃3
    elseif gt.gamestate == GameStatusType.DeskState_Turn then
        card = {47} --方块10
    end
    ]]

    ProcessDealCardResult(seat, index, card)
end

function BackupDecryptCardResult(timeoutSeatID, backupSeatTo, hand, result)
    log.Info("BackupDecryptCardResult timeoutSeatID", timeoutSeatID, "backupSeatTo", backupSeatTo, "hand", hand, "result", result, "gt.timeoutType", gt.timeoutType, "gt.decRecord", gt.decRecord, "gt.index2card", gt.index2card)
    if hand ~= gt.gameInfo.CurrentHand then
        log.Warn("BackupDecryptCardResult", "ignore wrong hand")
        return
    end

    if not result then
        gt:SendGetBackupDecKeys()
        return
    end

    log.Trace("BackupDecryptCardResult stopTimer", "getBackupKeyCardTimer")
    StopTimer("getBackupKeyCardTimer")

    if gt.timeoutType == "declareTimeout" then  --相当于玩家弃牌
        local index = {}
        for i = gt.cursor, 51 do
            table.insert(index, i)
        end
        ge.SendBackupKeyCard(timeoutSeatID, index)
        gt.timeoutType = ""
        gt:TryDeclareNextSeat(gt.curnTurn)
    elseif gt.timeoutType == "dealcardTimeout" then
        local isAllDecrypted = function (decRecord, seatID)
            for k, v in pairs(decRecord[seatID]) do
                if not v then
                    return false
                end
            end
            return true
        end

        log.Trace("BackupDecryptCardResult gt.decRecordBeforeGetBackup", gt.decRecordBeforeGetBackup, "gt.decRecord", gt.decRecord)
        for seatId, v in pairs(gt.decRecordBeforeGetBackup) do
            local beforeBak = isAllDecrypted(gt.decRecordBeforeGetBackup, seatId)
            local afterBak = isAllDecrypted(gt.decRecord, seatId)
            log.Debug("BackupDecryptCardResult, seat", seatId, "before", beforeBak, "after", afterBak)
            if not beforeBak and afterBak then  --获取备份牌点前该座位号的牌点没解出来，获取备份牌点后该座位号的牌点全解出来了
                local index = {}
                local card = {}
                for kk, vv in pairs(v) do
                    local c = gt.index2card[kk]
                    if c ~= nil then
                        table.insert(index, tonumber(kk))
                        table.insert(card, c)
                    end
                end
                log.Debug("BackupDecryptCardResult, seat", seatId, "index", index, "card", card)
                if #index > 0 then
                    if index[1] >= 2 * #gt.gameInfo.DealCardSequence then
                        ProcessDealCardResult(gt.tableInfo.MaxNum + 1, index, card)
                    else
                        ProcessDealCardResult(tonumber(seatId), index, card)
                    end
                end
                gt.decRecord[tostring(seatId)] = nil
                log.Debug("BackupDecryptCardResult, new gt.decRecord", gt.decRecord)
            end
        end
--[[
        --找出最小牌索引，如果小于2*玩家人数，则判断是否解出底牌备份牌点，否则判断是否解出公共牌点
        local minindex = 51
        for k, v in pairs(gt.decRecord) do
            for kk, vv in pairs(v) do
                if tonumber(kk) < minindex then
                    minindex = tonumber(kk)
                end
            end
        end
        log.Debug("BackupDecryptCardResult, minindex", minindex, "gt.gameInfo.DealCardSequence", gt.gameInfo.DealCardSequence)

        if minindex < 2 * #gt.gameInfo.DealCardSequence then
            for k, v in pairs(gt.decRecord) do
                local index = {}
                local card = {}
                for kk, vv in pairs(v) do
                    local c = gt.index2card[kk]
                    if c ~= nil then
                        table.insert(index, tonumber(kk))
                        table.insert(card, c)
                    end
                end
                local seatId = tonumber(k)
                log.Debug("BackupDecryptCardResult, seat", seatId, "index", index, "card", card)
                if #index > 0 then
                    ProcessDealCardResult(seatId, index, card)
                end
            end
        else
            local canDecryptCommunityCard = function (index)
                for k, v in ipairs(gt.gameInfo.DealCardSequence) do
                    if gt.decRecord[tostring(v)][tostring(index)] == nil or not gt.decRecord[tostring(v)][tostring(index)] then
                        return nil
                    end
                end
                return gt.index2card[tostring(index)]
            end

            local index = {}
            local card = {}
            for i = 2 * #gt.gameInfo.DealCardSequence, 51 do
                local c = canDecryptCommunityCard(i)
                if c ~= nil then
                    table.insert(index, i)
                    table.insert(card, c)
                end
            end
            log.Debug("BackupDecryptCardResult, index", index, "card", card)
            if #index > 0 then
                ProcessDealCardResult(gt.tableInfo.MaxNum + 1, index, card)
            end
        end
]]
    end
end

function HandleMsg(srcSeat, code, data, hand)
    log.Trace("HandleMsg, srcSeat", srcSeat, "code", code, "hand", hand)
    if hand ~= gt.gameInfo.CurrentHand then
        log.Error("HandleMsg gt.gameInfo.CurrentHand", gt.gameInfo.CurrentHand)
        return
    end

    if code == SyncGameReplaysMsgCode then  --客户端坐下旁观/切后台后回来/杀进程恢复后会发送SyncGameReplaysMsgCode请求，此时GameReplay数量可能多于1，多于1就不显示发牌动画了
        gt:SyncGameReplays(srcSeat)
        return
    end
    
    local src = gt:GetSeat(srcSeat)
    if src == nil then
        log.Error("HandleMsg", string.format("invalid srcSeat(%d)", srcSeat))
        return
    end
    log.Debug("HandleMsg() src.status", SeatStatusTypeStr[src.status])

    if code == BetDataCode then
        local jsonBetInfo = data:toString()
        log.Trace("HandleMsg(BetDataCode)", jsonBetInfo)
        local betInfo = json.decode(jsonBetInfo)

        local ret = gt:BetHandEx(betInfo[1], betInfo[2])
        if ret then
            StopRenotifyTimer()
            if not gt.turnoperated then
                gt.turnoperated = true
                log.Info("HandleMsg(BetDataCode) set gt.turnoperated", gt.turnoperated)
            end
            gt:TryDeclareNextSeat(betInfo[1])
        end
    elseif code == CheckOutDataCode then
        local jsonCheckOutInfo = data:toString()
        log.Trace("HandleMsg(CheckOutDataCode)", jsonCheckOutInfo)
        local checkoutInfo = json.decode(jsonCheckOutInfo)

        local ret = gt:CheckOutHandEx(checkoutInfo[1], checkoutInfo[2])
        if ret then
            StopRenotifyTimer()
            if not gt.turnoperated then
                gt.turnoperated = true
                log.Info("HandleMsg(CheckOutDataCode) set gt.turnoperated", gt.turnoperated)
            end
        end
    elseif code == ExtendDeclareTimeMsgCode then
        gt:ExtendDeclareTime(srcSeat)
    elseif code == RMTTimesMsgCode then --多牌，领先者选择多牌次数后发送此消息
        local RMTTimes = data:toString()
        log.Trace("HandleMsg(RMTTimesMsgCode)", RMTTimes)

        local ret = rmt:RMTTimesEx(srcSeat, tonumber(RMTTimes))
        if ret then
            StopRenotifyTimer()
        end
    elseif code == RMTTimesRespMsgCode then --多牌。领先者选择多牌次数后等待非领先者决择是否同意，非领先者决择后会发出此消息
        local RMTAgree = data:toString()
        log.Trace("HandleMsg(RMTTimesRespMsgCode)", RMTAgree)

        local ret = rmt:RMTDeclareEx(srcSeat, tonumber(RMTAgree))
        if ret then
            StopRenotifyTimer()
        end
    elseif code == INSBuyMsgCode then
        local jsonamountlist = data:toString()
        log.Trace("HandleMsg(INSBuyMsgCode)", jsonamountlist)

        local ret = ins:BuyIns(srcSeat, json.decode(jsonamountlist))
        if ret then
            if buyInsTimer ~= nil then
                log.Trace("HandleMsg(INSBuyMsgCode) stopTimer", "buyInsTimer")
                StopTimer("buyInsTimer")
            end
            StopRenotifyTimer()
        end
    else
        log.Info("code", code)
    end
end

function HandleAck(msgcode, srcseat, hand)
    log.Trace("HandleAck, msgcode", msgcode, "srcseat", srcseat, "hand", hand)
end
