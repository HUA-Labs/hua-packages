"use client";

import React, { useRef, useEffect, useState } from "react";
import { merge } from "../../lib/utils";

/**
 * VideoBackground 컴포넌트의 props / VideoBackground component props
 * @property {string} src - 비디오 소스 (URL, YouTube ID, Vimeo ID) / Video source
 * @property {"native" | "youtube" | "vimeo"} [type="native"] - 비디오 타입 / Video type
 * @property {string} [poster] - 포스터 이미지 URL / Poster image URL
 * @property {boolean} [autoPlay=true] - 자동 재생 / Auto play
 * @property {boolean} [loop=true] - 반복 재생 / Loop playback
 * @property {boolean} [muted=true] - 음소거 / Mute audio
 * @property {boolean} [controls=false] - 컨트롤 표시 / Show controls
 * @property {"cover" | "contain" | "fill"} [objectFit="cover"] - 비디오 맞춤 / Video fit
 * @property {boolean} [overlay=true] - 오버레이 표시 / Show overlay
 * @property {string} [overlayColor="rgba(0, 0, 0, 0.4)"] - 오버레이 색상 / Overlay color
 * @property {boolean} [gradient=false] - 그라디언트 오버레이 / Gradient overlay
 * @property {"top" | "bottom" | "both"} [gradientDirection="bottom"] - 그라디언트 방향 / Gradient direction
 * @property {number} [playbackRate=1] - 재생 속도 / Playback rate
 * @property {boolean} [fadeIn=true] - 페이드 인 효과 / Fade in effect
 */
export interface VideoBackgroundProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  src: string;
  type?: "native" | "youtube" | "vimeo";
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  objectFit?: "cover" | "contain" | "fill";
  overlay?: boolean;
  overlayColor?: string;
  gradient?: boolean;
  gradientDirection?: "top" | "bottom" | "both";
  playbackRate?: number;
  fadeIn?: boolean;
  children?: React.ReactNode;
}

/**
 * VideoBackground 컴포넌트 / VideoBackground component
 *
 * 페이지 배경으로 사용할 수 있는 비디오 컴포넌트입니다.
 * YouTube, Vimeo, 일반 비디오 소스를 지원합니다.
 *
 * Video component that can be used as page background.
 * Supports YouTube, Vimeo, and native video sources.
 *
 * @component
 * @example
 * // Native video
 * <VideoBackground src="/hero-video.mp4" overlay gradient>
 *   <h1>Welcome</h1>
 * </VideoBackground>
 *
 * @example
 * // YouTube video
 * <VideoBackground
 *   type="youtube"
 *   src="dQw4w9WgXcQ"
 *   overlay
 *   overlayColor="rgba(0, 0, 50, 0.5)"
 * />
 *
 * @example
 * // Vimeo video
 * <VideoBackground type="vimeo" src="123456789" />
 */
const VideoBackground = React.forwardRef<HTMLDivElement, VideoBackgroundProps>(
  (
    {
      src,
      type = "native",
      poster,
      autoPlay = true,
      loop = true,
      muted = true,
      controls = false,
      objectFit = "cover",
      overlay = true,
      overlayColor = "rgba(0, 0, 0, 0.4)",
      gradient = false,
      gradientDirection = "bottom",
      playbackRate = 1,
      fadeIn = true,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Handle native video playback rate
    useEffect(() => {
      if (type === "native" && videoRef.current) {
        videoRef.current.playbackRate = playbackRate;
      }
    }, [playbackRate, type]);

    // Handle video loaded
    const handleLoadedData = () => {
      setIsLoaded(true);
    };

    const handlePlaying = () => {
      setIsPlaying(true);
    };

    // Generate YouTube embed URL
    const getYouTubeUrl = (videoId: string) => {
      const params = new URLSearchParams({
        autoplay: autoPlay ? "1" : "0",
        mute: muted ? "1" : "0",
        loop: loop ? "1" : "0",
        controls: controls ? "1" : "0",
        playlist: videoId, // Required for loop to work
        modestbranding: "1",
        rel: "0",
        showinfo: "0",
        iv_load_policy: "3",
        disablekb: "1",
        enablejsapi: "1",
        playsinline: "1",
      });
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    };

    // Generate Vimeo embed URL
    const getVimeoUrl = (videoId: string) => {
      const params = new URLSearchParams({
        autoplay: autoPlay ? "1" : "0",
        muted: muted ? "1" : "0",
        loop: loop ? "1" : "0",
        controls: controls ? "1" : "0",
        background: "1",
        quality: "auto",
        dnt: "1",
      });
      return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
    };

    // Render video element based on type
    const renderVideo = () => {
      const objectFitClass = {
        cover: "object-cover",
        contain: "object-contain",
        fill: "object-fill",
      }[objectFit];

      switch (type) {
        case "youtube":
          return (
            <iframe
              src={getYouTubeUrl(src)}
              className={merge(
                "absolute inset-0 w-full h-full pointer-events-none",
                "scale-[1.2]" // Scale up to hide YouTube branding
              )}
              style={{
                opacity: isLoaded || !fadeIn ? 1 : 0,
                transition: fadeIn ? "opacity 0.8s ease-out" : undefined,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoaded(true)}
              title="YouTube video background"
            />
          );

        case "vimeo":
          return (
            <iframe
              src={getVimeoUrl(src)}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                opacity: isLoaded || !fadeIn ? 1 : 0,
                transition: fadeIn ? "opacity 0.8s ease-out" : undefined,
              }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoaded(true)}
              title="Vimeo video background"
            />
          );

        case "native":
        default:
          return (
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              autoPlay={autoPlay}
              loop={loop}
              muted={muted}
              controls={controls}
              playsInline
              className={merge(
                "absolute inset-0 w-full h-full",
                objectFitClass
              )}
              style={{
                opacity: isPlaying || !fadeIn ? 1 : 0,
                transition: fadeIn ? "opacity 0.8s ease-out" : undefined,
              }}
              onLoadedData={handleLoadedData}
              onPlaying={handlePlaying}
            />
          );
      }
    };

    // Generate gradient overlay
    const renderGradientOverlay = () => {
      if (!gradient) return null;

      const gradients = [];

      if (gradientDirection === "top" || gradientDirection === "both") {
        gradients.push(
          <div
            key="top"
            className="absolute top-0 left-0 right-0 h-1/3"
            style={{
              background: `linear-gradient(to bottom, ${overlayColor}, transparent)`,
            }}
            aria-hidden="true"
          />
        );
      }

      if (gradientDirection === "bottom" || gradientDirection === "both") {
        gradients.push(
          <div
            key="bottom"
            className="absolute bottom-0 left-0 right-0 h-1/3"
            style={{
              background: `linear-gradient(to top, ${overlayColor}, transparent)`,
            }}
            aria-hidden="true"
          />
        );
      }

      return <>{gradients}</>;
    };

    return (
      <div
        ref={ref}
        className={merge(
          "relative overflow-hidden",
          className
        )}
        style={style}
        {...props}
      >
        {/* Poster image (shows until video loads) */}
        {poster && fadeIn && !isLoaded && !isPlaying && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${poster})` }}
            aria-hidden="true"
          />
        )}

        {/* Video layer */}
        {renderVideo()}

        {/* Solid overlay */}
        {overlay && !gradient && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: overlayColor }}
            aria-hidden="true"
          />
        )}

        {/* Gradient overlay */}
        {renderGradientOverlay()}

        {/* Content */}
        {children && (
          <div className="relative z-10 h-full">
            {children}
          </div>
        )}
      </div>
    );
  }
);

VideoBackground.displayName = "VideoBackground";

export { VideoBackground };
