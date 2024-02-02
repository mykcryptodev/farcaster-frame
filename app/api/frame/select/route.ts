import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { APP_URL, generateNfts } from '../../utils';
import { getUser } from '../../utils/getUser';
import { LAYERS } from '../../utils/layers';
import { FrameData } from '@coinbase/onchainkit';
import { StorageDownloader, ThirdwebStorage } from '@thirdweb-dev/storage';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const { currentStep, accountAddress, message } = await getUser(req) as {
    currentStep: number;
    accountAddress: string;
    message: FrameData;
  };

  if (currentStep === 0) {
    await kv.del(accountAddress);
    await kv.hset(accountAddress, {
      currentStep: 0,
      layers: [],
      hasMinted: false,
      userNftImageUrl: null,
      userTokenId: null,
    });
  }
  const selectedLayer = LAYERS[currentStep][message.buttonIndex - 1];
  let currentLayers = await kv.hget(accountAddress, 'layers') as string[] | undefined;
  if (!currentLayers) {
    currentLayers = [];
  }
  // selectedLayer.name needs to replace the element that exists in currentLayers at the index of currentStep
  currentLayers[currentStep] = selectedLayer.name;
  await kv.hset(accountAddress, { layers: currentLayers });

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
  }).filter(Boolean) as any,);

  const nextStep = currentStep + 1;
  const nextStepLayers = LAYERS[nextStep];
  const isFinalStep = !nextStepLayers;

  const generatedNfts = async (props: { isPreview: boolean, numNfts: number }) => {
    return await generateNfts({
      content: {
        layers: currentLayers?.map(layer => {
          const layerData = LAYERS.flat().find(l => l.name === layer);
          if (!layerData) {
            // continue to the next layer
            return;
          }
          if (layerData.file) {
            return {
              name: layerData.layer,
              probability: 1,
              options: [{
                name: layerData.name,
                // use the big file (background) so that it doesnt get cropped on farcaster
                // if this is not a preview and we are actually making the nft, use the regular sized background
                file: props.isPreview ? layerData.bigFile ?? layerData.file : layerData.file,
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
      numNfts: props.numNfts,
    });
  };

  const [nftPreviewGeneration, nftGeneration] = await Promise.all([
    generatedNfts({ isPreview: true, numNfts: 1 }),
    isFinalStep ? generatedNfts({ isPreview: false, numNfts: 1 }) : Promise.resolve(),
  ]);
  const nftPreview = nftPreviewGeneration.nfts?.[0];
  const nft = nftGeneration?.nfts?.[0];
  if (!nftPreview) {
    throw new Error('No NFT generated');
  }
  const downloader = new StorageDownloader({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
  const storage = new ThirdwebStorage({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
    downloader,
  });
  const previewImage = await storage.download(nftPreview?.metadata.image as string);
  const previewImageUrl = previewImage.url;

  await kv.hset(accountAddress, { currentStep: nextStep });

  // if there are no more layers, return the image
  // TODO: make this a mint button
  if (!nextStepLayers) {
    await kv.hset(accountAddress, { nft });
    return new NextResponse(`
      <!DOCTYPE html><html><head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${previewImageUrl}" />
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
      <meta property="fc:frame:image" content="${previewImageUrl}" />
      ${nextStepOptions.join('\n')}
      <meta property="fc:frame:post_url" content="${APP_URL}/api/frame/select" />
    </head></html>
  `);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
