const Migrations = artifacts.require("Migrations");
const MainContract = artifacts.require("RegistrarMain");
const RegistrarStorage = artifacts.require("RegistrarStorage");
const Auction = artifacts.require("Auction");
const Checking = artifacts.require("checkingContract");

module.exports = function (deployer) {
  deployer.deploy(Migrations);

  deployer
    .deploy(MainContract, "0xebda8892718AA921EA213EDc53238A1569Cc302c")
    .then(function () {
      return deployer.deploy(RegistrarStorage, MainContract.address);
    })
    .then(function () {
      return deployer.deploy(Auction, RegistrarStorage.address);
    })
    .then(function () {
      // Now we call setStorageContract on the deployed MainContract
      return MainContract.deployed().then(function (instance) {
        return instance.setStorageContract(RegistrarStorage.address, {
          from: deployer.networks[deployer.network].from,
        });
      });
    })
    .then(function () {
      // Set the initial SafleId registration fees
      return MainContract.deployed().then(function (instance) {
        return instance.setSafleIdFees(0, {
          from: deployer.networks[deployer.network].from,
        }); // Set the fees to 0.1 ETH
      });
    })
    .then(function () {
      // Set the initial Registrar registration fees
      return MainContract.deployed().then(function (instance) {
        return instance.setRegistrarFees(0, {
          from: deployer.networks[deployer.network].from,
        }); // Set the fees to 0.05 ETH
      });
    })
    .then(function () {
      return deployer.deploy(Checking);
    });
};
