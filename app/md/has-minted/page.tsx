import {
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import { hasMintedView } from "../../lib/hasMinted";
import { DEBUG_HUB_OPTIONS } from "../../debug/constants";
import type { State } from "../../lib/types";

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
  return state;
};

// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);
  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame);
  
  let requesterFid: number | null = null;
  if (previousFrame.postBody) {
    const frameMessage = await getFrameMessage(previousFrame.postBody, {
      ...DEBUG_HUB_OPTIONS,
    });
  
    if (frameMessage && !frameMessage?.isValid) {
      throw new Error("Invalid frame payload");
    }
    if (frameMessage) {
      requesterFid = frameMessage.requesterFid;
    }
  }
  return await hasMintedView(requesterFid ?? 0, state, previousFrame);
}
