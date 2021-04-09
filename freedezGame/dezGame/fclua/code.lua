-- local ge = require("gameengine")



-- function print_r ( t )  
--     local print_r_cache={}
--     local function sub_print_r(t,indent)
--         if (print_r_cache[tostring(t)]) then
--             print(indent.."*"..tostring(t))
--         else
--             print_r_cache[tostring(t)]=true
--             if (type(t)=="table") then
--                 for pos,val in pairs(t) do
--                     if (type(val)=="table") then
--                         print(indent.."["..pos.."] => "..tostring(t).." {")
--                         sub_print_r(val,indent..string.rep(" ",string.len(pos)+8))
--                         print(indent..string.rep(" ",string.len(pos)+6).."}")
--                     elseif (type(val)=="string") then
--                         print(indent.."["..pos..'] => "'..val..'"')
--                     else
--                         print(indent.."["..pos.."] => "..tostring(val))
--                     end
--                 end
--             else
--                 print(indent..tostring(t))
--             end
--         end
--     end
--     if (type(t)=="table") then
--         print(tostring(t).." {")
--         sub_print_r(t,"  ")
--         print("}")
--     else
--         sub_print_r(t,"  ")
--     end
--     print()
-- end

-- ge.setTestCallback(Testcallback)

-- ge.setCallback(ShuffleCardResult,DealCardResult,CheckCardResult, BetResult,CheckOutResult,ApplyNotary, HandleMsg)

-- local addstr = "1ef219440295d5ef6c510293bf714c22b388798f"
-- local arr = {1, 2, 3} 
-- local luastr = "Hello World!"
-- local begSignData ={BetStateHash= "qwer", Sign = "asdf", DeskID = 12, ID=1}

-- result = ge.double(begSignData, luastr)
-- print("result:", result)
-- print("type:", type(result))


-- local fn1 = function ()
-- 	print("fun1 run After in Lua ...")
-- end
-- local tm1 = timer.afterFunc(fn1, 3000)

-- local fn2 = function()
-- 	print("fun2 run After in Lua ...")
-- end
-- local tm2 = timer.afterFunc(fn2, 8000)

-- function some_thing( )
-- 	-- body

-- 	local fn3 = function()
-- 		print("fun3 run After in Lua ...")
-- 	end

-- 	local tm3 = timer.afterFunc(fn3, 9000)

-- 	print("some_thing end")
-- end

-- some_thing() 


-- print_r(result)





-- for i=1,10 do
-- 	print("$$$$$$$$$$$$$$", i)
-- 	local tx = require("texas")
-- 	local desk, hand1, hand2 = tx.Start()

-- 	print("----desk--")
-- 	for i,v in ipairs(desk) do
-- 		print(i,v)
-- 	end
-- 	print("----hand1--")
-- 	for i,v in ipairs(hand1) do
-- 		print(i,v)
-- 	end

-- 	print("----hand2--")
-- 	for i,v in ipairs(hand2) do
-- 		print(i,v)
-- 	end 

-- 	tm = {}
-- 	table.insert( tm, desk )
-- 	table.insert( tm,  hand1 )
-- 	hand1cards = tx.Merge(tm) 

-- 	tm = {}
-- 	table.insert( tm, desk )
-- 	table.insert( tm,  hand2 )
-- 	hand2cards = tx.Merge(tm) 

-- 	for i,v in ipairs(hand1cards) do
-- 		print("hand1cards",i,v)
-- 	end

-- 	for i,v in ipairs(hand2cards) do
-- 		print("hand2cards",i,v)
-- 	end

-- 	hand1pokers =tx.MapCards(hand1cards)
-- 	hand2pokers =tx.MapCards(hand2cards)

-- 	for i,v in ipairs(hand1pokers) do
-- 		print("hand1cards",i,v.color, v.num)
-- 	end

-- 	for i,v in ipairs(hand2pokers) do
-- 		print("hand2cards",i,v.color, v.num)
-- 	end


