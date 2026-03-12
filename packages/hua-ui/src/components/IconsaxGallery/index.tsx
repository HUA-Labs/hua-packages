"use client";

import React, { useState, ComponentType } from "react";
import { dotCSS } from "@hua-labs/dot/class";
import { Card, CardContent } from "../Card";
import { Input } from "../Input";
import { Tabs, TabsList, TabsTrigger } from "../Tabs";
import * as LineIcons from "../icons";
import * as BoldIcons from "../icons-bold";
import { dot as dotFn } from "@hua-labs/dot";
import { mergeStyles } from "../../hooks/useDotMap";

// Iconsax icon names (331 icons)
export const ICONSAX_ICON_NAMES = [
  "3Dcube",
  "Add",
  "AddCircle",
  "AddSquare",
  "Apple",
  "Archive",
  "ArrangeCircle",
  "ArrangeCircle2",
  "ArrangeSquare",
  "ArrangeSquare2",
  "Arrow2",
  "Arrow3",
  "ArrowBottom",
  "ArrowCircleDown",
  "ArrowCircleLeft",
  "ArrowCircleRight",
  "ArrowDown",
  "ArrowDown1",
  "ArrowDown2",
  "ArrowLeft",
  "ArrowLeft1",
  "ArrowLeft2",
  "ArrowLeft3",
  "ArrowRight",
  "ArrowRight1",
  "ArrowRight2",
  "ArrowRight3",
  "ArrowSquareDown",
  "ArrowSquareLeft",
  "ArrowSquareRight",
  "ArrowSquareUp",
  "ArrowSwapHorizontal",
  "ArrowUp",
  "ArrowUp1",
  "ArrowUp2",
  "ArrowUp3",
  "AttachCircle",
  "AttachSquare",
  "Autobrightness",
  "BackSquare",
  "Backward",
  "Backward10Seconds",
  "Backward15Seconds",
  "Backward5Seconds",
  "BatteryDisable",
  "BatteryFull",
  "Bluetooth",
  "BluetoothCircle",
  "Book",
  "Box",
  "Box2",
  "Briefcase",
  "Broom",
  "Cake",
  "Calculator",
  "Camera",
  "CameraSlash",
  "CardAdd",
  "CardRemove",
  "Cards",
  "CardSlash",
  "CardTick",
  "Cd",
  "Check",
  "Chrome",
  "CloseCircle",
  "CloseSquare",
  "Cloud",
  "CloudAdd",
  "CloudChange",
  "CloudDrizzle",
  "CloudLightning",
  "CloudNotif",
  "CloudRemove",
  "CloudSnow",
  "CloudSunny",
  "Code",
  "Code1",
  "Coin",
  "Computing",
  "Convert",
  "Crown",
  "Crown1",
  "Danger",
  "DirectDown",
  "DirectLeft",
  "DirectRight",
  "DirectUp",
  "Dislike",
  "DollarSquare",
  "Drop",
  "EmojiHappy",
  "EmojiNormal",
  "EmojiSad",
  "EmptyWallet",
  "Eraser",
  "Export",
  "Export1",
  "Export2",
  "Export3",
  "Eye",
  "EyeSlash",
  "Facebook",
  "Figma",
  "Filter",
  "FilterAdd",
  "FilterEdit",
  "FilterRemove",
  "FilterSearch",
  "FilterTick",
  "FingerCricle",
  "Firstline",
  "Flag",
  "Flag2",
  "Flash",
  "FlashCircle",
  "FlashSlash",
  "Folder",
  "Folder2",
  "FolderAdd",
  "FolderCloud",
  "FolderCross",
  "FolderFavorite",
  "FolderMinus",
  "FolderOpen",
  "Forbidden2",
  "Forward",
  "Forward10Seconds",
  "Forward15Seconds",
  "Forward5Seconds",
  "ForwardSquare",
  "Frame",
  "Frame1",
  "Gallery",
  "GalleryAdd",
  "GalleryRemove",
  "GallerySlash",
  "Global",
  "Heart",
  "Hierarchy",
  "Hierarchy2",
  "Home2",
  "HomeWifi",
  "Html3",
  "Html5",
  "Image",
  "Import",
  "Import1",
  "Import2",
  "InfoCircle",
  "Information",
  "Instagram",
  "JavaScript",
  "LanguageCircle",
  "LanguageSquare",
  "Like",
  "LikeDislike",
  "LikeTag",
  "Link",
  "Link1",
  "Link2",
  "Link21",
  "LinkCircle",
  "LinkSquare",
  "LocationCross",
  "LocationMinus",
  "LocationSlash",
  "LocationTick",
  "Lock",
  "LockSlash",
  "Login",
  "Login1",
  "Logout",
  "Logout1",
  "Map",
  "Math",
  "Maximize",
  "Menu",
  "MessageProgramming",
  "Microphone",
  "Microphone2",
  "MicrophoneSlash",
  "MicrophoneSlash1",
  "Milk",
  "Minus",
  "MinusCirlce",
  "MinusSquare",
  "Monitor",
  "Moon",
  "MoreCircle",
  "MoreSquare",
  "Mouse",
  "MouseCircle",
  "MouseSquare",
  "Next",
  "Paperclip",
  "Paperclip2",
  "PasswordCheck",
  "Pause",
  "PauseCircle",
  "People",
  "Pet",
  "Pharagraphspacing",
  "Play",
  "PlayCircle",
  "Previous",
  "Printer",
  "PrinterSlash",
  "Profile",
  "Profile2User",
  "ProfileAdd",
  "ProfileCircle",
  "ProfileDelete",
  "ProfileRemove",
  "ProfileTick",
  "ProgrammingArrow",
  "QuoteDown",
  "QuoteDownCircle",
  "QuoteDownSquare",
  "QuoteUp",
  "QuoteUpCircle",
  "QuoteUpSquare",
  "Ranking",
  "ReceiptDiscount",
  "ReceiptDisscount",
  "ReceiptItem",
  "ReceiptMinus",
  "Received",
  "ReceiveSquare",
  "ReceiveSquare2",
  "Record",
  "RecordCircle",
  "Redo",
  "Refresh",
  "Refresh2",
  "RefreshCircle",
  "RefreshLeftSquare",
  "RefreshRightSquare",
  "RefreshSquare2",
  "Repeat",
  "RepeatCircle",
  "RepeateMusic",
  "RepeateOne",
  "RotateLeft",
  "RotateRight",
  "SafeHome",
  "Scan",
  "SearchNormal",
  "SearchZoomIn",
  "SearchZoomOut",
  "Send",
  "Send2",
  "SendSqaure2",
  "SendSquare",
  "Shield",
  "ShieldCross",
  "ShieldSecurity",
  "ShieldSlash",
  "ShieldTick",
  "Shuffle",
  "Slack",
  "Slash",
  "Smallcaps",
  "SmartHome",
  "Sort",
  "Sound",
  "Spotify",
  "Star",
  "Sticker",
  "Stop",
  "StopCircle",
  "Story",
  "Sun",
  "TagCross",
  "TagUser",
  "Teacher",
  "Text",
  "TextalignCenter",
  "TextalignJustifycenter",
  "TextalignJustifyleft",
  "TextalignJustifyright",
  "TextalignLeft",
  "TextalignRight",
  "TextBlock",
  "TextBold",
  "TextItalic",
  "TextUnderline",
  "TickCircle",
  "Ticket",
  "TicketDiscount",
  "TickSquare",
  "Translate",
  "Trash",
  "Triangle",
  "Truck",
  "TrushSquare",
  "Undo",
  "Unlimited",
  "Unlock",
  "User",
  "UserAdd",
  "UserCirlceAdd",
  "UserEdit",
  "UserMinus",
  "UserOctagon",
  "UserRemove",
  "UserSearch",
  "UserSquare",
  "UserTag",
  "UserTick",
  "Verify",
  "Video",
  "VideoCircle",
  "VideoPlay",
  "VideoSlash",
  "VideoSquare",
  "VoiceSquare",
  "VolumeCross",
  "VolumeHigh",
  "VolumeLow",
  "VolumeLow1",
  "VolumeMute",
  "VolumeSlash",
  "VolumeUp",
  "Warning2",
  "Whatsapp",
  "Wifi",
  "WifiSquare",
  "Windows",
  "Youtube",
] as const;

