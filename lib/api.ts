import { API_BASE } from "./config";

export async function uploadCSV(formData: any) {
  const res = await fetch(`${API_BASE}/upload-csv/`, {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  return {
    status: res.ok,
    data
  };
}

export async function fetchRelations() {
  const res = await fetch(`${API_BASE}/get-relations/?mode=relations`)
  if (!res.ok) throw new Error("Failed to fetch tables");
  const data = await res.json();
  if (data.count > 0) {
    return data.relations;
  }
  return [];
}

export type TableDataResponse = {
  page: number;
  limit: number;
  total_rows: number;
  total_pages: number;
  results: any[];
};

export async function fetchTableData(params: {
  table: string;
  page?: number;
  limit?: number;
  order_by?: string;
  filters?: Record<string, string>;
}): Promise<TableDataResponse> {
  const query = new URLSearchParams();

  query.append("table", params.table);
  query.append("page", String(params.page || 1));
  query.append("limit", String(params.limit || 10));

  if (params.order_by) query.append("order_by", params.order_by);

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value.trim() !== "") {
        query.append(key, value);
      }
    }
  }

  const res = await fetch(`${API_BASE}/get-table-data/?mode=table&${query.toString()}`);

  if (!res.ok) throw new Error("Failed to fetch table data");
  return res.json();
}

