var HDWalletProvider = require("truffle-hdwallet-provider");
var testpri = "f1375feeb6aef1838f7e7ef448fe3308e17884fe334e92aa71a5e1642a394768";
var mainpri = testpri;
mainpri = "f1375feeb6aef1838f7e7ef448fe3308e17884fe334e92aa71a5e1642a394768";
var prividermain = new HDWalletProvider(mainpri, "https://api.kalscan.io/mainnet");
var providerproduct = new HDWalletProvider(testpri, "https://api.kalscan.io/testnet");
providerproduct = new HDWalletProvider(testpri, "http://106.75.184.214:9547");
var provider214 = new HDWalletProvider(testpri, "http://192.168.0.214:8545");
var provider213 = new HDWalletProvider(testpri, "http://192.168.0.213:8545");
var provider212 = new HDWalletProvider(testpri, "http://192.168.0.212:8545");
var provider211 = new HDWalletProvider(testpri, "http://192.168.0.211:8545");
var providerlocal = new HDWalletProvider(testpri, "http://127.0.0.1:8545");
module.exports= {  
    networks: {
        mainet:{
            provider:prividermain,
            network_id: "*",       // Any network (default: none)
            gas: 20000000,
            from:"0xF919E83120B0C6699743cA363Ae31Dd5BA65a108",
        },
        development: {
            provider:providerlocal,
            gas: 20000000,
            network_id: "*", // Match any network id
            from:"0x0557d37d996b123fc1799b17b417a6e5d6773038"
        },
        product: {
            provider:providerproduct,
            gas: 20000000,
            network_id: "889", // Match any network id
            from:"0x0557d37d996b123fc1799b17b417a6e5d6773038"
        },
        testnet: {
            provider:provider211,
            gas: 20000000,
            network_id: "*", // Match any network id
            from:"0x0557d37d996b123fc1799b17b417a6e5d6773038"
        },testnet2: {
            provider:provider212,
            gas: 20000000,
            network_id: "*", // Match any network id
            from:"0x0557d37d996b123fc1799b17b417a6e5d6773038"
        },testnet3: {
            provider:provider213,
            gas: 20000000,
            network_id: "*", // Match any network id
            from:"0x0557d37d996b123fc1799b17b417a6e5d6773038"
        },testnet4: {
            provider:provider214,
            gas: 20000000,
            network_id: "*", // Match any network id
            from:"0x0557d37d996b123fc1799b17b417a6e5d6773038"
        }
    }
    ,
    solc: {
        optimizer: {
          enabled: true,
          runs: 200
        }
    }
};
