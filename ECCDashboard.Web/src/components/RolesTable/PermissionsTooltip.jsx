
import { useState } from "react";
import { createPortal } from "react-dom";

function PermissionsTooltip({ permissions }) {
  const [position, setPosition] = useState(null);

  const handleMouseEnter = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipHeight = Math.min(
      240,
      permissions.length * 28 + 48
    );

    const showBelow =
      rect.top < tooltipHeight + 16;

    setPosition({
      top: showBelow
        ? rect.bottom + 8
        : rect.top - 8,
      left: Math.max(
        140,
        Math.min(
          rect.left + rect.width / 2,
          window.innerWidth - 140
        )
      ),
      showBelow,
    });
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setPosition(null)}
    >
      <span className="cursor-default rounded-md bg-[#f3f4f6] px-2.5 py-1 text-xs font-medium text-[#6b7280]">
        +{permissions.length - 1}
      </span>

      {position &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] w-64 -translate-x-1/2 rounded-lg border border-[#e5e7eb] bg-white p-3 text-left shadow-lg"
            style={{
              left: position.left,
              top: position.top,
              transform: position.showBelow
                ? "translate(-50%, 0)"
                : "translate(-50%, -100%)",
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            <p className="mb-2 text-xs font-semibold text-[#374151]">
              All Permissions
            </p>

            <div className="flex flex-wrap gap-1.5">
              {permissions.map((permission) => (
                <span
                  key={permission.id}
                  className="rounded-md bg-[#f3f4f6] px-2 py-1 text-[11px] text-[#4b5563]"
                >
                  {permission.name}
                </span>
              ))}
            </div>
          </div>,
          document.body
        )}
    </span>
  );
}

export default PermissionsTooltip;

