local log = require("log")

texas = {}

pokers = {
    {{color ="S", num =1}, {color ="S", num =2}, {color ="S", num =3}, {color ="S", num =4}, {color ="S",num = 5}, {color ="S",num = 6}, {color ="S", num =7}, {color ="S",num = 8}, {color ="S", num =9}, {color ="S",num = 10}, {color ="S", num =11}, {color ="S", num =12}, {color ="S", num =13}},
	{{color ="H", num =1}, {color ="H", num =2}, {color ="H", num =3}, {color ="H", num =4}, {color ="H", num =5}, {color ="H",num = 6}, {color ="H", num =7}, {color ="H", num =8}, {color ="H", num =9}, {color ="H", num =10}, {color ="H", num =11}, {color ="H", num =12}, {color ="H", num =13}},
	{{color ="C", num =1}, {color ="C", num =2}, {color ="C", num =3}, {color ="C",num = 4}, {color ="C", num =5}, {color ="C",num = 6}, {color ="C", num =7}, {color ="C", num =8}, {color ="C", num =9}, {color ="C", num =10}, {color ="C",num = 11}, {color ="C", num =12}, {color ="C", num =13}},
	{{color ="D", num =1}, {color ="D", num =2}, {color ="D", num =3}, {color ="D", num =4}, {color ="D", num =5}, {color ="D", num =6}, {color ="D", num =7}, {color ="D",num = 8}, {color ="D", num =9}, {color ="D",num = 10}, {color ="D", num =11}, {color ="D",num = 12}, {color ="D",num = 13}},
}

function clone(object)
    local lookup_table = {}
    local function copyObj(object)
        if type(object) ~= "table" then
            return object
        elseif lookup_table[object] then
            return lookup_table[object]
        end
        
        local new_table = {}
        lookup_table[object] = new_table
        for key, value in pairs(object) do
            new_table[copyObj(key)] = copyObj(value)
        end
        return setmetatable(new_table, getmetatable(object))
    end
    return copyObj(object)
end

local deepcopy = function(object)
    local lookup_table = {}
    local function _copy(object)
        if type(object) ~= "table" then
            return object
        elseif lookup_table[object] then
            return lookup_table[object]
        end
        local new_table = {}
        lookup_table[object] = new_table
        for index, value in pairs(object) do
            new_table[_copy(index)] = _copy(value)
        end
        return setmetatable(new_table, getmetatable(object))
    end

    return _copy(object)
end

function print_r(t)
    local print_r_cache={}
    local function sub_print_r(t,indent)
        if print_r_cache[tostring(t)] then
            print(indent .. "*" .. tostring(t))
        else
            print_r_cache[tostring(t)]=true
            if type(t) == "table" then
                for pos, val in pairs(t) do
                    if type(val) == "table" then
                        print(indent .. "[" .. pos .. "] => " .. tostring(t) .. " {")
                        sub_print_r(val, indent .. string.rep(" ", string.len(pos) + 8))
                        print(indent .. string.rep(" ", string.len(pos) + 6) .. "}")
                    elseif type(val)=="string" then
                        print(indent .. "[" .. pos .. '] => "' .. val .. '"')
                    else
                        print(indent .. "[" .. pos .. "] => " .. tostring(val))
                    end
                end
            else
                print(indent .. tostring(t))
            end
        end
    end
    if type(t) == "table" then
        print(tostring(t) .. " {")
        sub_print_r(t, "  ")
        print("}")
    else
        sub_print_r(t, "  ")
    end
    print()
end

function texas.Merge(arg) 
    assert(type(arg) == "table", "bad argument, expected table")
    local slice = {}
    local s = clone(arg)

    if #s == 0 then
        return slice
    elseif #s == 1 then
        slice = clone(s[1])
        return slice
    else
        local s1 = clone(s[1])
        table.remove(s, 1)
        local s2 = texas.Merge(s)
        for k, v in ipairs(s1) do
            table.insert(slice, v)
        end
        
        for k, v in ipairs(s2) do
            table.insert(slice, v)
        end 
        return slice
    end
end

