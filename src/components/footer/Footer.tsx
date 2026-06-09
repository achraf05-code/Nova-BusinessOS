import React from "react";
import { nova } from "@/config/nova";

const Footer = () => {
  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-gray-200 pt-6 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500 sm:flex-row">
      <p>
        © {new Date().getFullYear()} {nova.name}. All rights reserved.
      </p>
      <p>{nova.tagline}</p>
    </div>
  );
};

export default Footer;
