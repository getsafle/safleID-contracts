const Migrations = artifacts.require("Migrations");
const MainContract = artifacts.require("RegistrarMain");
const RegistrarStorage = artifacts.require("RegistrarStorage");
const Auction = artifacts.require("Auction");
const Checking = artifacts.require("checkingContract");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(MainContract, '0x543BF648644E38528A35b593466cEA45D002bBC8')
    .then(function() {
      return deployer.deploy(RegistrarStorage, MainContract.address)
        .then(function() {
          return deployer.deploy(Auction, RegistrarStorage.address);
        });;
    });
  deployer.deploy(Checking);
};
