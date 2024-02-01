import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { APP_URL, NFT_CONTRACT } from '../../utils';
import { getUser } from '../../utils/getUser';
import { NFT, ThirdwebSDK } from '@thirdweb-dev/sdk';

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

  // if user has minted, return a static image
  if (userHasMinted) {
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${nft.metadata.image}" />
        <meta property="fc:frame:button:1" content="Your NFT" />
      </head></html>
    `);
  };

  console.log(JSON.stringify(nft));

  // mint the nft
  const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY!, "sepolia", {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
  const contract = await sdk.getContract(NFT_CONTRACT, "nft-collection");
  const count = await contract.erc721.totalCount();
  const tx = await contract.erc721.mintTo(accountAddress, {
    ...nft.metadata,
    name: nft.metadata.name + ` #${count}`,
  });
  const tokenId = tx.id;

  // set the user as having minted
  await kv.hset(accountAddress, { hasMinted: true });

  return new NextResponse(`
    <!DOCTYPE html><html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${nft.metadata.image}" />
      <meta property="fc:frame:button:1" content="#${tokenId}" />
      <meta property="fc:frame:button:2" content="Mint Successful!" />
      <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
    </head></html>
  `);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
