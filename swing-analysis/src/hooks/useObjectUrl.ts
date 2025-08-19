import { useEffect, useRef, useState } from 'react';

/**
 * Hook to manage object URL lifecycle
 * Automatically creates and revokes blob URLs
 */
export function useObjectUrl(file: File | Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    // Clean up previous URL
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    // Create new URL if file exists
    if (file) {
      const newUrl = URL.createObjectURL(file);
      urlRef.current = newUrl;
      setUrl(newUrl);
    } else {
      setUrl(null);
    }

    // Cleanup on unmount or when file changes
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [file]);

  return url;
}

/**
 * Hook to manage multiple object URLs
 * Useful for managing multiple video files
 */
export function useObjectUrls(files: (File | Blob | null)[]): (string | null)[] {
  const [urls, setUrls] = useState<(string | null)[]>([]);
  const urlsRef = useRef<(string | null)[]>([]);

  useEffect(() => {
    // Clean up all previous URLs
    urlsRef.current.forEach((url) => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });
    urlsRef.current = [];

    // Create new URLs
    const newUrls = files.map((file) => {
      if (file) {
        return URL.createObjectURL(file);
      }
      return null;
    });

    urlsRef.current = newUrls;
    setUrls(newUrls);

    // Cleanup on unmount or when files change
    return () => {
      urlsRef.current.forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
      urlsRef.current = [];
    };
  }, [files]);

  return urls;
}

/**
 * Hook to manage temporary object URLs with timeout
 * Useful for preview images or temporary media
 */
export function useTempObjectUrl(
  file: File | Blob | null,
  timeoutMs: number = 60000 // Default 1 minute
): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Clean up previous URL
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    // Create new URL if file exists
    if (file) {
      const newUrl = URL.createObjectURL(file);
      urlRef.current = newUrl;
      setUrl(newUrl);

      // Set timeout to revoke URL
      timeoutRef.current = setTimeout(() => {
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current);
          urlRef.current = null;
          setUrl(null);
        }
      }, timeoutMs);
    } else {
      setUrl(null);
    }

    // Cleanup on unmount or when file changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [file, timeoutMs]);

  return url;
}