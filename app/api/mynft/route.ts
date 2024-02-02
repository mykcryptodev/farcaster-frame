import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { APP_URL } from '../utils';
import { getUser } from '../utils/getUser';
import { FrameData } from '@coinbase/onchainkit';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // this will show the onchain nft if it exists
  const { accountAddress } = await getUser(req) as {
    currentStep: number;
    accountAddress: string;
    message: FrameData;
  };

  // if we have not received the nft, it may still be minting
  // show what we have in the kv store
  const [userNftImageUrl, userNftTokenId] = await Promise.all([
    kv.hget(accountAddress, 'userNftImageUrl'),
    kv.hget(accountAddress, 'userNftTokenId'),
  ]);

  return new NextResponse(`
    <!DOCTYPE html><html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${userNftImageUrl}" />
      <meta property="fc:frame:button:1" content="#${userNftTokenId}" />
      <meta property="fc:frame:button:2" content="Your NFT" />
      <meta property="fc:frame:post_url" content="${APP_URL}/api/mynft" />
    </head></html>
  `);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
