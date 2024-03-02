import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";
import type { State } from "../../lib/types";
import { generateNfts } from "../../lib/nftGenerator";
import { LAYERS } from "../../lib/constants";
import { DEBUG_HUB_OPTIONS } from "../../debug/constants";
import { checkIfMinted } from "../../lib/checkIfMinted";
import { hasMintedView } from "../../lib/hasMinted";
import { checkIfEligible } from "../../lib/checkIfEligible";
import { ineligibleView } from "../../lib/ineligible";

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

  // set got started to true if it isnt already
  if (!state.gS) {
    return { ...state, gS: true };
  }

  // find the first null key in state.l and update it
  for (let i = 1; i <= Object.keys(state.l).length; i++) {
    if (state.l[i] === null) {
      return { ...state, l: { ...state.l, [i]: buttonIndex } };
    }
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

  let requesterFid: number | null = null;
  let hasMinted = state.hM;
  let eligibility = {
    isEligible: state.iE ?? false,
    reason: ''
  } as { isEligible: boolean; reason?: string };
  if (previousFrame.postBody) {
    const frameMessage = await getFrameMessage(previousFrame.postBody, {
      ...DEBUG_HUB_OPTIONS,
    });
  
    if (frameMessage && !frameMessage?.isValid) {
      throw new Error("Invalid frame payload");
    }
    if (frameMessage) {
      requesterFid = frameMessage.requesterFid;
      const { buttonIndex } = frameMessage;

      // On the first button press, check if minted and save to state
      if (buttonIndex === 1) {
        const [userHasMinted, userEligibility] = await Promise.all([
          checkIfMinted(requesterFid),
          checkIfEligible(requesterFid),
        ]);
        state.hM = userHasMinted;
        hasMinted = userHasMinted;
        eligibility = userEligibility;
      } else {
        // assume they are eligible otherwise
        eligibility = {
          isEligible: true,
        }
      }
    }
  }

  if (!requesterFid) {
    throw new Error("No requester ID");
  }

  if (hasMinted) {
    return await hasMintedView(requesterFid, state, previousFrame);
  }

  if (!eligibility.isEligible) {
    return await ineligibleView(requesterFid, eligibility.reason ?? "Unknown Reason", state, previousFrame);
  }

  const imageUrl = `https://picsum.photos/seed/frames.js-0/1146/600`;
  // if every layer is not null, then we are on the mint page
  const isOnFinalLayer = Object.keys(state.l).every((key) => state.l[Number(key)] !== null);
  const pathName = hasMinted ? "/md/has-minted" : isOnFinalLayer ? "/md/mint" : "/md/build";
  const { previewImageUrl } = await generateNfts(state, isOnFinalLayer);
  // the current step is the last layer that is not null in state.l
  const currentStep = Object.keys(state.l).findIndex((key) => state.l[Number(key)] === null);
  const layerOptions = LAYERS[currentStep];

  // then, when done, return next frame
  return (
    <div>
      Multi-page example <Link href="/debug">Debug</Link>
      <FrameContainer
        pathname={pathName}
        postUrl={`${pathName}/frames`}
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage aspectRatio="1:1">
          <img width={"100%"} height={"100%"} src={previewImageUrl ?? imageUrl} alt="Image" />
        </FrameImage>
        {isOnFinalLayer ? (
          <FrameButton>Mint!</FrameButton>
        ) : null}
        {isOnFinalLayer ? (
          <FrameInput text="Give your NFT a name!" />
        ) : null}
        {!isOnFinalLayer ? (
          <FrameButton>{layerOptions?.[0]?.buttonLabel ?? "Option"}</FrameButton>
        ) : null}
        {!isOnFinalLayer ? (
          <FrameButton>{layerOptions?.[1]?.buttonLabel ?? "Option"}</FrameButton>
        ) : null}
        {!isOnFinalLayer ? (
          <FrameButton>{layerOptions?.[2]?.buttonLabel ?? "Option"}</FrameButton>
        ) : null}
        {!isOnFinalLayer ? (
          <FrameButton>{layerOptions?.[3]?.buttonLabel ?? "Option"}</FrameButton>
        ) : null}
      </FrameContainer>
    </div>
  );
}
