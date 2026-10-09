import { FiCheckCircle, FiXCircle, FiX } from "react-icons/fi";

function Toast({
  type = "success",
  message,
  onClose,
}) {
  if (!message) {
    return null;
  }

  const isSuccess = type === "success";

  return (
    <div className="fixed right-6 top-6 z-[9999] w-[360px] max-w-[calc(100vw-3rem)]">
      <div
        className={`flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-lg ${
          isSuccess
            ? "border-green-200"
            : "border-red-200"
        }`}
      >
        <div
          className={`mt-0.5 ${
            isSuccess
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {isSuccess ? (
            <FiCheckCircle size={20} />
          ) : (
            <FiXCircle size={20} />
          )}
        </div>

        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              isSuccess
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {isSuccess ? "Success" : "Error"}
          </p>

          <p className="mt-0.5 text-sm text-[#6b7280]">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-[#9ca3af] transition hover:text-[#374151]"
        >
          <FiX size={17} />
        </button>
      </div>
    </div>
  );
}

export default Toast;