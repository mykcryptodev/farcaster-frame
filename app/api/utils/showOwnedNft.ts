import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { APP_URL, NFT_CHAIN_STRING, NFT_CONTRACT } from ".";
import { NextRequest, NextResponse } from "next/server";
import { StorageDownloader, ThirdwebStorage } from "@thirdweb-dev/storage";

export const showOwnedNft = async (req:NextRequest, accountAddress: string) => {
  // check balance onchain
  const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY!, NFT_CHAIN_STRING, {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
  const contract = await sdk.getContract(NFT_CONTRACT, "nft-collection");
  const ownedNfts = await contract.erc721.getOwned(accountAddress);

  // if user has minted, return a static image
  if (ownedNfts.length > 0) {
    console.log('user has minted or has nfts');
    const downloader = new StorageDownloader({
      secretKey: process.env.THIRDWEB_SECRET_KEY,
    });
    const storage = new ThirdwebStorage({
      secretKey: process.env.THIRDWEB_SECRET_KEY,
      downloader,
    });
    const image = await storage.download(ownedNfts[0].metadata.image as string);
    console.log({ image: image.url, id: ownedNfts[0].metadata.id.toString() });
    // the request should end here and return html
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${image.url}" />
        <meta property="fc:frame:button:1" content="#${ownedNfts[0].metadata.id.toString()}" />
        <meta property="fc:frame:post_url" content="${APP_URL}/api/frame" />
      </head></html>
    `);
  }
  return;
};