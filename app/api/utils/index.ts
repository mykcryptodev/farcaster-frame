/*
** TODO: Vercel limits us to 60s per function call.
** This generator runs at about 1 image generation
** per second. We may need a separate service to
** generate images and upload them to IPFS.
*/
import { type NFT } from "@thirdweb-dev/sdk";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
import type mergeImages from 'merge-images';
import { bool, MersenneTwister19937, real } from 'random-js';
import sharp from 'sharp';

import { type MetadataTemplate } from '../../../types/generator';

export const APP_URL = process.env.NODE_ENV === 'production' ? 'https://farcaster-frame-myk.vercel.app' : 'https://8fe8-209-214-123-227.ngrok-free.app';
export const APP_BANNER = 'https://ipfs.io/ipfs/QmXAAdmuwiooY88E6KdZ5xdhqmHm6qxJb4QxNWhRUe6jeo/mykbois.png';
export const NFT_CONTRACT = "0x8d28841C6Fcd1dB01151f4BF682b722446B8118d";
export const NFT_CHAIN_STRING = "base-sepolia-testnet";

interface LayerOption {
  name: string;
  file: string;
  weight?: number;
}

interface Layer {
  name: string;
  probability: number;
  options: LayerOption[];
}

interface Content {
  layers: Layer[];
  metadataTemplate: {
    name: string;
    description: string;
    external_url: string;
  }
}

type Props = {
  content: Content;
  numNfts: number;
}

export const generateNfts = async (props: Props) => {
  const storage = new ThirdwebStorage({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
  const images: Buffer[] = [];
  const metadata: MetadataTemplate[] = [];

  async function generateNFTs(num: number): Promise<void> {
    const { content } = props as { content: Content };
    const generated: Set<string> = new Set();

    for (let tokenId = 0; tokenId < num; tokenId++) {
      console.info(`Generating NFT #${tokenId} …`);
      const selection = randomlySelectLayers(content.layers);
      const traitsStr = JSON.stringify(selection.selectedTraits);

      if (generated.has(traitsStr)) {
        console.warn("Duplicate detected. Retry …");
        tokenId--;
        continue;
      } else {
        generated.add(traitsStr);
        await mergeLayersAndSave(selection.images);

        const generatedMetadata = generateMetadata(content, tokenId, selection.selectedTraits);
        metadata.push(generatedMetadata);
      }
    }
  }

  function generateMetadata(content: Content, tokenId: number, traits: Record<string, string>): MetadataTemplate {
    const attributes: { trait_type: string, value: string }[] = [];
    for (const [trait_type, value] of Object.entries(traits)) {
      attributes.push({ trait_type, value });
    }
    return {
      id: tokenId,
      image: '<%IMAGE_URL%>',
      name: `${content.metadataTemplate.name}`, // "# tokenId" gets appended at time of mint
      external_url: `${content.metadataTemplate.external_url}`,
      description: `${content.metadataTemplate.description}`,
      attributes: attributes,
    } as MetadataTemplate;
  }

  function randomlySelectLayers(layers: Layer[]): {
    images: string[];
    selectedTraits: Record<string, string>;
  } {
    const mt = MersenneTwister19937.autoSeed();

    const images: string[] = [];
    const selectedTraits: Record<string, string> = {};

    for (const layer of layers) {
      if (bool(layer.probability)(mt)) {
        const selected = pickWeighted(mt, layer.options);
        selectedTraits[layer.name] = selected.name;
        images.push(selected.file);
      }
    }

    return {
      images,
      selectedTraits
    };
  }

  function pickWeighted(mt: MersenneTwister19937, options: LayerOption[]): LayerOption {
    const weightSum = options.reduce((acc, option) => {
      return acc + (option.weight ?? 1.0);
    }, 0);

    const r = real(0.0, weightSum, false)(mt);

    let summedWeight = 0.0;
    for (const option of options) {
      summedWeight += option.weight ?? 1.0;
      if (r <= summedWeight) {
        return option;
      }
    }
    throw new Error("Weighted selection failed");
  }

  async function mergeLayersAndSave(layers: mergeImages.ImageSource[]): Promise<void> {
    const layersAsBuffers = await Promise.all(layers.map(async (layer) => {
      const storageResponse = await storage.download(layer as string);
      const arrayBuffer = await storageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    }));
    const composite = await sharp(layersAsBuffers[0]).composite(
      layersAsBuffers.slice(1).map((layer) => {
        return {
          input: layer,
          blend: 'atop',
        };
      }
    )).toBuffer();
    images.push(composite);
  }

  const { numNfts } = props as { numNfts: number };
  try {
    await generateNFTs(numNfts);
  } catch (e) {
    console.error(e);
    const error = e as Error;
    error.message = "Failed to generate NFTs. " + (error.message || "")
    return {
      success: false,
      error
    }
  }

  try {
    // upload images to ipfs
    const imageIpfsHashes = await storage.uploadBatch(images);
    // for each piece of metadata, replace the image url with the ipfs url
    const nfts = metadata.map((metadata, index) => {
      const ipfsHash = imageIpfsHashes[index];
      return {
        metadata: {
          ...metadata,
          image: ipfsHash,
        },
        type: "ERC721",
        supply: 1,
      } as unknown as NFT;
    });
    return {
      success: true,
      nfts
    }
  } catch (e) {
    console.error(e);
    const error = e as Error;
    error.message = "Failed to upload to IPFS. " + (error.message || "")
    return {
      success: false,
      error
    }
  }
};
