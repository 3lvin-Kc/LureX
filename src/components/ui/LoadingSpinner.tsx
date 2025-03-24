
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  className?: string;
}

const LoadingSpinner = ({
  size = "md",
  color = "primary",
  className = "",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const colorClasses = {
    primary: "border-t-blue-500",
    secondary: "border-t-gray-500",
    white: "border-t-white",
  };

  return (
    <div
      className={`
        animate-spin rounded-full 
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        border-solid border-gray-200 dark:border-gray-700 border-t-solid
        ${className}
      `}
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;
