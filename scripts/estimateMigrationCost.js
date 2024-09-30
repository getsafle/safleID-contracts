const Web3 = require("web3");
const axios = require("axios");

// Import your contract ABIs
const Migrations = require("../build/contracts/Migrations.json");
const MainContract = require("../build/contracts/RegistrarMain.json");
const RegistrarStorage = require("../build/contracts/RegistrarStorage.json");
const Auction = require("../build/contracts/Auction.json");
const Checking = require("../build/contracts/checkingContract.json");
const dotenv = require("dotenv");
dotenv.config();

// You'll need to set these values
const PRIVATE_KEY = process.env.ROOTSTOCK_PRIVATE_KEY;
const PROVIDER_URL = "https://public-node.testnet.rsk.co"; // RSK Mainnet

const web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));

async function estimateMigrationCost() {
  try {
    const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    let totalGasUsed = web3.utils.toBN("0");

    const contracts = [
      {
        name: "Migrations",
        abi: Migrations.abi,
        bytecode: Migrations.bytecode,
      },
      {
        name: "RegistrarMain",
        abi: MainContract.abi,
        bytecode: MainContract.bytecode,
      },
      {
        name: "RegistrarStorage",
        abi: RegistrarStorage.abi,
        bytecode: RegistrarStorage.bytecode,
      },
      { name: "Auction", abi: Auction.abi, bytecode: Auction.bytecode },
      {
        name: "checkingContract",
        abi: Checking.abi,
        bytecode: Checking.bytecode,
      },
    ];

    for (const contract of contracts) {
      const Contract = new web3.eth.Contract(contract.abi);
      let deployParams = [];
      if (contract.name === "RegistrarMain") {
        deployParams = ["0xebda8892718AA921EA213EDc53238A1569Cc302c"];
      } else if (
        contract.name === "RegistrarStorage" ||
        contract.name === "Auction"
      ) {
        // Using a dummy address for estimation
        deployParams = ["0x0000000000000000000000000000000000000000"];
      }

      const deploymentGas = await Contract.deploy({
        data: contract.bytecode,
        arguments: deployParams,
      }).estimateGas({ from: account.address });

      totalGasUsed = totalGasUsed.add(web3.utils.toBN(deploymentGas));
      console.log(
        `Estimated gas for deploying ${contract.name}: ${deploymentGas}`
      );
    }

    // Mock deployment of MainContract for method gas estimation
    const mainContract = new web3.eth.Contract(MainContract.abi);
    const mockDeployTx = mainContract.deploy({
      data: MainContract.bytecode,
      arguments: ["0xebda8892718AA921EA213EDc53238A1569Cc302c"],
    });
    const mockGasEstimate = await mockDeployTx.estimateGas({
      from: account.address,
    });

    const mockDeployment = await mockDeployTx.send({
      from: account.address,
      gas: mockGasEstimate,
      gasPrice: 0x3b9aca00, // Set gas price to 0 for estimation purposes
    });

    // Estimate gas for additional transactions
    const setStorageContractGas = await mockDeployment.methods
      .setStorageContract("0x0000000000000000000000000000000000000000")
      .estimateGas({ from: account.address });
    totalGasUsed = totalGasUsed.add(web3.utils.toBN(setStorageContractGas));
    console.log(
      `Estimated gas for setStorageContract: ${setStorageContractGas}`
    );

    const setSafleIdFeesGas = await mockDeployment.methods
      .setSafleIdFees(0)
      .estimateGas({ from: account.address });
    totalGasUsed = totalGasUsed.add(web3.utils.toBN(setSafleIdFeesGas));
    console.log(`Estimated gas for setSafleIdFees: ${setSafleIdFeesGas}`);

    const setRegistrarFeesGas = await mockDeployment.methods
      .setRegistrarFees(0)
      .estimateGas({ from: account.address });
    totalGasUsed = totalGasUsed.add(web3.utils.toBN(setRegistrarFeesGas));
    console.log(`Estimated gas for setRegistrarFees: ${setRegistrarFeesGas}`);

    // Get current gas price
    const gasPrice = await web3.eth.getGasPrice();

    // Calculate total cost in wei
    const totalCostWei = web3.utils.toBN(gasPrice).mul(totalGasUsed);
    const totalCostRBTC = web3.utils.fromWei(totalCostWei, "ether");

    // Get RBTC/INR rate from CoinGecko
    const rbtcINRRate = (
      await axios.get("https://api.coingecko.com/api/v3/coins/rootstock")
    ).data.market_data.current_price.inr;

    // Calculate total cost in INR
    const totalCostINR = (parseFloat(totalCostRBTC) * rbtcINRRate).toFixed(2);

    console.log(`\nTotal estimated gas: ${totalGasUsed.toString()}`);
    console.log(`Estimated total cost: ${totalCostRBTC} RBTC`);
    console.log(`Estimated total cost: ${totalCostINR} INR`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
estimateMigrationCost()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
