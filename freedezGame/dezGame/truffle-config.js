var HDWalletProvider = require("truffle-hdwallet-provider");
var testpri = "f1375feeb6aef1838f7e7ef448fe3308e17884fe334e92aa71a5e1642a394768";
var testnet = new HDWalletProvider(testpri, "http://45.249.245.3:38547");
var product = new HDWalletProvider(testpri, "http://106.75.184.214:9547");
var mainpri = "2f1cb8fed83cc906ffb0b5ff18bcfa2d377a818cb2e2bb72853ff7cc9e3606ea";
var mainet =  new HDWalletProvider(mainpri, "https://api.kalscan.io/mainnet");
//mainpri = "f1375feeb6aef1838f7e7ef448fe3308e17884fe334e92aa71a5e1642a394768";
module.exports = {
  networks: {
    mainet: {
      network_id: "*",       // Any network (default: none)
      provider:mainet,
      from:"0xa25f406Dd5A4bff511c2dc226EA5cf3B0A4434A8",
      gas: 20000000,
    },
    testnet: {
      network_id: "*",       // Any network (default: none)
      provider:testnet,
      from:"0x0557d37d996b123fc1799b17b417a6e5d6773038",
      gas: 20000000,
    },
    product: {
      network_id: "*",       // Any network (default: none)
      provider:product,
      from:"0x0557d37d996b123fc1799b17b417a6e5d6773038",
      gas: 20000000,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.5.1",    // Fetch exact version from solc-bin (default: truffle's version)
      docker: false,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
       //evmVersion: "byzantium"
      }
    }
  }
}
