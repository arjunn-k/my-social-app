import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import PostComposer from "../components/posts/PostComposer";
import PostCard from "../components/posts/PostCard";
import UserSearch from "../components/search/UserSearch";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { currentUser, unreadNotifications, setUnreadNotifications } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);

  const loadFeed = useCallback(async (nextPage = 1, replace = false) => {
    try {
      setLoading(true);
      const { data } = await api.get("/posts/feed", {
        params: { page: nextPage, limit: 6 }
      });

      const incomingPosts = data.posts;
      setPosts((existing) => (replace ? incomingPosts : [...existing, ...incomingPosts]));
      setHasMore(data.pagination.hasMore);
      setPage(nextPage);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(1, true);
  }, [loadFeed]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/users/me/notifications", {
          params: { limit: 5 }
        });
        setNotifications(data.notifications);
        if (unreadNotifications > 0) {
          await api.patch("/users/me/notifications/read");
          setUnreadNotifications(0);
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load notifications");
      }
    };

    fetchNotifications();
  }, [currentUser?._id, setUnreadNotifications]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: () => loadFeed(page + 1)
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
      <div className="space-y-6">
        <section className="glass-card overflow-hidden">
          <div className="grid gap-6 bg-ink px-6 py-8 text-white md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gold">Home feed</p>
              <h1 className="mt-4 font-display text-5xl leading-none">
                Welcome back, {currentUser?.displayName || currentUser?.username}.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">
                Your stream combines your own posts with updates from people you follow,
                newest first and ready for infinite scrolling.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">At a glance</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">{currentUser?.followingCount || 0}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Following</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">{currentUser?.followersCount || 0}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Followers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PostComposer
          onPostCreated={(post) => {
            setPosts((existing) => [post, ...existing]);
          }}
        />

        <section className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
              onUpdatePost={(updatedPost) =>
                setPosts((existing) =>
                  existing.map((item) => (item._id === updatedPost._id ? updatedPost : item))
                )
              }
              onDeletePost={(postId) =>
                setPosts((existing) => existing.filter((item) => item._id !== postId))
              }
            />
          ))}

          {loading && <p className="px-2 text-sm text-slate">Loading feed...</p>}
          {!loading && posts.length === 0 && (
            <div className="glass-card p-6 text-sm text-slate">
              Your feed is empty. Share the first post or follow a few people.
            </div>
          )}
          <div ref={sentinelRef} className="h-10" />
        </section>

        {error && <p className="text-sm text-coral">{error}</p>}
      </div>

      <aside className="space-y-6">
        <UserSearch />

        <section className="glass-card p-5">
          <h2 className="font-display text-2xl text-ink">Notifications</h2>
          <p className="mt-1 text-sm text-slate">Recent activity around your account.</p>

          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id} className="rounded-2xl bg-sand p-4">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">
                      {notification.actor?.displayName || notification.actor?.username}
                    </span>{" "}
                    {notification.type === "follow" && "followed you"}
                    {notification.type === "like" && "liked your post"}
                    {notification.type === "comment" && "commented on your post"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}

export default HomePage;

