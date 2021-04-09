local ge = require("flowcontrol")
local st = require("seat")
local json = require("json")
local log = require("log")

function StartTimer(timerName, duration)
    log.Trace(string.format("before StartTimer(%s, %d) runningTimer", timerName, duration), json.encode(runningTimer))
    if timerName == "shuffleTimer" then
        shuffleTimer = timer.afterFunc(fnShuffleTimeout, duration)
    elseif timerName == "dealCardTimer" then
        dealCardTimer = timer.afterFunc(fnDealCardsTimeout, duration)
    elseif timerName == "declareTimer" then
        declareTimer = timer.afterFunc(fnDeclareTimeout, duration)
    elseif timerName == "buyInsTimer" then
        buyInsTimer = timer.afterFunc(fnBuyInsuranceTimeout, duration)
    elseif timerName == "rmtTimesChooseTimer" then
        rmtTimesDeclareTimer = timer.afterFunc(fnRMTTimesDeclareTimeout, duration)
    elseif timerName == "rmtTimesDeclareTimer" then
        rmtTimesChooseTimer = timer.afterFunc(fnRMTTimesChooseTimeout, duration)
    elseif timerName == "getBackupKeyCardTimer" then
        getBackupKeyCardTimer = timer.afterFunc(fnGetBackupKeyCardTimeout, duration)
    end
    table.insert(runningTimer, {timerName, duration})

    log.Trace(string.format("after StartTimer(%s, %d) runningTimer", timerName, duration), json.encode(runningTimer))
end

function StopTimer(timerName)
    log.Trace(string.format("before StopTimer(%s) runningTimer", timerName), json.encode(runningTimer))
    if timerName == "shuffleTimer" then
        stopTimer(shuffleTimer)
        shuffleTimer = nil
    elseif timerName == "dealCardTimer" then
        stopTimer(dealCardTimer)
        dealCardTimer = nil
    elseif timerName == "declareTimer" then
        stopTimer(declareTimer)
        declareTimer = nil
    elseif timerName == "buyInsTimer" then
        stopTimer(buyInsTimer)
        buyInsTimer = nil
    elseif timerName == "rmtTimesChooseTimer" then
        stopTimer(rmtTimesDeclareTimer)
        rmtTimesDeclareTimer = nil
    elseif timerName == "rmtTimesDeclareTimer" then
        stopTimer(rmtTimesChooseTimer)
        rmtTimesChooseTimer = nil
    elseif timerName == "getBackupKeyCardTimer" then
        stopTimer(getBackupKeyCardTimer)
        getBackupKeyCardTimer = nil
    end

    for i = #runningTimer, 1, -1 do
        if runningTimer[i][1] == timerName then
            table.remove(runningTimer, i)
        end
    end

    log.Trace(string.format("after StopTimer(%s) runningTimer", timerName), json.encode(runningTimer))
end

function SaveState()
    local jsongt = json.encode(gt)
    local jsonins = json.encode(ins)
    local jsonrmt = json.encode(rmt)
    local jsonrunningTimer = json.encode(runningTimer)
    log.Trace("SaveState gt", jsongt)
    log.Trace("SaveState ins", jsonins)
    log.Trace("SaveState rmt", jsonrmt)
    log.Trace("SaveState runningTimer", jsonrunningTimer)
    if jsongt == nil or jsonins == nil or jsonrmt == nil or jsonrunningTimer == nil then
        log.Error("SaveState", "Failed")
        return
    end
    if backupSeatSequence ~= nil then
        local jsonbackupSeatSequence = json.encode(backupSeatSequence)
        log.Trace("SaveState backupSeatSequence", jsonbackupSeatSequence)
        local backupSeatSequencedata = byteSlice:new()
        backupSeatSequencedata:appendString(jsonbackupSeatSequence)
        local key = byteSlice:new()
        key:appendString("backupSeatSequence")
        ge.PutStoreData(key, backupSeatSequencedata)
    else
        log.Trace("SaveState backupSeatSequence", "nil")
    end

    local key = byteSlice:new()
    local gtdata = byteSlice:new()
    key:appendString("gt")
    gtdata:appendString(jsongt)
    ge.PutStoreData(key, gtdata)

    local key = byteSlice:new()
    local insdata = byteSlice:new()
    key:appendString("ins")
    insdata:appendString(jsonins)
    ge.PutStoreData(key, insdata)

    local key = byteSlice:new()
    local rmtdata = byteSlice:new()
    key:appendString("rmt")
    rmtdata:appendString(jsonrmt)
    ge.PutStoreData(key, rmtdata)

    local key = byteSlice:new()
    local runningTimerdata = byteSlice:new()
    key:appendString("runningTimer")
    runningTimerdata:appendString(jsonrunningTimer)
    ge.PutStoreData(key, runningTimerdata)
