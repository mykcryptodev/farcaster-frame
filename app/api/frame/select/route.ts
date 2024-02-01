import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { APP_URL, generateNfts } from '../../utils';
import { getUser } from '../../utils/getUser';
import { LAYERS } from '../../utils/layers';
import { FrameData } from '@coinbase/onchainkit';
import { StorageDownloader, ThirdwebStorage } from '@thirdweb-dev/storage';
// import {v2 as cloudinary} from 'cloudinary';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const { currentStep, accountAddress, message } = await getUser(req) as {
    currentStep: number;
    accountAddress: string;
    message: FrameData;
  };
  console.log({ currentStep, accountAddress, message })

  const selectedLayer = LAYERS[currentStep][message.buttonIndex - 1];
  let currentLayers = await kv.hget(accountAddress, 'layers') as string[] | undefined;
  if (!currentLayers) {
    currentLayers = [];
  }
  // selectedLayer.name needs to replace the element that exists in currentLayers at the index of currentStep
  currentLayers[currentStep] = selectedLayer.name;
  await kv.hset(accountAddress, { layers: currentLayers });

  console.log({ currentLayers })
  console.log(currentLayers.map(layer => {
    const layerData = LAYERS.flat().find(l => l.name === layer);
    if (!layerData) {
      // continue to the next layer
      return;
    }
    if (layerData.file) {
      return {
        name: layerData.name,
        probability: 1,
        options: [{
          name: layerData.name,
          file: layerData.file,
          weight: 100,
        }]
      }
    }
  }).filter(Boolean) as any,)

  const nftGeneration = await generateNfts({
    content: {
      layers: currentLayers.map(layer => {
        const layerData = LAYERS.flat().find(l => l.name === layer);
        if (!layerData) {
          // continue to the next layer
          return;
        }
        if (layerData.file) {
          return {
            name: layerData.name,
            probability: 1,
            options: [{
              name: layerData.name,
              file: layerData.file,
              weight: 100,
            }]
          }
        }
      }).filter(Boolean) as any,
      metadataTemplate: {
        name: "Myk Bois",
        description: "Myk Bois are created by you in a farcaster frame.",
        external_url: "https://x.com/mykcryptodev",
      },
    },
    numNfts: 1,
  });
  const nft = nftGeneration.nfts?.[0];
  console.log({ nft })
  if (!nft) {
    throw new Error('No NFT generated');
  }
  const downloader = new StorageDownloader({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
  const storage = new ThirdwebStorage({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
    downloader,
  });
  const image = await storage.download(nft.metadata.image as string);
  const imageUrl = image.url;
  // cloudinary.config({ 
  //   cloud_name: 'djiho4jtj', 
  //   api_key: process.env.CLOUDINARY_API_KEY, 
  //   api_secret: process.env.CLOUDINARY_SECRET_KEY, 
  // });
  // const backgroundLayer = LAYERS[0].find(layer => layer.file && layer.name === currentLayers?.[0]);
  // const backgroundLayerFile = backgroundLayer?.file;
  // const backgroundLayerImage = await storage.download(backgroundLayerFile as string);
  // const backgroundLayerImageUrl = backgroundLayerImage.url;
  // const backgroundLayerName = LAYERS[0].find(layer => layer.file && layer.name === currentLayers?.[0])?.name as string;
  // console.log({ backgroundLayerName, imageUrl })

  // try {
  //   const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
  //     public_id: 'mochimon',
  //     overwrite: true,
  //     invalidate: true,
  //   });
  //   const uploadedBg = await cloudinary.uploader.upload(backgroundLayerImageUrl, {
  //     public_id: backgroundLayerName,
  //     overwrite: true,
  //     invalidate: true,
  //   })
  //   console.log({ uploadedImage, uploadedBg })
  //   const combinedImageUrl = cloudinary.url(uploadedBg.public_id, {
  //     transformation: [
  //       { width: 1024, height: 576, crop: "fill" }, // Resize the background to fit Twitter's dimensions
  //       { overlay: uploadedImage.public_id, width: 100, height: 100, gravity: "center", crop: "fit" } // Add your image as an overlay
  //     ]
  //   });
  //   console.log({ imageUrl, combinedImageUrl })
  // } catch (e) {
  //   console.error(e);
  // }

  const nextStep = currentStep + 1;

  await kv.hset(accountAddress, { currentStep: nextStep });

  const nextStepLayers = LAYERS[nextStep];

  // if there are no more layers, return the image
  // TODO: make this a mint button
  if (!nextStepLayers) {
    await kv.hset(accountAddress, { nft });
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:button:1" content="Mint your NFT!" />
        <meta property="fc:frame:post_url" content="${APP_URL}/api/frame/mint" />
      </head></html>
    `);
  }

  const nextStepOptions = nextStepLayers.map((layer, index) => {
    return `<meta property="fc:frame:button:${index + 1}" content="${layer.buttonLabel}" />`;
  });

  return new NextResponse(`
    <!DOCTYPE html><html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${imageUrl}" />
      ${nextStepOptions.join('\n')}
      <meta property="fc:frame:post_url" content="${APP_URL}/api/frame/select" />
    </head></html>
  `);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
