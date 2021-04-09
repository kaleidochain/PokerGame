local ge = require("flowcontrol")
local tx = require("texas")
local st = require("seat")
local json = require("json")
local eth = require("eth")
local rlp = require("rlp")
local log = require("log")

require("abi")
require("roomcontract")
require("genseat")
require("gameevent")
require("recover")
require("insurance")
require("runmultitimes")
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

backupSeatSequence = nil --获取备份牌点玩家密钥座位号列表，nil表示未初始化，{}表示全部尝试过但均没成功，需要解散牌桌

runningTimer = {}
--列举用到的定时器
shuffleTimer = nil         --洗牌超时定时器，从收到合约GameStart事件到收齐本局所有玩家的ShuffleFinishMsg为止
dealCardTimer = nil        --发牌超时定时器，用于判断发底牌、公共牌、最后摊牌的底牌超时
declareTimer = nil         --玩家操作超时定时器，轮到该玩家操作，开始计时，不同操作时长不一
buyInsTimer = nil          --玩家操作保险定时器，只有一个池的时候是30秒，两个池是45秒
rmtTimesChooseTimer = nil  --多牌桌领先者多牌次数选择定时器
rmtTimesDeclareTimer = nil --多牌桌非领先者表决是否同意定时器
getBackupKeyCardTimer = nil--获取备份牌点定时器
--此定时器仅在FC崩溃恢复后启动一次，收到客户端发来操作后停止
renotifyTimer = nil        --FC重新通知定时器

function init(obj,resetFlag)
    obj.lastAction = -1  --上一个说话位置
    obj.curnTurn = -1    --当前说话位置
    obj.firstTurn = -1
    obj.lastTurn = -1    --最后一个说话位置
    obj.maxTurnBet = 0
    obj.diffBet = 0
    obj.sidepot = {}
    obj.potallot = {}
    obj.rmtpotallot = {}
    obj.decRecord = {}  --记录每个玩家应该发的牌点密钥片段序号，需要发的时候置为false，收到置为true，当所有为true时则为收齐
    obj.decRecordBeforeGetBackup = {}  --记录发送请求备份牌点前的decRecord
    obj.timeoutSeatIDs = {}  --同一轮超时玩家座位号列表，发公共牌的时候有可能有两个及以上玩家超时
    obj.index2card = {} --记录这一局解出来的牌点序号对应的牌点
    obj.firstActionExtended = false --第一个操作玩家是否已延长过操作时间
    obj.timeoutType = ""    --超时类型，是玩家操作超时declareTimeout还是发牌点超时dealcardTimeout，declareTimeout在BackupDecryptCardResult成功后当弃牌处理，调用TryDeclareNextSeat轮到下一位玩家；dealcardTimeout在DealCardResult处理，调用TryStartBetTurn开始下一轮

    obj.turnoperated = false -- 当前轮有下注过了，用作共识签名一致后流程判断
    obj.cursor = 0 --发牌游标
    obj.waitingRMT = false --等待选择多牌，只有同时有多牌和保险时控制才需要，第二次显示保险不需要了，等待的玩家也要用到
    obj.waitingInsEvent = false --等待选择保险，从弹出保险后一直到 返回买保险合约事件或多牌次数大于1 都为true，桌上所有玩家值应该一致
    obj.gamestate = GameStatusType.DeskState_Init
    obj.allingamestate = GameStatusType.DeskState_Init  --记录开始Allin的gamestate
    backupSeatSequence = nil
end

function game_texas:ctor()	-- 定义 game_texas 的构造函数
	log.Trace("game_texas", "ctor")
    --只调用一次的放这里，需要清空的变量放到init中
    self.seats = {}
    self.tableInfo = {}
    self.gameInfo = {}
    self.record = nil

    init(self)
end

function game_texas:gameStateUninit()
    log.Trace("gameStateUninit", "")
    self.gamestate = -1
    init(self,true)

    ins:unInit()
    rmt:unInit()

    log.Trace("gameStateUninit", "stopTimer shuffleTimer/declareTimer/dealCardTimer/buyInsTimer/rmtTimesChooseTimer/rmtTimesDeclareTimer/getBackupKeyCardTimer")
    StopTimer("shuffleTimer")
    StopTimer("declareTimer")
    StopTimer("dealCardTimer")
    StopTimer("buyInsTimer")
    StopTimer("rmtTimesChooseTimer")
    StopTimer("rmtTimesDeclareTimer")
    StopTimer("getBackupKeyCardTimer")
    StopRenotifyTimer()

    if self.record ~= nil then
        self.record:unInit()
    end

    if self.seats ~= nil then
        for i,v in ipairs(self.seats) do
            v.status = 0
            v.shuffleFinish = false
            v.blindBet = 0
            v.turnbet = 0
            v.lasttotalbet = 0
            v.action = PlayerOp.None
            v.totalbet = 0
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

--注意此处sequence不能有重复元素，否则会出问题
function game_texas:NextSeatID(sequence, id)
    for i = 1, #sequence do
        if sequence[i] == id then
            if i == #sequence then
                return sequence[1]
            end

            return sequence[i + 1]
        end
    end

    return nil
end

