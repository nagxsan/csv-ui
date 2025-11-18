"use client";

import { useEffect, useState } from "react";
import { fetchTableData, TableDataResponse } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue
} from "@/components/ui/select";

export default function HomePage() {
  const [table, setTable] = useState("product_purchases");
  const [data, setData] = useState<TableDataResponse | null>(null);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    sku__icontains: "",
    price__gte: "",
    price__lte: ""
  });

  async function load() {
    const result = await fetchTableData({
      table,
      page,
      limit: 10,
      filters
    });
    setData(result);
  }

  useEffect(() => {
    load();
  }, [page]);

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Table Viewer</h1>

      {/* Table selector */}
      <div className="flex gap-4">
        <Select onValueChange={setTable} defaultValue={table}>
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="products_query_test">products_query_test</SelectItem>
            <SelectItem value="another_table">another_table</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => { setPage(1); load(); }}>
          Load
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-4">
        <Input
          placeholder="sku contains..."
          value={filters.sku__icontains}
          onChange={(e) =>
            setFilters((f) => ({ ...f, sku__icontains: e.target.value }))
          }
        />
        <Input
          placeholder="price ≥"
          value={filters.price__gte}
          onChange={(e) =>
            setFilters((f) => ({ ...f, price__gte: e.target.value }))
          }
        />
        <Input
          placeholder="price ≤"
          value={filters.price__lte}
          onChange={(e) =>
            setFilters((f) => ({ ...f, price__lte: e.target.value }))
          }
        />
        <Button onClick={() => { setPage(1); load(); }}>
          Apply Filters
        </Button>
      </div>

      {/* Data Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(data.results[0] || {}).map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.results.map((row, i) => (
              <TableRow key={i}>
                {Object.values(row).map((val, j) => (
                  <TableCell key={j}>{String(val)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex gap-4 items-center">
        <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </Button>

        <span>
          Page {data.page} / {data.total_pages}
        </span>

        <Button
          disabled={page >= data.total_pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

