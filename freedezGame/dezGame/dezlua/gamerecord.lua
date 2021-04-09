local log = require("log")
local tx = require("texas")
require("init")
local json = require("json")

gamerecord = class()

function gamerecord:ctor(Dealer)
    log.Trace("gamerecord:ctor Dealer", Dealer)
    self.actions = {}
    --self.players = players
    
    self.Dealer = Dealer
end

function gamerecord:addTurnInfo(tinfo)
    log.Debug("addTurnInfo() tinfo", tinfo)
    local gameReplayPlayerAction = clone(tinfo)
    gameReplayPlayerAction["id"] = #self.actions + 1
    if tinfo.Pots ~= nil then
        gameReplayPlayerAction["Pots"] = clone(tinfo.Pots)
    else
        gameReplayPlayerAction["Pots"] = {}
    end

    if #self.actions > 0 and tinfo.Stage ~= self.actions[#self.actions].Stage then
        log.Debug("GameState", tinfo.Stage, "self.actions[#self.actions].Stage", self.actions[#self.actions].Stage)
        gameReplayPlayerAction.StageChange = true
    end

    log.Debug("addTurnInfo() gameReplayPlayerAction", gameReplayPlayerAction)
    table.insert(self.actions, gameReplayPlayerAction)
    log.Trace("addTurnInfo() #self.actions", #self.actions)
end

function gamerecord:addGameOver(settleInfo)
    log.Debug("addGameOver() settleInfo", settleInfo)
    if self.actions == nil or #self.actions == 0 then
        log.Error("addGameOver() actions", self.actions)
        return
    end
    local gameReplayPlayerAction = clone(self.actions[#self.actions])
    log.Debug("addGameOver() gameReplayPlayerAction", gameReplayPlayerAction)
    gameReplayPlayerAction.StageChange = true
    gameReplayPlayerAction["Pots"] = {0}
    gameReplayPlayerAction["id"] = #self.actions + 1
    gameReplayPlayerAction["TableId"] = settleInfo.TableId
    gameReplayPlayerAction["Hand"] = settleInfo.Hand

    local winGenCards = {}
    for k, v in ipairs(settleInfo.PotAllot) do
        for seatId, v in pairs(settleInfo.PlayerInfo) do
            if winGenCards[k] == nil then
                if v.Win[k] >= 0 then
                    winGenCards[k] = clone(v.GenCards[k])
                end
            else
                break
            end
        end
    end
    log.Debug("addGameOver() winGenCards", winGenCards)
    gameReplayPlayerAction["WinGenCards"] = winGenCards
    gameReplayPlayerAction["PlayerInfo"] = clone(settleInfo.PlayerInfo)
    gameReplayPlayerAction["RmtIns"] = clone(settleInfo["RmtIns"])
    if settleInfo.RmtCard ~= nil then
        gameReplayPlayerAction["RmtCard"] = clone(settleInfo["RmtCard"])
    end

    --缺少以下信息无法将gameReplay转为GameOverInfo
    gameReplayPlayerAction["InsBuyerList"] = clone(settleInfo.InsBuyerList);
    gameReplayPlayerAction["InsWinList"] = clone(settleInfo.InsWinList);
    gameReplayPlayerAction["PotAllot"] = clone(settleInfo.PotAllot);
    gameReplayPlayerAction["RmtPotAlloc"] = clone(settleInfo.RmtPotAlloc);
    log.Debug("addGameOver() gameReplayPlayerAction", gameReplayPlayerAction)
    table.insert(self.actions, gameReplayPlayerAction)
    log.Trace("addGameOver() json(gameReplayPlayerAction)", json.encode(gameReplayPlayerAction))
    log.Trace("addGameOver() #self.actions", #self.actions)
    log.Trace("addGameOver() self.actions[#self.actions]", self.actions[#self.actions])
end

function gamerecord:GetGameReplays()
    --log.Trace("GetGameReplays() actions", self.actions)
    log.Trace("GetGameReplays() json(actions)", json.encode(self.actions))
    return self.actions
end

function gamerecord:NewestGameReplay()
    log.Trace("NewestGameReplay #self.actions", #self.actions)
    return self.actions[#self.actions]
end

function gamerecord:unInit()
    log.Trace("gamerecord:unInit() self.actions", self.actions)
    self.actions = {}
    self.Dealer = -1
end

function gamerecord:clone(gameReplays)
    log.Trace("gamerecord:clone #gameReplays", #gameReplays)
    self.actions = {}
    for i, v in ipairs(gameReplays) do
        table.insert(self.actions, v)
    end
end

function gamerecord:rawpush(gameReplay)
    local found = false
    for i, v in ipairs(self.actions) do
        if tonumber(v.id) == tonumber(gameReplay.id) then
            found = true
            break
        end
    end

    if not found then
        table.insert(self.actions, gameReplay)
        log.Trace("after rawpush", json.encode(self.actions))
    end
end

function gamerecord:getLength()
    return #self.actions
end

function gamerecord:updateHoleCards(myseat, holeCardsInfo)
    log.Trace("gamerecord:updateHoleCards myseat", myseat, "holeCardsInfo", holeCardsInfo)
    if holeCardsInfo ~= nil then
        for i, v in ipairs(self.actions) do
            if v.TableId == holeCardsInfo.TableId and v.Hand == holeCardsInfo.Hand then
                v.PlayerInfo[tostring(myseat)].HoleCards = clone(holeCardsInfo.HoleCards)
                v.PlayerInfo[tostring(myseat)].HandCard = tx.GetPokerStringTable(tx.MapCards(holeCardsInfo.HoleCards))
            end
        end
    end
end

return gamerecord
