import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';

const frameMetadata = getFrameMetadata({
  buttons: ['Next Mochimon'],
  image: 'https://raw.seadn.io/files/f3cb5c80c96cea79441a15f06ee291c5.png',
  post_url: 'https://farcaster-frame-myk.vercel.app/api/frame',
});

export const metadata: Metadata = {
  title: 'myk.eth',
  description: 'LFG',
  openGraph: {
    title: 'myk.eth',
    description: 'LFG',
    images: ['https://raw.seadn.io/files/f3cb5c80c96cea79441a15f06ee291c5.png'],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>myk.eth</h1>
    </>
  );
}
