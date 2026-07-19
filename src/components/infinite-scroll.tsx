"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface InfiniteScrollProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

// 末尾に近づいた時点で先読みを開始するため、監視範囲を下方向に広げる
const OBSERVER_OPTIONS: IntersectionObserverInit = { rootMargin: "100px" };

export function InfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollProps) {
  const { targetRef, isIntersecting } =
    useIntersectionObserver(OBSERVER_OPTIONS);

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* IntersectionObserver の監視対象(番兵要素) */}
      <div ref={targetRef} className="h-1" />
      {hasNextPage ? (
        <Button
          variant="secondary"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          You have reached the end of the list
        </p>
      )}
    </div>
  );
}
