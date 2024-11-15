//script to_deploy_TokenContract
const hre = require("hardhat");

async function main() {
  try {
    console.log(" ##### Deploying AccessCtrlToken Contract #####");

    const [owner, AddrA, AddrB] = await hre.ethers.getSigners();

    const Token = await hre.ethers.getContractFactory("ERC20Token");
    const token = await Token.deploy("Starknet Token", "STK", 18);
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();

    console.log(`Token deployed to: ${tokenAddress}`);
    console.log(`Owner address: ${owner.address}`);

    console.log("\nAdding minter role...");
    const addMinterTx = await token.addMinter(AddrA.address);
    await addMinterTx.wait();
    console.log(`Added ${AddrA.address} as minter`);

    const mintAmount = hre.ethers.parseUnits("1000", 18);
    console.log("\nMinting tokens...");
    const mintTx = await token.connect(AddrA).mint(AddrB.address, mintAmount);
    await mintTx.wait();
    console.log(
      `Minted ${hre.ethers.formatUnits(mintAmount, 18)} tokens to ${
        AddrB.address
      }`
    );

    const transferAmount = hre.ethers.parseUnits("100", 18);
    console.log("\nTransferring tokens...");
    const transferTx = await token
      .connect(AddrB)
      .transfer(owner.address, transferAmount);
    await transferTx.wait();
    console.log(
      `Transferred ${hre.ethers.formatUnits(transferAmount, 18)} tokens to ${
        owner.address
      }`
    );

    const ownerBalance = await token.balanceOf(owner.address);
    const addr2Balance = await token.balanceOf(AddrB.address);

    console.log("\nFinal Balances:");
    console.log(`Owner: ${hre.ethers.formatUnits(ownerBalance, 18)} STK`);
    console.log(`Addr2: ${hre.ethers.formatUnits(addr2Balance, 18)} STK`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });