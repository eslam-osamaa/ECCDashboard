import { useEffect, useState } from "react";
import formulationsService from "../../services/formulations/formulationsService";
import SFGFilters from "../SFGTable/SFGFilters";
import SFGTable from "../SFGTable/SFGTable";

const PAGE_SIZE = 10;

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function FormulationsPage({ type }) {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [parentCode, setParentCode] = useState("");
  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFormulations() {
      setLoading(true);
      setError("");

      try {
        const result = await formulationsService.getAll(
          type,
          {
            page,
            pageSize: PAGE_SIZE,
            search: search.trim() || undefined,
            parentCode: parentCode.trim() || undefined,
            status: status === "all" ? undefined : status,
          },
          controller.signal
        );

        setData(
          (result.items ?? []).map((item) => ({
            sfg: item.sfg,
            parentCode: item.parentCode ?? "",
            description: item.description ?? "",
            status: item.status ?? "Still",
            lastModified: formatDate(item.lastModified),
            rawMaterials: (item.rawMaterials ?? []).map((rm) => ({
              id: rm.id,
              code: rm.code,
              description: rm.description,
              percentage: rm.percentage,
            })),
          }))
        );

        setTotalCount(result.totalCount ?? 0);
      } catch (err) {
        if (
          controller.signal.aborted ||
          err.code === "ERR_CANCELED"
        ) {
          return;
        }

        setError(
          err.response?.status === 401
            ? "Your session has expired. Please log in again."
            : err.response?.status === 403
              ? `You do not have permission to view ${type}.`
              : err.response?.data?.message ??
                `Failed to load ${type} formulations. Please try again.`
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchFormulations();

    return () => controller.abort();
  }, [type, search, parentCode, status, page]);

  const updateSearch = (value) => {
    setPage(1);
    setSearch(value);
  };

  const updateParentCode = (value) => {
    setPage(1);
    setParentCode(value);
  };

  const updateStatus = (value) => {
    setPage(1);
    setStatus(value);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE)
  );

  return (
    <div className="space-y-6">
      <SFGFilters
        search={search}
        setSearch={updateSearch}
        parentCode={parentCode}
        setParentCode={updateParentCode}
        status={status}
        setStatus={updateStatus}
      />

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading {type} formulations...
        </div>
      ) : (
        <>
<SFGTable
  data={data}
  totalCount={totalCount}
  page={page}
  totalPages={totalPages}
  onPageChange={setPage}
  type={type}
/>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
              {" · "}
              {totalCount} formulations
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) => current - 1)
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FormulationsPage;