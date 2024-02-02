import { FrameData, FrameRequest, getFrameAccountAddress, getFrameMessage } from "@coinbase/onchainkit";
import { NextRequest, NextResponse } from "next/server";
import { APP_BANNER, APP_URL, NFT_CHAIN_STRING, NFT_CONTRACT } from "./index";
import { kv } from "@vercel/kv";
import { NFT, ThirdwebSDK } from "@thirdweb-dev/sdk";

export const getUser = async (req: NextRequest) => {
  let accountAddress: string | undefined;
  let Message: FrameData | undefined;
  try {
    const body: FrameRequest = await req.json();
    const { isValid, message } = await getFrameMessage(body);
    Message = message;

    console.log({ message, isValid })
  
    if (isValid) {
      accountAddress = await getFrameAccountAddress(message, { NEYNAR_API_KEY: 'NEYNAR_API_DOCS' });
    } else {
      // TDOD: make this an error
      return new NextResponse(`<!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://ipfs.io/ipfs/QmZvYX1iXy4bKJ6xJ8Z7ZyWwCgYX2ZkH5q2Z1KwZ3zJqJ5/1.png" />
        <meta property="fc:frame:button:1" content="Your NFT" />
        <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
      </head></html>`);
    }
  } catch (err) {
    console.error(err);
  }

  if (!accountAddress) {
    return new NextResponse(`<!DOCTYPE html><html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${APP_BANNER}" />
      <meta property="fc:frame:button:1" content="Connect a wallet" />
      <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
    </head></html>`);
  }

  // check balance onchain
  const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY!, NFT_CHAIN_STRING, {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
  const contract = await sdk.getContract(NFT_CONTRACT, "nft-collection");
  const balance = await contract.erc721.balanceOf(accountAddress);

  const userHasMinted = await kv.hget(accountAddress, 'hasMinted');
  if (!userHasMinted) {
    await kv.hset(accountAddress, { hasMinted: false });
  }
  console.log({ userHasMinted });
  // if user has minted, return a static image
  if (userHasMinted ) {
    const userNftImageUrl = await kv.hget(accountAddress, 'userNftImageUrl');
    const userNftTokenId = await kv.hget(accountAddress, 'userNftTokenId');
    return new NextResponse(`<!DOCTYPE html><html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${userNftImageUrl}" />
      <meta property="fc:frame:button:1" content="${userNftTokenId}" />
      <meta property="fc:frame:button:2" content="Your NFT" />
      <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
    </head></html>`);
  }

  // get the current step
  let currentStep: number | undefined | null = await kv.hget(accountAddress, 'currentStep');
  // if there is no current step, set it to zero
  if (!currentStep) {
    await kv.hset(accountAddress, { currentStep: 0 });
    currentStep = 0;
  }

  // get the user nft
  let nft: NFT | undefined | null = await kv.hget(accountAddress, 'nft');

  return {
    currentStep,
    accountAddress,
    message: Message,
    nft,
    userHasMinted,
  };
}
