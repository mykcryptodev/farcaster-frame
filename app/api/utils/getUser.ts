import { FrameData, FrameRequest, getFrameAccountAddress, getFrameMessage } from "@coinbase/onchainkit";
import { NextRequest, NextResponse } from "next/server";
import { APP_BANNER, APP_URL, NFT_CHAIN_STRING, NFT_CONTRACT } from "./index";
import { kv } from "@vercel/kv";
import { NFT, ThirdwebSDK } from "@thirdweb-dev/sdk";
import { StorageDownloader, ThirdwebStorage } from "@thirdweb-dev/storage";
import { showOwnedNft } from "./showOwnedNft";

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

  const userHasMinted = await kv.hget(accountAddress, 'hasMinted');
  // this will show the owned nft if it exists
  showOwnedNft(req, accountAddress);

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
