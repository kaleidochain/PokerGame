local eth = require("eth")
local tx = require("texas")
local json = require("json")
local ge = require("flowcontrol")
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

RoomManagerAddr = ge.GameAddress()
TableID = ge.TableID()

function room_contract:ctor()
    log.Trace("room_contract", "ctor", "RoomManagerAddr", RoomManagerAddr)
    self.tc = eth.contract(RoomManagerABI, RoomManagerAddr)

    --与合约交互用的订阅数据
    self.GameEventSub = nil
end

rCtr = room_contract:new()

function newAddress(str)--要求40个字节，所以不能带0x
    if string.sub(str, 1, 2) == "0x" then
        str = string.sub(str, 3, string.len(str))
    end
    return address.new(str) --调用luatype里的address
end

function settleHandler(tableid, addr, hand, rlpdata)
    local playerNum = 0
    local playerNum, err = rlp.Decode(rlpdata, playerNum)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    log.Trace("settleHandler(), tableid", tableid, "addr", addr, "hand", hand, "playerNum", playerNum)
    gt:gameStateUninit()
end

function gameStartHandler(tableid, addr, hand, rlpdata)
    local gameStartStruct = {}
    table.insert(gameStartStruct, 0) --seatNum,大盲座位号，这个肯定不会是空位
    table.insert(gameStartStruct, 0) --smallBlindPos，这个有可能是空位
    table.insert(gameStartStruct, 0) --dealerPos，这个有可能是空位
    local gameStartStruct, err = rlp.Decode(rlpdata, gameStartStruct)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    local starter = gameStartStruct[1]
    local smallBlindPos = gameStartStruct[2]
    local dealerPos = gameStartStruct[3]
    log.Trace("gameStartHandler() tableid", tableid, "addr", addr, "hand", hand, "starter", starter, "smallBlindPos", smallBlindPos, "dealerPos", dealerPos)
    ge.SetCurrentHand(hand)
    local players = rCtr:playersinfo()
    local tableInfo, gameInfo = rCtr:tableinfo(players)
    local rakerate = rCtr:rakeRate()
    tableInfo["RakeRate"] = tonumber(rakerate)
    gt:startGame(tableInfo, gameInfo, players)
end

function buyInsureHandler(tableid, addr, hand, rlpdata)
    log.Debug("buyInsureHandler hand", hand)
    local buyStruct = {}
    table.insert(buyStruct, 0) --order
    table.insert(buyStruct, 0) --out[0]
    table.insert(buyStruct, 0) --out[1]
    table.insert(buyStruct, 0) --amount[0]
    table.insert(buyStruct, 0) --amount[1]
    table.insert(buyStruct, "") --errstring
    local buyStruct, err = rlp.Decode(rlpdata, buyStruct)
    if err ~= nil then
        error("buyInsureHandler RlpDecode err: " .. err)
    end
    log.Trace("buyInsureHandler", json.encode(buyStruct))

    local order = buyStruct[1]
    local out = {buyStruct[2], buyStruct[3]}
    local amount = {buyStruct[4], buyStruct[5]}
    ins:BuyHandler(tableid, addr, hand, out, order, amount)
end

GameEventHandlers[GameEventTypes.Join] = nil
GameEventHandlers[GameEventTypes.AddChips] = nil
GameEventHandlers[GameEventTypes.Start] = nil
GameEventHandlers[GameEventTypes.Settle] = settleHandler
GameEventHandlers[GameEventTypes.NotarySettle] = nil
GameEventHandlers[GameEventTypes.LeaveNext] = nil
GameEventHandlers[GameEventTypes.CreateTable] = nil
GameEventHandlers[GameEventTypes.ChangeSeat] = nil
GameEventHandlers[GameEventTypes.LeaveTable] = nil
GameEventHandlers[GameEventTypes.notaryDiscard] = nil
GameEventHandlers[GameEventTypes.DismissTable] = nil
GameEventHandlers[GameEventTypes.SelectInter] = nil
GameEventHandlers[GameEventTypes.SubmitPoint] = nil
GameEventHandlers[GameEventTypes.WithdrawChips] = nil
GameEventHandlers[GameEventTypes.FinishNotary] = nil
GameEventHandlers[GameEventTypes.SelectNotary] = nil
GameEventHandlers[GameEventTypes.GameStart] = gameStartHandler
GameEventHandlers[GameEventTypes.insure] = buyInsureHandler
GameEventHandlers[GameEventTypes.RmtInsTimeout] = nil
GameEventHandlers[GameEventTypes.StandUp] = nil

function gameEventHandler(eventtype, tableid, addr, hand, rlpdata)
    if eventtype >= GameEventTypes.Join and eventtype <= GameEventTypes.End then
        log.Trace("gameEventHandler(), eventName", GameEventNames[eventtype], "eventType", eventtype, "tableid", tableid, "addr", addr, "hand", hand)
        GameEventHandlers[eventtype](tableid, addr, hand, rlpdata)
    else
        log.Warn("gameEventHandler(), unknown eventtype", eventtype, "tableid", tableid, "addr", addr, "hand", hand)
    end
