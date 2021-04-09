local eth = require("eth")
local log = require("log")
local ge = require("gameengine")
local PortalAddr = "0x8f09b7e306a467ebd07efbd6f36807e1c939489e"     --测试网新链积分桌
--local PortalAddr = "0x11ecdc57c3b5600978464c00e13173858c377034"     --测试网旧链积分桌
--local PortalAddr = "0x147678a645ba07be64b6788b795595cdac2a8f0a"   --测试网俱乐部
--local PortalAddr = "0x9c63648235488f48615a27e884fde39b5deedb3b"     --测试网不带俱乐部
--local PortalAddr = "0xd390bca8fc4bd4597f879cb2e75e784d6f97ed54"
local PortalABI = "[{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"Inviter\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"promoToken\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"Agents\",\"outputs\":[{\"name\":\"code\",\"type\":\"string\"},{\"name\":\"balance\",\"type\":\"uint256\"},{\"name\":\"withdraw\",\"type\":\"uint256\"},{\"name\":\"num\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"gameToken\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"gameContract\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"clubToken\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"fallback\"},{\"constant\":false,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"}],\"name\":\"setClubContract\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"}],\"name\":\"setgameContract\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"}],\"name\":\"setpromoToken\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"}],\"name\":\"setgameToken\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_type\",\"type\":\"string\"},{\"name\":\"_name\",\"type\":\"string\"},{\"name\":\"_version\",\"type\":\"string\"},{\"name\":\"_bootfile\",\"type\":\"string\"}],\"name\":\"setLua\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_type\",\"type\":\"string\"}],\"name\":\"name\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_type\",\"type\":\"string\"}],\"name\":\"version\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_type\",\"type\":\"string\"}],\"name\":\"bootfile\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_type\",\"type\":\"string\"}],\"name\":\"vhash\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_type\",\"type\":\"string\"},{\"name\":\"_filename\",\"type\":\"string\"},{\"name\":\"_txhash\",\"type\":\"string\"}],\"name\":\"setfile\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_type\",\"type\":\"string\"},{\"name\":\"_filename\",\"type\":\"string\"}],\"name\":\"txhashs\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_type\",\"type\":\"string\"}],\"name\":\"length\",\"outputs\":[{\"name\":\"\",\"type\":\"uint64\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_type\",\"type\":\"string\"},{\"name\":\"_index\",\"type\":\"uint256\"}],\"name\":\"filebyindex\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_code\",\"type\":\"string\"},{\"name\":\"player\",\"type\":\"address\"}],\"name\":\"applyCode\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_code\",\"type\":\"string\"},{\"name\":\"player\",\"type\":\"address\"}],\"name\":\"setCode\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"player\",\"type\":\"address\"}],\"name\":\"getCode\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"player\",\"type\":\"address\"}],\"name\":\"withdraw\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"player\",\"type\":\"address\"},{\"name\":\"chips\",\"type\":\"uint256\"}],\"name\":\"divide\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]"

local portal = eth.contract(PortalABI, PortalAddr)

function getAddr(portal, name)
    local addr = portal.Call(name)
    log.Info(name .. " addr", addr:sub(3):lower())
    return addr
end

RoomManagerAddr = getAddr(portal, "gameContract")  -- portal.Call("gameContract")
btAddr = getAddr(portal, "gameToken")  -- portal.Call("gameToken")
promotAddr = getAddr(portal, "promoToken") -- portal.Call("promoToken")
clubAddr = getAddr(portal, "clubToken") -- portal.Call("promoToken")

function downLoadScript(path, version)
    local err = ge.Mkdir(path)
    if err ~= nil then
        error(err)
    end

    local length = portal.Call("length", "gameLua")
    log.Debug("length", length)
    for index = 0, length-1 do
        log.Trace("index", index)
        local filename = portal.Call("filebyindex", "gameLua", index)
        log.Trace("filename", filename)
        local tx = portal.Call("txhashs", "gameLua", filename)
        log.Trace("tx", tx)
        local fileConten = eth.TransactionPayLoad(tx)
        local uncompressData, err = ge.ZlibUncompress(fileConten)
        if err ~= nil then
            ge.RemovePath(path)
            error(err)
        end

        local luafile = ge.FilePathJoint(path, filename)
        local err = ge.WriteFile(luafile, uncompressData)
        if err ~= nil then
            ge.RemovePath(path)
            error(err)
        end
    end

    local versionFile = ge.FilePathJoint(path, "Version.txt")
    local bversion = byteSlice.new()
    bversion:appendString(version)
    local err = ge.WriteFile(versionFile, bversion)
    if err ~= nil then
        ge.RemovePath(path)
        error(err)
    end
end

function PortalStart()
    local gameName = portal.Call("name", "gameLua")
    log.Debug("gameName", gameName)
    if gameName == "" then
        error("invalid gameName")
        return
    end

    local version = portal.Call("version", "gameLua")
    log.Debug("Version", version)
    if version == "" then
        error("invalid version")
        return
    end

    local versionHash = portal.Call("vhash", "gameLua")
    log.Debug("Version Hash", versionHash)
    if versionHash == "" then
        error("invalid versionHash")
        return
    end

    local versionH = version .. "_" .. versionHash

    log.Debug("Version + Hash", versionH)

    local stateDir, err = ge.StateDir()
    if err ~= nil then
        error(err)
    end

    local GameDir = ge.FilePathJoint(stateDir, gameName)

    local Existflag = ge.DirExist(GameDir)

    if Existflag == true then
        log.Debug("existFlag true", GameDir)
        local localversion = ge.ScriptVersion("Version.txt", GameDir)
        log.Debug("local version", localversion)

        if localversion ~= versionH then
            log.Debug("version not equal, versionH", versionH)
            local err = ge.RemovePath(GameDir)
            --print("remove path:", err)
            downLoadScript(GameDir, versionH)
        else
            log.Debug("version", "equal")
        end

    else
        log.Debug("existFlag false", GameDir)
        downLoadScript(GameDir, versionH)
    end

    ge.SetGameEnvironment(RoomManagerAddr, GameDir, PortalAddr)
end

PortalStart()

require("game")
