local ge = require("gameengine")
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

function ShuffleCardResult(err, hand) 
    log.Info("ShuffleCardResult, err", (err or "nil"), "hand", hand, "gt.hand", gt.hand)
    if hand ~= gt.hand then
        log.Warn("ShuffleCardResult() hand", hand)
        return
    end
    if err ~= nil then
        return
    end

    if gt.notifyUISecurityTips then
        local tipsInfo = {}
        tipsInfo["Content"] = "Cards have been Shuffled and Encrypted, Completely Random & Unrecognizable"
        ge.NotifyUI("Tips", tipsInfo)
    end

    local myseat = gt:GetSeat(gt.myseat)
    if myseat == nil then --可能已经离开桌子了，因为LeaveTable可能比SettleStart后到
        log.Error("myseat == nil, #seats", #gt.seats)
        return
    end
    if myseat.status == SeatStatusType.PLAYING then
        local ph = ge.DeskID()
        rCtr:submitPointHash(gt.hand, ph)
    end

    gt.gamestate = GameStatusType.DeskState_Preflop
    log.Info("set gt.gamestate", GameStatusTypeStr[gt.gamestate] or gt.gamestate)
end

function DealCardResult(seat, index, card, bRecover)--有card一定有对应的index，但有index不一定有对应的card，有可能发暗牌
    log.Info("DealCardResult seat", seat, "index", index, "card", card, "gt.gamestate", GameStatusTypeStr[gt.gamestate] or gt.gamestate)
    if bRecover==nil then
        bRecover = false
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

            log.Info("v.privateIndex", v.privateIndex, "v.privateCard", v.privateCard)
            -- for ic, vc in ipairs(card) do
            --     table.insert(v.privateCard, vc)
            -- end
        elseif seat == gt.maxplayers + 1 then
            for ii, vi in ipairs(index) do
                if not isItemExist(v.publicIndex, vi) then
                    table.insert(v.publicIndex, vi)
                end
            end

            if gt.rmtstatus == RMTStatus.PublicCards then
                local nLen = #card / gt.rmtTimes
                log.Debug("nLen", nLen)
                for i = 1, gt.rmtTimes do
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
        end
    end

    if seat == gt.myseat then
        gt.selfHoleCards = {}
        gt.selfHoleCards.TableId = gt.tableid
        gt.selfHoleCards.Hand = gt.hand
        gt.selfHoleCards.HoleCards = clone(card)
        ge.NotifyUI("SelfHoleCards", gt.selfHoleCards)
        gt.record:updateHoleCards(gt.myseat, gt.selfHoleCards)
    end
end

function HandleDealCardMsgCode(dealcardReq)
    local cursor = 0
    for seat, seatindex in pairs(dealcardReq) do
        for i, index in pairs(seatindex[3]) do
            if index > cursor then
                cursor = index
            end
        end
    end
    log.Trace("HandleMsg DealCardMsgCode, cursor", cursor)
    ge.DealCard(dealcardReq, cursor, hash)
end

function HandleSyncGameReplaysRespMsgCode(blindinfo, gamereplays)
    gt.waitingGameReplays = false
    log.Trace("HandleSyncGameReplaysRespMsgCode gt.lastrecordlen", gt.lastrecordlen, "#gamereplays", #gamereplays, "gt.myseat", gt.myseat, "DealCardSequence", blindinfo.DealCardSequence)
    if #gamereplays == 1 and gt.lastrecordlen == 0 and isItemExist(blindinfo.DealCardSequence, gt.myseat) then
        ge.NotifyUI("BlindInfo", blindinfo)     --正常流程走这里
    else
        ge.NotifyUI("SyncGameReplaysBlindInfo", blindinfo)  --旁观/切后台/杀进程恢复流程走这里
    end
    gt.record:clone(gamereplays)
    local gamereplay = gt.record:NewestGameReplay()
    if gamereplay ~= nil then
        if gamereplay.WinGenCards == nil then
            local tinfo = gt:transformGameReplayIntoTurnInfo(gamereplay)
            ge.NotifyUI("TurnInfo", tinfo)
        else
            local settleinfo = gt:transformGameReplayIntoGameOverInfo(gamereplay)
            ge.NotifyUI("GameOverInfo", settleinfo)
        end
    else
        log.Warn("HandleSyncGameReplaysRespMsgCode", "empty gamereplays")
    end
end

function HandleSyncGameReplayRespMsgCode(gamereplay)
    if gt.waitingGameReplays then
        --如果这个消息先于GameReplays到达，此时没有BlindInfo的DealCardSequence，isPlaying为false，此GameReplay会被当作第一个TurnInfo来处理，_dealCardPlayerPosArray为空导致没有显示底牌
        log.Warn("HandleSyncGameReplayRespMsgCode, waitingGameReplays ignore this gamereplay")
        return
    end

    gt.record:rawpush(gamereplay)
    gt.record:updateHoleCards(gt.myseat, gt.selfHoleCards)
    local gamereplay = gt.record:NewestGameReplay()
    if gamereplay ~= nil then
        if gamereplay.WinGenCards == nil then
            local tinfo = gt:transformGameReplayIntoTurnInfo(gamereplay)
            ge.NotifyUI("TurnInfo", tinfo)
        else
            local settleinfo = gt:transformGameReplayIntoGameOverInfo(gamereplay)
            ge.NotifyUI("GameOverInfo", settleinfo)
        end
    else
        log.Warn("HandleSyncGameReplayRespMsgCode", "empty gamereplay")
    end
end

function HandleMsg(srcSeat, code, data, hand)
    log.Trace("HandleMsg, srcSeat", srcSeat, "code", code, "hand", hand)
    if hand ~= gt.hand then
        log.Error("HandleMsg gt.hand", gt.hand)
        return
    end

    if srcSeat == 255 then
        if code == DealCardMsgCode then
            local jsonDealCardReq = data:toString()
            log.Trace("HandleMsg(DealCardMsgCode)", jsonDealCardReq)
            local dealcardReq = json.decode(jsonDealCardReq)
            HandleDealCardMsgCode(dealcardReq)
        elseif code == SyncGameReplaysRespMsgCode then
            local jsonGameReplays = data:toString()
            log.Trace("HandleMsg(SyncGameReplaysRespMsgCode)", jsonGameReplays)
            local gamereplaysStruct = json.decode(jsonGameReplays)
            HandleSyncGameReplaysRespMsgCode(gamereplaysStruct.BlindInfo, gamereplaysStruct.GameReplays)
        elseif code == SyncGameReplayRespMsgCode then
            local jsonGameReplay = data:toString()
            log.Trace("HandleMsg(SyncGameReplayRespMsgCode)", jsonGameReplay)
            local gamereplay = json.decode(jsonGameReplay)
            HandleSyncGameReplayRespMsgCode(gamereplay)
        else
            log.Warn("HandleMsg", "unhandled msg")
        end
        return
    end
end

function EventHandler(method, params)
    log.Trace("EventHandler method", method, "params", params)

    if method == "Bet" then
        local t = json.decode(params)
        log.Trace("UI Bet, ID", t.ID, "Bet", t.Bet)

        local myseat = gt:GetSeat(gt.myseat)
   
        if myseat ~= nil and myseat.status == SeatStatusType.PLAYING and myseat.balance <= t.Bet then
            t.Bet = myseat.balance
        end

        local result = gt:BetEx(t.Bet)
        rstr = json.encode(result)
        return rstr
    elseif method == "CheckOut" then
        local t = json.decode(params)
        log.Trace("UI CheckOut, ID", t.ID)

        gt:CheckOutEx()
        return nil
    elseif method == "ExtendDeclareTime" then
        gt:ExtendDeclareTime()
        return nil
    elseif method == "RMTTimes" then
        local t = json.decode(params)
        log.Trace("UI RMTTimes, Times", t.Times)

        gt:RMTTimesEx(t.Times)
        return nil
    elseif method == "DeclareRMT" then
        local t = json.decode(params)
        log.Trace("UI DeclareRMT, bAgree", t.Agree)

        gt:DeclareRMTEx(t.Agree)
        return nil
    elseif method == "Login" then
        local loginData =  gt:OnLogin()
        return json.encode(loginData)
    elseif method == "GetRecoverData" then
        local RDstr = json.encode(gt.RecoverData)
        log.Trace("gt.RecoverData", gt.RecoverData, "RecoverData", RDstr)
        return RDstr
    elseif method == "Recover" then
        rCtr:watchGameEvent(rCtr.curTable)
        if gt.RecoverData.SeatStatus ~= SeatStatusType.NOTJOIN then
            rCtr:HandleReConnectInter()
        end
        gt:syncGameReplays(rCtr.curTable)
        return nil
    elseif string.sub(method, 1 , 3)  == "INS" then
        local result = ins:Handler(method,params)
        return result
    elseif method == "GetTurnInfo" then
        local tinfo = gt:PrintTurn(gt.curnTurn)
        return tinfo
    elseif method == "SyncGameReplays" then
        gt:syncGameReplays(rCtr.curTable)
        return nil
    elseif method == "GetGameReplays" then
        local replay = gt.record:GetGameReplays()
        return replay
    end

    return "jsonxxx"
end

function HandleAck(srcseat, destseat, msgcode, seqnum)
    log.Trace("HandleAck, srcseat", srcseat, "destseat", destseat, "msgcode", msgcode, "seqnum", seqnum)
end

function HandleReSitDown(sitdownresult)
    log.Debug("HandleReSitDown()", sitdownresult, "gt.resitdown", gt.resitdown)

    if gt.resitdown then
        local oldTbid = gt.tableid
        local selfaddr, tbid, seat, status, hand = rCtr:selfPlayingStatus() --这个函数可能还会间接调用call重连成功的处理，勿删，待优化
        if selfaddr == nil then
            return
        end
        log.Debug("tbid", tbid, "gt.tableid", gt.tableid, "status", SeatStatusTypeStr[status])
        if tbid == 0 then   --重连后发现自己不在任何桌子上了，离开桌子
            log.Debug("leaveTableHandler selfaddr", selfaddr, "seat", seat, "hand", hand)
            local gameLeaveData = {}
            table.insert(gameLeaveData, gt.myseat)
            table.insert(gameLeaveData, "")
            local rlpdata, err = rlp.Encode(gameLeaveData)
            leaveTableHandler(gt.tableid, selfaddr, hand, rlpdata, gt.resitdown)
            return
        end

        --重连后，如果自己的状态为未开始的，还要去合约查一下桌子游戏是否已经开始
        gt:syncGameReplays(tbid)
    end

    gt.resitdown = true
end

function HandleConnectErr(errStr)
    local statusInfo = {}
    if errStr ~= "" then
        statusInfo["Status"] = false
    else
        statusInfo["Status"] = true
    end
    log.Debug("HandleConnectErr statusInfo", statusInfo)
    ge.NotifyUI("ConnectStatus", statusInfo)
    ge.NotifyRoom("ConnectStatus", statusInfo)
end
