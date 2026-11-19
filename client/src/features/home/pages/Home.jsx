import { useCallback, useEffect, useRef, useState } from "react";
import VideoCard from "../../../components/videoCard/VideoCard.jsx";
import { getRandomVideoFeed } from "../home.service.js";

function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const seedRef = useRef(Math.floor(Math.random() * 2147483646) + 1);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const loadingMoreRef = useRef(false);

  // Load the initial feed or refresh it
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLoadMoreError(null);
    setVideos([]);
    setHasMore(true);
    loadingMoreRef.current = false;

    pageRef.current = 1;
    seedRef.current = Math.floor(Math.random() * 2147483646) + 1;

    try {
      const result = await getRandomVideoFeed({
        page: 1,
        limit: 20,
        seed: seedRef.current,
      });

      setVideos(result.videos);
      setHasMore(result.pagination.hasMore);
      pageRef.current = 1;
    } catch (error) {
      setError("Failed to load videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch the next page and append it
  const fetchNextPage = useCallback(async () => {
    if (loading || loadingMoreRef.current || !hasMore) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(null);

    const nextPage = pageRef.current + 1;

    try {
      const result = await getRandomVideoFeed({
        page: nextPage,
        limit: 20,
        seed: seedRef.current,
      });

      setVideos((prev) => [...prev, ...result.videos]);
      setHasMore(result.pagination.hasMore);
      pageRef.current = nextPage;
    } catch (error) {
      setLoadMoreError("Failed to load more videos.");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [loading, hasMore]);

  // Initial fetch
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Observe the element at the bottom of the feed
  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || loading || !hasMore) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "400px",
        threshold: 0,
      },
    );

    observerRef.current.observe(target);

    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, fetchNextPage]);

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <section className="mt-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Explore</h1>

            <button
              onClick={fetchFeed}
              disabled={loading}
              className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh feed"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              <div className="col-span-full py-20 text-center text-zinc-500">
                Loading videos...
              </div>
            ) : error && videos.length === 0 ? (
              <div className="col-span-full py-20 text-center text-red-400">
                <p>{error}</p>
                <button
                  onClick={fetchFeed}
                  className="mt-4 text-white underline underline-offset-4"
                >
                  Try again
                </button>
              </div>
            ) : videos.length > 0 ? (
              videos.map((video) => <VideoCard key={video._id} video={video} />)
            ) : (
              <div className="col-span-full py-20 text-center text-zinc-500">
                No videos available yet.
              </div>
            )}
          </div>

          {/* Infinite scroll trigger */}
          {!loading && hasMore && !loadMoreError && (
            <div
              ref={loadMoreRef}
              className="flex justify-center py-10 text-sm text-zinc-500"
            >
              {loadingMore && "Loading more videos..."}
            </div>
          )}

          {/* Error loading the next page */}
          {!loading && loadMoreError && videos.length > 0 && (
            <div className="py-8 text-center text-zinc-400">
              <p>{loadMoreError}</p>
              <button
                onClick={fetchNextPage}
                disabled={loadingMore}
                className="mt-3 text-white underline underline-offset-4 disabled:opacity-50"
              >
                {loadingMore ? "Retrying..." : "Retry"}
              </button>
            </div>
          )}

          {/* End of feed */}
          {!loading && !hasMore && videos.length > 0 && (
            <p className="py-10 text-center text-sm text-zinc-500">
              You've reached the end.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;
