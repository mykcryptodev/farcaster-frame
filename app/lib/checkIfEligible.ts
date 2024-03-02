import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const FID_THRESHOLD = 30_000;
export const checkIfEligible = async (requesterFid: number) => {
  // if (requesterFid > FID_THRESHOLD) return {
  //   isEligible: false,
  //   reason: "FID too high",
  // };
  try {
    const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);
    const userInfo = await client.lookupUserByFid(requesterFid);
    const activeStatus = userInfo.result.user.activeStatus;

    if (activeStatus === "active") return {
      isEligible: true,
    };
  } catch (e) {
    return {
      isEligible: false,
      reason: "Error fetching user info",
    };
  }
  return {
    isEligible: false,
    reason: "User is not active",
  };
}