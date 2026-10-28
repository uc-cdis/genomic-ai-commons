import { useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table-open";
import "mantine-react-table-open/styles.css";

export type MetadataRow = Record<string, string>;

export interface MetadataTableProps {
  /** column names, in file order */
  columns: string[];
  rows: MetadataRow[];
}

const MetadataTable = ({ columns, rows }: MetadataTableProps) => {
  const columnDefs = useMemo<MRT_ColumnDef<MetadataRow>[]>(
    () => columns.map((name) => ({ id: name, accessorFn: (row) => row[name], header: name })),
    [columns],
  );

  const table = useMantineReactTable({
    columns: columnDefs,
    data: rows,
    enableColumnResizing: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    initialState: { density: "xs", pagination: { pageIndex: 0, pageSize: 25 } },
    enableStickyHeader: true,
  });

  return <div className="m-2"> <MantineReactTable table={table} /></div>;
};

export default MetadataTable;