function texas.MergePokers(arg)
    assert(type(arg) == "table", "bad argument, expected table")
    for k, v in ipairs(arg) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    local slice = {}
    local s = clone(arg)
   
    if #s == 0 then
        return slice
    elseif #s == 1 then
        slice = clone(s[1])
        return slice
    else 
        local s1 =clone(s[1])
        table.remove(s, 1)
        local s2 = texas.MergePokers(s)

        for k, v in ipairs(s1) do
            table.insert(slice, {color = v.color, num = v.num})
        end

        for k, v in ipairs(s2) do
            table.insert(slice, {color = v.color, num = v.num})
        end
        return slice
    end
end

function cardsCmpNumdes(a, b)
    return a.num > b.num
end


function cardsCmpNumasc(a, b)
    return a.num < b.num
end

function texas.Max(cards, except)
    assert(type(cards) == "table", "bad argument, expected table")
    for k, v in ipairs(cards) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    assert(type(except) == "table", "bad argument, expected table")
    for k, v in ipairs(except) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    local icard = clone(cards)
    local iexcept = clone(except)
    local max = {}
    table.sort(icard, cardsCmpNumdes)

    for ck, cv in ipairs(icard) do
        local isContain = false  
        for ek, ev in ipairs(iexcept) do 
            if ev.num == cv.num then
                isContain = true
                break
            end
        end 

        -- if (isContain == true) then
        --     -- body
        --     goto continue 
        -- else
        --     max = cv
        --     break
        -- end 
        -- ::continue::
        if isContain == false then
            max = cv 
            break
        end
    end
    return max 
end

function texas.MapCards(num)
    assert(type(num) == "table", "bad argument, expected table")  
    local pokercard = {} 
    for k, v in ipairs(num) do
        --lua??1??? ?????1
        --go??0??? ???????1
        local x = math.modf((v)/13) --v / 13
        local y = math.fmod(v,13)  -- v % 13 
        -- print("x=", x, "y=", y)
       
     
        local poker = pokers[x+1][y+1] 
        local item = {color = poker.color, num = poker.num}
        table.insert(pokercard, item)
    end
    log.Trace("texas.MapCards() pokercard", pokercard)
    return pokercard
end

function texas.calColorBucket(handPokers) 
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    local colorBucket = {} 

    for hk, hv in ipairs(handPokers) do 
        if colorBucket[hv.color] == nil then
            colorBucket[hv.color] = {} 
            table.insert( colorBucket[hv.color], {color = hv.color, num = hv.num})
        else
            table.insert(colorBucket[hv.color], {color = hv.color, num = hv.num})
        end
    end
    log.Trace("texas.calColorBucket() colorBucket", colorBucket)
    return colorBucket
end

function texas.calNumBucket(handPokers)
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    local numBucket = {}

    for hk, hv in ipairs(handPokers) do
        if numBucket[hv.num] == nil then
            numBucket[hv.num] = {}
            table.insert(numBucket[hv.num], {color = hv.color, num = hv.num})
        else
            table.insert(numBucket[hv.num], {color = hv.color, num = hv.num})
        end
    end

    log.Trace("texas.calNumBucket() numBucket", numBucket)
    return numBucket
end

-- 检查最小顺子，A在顺子里面是否相当于1的特殊情况,（如：A、2、3、4、5、A、A,此时还是12345顺子）
function texas.CheckSmallestStraight(handPokers)
    local checkNum = {}
    local result = {}
    for i,poker in pairs(handPokers) do
        checkNum[poker.num] = poker.color
    end
    -- handPokers里的是真实值-1
    if checkNum[13] ~= nil and checkNum[1] ~= nil and  checkNum[2] ~= nil and checkNum[3] ~= nil
            and checkNum[4] ~= nil and checkNum[5] == nil then  -- 必须没有6，不然就是23456了
        table.insert(result,{color = checkNum[13],num = 13})
        table.insert(result,{color = checkNum[1],num = 1})
        table.insert(result,{color = checkNum[2],num = 2})
        table.insert(result,{color = checkNum[3],num = 3})
        table.insert(result,{color = checkNum[4],num = 4})
        return true,result
    end
    return false,result
end

