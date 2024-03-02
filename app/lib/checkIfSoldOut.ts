import { NFT_CONTRACT, NFT_CHAIN } from "./constants";
import { createPublicClient, http } from 'viem'

export const checkIfSoldOut = async () => {
  const publicClient = createPublicClient({
    chain: NFT_CHAIN,
    transport: http()
  });
  const maxNfts = await publicClient.readContract({
    address: NFT_CONTRACT,
    abi: [{
      inputs: [],
      name: "maxNfts",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    }],
    functionName: "maxNfts",
  });
  const numMinted = await publicClient.readContract({
    address: NFT_CONTRACT,
    abi: [{
      inputs: [],
      name: "nextTokenIdToMint",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    }],
    functionName: "nextTokenIdToMint",
  });
  const isSoldOut = numMinted >= maxNfts;
  return isSoldOut;
};