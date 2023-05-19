# Secret Keeper

The contract allows any two parties to agree and sign off on a secret that can then be stored on-chain. The secret is stored in such a way that it should not be possible to know its value by observing it. 

At any point, either of the two parties can reveal the actual value of the secret. When the secret is revealed, the contract emits an event of who was the party that revealed it and its real value, and then the stored secret is deleted. When the secret is first registered on-chain, it is done in a single transaction because we want to guarantee that it takes place in the same block.

## Install

```
npm install
```

## Local Usage

Open a new terminal and start a local node:
```
npx hardhat node
```

In a new terminal, compile the contract:
```
npx hardhat compile
```

Now deploy the contract:
```
npx hardhat run --network localhost scripts/deploy.ts
```

## Tests

To run the tests:
```
npm run test
npm run coverage
```


## Explanation

The flow begins with the function `getSignatureData` located in `scripts/secret.ts`. This function is meant to be use exclusively offline to generate a signature between 2 parties that corresponds to a secret they can only decode. The reason the function has to be used offline is because it requires the private key of the parties to be able to sign the message which will then be decoded. 

### Step 1
1. `Party1` and `Party2` agree on a `secret` they want to store on-chain.
2. `Party1` executes `getSignatureData` with `Party1` address, `Party2` address, the `secret` and it signs the message with its `privateKey`.
3. `Party2` executes `getSignatureData` with `Party1` address, `Party2` address, the `secret` and it signs the message with its `privateKey`.
4. Now both parties have a hash of the `secret` which only they can decode.
5. Now `Party1` or `Party2` can call the smart contract function `storeSecret`. This function expects the addresses of both parties, the hash of the singed secret, and their corresponding signatures. 
6. The contract then ensures that the signatures match the hash and stores it on-chain.
7. Now `Party1` or `Party2` can call the smart contract function `revealSecret`. This function ensures that the caller is indeed part of the secret by checking the secret hash. If it is, then it proceeds to emit an event with the secret and deletes the secret from the chain.