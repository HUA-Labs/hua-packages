/**
 * @hua-labs/hua/framework - Data Fetching Utilities
 * 
 * Type-safe data fetching utilities for server and client components
 */

'use client';

import React, { useState, useEffect } from 'react';

/**
 * Data fetching result
 */
export interface DataFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Client-side data fetching hook
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data, isLoading, error } = useData<Post[]>('/api/posts');
 *   
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *   return <PostList posts={data} />;
 * }
 * ```
 */
export function useData<T>(
  url: string,
  options?: RequestInit
): DataFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Server-side data fetching utility
 * 
 * @example
 * ```tsx
 * // app/page.tsx (Server Component)
 * import { fetchData } from '@hua-labs/hua/framework';
 * 
 * export default async function HomePage() {
 *   const posts = await fetchData<Post[]>('/api/posts');
 *   return <PostList posts={posts} />;
 * }
 * ```
 */
export async function fetchData<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
