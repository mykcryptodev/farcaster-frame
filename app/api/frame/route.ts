import { FrameRequest, getFrameAccountAddress, getFrameMessage } from '@coinbase/onchainkit';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { APP_URL, NFT_CHAIN_STRING, NFT_CONTRACT } from '../utils';
import { LAYERS } from '../utils/layers';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined;
  try {
    const body: FrameRequest = await req.json();
    const { isValid, message } = await getFrameMessage(body);

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
      console.log({ noAccountAddress: true, accountAddress });
      // TODO: fetch the actual nft of this user and display it
    //   return new NextResponse(`<!DOCTYPE html><html><head>
    //   <meta property="fc:frame" content="vNext" />
    //   <meta property="fc:frame:image" content="https://ipfs.io/ipfs/QmZvYX1iXy4bKJ6xJ8Z7ZyWwCgYX2ZkH5q2Z1KwZ3zJqJ5/1.png" />
    //   <meta property="fc:frame:button:1" content="Your NFT" />
    //   <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
    // </head></html>`);
    accountAddress = '0x9036464e4ecD2d40d21EE38a0398AEdD6805a09B'
  }

  // TODO: Remove this reset of everyone when testing is done
  // await kv.del(accountAddress);
  // await kv.hset(accountAddress, {
  //   currentStep: 0,
  //   layers: [],
  //   hasMinted: false,
  //   userNftImageUrl: null,
  // });

  // mint the nft
  const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY!, NFT_CHAIN_STRING, {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
  const contract = await sdk.getContract(NFT_CONTRACT, "nft-collection");
  const balance = await contract.erc721.balanceOf(accountAddress);

  const userHasMinted = balance.gt(0) || await kv.hget(accountAddress, 'hasMinted');
  // if user has minted, return a static image
  if (userHasMinted) {
    const userNftImageUrl = await kv.hget(accountAddress, 'userNftImageUrl');
    // TODO: fetch the actual nft of this user and display it
    return new NextResponse(`<!DOCTYPE html><html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${userNftImageUrl}" />
      <meta property="fc:frame:button:1" content="Your NFT Has Been Minted!" />
      <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
    </head></html>`);
  }

  // get the current step
  let currentStep = await kv.hget(accountAddress, 'currentStep');
  let layers = await kv.hget(accountAddress, 'layers');
  console.log({ currentStep, accountAddress, layers });
  // if there is no current step, set it to zero
  if (!currentStep) {
    await kv.hset(accountAddress, { currentStep: 0 });
    currentStep = 0;
  }

  console.log({ currentStep, accountAddress })

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