-- 	ddp =  tx.MapCards(desk)
-- 	hh1p = tx.MapCards(hand1)
-- 	hh2p = tx.MapCards(hand2)

-- 	local ddpstr = ""
-- 	for i,v in ipairs(ddp) do
-- 		ddpstr = ddpstr.." "..texas.PokerString(v)
-- 	end
-- 	print("公共牌:", ddpstr)

-- 	local hh1pstr = ""
-- 	for i,v in ipairs(hh1p) do
-- 		hh1pstr = hh1pstr.." "..texas.PokerString(v)
-- 	end
-- 	print("手牌1:", hh1pstr)

-- 	local hh2pstr = ""
-- 	for i,v in ipairs(hh2p) do
-- 		hh2pstr = hh2pstr.." "..texas.PokerString(v)
-- 	end
-- 	print("手牌2:", hh2pstr)

-- 	result = tx.Compare(hand1pokers, hand2pokers)

-- 	print(result)

-- end

-- print("Over!!!!!!!!!!")

-- require ("game")

local ge = require("gameengine") 
local json = require ("json")


-- local signdata1, hashdata1, sign1 = ge.TestSignHash("hello0123")
-- print(signdata1:toString(), hashdata1:toString(), sign1:toString())

-- local BetSignData = {
--     BetStateHash = hashdata1:toString(),
--     Sign = sign1:toString(),  
-- } 

-- bstr = json.encode(BetSignData)
-- print(bstr)

-- local bsd = json.decode(bstr) 
-- local bsh = byteSlice.new() 
-- bsh:append(bsd.BetStateHash)
-- local sn = byteSlice.new() 
-- sn:append(bsd.Sign)

-- print(hashdata1:toString() == bsd.BetStateHash)
-- print(sign1:toString() == bsd.Sign)

-- print(hashdata1:toString() == bsh:toString())
-- print(sign1:toString() == sn:toString())

-- print( true and "hello" ~= "hello")

-- if (true and (hashdata1:toString() ~= bsd.BetStateHash)) then
--     print("fuck ......")
-- end
-- print("--------------------------------------------------------------\n")

-- local signdata2, hashdata2, sign2 = ge.TestSignHash("hello0123")
-- print(signdata2:toString(), hashdata2:toString(), sign2:toString())

-- print(signdata1:toString() == signdata2:toString()) 
-- print(hashdata1:toString() == hashdata2:toString())
-- print(sign1:toString() == sign2:toString())
-- print(signdata1:toString() ~= signdata2:toString()) 
-- print(hashdata1:toString() ~= hashdata2:toString())
-- print(sign1:toString() ~= sign2:toString()) 

-- local signbak = byteSlice.new() 
-- signbak:append(signdata1:toString())
-- local hashbak = byteSlice.new() 
-- hashbak:append(hashdata1:toString())
-- local signbak = byteSlice.new() 
-- signbak:append(sign1:toString()) 

-- print(signdata1:toString() == signbak:toString()) 
-- print(hashdata1:toString() == hashbak:toString())
-- print(sign1:toString() == signbak:toString()) 
-- print(signdata1:toString())
-- print(signbak:toString())



local tb = {} 

table.insert( tb, "self.ta" )
table.insert( tb, "self.han" ) 

-- local tb = {
--     TabAddr = "self.ta",
--     Hand = "self.han",
--     SettleList = {},
-- }

local list = {} 
for i=1,2 do
    local gdb = {}
    -- gdb.ID = i 
    -- gdb.Won = 666
    -- gdb.Flag = 1
    table.insert( gdb, i)
    table.insert( gdb, 666 )
    table.insert( gdb, 1)
    table.insert( list, gdb)
end
-- print(table.maxn(list)) 
table.insert( tb, list )
-- local tbstr = json.encode(tb)
-- print(tbstr) 

-- print(type(tb)) 
-- print(table.maxn(tb))
-- for i,v in ipairs(tb) do
--     print(type(v))
-- end



-- ge.TestSignHash(list) 

local ub =  ge.Encode(1234567)
local n = 0 

local nd = ge.Decode(ub, n) 

