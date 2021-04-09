local eth = require("eth")
local tx = require("texas")
local json = require("json")
local ge = require("gameengine")
local rlp = require("rlp")
local log = require("log")

require ("abi")

--合约定义Join=1
local GameEventTypes = CreateEnumTable({"Join", "AddChips", "Start", "Settle", "NotarySettle", "LeaveNext", "CreateTable", "ChangeSeat", "LeaveTable", "notaryDiscard", "DismissTable", "SelectInter", "SubmitPoint", "WithdrawChips", "FinishNotary", "SelectNotary", "GameStart", "newApprove", "insure", "RmtInsTimeout", "StandUp", "End"}, 0)

local GameEventNames = {"Join", "AddChips", "Start", "Settle", "NotarySettle", "LeaveNext", "CreateTable", "ChangeSeat", "LeaveTable", "notaryDiscard", "DismissTable", "SelectInter", "SubmitPoint", "WithdrawChips", "FinishNotary", "SelectNotary", "GameStart", "newApprove", "insure", "RmtInsTimeout", "StandUp", "End"}

local GameEventHandlers = {}

local SeatStatusType = CreateEnumTable({"NOTJOIN", "NOTSEATED", "SITTING", "SEATED", "PREADY", "READY", "PLAYING", "DISCARD", "NEXTLEAVE", "OFFLINE", "SHOWDOWNOFFLINE", "NEXTSTANDBY"},-1)

room_contract = class()

local emptyAddr = "0x0000000000000000000000000000000000000000"
local insuranceAddr = "0x0000000000000000000000000000000000000001"

function room_contract:ctor()
    log.Trace("room_contract", "ctor", "RoomManagerAddr", RoomManagerAddr, "btAddr", btAddr, "promotAddr", promotAddr, "clubAddr", clubAddr)
    self.tables = {}
    self.curTable = -1
    self.selfaddr = ge.SelfAddr()  --当前玩家账号地址
    self.tc = eth.contract(RoomManagerABI, RoomManagerAddr)
    self.btcContract = eth.contract(BitcoinTokenABI, btAddr)
    self.promotContract = eth.contract(PromotABI, promotAddr)
    self.clubContract = eth.contract(ClubABI, clubAddr)
    self.LeaveNextId = {}
    self.StandupNext = false

    --与合约交互用的订阅数据
    self.GameEventSub = nil
    self.CreateTableSub = nil
    self.giveMeTokeSub = nil
    self.NewClubSub = nil
    self.JoinClubSub = nil
    self.MyJoinClubSub = nil
    self.GameRequestSub = nil
    self.MakeupGameEventSub = nil
    self.WatchParamsMap = {}
end

rCtr = room_contract:new()

function newAddress(str)--要求40个字节，所以不能带0x
    if string.sub(str, 1, 2) == "0x" then
        str = string.sub(str, 3, string.len(str))
    end
    return address.new(str) --调用luatype里的address
end

function room_contract:setCurTable(tableId)
    log.Info("setCurTable, tableId", tableId)
    self.curTable = tableId
end

function room_contract:subscribeGameEvent(params)
    local t = json.decode(params)
    log.Info("subscribeGameEvent, t.TableId", t.TableId)
    self:watchGameEvent(t.TableId)
    return "OK"
end

function room_contract:watchGameEvent(tableid)
    log.Info("watchGameEvent, tableid", tableid, "self.GameEventSub", self.GameEventSub)
    if self.GameEventSub == nil then
        local index1 = {}
        for i = 1, GameEventTypes.End - 1 do
            table.insert(index1, i)
        end
        log.Trace("watchGameEvent, index1", index1)
        local index2 = {}
        table.insert(index2, tableid)
        self.GameEventSub = self.tc.WatchLog("gameEvent", gameEventHandler, index1, index2)
        log.Info("watchGameEvent2 self.GameEventSub", self.GameEventSub)
    end
end

function room_contract:unsubscribeGameEvent()
    log.Trace("unsubscribeGameEvent(), self.GameEventSub", self.GameEventSub)
    if self.GameEventSub ~= nil then
        self.tc.CancelWatchLog(self.GameEventSub)
        self.GameEventSub = nil
    end

    if self.MakeupGameEventSub ~= nil then
        self.tc.CancelWatchLog(self.MakeupGameEventSub)
        self.MakeupGameEventSub = nil
    end
    return "OK"
end

function room_contract:reSubscribeGameEvent(params)
    self:unsubscribeGameEvent()
    self:subscribeGameEvent(params)
    return "OK"
end

function room_contract:reSubscribeClubEvent()
    log.Trace("reSubscribeClubEvent self.WatchParamsMap", self.WatchParamsMap)
    if self.NewClubSub ~= nil then
        local index = {}
        table.insert(index, self.selfaddr)
        self.NewClubSub = self.clubContract.WatchLog("NewClub", newClubHandler, index)
    end
    if self.MyJoinClubSub ~= nil then
        self:listenMyJoinClub()
    end
    if self.JoinClubSub ~= nil and self.WatchParamsMap.JoinClub ~= nil then
        self:joinClubIDs(self.WatchParamsMap.JoinClub)
    end
    if self.GameRequestSub ~= nil and self.WatchParamsMap.newApprove ~= nil then
        self:gameRequest(self.WatchParamsMap.newApprove)
    end
    return "OK"
end

