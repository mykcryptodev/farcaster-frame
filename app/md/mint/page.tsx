import { getAddressForFid, getFrameMessage, getTokenUrl } from "frames.js";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";
import { zora } from "viem/chains";
import type { State } from "../../lib/types";
import { generateNfts } from "../../lib/nftGenerator";
import { NFT_CHAIN, NFT_CONTRACT, NFT_OPENSEA_LINK } from "../../lib/constants";
import { DEBUG_HUB_OPTIONS } from "../../debug/constants";
import { checkIfMinted } from "../../lib/checkIfMinted";
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import { hasMintedView } from "../../lib/hasMinted";
import { checkIfEligible } from "../../lib/checkIfEligible";
import { ineligibleView } from "../../lib/ineligible";
import { checkIfSoldOut } from "../../lib/checkIfSoldOut";
import { isSoldOutView } from "../../lib/isSoldOut";

const nfts: {
  src: string;
  tokenUrl: string;
}[] = [
  {
    src: "https://ipfs.decentralized-content.com/ipfs/bafybeifs7vasy5zbmnpixt7tb6efi35kcrmpoz53d3vg5pwjz52q7fl6pq/cook.png",
    tokenUrl: getTokenUrl({
      address: "0x99de131ff1223c4f47316c0bb50e42f356dafdaa",
      chain: zora,
      tokenId: "2",
    }),
  },
  {
    src: "https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeiegrnialwu66u3nwzkn4gik4i2x2h4ip7y3w2dlymzlpxb5lrqbom&w=1920&q=75",
    tokenUrl: getTokenUrl({
      address: "0x060f3edd18c47f59bd23d063bbeb9aa4a8fec6df",
      chain: zora,
      tokenId: "1",
    }),
  },
  {
    src: "https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeidc6e5t3qmyckqh4fr2ewrov5asmeuv4djycopvo3ro366nd3bfpu&w=1920&q=75",
    tokenUrl: getTokenUrl({
      address: "0x8f5ed2503b71e8492badd21d5aaef75d65ac0042",
      chain: zora,
      tokenId: "3",
    }),
  },
];

const initialState: State = {
  l: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  },
  hM: false,
  gS: true,
  iE: false,
};


const reducer: FrameReducer<State> = (state, action) => {
  return state;
};

// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);
  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame);
  let requesterFid: number | null = null;
  let trustedData: string | null = null;
  let nftName: string | null = null;

  // Do another hasMinted check before minting
  let hasMinted = state.hM;
  let eligibility = {
    isEligible: state.iE ?? false,
    reason: ''
  } as { isEligible: boolean; reason?: string };
  let isSoldOut: boolean = false;
  
  if (previousFrame.postBody) {
    const frameMessage = await getFrameMessage(previousFrame.postBody, {
      ...DEBUG_HUB_OPTIONS,
    });
  
    if (frameMessage && !frameMessage?.isValid) {
      throw new Error("Invalid frame payload");
    }
    
    if (frameMessage) {
      requesterFid = frameMessage.requesterFid;
      const [userHasMinted, userEligibility, isMintedOut] = await Promise.all([
        checkIfMinted(requesterFid),
        checkIfEligible(requesterFid),
        checkIfSoldOut(),
      ]);
      hasMinted = userHasMinted;
      trustedData = previousFrame.postBody.trustedData.messageBytes;
      nftName = frameMessage.inputText ?? "Mochi Degen";
      eligibility = userEligibility;
    }
  }

  if (!requesterFid) {
    // TODO: show error for no requester ID
    throw new Error("No requester ID");
  }
  if (hasMinted) {
    return await hasMintedView(requesterFid, state, previousFrame);
  }
  if (isSoldOut) {
    return await isSoldOutView(state, previousFrame);
  }
  if (!eligibility.isEligible) {
    return await ineligibleView(requesterFid, eligibility.reason ?? "Unknown Reason", state, previousFrame);
  }
  const address = await getAddressForFid({
    fid: requesterFid,
    options: { fallbackToCustodyAddress: true }
  });

  const { nft, previewImageUrl } = await generateNfts(state, true);
  if (!nft) {
    throw new Error("No NFT");
  }
  const storage = new ThirdwebStorage({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
  const metadataIpfsUrl = await storage.upload({
    ...nft.metadata,
    name: nftName,
  });
  const mintRes = await fetch(`https://frame.syndicate.io/api/v2/sendTransaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.SYNDICATE_API_KEY}`,
    },
    body: JSON.stringify({
      frameTrustedData: trustedData,
      contractAddress: NFT_CONTRACT,
      functionSignature: "mintTo(address to, string uri)",
      args: { to: address, uri: metadataIpfsUrl },
    }),
  });
  const mintJson = await mintRes.json();
  const { success, data } = mintJson;
  if (!success) {
    throw new Error(`Mint failed: ${data}`);
  }
  const { transactionId } = data; 
  // then, when done, return next frame
  return (
    <div>
      Mint button example <Link href="/debug">Debug</Link>
      <FrameContainer
        pathname="/md/mint-button"
        postUrl="/md/mint-button/frames"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage
          src={previewImageUrl}
          aspectRatio="1:1"
        ></FrameImage>
        {/* <FrameButton action="mint" target={nfts[0]!.tokenUrl}>
          Mint
        </FrameButton> */}
        <FrameButton action="link" target={`${NFT_CHAIN.blockExplorerUrls.default.url}/tx/${transactionId}`}>
          View Transaction
        </FrameButton>
        <FrameButton action="link" target={NFT_OPENSEA_LINK}>
          View Collection
        </FrameButton>
      </FrameContainer>
    </div>
  );
}
