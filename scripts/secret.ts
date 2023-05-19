const ethers = require('ethers');

/*
    This function signs a secret for 2 addresses. It is exclusively to be used off-line because it requires
    a private key to be able to sign.
*/
export const getSignatureData = async (secret: string, privateKey: string, party1Address: string, party2Address: string) => {
    // create a new Wallet instance
    const wallet = new ethers.Wallet(privateKey);

    // create a keccak256 hash of the concatenation of party1's address, party2's address, and the secret hash
    const secretHash = ethers.utils.id(secret);
    const message = ethers.utils.solidityKeccak256(["address", "address", "bytes32"], [party1Address, party2Address, secretHash]);

    // sign the message
    const signature = await wallet.signMessage(ethers.utils.arrayify(message));

    // split the signature into its components
    const sig = ethers.utils.splitSignature(signature);

    // return the v, r, s components and the secret hash
    return { v: sig.v, r: sig.r, s: sig.s, secretHash };
}