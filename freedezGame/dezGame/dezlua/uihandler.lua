--local ge = require("gamengine")
local eth = require("eth")
local json = require("json")
local ge = require("gameengine")
local log = require("log")

require("roomcontract")
--为了让go可以找到，不能加local
function tableHandler(method, params)
    log.Trace("tableHandler(), method", method, "params", params)
    if string.sub(method, 1 , 5) == "Play_" then
        method = string.sub(method, 6 , -1)
        return EventHandler(method,params)
    elseif method == "listtable" then
        return rCtr:listTable(params)
    elseif method == "listfreetable" then
        return rCtr:listFreeTable(params)
    elseif method == "listclubtable" then
        return rCtr:listClubTable(params)
    elseif method == "playersinfo" then
        return rCtr:GetPlayersInfo(params)
    elseif method == "playerinfo" then  --怀疑没有调用
        return rCtr:GetPlayerInfo(params)
    elseif method == "seatinfo" then
        return rCtr:seatInfo(params)
    elseif method == "jointable" then
        return rCtr:joinTable(params)
    elseif method == "addChips" then
        return rCtr:addChips(params)
    elseif method == "withdrawChips" then
        return rCtr:withdrawChips(params)
    elseif method == "checkLeave" then
        return rCtr:checkLeave(params)
    elseif method == "leave" then
        return rCtr:leaveTable(params)
    elseif method == "leaveNext" then
        return rCtr:leaveTableNext(params)
    elseif method == "createtable" then
        return rCtr:createTable(params)
    elseif method == "ready" then
        return rCtr:ready(params)
    elseif method == "givemetoken" then
        return rCtr:giveMeToken(params)
    elseif method == "balanceOf" then
        return rCtr:balanceOf(params)
    elseif method == "exchangeKal" then
        return rCtr:exchangeKal(params)
    elseif method == "exchangeGoldcoin" then
        return rCtr:exchangeGoldcoin(params)
    elseif method == "KalTransaction" then
        return rCtr:KalTransaction(params)
    elseif method == "KalBalance" then
        return rCtr:KalBalance(params)
    elseif method == "GoldTransaction" then
        return rCtr:GoldTransaction(params)
    elseif method == "verify" then
        return rCtr:verify(params)
    elseif method == "rate" then
        return rCtr:rate(params)
    elseif method == "applyCode" then
        return rCtr:applyCode(params)
    elseif method == "getCode" then
        return rCtr:getCode(params)
    elseif method == "setCode" then
        return rCtr:setCode(params)
    elseif method == "withdrawReward" then
        return rCtr:withdrawReward(params)
    elseif method == "inviter" then
        return rCtr:inviter(params)
    elseif method == "hashData" then
        return rCtr:hashData(params)
    elseif method == "createClubThreshold" then
        return rCtr:createClubThreshold(params)
    elseif method == "unsubscribeClubEvent" then
        return rCtr:unsubscribeClubEvent(params)
    elseif method == "createClub" then
        return rCtr:createClub(params)
    elseif method == "clubInfo" then
        return rCtr:clubInfo(params)
    elseif method == "myClubs" then
        return rCtr:myClubs(params)
    elseif method == "clubMembers" then
        return rCtr:clubMembers(params)
    elseif method == "dissolveClub" then
        return rCtr:dissolveClub(params)
    elseif method == "listenMyJoinClub" then
        return rCtr:listenMyJoinClub(params)
    elseif method == "subscribeCreateTable" then
        return rCtr:subscribeCreateTable(params)
    elseif method == "unsubscribeCreateTable" then
        return rCtr:unsubscribeCreateTable(params)
    elseif method == "subscribeGameTable" then
        return rCtr:subscribeGameEvent(params)
    elseif method == "unsubscribeGameTable" then
        return rCtr:unsubscribeGameEvent(params)
    elseif method == "reSubscribeGameTable" then
        return rCtr:reSubscribeGameEvent(params)
    elseif method == "reSubscribeClub" then
        return rCtr:reSubscribeClubEvent(params)
    elseif method == "joinClubIDs" then
        return rCtr:joinClubIDs(params)
    elseif method == "joinClub" then
        return rCtr:joinClub(params)
    elseif method == "getJoinClubApplications" then
        return rCtr:getJoinClubApplications(params)
    elseif method == "quitClub" then
        return rCtr:quitClub(params)
    elseif method == "approveJoinClub" then
        return rCtr:approveJoinClub(params)
    elseif method == "denyJoinClub" then
        return rCtr:denyJoinClub(params)
    elseif method == "gameRequest" then
        return rCtr:gameRequest(params)
    elseif method == "joinTableList" then
        return rCtr:joinTableList(params)
    elseif method == "joinApprove" then
        return rCtr:joinApprove(params)
    elseif method == "approvedList" then
        return rCtr:approvedList(params)
    elseif method == "playedTables" then
        return rCtr:PlayedTables(params)
    elseif method == "tableDetail" then
        return rCtr:TableDetail(params)
    elseif method == "gameSwitch" then
        return rCtr:gameSwitch(params)
    elseif method == "selfHoleCards" then
        return rCtr:selfHoleCards(params)
    elseif method == "reConnectGameReplays" then
        return rCtr:reConnectGameReplays(params)
    elseif method == "selfPlayingStatus" then
        return rCtr:SelfPlayingStatus(params)
    elseif method == "seatInfoEx" then
        return rCtr:seatInfoEx(params)
    elseif method == "test" then
        return rCtr:test(params)
    else
        return nil
    end
    return nil
end
