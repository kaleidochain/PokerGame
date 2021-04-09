 _class={}
 
function class(super)
	local class_type={}
	class_type.ctor=false
	class_type.super=super
	class_type.new=function(...) 
			local obj={}
			do
				local create
				create = function(c,...)
					if c.super then
						create(c.super,...)
					end
					if c.ctor then
						c.ctor(obj,...)
					end
				end
 
				create(class_type,...)
			end
			setmetatable(obj,{ __index=_class[class_type] })
			return obj
		end
	local vtbl={}
	_class[class_type]=vtbl
 
	setmetatable(class_type,{__newindex=
		function(t,k,v)
			vtbl[k]=v
		end
	})
 
	if super then
		setmetatable(vtbl,{__index=
			function(t,k)
				local ret=_class[super][k]
				vtbl[k]=ret
				return ret
			end
		})
	end
 
	return class_type
end

function CreateEnumTable(tbl, index)
    local enumtbl = {}
    local enumindex = index or 0
    for i, v in ipairs(tbl) do
        enumtbl[v] = enumindex + i
    end
    return enumtbl
end

function Sleep(n)
    if n > 0 then os.execute("ping -n " .. tonumber(n + 1) .. " localhost > NUL") end
end

function bin2hex(s)
    s = string.gsub(s,"(.)",function (x) return string.format("%02x",string.byte(x)) end)
    return s
end

function bin2string(s)
    local addr = bin2hex(s)
    local naddr = newAddress(addr)
    return naddr:Hex()
end

function stopTimer(timer)
    if timer ~= nil then
        timer:stop()
        --timer = nil --置空失败
    end
end

function getMapLength(t)
    local len = 0
    for i, v in pairs(t) do
        --print(i,v)
        len = len + 1
    end
    return len
end
