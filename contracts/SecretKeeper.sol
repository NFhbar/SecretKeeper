// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract SecretKeeper {
    struct Secret {
        bytes32 hash;
        address party1;
        address party2;
    }

    mapping(bytes32 => Secret) secrets;

    event SecretStored(bytes32 secretHash, address party1, address party2);
    event SecretRevealed(string secret, address revealer);

    function storeSecret(
        address party1,
        address party2,
        bytes32 secretHash,
        uint8 v1,
        bytes32 r1,
        bytes32 s1,
        uint8 v2,
        bytes32 r2,
        bytes32 s2
    ) public {
        bytes32 message = prefixed(
            keccak256(abi.encodePacked(party1, party2, secretHash))
        );

        require(
            ecrecover(message, v1, r1, s1) == party1,
            "Party 1 signature does not match!"
        );
        require(
            ecrecover(message, v2, r2, s2) == party2,
            "Party 2 signature does not match!"
        );

        secrets[secretHash] = Secret(secretHash, party1, party2);

        emit SecretStored(secretHash, party1, party2);
    }

    function revealSecret(string memory secret) public {
        bytes32 secretHash = keccak256(abi.encodePacked(secret));

        require(
            msg.sender == secrets[secretHash].party1 ||
                msg.sender == secrets[secretHash].party2,
            "Sender must be a party of the secret!"
        );

        emit SecretRevealed(secret, msg.sender);

        delete secrets[secretHash];
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
            );
    }
}
