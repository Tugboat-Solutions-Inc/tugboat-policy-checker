import * as React from "react";
import Image from "next/image";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type EmptyStateProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
};

export default function EmptyState({
  title,
  subtitle,
  children,
  className,
}: EmptyStateProps) {
  return (
    <Empty className={className}>
      <EmptyContent>
        <EmptyMedia>
          <Image
            src="/icons/empty-state-image.svg"
            alt=""
            width={231}
            height={91}
          />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          {subtitle ? <EmptyDescription>{subtitle}</EmptyDescription> : null}
        </EmptyHeader>
        {children}
      </EmptyContent>
    </Empty>
  );
}
