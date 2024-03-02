import {
  FrameButton,
  FrameContainer,
  FrameImage,
  PreviousFrame,
} from "frames.js/next/server";
import { State } from "./types";

export const ineligibleView = async (requesterFid: number, reason: string, state: State, previousFrame: PreviousFrame<State>) => {

  return (
    <div>
      <FrameContainer
        pathname="/md/start"
        postUrl="/md/start/frames"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage aspectRatio="1:1">
          <div
            style={{
              display: 'flex',
              height: '100%',
              width: '100%',
              alignItems: 'center',
              flexDirection: 'column-reverse',
              background: `url('https://i.seadn.io/s/raw/files/2f78856a5622e980cdde0e44b2a31de6.png?auto=format&dpr=1&w=1000')`,
              backgroundSize: "100% 100%",
              backgroundPosition: "center center",
              fontSize: 60,
              letterSpacing: -2,
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            <div tw="bg-[#5a1f69] p-8 rounded-t-xl bg-opacity-90 text-white font-bold w-full text-center flex">
              You are not eligible for this mint: {reason}
            </div>
          </div>
        </FrameImage>
        <FrameButton>Go back</FrameButton>
      </FrameContainer>
    </div>
  );
}