end

function LoadState()
    log.Trace("before LoadState gt", json.encode(gt))
    log.Trace("before LoadState ins", json.encode(ins))
    log.Trace("before LoadState rmt", json.encode(rmt))
    log.Trace("before LoadState runningTimer", json.encode(runningTimer))
    if backupSeatSequence ~= nil then
        log.Trace("before LoadState backupSeatSequence", json.encode(backupSeatSequence))
    else
        log.Trace("before LoadState backupSeatSequence", "nil")
    end

    local key = byteSlice:new()
    local gtdata = byteSlice:new()
    key:appendString("gt")
    gtdata = ge.GetStoreData(key)
    log.Trace("LoadState gt", gtdata:toString())
    local ldgt = json.decode(gtdata:toString())
    for k, v in pairs(ldgt) do
        if k ~= "record" and k ~= "seats" then  --带函数的类对象需要像gt、ins、rmt那样单独恢复
            gt[k] = v
        end
        log.Trace("LoadState gt[" .. k .. "]", json.encode(v))
    end
    gt.record = gamerecord.new(gt.gameInfo.DealerPos)
    gt.record:clone(ldgt["record"]["actions"])
    for k, v in pairs(ldgt["seats"]) do
        local ns = st.new(v.id, v.balance, v.ad)
        for ii, vv in pairs(v) do
            ns[ii] = vv
        end
        table.insert(gt.seats, ns)
    end

    local key = byteSlice:new()
    local insdata = byteSlice:new()
    key:appendString("ins")
    insdata = ge.GetStoreData(key)
    local ldins = json.decode(insdata:toString())
    for k, v in pairs(ldins) do
        ins[k] = v
    end

    local key = byteSlice:new()
    local rmtdata = byteSlice:new()
    key:appendString("rmt")
    rmtdata = ge.GetStoreData(key)
    local ldrmt = json.decode(rmtdata:toString())
    for k, v in pairs(ldrmt) do
        rmt[k] = v
    end

    local key = byteSlice:new()
    local runningTimerdata = byteSlice:new()
    key:appendString("runningTimer")
    runningTimerdata = ge.GetStoreData(key)
    local timers = json.decode(runningTimerdata:toString())
    for i, v in pairs(timers) do
        StartTimer(v[1], v[2])
        if v[1] == "buyInsTimer" then
            --收到买保险事件前就崩溃了
            ins:tryRecoverIns()
        end
    end

    local key = byteSlice:new()
    local backupSeatSequencedata = byteSlice:new()
    key:appendString("backupSeatSequence")
    backupSeatSequencedata = ge.GetStoreData(key)
    if backupSeatSequencedata ~= nil then
        backupSeatSequence = json.decode(backupSeatSequencedata:toString())
    end

    log.Trace("after LoadState gt", json.encode(gt))
    log.Trace("after LoadState ins", json.encode(ins))
    log.Trace("after LoadState rmt", json.encode(rmt))
    log.Trace("after LoadState runningTimer", json.encode(runningTimer))
    if backupSeatSequence ~= nil then
        log.Trace("after LoadState backupSeatSequence", json.encode(backupSeatSequence))
    else
        log.Trace("after LoadState backupSeatSequence", "nil")
    end

    --客户端go层重发间隔10秒，共9次，FC崩溃恢复后若没收到客户端的操作消息，则再通知一次，直到操作超时走操作超时流程
    local fnRenotify = function ()
        log.Info("fnRenotify", "TrySendGameReplay")
        gt:TrySendGameReplay()
    end
    log.Trace("after LoadState", "renotifyTimer", "expired", os.date("%X", os.time() + Timeout_Renotify / 1000))
    renotifyTimer = timer.afterFunc(fnRenotify, Timeout_Renotify)
end

function StopRenotifyTimer()
    if renotifyTimer ~= nil then
        log.Trace("StopRenotifyTimer(), stopTimer", "renotifyTimer")
        stopTimer(renotifyTimer)
        renotifyTimer = nil
    end
end