"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────

interface ImageItem {
  url: string;
  alt?: string;
}

interface BackgroundFieldProps {
  /** Optional array of image URLs to override Pinterest feed */
  images?: ImageItem[];
  /** Base opacity multiplier. Default 0.12 */
  opacity?: number;
  /** Set to false to disable the entire component */
  enabled?: boolean;
}

// ── Layout config for the 8 drifting instances ─────────────────────────────
//
// Each entry:
//   left%  — horizontal position as a percentage of the viewport width
//   top%   — vertical position as a percentage of the viewport height
//   width  — CSS string for element width
//   opacity — per-instance opacity (overrides the global prop)
//   driftY  — total vertical drift in px (animates 0 → -driftY → 0, looped)
//   duration — loop period in seconds
//   rotation — static tilt in degrees

const INSTANCES = [
  { left: "5%",  top: "10%", width: "280px", opacity: 0.10, driftY: 24, duration: 28, rotation: -2   },
  { left: "25%", top: "60%", width: "220px", opacity: 0.07, driftY: 18, duration: 34, rotation:  1.5 },
  { left: "55%", top: "5%",  width: "340px", opacity: 0.13, driftY: 30, duration: 22, rotation: -1   },
  { left: "75%", top: "40%", width: "200px", opacity: 0.08, driftY: 22, duration: 38, rotation:  3   },
  { left: "15%", top: "80%", width: "260px", opacity: 0.09, driftY: 20, duration: 32, rotation: -2.5 },
  { left: "65%", top: "70%", width: "310px", opacity: 0.11, driftY: 26, duration: 26, rotation:  1   },
  { left: "85%", top: "15%", width: "240px", opacity: 0.06, driftY: 16, duration: 40, rotation: -3   },
  { left: "40%", top: "45%", width: "180px", opacity: 0.08, driftY: 28, duration: 20, rotation:  2   },
] as const;

// ── Fallback: use /banner.png repeated at all 8 positions ─────────────────

const FALLBACK_SRC = "/banner.png";

// ── Component ──────────────────────────────────────────────────────────────

export default function BackgroundField({
  images: imagesProp,
  opacity = 0.12,
  enabled = true,
}: BackgroundFieldProps) {
  const [mounted, setMounted] = useState(false);
  const [pinterestImages, setPinterestImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Pinterest images (server returns [] if not configured — silent fallback)
  useEffect(() => {
    if (!enabled) return;
    fetch('/api/pinterest')
      .then((r) => r.json())
      .then((data) => {
        if (data.images?.length > 0) {
          setPinterestImages(data.images);
        }
      })
      .catch(() => {/* silent — use fallback */});
  }, [enabled]);

  // Never render during SSR or when disabled
  if (!mounted || !enabled) return null;

  // Priority: prop override → Pinterest feed → fallback banner
  const activeImages = imagesProp ?? (pinterestImages.length > 0 ? pinterestImages : null);

  // Build a flat list of resolved sources — one per instance slot
  const sources: ImageItem[] = INSTANCES.map((_, i) => {
    if (activeImages && activeImages.length > 0) {
      return activeImages[i % activeImages.length];
    }
    return { url: FALLBACK_SRC, alt: "" };
  });

  return (
    <div
      aria-hidden="true"
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        0,
        pointerEvents: "none",
        overflow:      "hidden",
      }}
    >
      {INSTANCES.map((cfg, i) => {
        const src    = sources[i];
        const finalOpacity = cfg.opacity * (opacity / 0.12);

        return (
          <motion.div
            key={i}
            animate={{ y: [0, -cfg.driftY, 0] }}
            transition={{
              duration: cfg.duration,
              ease:     "easeInOut",
              repeat:   Infinity,
              // offset each instance so they don't all move in sync
              delay:    i * (cfg.duration / INSTANCES.length),
            }}
            style={{
              position:  "absolute",
              left:      cfg.left,
              top:       cfg.top,
              width:     cfg.width,
              opacity:   finalOpacity,
              rotate:    cfg.rotation,
              // Translate so the anchor point is the element's center
              translateX: "-50%",
              translateY: "-50%",
            }}
          >
            {src.url ? (
              // Real image URL — render as a Next.js Image with fill layout
              <div
                style={{
                  position:     "relative",
                  width:        "100%",
                  aspectRatio:  "3 / 4",
                  overflow:     "hidden",
                }}
              >
                <Image
                  src={src.url}
                  alt={src.alt ?? ""}
                  fill
                  sizes="(max-width: 768px) 30vw, 20vw"
                  style={{ objectFit: "cover" }}
                  // Background images are purely decorative — skip priority loading
                  priority={false}
                />
              </div>
            ) : (
              // No URL — show a colored placeholder rectangle
              <div
                style={{
                  width:       "100%",
                  aspectRatio: "3 / 4",
                  background:  "#8A8A8A",
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
