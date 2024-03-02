import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { getAddressForFid } from "frames.js"
import { NFT_CHAIN, NFT_CONTRACT, NFT_OPENSEA_LINK } from "./constants";
import { createPublicClient, http } from 'viem';
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  PreviousFrame,
} from "frames.js/next/server";
import { State } from "./types";

export const hasMintedView = async (requesterFid: number, state: State, previousFrame: PreviousFrame<State>) => {
  const address = await getAddressForFid({
    fid: requesterFid,
    options: { fallbackToCustodyAddress: true }
  });
  const publicClient = createPublicClient({
    chain: NFT_CHAIN,
    transport: http(),
  });
  const ownedToken = await publicClient.readContract({
    address: NFT_CONTRACT,
    abi: [{
      inputs: [
        { name: "_owner", type: "address" },
        { name: "_index", type: "uint256" }
      ],
      name: "tokenOfOwnerByIndex",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    }],
    functionName: "tokenOfOwnerByIndex",
    args: [address, BigInt(0)],
  });
  const tokenUri = await publicClient.readContract({
    address: NFT_CONTRACT,
    abi: [{
      inputs: [{ name: "_tokenId", type: "uint256" }],
      name: "tokenURI",
      outputs: [{ name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    }],
    functionName: "tokenURI",
    args: [ownedToken],
  });
  const storage = new ThirdwebStorage({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
  const metadata = await storage.downloadJSON(tokenUri);
  return (
    <div>
      <FrameContainer
        pathname="/md/start"
        postUrl="/md/start/frames"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage aspectRatio="1:1">
          <img width={"100%"} height={"100%"} src={metadata.image} alt="Image" />
        </FrameImage>
        <FrameButton action="link" target={`https://thirdweb.com/syndicate-frame-chain/0x6A10B796e988fF5Fb775ccC6DaE3658813BB1Bc1/nfts/${ownedToken.toString()}`}>
          {`${metadata.name} #${ownedToken.toString()}`}
        </FrameButton>
      </FrameContainer>
    </div>
  );
}