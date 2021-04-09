local log = require("log")
local ge = require("gameengine")
local json = require("json")
local tx = require("texas")
local rlp = require("rlp")
require("init")

local OutsCountLimit = 14

insurance = class()		-- 定义一个基类 insurance

function insurance:ctor()	-- 定义 insurance 的构造函数
    log.Trace("insurance","ctor")
end

function insurance:unInit()
    log.Trace("insurance","unInit")
end

function insurance:Handler(method,params)
    log.Trace("insurance:Handler method", method, "params", params)
    if method == "INSBuy" then
        self:Buy(params)
    elseif method == "INSCancelBuy" then
        self:CancelBuy(params)
    end
    return ""
end

function insurance:BuyIns(amountList)
    local jsonal = json.encode(amountList)
    local ibdata = byteSlice:new()
    ibdata:appendString(jsonal)
    ge.Send({255}, INSBuyMsgCode, ibdata)
end

function insurance:Buy(params)
    local t = json.decode(params)
    local amountList = t.Amount
    self:BuyIns(amountList)
end

function insurance:CancelBuy(params) --选择Pass，不买保险
    log.Trace("insurance:CancelBuy params", params)

    local amountList = {0, 0}
    self:BuyIns(amountList)
end

ins = insurance:new()

--log.Debug("GameStatusType.DeskState_Turn", GameStatusType.DeskState_Turn)--输出GameStatusType.DeskState_Turn=4.000
