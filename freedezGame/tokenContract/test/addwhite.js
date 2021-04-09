//truffle exec ./test/addwhite.js --network product
//添加白名单
var register = artifacts.require("registerInterface");
var authority = artifacts.require("AuthorityInterface");
var portal = artifacts.require("Portal")
//需要添加的白名单列表
var whitelist=[
	"0x28b8D733800Ffb64A41EaA59470917a96AAB51F0"
]
module.exports = async function(exit) {
	try{
		register.setProvider(web3.currentProvider);
		authority.setProvider(web3.currentProvider);
		portal.setProvider(web3.currentProvider);
		authority = await authority.at("0x1000000000000000000000000000000000000003");
		register = await register.at("0xD390BCA8Fc4BD4597F879cB2E75E784D6F97eD54");
		portalAddress = await register.get("pointPortal");
		portal = portal.at(portalAddress);
		var owner = web3.currentProvider.addresses[0];
		authority.getAll(owner)

		//exit(0)
		for(var i=0;i<whitelist.length;i++){
			var iswhite = await authority.isWhite(owner,whitelist[i]);
			console.log(whitelist[i],iswhite)
			if(!iswhite){
				await authority.addWhite(whitelist[i]);
			}
		}
	} catch(e) {
		console.log(e)
	}
	exit(0);
  }

