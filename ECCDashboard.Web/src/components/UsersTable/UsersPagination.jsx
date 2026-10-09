function UsersPagination({
  page,
  pageSize,
  totalCount,
  totalPages,
  loading,
  onPrevious,
  onNext,
}) {
  const firstItem =
    totalCount === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const lastItem = Math.min(
    page * pageSize,
    totalCount
  );

  return (
    <div className="flex items-center justify-between border-t border-[#e5e7eb] px-5 py-4">

      <p className="text-sm text-[#6b7280]">
        {totalCount === 0
          ? "No users"
          : `Showing ${firstItem}-${lastItem} of ${totalCount}`}
      </p>


      <div className="flex items-center gap-2">

        <button
          type="button"
          onClick={onPrevious}
          disabled={page === 1 || loading}
          className="rounded-lg border border-[#d1d5db] px-3 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>


        <span className="px-2 text-sm text-[#6b7280]">
          Page {page} of {Math.max(totalPages, 1)}
        </span>


        <button
          type="button"
          onClick={onNext}
          disabled={
            page >= totalPages || loading
          }
          className="rounded-lg border border-[#d1d5db] px-3 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>

      </div>

    </div>
  );
}

export default UsersPagination;