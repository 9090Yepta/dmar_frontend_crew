import {
  rowPaginationFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { RowData } from "@tanstack/table-core";
import { PiSealWarningFill } from "react-icons/pi";

export const dataTableFeatures = tableFeatures({ rowPaginationFeature });

type DataTableProps<TData extends RowData> = {
  data: TData[];
  columns: ColumnDef<typeof dataTableFeatures, TData>[];
  loading?: boolean;
  emptyMessage?: string;
  pageIndex?: number;
  pageSize?: number;
  rowCount?: number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
};

export function DataTable<TData extends RowData>({
  data,
  columns,
  loading = false,
  emptyMessage = "Belum ada data.",
  pageIndex = 0,
  pageSize = data.length || 25,
  rowCount = data.length,
  onPaginationChange,
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    manualPagination: true,
    rowCount,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      onPaginationChange?.(next.pageIndex, next.pageSize);
    },
  });

  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
      <table
        className="table table-xs sm:table-sm table-zebra whitespace-nowrap"
        aria-busy={loading}
      >
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }, (_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} aria-hidden="true">
                  {table.getAllColumns().map((column, columnIndex) => (
                    <td key={column.id}>
                      <div
                        className={`skeleton h-4 ${columnIndex === 0 ? "w-10" : "w-24"}`}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      {!loading && data.length === 0 && (
        <div className="flex items-center justify-center gap-2 p-4">
          <PiSealWarningFill className="size-6 text-warning" />
          <span className="text-base-content/60 italic">{emptyMessage}</span>
        </div>
      )}
    </div>
  );
}
