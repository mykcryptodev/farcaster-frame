import { FrameRequest, getFrameAccountAddress, getFrameMessage } from '@coinbase/onchainkit';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { APP_BANNER, APP_URL } from '../utils';
import { LAYERS } from '../utils/layers';
import { showOwnedNft } from '../utils/showOwnedNft';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined;
  try {
    const body: FrameRequest = await req.json();
    const { isValid, message } = await getFrameMessage(body);
  
    if (isValid) {
      accountAddress = await getFrameAccountAddress(message, { NEYNAR_API_KEY: 'NEYNAR_API_DOCS' });
    } else {
      // TDOD: make this an error
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

  // this will show the owned nft if it exists
  const response = await showOwnedNft(req, accountAddress);
  if (response) {
    return response;
  }

  // users can start over if they havent minted yet
  try {
    await kv.del(accountAddress);
    await kv.hset(accountAddress, {
      currentStep: 0,
      layers: [],
      hasMinted: false,
      userNftImageUrl: null,
      userNftTokenId: null,
    });
  } catch (e) {
    console.log('error deleting user', e);
  }

  // get the current step
  let currentStep = await kv.hget(accountAddress, 'currentStep');
  // if there is no current step, set it to zero
  if (!currentStep) {
    await kv.hset(accountAddress, { currentStep: 0 });
    currentStep = 0;
  }

  const nextStepOptions = LAYERS[0].map((layer, index) => {
    return `<meta property="fc:frame:button:${index + 1}" content="${layer.buttonLabel}" />`;
  });

  return new NextResponse(`
    <!DOCTYPE html><html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://ipfs.io/ipfs/QmXwnE7LyGgk5wCj68gzXT4DLrFa8PAj1o8ueuVxLfUS2E/Untitled%20design%20(4).png" />
      ${nextStepOptions.join('\n')}
      <meta property="fc:frame:post_url" content="${APP_URL}/api/frame/select" />
    </head></html>
  `);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
