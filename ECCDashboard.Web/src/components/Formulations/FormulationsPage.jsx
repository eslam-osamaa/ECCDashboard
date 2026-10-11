import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import formulationsService from "../../services/formulations/formulationsService";
import SFGFilters from "../SFGTable/SFGFilters";
import SFGTable from "../SFGTable/SFGTable";

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
  const location = useLocation();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [description, setDescription] = useState("");
  const [parentCode, setParentCode] = useState("");
  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ عشان نعمل refetch بعد الحذف أو التعديل
  const [refreshKey, setRefreshKey] = useState(0);

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
            pageSize,
            search: search.trim() || undefined,
            description: description.trim() || undefined,
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
          }))
        );

        setTotalCount(result.totalCount ?? 0);
      } catch (err) {
        if (controller.signal.aborted || err.code === "ERR_CANCELED") {
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
  }, [
    type,
    search,
    description,
    parentCode,
    status,
    page,
    pageSize,
    location.state,
    refreshKey, // ✅ ضيفنا دي
  ]);

  const updateSearch = (value) => {
    setPage(1);
    setSearch(value);
  };

  const updateDescription = (value) => {
    setPage(1);
    setDescription(value);
  };

  const updateParentCode = (value) => {
    setPage(1);
    setParentCode(value);
  };

  const updateStatus = (value) => {
    setPage(1);
    setStatus(value);
  };

  const updatePageSize = (value) => {
    setPageSize(value);
    setPage(1);
  };

  // ✅ بعد الحذف → نعمل refetch
  const handleDeleted = () => {
    // لو الحذف كان آخر عنصر في الصفحة، رجّع صفحة لورا
    if (data.length === 1 && page > 1) {
      setPage((prev) => prev - 1);
    }

    setRefreshKey((prev) => prev + 1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <SFGFilters
        search={search}
        setSearch={updateSearch}
        description={description}
        setDescription={updateDescription}
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
        <SFGTable
          data={data}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={updatePageSize}
          loading={loading}
          type={type}
          onDeleted={handleDeleted} // ✅ ضيفنا دي
        />
      )}
    </div>
  );
}

export default FormulationsPage;