var Gametoken = artifacts.require("Gametoken");
var promoToken = artifacts.require("PromoToken")
var PortalToken = artifacts.require("Portal");
var register = artifacts.require("registerInterface");
module.exports = function(deployer, network, accounts){
  var token,portal,promot,registerAddress;
  registerAddress="0xD390BCA8Fc4BD4597F879cB2E75E784D6F97eD54";
  if(network=="mainet"){
    registerAddress="0x2d131543A52DC69252d298c186BbE1032E6784C7";
  }
  register.setProvider(deployer.provider);
  
  deployer.then(function(){
    return deployer.deploy(PortalToken);
  }).then(function(ret){
    portal = ret;
    return deployer.deploy(Gametoken,"dezgameToken",{value:1e18});
  }).then(function(ret){
    token = ret;
    return deployer.deploy(promoToken,"dezpromoToken",token.address,{value:1e20});
  }).then(async function(ret){
    promot = ret;
    register = await register.at(registerAddress);
    //await token.setTransactor(promot.address);
    await portal.setgameToken(token.address);
    await portal.setpromoToken(promot.address);
    // await portal.setgameToken("0x2cf2baa9cb992992fdea80b522d4e14c5f9ded4a");
    // await portal.setpromoToken("0x4adb843aed8d018bc0d1a80302a5532ef2c0651a");

    await register.set("pointPortal",portal.address);
  })
}
