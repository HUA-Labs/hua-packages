"use client";

import React from "react";
import { merge } from "../lib/utils";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      title,
      description,
      action,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={merge(
          "flex items-center justify-between border-b border-gray-100 bg-transparent px-6 py-4 text-gray-900 dark:border-slate-800 dark:text-slate-50",
          className
        )}
        {...props}
      >
        <div className="flex-1">
          <h3 className="text-base font-semibold text-inherit">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";

