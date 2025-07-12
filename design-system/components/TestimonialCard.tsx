import React from "react";
import Card from "./Card";
import AvatarPlaceholder from "../../components/icons/AvatarPlaceholder";
import VerifiedBadge from "../../components/icons/VerifiedBadge";
import Star from "../../components/icons/Star";

interface Props {
  quote: string;
  name: string;
  title: string;
  company: string;
}

export default function TestimonialCard({
  quote,
  name,
  title,
  company,
}: Props) {
  return (
    <Card glass className="text-center">
      <AvatarPlaceholder className="mx-auto mb-4" />
      <p className="mb-4">&ldquo;{quote}&rdquo;</p>
      <p className="font-semibold flex items-center justify-center space-x-1">
        <span>{name}</span>
        <VerifiedBadge className="text-accent" />
      </p>
      <p className="text-sm text-text-secondary">
        {title}, {company}
      </p>
      <div className="flex justify-center mt-2" aria-label="5 star rating">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-accent" />
        ))}
      </div>
    </Card>
  );
}
