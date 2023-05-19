import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { getSignatureData } from "../scripts/secret"


describe("SecretKeeper", async function () {

    async function deployContract() {
        const SecretKeeper = await ethers.getContractFactory("SecretKeeper")
        const secretKeeper = await SecretKeeper.deploy()
        return { secretKeeper }
    }

    describe("Secret Keeper", async function () {

        it("Should store secrets correctly", async function () {
            const { secretKeeper } = await loadFixture(deployContract);
            const secret = "secret"
            const [address1, address2] = await ethers.getSigners()
            const privateKey1 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
            const privateKey2 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            const sig1 = await getSignatureData(secret, privateKey1, address1.address, address2.address)
            const sig2 = await getSignatureData(secret, privateKey2, address1.address, address2.address)

            await expect(secretKeeper.storeSecret(address1.address, address2.address, sig1.secretHash, sig1.v, sig1.r, sig1.s, sig2.v, sig2.r, sig2.s))
                .to.emit(secretKeeper, "SecretStored")
                .withArgs(sig1.secretHash, address1.address, address2.address);

        })

        it("Should reveal secret correctly", async function () {
            const { secretKeeper } = await loadFixture(deployContract);
            const secret = "secret"
            const [address1, address2] = await ethers.getSigners()
            const privateKey1 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
            const privateKey2 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            const sig1 = await getSignatureData(secret, privateKey1, address1.address, address2.address)
            const sig2 = await getSignatureData(secret, privateKey2, address1.address, address2.address)

            await expect(secretKeeper.storeSecret(address1.address, address2.address, sig1.secretHash, sig1.v, sig1.r, sig1.s, sig2.v, sig2.r, sig2.s))
                .to.emit(secretKeeper, "SecretStored")
                .withArgs(sig1.secretHash, address1.address, address2.address);

            await expect(secretKeeper.connect(address1).revealSecret(secret)).to.emit(secretKeeper, "SecretRevealed")
                .withArgs(secret, address1.address)
        })

        it("Should not allow other addresses to reveal the secret", async function () {
            const { secretKeeper } = await loadFixture(deployContract);

            // This block mimics the off-chain and off-line functionality of 2 parties signing a secret with their private keys
            const secret = "secret"
            const [address1, address2, address3] = await ethers.getSigners()
            const privateKey1 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
            const privateKey2 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            const sig1 = await getSignatureData(secret, privateKey1, address1.address, address2.address)
            const sig2 = await getSignatureData(secret, privateKey2, address1.address, address2.address)

            await expect(secretKeeper.storeSecret(address1.address, address2.address, sig1.secretHash, sig1.v, sig1.r, sig1.s, sig2.v, sig2.r, sig2.s))
                .to.emit(secretKeeper, "SecretStored")
                .withArgs(sig1.secretHash, address1.address, address2.address);

            await expect(secretKeeper.connect(address3).revealSecret(secret))
                .to.be.revertedWith('Sender must be a party of the secret!');
        })

        it("Should not allow another address to store secret signed by other parties", async function () {
            const { secretKeeper } = await loadFixture(deployContract);

            // This block mimics the off-chain and off-line functionality of 2 parties signing a secret with their private keys
            const secret = "secret"
            const [address1, address2, address3] = await ethers.getSigners()
            const privateKey1 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
            const privateKey2 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            const sig1 = await getSignatureData(secret, privateKey1, address1.address, address2.address)
            const sig2 = await getSignatureData(secret, privateKey2, address1.address, address2.address)

            await expect(secretKeeper.storeSecret(address1.address, address3.address, sig1.secretHash, sig1.v, sig1.r, sig1.s, sig2.v, sig2.r, sig2.s))
                .to.be.revertedWith('Party 1 signature does not match!');
        })

        it("Should not allow to store the wrong secret", async function () {
            const { secretKeeper } = await loadFixture(deployContract);

            // This block mimics the off-chain and off-line functionality of 2 parties signing a secret with their private keys
            const secret1 = "secret1"
            const secret2 = "secret2"
            const [address1, address2, address3] = await ethers.getSigners()
            const privateKey1 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
            const privateKey2 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            const sig1 = await getSignatureData(secret2, privateKey1, address1.address, address2.address)
            const sig2 = await getSignatureData(secret1, privateKey2, address1.address, address2.address)

            await expect(secretKeeper.storeSecret(address1.address, address3.address, sig1.secretHash, sig1.v, sig1.r, sig1.s, sig2.v, sig2.r, sig2.s))
                .to.be.revertedWith('Party 1 signature does not match!');
        })

    })

})