local log = require("log")
local ge = require("flowcontrol")
local json = require("json")
local tx = require("texas")
local rlp = require("rlp")
require("init")

local OutsCountLimit = 14

insurance = class()		-- 定义一个基类 insurance

function insurance:ctor()	-- 定义 insurance 的构造函数
    log.Trace("insurance","ctor")
    self.outs = {}  --当前的主池outs
    self.outs["4"] = {}
    self.outs["5"] = {}
    self.sideouts = {} --需要算边池的outs
    self.sideouts["4"] = {}
    self.sideouts["5"] = {}
    self.receiveInsEvent = false --操作过保险，不买也为true，不买为买0
    self.turnWin = -1

    self.insresult = 0  --2位，第1位表示主池击中，第2位表示边池击中
    
    self.buyer = {}
    self.buyer["4"] = -1
    self.buyer["5"] = -1
    self.amount = {} --self.amount[4]、self.amount[5]第4 5张牌的保险，里面是table
    self.amount["4"] = {0, 0}
    self.amount["5"] = {0, 0}
    self.insWin = {}
    self.insWin["4"] = {0, 0}
    self.insWin["5"] = {0, 0}
    self.outsNum = {}   --当前的主边池outs数
    self.outsNum["4"] = {0, 0}
    self.outsNum["5"] = {0, 0}
end

function insurance:unInit()
    log.Trace("insurance","unInit")
    self.outs = {}
    self.outs["4"] = {}
    self.outs["5"] = {}
    self.sideouts = {}
    self.sideouts["4"] = {}
    self.sideouts["5"] = {}
    self.receiveInsEvent = false
    self.turnWin = -1

    self.insresult = 0
    
    self.buyer = {}
    self.buyer["4"] = -1
    self.buyer["5"] = -1
    self.amount = {} --self.amount[4]、self.amount[5]第4 5张牌的保险，里面是table
    self.amount["4"] = {0, 0}
    self.amount["5"] = {0, 0}
    self.insWin = {}
    self.insWin["4"] = {0, 0}
    self.insWin["5"] = {0, 0}
    self.outsNum = {}   --当前的主边池outs数
    self.outsNum["4"] = {0, 0}
    self.outsNum["5"] = {0, 0}
end

function insurance:getOrder(gamestate)
    if gamestate == GameStatusType.DeskState_Flop then
        return 4
    elseif gamestate == GameStatusType.DeskState_Turn then --GameStatusType.DeskState_River==5
        return 5
    else
        log.Warn("getOrder() gamestate", gamestate)
        return 4 --暂先都返回4
    end
end

function insurance:getOdds(outs)
    return outs > #gt.tableInfo.InsuranceOdds and #gt.tableInfo.InsuranceOdds or outs
end

