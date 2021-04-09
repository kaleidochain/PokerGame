# 合约接口说明

## 桌子信息相关
### getTableInfo 
旧的获取桌子信息接口（无法携带更多字段）

### getTableInfoEx 
新的获取桌子信息接口（使用rlp编码）

### PlayedTables
玩家玩过的桌子信息列表（内部调用getTableInfoEx）

## 玩家信息相关
### getTablePlayers
获取当前桌子上的玩家信息

### PlayedList
获取这个桌子曾经玩过的玩家信息(包含输赢筹码数)
