local ge = require("gameengine")
local tx = require("texas")
local st = require("seat")
local json = require("json")
local eth = require("eth")
local rlp = require("rlp")
local log = require("log")

require("abi")
require("uihandler")
require("genseat")
require("gameevent")
require("insurance")
require("recover")
require("gamerecord")

game_texas = class()		-- 定义一个类 game_texas

function isItemExist(t, i)
    for k, v in ipairs(t) do
        if v == i then
            return true
        end
    end
    return false
end

function init(obj,resetFlag)
    obj.hand = 0
    obj.tableid = 0
    obj.TurnThroughCount = 1   --当前轮经过的人数（包括弃牌和allIn,PrintTurn使用暂时设为1）
    obj.lastrecordlen = 0      --上一次牌局回放记录数
    obj.waitingGameReplays = false  --旁观/切后台/杀进程恢复时调用syncGameReplays设置此值为true，期间不接收其他GameReplay

    obj.selfHoleCards = {}

    if resetFlag == nil then
        obj.resitdown = false --只有非第一次坐下才重新监听事件
    end

    --恢复数据，返回给UI
    obj.RecoverData = {}
end

function game_texas:ctor()	-- 定义 game_texas 的构造函数
	log.Trace("game_texas", "ctor")
    init(self)
    self.seats = {}
    self.myseat = -1
    
    self.gamestate = 0
    self.roomManagercontract = eth.contract(RoomManagerABI, RoomManagerAddr)
end
 
function game_texas:join(seat, balance, tableid , playeraddr, nodelist, isself, connectornot)
    local err = nil
    if self:getPlayerSeat(playeraddr) == -1 then
        local ns = st.new(seat, balance, playeraddr)
        ns.status = SeatStatusType.SEATED
        table.insert(self.seats, ns)
        if isself == true then
            self.myseat = seat
            local tipsInfo = {}
            tipsInfo["Content"] = "Safe Private Network Is Being Set Up..."
            ge.NotifyUI("Tips", tipsInfo)
        end
        if self.tableid == 0 then
            self.tableid = tableid
        end
        local naddr = newAddress(playeraddr)
        err = ge.Sit(seat, isself, tableid, naddr, nodelist, connectornot)
    else
        err = "already in desk"
    end
    return err
end

function game_texas:updateNextLeave(nextleaveids, hand)
    for i, v in ipairs(nextleaveids) do
        if v.Tableid == self.tableid then
            for si, sv in ipairs(self.seats) do
                if sv.id == v.Pos and v.Hand ~= hand then
                    log.Trace("updateNextLeave() id", sv.id, "hand", hand)
                    sv.status = SeatStatusType.NEXTLEAVE
                end
            end
        else
            log.Warn("updateNextLeave() v.Tableid", v.Tableid, "self.tableid", self.tableid)
        end
    end
end

function game_texas:NextSeat(playSeats, id)
    for i, v in ipairs(playSeats) do
        log.Trace("next Seat, i", i, "v", v, "id", id)
        if v == id then
            if i == #playSeats then
                return playSeats[1]
            end

            return playSeats[i+1]
        end
    end

    return nil
end

