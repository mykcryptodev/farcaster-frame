import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { APP_URL } from './api/utils';

const frameMetadata = getFrameMetadata({
  buttons: [{
    label: "Get Started"
  }],
  image: 'https://ipfs.io/ipfs/QmXAzLJRwNFuE7S6L2EZdJ51yuMQJtiXKdRVURTmTdotj7/rodeo.png',
  post_url: `${APP_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: 'myk.eth',
  description: 'LFG',
  openGraph: {
    title: 'myk.eth',
    description: 'LFG',
    images: ['https://ipfs.io/ipfs/QmXAzLJRwNFuE7S6L2EZdJ51yuMQJtiXKdRVURTmTdotj7/rodeo.png'],
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
