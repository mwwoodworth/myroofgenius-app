import React from "react";
import { motion } from "framer-motion";
import GafBadge from "./icons/GafBadge";
import BbbBadge from "./icons/BbbBadge";
import GoogleReviews from "./icons/GoogleReviews";
import SslLock from "./icons/SslLock";

export default function TrustBar() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-bg py-4 border-y border-gray-200"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <div className="flex items-center space-x-4">
          <GafBadge className="h-8" />
          <BbbBadge className="h-8" />
          <GoogleReviews className="h-8" />
          <SslLock className="h-8" />
        </div>
        <p className="text-sm text-text-secondary text-center sm:text-left">
          Your photos are encrypted (AES-256) and deleted after analysis.
        </p>
      </div>
    </motion.div>
  );
}