end

function room_contract:watchGameEvent(tableid)
    log.Info("watchGameEvent, tableid", tableid, "self.GameEventSub", self.GameEventSub)
    if self.GameEventSub == nil then
        local index1 = {}
        for i = 1, GameEventTypes.End - 1 do
            if GameEventHandlers[i] ~= nil then
                table.insert(index1, i)
            end
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
end

function Initialize(bRecover)
    log.Trace("Initialize, bRecover", bRecover)
    rCtr:watchGameEvent(TableID)
    if bRecover then
        LoadState()
    end
end

function Uninitialize()
    rCtr:unsubscribeGameEvent()
end

--内部使用，获取当前局玩家信息
function room_contract:playersinfo()
    local players = {}
    local Players = self.tc.Call("getTablePlayers", TableID)  --获取当局玩家地址数组，用于构造后面getPlayerInfos返回rlp数据的解码数据结构
    local data = self.tc.Call("getPlayerInfos", TableID)
    log.Trace("playersinfo getTablePlayers #Players", #Players, "Players", Players)
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
        table.insert(item, 0)   --hand，比当前局数小表示该玩家需要补盲
        table.insert(playerInfos, item)
    end
    local playerInfos, err = rlp.Decode(data, playerInfos)
    if err ~= nil then
        error("RlpDecode err: " .. err)
    end
    for i = 1, #playerInfos do
        local addr = bin2string(playerInfos[i][1])
        log.Trace("getPlayerInfos, addr", addr, "tbm", playerInfos[i][2], "seatNum", playerInfos[i][3], "amount", playerInfos[i][4], "status", SeatStatusTypeStr[playerInfos[i][5]], "hand", playerInfos[i][6])
        local ti = {
            ["PlayerAddr"] = addr,
            ["Pos"] = playerInfos[i][3],
            ["Amount"] = playerInfos[i][4],
            ["Status"] = playerInfos[i][5],
            ["Hand"] = playerInfos[i][6],
        }
        table.insert(players, ti)
    end
    return players
end

local function buildTable(id, creatorAddr, currentHand, st, startPlayer, smallBlindPos, dealerPos, min, max, bmin, bmax, sb, sa, at, pn, tableProps, gameLength, lefttime, endtime, insuranceOdds)
    for i = 1, #insuranceOdds do
        insuranceOdds[i] = insuranceOdds[i] / 100
    end
    local ti = {
        ["TableID"] = id,
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

--获取牌桌信息，返回静态信息TableInfo与动态信息GameInfo
function room_contract:tableinfo(players)
    local tbInfo = self:GetTableInfoEx(TableID)
    log.Info("tableInfo", json.encode(tbInfo))
    local tableInfo = {
        ["TableId"] = tbInfo.TableId,
        ["CreatorAddr"] = tbInfo.CreatorAddr,
        ["MinNum"] = tbInfo.MinNum,
        ["MaxNum"] = tbInfo.MaxNum,
        ["BuyinMin"] = tbInfo.BuyinMin,
        ["BuyinMax"] = tbInfo.BuyinMax,
        ["SmallBlindBet"] = tbInfo.SmallBlind,
        ["Straddle"] = tbInfo.Straddle,
        ["Ante"] = tbInfo.Ante,
        ["TableProps"] = tbInfo.TableProps,
        ["GameLength"] = tbInfo.GameLength,
        ["InsuranceOdds"] = tbInfo.InsuranceOdds,
    }
    local gameInfo = {
        ["CurrentHand"] = tbInfo.CurrentHand,
        ["CurrentStatus"] = tbInfo.CurrentStatus,
        ["StartPlayer"] = tbInfo.StartPlayer,
        ["SmallBlindPos"] = tbInfo.SmallBlindPos,
        ["DealerPos"] = tbInfo.DealerPos,
        ["PlayerNum"] = tbInfo.PlayerNum,
        ["LeftTime"] = tbInfo.LeftTime,
        ["EndTime"] = tbInfo.EndTime,
    }
    return tableInfo, gameInfo
end

function room_contract:dismissTable()
    local tx = self.tc.Transact("notaryDismiss", TableID, gt.gameInfo.CurrentHand)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
end

function room_contract:submitSettle(settleData)
    local tx = self.tc.Transact("submitNotary", TableID, settleData)
    if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
        log.Error("Network", "disconnected")
        return NetworkError
    end
    return tx
end

function room_contract:rakeRate()
    local rakerate = self.tc.Call("rakeRate")
    log.Trace("rakeRate", rakerate)
    if nil == rakerate then
        return 3
    end
    return rakerate:String()
end