function texas.calSeries(handPokers)
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    local existSmallest, smallestResult = texas.CheckSmallestStraight(handPokers)
    if existSmallest == true then
        return true,smallestResult
    end
    table.sort(handPokers, cardsCmpNumasc)

    local counts = 1
    local current = {color = handPokers[1].color, num = handPokers[1].num} --handPokers[1]
    local series = {}
    table.insert(series,{color = handPokers[1].color, num = handPokers[1].num})
    local result = {}
    for i = 2, #handPokers do
        repeat
            if handPokers[i].num == current.num then
                break
            elseif handPokers[i].num == current.num +1 then
                table.insert(series, {color = handPokers[i].color, num = handPokers[i].num})
                counts = counts + 1 
                if counts >= 5 then
                    local start = counts - 5 + 1
                    result = {}
                    for i = start, #series do
                        table.insert(result, {color = series[i].color, num = series[i].num})
                    end
                end
            else
                series = {} 
                table.insert(series, {color = handPokers[i].color, num = handPokers[i].num})
                counts = 1
            end
            current = {color = handPokers[i].color, num = handPokers[i].num}
        until true
    end

    return #result >= 5, result
end

function texas.getLevelName(i)
    if i == 9 then
        return "皇家同花顺"
    elseif i == 8 then
        return "同花顺"
    elseif i == 7 then
        return "四条"
    elseif i == 6 then
        return "葫芦"
    elseif i == 5 then
        return "同花"
    elseif i == 4 then
        return "顺子"
    elseif i == 3 then
        return "三条"
    elseif i == 2 then
        return "两对"
    elseif i == 1 then
        return "对子"
    elseif i == 0 then
        return "高牌"
    else 
        return ""
    end
end

