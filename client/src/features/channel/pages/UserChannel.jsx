import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";

import {
  getUserChannel,
  getUserChannelVideos,
  getUserChannelPlaylists,
  getChannelStats,
  toggleSubscription,
} from "../channel.service.js";

import ChannelLoading from "../components/ChannelLoading.jsx";
import ChannelHeader from "../components/ChannelHeader.jsx";
import ChannelTabs from "../components/ChannelTabs.jsx";
import ChannelVideos from "../components/ChannelVideos.jsx";
import ChannelPlaylists from "../components/ChannelPlaylists.jsx";
import ChannelAbout from "../components/ChannelAbout.jsx";

import { formatCount } from "../channel.utils.js";

const INITIAL_STATS = {
  subscribers: 0,
  totalVideos: 0,
  totalViews: 0,
  totalLikes: 0,
};

function UserChannel() {
  const { username } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [stats, setStats] = useState(INITIAL_STATS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Videos");
  const [subscribing, setSubscribing] = useState(false);

  const isOwner = Boolean(
    user?._id &&
    channelData?._id &&
    user._id.toString() === channelData._id.toString(),
  );

  const isSubscribed = Boolean(channelData?.isSubscribed);

  const channel = useMemo(
    () => ({
      ...channelData,
      name: channelData?.fullName || channelData?.username || "",
      username: channelData?.username ? `@${channelData.username}` : "",
      avatar: channelData?.avatar,
      cover: channelData?.coverImage,
      about: channelData?.about || "",
      initial: (channelData?.fullName || channelData?.username || "?")
        .charAt(0)
        .toUpperCase(),
    }),
    [channelData],
  );

  // Fetch channel data
  useEffect(() => {
    if (authLoading) return;

    if (!username) {
      setChannelData(null);
      setVideos([]);
      setPlaylists([]);
      setStats(INITIAL_STATS);
      setError("Channel not found.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchChannelData() {
      try {
        setLoading(true);
        setError("");

        setChannelData(null);
        setVideos([]);
        setPlaylists([]);
        setStats(INITIAL_STATS);

        // Fetch channel information first
        const channelResponse = await getUserChannel(
          username,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        if (!channelResponse?._id) {
          throw new Error("Channel not found.");
        }

        setChannelData(channelResponse);

        // Fetch videos, playlists, and public stats concurrently
        const [videosResult, playlistsResult, statsResult] =
          await Promise.allSettled([
            getUserChannelVideos(username, controller.signal),
            getUserChannelPlaylists(username, controller.signal),
            getChannelStats(channelResponse._id, controller.signal),
          ]);

        if (controller.signal.aborted) return;

        // Videos
        if (videosResult.status === "fulfilled") {
          const data = videosResult.value;

          setVideos(Array.isArray(data) ? data : data?.docs || []);
        } else {
          console.error("Failed to fetch channel videos:", videosResult.reason);
        }

        // Playlists
        if (playlistsResult.status === "fulfilled") {
          const data = playlistsResult.value;

          setPlaylists(Array.isArray(data) ? data : data?.docs || []);
        } else {
          console.error(
            "Failed to fetch channel playlists:",
            playlistsResult.reason,
          );
        }

        // Public channel statistics
        if (statsResult.status === "fulfilled") {
          setStats({
            ...INITIAL_STATS,
            ...statsResult.value,
          });
        } else {
          console.error("Failed to fetch channel stats:", statsResult.reason);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Failed to fetch user channel:", err);

        setChannelData(null);
        setVideos([]);
        setPlaylists([]);
        setStats(INITIAL_STATS);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load channel information.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchChannelData();

    return () => controller.abort();
  }, [username, authLoading]);

  // Handle tab changes
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Handle subscription
  const handleSubscribe = useCallback(async () => {
    if (!user || !channelData?._id || isOwner || subscribing) {
      return;
    }

    try {
      setSubscribing(true);
      setError("");

      const result = await toggleSubscription(channelData._id);
      //console.log("Subscription API response:", result);

      const subscribed = result?.isSubscribed ?? result?.subscribed;

      if (typeof subscribed !== "boolean") {
        throw new Error("Invalid subscription response.");
      }

      setChannelData((previous) =>
        previous ? { ...previous, isSubscribed: subscribed } : previous,
      );

      setStats((previous) => ({
        ...previous,
        subscribers: Math.max(0, previous.subscribers + (subscribed ? 1 : -1)),
      }));
    } catch (err) {
      console.error("Failed to toggle subscription:", err);

      setError(err.response?.data?.message || "Unable to update subscription.");
    } finally {
      setSubscribing(false);
    }
  }, [user, channelData?._id, isOwner, subscribing]);

  // Loading state
  if (authLoading || loading) {
    return <ChannelLoading />;
  }

  // Channel not found
  if (!channelData) {
    return (
      <div className="min-h-screen bg-[#08090b] px-6 py-12 text-white">
        <p role="alert" className="text-sm text-red-400">
          {error || "Channel not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
        {/* Channel Header */}
        <ChannelHeader
          channel={channel}
          stats={stats}
          formatCount={formatCount}
          isOwner={isOwner}
          isSubscribed={isSubscribed}
          onSubscribe={handleSubscribe}
          subscribing={subscribing}
        />

        {/* Channel Navigation */}
        <ChannelTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="
              mt-8 rounded-xl border border-red-500/20
              bg-red-500/10 px-4 py-3 text-sm text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* Videos */}
        {activeTab === "Videos" && (
          <ChannelVideos
            videos={videos}
            channel={channel}
            formatCount={formatCount}
            isOwner={isOwner}
          />
        )}

        {/* Tweets */}
        {activeTab === "Tweets" && (
          <section className="mt-8 text-sm text-gray-500">
            Tweets coming soon.
          </section>
        )}

        {/* Playlists */}
        {activeTab === "Playlists" && (
          <ChannelPlaylists
            playlists={playlists}
            channel={channel}
            isOwner={isOwner}
          />
        )}

        {/* About */}
        {activeTab === "About" && (
          <ChannelAbout about={channelData.about || ""} isOwner={isOwner} />
        )}
      </main>
    </div>
  );
}

export default UserChannel;
