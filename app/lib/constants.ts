import { LayerSelectionOption } from "./types";
import { defineChain } from 'viem'

const syndicate = defineChain({
  id: 5101,
  name: "Syndicate",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-frame.syndicate.io"],
    },
  },
  blockExplorerUrls: {
    default: { name: "Blockscout", url: "https://explorer-frame.syndicate.io" },
  },
});

export const NFT_CONTRACT = "0x6A10B796e988fF5Fb775ccC6DaE3658813BB1Bc1";
export const NFT_CHAIN = syndicate;
export const NFT_OPENSEA_LINK = "https://thirdweb.com/syndicate-frame-chain/0x6A10B796e988fF5Fb775ccC6DaE3658813BB1Bc1/nfts";

export const NFT_METADATA = {
  name: "Syndicate Myk Bois",
  description: "Myk Bois are created by you in a farcaster frame and minted on Syndicate",
  external_url: "https://warpcast.com/myk",
}

export const BACKGROUNDS = [
  {
    name: "blue",
    layer: "background",
    buttonIndex: 1,
    buttonLabel: "🟦",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/blue.png",
    bigFile: "ipfs://QmYxqqGoKYQzYxcBjZL69tWyyY3cx7wF795m2iEEJPMs68/blue.png",
  },
  {
    name: "green",
    layer: "background",
    buttonIndex: 2,
    buttonLabel: "🟩",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/green.png",
    bigFile: "ipfs://QmYxqqGoKYQzYxcBjZL69tWyyY3cx7wF795m2iEEJPMs68/green.png",
  },
  {
    name: "yellow",
    layer: "background",
    buttonIndex: 3,
    buttonLabel: "🟨",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/wheat.png",
    bigFile: "ipfs://QmYxqqGoKYQzYxcBjZL69tWyyY3cx7wF795m2iEEJPMs68/wheat.png",
  },
  {
    name: "orange",
    layer: "background",
    buttonIndex: 4,
    buttonLabel: "🟧",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/orange.png",
    bigFile: "ipfs://QmYxqqGoKYQzYxcBjZL69tWyyY3cx7wF795m2iEEJPMs68/orange.png",
  }
];

export const HEADS = [
  {
    name: "light",
    layer: "head",
    buttonIndex: 1,
    buttonLabel: "🧑🏼‍🦲",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/light.png",
  },
  {
    name: "mid",
    layer: "head",
    buttonIndex: 2,
    buttonLabel: "🧑🏽‍🦲",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/mid.png",
  },
  {
    name: "skull",
    layer: "head",
    buttonIndex: 3,
    buttonLabel: "💀",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/skeleton.png",
  },
  {
    name: "zombie",
    layer: "head",
    buttonIndex: 4,
    buttonLabel: "🧟",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/zombie.png",
  }
];

export const HATS = [
  {
    name: "none",
    layer: "top",
    buttonIndex: 1,
    buttonLabel: "🧑🏼‍🦲",
    file: null,
  },
  {
    name: "cap",
    layer: "top",
    buttonIndex: 2,
    buttonLabel: "🧢",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/cap.png",
  },
  {
    name: "cowboy",
    layer: "top",
    buttonIndex: 3,
    buttonLabel: "🤠",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/cowboy.png",
  },
  {
    name: "einstein",
    layer: "top",
    buttonIndex: 4,
    buttonLabel: "👨‍🦳",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/einstein.png",
  }
];

export const EYES = [
  {
    name: "eyes",
    layer: "eyes",
    buttonIndex: 1,
    buttonLabel: "👀",
    file: null,
  },
  {
    name: "sunglasses",
    layer: "eyes",
    buttonIndex: 2,
    buttonLabel: "🕶️",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/square-shades.png",
  },
  {
    name: "3D glasses",
    layer: "eyes",
    buttonIndex: 3,
    buttonLabel: "🧊",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/3d.png",
  },
  {
    name: "laser eyes",
    buttonIndex: 4,
    buttonLabel: "☄️",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/laser.png",
  }
];

export const FACIAL_HAIR = [
  {
    name: "none",
    layer: "facial hair",
    buttonIndex: 1,
    buttonLabel: "🧑🏼‍🦲",
    file: null,
  },
  {
    name: "goatee",
    layer: "facial hair",
    buttonIndex: 2,
    buttonLabel: "🐐",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/goatee.png",
  },
  {
    name: "beard",
    layer: "facial hair",
    buttonIndex: 3,
    buttonLabel: "🧔🏻‍♂️",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/long-beard.png",
  },
  {
    name: "chops",
    layer: "facial hair",
    buttonIndex: 4,
    buttonLabel: "🥢",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/mutton-chops.png",
  }
];

export const SHIRTS = [
  {
    name: "t-shirt",
    layer: "shirt",
    buttonIndex: 1,
    buttonLabel: "👕",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/stripes-blue-white.png",
  },
  {
    name: "purple",
    layer: "shirt",
    buttonIndex: 2,
    buttonLabel: "👚",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/purple-blue-pink.png",
  },
  {
    name: "pinata",
    layer: "shirt",
    buttonIndex: 3,
    buttonLabel: "🪅",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/pinata.png",
  },
  {
    name: "flames",
    layer: "shirt",
    buttonIndex: 4,
    buttonLabel: "🔥",
    file: "ipfs://QmY4fXS3tundbZtyzsgL2YiPfPZuuC2EgL7ycaq8vBjgzr/flames.png",
  }
];

export const LAYERS = [
  BACKGROUNDS,
  HEADS,
  HATS,
  EYES,
  FACIAL_HAIR,
  SHIRTS,
] as LayerSelectionOption[][];