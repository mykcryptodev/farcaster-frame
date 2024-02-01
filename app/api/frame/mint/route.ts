import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { APP_URL, NFT_CHAIN_STRING, NFT_CONTRACT } from '../../utils';
import { getUser } from '../../utils/getUser';
import { NFT, ThirdwebSDK } from '@thirdweb-dev/sdk';
import { StorageDownloader, ThirdwebStorage } from '@thirdweb-dev/storage';

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
  console.log({ nft, accountAddress, userHasMinted });

  // if user has minted, return a static image
  if (userHasMinted) {
    const userNftImageUrl = await kv.hget(accountAddress, 'userNftImageUrl');
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${userNftImageUrl}" />
        <meta property="fc:frame:button:1" content="Your NFT" />
      </head></html>
    `);
  };

  // TODO: make this prettier
  if (!nft) {
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://ipfs.io/ipfs/QmZvYX1iXy4bKJ6xJ8Z7ZyWwCgYX2ZkH5q2Z1KwZ3zJqJ5/1.png" />
        <meta property="fc:frame:button:1" content="Make an NFT" />
        <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
      </head></html>
    `);
  }

  // TODO: No account error
  if (!accountAddress) {
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://ipfs.io/ipfs/QmZvYX1iXy4bKJ6xJ8Z7ZyWwCgYX2ZkH5q2Z1KwZ3zJqJ5/1.png" />
        <meta property="fc:frame:button:1" content="Your NFT" />
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

  try {
    // we dont wait for the blockchain, we just send off the tx and hope for the best
    // we only have a few seconds to respond to the user
    const tx = await contract.erc721.mintTo(accountAddress, {
      ...nft.metadata,
      name: nft.metadata.name + ` #${count}`,
    });
    console.log({ tx });
  } catch (e) {
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://ipfs.io/ipfs/QmXAzLJRwNFuE7S6L2EZdJ51yuMQJtiXKdRVURTmTdotj7/rodeo.png" />
        <meta property="fc:frame:button:1" content="Error Minting NFT - Try Again" />
        <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
      </head></html>
    `);
  }


  console.log('updated user as having minted');

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
  });

  console.log('we are going to respond...');
  console.log({ imageUrl, count})

  return new NextResponse(`
    <!DOCTYPE html><html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${imageUrl}" />
      <meta property="fc:frame:button:1" content="#${count}" />
      <meta property="fc:frame:button:2" content="Mint Successful!" />
      <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
    </head></html>
  `);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
