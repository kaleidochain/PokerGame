local ge = require("gameengine")
local st = require("seat")
local json = require("json")
local rlp = require("rlp")
local log = require("log")

require("gamerecord")

game_recover = class()

function game_recover:ctor()
end

function game_recover:recoverSeats(selfaddr, tableid)
    log.Trace("recoverSeats, selfaddr", selfaddr, "tableid", tableid)
    rCtr:setCurTable(tableid)

    local players = rCtr:playersinfo()
    local tbInfo, currentHand = rCtr:tableinfo(players)
    local playSeats = {}
    local num = 0
    for i, v in ipairs(players) do
        log.Trace("players " .. i, v)
        local ns = st.new(v.Pos, v.Amount, v.PlayerAddr)
        v.Amount = v.Amount:String()

        --SeatStatusType.DISCARD是切后台被公证弃牌后，切回来重新坐下
        if v.Status == SeatStatusType.NEXTSTANDBY or v.Status == SeatStatusType.DISCARD then
            v.Status = SeatStatusType.PLAYING
        end
        
        ns.status = v.Status

        table.insert(gt.seats, ns)

        if v.PlayerAddr == selfaddr then
            gt.myseat = v.Pos
        end

        local naddr = newAddress(v.PlayerAddr)
        --isself为true会连接到inter,这里都为fasle,先不连接inter
        ge.Sit(v.Pos, gt.myseat == v.Pos, tableid, naddr, {}, false)

        -- lua需要恢复当局信息,当局玩过的玩家也当作playing
        if v.Status == SeatStatusType.PLAYING or v.Status == SeatStatusType.NEXTLEAVE 
        or v.Status == SeatStatusType.OFFLINE or v.Status == SeatStatusType.SHOWDOWNOFFLINE then
            num = num + 1
            table.insert(playSeats, v.Pos)
            -- go现在不需要恢复当局信息了，只有现在在玩的才需要设置go的playing状态
            if v.Status == SeatStatusType.PLAYING or v.Status == SeatStatusType.NEXTLEAVE  then
                ge.UpdateState(v.Pos)
            end
        end
    end

    log.Trace("straddle, num", num, "tbInfo.Straddle", tbInfo.Straddle)
    if num >= 4 and tbInfo.Straddle == 1 then
        gt.straddleFlag = true 
    end

    local bstr = json.encode(playSeats)
    log.Trace("play seats", bstr)

    gt.hand = currentHand
    gt.tableid = tbInfo.TableID
    gt.smallBlindBet = tbInfo.SmallBlind
    gt.anteBet = tbInfo.Ante
    gt.smallBlindPos = tbInfo.SmallBlindPos
    gt.bigBlindPos = tbInfo.BigBlindPos
    gt.dealerPos = tbInfo.DealerPos
    if gt.straddleFlag == true then
        straddlepos, _ = gt:NextSeat(playSeats, gt.bigBlindPos)
        if straddlepos == nil then
            error("Not have nextSeat")
        end
        gt.straddlepos = straddlepos
    end 

    gt.maxplayers = tbInfo.Maximum

    log.Trace("Blind Info, smallBlindPos", gt.smallBlindPos, "bigBlindPos", gt.bigBlindPos, "dealerPos", gt.dealerPos, "ante", gt.anteBet)
    local seatSortFun = function(a, b)
        return a.id < b.id
    end
    table.sort(gt.seats, seatSortFun)

    gt.record = gamerecord.new(gt.dealerPos)

    tbInfo["Players"] = players
    gt.RecoverData.TableInfo = tbInfo
    log.Debug("RecoverData.TableInfo", gt.RecoverData.TableInfo)
end

rcv = game_recover:new()
