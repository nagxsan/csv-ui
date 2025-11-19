"use client";

import { useEffect, useState } from "react";
import { uploadCSV, fetchRelations, fetchTableData, TableDataResponse } from "@/lib/api";
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

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function HomePage() {
  const [relations, setRelations] = useState<string[]>([]);
  const [table, setTable] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TableDataResponse | null>(null);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    sku__icontains: "",
    price__gte: "",
    price__lte: ""
  });

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  async function loadRelations() {
    const result = await fetchRelations();
    setRelations(result);
  }

  async function load() {
    if (table) {
      const result = await fetchTableData({
        table,
        page,
        limit: 10,
        filters
      });
      setData(result);
    }
  }

  useEffect(() => {
    loadRelations();
  }, []);

  useEffect(() => {
    load();
  }, [table, page]);

  async function handleUpload() {
    if (!file) {
      setUploadMessage("Please select a CSV file.");
      return;
    }
    if (!table) {
      setUploadMessage("Please select a table first.");
      return;
    }

    setUploadMessage("");
    setUploadLoading(true);

    const formData = new FormData();
    formData.append("table_name", table);
    formData.append("file", file);
    // formData.append("strict", "true");

    try {
      const { status, data } = await uploadCSV(formData);

      if (!status) {
        setUploadMessage(data.detail || "Upload failed");
      } else {
        setUploadMessage(`Inserted rows: ${data.inserted_rows}`);
        setOpen(false);
        load();
      }
    } catch (err) {
      setUploadMessage("Network error");
    } finally {
      setUploadLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Table Viewer</h1>

      {/* Table selector */}
      <div className="flex gap-4">
        <Select onValueChange={setTable} value={table}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Select a table" />
          </SelectTrigger>
          <SelectContent>
            {relations.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Upload CSV dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={!table}>Upload CSV</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Upload a CSV file to append to the existing relation
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              {uploadMessage && (
                <p className="text-sm text-red-500 mt-2">
                  {uploadMessage}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button disabled={uploadLoading} onClick={handleUpload}>
                {uploadLoading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {data && (
        <>
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
        </>
      )}
    </div>
  );
}
