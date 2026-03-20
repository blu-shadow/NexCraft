// ═══════════════════════════════════════════════════════════
//                   useFetch HOOK
//     Generic data fetching with loading, error, refetch
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

// ─────────────────────────────────────────
//   useFetch — Fetch data from any URL
//   Usage:
//     const { data, loading, error, refetch } = useFetch("/api/blogs");
// ─────────────────────────────────────────
const useFetch = (url, options = {}) => {
  const {
    method       = "GET",
    body         = null,
    headers      = {},
    immediate    = true,  // fetch on mount
    deps         = [],    // re-fetch when these change
    transform    = null,  // transform response data
    onSuccess    = null,
    onError      = null,
  } = options;

  const [data,    setData   ] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error,   setError  ] = useState(null);

  // Track if component is still mounted
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ─────────────────────────────────────────
  //   Fetch Function
  // ─────────────────────────────────────────
  const fetchData = useCallback(async (overrideUrl = null, overrideBody = null) => {
    const targetUrl = overrideUrl || url;
    if (!targetUrl) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");

      const config = {
        method,
        url   : targetUrl,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...headers,
        },
        ...(body || overrideBody ? { data: overrideBody || body } : {}),
      };

      const res      = await axios(config);
      const result   = transform ? transform(res.data) : res.data;

      if (isMountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }

      return result;

    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Something went wrong";
      if (isMountedRef.current) {
        setError(errMsg);
        onError?.(errMsg);
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [url, method, body, JSON.stringify(headers)]);

  // ─────────────────────────────────────────
  //   Auto fetch on mount + deps change
  // ─────────────────────────────────────────
  useEffect(() => {
    if (immediate && url) fetchData();
  }, [url, immediate, ...deps]);

  return {
    data,
    loading,
    error,
    refetch : fetchData,
    setData,
    setError,
  };
};

// ─────────────────────────────────────────
//   usePaginatedFetch — For paginated lists
//   Usage:
//     const { items, page, nextPage, prevPage, ... } = usePaginatedFetch("/api/blogs");
// ─────────────────────────────────────────
export const usePaginatedFetch = (baseUrl, options = {}) => {
  const { limit = 10, initialPage = 1 } = options;

  const [page,    setPage   ] = useState(initialPage);
  const [items,   setItems  ] = useState([]);
  const [total,   setTotal  ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState(null);

  const url = `${baseUrl}?page=${page}&limit=${limit}`;

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const res   = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const { data } = res;

      setItems(
        data.blogs   || data.videos   || data.orders  ||
        data.services|| data.users    || data.items   || []
      );
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    page,
    total,
    totalPages,
    loading,
    error,
    hasNext    : page < totalPages,
    hasPrev    : page > 1,
    nextPage   : () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage   : () => setPage((p) => Math.max(p - 1, 1)),
    goToPage   : (n) => setPage(n),
    refetch    : fetchPage,
    setItems,
  };
};

// ─────────────────────────────────────────
//   useInfiniteScroll — Load more on scroll
//   Usage:
//     const { items, loadMore, hasMore, loading } = useInfiniteScroll("/api/blogs");
// ─────────────────────────────────────────
export const useInfiniteScroll = (baseUrl, options = {}) => {
  const { limit = 10 } = options;

  const [items,   setItems  ] = useState([]);
  const [page,    setPage   ] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const url   = `${baseUrl}?page=${page}&limit=${limit}`;
      const res   = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const newItems = (
        res.data.blogs   || res.data.videos  || res.data.orders ||
        res.data.services|| res.data.items   || []
      );

      setItems((prev) => [...prev, ...newItems]);
      setPage((p)    => p + 1);
      setHasMore(newItems.length === limit);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load more");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, page, limit, loading, hasMore]);

  // Load first page on mount
  useEffect(() => { loadMore(); }, []);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return { items, loadMore, hasMore, loading, error, reset, setItems };
};

export { useFetch };
export default useFetch;