function texas.check2Same(handPokers, colorBucket, numBucket)
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(colorBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(colorBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(numBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(numBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    local cards = {}
    local two = nil
   
    for k, v in pairs(numBucket) do
        if #v == 2 then
            if two == nil then
                two = {}
                for kk, vv in ipairs(v) do
                    table.insert(two, {color = vv.color, num = vv.num})
                end
            else
                if two[1].num < v[1].num then
                    two = {}
                    for kk, vv in ipairs(v) do
                        table.insert(two, {color = vv.color, num = vv.num})
                    end
                end
            end
        end
    end

    if two ~= nil then
        cards = two
        local poker1 = texas.Max(handPokers, cards)
        table.insert(cards, poker1)
        local poker2 = texas.Max(handPokers, cards)
        table.insert(cards, poker2)
        local poker3 = texas.Max(handPokers, cards)
        table.insert(cards, poker3)

        return true, cards
    end

    return false, nil
end

function texas.chek22Same(handPokers, colorBucket, numBucket)
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(colorBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(colorBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(numBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(numBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    local cards = {}
    local two1 = nil
    local two2 = nil   
    for k, v in pairs(numBucket) do 
        if #v == 2 then
            if two1 == nil then
                two1 = {}
                for kk, vv in ipairs(v) do
                    table.insert(two1, {color = vv.color, num = vv.num})
                end
            elseif two2 == nil then
                two2 = {}
                for kk, vv in ipairs(v) do
                    table.insert(two2, {color = vv.color, num = vv.num})
                end
            else
                if two1[1].num < v[1].num then
                    --copy(two1, two2)
                    two1 = {}
                    for kk, vv in ipairs(v) do
                        table.insert(two1, {color = vv.color, num = vv.num})
                    end
                elseif two2[1].num < v[1].num then
                    two2 = {}
                    for kk, vv in ipairs(v) do
                        table.insert(two2, {color = vv.color, num = vv.num}) 
                    end
                end
            end
        end
    end

    if two1 ~= nil and two2 ~= nil then
        if two1[1].num < two2[1].num then 
            local temp = {}
            table.insert(temp, two2)
            table.insert(temp, two1)
            cards = texas.MergePokers(temp)
        else
            local temp = {}
            table.insert(temp, two1)
            table.insert(temp, two2)
            cards = texas.MergePokers(temp)
        end
        
        local poker = texas.Max(handPokers, cards)
        table.insert(cards, poker)

        return true, cards
    end

    return false, nil
end

function texas.check3Same(handPokers, colorBucket, numBucket)
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(colorBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(colorBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(numBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(numBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
 
    local cards = {}
    local three = nil 
    for k, v in pairs(numBucket) do 
        if #v == 3 then
            if three == nil then
                three = {}
                for kk, vv in ipairs(v) do
                    table.insert(three, {color = vv.color, num = vv.num})
                end
            else
                if three[1].num < v[1].num then
                    three = {}
                    for kk, vv in ipairs(v) do
                        table.insert(three, {color = vv.color, num = vv.num})
                    end
                end
            end
        end
    end

    if three ~= nil then
        cards = three
        local poker1 = texas.Max(handPokers, cards) 
        table.insert(cards, poker1)
        local poker2 = texas.Max(handPokers, cards)
        table.insert(cards, poker2)
        return true, cards 
    end

    return false, nil 
end

function texas.checkSeries(handPokers, colorBucket, numBucket)
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(colorBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(colorBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(numBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(numBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    -- return  texas.calSeries(handPokers)
    local flag, result = texas.calSeries(handPokers)
    -- print("fuck reslt len:", #result)
    -- print_r(result)
    return flag, result
end

function texas.checkTH(handPokers, colorBucket, numBucket)
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(colorBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(colorBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(numBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(numBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    for k, v in pairs(colorBucket) do
        if #v >= 5 then
            table.sort(v, cardsCmpNumdes)
            local temp = {} 
            for kk, vv in ipairs(v) do
                table.insert(temp, {color = vv.color, num = vv.num})
                if kk == 5 then
                    return true , temp
                end
            end
        end
    end

    return false, nil 
end

function texas.check32Same(handPokers, colorBucket, numBucket)
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(colorBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(colorBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(numBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(numBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    local three = nil
    local two = nil
    for k, v in pairs(numBucket) do --要处理两个三条的情况
        log.Debug("k", k, "v", v)
        if #v == 3 then
            if three == nil then
                three = {}
                for kk, vv in ipairs(v) do
                   table.insert(three, {color = vv.color, num = vv.num}) 
                end
            else
                if three[1].num < v[1].num then
                    three = {}
                    for kk, vv in ipairs(v) do
                        table.insert(three, {color = vv.color, num = vv.num})
                    end
                end

                --两个三条，小的要作为一对形成葫芦
                two = {} --总共最多7张牌，最多两个三条
                if three[1].num < v[1].num then
                    table.insert(two, three[1])
                    table.insert(two, three[2])
                else
                    table.insert(two, {color = v[1].color, num = v[1].num})
                    table.insert(two, {color = v[2].color, num = v[2].num})
                end
            end
        end

        if #v == 2 then
            if two == nil then
                two = {}
                for kk, vv in ipairs(v) do
                   table.insert(two, {color = vv.color, num = vv.num}) 
                end
            else
                if two[1].num < v[1].num then
                    two = {}
                    for kk, vv in ipairs(v) do
                        table.insert(two, {color = vv.color, num = vv.num})
                    end
                end
            end
        end
    end

    if three ~= nil and two ~= nil then
        local temp = {}
        table.insert( temp, three)
        table.insert( temp,  two )
        local mpoke = texas.MergePokers(temp)
        return true, mpoke
    end

    return false , nil 
end

function texas.check4Same( handPokers, colorBucket, numBucket)
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(colorBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(colorBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(numBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(numBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    for k,v in pairs(numBucket) do
        if #v == 4 then
            local m = texas.Max(handPokers, v)
            local temp = {}
            table.insert(temp, m)
            local temp2 = {}
            table.insert(temp2, v)
            table.insert(temp2, temp)
            local mgp = texas.MergePokers(temp2)

            return true, mgp 
        end
    end

    return false, nil
end

function texas.checkTHS(handPokers, colorBucket, numBucket)
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(colorBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(colorBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(numBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(numBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    for k, v in pairs(colorBucket) do
        if #v >= 5 then
            return texas.calSeries(v)
        end
    end

    return false, nil
end

function texas.compareInLevel(str1, str2, level)
    log.Trace("compareInLevel str1",str1,"str2",str2,"level",level)
    local len1 = #str1
    local len2 = #str2
    assert(type(str1) == "table", "bad argument, expected table")
    for k, v in ipairs(str1) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(str2) == "table", "bad argument, expected table")
    for k, v in ipairs(str2) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(level) == "number", "bad argument, expected number")

    if level == -1 then
        if type(str1[1]) == "nil" and type(str2[1]) ~= "nil" then
            return -1
        elseif type(str1[1]) ~= "nil" and type(str2[1]) == "nil" then
            return 1
        elseif type(str1[1]) == "nil" and type(str2[1]) == "nil" then
            return 0 
        end 
    end
    -- 最小顺子: A 2 3 4 5
    if len1 >= 5 and str1[1].num == 13 and str1[2].num == 1 and str1[3].num == 2
            and str1[4].num == 3 and str1[5].num == 4 then
        return -1
    end
    if len2 >= 5 and str2[1].num == 13 and str2[2].num == 1 and str2[3].num == 2
            and str2[4].num == 3 and str2[5].num == 4 then
        return -1
    end
    if len1 ~= len2 then
        log.Trace("compareInLevel error len,len1",len1,"len2",len2)
        return 0
    end
    for i = 1, len1 do
        if (str1[i].num > str2[i].num) then
            return 1
        elseif (str1[i].num < str2[i].num) then
            return -1
        end
    end
    return 0 
end

function texas.checkLevel(handPokers, colorBucket, numBucket)
    assert(type(handPokers) == "table", "bad argument, expected table")
    for k, v in ipairs(handPokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(colorBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(colorBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(numBucket) == "table", "bad argument, expected table")
    for k, v in ipairs(numBucket) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    local gencards = nil 
    local itis = false 
    local cards = nil 

    itis, cards = texas.checkTHS(handPokers, colorBucket, numBucket)
    if itis == true then
        gencards = cards 
        if cards[1].num == 9 then
            return 9, gencards
        else
            return 8, gencards
        end
    end

    itis, cards = texas.check4Same(handPokers, colorBucket, numBucket)
    if itis == true then
        gencards = cards
        return 7, gencards
    end

    itis, cards = texas.check32Same(handPokers, colorBucket, numBucket)
    if itis == true then
        gencards = cards
        return 6, gencards
    end

    itis, cards = texas.checkTH(handPokers, colorBucket, numBucket)
    if itis == true then
        gencards = cards
        return 5, gencards
    end

    itis, cards = texas.checkSeries(handPokers, colorBucket, numBucket)
    if itis == true then
        -- body
        gencards = cards
        return 4, gencards
    end

    itis, cards = texas.check3Same(handPokers, colorBucket, numBucket)
    if itis == true then
        gencards = cards
        return 3, gencards
    end

    itis, cards = texas.chek22Same(handPokers, colorBucket, numBucket)
    if itis == true then
        gencards = cards
        return 2, gencards
    end

    itis, cards = texas.check2Same(handPokers, colorBucket, numBucket)
    if itis == true then
        gencards = cards
        return 1, gencards
    end

    table.sort(handPokers, cardsCmpNumdes)

    gencards = {} 

    for i, v in ipairs(handPokers) do
        table.insert(gencards, {color = v.color, num = v.num})
        if i == 5 then
            return 0, gencards
        end
    end
    return -1,gencards
end

function texas.PokerString(poker)
    assert(type(poker) == "table", "bad argument, expected table")
    -- print_r(poker)
    local numstr = nil

    if poker.num == nil or poker.color == nil then
        return ""
    end

    if poker.num == 10 then
        numstr = "J"
    elseif poker.num == 11 then
        numstr = "Q"
    elseif poker.num == 12 then
        numstr = "K"
    elseif poker.num == 13 then
        numstr = "A"
    else
        local num = poker.num + 1
        numstr = tostring(num)
    end

    if poker.color == "S" then
        return "黑桃" .. numstr
    elseif poker.color == "H" then
        return "红心" .. numstr
    elseif poker.color == "C" then
        return "梅花" .. numstr
    elseif poker.color == "D" then
        return "方块" .. numstr
    end

    return ""
end

--将[{"color":"A","num":9}, {"color":"A","num":10}, {"color":"A","num":11}, {"color":"A","num":12}, {"color":"A","num":13}]转化成["黑桃10", "黑桃J", "黑桃Q", "黑桃K", "黑桃A"]
function texas.GetPokerStringTable(pokers)
    local result = {}
    for i, v in ipairs(pokers) do
        local itemstr = texas.PokerString(v)
        table.insert(result, itemstr)
    end
    return result
end

function texas.Compare(hand1Pokers, hand2Pokers)
    assert(type(hand1Pokers) == "table", "bad argument, expected table")
    for k, v in ipairs(hand1Pokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end
    assert(type(hand2Pokers) == "table", "bad argument, expected table")
    for k, v in ipairs(hand2Pokers) do
        assert(type(v) == "table", "bad argument, expected table")
    end

    local color1Bucket = texas.calColorBucket(hand1Pokers)
    local color2Bucket = texas.calColorBucket(hand2Pokers)
    -- print_r(color1Bucket)
    -- print_r(color2Bucket)

    local num1Bucket = texas.calNumBucket(hand1Pokers)
    local num2Bucket = texas.calNumBucket(hand2Pokers)
    -- print_r(num1Bucket)
    -- print_r(num2Bucket)

    local hand1level, gencards1 = texas.checkLevel(hand1Pokers, color1Bucket, num1Bucket)
    local hand2level, gencards2 = texas.checkLevel(hand2Pokers, color2Bucket, num2Bucket)

    local gencards1tab = texas.GetPokerStringTable(gencards1)
    log.Trace("hand1level " .. tostring(hand1level) .. "=>" .. texas.getLevelName(hand1level) .. " 成牌", json.encode(gencards1tab))

    local gencards2tab = texas.GetPokerStringTable(gencards1)
    log.Trace("hand2level " .. tostring(hand2level) .. "=>" .. texas.getLevelName(hand2level) .. " 成牌", json.encode(gencards1tab))
   

    if hand1level > hand2level then
        return 1
    elseif hand1level < hand2level then
        return -1
    else
        local nComp = texas.compareInLevel(gencards1, gencards2, hand1level)
        log.Trace("Compare() nComp", nComp)
        return nComp 
    end
end
 
local exceptNums = {}

local function generateRandomNumber(start,endd, count)
    if endd < start or (endd - start) < count then
        return nil 
    end

    local nums = {} 

    math.randomseed(os.time())

    repeat 
        log.Trace("repeat.......", "")
        num = math.random(endd - start) + start 

        local exist = false

        for i, v in ipairs(exceptNums) do
            if v == num then
                exist = true
                break
            end
        end
        
        if exist == false then
            table.insert(exceptNums, num)
            table.insert(nums, num)
        end
    until (#nums == count)

    return nums
end


function texas.Start()
    desk  = generateRandomNumber(0, 52, 5)
    hand1 = generateRandomNumber(0, 52, 2)
    hand2 = generateRandomNumber(0, 52, 2)
    return desk, hand1, hand2
end

-- 测试用
function tmpTest()
    local tmpPokers = {}
    table.insert(tmpPokers,{color = "C", num = 2})
    table.insert(tmpPokers,{color = "H", num = 1})
    table.insert(tmpPokers,{color = "C", num = 13})
    table.insert(tmpPokers,{color = "D", num = 3})
    table.insert(tmpPokers,{color = "S", num = 13})
    table.insert(tmpPokers,{color = "C", num = 4})
    table.insert(tmpPokers,{color = "S", num = 13})
    local handPokers = tmpPokers
    local flag, result = texas.calSeries(handPokers)
    print("fuck reslt len:", #result)
    log.Info("result:",result)
    local genStr = texas.GetPokerStringTable(result)
    log.Info("genStr:",genStr)


    local tmpPokers2 = {}
    table.insert(tmpPokers2,{color = "C", num = 3})
    table.insert(tmpPokers2,{color = "H", num = 2})
    table.insert(tmpPokers2,{color = "C", num = 1})
    table.insert(tmpPokers2,{color = "D", num = 4})
    table.insert(tmpPokers2,{color = "S", num = 13})
    table.insert(tmpPokers2,{color = "C", num = 5})
    table.insert(tmpPokers2,{color = "S", num = 13})
    local handPokers2 = tmpPokers2
    local flag2, result2 = texas.calSeries(handPokers2)
    print("fuck reslt2 len:", #result2)
    log.Info("result2:",result2)
    local genStr2 = texas.GetPokerStringTable(result2)
    log.Info("genStr2:",genStr2)

    local ncmpresult = texas.compareInLevel(result, result2, 4)
    local finalResult = (ncmpresult >= 0)
    print("finalResult:",finalResult)
end

return texas
