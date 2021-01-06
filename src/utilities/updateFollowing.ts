import User from "../entities/User";
import { Octokit } from "@octokit/rest";

/**
 * Updates a user's followers depending on whether it has changed from
 * the last time we updated the list. Use a stored etag to determine whether
 * anything has changed and update the followers if it has.
 *
 * @param user The User we want to update the following list for
 */
const updateFollowing = async (user: User) => {
  const octokit = new Octokit({ auth: user.accessToken });
  let res;

  try {
    // Append a header depending on whether we have a stored etag
    if (user.followingEtag) {
      res = await octokit.request("GET /user/following", {
        headers: { "If-None-Match": user.followingEtag },
      });
    } else {
      res = await octokit.request("GET /user/following");
    }

    // Populate the new etag and following github Ids
    const etag = res.headers.etag || null;
    const ids: number[] = [];
    res.data.forEach((profile) => {
      if (profile) ids.push(profile.id);
    });

    await User.update(user.id, {
      ...user,
      followingEtag: etag,
      following: ids,
    });
  } catch (err) {
    /* 304 not modified falls into here and other errors*/
    console.log(err);
  }
};

export default updateFollowing;