function game_texas:startGame(tbinfo, pl, nextleaveids, hand, selfaddr)
    self.seats = {} --要先清空，有的可能已经被公证踢掉了
    for i=1, #pl do
        log.Trace("pl info: i", i, "Pos", pl[i].Pos, "Status", SeatStatusTypeStr[pl[i].Status], "Amount", pl[i].Amount:String(), "PlayerAddr", pl[i].PlayerAddr, "Hand", pl[i].Hand)
        if pl[i].Status == SeatStatusType.NEXTLEAVE then
            pl[i].Status = SeatStatusType.PLAYING
        end

        if pl[i].Status == SeatStatusType.PLAYING and pl[i].Amount:String()=="0" then
            log.Error("startGame() player has no balance!!! i", i, "Pos", pl[i].Pos)
        end

        local seat = self:getPlayerSeat(pl[i].PlayerAddr)
        if seat ~= pl[i].Pos then
            if seat == -1 then
                local ns = st.new(pl[i].Pos, pl[i].Amount, pl[i].PlayerAddr)
                ns.status = pl[i].Status
                table.insert(self.seats, ns)
            else
                for j,v in ipairs(self.seats) do
                    if v.ad == pl[i].PlayerAddr then
                        if v.id ~= pl[i].Pos then
                            v.id = pl[i].Pos
                            v.status = pl[i].Status
                        end
                        break
                    end
                end
            end

            local isself = false
            if selfaddr == pl[i].PlayerAddr then
                isself = true
                self.myseat = pl[i].Pos
            end

            local naddr = newAddress(pl[i].PlayerAddr)
            local nodelist = {}
            ge.Sit(pl[i].Pos, isself, tbinfo.TableID, naddr, nodelist, false)
        else
            self:updateState(pl[i].Pos, pl[i].PlayerAddr, pl[i].Status, pl[i].Amount)
        end

        if pl[i].Pos == tbinfo.SmallBlindPos and pl[i].Status ~= SeatStatusType.PLAYING then
            tbinfo.SmallBlindPos = -1
        end
    end

    local nlstr = json.encode(nextleaveids)
    log.Trace("next leave seats++++++++++", nlstr)

    log.Debug("myseat", self.myseat, "seats len", #self.seats)

    self:updateNextLeave(nextleaveids, hand)

    self.notifyUISecurityTips = false
    local myseat = self:GetSeat(self.myseat)

    if myseat ~= nil then
        log.Trace("myseat.status", SeatStatusTypeStr[myseat.status], "SeatStatusType.NEXTLEAVE", SeatStatusType.NEXTLEAVE)
        if myseat.status == SeatStatusType.NEXTLEAVE then
            return
        end
        log.Info("Game Start.................", "")
        
        local seatSortFun = function(a, b)
            return a.id < b.id 
        end
        table.sort(self.seats, seatSortFun)
        
        local playSeats = {}
        local num = 0
        for i, v in ipairs(self.seats) do
            if v.status == SeatStatusType.PLAYING then
                num = num + 1
                table.insert(playSeats, v.id)
                if v.id == self.myseat then
                    self.notifyUISecurityTips = true
                end
            end
        end

        if num >= 4 and tbinfo.Straddle == 1 then
            self.straddleFlag = true
        end
        log.Debug("playingNum", num, "tbinfo.straddle", tbinfo.Straddle, "self.straddleFlag", self.straddleFlag)

        local bstr = json.encode(playSeats)
        log.Debug("play seats", bstr)

        self.hand = hand
        self.tableid = tbinfo.TableID
        self.smallBlindBet = tbinfo.SmallBlind
        self.anteBet = tbinfo.Ante
        self.smallBlindPos = tbinfo.SmallBlindPos
        self.bigBlindPos = tbinfo.BigBlindPos
        self.dealerPos = tbinfo.DealerPos

        log.Debug("Blind Info, smallBlindPos", self.smallBlindPos, "bigBlindPos", self.bigBlindPos, "dealerPos", self.dealerPos, "ante", self.anteBet, "hand", self.hand)

        if self.straddleFlag == true then
            --这里不能用导出的NextSeat接口，因为还没有设置这一局玩游戏的玩家playSeats, 
            --调用导出接口找不到下一个位置，会返回错误。
            straddlepos, _ = self:NextSeat(playSeats, self.bigBlindPos)
            if straddlepos == nil then
                error("Not have nextSeat")
            end
            self.straddlepos = straddlepos
        end

        self.maxplayers = tbinfo.Maximum

        if self.notifyUISecurityTips then
            local tipsInfo = {}
            tipsInfo["Content"] = "Create Card Stacks Randomly & Shuffled by players one by one."
            log.Info("tipsInfo",tipsInfo)
            ge.NotifyUI("Tips", tipsInfo)
        end
        rCtr:HandleReConnectInter()
        ge.ShuffleCard(52, playSeats, self.maxplayers, self.hand)
        
        log.Debug("gamerecord", gamerecord)
        self.record = gamerecord.new(self.dealerPos)
    else
        log.Warn("Game Already Start , but you not in the game....., myseat", (self.myseat or "nil"))
    end
end

function game_texas:GameReset(bClearAllMsg)
    self:gameStateUninit()
    ge.GameReset(bClearAllMsg)
end

function game_texas:gameStateUninit()
    log.Trace("gameStateUninit", "")
    self.gamestate = -1
    init(self,true)

    ins:unInit()

    if self.record ~= nil then
        self.record:unInit()
    end

    if self.seats ~= nil then
        for i,v in ipairs(self.seats) do
            v.turnbet = 0
            v.lasttotalbet = 0
            v.action = PlayerOp.None
            v.totalbet = 0
            v.anteBet = 0
            v.sidepot = 0
            v.privateCard = {}
            v.privateIndex = {} 
            v.publicCard = {} 
            v.publicIndex = {}
            v.rmtCard = {} --二维，而publicCard只有一维
            v.rmtIndex = {}
            v.Fold = false
            v.Allin = false
            v.agreeRMT = false
        end
    end
end

function game_texas:updateState(pos, addr, state, balance)
    for i, v in ipairs(self.seats) do
        if (v.id == pos and v.ad == addr) then
            log.Trace("updateState id", v.id, "state", state)
            v.status = state
            v.balance = balance:Uint64()
        end
    end
end

function game_texas:getPlayerSeat(addr)
    for i,v in ipairs(self.seats) do
        if v.ad == addr then
            return v.id
        end
    end

    return -1
end

function game_texas:leave(seat, selfflag)
    log.Trace("Leave Table Start, seat", seat, "selfflag", selfflag)
    
    ge.Leave(seat, selfflag)

    if selfflag == true then
        self.seats = {}
        self:GameReset(true)
        
        self.resitdown = false
    else
        if self.seats ~= nil then
            for i, v in ipairs(self.seats) do
                if v.id == seat then
                    table.remove(self.seats, i)
                    break
                end
            end
        end
    end

    log.Trace("Leave Table End....", "")
end

function game_texas:BetEx(bet)
    log.Info("BetEx(bet)====>", bet)
    local bresultinfo = {state = 0, info = ""}

    local betInfo = {}
    table.insert(betInfo, self.myseat)
    table.insert(betInfo, bet)
    local jsonbi = json.encode(betInfo)
    local bidata = byteSlice:new()
    bidata:appendString(jsonbi)
    ge.Send({255}, BetDataCode, bidata)

    local myseat = self:GetSeat(self.myseat)
    myseat:AddBet(bet)
    local maxTotalBet = 0
    local noOneBet = true
    for i, v in ipairs(self.seats) do
        if v.lasttotalbet > maxTotalBet then
            maxTotalBet = v.lasttotalbet
        end
        if v.action == PlayerOp.Bet or v.action == PlayerOp.Call or v.action == PlayerOp.Raise then
            noOneBet = false
        end
    end
    log.Trace("BetEx() noOneBet", noOneBet, "maxTotalBet", maxTotalBet, "myseat.lasttotalbet", myseat.lasttotalbet, "myseat.totalbet", myseat.totalbet, "myseat.balance", myseat.balance)
    if myseat.balance == 0 then
        bresultinfo.op = PlayerOp.Allin
    elseif myseat.totalbet > maxTotalBet and noOneBet then
        bresultinfo.op = PlayerOp.Bet
    elseif myseat.totalbet == myseat.lasttotalbet then
        bresultinfo.op = PlayerOp.Check
    elseif myseat.totalbet > myseat.lasttotalbet and myseat.totalbet <= maxTotalBet then
        bresultinfo.op = PlayerOp.Call
    else
        bresultinfo.op = PlayerOp.Raise
    end
    return bresultinfo
end

function game_texas:CheckOutEx()
    log.Info("CheckOutEx()====>", "")
    local checkoutInfo = {}
    table.insert(checkoutInfo, self.myseat)
    table.insert(checkoutInfo, self.cursor)
    local jsoncoi = json.encode(checkoutInfo)
    local coidata = byteSlice:new()
    coidata:appendString(jsoncoi)
    ge.Send({255}, CheckOutDataCode, coidata)
end

function game_texas:ExtendDeclareTime()
    local emptydata = byteSlice:new()
    ge.Send({255}, ExtendDeclareTimeMsgCode, emptydata)
end

function game_texas:RMTTimesEx(nTimes)
    log.Info("RMTTimesEx()====>", nTimes)
    local rmttimesdata = byteSlice:new()
    rmttimesdata:appendString(string.format("%d", nTimes))
    self.rmtTimes = nTimes
    ge.Send({255}, RMTTimesMsgCode, rmttimesdata)
end

function game_texas:DeclareRMTEx(bAgree)
    log.Info("DeclareRMTEx()====>", bAgree)

    local declarermtdata = byteSlice:new()
    declarermtdata:appendString(string.format("%d", bAgree and 1 or 0))
    ge.Send({255}, RMTTimesRespMsgCode, declarermtdata)
end

function game_texas:AnteBet()
    for i, v in ipairs(self.seats) do
        if v.status == SeatStatusType.PLAYING then
            if v.balance >= self.anteBet then
                v.anteBet = self.anteBet
                v.totalbet = v.totalbet + self.anteBet
                v.balance = v.balance - self.anteBet
            else 
                error("balance too lower")
            end
        end
    end
end

function game_texas:GetSeat(seat)
    for i,v in ipairs(self.seats) do
        log.Trace("seatid", v.id, "addr", v.ad)
        if v.id == seat then
            return v
        end
    end

    return nil
end

function game_texas:transformGameReplayIntoTurnInfo(gamereplay)
    local tinfo = clone(gamereplay)
    for i, v in pairs(tinfo.PlayerInfo) do
        if v.Operate == PlayerOp.Fold then
            tinfo.PlayerInfo[i].Fold = true
        else
            tinfo.PlayerInfo[i].Fold = false
        end
        if v.Balance == 0 then
            tinfo.PlayerInfo[i].Allin = true
        else
            tinfo.PlayerInfo[i].Allin = false
        end
    end

    self.maxTurnBet = 0
    for i, v in pairs(self.seats) do
        if gamereplay.PlayerInfo[tostring(v.id)] ~= nil then
            v.totalbet = gamereplay.PlayerInfo[tostring(v.id)].TotalBet
            v.turnbet = gamereplay.PlayerInfo[tostring(v.id)].TurnBet
            v.balance = gamereplay.PlayerInfo[tostring(v.id)].Balance
            v.action = gamereplay.PlayerInfo[tostring(v.id)].Operate
            v.lasttotalbet = v.totalbet
            if v.turnbet > self.maxTurnBet then
                self.maxTurnBet = v.turnbet
            end
        end
    end

    local nseat = self:GetSeat(gamereplay.CurnSeat)
    if nseat ~= nil then
        self.diffBet = self.maxTurnBet - nseat.turnbet
    end

    tinfo.CardsLevelName = ""
    local tm = {}
    table.insert(tm, tinfo.CommunityCards)
    table.insert(tm, self.selfHoleCards.HoleCards)
    log.Trace("transformGameReplayIntoTurnInfo() tm", tm)
    local Cards = tx.Merge(tm)
    log.Trace("transformGameReplayIntoTurnInfo() #Cards", #Cards)
    if #Cards > 0 then
        local handpokers = tx.MapCards(Cards)
        log.Trace("transformGameReplayIntoTurnInfo() handpokers", handpokers)
        local colorBucket = tx.calColorBucket(handpokers)
        log.Trace("transformGameReplayIntoTurnInfo() colorBucket", colorBucket)
        local numBucket = tx.calNumBucket(handpokers)
        log.Trace("transformGameReplayIntoTurnInfo() numBucket", numBucket)
        local level= tx.checkLevel(handpokers, colorBucket, numBucket)
        log.Trace("transformGameReplayIntoTurnInfo() level", level)
        tinfo.CardsLevelName = tx.getLevelName(level)
    end
    local myseat = self:GetSeat(self.myseat)
    if tinfo.CurnSeat == self.myseat then
        log.Trace("transformGameReplayIntoTurnInfo() You Turn", "Please Declare! You have 20s Think...")
        tinfo.IsMyTurn = true
        tinfo.OP = {
            ["Fold"] = false,
            ["Check"] = false,
            ["Bet"] = false,
            ["Call"] = {
                ["Flag"] = false,
                ["Value"] = 0,
            },
            ["Raise"] = {
                ["Flag"] = false,
                ["Value"] = 0,
            },
        }
        if self.diffBet == 0 then
            tinfo.OP.Fold = true
            tinfo.OP.Check = true
            tinfo.OP.Bet = true
        else
            tinfo.OP.Fold = true
            tinfo.OP.Call.Flag = true
            tinfo.OP.Call.Value = self.diffBet
            tinfo.OP.Raise.Flag = true
            tinfo.OP.Raise.Value = self:CalRaiseVal(tinfo)
        end
    else
        tinfo.IsMyTurn = false
        tinfo.OP = {}
        if tinfo.PlayerInfo[tostring(self.myseat)] ~= nil and not tinfo.PlayerInfo[tostring(self.myseat)].Fold and myseat.balance > 0 and myseat.status == SeatStatusType.PLAYING then
            local myCallMin = self.maxTurnBet - myseat:GetTurnBet()
            log.Trace("PrintTurn self.maxTurnBet", self.maxTurnBet)
            log.Trace("PrintTurn myseat:GetTurnBet()", myseat:GetTurnBet())
            log.Trace("PrintTurn myCallMin", myCallMin)
            log.Trace("PrintTurn myseat.action", myseat.action)
            if myseat.action == PlayerOp.None or myCallMin > 0 then
                tinfo.OP.AheadOfFold = true
                tinfo.OP.AheadOfCheck = true
                tinfo.OP.AheadOfCall = {
                    ["Flag"] = true,
                    ["Value"] = 0,
                }
                if myCallMin > 0  then
                    tinfo.OP.AheadOfCheck = false
                    tinfo.OP.AheadOfCall.Value = myCallMin
                end
            end
        end
    end

    if tinfo.PlayerInfo[tostring(self.myseat)] ~= nil and tinfo.PlayerInfo[tostring(self.myseat)].Fold and tinfo.RmtIns ~= nil and tinfo.RmtIns.RMTTimesChoose ~= nil then
        tinfo.RmtIns.RMTTimesChoose.seatTurn = self.myseat  --只是为了让弃牌者显示等待非领先者是否同意
    end
    return tinfo
end

function game_texas:transformGameReplayIntoGameOverInfo(gamereplay)
    local settleinfo = clone(gamereplay)
    return settleinfo
end

-- raise最小值 = 跟注值 + 增加值
-- 跟注值 = 最大下注值 - 自己本轮所下的注
-- 增加值 = 本轮的上一个人下注值（可能不存在） - 本轮的上上一个人下注值（可能不存在）
function game_texas:CalRaiseVal(uiinfo)
    local val = uiinfo.OP.Call.Value
    log.Debug("CalRaiseVal val",val)
    local preSeat = self:getRaisePreSeat(self.myseat,0)
    if preSeat == nil then
        log.Error("CalRaiseVal() Get preSeat err","preSeat == nil")
        log.Trace("CalRaiseVal val1",val,", round",string.format("%.2f K",val/1000))
        return val
    end
    log.Debug("CalRaiseVal() preSeat:GetTurnBet()",preSeat:GetTurnBet())
    local preSeat2 = self:getRaisePreSeat(preSeat.id,1)
    if preSeat2 == nil then
        val = val + preSeat:GetTurnBet() - 0
        log.Debug("CalRaiseVal val2",val,", round",string.format("%.2f K",val/1000))
        return val
    else
        log.Debug("CalRaiseVal() preSeat2:GetTurnBet()",preSeat2:GetTurnBet())
        val = val + preSeat:GetTurnBet() - preSeat2:GetTurnBet()
        log.Trace("CalRaiseVal val3",val,", round",string.format("%.2f K",val/1000))
        return val
    end
end

function game_texas:getRaisePreSeat(seatId,preCount)
    local preId = seatId
    local err
    local preSeat
    log.Trace("getRaisePreSeat seatId",seatId,"self.TurnThroughCount",self.TurnThroughCount)
    for remain = self.TurnThroughCount-1-preCount, 1, -1  do
        log.Trace("getRaisePreSeat remain",remain)
        preId, err = ge.PreSeat(preId)
        log.Debug("getRaisePreSeat preId",preId)
        if err ~= nil then
            log.Error("getRaisePreSeat PreSeat err", err,"seatId",seatId)
            return nil
        end

        preSeat = self:GetSeat(preId)
        if preSeat == nil then
            log.Debug("getRaisePreSeat preSeat == nil", err,"preId",preId)
            return nil
        end
        if preSeat.Fold == false and preSeat.Allin == false then
            log.Debug("getRaisePreSeat return normal preId",preId)
            return preSeat
        elseif preSeat.Allin == true and preSeat:GetTurnBet() == self.maxTurnBet then --不能是余额不够被迫AllIn的
            log.Debug("getRaisePreSeat return allin preId",preId)
            return preSeat
        end
        preSeat = nil
    end
    return preSeat
end

function game_texas:execRecover(selfaddr, tbid, seat, status, hand, bRecoverFile)

    log.Trace("execRecover, selfseat",seat,"tbid", tbid, "hand", hand,"bRecoverFile",bRecoverFile,"self.hand",self.hand)

    if hand ~= self.hand then
        log.Trace("execRecover, table hand is not equal seat hand so use table hand seat hand",hand,"table hand", self.hand)
        hand = self.hand
    end

    local reData, cursor, err = ge.Recover(seat, 52, tbid, hand, bRecoverFile)
    if err ~= nil then
        log.Error("execRecover err:", err)
        return
    end

    log.Trace("execRecover, cursor", cursor, "recoverData", reData)
    for i, v in ipairs(reData:logicData()) do
        log.Trace(string.format("execRecover, [%d/%d] SrcSeat", i, #reData:logicData()), v.SrcSeat, "Msg Code", v.Code, "Data", v.Data)
    end

    local consensustate = reData:consensuState()
    log.Info("execRecover, Consensustate", consensustate)

    if consensustate < 3 then   --洗牌没完成
        log.Warn("Lua Layer can't recover...", "")
        return
    end

    local rehand = reData:hand()
    log.Info("execRecover rehand", rehand, "hand", hand)
    if hand ~= rehand and hand ~= 0 then --旁观者hand==0，也要能恢复
        log.Warn("Hand is not Equal", "")
        return
    else
        self.RecoverData.Hand = rehand
        self.cursor = cursor
        log.Info("execRecover, self.cursor", self.cursor)
    end

end

function game_texas:OnLogin()
    local data = {}
    local selfaddr, tbid, seat, status, hand = rCtr:selfPlayingStatus()
    log.Info("OnLogin selfaddr",selfaddr,"tbid",tbid,"status",SeatStatusTypeStr[status])
    data.ReEnterTableId = -1
    if selfaddr ~= nil then
        if tbid > 0 then
            -- 防御性代码,玩家状态是正在玩但可能合约桌子已过期
            local tableInfoEx = rCtr:GetTableInfoEx(tbid)
            log.Info("OnLogin tableInfoEx.TableId",tableInfoEx.TableId,"tableInfoEx.EndTime",tableInfoEx.EndTime,"tableInfoEx.LeftTime",tableInfoEx.LeftTime)
            if tableInfoEx.TableId == tbid and (tableInfoEx.EndTime == 0 or (tableInfoEx.EndTime > 0 and tableInfoEx.LeftTime > 0)) then
                rCtr:setCurTable(tbid)
                gt:handleRecover(selfaddr, tbid, seat, status, hand)
                data.ReEnterTableId = tbid
            end
        else
            log.Warn("OnLogin tbid", "=0")
        end
    else
        log.Error("OnLogin err", "selfaddr == nil")
    end
    return data
end

function game_texas:handleRecover(selfaddr, tbid, seat, status, hand)
    log.Info("handleRecover", SeatStatusTypeStr[status])
    if status == SeatStatusType.NOTJOIN then
        --1 还没有调用openDoor
        --2 调用了openDoor，但是还没有上链
        --还没有table
        self.RecoverData.SeatStatus = status
        return
    elseif status == SeatStatusType.NOTSEATED then
        --1 没有调用sitDown
        --2 调用了sitDonw,但是还没上链
        --还没有table
        rCtr:leaveTable()
        self.RecoverData.SeatStatus = status
        return
    elseif status == SeatStatusType.SITTING then
        --1 调用sitDown成功，并上链
        --2 集齐三个玩家，但是还没有上链
        --还没有table
        rCtr:leaveTable()
        self.RecoverData.SeatStatus = status
        return
    elseif status == SeatStatusType.SEATED then
        --1 三个玩家集齐，并上链
        --2 已经准备，调用了start,但是还没有上链
        --已经有table
        rCtr:leaveTable()
        self.RecoverData.SeatStatus = status
        return
    elseif status == SeatStatusType.PREADY then
        --1 已经准备，调用了start,并上链
        --2 三个玩家都准备，调用了start，但是还没有上链
        --已经有table
        rCtr:leaveTable()
        self.RecoverData.SeatStatus = status
        return
    elseif status == SeatStatusType.READY then
        --1 已经准备，调用了start,并上链
        --2 三个玩家都准备，调用了start，但是还没有上链
        --已经有table
        rCtr:leaveTable()
        self.RecoverData.SeatStatus = status
        return
    elseif status == SeatStatusType.DISCARD or status == SeatStatusType.OFFLINE or status == SeatStatusType.SHOWDOWNOFFLINE then
        ge.SetHand(hand)
        self.RecoverData.SeatStatus = status
        rcv:recoverSeats(selfaddr, tbid)
        if status == SeatStatusType.OFFLINE or status == SeatStatusType.SHOWDOWNOFFLINE then
            local tx = rCtr.tc.Transact("standup", false)
            if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
                log.Error("Network", "disconnected")
                return NetworkError
            end
        end
    elseif status == SeatStatusType.PLAYING or status == SeatStatusType.NEXTLEAVE or status == SeatStatusType.NEXTSTANDBY then
        --1 三个玩家都准备，调用了start,并上链
        --2 链下状态，待确定
        --已经有table
        ge.SetHand(hand)
        if status == SeatStatusType.NEXTSTANDBY then
            status = SeatStatusType.PLAYING
            local tx = rCtr.tc.Transact("standup", false)
            if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
                log.Error("Network", "disconnected")
                return NetworkError
            end
        end
        self.RecoverData.SeatStatus = status
        rcv:recoverSeats(selfaddr, tbid)
        self:execRecover(selfaddr, tbid, seat, status, hand, true)
        local RDstr = json.encode(self.RecoverData)
        log.Debug("handleRecover RecoverData", RDstr)
        return
    end
end

function game_texas:syncGameReplays(tbid)
    local tableInfo = rCtr:GetTableInfoEx(tbid)
    log.Info("syncGameReplays, tbid", tbid, "currentStatus", tableInfo.CurrentStatus)
    if tableInfo.CurrentStatus == 2 then
        self.hand = tableInfo.CurrentHand
        self.dealerPos = tableInfo.DealerPos
        ge.SetHand(tableInfo.CurrentHand)
        local emptydata = byteSlice:new()
        ge.Send({255}, SyncGameReplaysMsgCode, emptydata)
        self.waitingGameReplays = true
        if self.record ~= nil then
            self.lastrecordlen = self.record:getLength()
        end
        self.record = gamerecord.new(gt.dealerPos)
    end
end

function game_texas:GetBlindInfo()
    local blindinfo = {}
    --前注
    self:AnteBet()
    blindinfo.Hand = self.hand
    blindinfo.TotalAnteBet = 0
    for i, v in ipairs(self.seats) do
        if v.status == SeatStatusType.PLAYING then
            blindinfo.TotalAnteBet = blindinfo.TotalAnteBet + v.anteBet
        end
    end

    blindinfo.SmallBlind = self.smallBlindPos
    blindinfo.BigBlind = self.bigBlindPos
    blindinfo.Dealer = self.dealerPos
    blindinfo.SmallBlindBet = self.smallBlindBet

    if gt.straddleFlag == true then
        blindinfo.Straddle = self.straddlepos
    end

    log.Trace("straddleFlag", self.straddleFlag, "straddlepos", self.straddlepos)
    -- local bstr = json.encode(blindinfo)
    -- print("BlindInfo json str", bsdstr)
    return blindinfo
end

gt = game_texas.new()

ge.setCallback(ShuffleCardResult, DealCardResult, HandleMsg, HandleAck, HandleReSitDown)

return gt
