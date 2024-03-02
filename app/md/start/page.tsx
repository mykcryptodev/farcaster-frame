import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import { getFrameMessage } from "frames.js";
import Link from "next/link";
import type { State } from "../../lib/types";
import { DEBUG_HUB_OPTIONS } from "../../debug/constants";

const initialState: State = {
  l: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  },
  hM: false,
  gS: false,
  iE: false,
};

const reducer: FrameReducer<State> = (state, action) => {
  const buttonIndex = action.postBody?.untrustedData.buttonIndex;

  if (buttonIndex === null || buttonIndex === undefined) {
    return state;
  }

  if (buttonIndex === 1) {
    return { ...state, gS: true };
  }

  return state;
};

// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);
  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame);
  const imageUrl = `https://ipfs.io/ipfs/QmXAAdmuwiooY88E6KdZ5xdhqmHm6qxJb4QxNWhRUe6jeo/mykbois.png`;

  // then, when done, return next frame
  return (
    <div>
      Multi-page example <Link href="/debug">Debug</Link>
      <FrameContainer
        pathname="/md/build"
        postUrl="/md/build/frames"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage>
          <img width={"100%"} height={"100%"} src={imageUrl} alt="Get started!" />
        </FrameImage>
        <FrameButton>Get Started</FrameButton>
      </FrameContainer>
    </div>
  );
}