--注意此处sequence不能有重复元素，否则会出问题
function game_texas:PrevSeatID(sequence, id)
    for i = 1, #sequence do
        if sequence[i] == id then
            if i == 1 then
                return sequence[#sequence]
            end

            return sequence[i - 1]
        end
    end

    return nil
end

function fnShuffleTimeout()
    log.Trace("fnShuffleTimeout() stopTimer shuffleTimer", shuffleTimer)
    StopTimer("shuffleTimer")
    rCtr:dismissTable()
    gt:gameStateUninit()
end

function game_texas:startGame(tableInfo, gameInfo, players)
    self.tableInfo = tableInfo
    self.gameInfo = gameInfo
    local playingPos = {}   --参与本局的玩家座位号
    for i, v in ipairs(players) do
        log.Trace("startGame, v.Pos", v.Pos, "v.PlayerAddr", v.PlayerAddr, "startPlayer", self.gameInfo.StartPlayer, "v.PlayerAddr == self.gameInfo.StartPlayer", (v.PlayerAddr == self.gameInfo.StartPlayer))
        if v.PlayerAddr == self.gameInfo.StartPlayer then
            self.gameInfo["BigBlindPos"] = v.Pos     --得到大盲位置
        end

        if v.Status == SeatStatusType.NEXTLEAVE or v.Status == SeatStatusType.NEXTSTANDBY then
            v.Status = SeatStatusType.PLAYING
        end

        if v.Status >= SeatStatusType.PLAYING then
            playingPos[tostring(v.Pos)] = true
        end
    end

    local dealCardSeq = {}
    --从庄家的下一位开始转一圈，判断每个位置上玩家状态，PLAYING则按顺序加入列表中
    local i = (self.gameInfo.DealerPos + 1) % self.tableInfo.MaxNum
    while i ~= self.gameInfo.DealerPos do
        if playingPos[tostring(i)] ~= nil then
            table.insert(dealCardSeq, i)
        end
        i = (i + 1) % self.tableInfo.MaxNum
    end
    --最后判断是否是空Dealer
    if playingPos[tostring(i)] ~= nil then
        table.insert(dealCardSeq, i)
    end
    self.gameInfo["DealCardSequence"] = dealCardSeq  --得到底牌发牌座位号的顺序
    self.gameInfo["IsSmallBlindPosEmpty"] = not isItemExist(dealCardSeq, self.gameInfo.SmallBlindPos)   --小盲是否为空
    self.gameInfo["IsDealerPosEmpty"] = not isItemExist(dealCardSeq, self.gameInfo.DealerPos)   --庄家位是否为空
    ge.SetPlayingSeats(self.gameInfo.DealCardSequence)

    self.gameInfo["SupplementBetPos"] = {}
    self.seats = {}
    for i = 1, #players do
        log.Trace("players info: i", i, "Pos", players[i].Pos, "Status", SeatStatusTypeStr[players[i].Status], "Amount", players[i].Amount, "PlayerAddr", players[i].PlayerAddr, "Hand", players[i].Hand)
        if players[i].Status == SeatStatusType.PLAYING and players[i].Amount == 0 then
            log.Error("startGame() player has no balance!!! i", i, "Pos", players[i].Pos)
        end

        local seatId = self:getSeatIDByAddr(players[i].PlayerAddr)  --在self.seats中查找PlayerAddr对应的座位号
        if seatId ~= players[i].Pos then
            if seatId == -1 then
                local ns = st.new(players[i].Pos, players[i].Amount, players[i].PlayerAddr)
                ns.status = players[i].Status
                table.insert(self.seats, ns)
            else
                for j, v in ipairs(self.seats) do
                    if v.ad == players[i].PlayerAddr then
                        if v.id ~= players[i].Pos then
                            v.id = players[i].Pos
                            v.status = players[i].Status
                        end
                        break
                    end
                end
            end
        else
            self:updateState(players[i].Pos, players[i].PlayerAddr, players[i].Status, players[i].Amount)
        end

        --需要补盲注的位置，顺序无所谓
        if players[i].Status == SeatStatusType.PLAYING and players[i].Hand < self.gameInfo.CurrentHand - 1 then
            table.insert(self.gameInfo["SupplementBetPos"], players[i].Pos)
        end

        -- if players[i].Pos == tbinfo.SmallBlindPos and players[i].Status ~= SeatStatusType.PLAYING then
        --     tbinfo.SmallBlindPos = -1   --空小盲
        -- end
    end

    --计算straddle的座位号
    if #self.gameInfo.DealCardSequence >= 4 and self.tableInfo.Straddle == 1 then
        self.gameInfo["StraddlePos"] = self:NextSeatID(self.gameInfo.DealCardSequence, self.gameInfo.BigBlindPos)
    end

    log.Info("Game Start", json.encode(self.gameInfo))

    log.Trace("startGame resetTimer", "shuffleTimer", "expired", os.date("%X", os.time() + Timeout_ShuffleCard / 1000))
    StartTimer("shuffleTimer", Timeout_ShuffleCard)

    self.index2card = {}

    log.Trace("startGame", "SaveState")
    SaveState()
end

function game_texas:unfinishShuffleSeatIDs()
    local result = {}
    for i, v in ipairs(self.seats) do
        if isItemExist(self.gameInfo.DealCardSequence, v.id) and not v.shuffleFinish then
            table.insert(result, v.id)
        end
    end
    return result
end

function game_texas:AnteBet()
    for i, v in ipairs(self.seats) do
        if v.status == SeatStatusType.PLAYING then
            if v.balance >= self.tableInfo.Ante then
                v:AddBet(self.tableInfo.Ante)
                log.Trace("AnteBet, v.id", v.id, "v.balance", v.balance, "v.totalbet", v.totalbet)
            else
                error(string.format("seat %d balance(%d) lower than Ante(%d)", v.id, v.balance, self.tableInfo.Ante))
            end
        end
    end
end

function game_texas:BlindBet()
    local bigBlindBet = self.tableInfo.SmallBlindBet * 2
    local straddleBet = bigBlindBet * 2
    local supplementBet = self.gameInfo.StraddlePos ~= nil and straddleBet or bigBlindBet

    log.Info("BlindBet() SmallBlindPos", self.gameInfo.SmallBlindPos, "BigBlindPos", self.gameInfo.BigBlindPos, "StraddlePos", self.gameInfo.StraddlePos, "SupplementBetPos", self.gameInfo.SupplementBetPos)
    log.Info("BlindBet() SmallBlindBet", self.tableInfo.SmallBlindBet, "BigBlindBet", bigBlindBet, "StraddleBet", straddleBet, "SupplementBetPos", supplementBet)
    for i, v in ipairs(self.seats) do
        log.Debug("BlindBet() v.id", v.id, "v.status", SeatStatusTypeStr[v.status])
        if v.status >= SeatStatusType.PLAYING then
            if v.id == self.gameInfo.SmallBlindPos then
                if v.balance >= self.tableInfo.SmallBlindBet then
                    v:AddBet(self.tableInfo.SmallBlindBet)
                    v.blindBet = self.tableInfo.SmallBlindBet
                    log.Trace("BlindBet, smallBlind v.id", v.id, "v.balance", v.balance, "v.totalbet", v.totalbet)
                else
                    error(string.format("seat %d balance(%d) lower than SmallBlindBet(%d)", v.id, v.balance, self.tableInfo.SmallBlindBet))
                end
            elseif v.id == self.gameInfo.BigBlindPos then
                if v.balance >= bigBlindBet then
                    v:AddBet(bigBlindBet)
                    v.blindBet = bigBlindBet
                    log.Trace("BlindBet, bigBlind v.id", v.id, "v.balance", v.balance, "v.totalbet", v.totalbet)
                else
                    error(string.format("seat %d balance(%d) lower than BigBlindBet(%d)", v.id, v.balance, bigBlindBet))
                end
            elseif v.id == self.gameInfo.StraddlePos then
                if v.balance >= straddleBet then
                    v:AddBet(straddleBet)
                    v.blindBet = straddleBet
                    log.Trace("BlindBet, straddle v.id", v.id, "v.balance", v.balance, "v.totalbet", v.totalbet)
                else
                    error(string.format("seat %d balance(%d) lower than StraddleBet(%d)", v.id, v.balance, straddleBet))
                end
            else
                for j, jv in ipairs(self.gameInfo.SupplementBetPos) do
                    if v.id == jv then
                        if v.balance >= supplementBet then
                            v:AddBet(supplementBet)
                            v.blindBet = supplementBet
                            log.Trace("BlindBet, supplement v.id", v.id, "v.balance", v.balance, "v.totalbet", v.totalbet)
                        else
                            error(string.format("seat %d balance(%d) lower than SupplementBet(%d)", v.id, v.balance, supplementBet))
                        end
                    end
                end
            end
            local turnBet = v:GetTurnBet()
            if turnBet > self.maxTurnBet then
                self.maxTurnBet = turnBet
                log.Info("BlindBet, set self.maxTurnBet", self.maxTurnBet)
            end
        end
    end
end

function game_texas:AnteBlindBet()
    self.record = gamerecord.new(self.gameInfo.DealerPos)

    --有前注，GameReplay多一步前注
    if self.tableInfo.Ante > 0 then
        self:AnteBet()
    end
    --计算强制下注的位置
    self:BlindBet()
end

function fnDealCardsTimeout()
    log.Trace("fnDealCardsTimeout() stopTimer", "dealCardTimer")
    StopTimer("dealCardTimer")
    gt:processDealcardTimeout()
end

function game_texas:DealHoleCards()
    StopTimer("dealCardTimer")
    log.Trace("DealHoleCards resetTimer", "dealCardTimer", "expired", os.date("%X", os.time() + Timeout_Dealcard / 1000))
    StartTimer("dealCardTimer", Timeout_Dealcard)

    log.Info("DealHoleCards, DealCardSequence", self.gameInfo.DealCardSequence)
    local orgcursor = self.cursor
    local seatcardIndex = {}
    for i, v in ipairs(self.gameInfo.DealCardSequence) do
        local seatindex = {}
        table.insert(seatindex, v)
        table.insert(seatindex, 0)

        local index = {}
        table.insert(index, self.cursor)
        table.insert(index, self.cursor+1)
        table.insert(seatindex, index)
        local seat = self:GetSeat(v)
        seat.privateIndex = index

        log.Info("DealHoleCards, seatindex", seatindex)
        table.insert(seatcardIndex, seatindex)

        self.cursor = self.cursor + 2
        log.Info("DealHoleCards, set self.cursor", self.cursor)
    end

    self.decRecord = {}
    for i, v in ipairs(self.gameInfo.DealCardSequence) do
        local seat = self:GetSeat(v)
        self.decRecord[tostring(v)] = {}
        for j = orgcursor, self.cursor - 1 do
            if not isItemExist(seat.privateIndex, j) then
                self.decRecord[tostring(v)][tostring(j)] = false
            end
        end
    end

    log.Trace("DealHoleCards, decRecord", json.encode(self.decRecord))

    local jsondealcard = json.encode(seatcardIndex)
    log.Trace("DealHoleCards", jsondealcard)
    local dealcarddata = byteSlice:new()
    dealcarddata:appendString(jsondealcard)
    ge.Send(self.gameInfo.DealCardSequence, DealCardMsgCode, dealcarddata)
end

function game_texas:DealFlopCards()
    StopTimer("dealCardTimer")
    log.Trace("DealFlopCards resetTimer", "dealCardTimer", "expired", os.date("%X", os.time() + Timeout_Dealcard / 1000))
    StartTimer("dealCardTimer", Timeout_Dealcard)

    local orgcursor = self.cursor
    local seatcardIndex = {}
    local seatindex = {}
    table.insert(seatindex, self.tableInfo.MaxNum + 1)
    table.insert(seatindex, 0)

    local index = {}
    table.insert(index, self.cursor)
    table.insert(index, self.cursor + 1)
    table.insert(index, self.cursor + 2)
    table.insert(seatindex, index)

    log.Info("DealFlopCards, seatindex", seatindex)
    table.insert(seatcardIndex, seatindex)

    self.cursor = self.cursor + 3
    log.Info("DealFlopCards, set self.cursor", self.cursor)

    self.decRecord = {}
    local playingSeats = self:GetPlayingSeats()
    for i, v in ipairs(playingSeats) do
        local seat = self:GetSeat(v)
        self.decRecord[tostring(v)] = {}
        if seat.status >= SeatStatusType.PLAYING and not seat.Fold then
            for j = orgcursor, self.cursor - 1 do
                self.decRecord[tostring(v)][tostring(j)] = false
            end
        end
    end

    log.Trace("DealFlopCards, decRecord", json.encode(self.decRecord))

    local jsondealcard = json.encode(seatcardIndex)
    log.Trace("DealFlopCards", jsondealcard)
    local dealcarddata = byteSlice:new()
    dealcarddata:appendString(jsondealcard)
    ge.Send(playingSeats, DealCardMsgCode, dealcarddata)
end

function game_texas:DealTurnCard()
    StopTimer("dealCardTimer")
    log.Trace("DealTurnCard resetTimer", "dealCardTimer", "expired", os.date("%X", os.time() + Timeout_Dealcard / 1000))
    StartTimer("dealCardTimer", Timeout_Dealcard)

    local orgcursor = self.cursor
    local seatcardIndex = {}
    local seatindex = {}
    table.insert(seatindex, self.tableInfo.MaxNum + 1)
    table.insert(seatindex, 0)

    local index = {}
    table.insert(index, self.cursor)
    table.insert(seatindex, index)

    log.Info("DealTurnCard, seatindex", seatindex)
    table.insert(seatcardIndex, seatindex)

    self.cursor = self.cursor + 1
    log.Info("DealTurnCard, set self.cursor", self.cursor)

    self.decRecord = {}
    local playingSeats = self:GetPlayingSeats()
    for i, v in ipairs(playingSeats) do
        local seat = self:GetSeat(v)
        self.decRecord[tostring(v)] = {}
        if seat.status >= SeatStatusType.PLAYING and not seat.Fold then
            for j = orgcursor, self.cursor - 1 do
                self.decRecord[tostring(v)][tostring(j)] = false
            end
        end
    end

    log.Trace("DealTurnCard, decRecord", json.encode(self.decRecord))

    local jsondealcard = json.encode(seatcardIndex)
    log.Trace("DealTurnCard", jsondealcard)
    local dealcarddata = byteSlice:new()
    dealcarddata:appendString(jsondealcard)
    ge.Send(playingSeats, DealCardMsgCode, dealcarddata)
end

function game_texas:DealRiverCard()
    StopTimer("dealCardTimer")
    log.Trace("DealRiverCard resetTimer", "dealCardTimer", "expired", os.date("%X", os.time() + Timeout_Dealcard / 1000))
    StartTimer("dealCardTimer", Timeout_Dealcard)

    local orgcursor = self.cursor
    local seatcardIndex = {}
    local seatindex = {}
    table.insert(seatindex, self.tableInfo.MaxNum + 1)
    table.insert(seatindex, 0)

    local index = {}
    table.insert(index, self.cursor)
    table.insert(seatindex, index)

    log.Info("DealRiverCard, seatindex", seatindex)
    table.insert(seatcardIndex, seatindex)

    self.cursor = self.cursor + 1
    log.Info("DealRiverCard, set self.cursor", self.cursor)

    self.decRecord = {}
    local playingSeats = self:GetPlayingSeats()
    for i, v in ipairs(playingSeats) do
        local seat = self:GetSeat(v)
        self.decRecord[tostring(v)] = {}
        if seat.status >= SeatStatusType.PLAYING and not seat.Fold then
            for j = orgcursor, self.cursor - 1 do
                self.decRecord[tostring(v)][tostring(j)] = false
            end
        end
    end

    log.Trace("DealRiverCard, decRecord", json.encode(self.decRecord))

    local jsondealcard = json.encode(seatcardIndex)
    log.Trace("DealRiverCard", jsondealcard)
    local dealcarddata = byteSlice:new()
    dealcarddata:appendString(jsondealcard)
    ge.Send(playingSeats, DealCardMsgCode, dealcarddata)
end

function game_texas:IsHoleCardsRevealed()
    local playingSeats = self:GetPlayingSeats()
    log.Info("IsHoleCardsRevealed, playingSeats", playingSeats)
    for i, v in ipairs(playingSeats) do
        local seat = self:GetSeat(v)
        log.Trace("IsHoleCardsRevealed seatNum", v, "index", seat.privateIndex, "card", seat.privateCard)
        if #seat.privateCard == 0 then
            return false
        end
    end
    return true
end

function game_texas:RevealHoleCards()
    StopTimer("dealCardTimer")
    log.Trace("RevealHoleCards resetTimer", "dealCardTimer", "expired", os.date("%X", os.time() + Timeout_Dealcard / 1000))
    StartTimer("dealCardTimer", Timeout_Dealcard)

    self.decRecord = {}
    local playingSeats = self:GetPlayingSeats()
    log.Info("RevealHoleCards, playingSeats", playingSeats, "index2card", self.index2card)
    for i, v in ipairs(playingSeats) do
        local needDealCard = true
        local seat = self:GetSeat(v)
        for j, vv in ipairs(seat.privateIndex) do
            if self.index2card[tostring(vv)] ~= nil then
                needDealCard = false
            end
        end

        log.Debug("RevealHoleCards, seat", v, "privateIndex", seat.privateIndex, "needDealCard", needDealCard)
        if needDealCard then
            self.decRecord[tostring(v)] = {}
            local seatcardIndex = {}
            local seatindex = {}
            table.insert(seatindex, v)
            table.insert(seatindex, 1)

            table.insert(seatindex, seat.privateIndex)

            log.Info("RevealHoleCards, seatindex", seatindex)
            table.insert(seatcardIndex, seatindex)

            for j, vv in ipairs(seat.privateIndex) do
                self.decRecord[tostring(v)][tostring(vv)] = false
            end

            local jsondealcard = json.encode(seatcardIndex)
            log.Trace("RevealHoleCards", jsondealcard)
            local dealcarddata = byteSlice:new()
            dealcarddata:appendString(jsondealcard)
            ge.Send({v}, DealCardMsgCode, dealcarddata)
        end
    end

    log.Trace("RevealHoleCards, decRecord", json.encode(self.decRecord))
end

function game_texas:DealRMTCards()
    StopTimer("dealCardTimer")
    log.Trace("DealRMTCards resetTimer", "dealCardTimer", "expired", os.date("%X", os.time() + Timeout_Dealcard / 1000))
    StartTimer("dealCardTimer", Timeout_Dealcard)

    local seat = self:GetSeat(rmt.turnWin)
    log.Debug("DealRMTCards, #seat.publicCard", #seat.publicCard, "seat.publicCard", seat.publicCard)
    local cardcount = (5 - #seat.publicCard) * rmt.rmtTimes
    log.Debug("DealRMTCards, cardcount", cardcount)
    local orgcursor = self.cursor
    local seatcardIndex = {}
    local seatindex = {}
    table.insert(seatindex, self.tableInfo.MaxNum + 1)
    table.insert(seatindex, 0)

    local index = {}
    for i = 0, cardcount - 1 do
        table.insert(index, self.cursor + i)
    end
    table.insert(seatindex, index)

    log.Info("DealRMTCards, seatindex", seatindex)
    table.insert(seatcardIndex, seatindex)

    self.cursor = self.cursor + cardcount
    log.Info("DealRMTCards, set self.cursor", self.cursor)

    self.decRecord = {}
    local playingSeats = self:GetPlayingSeats()
    for i, v in ipairs(playingSeats) do
        local seat = self:GetSeat(v)
        self.decRecord[tostring(v)] = {}
        if seat.status >= SeatStatusType.PLAYING and not seat.Fold then
            for j = orgcursor, self.cursor - 1 do
                self.decRecord[tostring(v)][tostring(j)] = false
            end
        end
    end

    log.Trace("DealRMTCards, decRecord", json.encode(self.decRecord))

    local jsondealcard = json.encode(seatcardIndex)
    log.Trace("DealRMTCards", jsondealcard)
    local dealcarddata = byteSlice:new()
    dealcarddata:appendString(jsondealcard)
    ge.Send(playingSeats, DealCardMsgCode, dealcarddata)
end

function game_texas:IsDealCardComplete()
    log.Trace("IsDealCardComplete", self.decRecord)
    for seat, index in pairs(self.decRecord) do
        log.Trace("IsDealCardComplete, seat", seat, "index", index)
        for i, v in pairs(index) do
            if not v then
                return false
            end
        end
    end
    return true
end

function game_texas:processAllin()
    self.gamestate = self.gamestate + 1
    log.Info("processAllin, set self.gamestate", GameStatusTypeStr[self.gamestate] or self.gamestate)
    if self.gamestate == GameStatusType.DeskState_Flop then
        self:DealFlopCards()
    elseif self.gamestate == GameStatusType.DeskState_Turn then
        self:DealTurnCard()
    elseif self.gamestate == GameStatusType.DeskState_River then
        self:DealRiverCard()
    elseif self.gamestate == GameStatusType.DeskState_ShowDown then
        self:DoGameOver()
    end
    self:ResetTurnBet()
end

function game_texas:processNormalRoutine()
    self.gamestate = self.gamestate + 1
    log.Info("processNormalRoutine, set self.gamestate", GameStatusTypeStr[self.gamestate] or self.gamestate)
    if self.gamestate == GameStatusType.DeskState_Flop then
        self:DealFlopCards()
    elseif self.gamestate == GameStatusType.DeskState_Turn then
        self:DealTurnCard()
    elseif self.gamestate == GameStatusType.DeskState_River then
        self:DealRiverCard()
    elseif self.gamestate == GameStatusType.DeskState_ShowDown then
        self:RevealHoleCards()
    end
    self:ResetTurnBet()
end

function fnDeclareTimeout()
    log.Trace("fnDeclareTimeout() stopTimer", "declareTimer")
    StopTimer("declareTimer")
    gt:processDeclareTimeout()
end

function game_texas:TryStartBetTurn()
    local dealcardComplete = self:IsDealCardComplete()
    if not dealcardComplete then
        return
    end

    log.Trace("TryStartBetTurn() stopTimer", "dealCardTimer")
    StopTimer("dealCardTimer")

    local canActionSeats = self:GetCanActionSeats()
    local playingSeats = self:GetPlayingSeats()
    log.Debug("TryStartBetTurn, canActionSeats", canActionSeats, "playingSeats", playingSeats)
    --剩下能操作的玩家数少于2不外乎两种情况：
    --1. 其他人都弃牌只剩下一个人，剩下的人拿走所有筹码
    --2. 其他人都Allin，需要摊牌后把公共牌发完然后多人比牌结算
    if #canActionSeats < 2 and #playingSeats >= 2 then
        if self.allingamestate == GameStatusType.DeskState_Init then
            self.allingamestate = self.gamestate
            log.Info("TryStartBetTurn, set self.allingamestate", GameStatusTypeStr[self.allingamestate] or self.allingamestate)
        end
        self:NoOpTurnInfo()
        if rmt:canShowRMTOption() then
            rmt:ShowRMTOption()
            return
        end

        ins:tryShowInsWinInfo()
        if ins:canShowInsurance() then
            ins:ShowInsurance()
            return
        end
        self:processAllin()
        return
    end

    StopTimer("declareTimer")
    log.Trace("TryStartBetTurn resetTimer", "declareTimer", "expired", os.date("%X", os.time() + Timeout_Declare / 1000))
    StartTimer("declareTimer", Timeout_Declare)
    self.turnoperated = false

    log.Info("TryStartBetTurn, self.gamestate", GameStatusTypeStr[self.gamestate] or self.gamestate)
    if self.gamestate == GameStatusType.DeskState_Preflop then
        if self.gameInfo.StraddlePos == nil then
            --preflop轮，没有straddle，大盲后面的第一个玩家先下注，中途无加注的情况下最后说话为大盲位
            local turn = self:NextSeatID(self.gameInfo.DealCardSequence, self.gameInfo.BigBlindPos)
            self.curnTurn = turn
            self.firstTurn = turn
            self.lastTurn = self.gameInfo.BigBlindPos
            log.Trace("set(Preflop StraddlePos == nil) self.curnTurn", self.curnTurn, "self.firstTurn", self.firstTurn, "self.lastTurn", self.lastTurn)
        else
            --preflop轮，有straddle，straddle后面的第一个玩家先下注，中途无加注的情况下最后说话为Straddle位
            local turn = self:NextSeatID(self.gameInfo.DealCardSequence, self.gameInfo.StraddlePos)
            self.curnTurn = turn
            self.firstTurn = turn
            self.lastTurn = self.gameInfo.StraddlePos
            log.Trace(string.format("set(Preflop StraddlePos == %d) self.curnTurn", self.gameInfo.StraddlePos), self.curnTurn, "self.firstTurn", self.firstTurn, "self.lastTurn", self.lastTurn)
        end
    elseif self.gamestate == GameStatusType.DeskState_Flop or self.gamestate == GameStatusType.DeskState_Turn or self.gamestate == GameStatusType.DeskState_River then
        --flop/turn/river轮庄家后面第一位玩家先说话，中途无加注的情况下最后说话为庄家位
        local turn = self:ActionSeatID()
        self.curnTurn = turn
        local last = self:LastActionSeatID(turn)
        self.lastTurn = last
        log.Trace("set(Flop/Turn/River) self.curnTurn", self.curnTurn, "self.lastTurn", self.lastTurn)
    else
        log.Warn("no Default", "")
    end

    local tinfo = self:PrintTurn(self.curnTurn)
    self.record:addTurnInfo(tinfo)
    self:TrySendGameReplay()

    log.Trace("TryStartBetTurn", "SaveState")
    SaveState()
end

function game_texas:TryDeclareNextSeat(seat)
    log.Debug("TryDeclareNextSeat, seat", seat, "self.lastTurn", self.lastTurn)
    if declareTimer ~= nil then
        log.Trace("TryDeclareNextSeat() stopTimer", "declareTimer")
        StopTimer("declareTimer")
    end

    --这一轮说话已结束
    if seat == self.lastTurn then
        self:NoOpTurnInfo()
        local canActionSeats = self:GetCanActionSeats()
        local playingSeats = self:GetPlayingSeats()
        log.Debug("TryDeclareNextSeat, canActionSeats", canActionSeats, "playingSeats", playingSeats)
        --剩下能操作的玩家数少于2不外乎两种情况：
        --1. 其他人都弃牌只剩下一个人，剩下的人拿走所有筹码
        --2. 其他人都Allin，需要摊牌后把公共牌发完然后多人比牌结算
        if #canActionSeats < 2 then
            if #playingSeats < 2 then
                self:DoGameOver()
                return
            else
                self:RevealHoleCards()
                self:SidepotRound()
                for i,v in ipairs(self.seats) do
                    if v.status >= SeatStatusType.PLAYING then
                        v.turnbet = 0
                    end
                end
                self.maxTurnBet = 0
                return
            end
        end

        self:processNormalRoutine()
        return
    end

    StopTimer("dealCardTimer")
    StopTimer("declareTimer")
    log.Trace("TryDeclareNextSeat resetTimer", "declareTimer", "expired", os.date("%X", os.time() + Timeout_Declare / 1000))
    StartTimer("declareTimer", Timeout_Declare)

    self.curnTurn = self:NextActionSeatID(seat)
    local tinfo = self:PrintTurn(self.curnTurn)
    self.record:addTurnInfo(tinfo)
    self:TrySendGameReplay()

    log.Trace("TryDeclareNextSeat", "SaveState")
    SaveState()
end

function game_texas:processDealcardTimeout()
    log.Debug("processDealcardTimeout, decRecord", self.decRecord)
    self.timeoutType = "dealcardTimeout"
    for seat, index in pairs(self.decRecord) do
        log.Trace("processDealcardTimeout, seat", seat, "index", index)
        local timeoutSeat = -1
        for i, v in pairs(index) do
            if not v then
                timeoutSeat = tonumber(seat)
            end
        end
        if timeoutSeat ~= -1 then
            self:processTimeoutSeat(timeoutSeat)
        end
    end
end

function game_texas:processDeclareTimeout()
    log.Trace("processDeclareTimeout", self.curnTurn)
    self.timeoutType = "declareTimeout"
    if self.curnTurn ~= -1 then
        self:processTimeoutSeat(self.curnTurn)
    end
end

function game_texas:SendGetBackupDecKeys()
    if backupSeatSequence == nil then
        backupSeatSequence = {}
        for i, v in ipairs(self.gameInfo.DealCardSequence) do
            local seat = self:GetSeat(v)
            if not seat.Fold and not isItemExist(self.timeoutSeatIDs, v) then
                table.insert(backupSeatSequence, v)
            end
        end

        log.Info("SendGetBackupDecKeys, new backupSeatSequence", backupSeatSequence)
    end

    log.Trace("SendGetBackupDecKeys, backupSeatSequence", backupSeatSequence)
    if #backupSeatSequence == 0 then
        log.Trace("SendGetBackupDecKeys stopTimer", "getBackupKeyCardTimer")
        StopTimer("getBackupKeyCardTimer")
        --无法获取备份牌点密钥解出牌点，只能解散
        rCtr:dismissTable()
        gt:gameStateUninit()
        return
    end

    local backupSeatID = backupSeatSequence[1]
    table.remove(backupSeatSequence, 1)
    self.decRecordBeforeGetBackup = clone(self.decRecord)
    log.Trace("SendGetBackupDecKeys self.timeoutSeatIDs", self.timeoutSeatIDs, "backupSeatID", backupSeatID, "backupSeatSequence", backupSeatSequence, "self.decRecordBeforeGetBackup", self.decRecordBeforeGetBackup)
    for i, v in ipairs(self.timeoutSeatIDs) do
        ge.SendBackupReq(v, backupSeatID)
    end
end

function fnGetBackupKeyCardTimeout()
    log.Trace("fnGetBackupKeyCardTimeout() stopTimer", "getBackupKeyCardTimer")
    StopTimer("getBackupKeyCardTimer")
    log.Trace("fnGetBackupKeyCardTimeout resetTimer", "getBackupKeyCardTimer", "expired", os.date("%X", os.time() + Timeout_GetBackupKeyCard / 1000))
    StartTimer("getBackupKeyCardTimer", Timeout_GetBackupKeyCard)
    gt:SendGetBackupDecKeys()
end

function game_texas:processTimeoutSeat(seatID)
    local seat = self:GetSeat(seatID)
    if self.timeoutType == "declareTimeout" then
        seat.Fold = true
        self.decRecord[tostring(seatID)] = {}
        for i = self.cursor, 51 do
            self.decRecord[tostring(seatID)][tostring(i)] = false
        end
    end
    local canActionSeats = self:GetCanActionSeats()
    local playingSeats = self:GetPlayingSeats()
    local isShowdownOffline = false
    if #canActionSeats < 2 then
        if #playingSeats >= 2 then
            isShowdownOffline = true
        else
            self:DoGameOver()
            return
        end
    end
    log.Debug("processTimeoutSeat, canActionSeats", canActionSeats, "playingSeats", playingSeats, "isShowdownOffline", isShowdownOffline)
    table.insert(self.timeoutSeatIDs, seatID)
    if not isShowdownOffline then
        local tx = rCtr.tc.Transact("playerTimeout", seat.ad)
        log.Trace("processTimeoutSeat tx", tx)
    else
        local rmtinsTimeoutStruct = {}
        table.insert(rmtinsTimeoutStruct, rmt.rmtTimes)
        table.insert(rmtinsTimeoutStruct, ins.buyer["4"])
        table.insert(rmtinsTimeoutStruct, ins.outsNum["4"][1])
        table.insert(rmtinsTimeoutStruct, ins.outsNum["4"][2])
        table.insert(rmtinsTimeoutStruct, ins.amount["4"][1])
        table.insert(rmtinsTimeoutStruct, ins.amount["4"][2])
        table.insert(rmtinsTimeoutStruct, ins.buyer["5"])
        table.insert(rmtinsTimeoutStruct, ins.outsNum["5"][1])
        table.insert(rmtinsTimeoutStruct, ins.outsNum["5"][2])
        table.insert(rmtinsTimeoutStruct, ins.amount["5"][1])
        table.insert(rmtinsTimeoutStruct, ins.amount["5"][2])
        local rlpdata, err = rlp.Encode(rmtinsTimeoutStruct)
        if err ~= nil then
            error("RlpEncode err:"..err)
        end
        local tx = rCtr.tc.Transact("rmtinsTimeout", seat.ad, rlpdata)
        log.Trace("processTimeoutSeat tx", tx)
    end

    log.Trace("processTimeoutSeat resetTimer", "getBackupKeyCardTimer", "expired", os.date("%X", os.time() + Timeout_GetBackupKeyCard / 1000))
    StartTimer("getBackupKeyCardTimer", Timeout_GetBackupKeyCard)

    backupSeatSequence = nil
    self:SendGetBackupDecKeys()

    log.Trace("processTimeoutSeat", "SaveState")
    SaveState()
end

function game_texas:SyncGameReplays(seatId)
    local gamereplaysdata = byteSlice:new()
    local gamereplaysStruct = {}
    gamereplaysStruct["BlindInfo"] = self:GetBlindInfo()
    gamereplaysStruct["GameReplays"] = clone(self.record:GetGameReplays())
    if #gamereplaysStruct["GameReplays"] > 0 then
        gamereplaysStruct["GameReplays"][#gamereplaysStruct["GameReplays"]]["CurTick"] = os.time()
    end
    local jsongamereplays = json.encode(gamereplaysStruct)
    log.Trace("SyncGameReplays", jsongamereplays)
    gamereplaysdata:appendString(jsongamereplays)
    ge.Send({seatId}, SyncGameReplaysRespMsgCode, gamereplaysdata)
end


function game_texas:getSeatIDByAddr(addr)
    for i, v in ipairs(self.seats) do
        if v.ad == addr then
            return v.id
        end
    end

    return -1
end

function game_texas:GetSeat(seat)
    for i,v in ipairs(self.seats) do
        log.Trace("seatid", v.id, "addr", v.ad, "status", v.status)
        if v.id == seat then
            return v
        end
    end

    return nil 
end

function game_texas:SidepotRound()
    local a = {} 
    for i, v in ipairs(self.seats) do
        v.sidepot = 0
        if v.Fold == false then
            for j, jv in ipairs(self.seats) do
                if v.totalbet > jv.totalbet then
                    v.sidepot = v.sidepot + jv.totalbet
                else 
                    v.sidepot = v.sidepot + v.totalbet
                end
            end
        end
    end

    --消除相同的下注额
    for i, v in ipairs(self.seats) do
        if v.sidepot ~= 0 then
            local flag = false
            for ia, va in ipairs(a) do
                if v.sidepot == va then
                    flag = true
                    break
                end
            end

            if flag == false then
                table.insert(a, v.sidepot)
            end
        end
    end
    --排序
    table.sort(a, function(a, b) return a < b end)

    --算主池，边池
    self.sidepot = {} 
    for i, v in ipairs(a) do
        if i == 1 then
            table.insert(self.sidepot, v)
        else
            table.insert(self.sidepot, a[i] - a[i-1])
        end
    end
end

function game_texas:ResetTurnBet()
    self:SidepotRound()
    for i,v in ipairs(self.seats) do
        if v.status >= SeatStatusType.PLAYING then
            v.turnbet = 0
        end
    end
    self.maxTurnBet = 0
    
    self.turnoperated = false
    log.Trace(string.format("%s ResetTurnBet, set self.turnoperated", GameStatusTypeStr[self.gamestate] or self.gamestate), self.turnoperated)
    self.TurnThroughCount = 1
    log.Trace("ResetTurnBet self.TurnThroughCount",self.TurnThroughCount)
end

function game_texas:RemainPlayers()
    local seats = {}

    for i, v in ipairs(self.seats) do
        if (v.status == SeatStatusType.PLAYING or v.status == SeatStatusType.NEXTLEAVE) and not(v.Fold) then --当局在玩的
            table.insert(seats, v.id)
        end
    end

    return seats
end

function game_texas:GetNoOpTurnInfo(curnTurn)
    local uiinfo = {}
    uiinfo.TableId = TableID
    uiinfo.Hand = self.gameInfo.CurrentHand
    uiinfo.Stage = self.gamestate
    uiinfo.PlayerInfo = {}
    for i, v in ipairs(self.sidepot) do
        if i == 1 then
            log.Trace("GetNoOpTurnInfo, Pot", v)
        else 
            log.Trace("GetNoOpTurnInfo, SidePot " .. tostring(i-1), tostring(v))
        end
    end

    log.Trace("GetNoOpTurnInfo, last Turn", self.lastTurn)
    local plinfo = {} 
    local validminseat = self.tableInfo.MaxNum
    for i, v in ipairs(self.seats) do
        if v.status >= SeatStatusType.PLAYING then
            log.Trace("Seat", v.id, "TurnBet", v.turnbet, "TurnmaxBet", self.maxTurnBet, "TotalBet", v.totalbet, "Balance", v.balance)
            local item = {
                ID = v.id,
                TurnBet = v.turnbet,
                TotalBet = v.totalbet,
                Balance = v.balance,
                Fold = v.Fold,
                Allin = v.Allin,

                HandCard = tx.GetPokerStringTable(tx.MapCards(v.privateCard)),
                HoleCards = v.privateCard,
                PlayerAddr = v.ad,
            } 
            if self.gamestate == GameStatusType.DeskState_Preflop then
                item.TurnBet = item.TurnBet - self.tableInfo.Ante
            end
            self:generateOperate(curnTurn, item)
            plinfo[tostring(v.id)] = item
            if v.id < validminseat then
                validminseat = v.id
            end
        end
    end
    for i, v in ipairs(self.seats) do
        if v.status >= SeatStatusType.PLAYING then
            v.action = plinfo[tostring(v.id)].Operate
            v.lasttotalbet = plinfo[tostring(v.id)].TotalBet
        end
    end
    uiinfo.PlayerInfo = plinfo

    local seat = self:GetSeat(validminseat)
    uiinfo.DeskCard = tx.GetPokerStringTable(tx.MapCards(seat.publicCard))
    log.Trace("Card on Desk", json.encode(uiinfo.DeskCard))
    uiinfo.CommunityCards = seat.publicCard

    log.Debug("seat.rmtCard", seat.rmtCard)
    log.Debug("#seat.rmtCard", #seat.rmtCard)
    if #seat.rmtCard > 0 then
        uiinfo.RmtCard = {}
        for i, v in ipairs(seat.rmtCard) do
            log.Debug("rmtCard v", v)
            if v ~= nil and #v > 0 then
                table.insert(uiinfo.RmtCard, tx.GetPokerStringTable(tx.MapCards(v)))
            end
        end
        log.Trace("uiinfo.RmtCard", json.encode(uiinfo.RmtCard))
    end

    uiinfo.CurnSeat = curnTurn
   
    if #self.sidepot > 0 then
        uiinfo.Pots = self.sidepot
    end

    log.Trace("uiinfo", uiinfo)
    return uiinfo
end

function game_texas:NoOpTurnInfo()
    local uiinfo = self:GetNoOpTurnInfo(-1)
    self.record:addTurnInfo(uiinfo)
    self:TrySendGameReplay()
    self.lastAction = self.curnTurn
    log.Trace("set self.lastAction", self.lastAction)
    log.Trace("NoOpTurnInfo", "SaveState")
    SaveState()
end

function game_texas:DoGameOver()
    log.Trace("GameOver Start...", "")

    if self.gamestate ~= GameStatusType.DeskState_ShowDown then
        self:ResetTurnBet()
        self:NoOpTurnInfo()
    end

    local playingSeats = self:GetPlayingSeats()
    log.Debug("GameOver, playingSeats", playingSeats)
    if #playingSeats == 0 then
        log.Error("GameOver", "invalid playingSeats")
        rCtr:dismissTable()
        gt:gameStateUninit()
        return
    end

    self.gamestate = GameStatusType.DeskState_ShowDown
    log.Info("DoGameOver, set self.gamestate", GameStatusTypeStr[self.gamestate] or self.gamestate)
    if #playingSeats == 1 then
        self:OneRemainSettle(playingSeats[1])
        return
    end

    if not self:IsHoleCardsRevealed() then
        self:RevealHoleCards()
        --收到摊牌结果后再结算
    else
        self:TryMultiRemainSettle()
    end
end

function game_texas:OneRemainSettle(remainId)
    local allocinfo = {}
    local seats ={}
    local totalBet = 0
    log.Trace("OneRemainSettle, self.seats", self.seats)
    for i, v in ipairs(self.gameInfo.DealCardSequence) do
        local seat = self:GetSeat(v)
        local item = GenSeat.new(seat.totalbet, seat.Fold, seat.id, seat.sidepot)
        totalBet = totalBet + seat.totalbet

        item.balance = seat.balance
        item.privateCardStr = tx.GetPokerStringTable(tx.MapCards(seat.privateCard))
        item.publicCardStr = tx.GetPokerStringTable(tx.MapCards(seat.publicCard))
        item.privateCard = seat.privateCard
        table.insert(seats, item)
    end

    log.Trace("OneRemainSettle() Winner is Seat", remainId, "Win", totalBet)

    for i, v in ipairs(self.sidepot) do
        local allocinfoItem = {
            PotValue = v,
            Allot = {},
        }

        local aitem = {
            Seat = remainId,
            Win = v,
        }
        table.insert(allocinfoItem.Allot, aitem)

        table.insert(allocinfo, allocinfoItem)
    end

    self.potallot = allocinfo
    local pastr = json.encode(allocinfo)
    log.Trace("++++++++++++PotAlloc", pastr)

    for i, v in ipairs(seats) do
        if v.Seat == remainId then
            v.won = totalBet - v.Bet
        else
            v.won = v.won - v.Bet
        end
        v.balance = v.balance + v.Bet + v.won
    end

    local fn = function(a, b)
        return a.Seat < b.Seat
    end
    table.sort(seats, fn)

    log.Info("set self.settleSeats", "seats")
    --self.settleSeats = seats
    self:SubmitSettle(seats)
    self:GameOverToUI(seats)
    log.Info("OneRemainSettle", seats)
end

function game_texas:TryMultiRemainSettle()
    local dealcardComplete = self:IsDealCardComplete()
    if not dealcardComplete then
        return
    end

    log.Trace("TryMultiRemainSettle() stopTimer", "dealCardTimer")
    StopTimer("dealCardTimer")

    log.Trace("TryMultiRemainSettle Start ========, playingSeats", self:GetPlayingSeats(), "seats", self.seats)
    self:Settle()
end

--剩余多人结算，要比牌
function game_texas:Settle()
    local combineSeats = {}
    log.Debug("Settle() rmt.rmtTimes", rmt.rmtTimes)
    for k = 1, rmt.rmtTimes do
        local seats = {}
        log.Info("#self.seats", #self.seats, "SeatStatusType.OFFLINE", SeatStatusType.OFFLINE, "SeatStatusType.SHOWDOWNOFFLINE", SeatStatusType.SHOWDOWNOFFLINE)
        for i, v in ipairs(self.seats) do
            if v.status == SeatStatusType.PLAYING then
                log.Info("v.totalbet", v.totalbet, "Fold", v.Fold, "id", v.id, "sidepot", v.sidepot, "balance", v.balance)
                
                local bet = math.ceil(v.totalbet / rmt.rmtTimes)
                local sidepot = math.ceil(v.sidepot / rmt.rmtTimes)
                local balance = math.ceil(v.balance / rmt.rmtTimes)
                if rmt.rmtTimes > 1 and k == rmt.rmtTimes then
                    bet = v.totalbet - bet * (rmt.rmtTimes - 1)
                    sidepot = v.sidepot - sidepot * (rmt.rmtTimes - 1)
                    balance = v.balance - balance * (rmt.rmtTimes - 1)
                end
                local item = GenSeat.new(bet, v.Fold, v.id, sidepot)
                
                item.balance = balance
                item.privateCardStr = tx.GetPokerStringTable(tx.MapCards(v.privateCard))
                item.privateCard = v.privateCard
                log.Debug("v.publicCard", v.publicCard, "v.privateCard", v.privateCard, "#v.rmtCard", #v.rmtCard)
                --local publiccards = v.publicCard --不能这样赋值，会改变v.publicCard
                local publiccards = {}
                for vi, vc in ipairs(v.publicCard) do
                    table.insert(publiccards, vc)
                end
                if #v.rmtCard > 0 then
                    for vi, vc in ipairs(v.rmtCard[k]) do
                        table.insert(publiccards, vc)
                    end
                end
                log.Debug("publiccards", publiccards)
                if #v.publicCard > 0 then
                    item.publicCardStr = tx.GetPokerStringTable(tx.MapCards(v.publicCard))
                else
                    item.publicCardStr = {}
                end

                local tm = {}
                --table.insert(tm, v.publicCard)
                table.insert(tm, publiccards)
                table.insert(tm, v.privateCard)

                --分批合并比较
                item.Cards = tx.Merge(tm)

                item:GenCards()
                table.insert(seats, item)
            else
                log.Info("v.totalbet", v.totalbet, "Fold", v.Fold, "id", v.id, "sidepot", v.sidepot, "status", SeatStatusTypeStr[v.status], "balance", v.balance)
            end
        end

        self:SettleImpl(seats, (rmt.rmtTimes>1 and k==rmt.rmtTimes))
        if #combineSeats == 0 then
            combineSeats = seats
        else
            for n = 1, #combineSeats do
                for i = 1, #seats do
                    if combineSeats[n].Seat == seats[i].Seat then
                        log.Debug("n", n, "combineSeats[n]", combineSeats[n])
                        log.Debug("combineSeats[n].rmtGenCards", combineSeats[n].rmtGenCards)
                    
                        if combineSeats[n].rmtGenCards == nil then
                            combineSeats[n].rmtwon = {}
                            table.insert(combineSeats[n].rmtwon, combineSeats[n].won)--把第一项补上

                            combineSeats[n].rmtGenCards = {}
                            combineSeats[n].rmtlevel = {}
                            combineSeats[n].rmtlevelname = {}
                        end
                        combineSeats[n].won = combineSeats[n].won + seats[i].won
                        combineSeats[n].balance = combineSeats[n].balance + seats[i].balance
                        table.insert(combineSeats[n].rmtwon, seats[i].won) --won比较特殊
                        
                        table.insert(combineSeats[n].rmtGenCards, seats[i].genStr)
                        table.insert(combineSeats[n].rmtlevel, seats[i].level)
                        table.insert(combineSeats[n].rmtlevelname, seats[i].levelname)

                        break
                    end
                end
            end
        end
    end
    log.Info("set self.settleSeats", "combineSeats")
    --self.settleSeats = combineSeats
    self:SubmitSettle(combineSeats)
    self:GameOverToUI(combineSeats)
    log.Info("Settled", combineSeats)
end

function game_texas:SettleImpl(seats, bLast)
    local seatSortFun = function (a, b)
        local result
        if (a.templevel == b.templevel) then
            local ncmpresult = tx.compareInLevel(a.gen, b.gen, a.templevel)
            result = (ncmpresult >= 0)
        else 
            result = (a.templevel > b.templevel)
        end

        return result
    end

    local EqualMaxFun = function (maxseat, cmpseat)
        local flag = true
        if maxseat.templevel == cmpseat.templevel then
            for i = 1, #maxseat.gen do
                if maxseat.gen[i].num ~= cmpseat.gen[i].num then
                    flag = false
                    break
                end
            end
        else 
            flag =false 
        end

        return flag
    end

    local allocinfo = {} 
    for i, v in ipairs(self.sidepot) do
        log.Debug("SettleImpl() self.sidepot v", v)
        local vpot = math.ceil(v/rmt.rmtTimes)
        if bLast then
            vpot = v - vpot*(rmt.rmtTimes-1)
        end
        local allocinfoItem = {
            PotValue = vpot,
            Allot = {},
        }

        table.sort(seats, seatSortFun)
        local win = {} 
        for si, sv in ipairs(seats) do
            if sv.Fold == false and true == EqualMaxFun(seats[1], sv) then
                log.Debug("insert win, sv", sv.Seat)
                table.insert(win, sv)
            end
        end

        local t = math.fmod(vpot, #win)

        for wi, wv in ipairs(win) do
            local w = math.modf((vpot-t) / #win)
            wv.won = wv.won + w
            
            local aitem = {
                Seat = wv.Seat,
                Win = w,
            } 
            log.Debug("insert allocinfoItem, win", wv.Seat)
            table.insert(allocinfoItem.Allot, aitem)
        end

        for i = 1, t do
            allocinfoItem.Allot[i].Win = allocinfoItem.Allot[i].Win + 1
            win[i].won = win[i].won + 1
        end

        for si, sv in ipairs(seats) do
            if sv.sidepot ~= 0 then
                sv.sidepot = sv.sidepot - vpot
            end

            if sv.sidepot == 0 then
                sv.templevel = -1
            end
        end
        
        table.insert(allocinfo, allocinfoItem)
    end

    if #self.potallot == 0 then --如果potallot还没赋值
        self.potallot = allocinfo
    else
        table.insert(self.rmtpotallot, allocinfo)
    end

    for i, v in ipairs(seats) do
        log.Trace("+++before Seat", v.Seat, "Bet", v.Bet, "Won", v.won, "tplevel", v.templevel, "balance", v.balance)
    end

    for i, v in ipairs(seats) do
        v.won = v.won - v.Bet
        v.balance = v.balance + v.Bet + v.won
    end

    for i, v in ipairs(seats) do
        log.Trace("---after Seat", v.Seat, "Bet", v.Bet, "Won", v.won, "balance", v.balance)
    end

    local pastr = json.encode(allocinfo)
    log.Trace("++++++++++++PotAlloc", pastr)
end 

function game_texas:SubmitSettle(gs)
    local GameSettleData = {}
    table.insert(GameSettleData, RoomManagerAddr)
    table.insert(GameSettleData, TableID)
    table.insert(GameSettleData, self.gameInfo.CurrentHand)

    local list = {}
    for i, v in ipairs(gs) do
        local gbd = {}
        if v.won > 0 then
            table.insert(gbd, v.Seat)
            table.insert(gbd, 1)
            table.insert(gbd, v.won)
        else
            table.insert(gbd, v.Seat)
            table.insert(gbd, 0)
            table.insert(gbd, -v.won)
        end
        table.insert(list, gbd)
    end

    table.insert(GameSettleData , list)
    if BitAnd(self.tableInfo.TableProps, TableProps_INS) ~= 0 or BitAnd(self.tableInfo.TableProps, TableProps_CINS) ~= 0 then
        table.insert(GameSettleData, ins.insresult)
    end

    local gsdstr = json.encode(GameSettleData)
    log.Trace("SubmitSettle, jsonSettleData", gsdstr)

    local settleData, err = rlp.Encode(GameSettleData)
    if err ~= nil then
        error("RlpEncode err: " .. err)
    end

    log.Debug("SubmitSettle, TableID", TableID, "RoomManagerAddr", RoomManagerAddr)
    local tx = rCtr:submitSettle(settleData)
    log.Debug("SubmitSettle, submitNotary tx", tx)
end

function game_texas:rakeRate()
    log.Trace("CalcRakeNum, tableInfo", self.tableInfo)
    if TableID > 0xe000000000000 and TableID < 0xf000000000001 or BitAnd(self.tableInfo.TableProps, TableProps_TOKEN) ~= 0 then
        return self.tableInfo.RakeRate
    end

    return 0
end

function game_texas:CalcRakeNum(playerInfo)
    log.Trace("CalcRakeNum, before playerInfo", playerInfo)
    local rakerate = self:rakeRate()
    if rakerate <= 0 then
        return
    end

    if #playerInfo.Win == 1 and playerInfo.Win[1] > 0 then
        local rakeNum = math.floor(rakerate * playerInfo.Win[1] / 100)
        log.Trace("CalcRakeNum, #1, rakeNum", rakeNum)
        if rakeNum > 0 then
            playerInfo.Win[1] = playerInfo.Win[1] - rakeNum
            playerInfo.Balance = playerInfo.Balance - rakeNum
        end
    elseif #playerInfo.Win > 0 then
        local totalWin = 0
        local totalWinTimes = 0
        for i = 1, #playerInfo.Win do
            if playerInfo.Win[i] > 0 then
                totalWin = totalWin + playerInfo.Win[i]
                totalWinTimes = totalWinTimes + 1
            end
        end
        local rakeNum = math.floor(rakerate * totalWin / 100)
        log.Trace("CalcRakeNum, totalWin", totalWin, "totalWinTimes", totalWinTimes, "rakeNum", rakeNum)
        local winTimes = 0
        if rakeNum > 0 then
            playerInfo.Balance = playerInfo.Balance - rakeNum
            for i = 1, #playerInfo.Win do
                if playerInfo.Win[i] > 0 then
                    local rakeSubNum = math.floor(rakerate * playerInfo.Win[i] / 100)
                    log.Trace("CalcRakeNum, rakeSubNum", rakeSubNum, "playerInfo.Win[i]", playerInfo.Win[i])
                    if winTimes == totalWinTimes - 1 then
                        playerInfo.Win[i] = playerInfo.Win[i] - rakeNum
                    elseif rakeSubNum > 0 then
                        playerInfo.Win[i] = playerInfo.Win[i] - rakeSubNum
                        rakeNum = rakeNum - rakeSubNum
                    end
                    winTimes = winTimes + 1
                end
            end
        end
    end
    log.Trace("CalcRakeNum, after playerInfo", playerInfo)
end

function game_texas:GameOverToUI(settleSeats)
    local settleInfo = {PlayerInfo = {}}
    settleInfo.Hand = self.gameInfo.CurrentHand
    settleInfo.TableId = TableID
    for i, v in ipairs(settleSeats) do
        log.Trace("GameOverToUI, i", i, "v", v)
        local item  = {
            Id = v.Seat,
            Fold = v.Fold,
            Win = {v.won},
            Balance = v.balance,

            Level = {v.level},
            LevelName = {v.levelname},
            GenCards = {v.genStr},

            HandCard = v.privateCardStr,
            HoleCards = v.privateCard,
        }
        log.Debug("v.Seat", v.Seat, "ins.buyer[4]", ins.buyer["4"], "ins.buyer[5]", ins.buyer["5"])
        if ins.receiveInsEvent then
            if v.Seat == ins.buyer["4"] and ins.insWin["4"] ~= nil then
                log.Debug("ins.insWin[4]", ins.insWin["4"])
                item.Balance = item.Balance + ins.insWin["4"][1] + ins.insWin["4"][2]
            end
            if v.Seat == ins.buyer["5"] and ins.insWin["5"] ~= nil then
                log.Debug("ins.insWin[5]", ins.insWin["5"])
                item.Balance = item.Balance + ins.insWin["5"][1] + ins.insWin["5"][2]
            end
        end
        if v.rmtwon ~= nil and #v.rmtwon > 0 then --多牌
            item.Win = v.rmtwon
            for i, v in ipairs(v.rmtlevel) do
                table.insert(item.Level, v)
            end
            for i, v in ipairs(v.rmtlevelname) do
                table.insert(item.LevelName, v)
            end
            for i, v in ipairs(v.rmtGenCards) do
                table.insert(item.GenCards, v)
            end
        end
        if settleInfo.DeskCard == nil then
            settleInfo.DeskCard = v.publicCardStr
        end

        settleInfo.PlayerInfo[tostring(v.Seat)] = item

        --计算佣金
        self:CalcRakeNum(settleInfo.PlayerInfo[tostring(v.Seat)])
    end

    if ins:IsINSTable() then
        settleInfo.InsWinList = ins.insWin
        settleInfo.InsBuyerList = ins.buyer
        log.Debug("ins.insWin", ins.insWin)
    end

    settleInfo.PotAllot = {self.potallot}
    for n = 1, rmt.rmtTimes-1 do
        table.insert(settleInfo.PotAllot, self.rmtpotallot[n])
    end
    
    settleInfo.RmtPotAlloc = self.rmtpotallot
    if rmt.rmtTimes > 1 then
        self.timeoutRmtAni = 1500*rmt.rmtTimes
        settleInfo.PotAllot = {self.potallot}
        for n = 1, rmt.rmtTimes-1 do
            table.insert(settleInfo.PotAllot, self.rmtpotallot[n])
        end
    end

    self.record:addGameOver(settleInfo)
    self:TrySendGameReplay()
    log.Trace("GameOverToUI", "SaveState")
    SaveState()

    local replay = self.record:GetGameReplays()
    log.Debug("GameOverToUI() replay", replay)
end

--None/Standby/Waiting/Blind/Straddle/Bet/Check/Call/Raise/Fold/Allin
function game_texas:generateOperate(curnTurn, v)
    --显示上个Action玩家的操作算法：
    --1. 除了Preflop轮在大小盲初始化以外，Flop、Turn、River在NoOpTurnInfo中赋为None值作为新一轮开始
    --2. 若玩家已弃牌或Allin则不会有其他操作，待计算的只有跟注、下注、加注、看牌四种情况
    --3. 当前说话玩家为CurnTurn时赋为None，否则会出现Check/Call/Bet/Raise之后后面的人加注，再轮到此玩家时头上还显示Check/Call/Bet/Raise，就不清楚该玩家这轮做了啥操作
    --4. self.lastAction记录了上个Action玩家（包括玩家自己）的座位号，这次totalbet和上次totalbet相比没变化，则Check看牌
    --   这一轮没有玩家下注，第一个下注的显示Bet，例如Flop轮第一个人Check，后面的人加注，则显示为Bet
    --   这次totalbet比上次totalbet增加，但没超过当前轮的maxturnbet，则Call跟注
    --   这次totalbet比上次totalbet增加，且超过当前轮的maxturnbet，则Raise加注
    log.Debug("generateOperate() self.gamestate", GameStatusTypeStr[self.gamestate] or self.gamestate, "self.turnoperated", self.turnoperated, "self.lastAction", self.lastAction, "curnTurn", curnTurn, "v", v)
    local seat = self:GetSeat(v.ID)
    if v.Fold then
        v.Operate = PlayerOp.Fold
    elseif v.Allin then
        v.Operate = PlayerOp.Allin
    elseif not self.turnoperated then
        if self.gamestate == GameStatusType.DeskState_Preflop then
            --计算补盲
            log.Debug("generateOperate() v.ID", v.ID, "SmallBlindPos", self.gameInfo.SmallBlindPos, "BigBlindPos", self.gameInfo.BigBlindPos)
            if v.ID ~= self.gameInfo.SmallBlindPos and v.ID ~= self.gameInfo.BigBlindPos then
                log.Debug("generateOperate() seat.blindBet", seat.blindBet)
                if seat.blindBet > 0 then
                    if self.gameInfo.StraddlePos ~= nil then
                        v.Operate = PlayerOp.Straddle
                    else
                        v.Operate = PlayerOp.BuStraddle
                    end
                end
            end
        end
        log.Debug("generateOperate() v.Operate", PlayerOpStr[v.Operate])
        if v.Operate == nil then
            v.Operate = PlayerOp.None --刚发完牌，还没有人操作
        end
    elseif curnTurn == v.ID then   --轮到谁说话，该操作者之前的操作隐藏掉
        v.Operate = PlayerOp.None
    elseif self.lastAction == v.ID then
        local maxTotalBet = 0
        local noOneBet = true
        for ii, vv in ipairs(self.seats) do
            if vv.lasttotalbet > maxTotalBet then
                maxTotalBet = vv.lasttotalbet
            end
            if vv.action == PlayerOp.Bet or vv.action == PlayerOp.Call or vv.action == PlayerOp.Raise then
                noOneBet = false
            end
        end
        log.Trace("generateOperate() noOneBet", noOneBet, "maxTotalBet", maxTotalBet, "seat.lasttotalbet", seat.lasttotalbet)
        if v.TotalBet > maxTotalBet and noOneBet then
            v.Operate = PlayerOp.Bet
        elseif v.TotalBet == seat.lasttotalbet then
            v.Operate = PlayerOp.Check
        elseif v.TotalBet > seat.lasttotalbet and v.TotalBet <= maxTotalBet then
            v.Operate = PlayerOp.Call
        else
            v.Operate = PlayerOp.Raise
        end
    else    --其他人维持本轮之前显示
        v.Operate = seat.action
    end
    log.Info("generateOperate() v.ID", v.ID, "v.Operate", PlayerOpStr[v.Operate])
end

function game_texas:PrintTurn(tseat)
    local tnseat = self:GetSeat(tseat)
    local uiinfo = {}
    uiinfo.TableId = TableID
    uiinfo.Hand = self.gameInfo.CurrentHand
    uiinfo.Stage = self.gamestate
    uiinfo.PlayerInfo = {}
    if tnseat ~= nil then
        local plinfo = {}
        for i, v in ipairs(self.seats) do
            if v.status >= SeatStatusType.PLAYING then
                local item = {
                    ID = v.id,
                    TurnBet = v.turnbet,
                    TotalBet = v.totalbet,
                    Balance = v.balance,
                    Fold = v.Fold,
                    Allin = v.Allin,

                    HoleCards = v.privateCard,
                    PlayerAddr = v.ad,
                }
                if self.gamestate == GameStatusType.DeskState_Preflop then
                    item.TurnBet = item.TurnBet - self.tableInfo.Ante
                end
                self:generateOperate(tseat, item)
                log.Debug("PrintTurn() ID", item.ID, "Operate", item.Operate)
                plinfo[tostring(v.id)] = item
            end
        end
        for i, v in ipairs(self.seats) do
            if v.status >= SeatStatusType.PLAYING then
                v.action = plinfo[tostring(v.id)].Operate
                v.lasttotalbet = plinfo[tostring(v.id)].TotalBet
            end
        end

        uiinfo.PlayerInfo = plinfo

        log.Trace("PrintTurn() Card on Desk", "")
        uiinfo.DeskCard = tx.GetPokerStringTable(tx.MapCards(tnseat.publicCard))
        log.Trace("PrintTurn() DeskCard", json.encode(uiinfo.DeskCard))
        uiinfo.CommunityCards = clone(tnseat.publicCard)

        log.Debug("tnseat.rmtCard", tnseat.rmtCard)
        log.Debug("#tnseat.rmtCard", #tnseat.rmtCard)
        if #tnseat.rmtCard > 0 then
            uiinfo.RmtCard = {}
            for i, v in ipairs(tnseat.rmtCard) do
                log.Debug("rmtCard v", v)
                if v~= nil and #v >0 then
                    table.insert(uiinfo.RmtCard, tx.GetPokerStringTable(tx.MapCards(v)))
                end
            end
            log.Trace(json.encode(uiinfo.RmtCard))
        end

        self.diffBet = self.maxTurnBet - tnseat.turnbet

        uiinfo.CurnSeat = tseat 

        if #self.sidepot > 0 then
            uiinfo.Pots = clone(self.sidepot)
        end

        log.Trace("uiinfo", uiinfo)
        
        self.lastAction = self.curnTurn
        log.Trace("set self.lastAction", self.lastAction)
    else
        log.Warn("PrintTurn() myseat", myseat, "tnseat", tnseat)
    end
    return uiinfo
end

function game_texas:CheckDealCardResult(srcSeat, seatTo, index)
    log.Debug("CheckDealCardResult, self.gamestate", GameStatusTypeStr[self.gamestate] or self.gamestate, "self.turnoperated", self.turnoperated, "self.decRecord", self.decRecord, "self.timeoutType", self.timeoutType)
    if self.decRecord[tostring(srcSeat)] == nil then
        log.Error("CheckDealCardResult", "invalid srcSeat")
        return
    end

    for i, v in ipairs(index) do
        if self.decRecord[tostring(srcSeat)][tostring(v)] == false then
            self.decRecord[tostring(srcSeat)][tostring(v)] = true
        end
    end
    log.Trace("CheckDealCardResult, new decRecord", self.decRecord)

    if seatTo == 255 then
        --由BackupDecryptCardResult对比后清理
        return
    end

    local alldone = true
    for k, v in pairs(self.decRecord[tostring(srcSeat)]) do
        if not v then
            alldone = false
            break
        end
    end

    if alldone then
        --这里清掉避免后面的函数被重复调用
        self.decRecord[tostring(srcSeat)] = nil
    end
    log.Trace("CheckDealCardResult, final decRecord", self.decRecord)

    if index[#index] == 51 and seatTo == self.tableInfo.MaxNum + 1 then --正常弃牌流程
        local canActionSeats = self:GetCanActionSeats()
        local playingSeats = self:GetPlayingSeats()
        log.Debug("CheckDealCardResult, canActionSeats", canActionSeats, "playingSeats", playingSeats)
        --弃牌后只剩下一个人了
        if #canActionSeats < 2 and #playingSeats < 2 then
            if declareTimer ~= nil then
                log.Trace("CheckDealCardResult() stopTimer", "declareTimer")
                StopTimer("declareTimer")
            end
            self:DoGameOver()
            return
        end

        --弃牌的发牌最后一个牌点是51
        self:TryDeclareNextSeat(self.curnTurn)
    elseif seatTo ~= 255 and self.gamestate == GameStatusType.DeskState_Preflop and not self.turnoperated then
        --只有这一轮的发牌不会走到DealCardResult
        self:TryStartBetTurn()
    end
end

function game_texas:CheckDeclareSeat(seatId)
    if self.curnTurn ~= seatId then
        log.Error("CheckDeclareSeat()", "invalid Action seat")
        return false
    end
    local seat = self:GetSeat(seatId)
    if seat == nil then
        log.Error("CheckDeclareSeat()", "invalid seat")
        return false
    end

    if seat.status ~= SeatStatusType.PLAYING then
        log.Error("CheckDeclareSeat()", "invalid status")
        return false
    end

    if seat.Fold then
        log.Error("CheckDeclareSeat()", "already Fold")
        return false
    end

    return true
end

function game_texas:BetHandEx(seat, bet)
    log.Trace("BetHandEx(), seat", seat, "self.curnTurn", self.curnTurn, "bet", bet)

    if not self:CheckDeclareSeat(seat) then
        return false
    end

    local raise = false
    for i, v in ipairs(self.seats) do
        log.Trace("bet hand id", v.id, "turnbet", v.turnbet, "diffBet", self.diffBet, "maxTurnBet", self.maxTurnBet)
        if v.id == seat then 
            if bet < self.diffBet and not(v:IsAllin(bet)) then
                log.Warn("illegality Bet ...", v.id)
                self:TrySendGameReplay()
                return false
            end
            v:AddBet(bet)
            local turnBet = v:GetTurnBet()
            if turnBet > self.maxTurnBet then
                self.maxTurnBet = turnBet
                raise = true
                log.Info("bet hand self.maxTurnBet", self.maxTurnBet)
            end
        end
    end

    --加注，本轮最后一个说话玩家置为加注玩家的前一个人
    if raise then
        self.lastTurn = self:LastActionSeatID(seat)
        log.Info("BetHandEx(), set self.lastTurn", self.lastTurn)
    end
    return true
end

function game_texas:CheckOutHandEx(seat, cursor)
    log.Trace("CheckOutHandEx(), seat", seat, "self.curnTurn", self.curnTurn, "cursor", cursor, "self.cursor", self.cursor)

    if not self:CheckDeclareSeat(seat) then
        return false
    end

    StopTimer("declareTimer")
    StopTimer("dealCardTimer")
    log.Trace("CheckOutHandEx resetTimer", "dealCardTimer", "expired", os.date("%X", os.time() + Timeout_Dealcard / 1000))
    StartTimer("dealCardTimer", Timeout_Dealcard)
    local coseat = self:GetSeat(seat)
    coseat.Fold = true

    local seatcardIndex = {}
    local seatindex = {}
    table.insert(seatindex, self.tableInfo.MaxNum + 1)
    table.insert(seatindex, 0)

    self.decRecord[tostring(seat)] = {}
    local index = {}
    for i = self.cursor, 51 do
        table.insert(index, i)
        self.decRecord[tostring(seat)][tostring(i)] = false
    end
    table.insert(seatindex, index)

    log.Info("CheckOutHandEx, seatindex", seatindex)
    table.insert(seatcardIndex, seatindex)

    local jsondealcard = json.encode(seatcardIndex)
    log.Trace("CheckOutHandEx", jsondealcard)
    local dealcarddata = byteSlice:new()
    dealcarddata:appendString(jsondealcard)
    ge.Send({seat}, DealCardMsgCode, dealcarddata)
end

function game_texas:ExtendDeclareTime(seat)
    log.Trace("ExtendDeclareTime(), seat", seat, "self.curnTurn", self.curnTurn, "self.record:getLength()", self.record:getLength())

    if not self:CheckDeclareSeat(seat) then
        return
    end

    if self.record:getLength() == 1 and not self.firstActionExtended then
        self.firstActionExtended = true
        StopTimer("declareTimer")
        log.Trace("ExtendDeclareTime resetTimer", "declareTimer", "expired", os.date("%X", os.time() + Timeout_Declare / 1000))
        StartTimer("declareTimer", Timeout_Declare)
    end
end

function game_texas:GetTempWinner(originseats, bCmpSeat) --临时领先者，用于多牌和保险
    if bCmpSeat == nil then
        bCmpSeat = true
    end
    local seats = {}
    for i, v in ipairs(originseats) do
        if not v.Fold and v.status == SeatStatusType.PLAYING then
            --log.Info("v.totalbet", v.totalbet, "Fold", v.Fold, "id", v.id, "sidepot", v.sidepot, "balance", v.balance)
            local item = GenSeat.new(v.totalbet, v.Fold, v.id, v.sidepot)
            
            --item.balance = v.balance
            item.privateCardStr = tx.GetPokerStringTable(tx.MapCards(v.privateCard))
            item.publicCardStr = tx.GetPokerStringTable(tx.MapCards(v.publicCard))

            local tm = {}
            table.insert(tm, v.publicCard)
            table.insert(tm, v.privateCard)

            --分批合并比较
            item.Cards = tx.Merge(tm)

            --log.Debug("#item.Cards", #item.Cards)
            if #item.Cards > 0 then
                item:GenCards()
            end
            --log.Debug("GenCards finish", #item.Cards)
            table.insert(seats, item)
        else
            --log.Info("v.totalbet", v.totalbet, "Fold", v.Fold, "id", v.id, "sidepot", v.sidepot, "status", v.status, "balance", v.balance)
        end
    end
    --log.Debug("GetTempWinner() begin sort #seats", #seats)
    
    local seatSortFun = function (a, b)
        local result
        if a.templevel == b.templevel then
            local ncmpresult = tx.compareInLevel(a.gen, b.gen, a.templevel)
            if ncmpresult == 0 and bCmpSeat then
                --从离firstTurn最近开始
                result = (a.Seat+self.tableInfo.MaxNum - self.firstTurn)%self.tableInfo.MaxNum < (b.Seat+self.tableInfo.MaxNum - self.firstTurn)%self.tableInfo.MaxNum
            end
            result = ncmpresult > 0
        else 
            result = (a.templevel > b.templevel)
        end

        return result
    end

    table.sort(seats, seatSortFun)
    --log.Debug("GetTempWinner() #seats", #seats)

    return seats[1].Seat
end

function game_texas:TrySendGameReplay()
    if self.record:getLength() == 1 then    --下完盲注后会触发到这里，第一个GameReplay只有盲注
        self:SyncGameReplays(255)
        return
    end
    local newestGameReplay = self.record:NewestGameReplay()
    local jsonNewestGameReplay = json.encode(newestGameReplay)
    if jsonNewestGameReplay == nil then
        log.Warn("TrySendGameReplay", "jsonNewestGameReplay == nil", "newestGameReplay", newestGameReplay)
        return
    end
    log.Trace("TrySendGameReplay", jsonNewestGameReplay)
    local gamereplaydata = byteSlice:new()
    gamereplaydata:appendString(jsonNewestGameReplay)
    ge.Send({255}, SyncGameReplayRespMsgCode, gamereplaydata)
end

function game_texas:GetBlindInfo()
    local blindinfo = {}
    blindinfo.Hand = self.gameInfo.CurrentHand
    blindinfo.TotalAnteBet = 0
    for i, v in ipairs(self.seats) do
        if v.status == SeatStatusType.PLAYING then
            blindinfo.TotalAnteBet = blindinfo.TotalAnteBet + self.tableInfo.Ante
        end
    end

    blindinfo.SmallBlind = self.gameInfo.SmallBlindPos
    blindinfo.BigBlind = self.gameInfo.BigBlindPos
    blindinfo.Dealer = self.gameInfo.DealerPos
    blindinfo.SmallBlindBet = self.tableInfo.SmallBlindBet

    if self.gameInfo.StraddlePos ~= nil then
        blindinfo.Straddle = self.gameInfo.StraddlePos
    end

    blindinfo.DealCardSequence = clone(self.gameInfo.DealCardSequence)
    return blindinfo
end

--flop/turn/river轮第一个说话的玩家座位号
function game_texas:ActionSeatID()
    log.Info("ActionSeatID SmallBlindPos", self.gameInfo.SmallBlindPos, "BigBlindPos", self.gameInfo.BigBlindPos, "playingNum", #self.gameInfo.DealCardSequence, "IsSmallBlindPosEmpty", self.gameInfo.IsSmallBlindPosEmpty, "IsDealerPosEmpty", self.gameInfo.IsDealerPosEmpty)
    if #self.gameInfo.DealCardSequence == 2 then
        for i, v in ipairs(self.seats) do
            if v.id == self.gameInfo.BigBlindPos and (v.Fold == false and v.Allin == false) then
                log.Trace("BigBlindPos seat.id", v.id, "fold", v.Fold, "allin", v.Allin)
                return v.id
            end
        end
        error("No BigBlindPos in 2 players")
    end

    --DealCardSequence就是从庄家位后一个开始，最后一个为庄家位
    local sequence = json.decode(json.encode(self.gameInfo.DealCardSequence))
    if self.gameInfo.IsSmallBlindPosEmpty then
        table.insert(sequence, 1, self.gameInfo.SmallBlindPos)
    end

    if self.gameInfo.IsDealerPosEmpty then
        table.insert(sequence, self.gameInfo.DealerPos)
    end
    log.Debug("ActionSeatID, new sequence", sequence)

    for i = 1, #sequence do
        local seat = self:GetSeat(sequence[i])
        if seat ~= nil and seat.status == SeatStatusType.PLAYING and not seat.Fold and not seat.Allin then
            return sequence[i]
        end
    end
end

--flop/turn/river轮最后一个说话的玩家座位号
function game_texas:LastActionSeatID(first)
    log.Info("LastActionSeatID first", first, "IsSmallBlindPosEmpty", self.gameInfo.IsSmallBlindPosEmpty, "IsDealerPosEmpty", self.gameInfo.IsDealerPosEmpty)
    local sequence = clone(self.gameInfo.DealCardSequence)
    if self.gameInfo.IsDealerPosEmpty and not isItemExist(sequence, self.gameInfo.DealerPos) then
        table.insert(sequence, self.gameInfo.DealerPos)
    end
    if self.gameInfo.IsSmallBlindPosEmpty and not isItemExist(sequence, self.gameInfo.DealerPos) then
        table.insert(sequence, 1, self.gameInfo.SmallBlindPos)
    end

    log.Debug("LastActionSeatID, new sequence", sequence)

    local id = self:PrevSeatID(sequence, first)
    for i = #sequence, 1, -1 do
        local seat = self:GetSeat(id)
        if seat ~= nil and seat.status == SeatStatusType.PLAYING and not seat.Fold and not seat.Allin then
            return id
        end
        id = self:PrevSeatID(sequence, id)
    end
    return first
end

--下一个说话的玩家座位号
function game_texas:NextActionSeatID(seatId)
    local sequence = {}
    for i, v in ipairs(self.gameInfo.DealCardSequence) do
        for k, seat in pairs(self.seats) do
            if seat.id == v and not seat.Fold and not seat.Allin or v == seatId then
                table.insert(sequence, v)
                break
            end
        end
    end
    log.Info("NextActionSeatID, sequence", sequence, "seat", seatId)
    return self:NextSeatID(sequence, seatId)
end

--还在局中没有弃牌的玩家
function game_texas:GetPlayingSeats()
    local sequence = {}
    for i, v in ipairs(self.gameInfo.DealCardSequence) do
        for k, seat in pairs(self.seats) do
            if seat.id == v and not seat.Fold then
                table.insert(sequence, v)
                break
            end
        end
    end
    return sequence
end

--弃牌或者Allin以后就不能操作了
function game_texas:GetCanActionSeats()
    local sequence = {}
    for i, v in ipairs(self.gameInfo.DealCardSequence) do
        for k, seat in pairs(self.seats) do
            if seat.id == v and not seat.Fold and not seat.Allin then
                table.insert(sequence, v)
                break
            end
        end
    end
    return sequence
end

gt = game_texas.new()

ge.SetCallback(Initialize, Uninitialize, ShuffleCardResult, DecPartionDealCardResult, DealCardResult, HandleMsg, HandleAck, BackupDecryptCardResult)

return gt
