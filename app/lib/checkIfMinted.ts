import { NFT_CONTRACT, NFT_CHAIN } from "./constants";
import { getAddressForFid } from "frames.js";
import { createPublicClient, http } from 'viem'

export const checkIfMinted = async (requesterFid: number | undefined) => {
  if (!requesterFid) return false;
  const publicClient = createPublicClient({
    chain: NFT_CHAIN,
    transport: http()
  });
  const address = await getAddressForFid({
    fid: requesterFid,
    options: { fallbackToCustodyAddress: true }
  });
  const hasMinted = await publicClient.readContract({
    address: NFT_CONTRACT,
    abi: [{
      inputs: [{ name: "address", type: "address"}],
      name: "hasMinted",
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    }],
    functionName: "hasMinted",
    args: [address],
  });
  return hasMinted;
};