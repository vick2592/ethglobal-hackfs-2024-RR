// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EscrowContract {
	ERC20 public token;
	address public feeAccount;
	uint256 public feePercent; // Represented as a percentage, e.g., 10 for 10%

	struct Escrow {
		address user1;
		string string1;
		uint256 amount;
		bool filled;
	}

	mapping(uint256 => Escrow) public escrows;
	uint256 public nextEscrowId;

	event EscrowCreated(
		uint256 indexed escrowId,
		address indexed user,
		uint256 amount,
		string str
	);
	event EscrowFilled(
		uint256 indexed escrowId,
		address indexed user,
		uint256 amount,
		string str
	);
	event EscrowResolved(
		uint256 indexed escrowId,
		address winner,
		uint256 amount,
		address feeRecipient,
		uint256 feeAmount
	);

	constructor(address _token, address _feeAccount, uint256 _feePercent) {
		require(_feePercent <= 100, "Fee percent cannot be more than 100");
		token = ERC20(_token);
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	function createEscrow(uint256 amount, string memory str) external {
		require(amount > 0, "Amount must be greater than 0");
		require(
			token.allowance(msg.sender, address(this)) > (amount * 2),
			"Token must have allowance over stake amount"
		);

		escrows[nextEscrowId] = Escrow({
			user1: msg.sender,
			string1: str,
			amount: amount,
			filled: false
		});

		emit EscrowCreated(nextEscrowId, msg.sender, amount, str);
		nextEscrowId++;
	}

	function fillEscrow(
		uint256 escrowId,
		string memory str
	) external returns (address) {
		Escrow storage escrow = escrows[escrowId];
		require(!escrow.filled, "Escrow already filled");

		uint256 totalAmount = escrow.amount * 2;
		uint256 feeAmount = (totalAmount * feePercent) / 100;
		uint256 winnerAmount = escrow.amount - feeAmount;

		require(
			token.allowance(msg.sender, address(this)) > totalAmount,
			"Token must have allowance over stake amount"
		);

		// logic for determining winner
		// would be great to compare encrypted data
		// will most likely be done in LIT
		// placeholder for now compares string length
		address winner = bytes(str).length >= bytes(escrow.string1).length
			? msg.sender
			: escrow.user1;

		address loser = bytes(str).length >= bytes(escrow.string1).length
			? escrow.user1
			: msg.sender;

		require(
			token.transferFrom(loser, feeAccount, feeAmount),
			"Fee transfer to fee account failed"
		);
		// require(token.transfer(winner, winnerAmount), "Winner transfer failed");
		require(
			token.transferFrom(loser, winner, winnerAmount),
			"Token transfer to winner failed"
		);
		escrow.filled = true;
		emit EscrowResolved(
			escrowId,
			winner,
			winnerAmount,
			feeAccount,
			feeAmount
		);
		emit EscrowFilled(escrowId, msg.sender, escrow.amount, str);
		return winner;
	}
}