print(nd) 
print(n)



local strb = ge.Encode("hello world")

local str = ""
local strd = ge.Decode(strb, str) 
print(strd)
print(str)

local tl = {} 
table.insert( tl, 8 )
table.insert( tl, 9 )
table.insert( tl, 10 )
local tlb =  ge.Encode(tl)

local tlds = {}
table.insert( tlds, 0 )
table.insert( tlds, 0 )
table.insert( tlds, 0 ) 
local tldsr = ge.Decode(tlb, tlds) 
for i,v in ipairs(tlds) do
    print(i,v)
end

for i,v in ipairs(tldsr) do
    print(i,v)
end




local listb = ge.Encode(list)

local listds = {} 
for i=1,2 do
    local gdb = {}
    -- gdb.ID = i 
    -- gdb.Won = 666
    -- gdb.Flag = 1
    table.insert( gdb, 0)
    table.insert( gdb, 0 )
    table.insert( gdb, 0)
    table.insert( listds, gdb)
end

local listdsr = ge.Decode(listb, listds) 

for i,v in ipairs(listds) do
    print(i,v)
    for ii,vv in ipairs(v) do
        print(ii,vv)
    end
end
for i,v in ipairs(listdsr) do
    print(i,v)
    for ii,vv in ipairs(v) do
        print(ii,vv)
    end
end


local struct = {}
table.insert( struct, "hello" )
table.insert( struct,  123 )

local structb =  ge.Encode(struct)

local structds = {} 
table.insert( structds, "" )
table.insert( structds, 0 )
local structdsr = ge.Decode(structb, structds) 

for i,v in ipairs(structds) do
    print(i,v)
end
for i,v in ipairs(structdsr) do
    print(i,v)
end

local neststruct = {}
table.insert( neststruct, "world" )
table.insert( neststruct,  222 )
local nsitem = {} 
table.insert( nsitem, "hello" )
table.insert( nsitem,  333 )
table.insert( neststruct, nsitem )
local neststructb =  ge.Encode(neststruct)

local neststructds = {}
table.insert( neststructds, "" )
table.insert( neststructds,  0 )
local nsitemds = {} 
table.insert( nsitemds, "" )
table.insert( nsitemds,  0 )
table.insert( neststructds, nsitemds )
local neststructdsr = ge.Decode(neststructb, neststructds)

for i,v in ipairs(neststructds) do
    print(i,v)
    if type(v) == "table" then
        for ii,vv in ipairs(v) do
            print(ii,vv)
        end
    end
end

for i,v in ipairs(neststructdsr) do
    print(i,v)
    if type(v) == "table" then
        for ii,vv in ipairs(v) do
            print(ii,vv)
        end
    end
end

local tbb =  ge.Encode(tb)

local tbds = {} 

table.insert( tbds, "" )
table.insert( tbds, "") 

-- local tb = {
--     TabAddr = "self.ta",
--     Hand = "self.han",
--     SettleList = {},
-- }

local listds = {} 
for i=1,2 do
    local gdbds= {}
    -- gdb.ID = i 
    -- gdb.Won = 666
    -- gdb.Flag = 1
    table.insert( gdbds, 0)
    table.insert( gdbds,  0 )
    table.insert( gdbds, 0)
    table.insert( listds, gdbds)
end
-- print(table.maxn(list)) 
table.insert( tbds, listds ) 

local tbdsr = ge.Decode(tbb, tbds)

for i,v in ipairs(tbds) do
    print(i,v)
    if type(v) == "table" then
        for ii,vv in ipairs(v) do
            print(ii,vv)
            if type(vv) =="table" then
                for iii,vvv in ipairs(vv) do
                    print(iii,vvv)
                end
            end
        end
    end
end

for i,v in ipairs(tbdsr) do
    print(i,v)
    if type(v) == "table" then
        for ii,vv in ipairs(v) do
            print(ii,vv)
            if type(vv) =="table" then
                for iii,vvv in ipairs(vv) do
                    print(iii,vvv)
                end
            end
        end
    end
end