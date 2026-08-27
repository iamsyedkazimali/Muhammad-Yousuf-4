import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  /** Shown if the source fails to load. */
  fallbackSrc?: string;
  wrapperClassName?: string;
};

/**
 * Lazy-loaded, async-decoded image with a skeleton shimmer while loading
 * and a graceful fallback on error.
 */
export function SmartImage({
  className,
  wrapperClassName,
  fallbackSrc,
  alt = "",
  loading = "lazy",
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden />
      )}
      <img
        {...rest}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          if (fallbackSrc && !errored) {
            setErrored(true);
            (e.currentTarget as HTMLImageElement).src = fallbackSrc;
          } else {
            setLoaded(true);
          }
        }}
        className={cn(
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </div>
  );
}
