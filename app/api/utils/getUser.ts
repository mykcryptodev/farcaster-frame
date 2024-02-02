import { FrameData, FrameRequest, getFrameAccountAddress, getFrameMessage } from "@coinbase/onchainkit";
import { NextRequest, NextResponse } from "next/server";
import { APP_BANNER, APP_URL } from "./index";
import { kv } from "@vercel/kv";
import { NFT } from "@thirdweb-dev/sdk";
import { showOwnedNft } from "./showOwnedNft";

export const getUser = async (req: NextRequest) => {
  let accountAddress: string | undefined;
  let Message: FrameData | undefined;
  try {
    const body: FrameRequest = await req.json();
    const { isValid, message } = await getFrameMessage(body);
    Message = message;

    if (isValid) {
      accountAddress = await getFrameAccountAddress(message, { NEYNAR_API_KEY: 'NEYNAR_API_DOCS' });
    } else {
      return new NextResponse(`<!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${APP_BANNER}" />
        <meta property="fc:frame:button:1" content="Invalid Message" />
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
  if (userHasMinted) {
    // this will show the owned nft if it exists
    const response = await showOwnedNft(req, accountAddress);
    if (response) {
      return response;
    }
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
