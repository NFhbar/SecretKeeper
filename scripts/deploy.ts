import { ethers } from "hardhat";

async function main() {
  const SecretKeeper = await ethers.getContractFactory("SecretKeeper");
  const secretKeeper = await SecretKeeper.deploy();

  await secretKeeper.deployed();

  console.log(
    `secretKeeper deployed`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
