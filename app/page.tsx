import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { APP_BANNER, APP_URL } from './api/utils';

const frameMetadata = getFrameMetadata({
  buttons: [{
    label: "Get Started"
  }],
  image: APP_BANNER,
  post_url: `${APP_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: 'myk.eth',
  description: 'LFG',
  openGraph: {
    title: 'myk.eth',
    description: 'LFG',
    images: [APP_BANNER],
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
