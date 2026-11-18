import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../../context/AuthContext.jsx";

import {
  getNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead as markNotificationAsReadApi,
  markAllNotificationsAsRead as markAllNotificationsAsReadApi,
} from "../notification.service.js";

const PAGE_SIZE = 10;

function useNotifications() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Prevent outdated requests from updating the current state.
  const requestIdRef = useRef(0);
  const loadingMoreRef = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return 0;

    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
      return count;
    } catch (err) {
      console.error("Failed to fetch unread notification count:", err);
      throw err;
    }
  }, [isAuthenticated]);

  const fetchPage = useCallback(
    async (pageNumber = 1, { append = false } = {}) => {
      if (!isAuthenticated) return;

      const requestId = ++requestIdRef.current;

      try {
        if (append) {
          setLoadingMore(true);
          loadingMoreRef.current = true;
        } else {
          setLoading(true);
        }

        setError(null);

        const fetcher =
          filter === "unread" ? getUnreadNotifications : getNotifications;

        const result = await fetcher({
          page: pageNumber,
          limit: PAGE_SIZE,
        });

        // Ignore results from outdated requests.
        if (requestId !== requestIdRef.current) return;

        const docs = result?.docs ?? [];

        setNotifications((current) => (append ? [...current, ...docs] : docs));

        setPage(pageNumber);
        setHasMore(Boolean(result?.hasNextPage));

        return result;
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        console.error("Failed to fetch notifications:", err);

        setError(
          err.response?.data?.message ||
            "Couldn't load notifications. Please try again.",
        );

        throw err;
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          loadingMoreRef.current = false;
        }
      }
    },
    [filter, isAuthenticated],
  );

  // Initialize notifications whenever authentication or filter changes.
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let cancelled = false;

    setNotifications([]);
    setPage(1);
    setHasMore(false);
    setError(null);

    if (!isAuthenticated) {
      setUnreadCount(0);
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;

      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    const load = async () => {
      try {
        const fetcher =
          filter === "unread" ? getUnreadNotifications : getNotifications;

        const [result, count] = await Promise.all([
          fetcher({ page: 1, limit: PAGE_SIZE }),
          getUnreadNotificationCount(),
        ]);

        if (cancelled || requestId !== requestIdRef.current) return;

        setNotifications(result?.docs ?? []);
        setUnreadCount(count);
        setPage(1);
        setHasMore(Boolean(result?.hasNextPage));
      } catch (err) {
        if (cancelled || requestId !== requestIdRef.current) return;

        console.error("Failed to initialize notifications:", err);

        setError(
          err.response?.data?.message ||
            "Couldn't load notifications. Please try again.",
        );
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;

      if (requestId === requestIdRef.current) {
        requestIdRef.current++;
      }
    };
  }, [filter, isAuthenticated]);

  const loadMore = useCallback(async () => {
    if (!isAuthenticated || loading || loadingMoreRef.current || !hasMore) {
      return;
    }

    await fetchPage(page + 1, { append: true });
  }, [fetchPage, hasMore, isAuthenticated, loading, page]);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    const results = await Promise.allSettled([
      fetchPage(1),
      refreshUnreadCount(),
    ]);

    const failedRequest = results.find(
      (result) => result.status === "rejected",
    );

    if (failedRequest) {
      throw failedRequest.reason;
    }
  }, [fetchPage, isAuthenticated, refreshUnreadCount]);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!isAuthenticated) return;

      const target = notifications.find(
        (notification) => notification._id === notificationId,
      );

      if (!target || target.isRead) return;

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );

      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await markNotificationAsReadApi(notificationId);

        if (filter === "unread") {
          setNotifications((current) =>
            current.filter(
              (notification) => notification._id !== notificationId,
            ),
          );
        }
      } catch (err) {
        setNotifications((current) =>
          current.map((notification) =>
            notification._id === notificationId
              ? { ...notification, isRead: false }
              : notification,
          ),
        );

        // Reconcile with the server instead of blindly incrementing.
        try {
          await refreshUnreadCount();
        } catch {
          // Keep the existing count if reconciliation also fails.
        }

        setError(
          err.response?.data?.message ||
            "Couldn't mark the notification as read.",
        );

        throw err;
      }
    },
    [filter, isAuthenticated, notifications, refreshUnreadCount],
  );

  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    const previousNotifications = notifications;

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );

    setUnreadCount(0);
    setError(null);

    try {
      await markAllNotificationsAsReadApi();

      if (filter === "unread") {
        setNotifications([]);
        setHasMore(false);
      }
    } catch (err) {
      setNotifications(previousNotifications);

      try {
        await refreshUnreadCount();
      } catch {
        // Keep the current count if reconciliation fails.
      }

      setError(
        err.response?.data?.message ||
          "Couldn't mark all notifications as read.",
      );

      throw err;
    }
  }, [filter, isAuthenticated, notifications, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    filter,
    setFilter,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  };
}

export default useNotifications;