export type IconsaxIconName = (typeof ICONSAX_ICON_NAMES)[number];
export type IconsaxVariant = "line" | "bold";

export interface IconsaxGalleryProps {
  /** Default variant to show */
  defaultVariant?: IconsaxVariant;
  /** Callback when icon is clicked */
  onIconClick?: (name: string, variant: IconsaxVariant) => void;
  /** Custom copy format function */
  formatCopyText?: (name: string, variant: IconsaxVariant) => string;
  /** Show variant toggle tabs */
  showVariantToggle?: boolean;
  /** Show search input */
  showSearch?: boolean;
  /** Show icon count */
  showCount?: boolean;
  /** dot utility styles */
  dot?: string;
  /** Additional inline style */
  style?: React.CSSProperties;
  /** Grid columns (default responsive) */
  columns?: number;
}

interface IconCellProps {
  name: string;
  index: number;
  variant: IconsaxVariant;
  isCopied: boolean;
  onClick: () => void;
}

const iconSize32: React.CSSProperties = { width: "2rem", height: "2rem" };
const iconSize8: React.CSSProperties = { width: "2rem", height: "2rem" };

function IconCell({ name, index, variant, isCopied, onClick }: IconCellProps) {
  const IconComponent =
    variant === "bold"
      ? (
          BoldIcons as unknown as Record<
            string,
            ComponentType<{ style?: React.CSSProperties }>
          >
        )[name]
      : (
          LineIcons as unknown as Record<
            string,
            ComponentType<{ style?: React.CSSProperties }>
          >
        )[name];

  return (
    <button
      onClick={onClick}
      style={mergeStyles(
        dotFn(
          "flex flex-col items-center p-3 rounded-lg",
        ) as React.CSSProperties,
        {
          cursor: "pointer",
          border: "1px solid transparent",
          background: "transparent",
          transition: "background-color 150ms",
        },
      )}
      onMouseEnter={(e) => {
        Object.assign((e.currentTarget as HTMLButtonElement).style, {
          backgroundColor:
            "color-mix(in srgb, var(--color-muted) 50%, transparent)",
          borderColor: "var(--color-border)",
        });
      }}
      onMouseLeave={(e) => {
        Object.assign((e.currentTarget as HTMLButtonElement).style, {
          backgroundColor: "transparent",
          borderColor: "transparent",
        });
      }}
      title={`#${index + 1} ${name} - Click to copy`}
    >
      <div
        style={{
          fontSize: "0.625rem",
          color: "var(--color-muted-foreground)",
          marginBottom: "0.25rem",
          fontFamily: "monospace",
        }}
      >
        #{index + 1}
      </div>
      <div
        style={{
          marginBottom: "0.5rem",
          color: "var(--color-foreground)",
          position: "relative",
          width: "2rem",
          height: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isCopied ? (
          <svg
            style={{ ...iconSize32, color: "#22c55e" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : IconComponent ? (
          <IconComponent style={iconSize8} />
        ) : (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--color-muted-foreground)",
            }}
          >
            ?
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: "0.625rem",
          textAlign: "center",
          color: "var(--color-muted-foreground)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          width: "100%",
        }}
      >
        {isCopied ? "Copied!" : name}
      </div>
    </button>
  );
}

/**
 * IconsaxGallery - Interactive gallery for browsing Iconsax icons
 *
 * Displays all 331 Iconsax icons with search, variant toggle, and click-to-copy functionality.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <IconsaxGallery />
 *
 * // With custom copy format
 * <IconsaxGallery
 *   formatCopyText={(name) => `import { ${name} } from "@hua-labs/ui/icons"`}
 * />
 *
 * // With click handler
 * <IconsaxGallery
 *   onIconClick={(name, variant) => console.log(name, variant)}
 * />
 * ```
 */
export function IconsaxGallery({
  defaultVariant = "line",
  onIconClick,
  formatCopyText = (name) => `<Icon name="${name}" />`,
  showVariantToggle = true,
  showSearch = true,
  showCount = true,
  dot,
  style,
  columns,
}: IconsaxGalleryProps) {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [variant, setVariant] = useState<IconsaxVariant>(defaultVariant);

  const filteredIcons = ICONSAX_ICON_NAMES.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase()),
  );

  const gridCls = columns
    ? null
    : dotCSS(
        "grid gap-4 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10",
      );
  const toolbarCls = dotCSS("flex flex-col sm:flex-row gap-4");

  const handleIconClick = async (name: string) => {
    const code = formatCopyText(name, variant);

    try {
      await navigator.clipboard.writeText(code);
      setCopied(name);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }

    onIconClick?.(name, variant);
  };

  const gridStyle: React.CSSProperties | undefined = columns
    ? {
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }
    : undefined;

  const containerStyle = mergeStyles(
    dot ? (dotFn(dot) as React.CSSProperties) : {},
    style,
  );

  return (
    <div style={containerStyle}>
      {/* Search & Variant Toggle */}
      {(showSearch || showVariantToggle) && (
        <div style={dotFn("mb-6") as React.CSSProperties}>
          <div className={toolbarCls.className}>
            {showSearch && (
              <div>
                <Input
                  placeholder="Search icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  dot="max-w-sm"
                />
                {showCount && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-muted-foreground)",
                      marginTop: "0.5rem",
                    }}
                  >
                    {filteredIcons.length} / {ICONSAX_ICON_NAMES.length} icons
                  </p>
                )}
              </div>
            )}
            {showVariantToggle && (
              <Tabs
                value={variant}
                onValueChange={(v) => setVariant(v as IconsaxVariant)}
              >
                <TabsList>
                  <TabsTrigger value="line">Line</TabsTrigger>
                  <TabsTrigger value="bold">Bold</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <Card>
        <CardContent dot="p-6">
          <div className={gridCls?.className} style={gridStyle}>
            {filteredIcons.map((name) => {
              const originalIndex = ICONSAX_ICON_NAMES.indexOf(name);
              return (
                <IconCell
                  key={`${name}-${variant}`}
                  name={name}
                  index={originalIndex}
                  variant={variant}
                  isCopied={copied === name}
                  onClick={() => handleIconClick(name)}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
      <style
        dangerouslySetInnerHTML={{
          __html: `${gridCls?.css ?? ""}${toolbarCls.css}`,
        }}
      />
    </div>
  );
}

export default IconsaxGallery;