--获取房间Inter列表
function RoomInter()
    local inters = {}
    local interaddrs = rCtr.tc.Call("getTableInters", rCtr.curTable)
    if nil == interaddrs then
        log.Error("Network", "disconnected")
        return inters
    end

    log.Trace("interaddrs", #interaddrs)
       
    for i = 1, #interaddrs do
        log.Trace(tostring(i), interaddrs[i])
        
        local addr, nd, x1, x2, x3 = rCtr.tc.Call("getInterInfo", tostring(interaddrs[i]))
        if nil == addr then
            log.Error("Network", "disconnected")
            return inters
        end
        log.Trace("getInterInfo, addr", addr, "node", nd, "x1", x1:String(), "x2", x2:String(), "x3", x3:String())
        table.insert(inters, addr.."&"..nd)
    end
    
    return inters
end

function buildTable(id, creatorAddr, currentHand, st, startPlayer, smallBlindPos, dealerPos, min, max, bmin, bmax, sb, sa, at, pn, tableProps, gameLength, lefttime, endtime, insuranceOdds)
    for i = 1, #insuranceOdds do
        insuranceOdds[i] = insuranceOdds[i] / 100
    end
    local ti = {
        ["TableId"] = id,
        ["CreatorAddr"] = creatorAddr,
        ["CurrentHand"] = currentHand,
        ["CurrentStatus"] = st,
        ["StartPlayer"] = startPlayer,
        ["SmallBlindPos"] = smallBlindPos,
        ["DealerPos"] = dealerPos,
        ["MinNum"] = min,
        ["MaxNum"] = max,
        ["BuyinMin"] = bmin,
        ["BuyinMax"] = bmax,
        ["SmallBlind"] = sb,
        ["Straddle"] = sa,
        ["Ante"] = at,
        ["PlayerNum"] = pn,
        ["TableProps"] = tableProps,
        ["GameLength"] = gameLength,
        ["LeftTime"] = lefttime,
        ["EndTime"] = endtime,
        ["InsuranceOdds"] = insuranceOdds,
    }
    return ti
end

function room_contract:listFreeTable(params)--不能是local函数
    log.Trace("listFreeTable()", params)
    local tables = {}
    
    local maxTestTableId = self.tc.Call("testTableid")
    local maxSysTableId = self.tc.Call("sysTableid")
    if nil == maxTestTableId or nil == maxSysTableId then
        log.Error("Network", "disconnected")
        return NetworkError
    end

    log.Trace("maxTestTableId", "[" .. 0xf000000000001 .. ", " .. maxTestTableId .. "]", "maxSysTableId", "[" .. 0xe000000000001 .. ", " .. maxSysTableId .. "]")
    for i = 0xf000000000001, maxTestTableId do
        local ti = self:GetTableInfoEx(i)
        if ti.TableId ~= 0 then
            table.insert(tables, ti)
        end
    end

    for i = 0xe000000000001, maxSysTableId do
        local ti = self:GetTableInfoEx(i)
        if ti.TableId ~= 0 then
            table.insert(tables, ti)
        end
    end

    self.tables = tables
    return tables
end

function room_contract:listTable(params)--不能是local函数
    log.Trace("listTable()", params)
    local tables = {}
    local t = json.decode(params)

    local l, tableids = self.tc.Call("getTableList", t.pagenum,t.pagesize)
    if nil == l then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    for i = 1, #tableids do
        local ti = self:GetTableInfoEx(tableids[i])
        if ti.TableId ~= 0 then
            table.insert(tables, ti)
        end
    end

    self.tables = tables
    return tables
end

function room_contract:listClubTable(params)
    log.Trace("listClubTable()", params)
    local tables = {}
    local t = json.decode(params)

    local maxClubTableId = self.tc.Call("getMaxTableid", t.ClubID)
    if nil == maxClubTableId then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    log.Trace("firstTableID", 0x10000000 * t.ClubID + 1, "maxClubTableId", maxClubTableId)
    for i = maxClubTableId, 0x10000000 * t.ClubID + 1, -1 do
        local ti = self:GetTableInfoEx(i)
        if ti.TableId ~= 0 and ti.LeftTime > 0 then
            table.insert(tables, ti)
        end
    end
    self.tables = tables
    return tables
end

function room_contract:seatInfo(params)--不能是local函数
    log.Trace("seatinfo()", params)
    local seats = {}
    local t = json.decode(params)
    local tbNum, currentHand, currentStatus, startPlayer, smallBlindPos, delerPos, minNum, maxNum, buyinMin, buyinMax, smallBlind, straddle, ante = self.tc.Call("getTableInfo", t.TableId)
    local data = rCtr.tc.Call("getTableSeatInfos", t.TableId)

    --Call失败了（含重试）返回空结构，不然界面会收到jsonxxx
    if nil == tbNum or nil == data then
        log.Error("Network", "disconnected")
        return NetworkError
    end

    local seatInfos = {}
    for i = 1, maxNum do
        local item = {}
        table.insert(item, "")  --账号地址
        table.insert(item, 0)   --tableid
        table.insert(item, 0)   --pos
        table.insert(item, 0)   --amount
        table.insert(item, 0)   --playstatus
        table.insert(item, 0)   --hand
        table.insert(seatInfos, item)
    end
    local seatInfos, err = rlp.Decode(data, seatInfos)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("seatInfo", json.encode(seatInfos))

    for i = 1, #seatInfos do
        local addr = bin2string(seatInfos[i][1])
        log.Trace("getTableSeatInfos, addr", addr, "tbm", seatInfos[i][2], "seatNum", seatInfos[i][3], "amount", seatInfos[i][4], "status", SeatStatusTypeStr[seatInfos[i][5]], "hand", seatInfos[i][6])
        local v = bigInt:new()
        local amount = v:SetUint64(seatInfos[i][4])
        local ti = {
            ["PlayerAddr"] = addr,
            ["Pos"] = seatInfos[i][3],
            ["Amount"] = amount:String(),
            ["Status"] = seatInfos[i][5],
            ["Hand"] = seatInfos[i][6],
        }
        table.insert(seats, ti)
    end
    return seats
end

function gameEventHandler(eventtype, tableid, addr, hand, rlpdata)
    if eventtype >= GameEventTypes.Join and eventtype <= GameEventTypes.End then
        log.Trace("gameEventHandler(), eventName", GameEventNames[eventtype], "eventType", eventtype, "tableid", tableid, "addr", addr, "hand", hand)
        if GameEventHandlers[eventtype] ~= nil then
            GameEventHandlers[eventtype](tableid, addr, hand, rlpdata)
        else
            log.Warn("gameEventHandler(), empty handler for event", GameEventNames[eventtype])
        end
    else
        log.Warn("gameEventHandler(), unknown eventtype", eventtype, "tableid", tableid, "addr", addr, "hand", hand)
    end
end

function joinHandler(tableid, addr, hand, rlpdata)
    local joinStruct = {}
    table.insert(joinStruct, 0) --pos
    table.insert(joinStruct, 0) --amount
    table.insert(joinStruct, "") --errstr
    local joinStruct, err = rlp.Decode(rlpdata, joinStruct)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("joinHandler", json.encode(joinStruct))
    local pos = joinStruct[1]
    local v = bigInt:new()
    local amount = v:SetUint64(joinStruct[2])
    local errstr = joinStruct[3]
    log.Trace("joinHandler(), curTable", rCtr.curTable, "selfAddr", rCtr.selfaddr, "tableid", tableid, "addr", addr, "pos", pos, "amount", amount:String(), "errstr", errstr)
    if tableid == rCtr.curTable then
        if errstr ~= "" then
            --加入table失败
            log.Error("join fail", errstr)
            local t = {
                ["Tableid"] = tableid,
                ["Addr"] = addr,
                ["Pos"] = pos,
                ["Amount"] = amount:String(),
                ["Errstr"] = errstr,
            }

            ge.NotifyUI("Join", t)
            return
        end

        local interlist = {}
        local err = nil
        if addr == rCtr.selfaddr then
            --加入table的节点要需要监听事件
            log.Info("tableid", tableid)

            local players = rCtr:playersinfo(tableid)
            local playerNum = #players
            if playerNum == 0 then   --收到joinhandler再去call合约，中途可能有leave发给合约导致已离开
                log.Warn("joinHandler() player leaved halfway tableid",tableid)
                return
            end
            for i = 1, #players do
                if players[i].PlayerAddr == rCtr.selfaddr then
                    rCtr:setCurTable(tableid)
                    interlist = RoomInter()
                    err = gt:join(players[i].Pos, players[i].Amount, tableid, players[i].PlayerAddr, interlist, true, true)
                    if err ~= nil and (string.find(err, "already in desk")~=1 or  players[i].Status ~= SeatStatusType.PLAYING)then
                        local t = {
                            ["Tableid"] = tableid,
                            ["Addr"] = addr,
                            ["Pos"] = pos,
                            ["Amount"] = amount:String(),
                            ["Errstr"] = err,
                        }

                        ge.NotifyUI("Join", t)
                        rCtr:leaveTable() --inter坐下失败通知合约离桌
                        return
                    end
                    local tableInfoEx = rCtr:GetTableInfoEx(tableid)
                    log.Info("joinHandler playerNum", playerNum)
                    log.Info("joinHandler MinNum", tableInfoEx.MinNum)
                    if playerNum < tableInfoEx.MinNum then
                        local tipsInfo = {}
                        tipsInfo["Content"] = "Please wait until "..tableInfoEx.MinNum.." players join the table"
                        tipsInfo["bFadeout"] = true
                        ge.NotifyUI("GameTips", tipsInfo)
                    end
                else
                    err = gt:join(players[i].Pos, players[i].Amount, tableid, players[i].PlayerAddr, interlist, false, true)
                    if err ~= nil and string.find(err, "already in desk")==1 then
                        err = ""
                    end
                end
            end

            --创建成功后监听进入桌子事件，不用再调jointable，合约自己处理了，只要监听就可以了
            --测试
            --rCtr:ready() 

            --
            --gt:syncGameReplays(tableid)
        else
            --调用Sit
            err = gt:join(pos, amount, tableid, addr, interlist, false, true)
            if err ~= nil and string.find(err, "already in desk")==1 then
                err = ""
            end
        end

        log.Trace("before remove(rCtr.LeaveNextId)", json.encode(rCtr.LeaveNextId))
        for i, v in ipairs(rCtr.LeaveNextId) do
            if v.Pos == pos and v.Tableid == tableid then
                table.remove(rCtr.LeaveNextId, i)
            end
        end
        log.Trace("after remove(rCtr.LeaveNextId)", json.encode(rCtr.LeaveNextId))

        local t = {
            ["Tableid"] = tableid,
            ["Addr"] = addr,
            ["Pos"] = pos,
            ["Amount"] = amount:String(),
            ["Errstr"] = err or "",
        }
        ge.NotifyUI("Join", t)
    end
end

function room_contract:selfPlayingStatus()
    local addr, tableid, seatNum, amount, status, hand = rCtr.tc.Call("getPlayerInfo", self.selfaddr)
    if addr == nil then
        log.Error("Network", "disconnected")
        return nil
    end
    log.Trace("selfPlayingStatus, addr", addr, "tableid", tableid, "seatNum", seatNum, "amount", amount:String(), "status", SeatStatusTypeStr[status], "hand", hand)
    return addr, tableid, seatNum, status, hand
end

function room_contract:joinTable(params)
    local t = json.decode(params)
    log.Trace("joinTable(), type(self.tables)", type(self.tables), "type(self.tables[t.TableId])", type(self.tables[t.TableId]), "#self.tables", #self.tables, "t.TableId", t.TableId, "t.NeedChips", t.NeedChips, "t.Pos", t.Pos)

    log.Info("t.TableId", t.TableId)

    self:setCurTable(t.TableId)
    local tipsInfo = {}
    tipsInfo["Content"] = "Communicating With The Chain..."
    ge.NotifyUI("Tips", tipsInfo)
    local tx = self.tc.Transact("joinTable", t.TableId, t.NeedChips, t.Pos)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function room_contract:checkLeave(params)
    log.Trace("checkLeave, selfaddr", self.selfaddr)
    local ret = self.tc.Call("check_leaveTable", self.selfaddr)
    log.Trace("checkLeave return",ret)
    local t = {
        ["canLeave"] = ret,
    }
    return t
end

function room_contract:leaveTable(params)
    local tableId = self.curTable
    if params ~= nil then
        local t = json.decode(params)
        log.Trace("leaveTable tableId", tableId)
        tableId = t.TableId
    end
    log.Trace("leaveTable tableId", tableId)
    gt:leave(gt.myseat, true)
    local tx = self.tc.Transact("leaveTable",tableId)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function leaveNextHandler(tableid, addr, hand, rlpdata)
    local leaveNextStruct = {}
    table.insert(leaveNextStruct, 0) --pos
    table.insert(leaveNextStruct, "") --errstr
    local leaveNextStruct, err = rlp.Decode(rlpdata, leaveNextStruct)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    local pos = leaveNextStruct[1]
    local errstr = leaveNextStruct[2]
    log.Trace("leaveNextHandler() tableid", tableid, "rCtr.curTable", rCtr.curTable, "addr", addr, "hand", hand, "pos", pos, "err", err)
    if tableid == rCtr.curTable then
        if errstr ~= "" then
            log.Error("leaveNextHandler() err", errstr, "tableid", tableid, "addr", addr, "pos", pos)
            local t = {}
            t["Tableid"] = tableid
            t["Addr"] = addr
            t["Hand"] = hand
            t["Pos"] = pos
            t["Errstr"] = errstr
            ge.NotifyUI("LeaveNext", t)
            return
        end

        local lnid = {
            ["Tableid"] = tableid,
            ["Hand"] = hand,
            ["Pos"] = pos,
        }
        log.Trace("before insert(rCtr.LeaveNextId)", json.encode(rCtr.LeaveNextId))
        table.insert(rCtr.LeaveNextId, lnid)
        log.Trace("before insert(rCtr.LeaveNextId)", json.encode(rCtr.LeaveNextId))
        local t = {}
        t["Tableid"] = tableid
        t["Addr"] = addr
        t["Pos"] = pos
        t["Hand"] = hand
        t["Errstr"] = ""
        ge.NotifyUI("LeaveNext", t)
    end
end

function room_contract:leaveTableNext(params)
    local tbNum, currentHand, currentStatus, startPlayer, smallBlindPos, delerPos, minNum, maxNum, buyinMin, buyinMax, smallBlind, straddle, ante = self.tc.Call("getTableInfo", self.curTable)
    if nil == tbNum then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    local tx = self.tc.Transact("leaveNext", self.curTable, currentHand)--不需要参数
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function room_contract:ready(params)
    local tbNum, currentHand, currentStatus, startPlayer, smallBlindPos, delerPos, minNum, maxNum, buyinMin, buyinMax, smallBlind, straddle, ante = self.tc.Call("getTableInfo", self.curTable)
    if nil == tbNum then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    log.Trace("room_contract:ready() hand", currentHand, "tableid", self.curTable, "status", SeatStatusTypeStr[currentStatus])
    local tx = self.tc.Transact("start", self.curTable, currentHand)--不需要参数
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function leaveTableHandler(tableid, addr, hand, rlpdata, resitdownFlag)
    log.Trace("leaveTableHandler, type(rlpdata)", type(rlpdata))
    local leaveTableStruct = {}
    table.insert(leaveTableStruct, 0)
    table.insert(leaveTableStruct, "") --errstr
    local leaveTableStruct, err = rlp.Decode(rlpdata, leaveTableStruct)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("leaveTableHandler", json.encode(leaveTableStruct))
    local pos = leaveTableStruct[1]
    local errstr = leaveTableStruct[2]
    log.Trace("leaveTableHandler() tableid", tableid, "rCtr.curTable", rCtr.curTable, "addr", addr, "pos", pos,
            "rCtr.selfaddr", rCtr.selfaddr,"errstr",errstr)
    if addr == rCtr.selfaddr and errstr == "not_in_table" then
        pos = gt:getPlayerSeat(addr)
        errstr = ""
    end
    if errstr ~= "" then
        log.Error("leaveTableHandler() err", errstr, "tableid", tableid, "addr", addr, "pos", pos)

        local t = {}
        t["Tableid"] = tableid
        t["Addr"] = addr
        t["Pos"] = pos
        t["Errstr"] = errstr
        ge.NotifyUI("Leave", t)
        return
    end

    if tableid == rCtr.curTable then
        -- 先清理牌局
        log.Debug("leaveTableHandler()", tableid == rCtr.curTable, "resitdownFlag", resitdownFlag)
        if resitdownFlag == true then
            local oldTbid = gt.tableid
            local tbNum, currentHand, currentStatus, startPlayer, smallBlindPos, dealerPos, minNum, maxNum,buyinMin, buyinMax,smallBlind, straddle, ante = gt.roomManagercontract.Call("getTableInfo", oldTbid)
            if nil == data then
                log.Error("Network", "disconnected")
            end
            local oldHand = gt.hand
            log.Debug("leaveTableHandler ClearGame currentStatus", currentStatus, "oldHand", oldHand,"currentHand", currentHand)
            if (currentStatus == 0 and oldHand ~= 0) or (currentStatus == 2 and oldHand ~= currentHand) then --游戏结束或正在进行下一局，即错过了当局的公证结算
                local clearInfo = {}
                clearInfo["Pos"] = pos
                ge.NotifyUI("ClearGame", clearInfo);
            end
        else
            local clearInfo = {}
            clearInfo["Pos"] = pos
            ge.NotifyUI("ClearGame", clearInfo);
        end

        if addr == rCtr.selfaddr then
            log.Debug("leaveTableHandler init self.LeaveNextId addr", addr)
            rCtr.LeaveNextId = {}
        end

        local t = {}
        t["Tableid"] = tableid
        t["Addr"] = addr
        t["Pos"] = pos
        t["Errstr"] = ""
        gt:leave(pos, addr == rCtr.selfaddr)
        ge.NotifyUI("Leave", t)
        if addr == rCtr.selfaddr then
            rCtr:unsubscribeCreateTable()
        else
            local Players = rCtr.tc.Call("getTablePlayers", tableid)
            local tableInfoEx = rCtr:GetTableInfoEx(tableid)
            log.Info("leaveTableHandler MinNum", tableInfoEx.MinNum)
            if Players ~= nil and tableInfoEx.MinNum > 0 then
                local playerNum = #Players
                if playerNum < tableInfoEx.MinNum then
                    local _, _, _, status, _ = rCtr:selfPlayingStatus()
                    log.Info("leaveTableHandler status", SeatStatusTypeStr[status], "SeatStatusType.SITTING", SeatStatusType.SITTING)
                    if status >= SeatStatusType.SITTING then
                        local tipsInfo = {}
                        tipsInfo["Content"] = "Please wait until "..tableInfoEx.MinNum.." players join the table"
                        tipsInfo["bFadeout"] = true
                        ge.NotifyUI("GameTips", tipsInfo)
                    end
                end
            end
        end
    end
end

function notaryDiscardHandler(tableid, addr, hand, rlpdata)
    log.Trace("notaryDiscardHandler() rCtr.curTable", rCtr.curTable, "addr", addr, "hand", hand)
    for j, v in ipairs(gt.seats) do
        if v.ad == addr then
            ge.SetNotaryDiscard(v.id, true) --停止本客户端往掉线的客户端重发消息
            break
        end
    end
end

function room_contract:watchCreateTable()
    log.Info("watchCreateTable, self.CreateTableSub", self.CreateTableSub)
    if self.CreateTableSub == nil then
        local index1 = {}
        table.insert(index1, GameEventTypes.CreateTable)
        log.Trace("watchCreateTable, index1", index1)
        local index3 = {}
        table.insert(index3, self.selfaddr)
        self.CreateTableSub = self.tc.WatchLog("gameEvent", gameEventHandler, index1, nil, index3)
    end
end

function startHandler(tableid, addr, hand, rlpdata)
    local selfaddr, tbid, seat, status, hand = rCtr:selfPlayingStatus()
    local startStruct = {}
    table.insert(startStruct, 0) --pos
    table.insert(startStruct, "") --errstr
    local startStruct, err = rlp.Decode(rlpdata, startStruct)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("startHandler", json.encode(startStruct))
    local pos = startStruct[1]
    local errstr = startStruct[2]
    if tableid == rCtr.curTable then
        log.Trace("startHandler() tableid", tableid, "pos", pos, "addr", addr, "pos", pos, "hand", hand, "error", errstr)
        if addr == rCtr.selfaddr and errstr ~= "" and status >= SeatStatusType.PREADY then  --合约那边start有个前置条件为status=3，如果status为6再发start会返回error player status，这里忽略掉
            local t = {}
            t["Tableid"] = rCtr.curTable
            t["Addr"] = addr
            t["Pos"] = pos
            t["Errstr"] = ""
            ge.NotifyUI("Start", t)--只需要通知即可
        else
            local t = {}
            t["Tableid"] = rCtr.curTable
            t["Addr"] = addr
            t["Pos"] = pos
            t["Errstr"] = errstr
            ge.NotifyUI("Start", t)--只需要通知即可
        end
    end 
end

-- 获取单个玩家信息
function room_contract:GetPlayerInfo(params)
    log.Trace("GetPlayerInfo", params)
    local t = json.decode(params)
    local addr, tableid, seatNum, amount, status, hand = rCtr.tc.Call("getPlayerInfo", t.Addr)
    log.Trace("GetPlayerInfo, addr", addr, "tableid", tableid, "seatNum", seatNum, "amount", amount:String(), "status", SeatStatusTypeStr[status], "hand", hand)
    local info = {
        ["PlayerAddr"] = addr,
        ["TableID"] = tableid,
        ["Pos"] = seatNum,
        ["Status"] = status,
        ["Hand"] = hand,
    }
    return info
end

function room_contract:GetPlayersInfo(params)
    local tableId = rCtr.curTable
    if params ~= nil then
        local t = json.decode(params)
        if t.TableId ~= nil then
            tableId = t.TableId
        end
    end
    local players = {}
    local Players = rCtr.tc.Call("getTablePlayers", tableId)
    local data = rCtr.tc.Call("getPlayerInfos", tableId)
    local playerInfos = {}
    if nil == Players or nil == data then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    log.Trace("Players", Players)
    for i = 1, #Players do
        local item = {}
        table.insert(item, "")  --账号地址
        table.insert(item, 0)   --tableid
        table.insert(item, 0)   --pos
        table.insert(item, 0)   --amount
        table.insert(item, 0)   --playstatus
        table.insert(item, 0)   --hand
        table.insert(playerInfos, item)
    end
    local playerInfos, err = rlp.Decode(data, playerInfos)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("GetPlayersInfo", json.encode(playerInfos))
    for i = 1, #playerInfos do
        local addr = bin2string(playerInfos[i][1])
        log.Trace("getPlayerInfos, addr", addr, "tbm", playerInfos[i][2], "seatNum", playerInfos[i][3], "amount", playerInfos[i][4], "status", SeatStatusTypeStr[playerInfos[i][5]], "hand", playerInfos[i][6])
        local v = bigInt:new()
        local amount = v:SetUint64(playerInfos[i][4])
        local ti = {
            ["PlayerAddr"] = addr,
            ["Pos"] = playerInfos[i][3],
            ["Amount"] = amount:String(),
            ["Status"] = playerInfos[i][5],
            ["Hand"] = playerInfos[i][6],
        }
        table.insert(players, ti)
    end
    return players
end

--内部使用
function room_contract:playersinfo(params)
    local players = {}
    local Players = rCtr.tc.Call("getTablePlayers", rCtr.curTable)
    local data = rCtr.tc.Call("getPlayerInfos", rCtr.curTable)
    log.Trace("playersinfo getTablePlayers Players",Players)
    log.Trace("playersinfo getPlayerInfos data",data)
    if nil == Players or nil == data then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    local playerInfos = {}
    for i = 1, #Players do
        local item = {}
        table.insert(item, "")  --账号地址
        table.insert(item, 0)   --tableid
        table.insert(item, 0)   --pos
        table.insert(item, 0)   --amount
        table.insert(item, 0)   --playstatus
        table.insert(item, 0)   --hand
        table.insert(playerInfos, item)
    end
    local playerInfos, err = rlp.Decode(data, playerInfos)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("playersinfo", json.encode(playerInfos))
    for i = 1, #playerInfos do
        local addr = bin2string(playerInfos[i][1])
        log.Trace("getPlayerInfos, addr", addr, "tbm", playerInfos[i][2], "seatNum", playerInfos[i][3], "amount", playerInfos[i][4], "status", SeatStatusTypeStr[playerInfos[i][5]], "hand", playerInfos[i][6])
        local v = bigInt:new()
        local amount = v:SetUint64(playerInfos[i][4])
        local ti = {
            ["PlayerAddr"] = addr,
            ["Pos"] = playerInfos[i][3],
            ["Amount"] = amount,
            ["Status"] = playerInfos[i][5],
            ["Hand"] = playerInfos[i][6],
        }
        table.insert(players, ti)
    end
    return players
end

function room_contract:tableinfo(players)
    local tbNum, currentHand, currentStatus, startPlayer, smallBlindPos, delerPos, minNum, maxNum, buyinMin, buyinMax, smallBlind, straddle, ante = rCtr.tc.Call("getTableInfo", rCtr.curTable)
    local bigblindPos = -1
    local realsmallPos = -1
    log.Trace("tableinfo, type(players)", type(players), "tbNum", tbNum, "currentHand", currentHand, "currentStatus", currentStatus, "startPlayer", startPlayer, "smallBlindPos", smallBlindPos, "delerPos", delerPos, "minNum", minNum, "maxNum", maxNum, "buyinMin", buyinMin:String(), "buyinMax", buyinMax:String(), "smallBlind", smallBlind:String(), "straddle", straddle, "ante", ante:String())
    for i, v in ipairs(players) do
        if v.PlayerAddr == startPlayer then
            bigblindPos = v.Pos
        end

        log.Trace("tableinfo() v.Pos", v.Pos, ", v.Status", v.Status)
        if v.Status == SeatStatusType.NEXTSTANDBY then
            v.Status = SeatStatusType.PLAYING
        end
        if v.Pos == smallBlindPos and v.Status >= SeatStatusType.PLAYING then
            realsmallPos = smallBlindPos
        end
    end

    local tableInfo = {
        ["TableID"] = rCtr.curTable,
        ["Minimum"] = minNum,
        ["Maximum"] = maxNum,
        ["NeedChips"] = buyinMin:Uint64(),
        ["SmallBlind"] = smallBlind:Uint64(),
        ["Ante"] = ante:Uint64(),
        ["Straddle"] = straddle,
        ["CurrentStatus"] = currentStatus,
        ["SmallBlindPos"] = realsmallPos,
        ["BigBlindPos"] = bigblindPos,
        ["DealerPos"] = delerPos,
    }
    return tableInfo, currentHand, bigblindPos
end

function settleHandler(tableid, addr, hand, rlpdata)
    local playerNum = 0
    local playerNum, err = rlp.Decode(rlpdata, playerNum)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("settleHandler() rCtr.curTable", rCtr.curTable, "hand", hand, "playerNum", playerNum, "tableid", tableid)
    if rCtr.curTable == tableid then
        log.Trace("GameReset=========>", "")
        gt:GameReset(false)

        local t = {}
        t["Hand"] = hand
        t["PlayingNum"] = playerNum
        t["Tableid"] = tableid
        ge.NotifyUI("Settle", t)
    end
end

function gameStartHandler(tableid, addr, hand, rlpdata)
    local gameStartStruct = {}
    table.insert(gameStartStruct, 0) --seatNum,大盲座位号
    table.insert(gameStartStruct, 0) --smallBlindPos
    table.insert(gameStartStruct, 0) --dealerPos
    local gameStartStruct, err = rlp.Decode(rlpdata, gameStartStruct)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("gameStartHandler", json.encode(gameStartStruct))
    local starter = gameStartStruct[1]
    local smallBlindPos = gameStartStruct[2]
    local dealerPos = gameStartStruct[3]
    log.Trace("gameStartHandler() rCtr.curTable", rCtr.curTable, "addr", addr, "hand", hand, "starter", starter, "smallBlindPos", smallBlindPos, "dealerPos", dealerPos)
    if rCtr.curTable == tableid then
        local t = {}
        t["Tableid"] = tableid
        t["Player"] = addr
        t["Pos"] = pos
        t["Hand"] = hand
        t["Errstr"] = ""
        ge.NotifyUI("StartGame", t)

        local players = rCtr:playersinfo()
        log.Trace("type(players)", type(players), "rCtr.LeaveNextId", json.encode(rCtr.LeaveNextId))
        local tbInfo, currentHand, pos = rCtr:tableinfo(players)

        local bExist = false --可能未收到坐下成功事件，就已经收到游戏开始的事件
        for i, v in ipairs(players) do
            log.Trace("v.PlayerAddr", v.PlayerAddr)
            if v.PlayerAddr == rCtr.selfaddr then
                bExist = true
                break
            end
        end
        log.Debug("bExist", bExist, "rCtr.selfaddr", rCtr.selfaddr)
        if not bExist then
            return
        end

        gt:startGame(tbInfo, players, rCtr.LeaveNextId, hand, rCtr.selfaddr)

        log.Trace("before remove(rCtr.LeaveNextId)", json.encode(rCtr.LeaveNextId))
        for i, v in ipairs(rCtr.LeaveNextId) do
            if v.Hand ~= hand or v.Tableid ~= self.tableid then
                table.remove(rCtr.LeaveNextId, i)
            end
        end
        log.Trace("after remove(rCtr.LeaveNextId)", json.encode(rCtr.LeaveNextId))
    end
end

function room_contract:createTable(params)
    self:watchCreateTable()
    local t = json.decode(params)
    local odds = {}
    for i = 1, 14 do
        table.insert(odds, 0)
    end
    for i = 1, #t.InsuranceOdds do
        t.InsuranceOdds[i] = math.ceil(t.InsuranceOdds[i] * 100)
    end
    local rlpdata, err = rlp.Encode(t.InsuranceOdds)
    log.Trace("createTable", json.encode(t.InsuranceOdds) .. " rlpencode " .. rlpdata:toHexString())
    if err ~= nil then
        error("RlpEncode err: " .. err)
    end
    local tx = self.tc.Transact("createTable", t.ClubID, t.Minimum, t.Maximum, t.BuyinMin, t.BuyinMax, t.SmallBlind, t.Straddle, t.Ante, t.TableProps, t.GameLength, rlpdata)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx

    -- local fn = function()
    --     local receipt = self.tc.GetTransactionReceipt(tx)
    --     print("receipt = ", receipt, receipt.status)
    -- end

    -- timer.afterFunc(fn, 1000*6)
end

function addChipsHandler(tableid, addr, hand, rlpdata)
    local addChipsStruct = {}
    table.insert(addChipsStruct, 0) --amount
    table.insert(addChipsStruct, "") --errstr
    local addChipsStruct, err = rlp.Decode(rlpdata, addChipsStruct)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("addChipsHandler", json.encode(addChipsStruct))
    local v = bigInt:new()
    local amount = v:SetUint64(addChipsStruct[1])
    local errstr = addChipsStruct[2]
    log.Trace("addChipsHandler, addr", addr, "rCtr.selfaddr", rCtr.selfaddr, "amount", amount:String(), "errstr", errstr)
    if addr == rCtr.selfaddr and amount:Uint64() == 0 then
        log.Error("addChipsHandler error, addr", addr, "amount", amount:String())
        local resultinfo = {
            ["Address"] = addr,
            ["Amount"] = amount:String(),
            ["Errstr"] = "addchip unsuccess",
        }
        ge.NotifyUI("AddChips", resultinfo)
        return
    end

    log.Debug("addChipsHandler success, addr", addr, "amount", amount:String())
    local resultinfo = {
        ["Address"] = addr,
        ["Amount"] = amount:String(),
        ["Errstr"] = "",
    }
    ge.NotifyUI("AddChips", resultinfo)
end

function room_contract:addChips(params)
    local t = json.decode(params)
    local tx = self.tc.Transact("addChips", t.Chips)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function withdrawChipsHandler(tableid, addr, hand, rlpdata)
    local withdrawChipsStruct = {}
    table.insert(withdrawChipsStruct, 0) --amount
    table.insert(withdrawChipsStruct, "")
    local withdrawChipsStruct, err = rlp.Decode(rlpdata, withdrawChipsStruct)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("withdrawChipsHandler", json.encode(withdrawChipsStruct))
    local v = bigInt:new()
    local amount = v:SetUint64(withdrawChipsStruct[1])
    local errstr = withdrawChipsStruct[2]
    log.Trace("withdrawchipsHand, tableid", tableid, "addr", addr, "hand", hand, "amount", amount:String(), "errstr", errstr)
    if addr == rCtr.selfaddr and amount:Uint64() == 0 then
        log.Error("withdrawchipsHand error, addr", addr, "amount", amount:String())
        local resultinfo = {
            ["Address"] = addr,
            ["Amount"] = amount:String(),
            ["Errstr"] = "withdrawchip unsuccess",
        }
        ge.NotifyUI("WithdrawChips", resultinfo)
        return
    end

    if addr == rCtr.selfaddr then
        --只关心自己桌子的变化
        log.Debug("withdrawchipsHand success, addr", addr, "amount", amount:String())
        local resultinfo = {
            ["Address"] = addr,
            ["Amount"] = amount:String(),
            ["Errstr"] = "",
        }
        ge.NotifyUI("WithdrawChips", resultinfo)
    end
end

function room_contract:withdrawChips(params)
    local t = json.decode(params)
    local tx = self.tc.Transact("withdrawChips", t.Chips)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function giveMeTokenHandler(saddr, value)
    if saddr == rCtr.selfaddr then
        -- 充值成功
        log.Trace("giveMeTokeHandler, addr", saddr, "value", value:String())
    end
end

function room_contract:giveMeToken()
    if self.giveMeTokeSub == nil then
        local index = {}
        table.insert(index, self.selfaddr)
        self.giveMeTokeSub = self.promotContract.WatchLog("GiveMeToken", giveMeTokenHandler, index)
    end

    local tx = self.promotContract.Transact("giveMeToken")--不需要参数
    return tx
end

function room_contract:balanceOf()
    local balance = self.btcContract.Call("balanceOf",self.selfaddr)
    if nil == balance then
        log.Error("Network", "disconnected")
        return NetworkError
    end

    local balanceInfo = {
        ["Addr"] = self.selfaddr,
        ["Balance"] = balance:String(),
    }

    return balanceInfo
end

function room_contract:exchangeKal(params)
    local t = json.decode(params) 
    log.Trace("exchangeKal", t.Value)
    local v = bigInt:new()
    local sv, result = v:SetString(t.Value, 0)
    if result == true then
        local tx = self.btcContract.Transact("exchangeKal", sv)
        if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
            log.Error("Network", "disconnected")
            return NetworkError
        end
        return tx
    end
    return "Invalid KAL number"
end

function room_contract:exchangeGoldcoin(params)
    local t = json.decode(params)
    log.Trace("exchangeGoldcoin", t.Value)
    local v = bigInt:new()
    local sv, result = v:SetString(t.Value, 0)
    if result == true then
        local txop = {
            ["to"] = btAddr,
            ["value"] = sv,
        }
              
        local txhash, err = eth.SendTransaction(txop)
        if err ~= nil then
            log.Error("SendTransaction err", err)
            return
        end

        log.Trace("exchangeGoldcoin tx", txhash)
        return txhash
    end
    return "Invalid Gold number"
end

function room_contract:KalTransaction(params)
    local t = json.decode(params) 
    log.Trace("KalTransaction address", t.Address, "value", t.Value)
    local v = bigInt:new()
    local sv, result = v:SetString(t.Value, 0)
    if result == true then
        local txop = {
            ["to"] = t.Address,
            ["value"] = sv,
        }
        local txhash, err = eth.SendTransaction(txop)
        if err ~= nil then
            log.Error("SendTransaction err", err)
            return
        end
 
        log.Trace("KalTransaction tx", txhash)
        return txhash
    end
    return "Invalid KAL number"
end

function room_contract:KalBalance(params)
    local balance, err = eth.BalanceAt(self.selfaddr)
    if err ~= nil then
        log.Error("Network", "disconnected")
        return NetworkError
    end

    local balanceInfo = {
        ["Addr"] = self.selfaddr,
        ["Balance"] = balance:String(),
        ["Errstr"] = err,
    }
    return balanceInfo
end

function room_contract:GoldTransaction(params)
    local t = json.decode(params)
    log.Trace("GoldTransaction address", t.Address, "value", t.Value)
    local v = bigInt:new()
    local sv, result = v:SetString(t.Value, 0)
    if result == true then
        local tx = self.btcContract.Transact("transfer", t.Address,sv)
        if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
            log.Error("Network", "disconnected")
            return NetworkError
        end
        return tx
    end
    return "Invalid Gold number"
end

function room_contract:verify(params)
    local t = json.decode(params)
    log.Trace("verify, tableid", t.Tableid, "hand", t.Hand)
    local result = ge.Verify(t.Tableid, t.Hand)
    if string.sub(result, 1, 1) == "{" then
        return json.decode(result)
    end
    return result
end

function submitPointHandler(tableid, addr, hand, rlpdata)
    local errstr = ""
    local errstr, err = rlp.Decode(rlpdata, errstr)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("submitPointHandler() tableid", tableid, "rCtr.curTable", rCtr.curTable, "addr", addr, "hand", hand, "errstr", errstr)
    if tableid == rCtr.curTable and addr == rCtr.selfaddr then 
        if errstr ~= "" then
            log.Error("SubmitPoint err", errstr)
            return
        end

        log.Trace("SubmitPoint ok, tableid", tableid, "hand", hand, "addr", addr)
    end
end

function room_contract:submitPointHash(hand, pointHash)
    local bph = byteSlice.new()
    bph:appendString(pointHash)
    local tx = self.tc.Transact("submitPointHash", self.curTable, hand, bph)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function room_contract:rate(params)
    local exchangerate = self.btcContract.Call("rate")
    if nil == exchangerate then
        log.Error("Network", "disconnected")
        return NetworkError
    end

    return exchangerate:String()
end

function room_contract:applyCode(params)
    local t = json.decode(params)
    log.Trace("applyCode, Code", t.InvitationCode)
    local result = self.tc.Call("applyCode", t.InvitationCode)
    if nil == result then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    if result == "" then
        local tx = self.tc.Transact("applyCode", t.InvitationCode)
        if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
            log.Error("Network", "disconnected")
            return NetworkError
        end
        return ""
    end
    return result
end

function room_contract:getCode(params)
    log.Trace("getCode, selfaddr", self.selfaddr)
    local code, totalReward, withdrawReward, invitedNum = self.tc.Call("getCode", self.selfaddr)
    if nil == code then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    log.Trace("getCode return, Code", code, "TotalReward", totalReward:String(), "withdrawReward", withdrawReward:String(), "invitedNum", invitedNum:String())
    local result = {
        ["InvitationCode"] = code,
        ["TotalReward"] = totalReward:String(),
        ["WithdrawReward"] = withdrawReward:String(),
        ["InvitedNum"] = invitedNum:String(),
    }
    return result
end

function room_contract:setCode(params)
    local t = json.decode(params)
    log.Trace("setCode, Code", t.InvitationCode)
    local result = self.tc.Call("setCode", t.InvitationCode)
    if nil == result then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    if result == "" then
        local tx = self.tc.Transact("setCode", t.InvitationCode)
        if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
            log.Error("Network", "disconnected")
            return NetworkError
        end
        return tx
    end
    return result
end

function room_contract:withdrawReward(params)
    log.Trace("withdrawReward")
    local result = self.tc.Call("withdraw")
    if nil == result then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    if result == "" then
        local tx = self.tc.Transact("withdraw")
        if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
            log.Error("Network", "disconnected")
            return NetworkError
        end
        return tx
    end
    return result
end

function room_contract:inviter(params)
    log.Trace("inviter, selfaddr", self.selfaddr)
    local inviterAddr = self.tc.Call("Inviter", self.selfaddr)
    if nil == inviterAddr then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    local result
    if inviterAddr ~= nil and inviterAddr ~= "" then
        log.Trace("getCode, inviterAddr", inviterAddr)
        local code, totalReward, withdrawReward, invitedNum = self.tc.Call("getCode", inviterAddr)
        if nil == code then
            log.Error("Network", "disconnected")
            return NetworkError
        end
        log.Trace("getCode return, Code", code, "TotalReward", totalReward:String(), "withdrawReward", withdrawReward:String(), "invitedNum", invitedNum:String())
        result = code
    end
    return result
end

function room_contract:hashData(params)
    local t = json.decode(params)
    log.Trace("hashData, data", t.Data)
    return ge.HashData(t.Data)
end

function room_contract:test(params)
--[[
    local list = {}
    local rlpdata = byteSlice.new()
    rlpdata:appendHexString("c0")
    local list, err = rlp.Decode(rlpdata, list)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("list", json.encode(list))
]]
    local list = {}
    table.insert(list, {})
    table.insert(list, {})
    local rlpdata, err = rlp.Encode(list)
    if err ~= nil then
        error("RlpEncode err: " .. err)
    end
    local hstrx = rlpdata:toHexString()
    log.Debug("rlpdata", hstrx)
    local list, err = rlp.Decode(rlpdata, list)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("list", json.encode(list))
    return "OK"
end

function dismissTableHandler(tableid, addr, hand, rlpdata)
    log.Info("dismissTableHandler() tableid", tableid, "addr", addr, "hand", hand)
    local selfaddr, tbid, seat, status, selfhand = rCtr:selfPlayingStatus()
    if selfaddr == nil then
        log.Error("Network", "disconnected")
        return NetworkError
    end

    log.Info("dismissTableHandler() status", status, "seat", seat, "selfaddr", selfaddr)
    if status == SeatStatusType.NOTJOIN then
        gt:leave(gt.myseat, true)
    end
    gt:GameReset(true)
    rCtr:setCurTable(tableid)
    rCtr.LeaveNextId = {}

    local notaryInfo = {}
    notaryInfo["Type"] = "dismissTable"
    notaryInfo["Hand"] = hand
    notaryInfo["Content"] = "Table Dissolved"
    ge.NotifyUI("NotaryInfo", notaryInfo)
    --rCtr:unsubscribeCreateTable()
    --rCtr:unsubscribeGameEvent()
end

function standupHandler(tableid, addr, hand, rlpdata)
    log.Trace("standupHandler(), curTable", rCtr.curTable, "selfAddr", rCtr.selfaddr, "tableid", tableid, "addr", addr, "hand", hand)
    local standup = 0
    local standup, err = rlp.Decode(rlpdata, standup)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("standupHandler(), standup", standup)
    if tableid == rCtr.curTable then
        local t = {}
        t["Tableid"] = rCtr.curTable
        t["Addr"] = addr
        t["Standup"] = standup
        ge.NotifyUI("StandupNext", t)--只需要通知即可
    end 
end

GameEventHandlers[GameEventTypes.Join] = joinHandler
GameEventHandlers[GameEventTypes.AddChips] = addChipsHandler
GameEventHandlers[GameEventTypes.Start] = startHandler
GameEventHandlers[GameEventTypes.Settle] = settleHandler
GameEventHandlers[GameEventTypes.NotarySettle] = nil
GameEventHandlers[GameEventTypes.LeaveNext] = leaveNextHandler
GameEventHandlers[GameEventTypes.CreateTable] = nil
GameEventHandlers[GameEventTypes.ChangeSeat] = nil
GameEventHandlers[GameEventTypes.LeaveTable] = leaveTableHandler
GameEventHandlers[GameEventTypes.notaryDiscard] = notaryDiscardHandler
GameEventHandlers[GameEventTypes.DismissTable] = dismissTableHandler
GameEventHandlers[GameEventTypes.SelectInter] = nil
GameEventHandlers[GameEventTypes.SubmitPoint] = submitPointHandler
GameEventHandlers[GameEventTypes.WithdrawChips] = withdrawChipsHandler
GameEventHandlers[GameEventTypes.FinishNotary] = nil
GameEventHandlers[GameEventTypes.SelectNotary] = nil
GameEventHandlers[GameEventTypes.GameStart] = gameStartHandler
GameEventHandlers[GameEventTypes.insure] = nil
GameEventHandlers[GameEventTypes.RmtInsTimeout] = notaryDiscardHandler
GameEventHandlers[GameEventTypes.StandUp] = standupHandler

function roomCreateTableHandler(eventtype, tableid, addr, hand, rlpdata)
    local createTableStruct = {}
    table.insert(createTableStruct, 0) --minimum
    table.insert(createTableStruct, 0) --maximum
    table.insert(createTableStruct, 0) --buyinMin
    table.insert(createTableStruct, 0) --buyinMax
    table.insert(createTableStruct, 0) --smallblind
    table.insert(createTableStruct, 0) --straddle
    table.insert(createTableStruct, 0) --ante
    table.insert(createTableStruct, "") --errstr
    local createTableStruct, err = rlp.Decode(rlpdata, createTableStruct)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("createTableHandler", json.encode(createTableStruct))
    local minimum = createTableStruct[1]
    local maximum = createTableStruct[2]
    local buyinMin = createTableStruct[3]
    local buyinMax = createTableStruct[4]
    local smallBlind = createTableStruct[5]
    local straddle = createTableStruct[6]
    local ante = createTableStruct[7]
    local errstr = createTableStruct[8]
    log.Trace("createTableHandler sender", addr, "tableid", tableid, "minimum", minimum, "maximum", maximum, "buyinMin", buyinMin, "buyinMax", buyinMax, "smallBlind", smallBlind, "straddle", straddle, "ante", ante, "errstr", errstr, "selfadr", rCtr.selfaddr)
    local resultinfo = {
        ["TableID"] = tableid,
        ["Errstr"] = err or "",
    }

    ge.NotifyRoom("CreateTable", resultinfo)

    rCtr:unsubscribeCreateTable()
end

function room_contract:subscribeCreateTable(params)
    log.Info("subscribeCreateTable, self.CreateTableSub", self.CreateTableSub)
    local t = json.decode(params)
    if self.CreateTableSub == nil then
        local index1 = {}
        table.insert(index1, GameEventTypes.CreateTable)
        log.Trace("subscribeCreateTable, index1", index1)
        local index3 = {}
        table.insert(index3, t.OwnerAddr)
        self.CreateTableSub = self.tc.WatchLog("gameEvent", roomCreateTableHandler, index1, nil, index3)
    end
    return "OK"
end

function room_contract:unsubscribeCreateTable()
    log.Trace("unsubscribeCreateTable(), self.CreateTableSub", self.CreateTableSub)
    if self.CreateTableSub ~= nil then
        self.tc.CancelWatchLog(self.CreateTableSub)
        self.CreateTableSub = nil
    end
    return "OK"
end

function room_contract:createClubThreshold(params)
    local threshold = self.clubContract.Call("needChips")
    if nil == threshold then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return threshold:Uint64()
end

function newClubHandler(saddr, clubid, msg)
    log.Trace("newClubHandler, addr", saddr, "clubid", clubid, "errstr", msg)
    if saddr == rCtr.selfaddr then
        -- 创建俱乐部成功
        local newClubInfo = {}
        newClubInfo["ClubID"] = clubid
        newClubInfo["Errstr"] = msg
        ge.NotifyRoom("NewClub", newClubInfo)
    end
end

function room_contract:unsubscribeClubEvent(params)
    if self.NewClubSub ~= nil then
        self.clubContract.CancelWatchLog(self.NewClubSub)
        self.NewClubSub = nil
    end

    if self.JoinClubSub ~= nil then
        self.clubContract.CancelWatchLog(self.JoinClubSub)
        self.JoinClubSub = nil
    end

    if self.MyJoinClubSub ~= nil then
        self.clubContract.CancelWatchLog(self.MyJoinClubSub)
        self.MyJoinClubSub = nil
    end

    if self.GameRequestSub ~= nil then
        self.tc.CancelWatchLog(self.GameRequestSub)
        self.GameRequestSub = nil
    end
    return "OK"
end

function room_contract:createClub(params)
    if self.NewClubSub == nil then
        local index = {}
        table.insert(index, self.selfaddr)
        self.NewClubSub = self.clubContract.WatchLog("NewClub", newClubHandler, index)
    end
    local t = json.decode(params)
    local tx = self.clubContract.Transact("newClub", t.ClubName)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function room_contract:clubInfo(params)
    local t = json.decode(params)
    local clubid, ownerAddr, clubName, dissolved = self.clubContract.Call("clubs", t.ClubID)
    if nil == clubid then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    local result = {
        ["ClubID"] = clubid,
        ["OwnerAddr"] = ownerAddr,
        ["ClubName"] = clubName,
        ["Dissolved"] = dissolved,
    }
    return result
end

function room_contract:myClubs(params)
    local result = {}
    local clubids = self.clubContract.Call("myClubs", self.selfaddr)
    if nil == clubids then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    log.Trace("myClubs", clubids)
    if clubids ~= nil and #clubids > 0 then
        for i = 1, #clubids do
            local t = {
                ["ClubID"] = clubids[i]
            }
            table.insert(result, self:clubInfo(json.encode(t)))
        end
    end
    return result
end

function room_contract:clubMembers(params)
    local t = json.decode(params)
    local members = self.clubContract.Call("memberlist", t.ClubID)
    if nil == members then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    log.Trace("ClubID", t.ClubID, "members", members)
    return members
end

function room_contract:dissolveClub(params)
    local t = json.decode(params)
    local tx = self.clubContract.Transact("closeClub", t.ClubID)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function joinClubApprovedHandler(saddr, clubid, msg)
    log.Trace("joinClubApprovedHandler, addr", saddr, "rCtr.selfaddr", rCtr.selfaddr, "clubid", clubid, "errstr", msg)
    if saddr == rCtr.selfaddr then
        local joinClubInfo = {}
        joinClubInfo["Addr"] = saddr
        joinClubInfo["ClubID"] = clubid
        joinClubInfo["Errstr"] = msg
        ge.NotifyRoom("JoinClubApproved", joinClubInfo)
    end
end

function room_contract:listenMyJoinClub()
    if self.MyJoinClubSub ~= nil then
        self.clubContract.CancelWatchLog(self.MyJoinClubSub)
        self.MyJoinClubSub = nil
    end
    local index = {}
    table.insert(index, self.selfaddr)
    self.MyJoinClubSub = self.clubContract.WatchLog("JoinClubApproved", joinClubApprovedHandler, index)
    return "OK"
end

function joinClubHandler(saddr, clubid, msg)
    log.Trace("joinClubHandler, addr", saddr, "rCtr.selfaddr", rCtr.selfaddr, "clubid", clubid, "errstr", msg)
    local joinClubInfo = {}
    joinClubInfo["Addr"] = saddr
    joinClubInfo["ClubID"] = clubid
    joinClubInfo["Errstr"] = msg
    ge.NotifyRoom("JoinClub", joinClubInfo)
end

function room_contract:joinClubIDs(params)
    if self.JoinClubSub ~= nil then
        self.clubContract.CancelWatchLog(self.JoinClubSub)
        self.JoinClubSub = nil
    end
    local t = json.decode(params)
    local index = {}
    for i, v in ipairs(t) do
        table.insert(index, v)
    end
    log.Trace("joinClubIDs", json.encode(index), "#t", #t)
    if #t > 0 then
        self.JoinClubSub = self.clubContract.WatchLog("JoinClub", joinClubHandler, nil, index)
        if self.JoinClubSub ~= nil then
            self.WatchParamsMap.JoinClub = params
        end
    end
    return "OK"
end

function room_contract:joinClub(params)
    local t = json.decode(params)
    local tx = self.clubContract.Transact("joinClub", t.ClubID)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function room_contract:getJoinClubApplications(params)
    local t = json.decode(params)
    local result = {}
    for i, v in ipairs(t) do
        local applylist = {}
        local applyAddrs = self.clubContract.Call("allAppled", v)
        local applyDates = self.clubContract.Call("alltimes", v)
        if nil == applyAddrs or nil == applyDates then
            log.Error("Network", "disconnected")
            return NetworkError
        end
        for j = 1, #applyAddrs do
            local t = {
                ["Addr"] = applyAddrs[j],
                ["Date"] = applyDates[j],
            }
            table.insert(applylist, t)
        end
        result[v .. ""] = applylist
    end
    return result
end

function room_contract:quitClub(params)
    local t = json.decode(params)
    local tx = self.clubContract.Transact("approve", t.ClubID, self.selfaddr, 0)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function room_contract:approveJoinClub(params)
    local t = json.decode(params)
    local tx = self.clubContract.Transact("approve", t.ClubID, t.Addr, 1)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function room_contract:denyJoinClub(params)
    local t = json.decode(params)
    local tx = self.clubContract.Transact("approve", t.ClubID, t.Addr, 0)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function newApproveHandler(clubid, addr)
    log.Trace("newApproveHandler, clubid", clubid, "addr", addr)
    local applyInfo = {}
    applyInfo["ClubID"] = clubid
    applyInfo["Addr"] = addr
    ge.NotifyRoom("newApprove", applyInfo)
end

function room_contract:gameRequest(params)
    if self.GameRequestSub ~= nil then
        self.tc.CancelWatchLog(self.GameRequestSub)
        self.GameRequestSub = nil
    end
    local t = json.decode(params)
    local index = {}
    for i, v in ipairs(t) do
        table.insert(index, v)
    end
    log.Trace("gameRequest", json.encode(index), "#t", #t)
    if #t > 0 then
        self.GameRequestSub = self.tc.WatchLog("newApprove", newApproveHandler, index)
        if self.GameRequestSub ~= nil then
            self.WatchParamsMap.newApprove = params
        end
    end
    return "OK"
end

function room_contract:joinTableList(params)
    local t = json.decode(params)
    local applyAddrs, buyinNums, tableIds = self.tc.Call("joinlist", t.ClubID)
    if nil == applyAddrs then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    log.Trace("applyAddrs", applyAddrs, "buyinNums", buyinNums, "tableIds", tableIds)
    local result = {}
    for i = 1, #applyAddrs do
        local expired = false
        if result[tableIds[i] .. ""] == nil then
            local ti = self:GetTableInfoEx(tableIds[i])
            if ti.TableId ~= 0 then
                if ti.LeftTime <= 0 then
                    expired = true
                    --买入的桌子已超时，发审批不通过
                    local tx = self.tc.Transact("joinAprove", applyAddrs[i], 0)
                    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
                        log.Error("Network", "disconnected")
                    end
                else
                    result[tableIds[i] .. ""] = {}
                    result[tableIds[i] .. ""]["CreatorAddr"] = ti.CreatorAddr
                    result[tableIds[i] .. ""]["JoinList"] = {}
                end
            end
        end
        if not expired then
            local t = {
                ["Addr"] = applyAddrs[i],
                ["BuyinNum"] = buyinNums[i]:String(),
            }
            table.insert(result[tableIds[i] .. ""]["JoinList"], t)
        end
    end
    return result
end

function room_contract:approvedList(params)
    local t = json.decode(params)
    local num, data = self.tc.Call("Approvedlist", t.ClubID)
    if nil == num then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    log.Trace("approvedList num", num, "num:Uint64", num:Uint64(), "data", data)
    local result = {}
    if num:Uint64() > 0 then
        local approvedListStruct = {}
        for i = 1, num:Uint64() do
            local approvedStruct = {}
            table.insert(approvedStruct, "")    --senderAddr
            table.insert(approvedStruct, "")    --playerAddr
            table.insert(approvedStruct, 0)     --tableid
            table.insert(approvedStruct, 0)     --buyinNum
            table.insert(approvedStruct, 0)     --result
            table.insert(approvedListStruct, approvedStruct)
        end
        local approvedListStruct, err = rlp.Decode(data, approvedListStruct)
        if err ~= nil then
            error("RlpDecode err: " .. err)
        end
        for i = 1, num:Uint64() do
            local tbNum = approvedListStruct[i][3]
            if result[tbNum .. ""] == nil then
                local ti = self:GetTableInfoEx(tbNum)
                if ti.TableId ~= 0 then
                    result[tbNum .. ""] = {}
                    result[tbNum .. ""]["CreatorAddr"] = ti.CreatorAddr
                    result[tbNum .. ""]["ApprovedList"] = {}
                end
            end
            result[tbNum .. ""]["Index"] = i
            local t = {
                ["Sender"] = bin2string(approvedListStruct[i][1]),
                ["Addr"] = bin2string(approvedListStruct[i][2]),
                ["BuyinNum"] = approvedListStruct[i][4],
                ["Result"] = approvedListStruct[i][5],
            }
            log.Trace("tableid", tbNum, "Index", result[tbNum .. ""]["Index"], "Addr", t.Addr, "BuyinNum", t.BuyinNum)
            table.insert(result[tbNum .. ""]["ApprovedList"], t)
        end
    end
    return result
end

function room_contract:joinApprove(params)
    local t = json.decode(params)
    local tx = self.tc.Transact("joinAprove", t.Addr, t.Approved)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function room_contract:PlayedTables(params)
    local t = json.decode(params)
    log.Debug("room_contract:PlayedTables t.Address", t.Address, "t.Page", t.Page)
    local pageindex, data, tablecount = self.tc.Call("PlayedTables", t.Address, t.Page)
    if nil == pageindex then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    log.Debug("pageindex", pageindex, "data", data, "tablecount", tablecount:Uint64())
    --log.Debug("#data", #data)
    --log.Debug("#players", #players, "#wins", #wins)

    local datahexstr = data:toHexString()
    log.Trace("PlayedTables datahexstr ", datahexstr) 

    local ret = {}
    ret["PageIndex"] = pageindex:Uint64()
    local tables = {}
    if datahexstr == "c0" then 
        return tables 
    end
    
    for i = 1, tablecount:Uint64() do
        local tableInfoStruct = {}
        table.insert(tableInfoStruct, 0);   --tableid
        table.insert(tableInfoStruct, "");  --creatorAddr
        table.insert(tableInfoStruct, 0);   --currentHand
        table.insert(tableInfoStruct, 0);   --currentStatus
        table.insert(tableInfoStruct, "");  --startPlayer
        table.insert(tableInfoStruct, 0);   --smallblindpos
        table.insert(tableInfoStruct, 0);   --dealerpos
        table.insert(tableInfoStruct, 0);   --minNum
        table.insert(tableInfoStruct, 0);   --maxNum
        table.insert(tableInfoStruct, 0);   --buyinMin
        table.insert(tableInfoStruct, 0);   --buyinMax
        table.insert(tableInfoStruct, 0);   --smallBlind
        table.insert(tableInfoStruct, 0);   --straddle
        table.insert(tableInfoStruct, 0);   --ante
        table.insert(tableInfoStruct, 0);   --playerNum
        table.insert(tableInfoStruct, 0);   --tableProps
        table.insert(tableInfoStruct, 0);   --gameLength
        table.insert(tableInfoStruct, 0);   --lefttime
        table.insert(tableInfoStruct, 0);   --endtime
        table.insert(tableInfoStruct, {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0})   --insuranceOdds
        table.insert(tables, tableInfoStruct)
    end

    local tables, err = rlp.Decode(data, tables)
    if err ~= nil then
        error("data RlpDecode err: " .. err)
    end
    log.Debug("#tables", #tables, "selfaddr", self.selfaddr, "emptyAddr", emptyAddr)

    local timeSortFun = function(a, b)
        return a[19] > b[19]
    end
    table.sort(tables, timeSortFun)

    local tablesret = {}
    for i = 1, #tables do
        log.Debug("PlayedTables trans tableid ", tables[i][1], "", tables[i][19])

        local tableInfoStruct = tables[i]

        tableInfoStruct[2] = bin2string(tableInfoStruct[2])
        tableInfoStruct[5] = bin2string(tableInfoStruct[5])
        
        local endtime = tableInfoStruct[19]
        log.Debug("tableInfoStruct[2]", tableInfoStruct[2], "endtime-os.time()", endtime-os.time())
        local bEnd = os.time()>endtime
        if tableInfoStruct[2] ~= emptyAddr and bEnd then --未结束的不显示
            local tbNum = tableInfoStruct[1]
            local creatorAddr = tableInfoStruct[2]
            local currentHand = tableInfoStruct[3]
            local currentStatus = tableInfoStruct[4]
            local startPlayer = tableInfoStruct[5]
            local smallBlindPos = tableInfoStruct[6]
            local dealerPos = tableInfoStruct[7]
            local minNum = tableInfoStruct[8]
            local maxNum = tableInfoStruct[9]
            local buyinMin = tableInfoStruct[10]
            local buyinMax = tableInfoStruct[11]
            local smallBlind = tableInfoStruct[12]
            local straddle = tableInfoStruct[13]
            local ante = tableInfoStruct[14]
            local playerNum = tableInfoStruct[15]
            local tableProps = tableInfoStruct[16]
            local gameLength = tableInfoStruct[17]
            local lefttime = tableInfoStruct[18]
            local endtime = tableInfoStruct[19]
            local insuranceOdds = tableInfoStruct[20]
            local ti = buildTable(tbNum, creatorAddr, currentHand, currentStatus, startPlayer, smallBlindPos, dealerPos, minNum, maxNum, buyinMin, buyinMax, smallBlind, straddle, ante, playerNum, tableProps, gameLength, lefttime, endtime, insuranceOdds)

            local players, wins, buyins = self.tc.Call("PlayedList", tables[i][1])
            if nil == players then
                log.Error("Network", "disconnected")
                return NetworkError
            end
            if #players > 0 then
                for j = 1, #players do
                    log.Debug("players[j]", players[j], "wins[j]", wins[j]:Int64())
                    if players[j] == self.selfaddr then

                        --log.Debug("table.insert(tables[i], wins[i])")
                        --table.insert(ti, wins[j])
                        ti["Win"] = wins[j]:Int64()
                        break
                    end
                end

                --table.insert(tablesret, ti)

                --根据结束时间分组
                local d = os.date("%Y/%m/%d",endtime)
                if tablesret[d] == nil then
                    tablesret[d] = {}
                end
                table.insert(tablesret[d], ti)
            end
        end
    end
    ret["Tables"] = tablesret
    return ret
end

function room_contract:TableDetail(params)
    local t = json.decode(params)
    log.Debug("room_contract:playedList t.TableID", t.TableId)
    local retTable = self:GetTableInfoEx(t.TableId)
    local players, wins, buyins = self.tc.Call("PlayedList", t.TableId)
    if nil == players then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    log.Debug("players", players, "wins", wins)
    log.Debug("#players", #players, "#wins", #wins)
    local result = {}
    for i = 1, #players do
        log.Debug("players[i]", players[i], "wins", wins[i]:Int64(), "buyin", buyins[i]:Uint64())
        if players[i]~= emptyAddr then
            if players[i] == insuranceAddr then
                retTable["InsuranceWin"] = wins[i]:Int64()
            else
                local item = {}
                table.insert(item, players[i])
                table.insert(item, wins[i]:Int64())
                table.insert(item, buyins[i]:Uint64())

                table.insert(result, item)
            end
        end
    end
    local winSortFun = function(a, b)
        return a[2] > b[2]
    end
    table.sort(result, winSortFun)

    retTable["Result"] = result
    return retTable
end

function room_contract:GetTableInfoEx(tableId)
    local tableInfoEx = {}
    local tableInfoStruct = {}
    table.insert(tableInfoStruct, 0)   --tableid
    table.insert(tableInfoStruct, "")  --creatorAddr
    table.insert(tableInfoStruct, 0)   --currentHand
    table.insert(tableInfoStruct, 0)   --currentStatus
    table.insert(tableInfoStruct, "")  --startPlayer
    table.insert(tableInfoStruct, 0)   --smallblindpos
    table.insert(tableInfoStruct, 0)   --dealerpos
    table.insert(tableInfoStruct, 0)   --minNum
    table.insert(tableInfoStruct, 0)   --maxNum
    table.insert(tableInfoStruct, 0)   --buyinMin
    table.insert(tableInfoStruct, 0)   --buyinMax
    table.insert(tableInfoStruct, 0)   --smallBlind
    table.insert(tableInfoStruct, 0)   --straddle
    table.insert(tableInfoStruct, 0)   --ante
    table.insert(tableInfoStruct, 0)   --playerNum
    table.insert(tableInfoStruct, 0)   --tableProps
    table.insert(tableInfoStruct, 0)   --gameLength
    table.insert(tableInfoStruct, 0)   --lefttime
    table.insert(tableInfoStruct, 0)   --endtime
    table.insert(tableInfoStruct, {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0})   --insuranceOdds
    local data = self.tc.Call("getTableInfoEx", tableId)
    if nil == data then
        log.Error("Network", "disconnected")
        return buildTable(0, "", 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0})
    end
    local tableInfoStruct, err = rlp.Decode(data, tableInfoStruct)
    if err ~= nil then
        log.Error("RlpDecode err:", err)
        return buildTable(0, "", 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0})
    end
    local tbNum = tableInfoStruct[1]
    local creatorAddr = bin2string(tableInfoStruct[2])
    local currentHand = tableInfoStruct[3]
    local currentStatus = tableInfoStruct[4]
    local startPlayer = bin2string(tableInfoStruct[5])
    local smallBlindPos = tableInfoStruct[6]
    local dealerPos = tableInfoStruct[7]
    local minNum = tableInfoStruct[8]
    local maxNum = tableInfoStruct[9]
    local buyinMin = tableInfoStruct[10]
    local buyinMax = tableInfoStruct[11]
    local smallBlind = tableInfoStruct[12]
    local straddle = tableInfoStruct[13]
    local ante = tableInfoStruct[14]
    local playerNum = tableInfoStruct[15]
    local tableProps = tableInfoStruct[16]
    local gameLength = tableInfoStruct[17]
    local lefttime = tableInfoStruct[18]
    local endtime = tableInfoStruct[19]
    local insuranceOdds = tableInfoStruct[20]
    tableInfoEx = buildTable(tbNum, creatorAddr, currentHand, currentStatus, startPlayer, smallBlindPos, dealerPos, minNum, maxNum, buyinMin, buyinMax, smallBlind, straddle, ante, playerNum, tableProps, gameLength, lefttime, endtime, insuranceOdds)
    return tableInfoEx
end

function room_contract:HandleReConnectInter()
    local oldInterList = ge.GetInterList()
    log.Trace("HandleConnectInter #oldInterList", #oldInterList)
    if #oldInterList == 0 then
        local newInterList = RoomInter()
        if #newInterList > 0 and gt.tableid > 0 and gt.myseat ~= -1 then
            local naddr = newAddress(self.selfaddr)
            log.Trace("HandleConnectInter ReConnectInter newInterList", newInterList, "gt.myseat", gt.myseat, "gt.tableid", gt.tableid,"self.selfaddr",self.selfaddr)
            ge.ReConnectInter(gt.myseat, gt.tableid, naddr, newInterList)
        end
    end
end

function room_contract:gameSwitch(params)
    local selfaddr, tbid, seat, status, hand = self:selfPlayingStatus()
    if selfaddr == nil then
        log.Error("Network", "disconnected")
        return NetworkError
    end

    local ret = {}
    local t = json.decode(params)
    if t.Action == "Background" then
        if tbid ~= 0 then
            local tx = self.tc.Transact("standup", true)
            if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
                log.Error("Network", "disconnected")
                return NetworkError
            end
            self.StandupNext = true
            self.tbidBeforeSwitch = tbid
        end
    elseif t.Action == "Foreground" then
        if self.StandupNext then
            local tx = self.tc.Transact("standup", false)
            if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
                log.Error("Network", "disconnected")
                return NetworkError
            end
            self.StandupNext = false
        end

        if tbid == 0 then --SITTING 2
            local gameLeaveData = {}
            table.insert(gameLeaveData, seat)
            table.insert(gameLeaveData, "")
            local rlpdata, err = rlp.Encode(gameLeaveData)
            leaveTableHandler(self.tbidBeforeSwitch, selfaddr, hand, rlpdata, false)
            ret["Info"] = "NotInAnyTable"
            return ret
        else
            local tableInfo = self:GetTableInfoEx(tbid)
            log.Debug("gameSwitch " .. t.Action .. ", tableInfo.CurrentStatus", tableInfo.CurrentStatus, "tableInfo.CurrentHand", tableInfo.CurrentHand)
            if tableInfo.CurrentStatus == 0 then
                ret["Info"] = "NotInGame"
                return ret
            end
            gt:syncGameReplays(tbid)
        end
    end
    return ret
end
--[[
function room_contract:gameSwitch(params)
    local ret = {}
    local t = json.decode(params)
    log.Trace("gameSwitch " .. t.Action .. ", self.tbidBeforeSwitch", self.tbidBeforeSwitch, "self.handBeforeSwitch", self.handBeforeSwitch, "self.statusBeforeSwitch", SeatStatusTypeStr[self.statusBeforeSwitch], "self.switchBackgroundTick", self.switchBackgroundTick, "self.StandupNext", self.StandupNext)
    if t.Action == "Foreground" and (self.tbidBeforeSwitch == nil or self.handBeforeSwitch == nil or self.statusBeforeSwitch == nil) then
        ret["Info"] = "SwitchForegroundBeforeSwitchBackground"
        return ret
    end
    local selfaddr, tbid, seat, status, hand = self:selfPlayingStatus()
    if selfaddr == nil then
        log.Error("Network", "disconnected")
        return NetworkError
    end

    ret["Hand"] = hand
    ret["Status"] = status
    if t.Action == "Background" then
        if hand ~= nil then
            self.tbidBeforeSwitch = tbid
            self.handBeforeSwitch = hand
            self.statusBeforeSwitch = status
            if self.statusBeforeSwitch >= SeatStatusType.PLAYING then
                local tx = self.tc.Transact("standup", true)
                if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
                    log.Error("Network", "disconnected")
                    return NetworkError
                end
                if hand == 0 and self.curTable ~= 0 then
                    self.handBeforeSwitch = self.curTable
                    log.Trace("gameSwitch " .. t.Action .. ", set self.handBeforeSwitch", self.handBeforeSwitch)
                end
                self.StandupNext = true
                self.switchBackgroundTick = os.time()
                ret["Info"] = "ShowBtnResitDown"
            end
        end
    elseif t.Action == "Foreground" then
        if self.StandupNext and os.time() - self.switchBackgroundTick < 4 then
            ret["Info"] = "SwitchTooFast"
            return ret
        end
        if tbid == 0 then --SITTING 2
            local gameLeaveData = {}
            table.insert(gameLeaveData, seat)
            table.insert(gameLeaveData, "")
            local rlpdata, err = rlp.Encode(gameLeaveData)
            leaveTableHandler(self.tbidBeforeSwitch, selfaddr, hand, rlpdata, false)
            ret["Info"] = "NotInAnyTable"
            return
        end

        local tableInfo = self:GetTableInfoEx(self.tbidBeforeSwitch)
        log.Debug("gameSwitch " .. t.Action .. ", tableInfo.CurrentStatus", tableInfo.CurrentStatus, "tableInfo.CurrentHand", tableInfo.CurrentHand)
        if tableInfo.CurrentStatus == 2 and self.statusBeforeSwitch >= SeatStatusType.PLAYING and self.StandupNext and self.handBeforeSwitch == hand then --在当前局从后台切回前台了
            local tx = self.tc.Transact("standup", false)
            if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
                log.Error("Network", "disconnected")
                return NetworkError
            end
            self.StandupNext = false
        elseif tableInfo.CurrentStatus == 2 and self.statusBeforeSwitch ~= status and status == SeatStatusType.PLAYING then --2游戏开始了
            local index1 = {}
            table.insert(index1, GameEventTypes.DismissTable)
            table.insert(index1, GameEventTypes.Settle)
            table.insert(index1, GameEventTypes.GameStart)
            log.Trace("makeupGameEvent, index1", index1)
            local index2 = {}
            table.insert(index2, tbid)
            if self.MakeupGameEventSub ~= nil then
                gt.roomManagercontract.CancelWatchLog(self.MakeupGameEventSub)
                self.MakeupGameEventSub = nil
            end
            self.MakeupGameEventSub = gt.roomManagercontract.MakeupLogs("gameEvent", gameEventHandler, index1, index2)
            log.Info("makeupGameEvent2 self.MakeupGameEventSub", self.MakeupGameEventSub)
            ret["Info"] = "OnlookerBecomePlayer"
        elseif tableInfo.CurrentStatus == 2 and status < SeatStatusType.PLAYING then --旁观
            gt:syncGameReplays(tbid)
            ret["Info"] = "StillOnlooker"
        elseif tableInfo.CurrentStatus == 0 and self.handBeforeSwitch < tableInfo.CurrentHand then --切回前台后，已经不在游戏中了，要使得可离开
            local gameLeaveData = {}
            table.insert(gameLeaveData, seat)
            table.insert(gameLeaveData, "")
            local rlpdata, err = rlp.Encode(gameLeaveData)
            leaveTableHandler(self.tbidBeforeSwitch, selfaddr, hand, rlpdata, false)
            ret["Info"] = "NotInGame"
        end
        self.tbidBeforeSwitch = nil
        self.handBeforeSwitch = nil
        self.statusBeforeSwitch = nil
    end
    return ret
end
]]
function room_contract:selfHoleCards(params)
    local t = json.decode(params)
    gt.selfHoleCards = t
    gt.record:updateHoleCards(gt.myseat, t)
    return "OK"
end

function room_contract:reConnectGameReplays(params)
    self:HandleReConnectInter()
    gt:syncGameReplays(gt.tableid)
end

function room_contract:SelfPlayingStatus(params)
    local selfaddr, tbid, seat, status, hand = rCtr:selfPlayingStatus()
    if nil == selfaddr then
        log.Error("Network", "disconnected")
        return NetworkError
    end

    local ps = {
        ["Addr"] = selfaddr,
        ["TableId"] = tbid,
        ["SeatNum"] = seat,
        ["Status"] = status,
        ["Hand"] = hand
    }
    return ps
end

function room_contract:seatInfoEx(params)--不能是local函数
    log.Trace("seatinfo()", params)
    local seats = {}
    seats.SeatsInfo = {}
    local t = json.decode(params)
    local tbNum, currentHand, currentStatus, startPlayer, smallBlindPos, delerPos, minNum, maxNum, buyinMin, buyinMax, smallBlind, straddle, ante = self.tc.Call("getTableInfo", t.TableId)
    local data = rCtr.tc.Call("getTableSeatInfos", t.TableId)

    --Call失败了（含重试）返回空结构，不然界面会收到jsonxxx
    if nil == tbNum or nil == data then
        log.Error("Network", "disconnected")
        return NetworkError
    end

    seats.CurrentStatus = currentStatus
    local seatInfos = {}
    for i = 1, maxNum do
        local item = {}
        table.insert(item, "")  --账号地址
        table.insert(item, 0)   --tableid
        table.insert(item, 0)   --pos
        table.insert(item, 0)   --amount
        table.insert(item, 0)   --playstatus
        table.insert(item, 0)   --hand
        table.insert(seatInfos, item)
    end
    local seatInfos, err = rlp.Decode(data, seatInfos)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("seatInfo", json.encode(seatInfos))

    for i = 1, #seatInfos do
        local addr = bin2string(seatInfos[i][1])
        log.Trace("getTableSeatInfos, addr", addr, "tbm", seatInfos[i][2], "seatNum", seatInfos[i][3], "amount", seatInfos[i][4], "status", SeatStatusTypeStr[seatInfos[i][5]], "hand", seatInfos[i][6])
        local v = bigInt:new()
        local amount = v:SetUint64(seatInfos[i][4])
        local ti = {
            ["PlayerAddr"] = addr,
            ["Pos"] = seatInfos[i][3],
            ["Amount"] = amount:String(),
            ["Status"] = seatInfos[i][5],
            ["Hand"] = seatInfos[i][6],
        }
        table.insert(seats.SeatsInfo, ti)
    end
    return seats
end
