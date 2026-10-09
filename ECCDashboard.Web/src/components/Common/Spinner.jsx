function Spinner({
  size = "md",
  className = "",
}) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-10 w-10 border-4",
  };

  return (
    <div
      className={`animate-spin rounded-full border-[#e5e7eb] border-t-[#2563eb] ${sizeClasses[size]} ${className}`}
    />
  );
}

export default Spinner;