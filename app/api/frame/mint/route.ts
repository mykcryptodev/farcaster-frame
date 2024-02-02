import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { APP_BANNER, APP_URL, NFT_CHAIN_STRING, NFT_CONTRACT } from '../../utils';
import { getUser } from '../../utils/getUser';
import { NFT, ThirdwebSDK } from '@thirdweb-dev/sdk';
import { StorageDownloader, ThirdwebStorage } from '@thirdweb-dev/storage';
import { showOwnedNft } from '../../utils/showOwnedNft';

export const maxDuration = 25;

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const { nft, accountAddress, userHasMinted } = await getUser(req) as {
    userHasMinted: boolean;
    accountAddress: string;
    nft: NFT | undefined | null;
  };
  console.log(`
  
  
  
  
  
  ===================================
              MINTING
  ===================================
  
  
  
  `)

  // if user has minted, return a static image
  if (userHasMinted) {
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
  };
  // fall back to showing the owned nft if it exists in case state got messed up
  try {
    const response = await showOwnedNft(accountAddress);
    if (response) {
      return response;
    }
  } catch (e) {
    console.log('show nft error', e);
  }

  if (!nft) {
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${APP_BANNER}" />
        <meta property="fc:frame:button:1" content="Something went wrong" />
        <meta property="fc:frame:button:2" content="Start over" />
        <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
      </head></html>
    `);
  }

  // TODO: No account error
  if (!accountAddress) {
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${APP_BANNER}" />
        <meta property="fc:frame:button:1" content="Connect a wallet to mmake an NFT" />
        <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
      </head></html>
    `);
  }

  console.log(JSON.stringify(nft));

  // mint the nft
  const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY!, NFT_CHAIN_STRING, {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
  const contract = await sdk.getContract(NFT_CONTRACT, "nft-collection");
  const count = await contract.erc721.totalCount();

  // we dont wait for the blockchain, we just send off the tx and hope for the best
  // we only have a few seconds to respond to the user
  const tx = contract.erc721.mintTo(accountAddress, {
    ...nft.metadata,
    name: nft.metadata.name + ` #${count}`,
  }).then((tx) => {
    console.log('finished tx', tx);
  }).catch(e => {
    console.log('error w tx', e);
  });
  console.log({ tx });


  console.log('updated user as having minted');

  try {
    const downloader = new StorageDownloader({
      secretKey: process.env.THIRDWEB_SECRET_KEY,
    });
    const storage = new ThirdwebStorage({
      secretKey: process.env.THIRDWEB_SECRET_KEY,
      downloader,
    });
    const image = await storage.download(nft.metadata.image as string);
    const imageUrl = image.url;
  
    // set the user as having minted
    await kv.hset(accountAddress, { 
      hasMinted: true,
      userNftImageUrl: imageUrl,
      userNftTokenId: count.toString(),
    });
  
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:button:1" content="#${count.toString()}" />
        <meta property="fc:frame:button:2" content="Mint Successful!" />
        <meta property="fc:frame:post_url" content="${APP_URL}/api/mynft" />
      </head></html>
    `);
  } catch (e) {
    console.log('error getting image', e);
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${APP_BANNER}" />
        <meta property="fc:frame:button:1" content="Something went wrong" />
        <meta property="fc:frame:button:2" content="Start over" />
        <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
      </head></html>
    `);
  }

}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
