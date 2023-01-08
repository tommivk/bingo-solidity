// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../VRFConsumerBaseV2.sol";

contract MockVRFCoordinatorV2 {
    uint nonce = 0;

    function requestRandomWords(
        bytes32,
        uint64,
        uint16,
        uint32,
        uint32
    ) external returns (uint256 requestId) {
        uint[] memory result = new uint[](1);
        result[0] = uint(keccak256(abi.encodePacked(block.timestamp, nonce)));
        ++nonce;
        VRFConsumerBaseV2(msg.sender).rawFulfillRandomWords(nonce, result);
        return nonce;
    }

    function createSubscription() external returns (uint64 subId) {
        return uint64(++nonce);
    }
}