function insurance:getOuts(seats)
    --local oldpublicCard = gt.publicCard
    local curMax = gt:GetTempWinner(seats, false)

    --log.Debug("getOuts() oldpublicCard", oldpublicCard, "curMax", curMax)

    --2个人时

    --3个人时，多个底池，最多3个池，2个公共，最后一个不算

    local exist = {}
    log.Debug("getOuts() seat.publicCard", seats[1].publicCard)
    for k, v in ipairs(seats[1].publicCard) do
        exist[v+1] = true
    end
    for k, v in ipairs(seats) do
        if v.status == SeatStatusType.PLAYING and not v.Fold then
            exist[v.privateCard[1]+1] = true --第1张底牌
            exist[v.privateCard[2]+1] = true --第2张底牌
        end
    end

    --local oldpublicCard = {}
    log.Debug("getOuts() exist", exist, "seat.publicCard", seats[1].publicCard)
    local outs = {}
    --local outs = {}
    for i = 1, 52 do --花色有影响
        if exist[i] == nil then--要去重
            for k, v in ipairs(seats) do
                table.insert(v.publicCard, i-1)
            end
            local newMax = gt:GetTempWinner(seats, false) --与多牌区别，不能并列时按座位号取

            if newMax ~= curMax then
                log.Debug("getOuts() i", i, "newMax", newMax)
                table.insert(outs, i-1)
            end

            --log.Debug("getOuts() before reset v.publicCard", seat.publicCard)
            for k, v in ipairs(seats) do
                --恢复原值

                --v.publicCard = oldpublicCard
                table.remove(v.publicCard, #v.publicCard)
            end
        end
        
    end

    return outs
end

function insurance:IsINSTable()
    return BitAnd(TableProps_INS, gt.tableInfo.TableProps) ~= 0 or BitAnd(TableProps_CINS, gt.tableInfo.TableProps) ~= 0
end
--要发3张公牌以后才显示保险，且领先的玩家才显示
--还要看outs个数，且不能多个并列为最大
--4 默认赔率，8用户自定义赔率
--保险购买规则：
--  Turn轮开始买：
--      第五张牌outs在[1, 14]之间才可以买，大于14不能买；
--  Flop轮开始买：
--      第四张牌outs在[1, 14]之间才可以买，大于14不能买；
--      若第四张牌购买过保险，第五张牌不论outs为多少必须买，即使outs大于14
function insurance:canShowInsurance()
    local isINSTable = self:IsINSTable()
    log.Debug("canShowInsurance, gt.tableInfo.TableProps", gt.tableInfo.TableProps, "isINSTable", isINSTable)
    if not isINSTable then
        return false
    end

    log.Debug("canShowInsurance, gt.allingamestate", GameStatusTypeStr[gt.allingamestate] or gt.allingamestate)
    if gt.allingamestate < GameStatusType.DeskState_Flop then
        return false
    end

    log.Debug("canShowInsurance, gt.gamestate", GameStatusTypeStr[gt.gamestate] or gt.gamestate)
    if gt.gamestate ~= GameStatusType.DeskState_Flop and gt.gamestate ~= GameStatusType.DeskState_Turn then
        return false
    end

    local mainpotseats = {}
    for k, v in ipairs(gt.seats) do
        if v.status == SeatStatusType.PLAYING and not v.Fold then
            table.insert(mainpotseats, v)
        end
    end
    log.Debug("canShowInsurance() #mainpotseats", #mainpotseats)
    if #mainpotseats > 3 then
        return false
    end

    local outs = self:getOuts(mainpotseats)
    local outsStr = tx.GetPokerStringTable(tx.MapCards(outs))
    log.Debug("#outs", #outs, "outs", outsStr, "gt.sidepot", gt.sidepot)
    self.outs[tostring(self:getOrder(gt.gamestate))] = outs

    self.turnWin = gt:GetTempWinner(mainpotseats, false)
    log.Debug("canShowInsurance() self.turnWin", self.turnWin)
    --判断主池最大者是否在sideseats，如果不在不能买边池的保险
    --现暂不显示主池边池不同人买保险的情况，因为如果先买了边池的保险后，主池最大者不好选择多牌还是保险
    --local turnWinSide = gt:GetTempWinner(sideseats, false)
    
    local tempWinner = gt:GetSeat(self.turnWin)
    --tempWinner.sidepot>gt.sidepot[1]领先者下注最小，未参与边池，现不再算另一个领先者了

    local sideouts = {}
    local sideoutsStr = ""
    if #gt.seats > 2 and #gt.sidepot > 1 and tempWinner.sidepot > gt.sidepot[1] then--还要计算边池outs
        local sideseats = {}
        for k, v in ipairs(gt.seats) do
            log.Debug("ins v.sidepot", v.sidepot, "mainpot", gt.sidepot[1])
            if v.sidepot > gt.sidepot[1] then
                table.insert(sideseats, v)
            end
        end
        if #sideseats > 1 then
            sideouts = self:getOuts(sideseats)
            sideoutsStr = tx.GetPokerStringTable(tx.MapCards(sideouts))
            self.sideouts[tostring(self:getOrder(gt.gamestate))] = sideouts
        end
    end
    log.Debug("#sideouts", #sideouts, "sideouts", sideoutsStr)
    log.Debug("self.buyer[4]", self.buyer["4"], "self.amount[4]", self.amount["4"])
    log.Debug("#outs > 0 and #outs <= OutsCountLimit", (#outs > 0 and #outs <= OutsCountLimit), "#sideouts > 0 and #sideouts <= OutsCountLimit", (#sideouts > 0 and #sideouts <= OutsCountLimit))
    log.Debug("#outs > 0 and self.turnWin == self.buyer[\"4\"] and (self.amount[\"4\"][1] > 0 or self.amount[\"4\"][2] > 0)", (#outs > 0 and turnWin == self.buyer["4"] and (self.amount["4"][1] > 0 or self.amount["4"][2] > 0)))
    local bIns = false
    if (#outs > 0 and #outs <= OutsCountLimit) or (#sideouts > 0 and #sideouts <= OutsCountLimit) then--#outs有可能为0
        bIns = true
    elseif #outs > 0 and self.turnWin == self.buyer["4"] and (self.amount["4"][1] > 0 or self.amount["4"][2] > 0) then
        bIns = true
    end

    if bIns then
        if gt.gamestate == GameStatusType.DeskState_Turn then
            self.buyer["4"] = self.turnWin
        else
            self.buyer["5"] = self.turnWin
        end
    end

    return bIns
end

function insurance:GetINSInfo()
    log.Trace("GetINSInfo, self.turnWin", self.turnWin)
    
    local order = tostring(self:getOrder(gt.gamestate))
    local seat = gt:GetSeat(self.turnWin)
    
    local insuranceInfo = {
        ["Pots"] = {},
        ["Order"] = tonumber(order),
        ["seatTurn"] = self.turnWin,
    }

    if #self.outs[order] > 0 and (#self.outs[order] <= OutsCountLimit or (gt.gamestate == GameStatusType.DeskState_Turn and self.buyer["4"] == self.turnWin and self.amount["4"][1] > 0)) then --还要判断边池最大者有没有参与
        local odds = gt.tableInfo.InsuranceOdds[self:getOdds(#self.outs[order])]
        log.Debug("GetINSInfo() odds", odds)
        if odds == 0 then --可能没有启用保险功能
            log.Error("GetINSInfo() odds", odds)
            return
        end
        local mainpotMembercount = 2
        if #gt.seats > 2 and #gt.sidepot > 1 then
            mainpotMembercount = 3
        end
        local potvalue = gt.sidepot[1]
        log.Debug("GetINSInfo() potvalue", potvalue)
        local mainPotInfo = {
            ["SecureBuy"] = math.floor(potvalue / mainpotMembercount / odds),
            ["FullPotBuy"] = math.floor(potvalue / odds),
            ["PotNum"] = potvalue,
            ["OddsValue"] = odds,
            ["Outs"] = self.outs[order],
            ["PublicCards"] = clone(seat.publicCard),
        }
        insuranceInfo["Pots"]["MainPot"] = mainPotInfo
        --table.insert(insuranceInfo["INSPots"], mainPotInfo)
    end
    
    if #self.sideouts[order] > 0 and (#self.sideouts[order] <= OutsCountLimit or (gt.gamestate == GameStatusType.DeskState_Turn and self.buyer["4"] == self.turnWin and self.amount["4"][2] > 0)) then --还要判断边池最大者有没有参与
        local odds2 = gt.tableInfo.InsuranceOdds[self:getOdds(#self.sideouts[order])]
        local potvalue2 = gt.sidepot[2]
        log.Debug("GetINSInfo() potvalue2", potvalue2)
        local sidePotInfo = {
            ["SecureBuy"] = math.floor(potvalue2 / 2 / odds2),
            ["FullPotBuy"] = math.floor(potvalue2 / odds2),
            ["PotNum"] = potvalue2,
            ["OddsValue"] = odds2,
            ["Outs"] = self.sideouts[order],
            ["PublicCards"] = clone(seat.publicCard),
        }
        insuranceInfo["Pots"]["SidePot"] = sidePotInfo
        --table.insert(insuranceInfo["INSPots"], sidePotInfo)
    end
    
    return insuranceInfo
end

function fnBuyInsuranceTimeout()
    log.Trace("fnBuyInsuranceTimeout() stopTimer", "buyInsTimer")
    StopTimer("buyInsTimer")

    log.Debug("fnBuyInsuranceTimeout(), gt.gamestate", GameStatusTypeStr[gt.gamestate] or gt.gamestate)
    ins:BuyIns(ins.turnWin, {0, 0})
end

function insurance:ShowInsurance()
    --ge.NotifyUI("ShowINS", self:GetINSInfo(turnWin))
    StopTimer("buyInsTimer")
    if #self.sideouts[tostring(self:getOrder(gt.gamestate))] == 0 then
        StopTimer("buyInsTimer")
        log.Trace("ShowInsurance() resetTimer", "buyInsTimer", "expired", os.date("%X", os.time() + Timeout_InsOnePotOp / 1000))
        StartTimer("buyInsTimer", Timeout_InsOnePotOp)
    else
        StopTimer("buyInsTimer")
        log.Trace("ShowInsurance() resetTimer", "buyInsTimer", "expired", os.date("%X", os.time() + Timeout_InsTwoPotOp / 1000))
        StartTimer("buyInsTimer", Timeout_InsTwoPotOp)
    end

    local tinfo = gt:GetNoOpTurnInfo(-1)
    tinfo["RmtIns"] = {}
    tinfo["RmtIns"]["ShowINS"] = self:GetINSInfo()
    gt.record:addTurnInfo(tinfo)
    gt:TrySendGameReplay()

    log.Trace("ShowInsurance", "SaveState")
    SaveState()
end

function insurance:ShowPlayerSymbol(addr,amount)
    local seatTurn = gt:getSeatIDByAddr(addr)
    log.Trace("insurance ShowPlayerSymbol seatTurn",seatTurn)
    if seatTurn ~= -1 then
        local insuranceInfo = {
            ["seatTurn"] = seatTurn,
            ["amount"] = amount,
        }
        --ge.NotifyUI("ShowPlayerINS", insuranceInfo)
        return insuranceInfo
    end
    return nil
end

function insurance:transResult(nMain, nSide) --2位，第1位表示主池击中，第2位表示边池击中
    -- return nMain*2+nSide
    return BitOr(BitLShift(nMain, 1), nSide)
end

function insurance:generateInsureResult(card)
    local order = tostring(self:getOrder(gt.gamestate - 1))
    local mainpotresult = self:isInOuts(card, self.outs[order])
    local sidepotresult = 0
    if #self.sideouts[order] > 0 then
        sidepotresult = self:isInOuts(card, self.sideouts[order])
    end
    local result = self:transResult(mainpotresult, sidepotresult)
    log.Debug("generateInsureResult() result", result)
    if gt.gamestate == GameStatusType.DeskState_Turn then 
        self.insresult = result
        --还要计算输赢的数量
        log.Debug("self.amount[4]", self.amount["4"], "self.outs", #self.outs[order], "gt.tableInfo.InsuranceOdds", gt.tableInfo.InsuranceOdds)
        local mainpotWin = -self.amount["4"][1]
        --#self.outs不能为0，为0作下标取的赔率为空，sideouts不为空时outs有可能为空
        if #self.outs[order] > 0 and self.amount["4"][1] > 0 and mainpotresult ~= 0 then
            mainpotWin = mainpotresult * self.amount["4"][1] * gt.tableInfo.InsuranceOdds[self:getOdds(#self.outs[order])]
        end
        local sidepotWin = -self.amount["4"][2]
        if #self.sideouts[order] > 0 and self.amount["4"][2] > 0 and sidepotresult ~= 0 then
            sidepotWin = sidepotresult * self.amount["4"][2] * gt.tableInfo.InsuranceOdds[self:getOdds(#self.sideouts[order])]
        end
        log.Debug("4 mainpotWin", mainpotWin, "sidepotWin", sidepotWin)
        self.insWin["4"] = {math.floor(mainpotWin), math.floor(sidepotWin)}
    else
        self.insresult = BitOr(BitLShift(result, 2), self.insresult)
        local mainpotWin = -self.amount["5"][1]
        log.Debug("self.amount[5]", self.amount["5"], "self.outs", #self.outs[order], "gt.tableInfo.InsuranceOdds", gt.tableInfo.InsuranceOdds)
        if #self.outs[order] > 0 and self.amount["5"][1] > 0 and mainpotresult ~= 0 then
            mainpotWin = mainpotresult * self.amount["5"][1] * gt.tableInfo.InsuranceOdds[self:getOdds(#self.outs[order])]
        end
        local sidepotWin = -self.amount["5"][2]
        if #self.sideouts > 0 and self.amount["5"][2] > 0 and sidepotresult ~= 0 then
            sidepotWin = sidepotresult * self.amount["5"][2] * gt.tableInfo.InsuranceOdds[self:getOdds(#self.sideouts[order])]
        end
        log.Debug("5 mainpotWin", mainpotWin, "sidepotWin", sidepotWin)
        self.insWin["5"] = {math.floor(mainpotWin), math.floor(sidepotWin)}
    end
end

function insurance:BuyIns(srcSeat, amountList)
    local order = tostring(self:getOrder(gt.gamestate))
    log.Trace("insurance:BuyIns srcSeat", srcSeat, "self.turnWin", self.turnWin, "amountList", amountList, "order", order, "outs", self.outs[order], "sideouts", self.sideouts[order])
    if srcSeat ~= self.turnWin then
        log.Error("insurance:BuyIns", "invalid seat")
        return false
    end
    
    local maxBuy = 0
    if #self.outs[order] > 0 and #self.outs[order] <= OutsCountLimit then
        maxBuy = gt.sidepot[1] / gt.tableInfo.InsuranceOdds[self:getOdds(#self.outs[order])]
    end
    local maxBuySide = 0
    if #self.sideouts[order] > 0 and #self.sideouts[order] <= OutsCountLimit then
        maxBuySide = gt.sidepot[2] / gt.tableInfo.InsuranceOdds[self:getOdds(#self.sideouts[order])]
    end
    if amountList[1] > maxBuy then
        log.Error("maxBuy", maxBuy, "amountList[1]", amountList[1])
        amountList[1] = maxBuy
    end
    if amountList[2] > maxBuySide then
        log.Error("maxBuySide", maxBuySide, "amountList[2]", amountList[2])
        amountList[2] = maxBuySide
    end

    local insPlayer = ""
    for i, v in ipairs(gt.seats) do
        if v.id == self.turnWin then
            insPlayer = v.ad
            break
        end
    end

    self.buyer[order] = self.turnWin
    self.amount[order][1] = amountList[1]
    self.amount[order][2] = amountList[2]
    local outs = {#self.outs[order], #self.sideouts[order]}
    log.Debug("order", order, "self.amount[4]", self.amount["4"], "self.buyer", self.buyer)
    --第5张牌买保险时，可能需要限制最小值
    if order == "5" and self.amount["4"] ~= nil and self.buyer["4"] == self.buyer["5"] then--要保证有足够的值可以扣，如果牌局在第5张牌反转
        local min = self.amount["4"][1] + self.amount["4"][2]
        local sum = 0
        if outs[1] > 0 then
            sum = sum + amountList[1] * gt.tableInfo.InsuranceOdds[self:getOdds(outs[1])]
        end
        if outs[2] > 0 then
            sum = sum + amountList[2] * gt.tableInfo.InsuranceOdds[self:getOdds(outs[2])]
        end
        --local sum = amountList[1]*gt.tableInfo.InsuranceOdds[self:getOdds(outs[1])] / 100 + amountList[2]*gt.tableInfo.InsuranceOdds[self:getOdds(outs[2])]
        log.Debug("min", min, "sum", sum)
        if sum < min then
            log.Error("sum < min", sum < min)
            if amountList[2] == 0 then--比最低值还小，置为最低值，使流程往下走
                amountList[1] = math.ceil(min / gt.tableInfo.InsuranceOdds[self:getOdds(outs[1])])
            elseif amountList[1] == 0 then
                amountList[2] = math.ceil(min / gt.tableInfo.InsuranceOdds[self:getOdds(outs[2])])
            else --两个值，不好确定，返回
                log.Error("sum < min amountList", amountList)
                return false
            end
            log.Error("sum < min new amountList", amountList)
        end
    end

    local buyInsData = {}
    table.insert(buyInsData, gt.gameInfo.CurrentHand)
    table.insert(buyInsData, tonumber(order))
    table.insert(buyInsData, outs[1])
    table.insert(buyInsData, outs[2])
    table.insert(buyInsData, amountList[1])
    table.insert(buyInsData, amountList[2])

    local rlpData, err = rlp.Encode(buyInsData)
    if err ~= nil then
        error("insurance:BuyIns RlpEncode err: " .. err)
    end

    for i = 1, 3 do
        local tx = rCtr.tc.Transact("notaryInsure", insPlayer, rlpData)
        if tx == "" or #tx >= 2 and string.sub(tx, 1, 2) ~= "0x" then
            log.Error("Network", "disconnected")
            return false
        else
            break
        end
    end
    return true
end

function insurance:isInOuts(card, outs) --是否击中保险
    log.Debug("isInOuts() card", card, "outs", outs)
    for k, v in ipairs(outs) do
        if v == card then
            return 1
        end
    end
    return 0
end

function insurance:BuyHandler(tableid, addr, hand, out, order, amount)
    log.Trace("insurance:BuyHandler tableid", tableid, "addr", addr, "hand", hand, "out", out, "order", order, "amount", amount)
    local buyerseat = nil
    for k, v in ipairs(gt.seats) do
        if v.ad == addr then
            buyerseat = v.id
            break
        end
    end

    self.receiveInsEvent = true

    local insuranceInfo = self:ShowPlayerSymbol(addr, amount)
    log.Debug("insurance:BuyHandler #self.outs", #self.outs[tostring(order)], "self.sideouts", #self.sideouts[tostring(order)], "buyerseat", buyerseat, "self.buyer[4]", self.buyer["4"], "self.amount[4]", self.amount["4"])
    if (order == 4 or order == 5 and self.buyer["4"] == buyerseat and self.amount["4"][1] == 0 and self.amount["4"][2] == 0) and (#self.outs[tostring(order)] == 0 or #self.outs[tostring(order)] > OutsCountLimit) and (#self.sideouts[tostring(order)] == 0 or #self.sideouts[tostring(order)] > OutsCountLimit) then
        --应该是有异常，不处理
        log.Warn("insurance:BuyHandler abnormal outs, #self.outs", #self.outs[tostring(order)], "#self.sideouts", #self.sideouts[tostring(order)])
        return
    end
    --校验买保险是否合法
    self.buyer[tostring(order)] = buyerseat
    self.amount[tostring(order)] = amount

    --判断是否买过，值大于0表示买，为0表示不买
    local tinfo = gt:GetNoOpTurnInfo(-1)
    if insuranceInfo ~= nil then
        tinfo["RmtIns"] = {}
        tinfo["RmtIns"]["ShowPlayerINS"] = insuranceInfo
    end
    gt.record:addTurnInfo(tinfo)
    gt:TrySendGameReplay()

    gt:processAllin()

    log.Trace("BuyHandler", "SaveState")
    SaveState()
end

function insurance:tryShowInsWinInfo()
    local order = self:getOrder(gt.gamestate - 1)   --此时已发出下一张牌来验证是否击中保险
    log.Debug("tryShowInsWinInfo order", order, string.format("self.buyer[\"%d\"]", order), self.buyer[tostring(order)], "gt.gamestate", gt.gamestate)
    if (BitAnd(TableProps_INS, gt.tableInfo.TableProps) ~= 0 or BitAnd(TableProps_CINS, gt.tableInfo.TableProps) ~= 0) and (gt.gamestate == GameStatusType.DeskState_Turn or gt.gamestate == GameStatusType.DeskState_River) and self.buyer[tostring(order)] ~= -1 then
        local playingSeats = gt:GetPlayingSeats()
        local seat = gt:GetSeat(playingSeats[1])
        self:generateInsureResult(seat.publicCard[order])

        local insWinInfo = {}
        insWinInfo["BuyerSeat"] = self.buyer[tostring(order)]
        insWinInfo["Order"] = order
        insWinInfo["InsWin"] = self.insWin[tostring(order)]

        local tinfo = gt:GetNoOpTurnInfo(-1)
        tinfo["RmtIns"] = {}
        tinfo["RmtIns"]["InsWinInfo"] = insWinInfo
        gt.record:addTurnInfo(tinfo)
        gt:TrySendGameReplay()

        log.Trace("tryShowInsWinInfo", "SaveState")
        SaveState()
    end
end

function insurance:tryRecoverIns()
    --查询保险操作
    local playingSeats = gt:GetPlayingSeats()
    local seat = gt:GetSeat(playingSeats[1])
    local data = rCtr.tc.Call("getinsurance", TableID)
    log.Debug("tryRecoverIns #seat.publicCard", seat.publicCard, "#data", #data, "data", data)
    --log.Debug("getinsurance data[1]", data[1]:Uint64(), "data[2]", data[2]:Uint64())
    --数组11个成员分别表示，hand (seat,#outs,#sideouts,amount,sideamount)*2（第4张牌保险和第5张牌保险 2组）
    local hand = data[1]:Uint64()
    local buyerseat4, outs4, sideouts4, amount4, sideamount4 = data[2]:Uint64(), data[3]:Uint64(), data[4]:Uint64(), data[5]:Uint64(), data[6]:Uint64()
    local buyerseat5, outs5, sideouts5, amount5, sideamount5 = data[7]:Uint64(), data[8]:Uint64(), data[9]:Uint64(), data[10]:Uint64(), data[11]:Uint64()
    log.Debug("tryRecoverIns before, self.buyer[4]", self.buyer["4"], "self.outsNum[4]", self.outsNum["4"], "self.amount[4]", self.amount["4"], "self.buyer[5]", self.buyer["5"], "self.outsNum[5]", self.outsNum["5"], "self.amount[5]", self.amount["5"])
    self.buyer["4"] = buyerseat4
    self.outsNum["4"] = {outs4, sideouts4}
    self.amount["4"] = {amount4, sideamount4}
    self.buyer["5"] = buyerseat5
    self.outsNum["5"] = {outs5, sideouts5}
    self.amount["5"] = {amount5, sideamount5}
    log.Debug("tryRecoverIns after, self.buyer[4]", self.buyer["4"], "self.outsNum[4]", self.outsNum["4"], "self.amount[4]", self.amount["4"], "self.buyer[5]", self.buyer["5"], "self.outsNum[5]", self.outsNum["5"], "self.amount[5]", self.amount["5"])
end

ins = insurance:new()

--log.Debug("GameStatusType.DeskState_Turn", GameStatusType.DeskState_Turn)--输出GameStatusType.DeskState_Turn=4.000
