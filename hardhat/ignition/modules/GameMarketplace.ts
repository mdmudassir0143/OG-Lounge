import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GameMarketplaceModule = buildModule("GameMarketplaceModule", (m) => {
  // Get parameters with default values for Sepolia testnet
  const pythAddress = m.getParameter("pythAddress", "0x4305FB66699C3B2702D4d05CF36551390A4c69C6"); // Sepolia Pyth address
  const platformWallet = m.getParameter("platformWallet", "0x742626ce3c271b8d09e61a5ecf1f59c4b23b9f39"); // Platform wallet

  // Deploy GameMarketplace (includes GameEconomy functionality)
  const gameMarketplace = m.contract("GameMarketplace", [pythAddress, platformWallet]);

  return { gameMarketplace };
});

export default GameMarketplaceModule;