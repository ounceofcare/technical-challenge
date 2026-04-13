"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Pagination } from "@/components/pagination";
import { SearchBar } from "@/components/search-bar";
import type { ResidentWithCommunity, PaginatedResponse } from "@/types";

export default function ResidentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <ResidentsContent />
    </Suspense>
  );
}

function ResidentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const communityId = searchParams.get("community_id") || "";
  const sortField = searchParams.get("sortField") || "created_at";

  const [data, setData] = useState<PaginatedResponse<ResidentWithCommunity> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", "20");
    params.set("sortField", sortField);
    if (search) params.set("search", search);
    if (communityId) params.set("community_id", communityId);

    fetch(`/api/residents?${params}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      });
  }, [page, search, communityId, sortField]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/residents?${params}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Residents</h1>
        <Link
          href="/residents/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
        >
          Add Resident
        </Link>
      </div>

      <div className="mb-4">
        <SearchBar
          defaultValue={search}
          onSearch={(q) => updateParams({ search: q, page: "1" })}
          placeholder="Search by name..."
        />
      </div>

      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : !data || data.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No residents found</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <button
                      onClick={() => updateParams({ sortField: "name" })}
                      className="hover:text-gray-700"
                    >
                      Name
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Community
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.data.map((resident) => (
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/residents/${resident.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {resident.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {resident.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {resident.community_name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={resident.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-4 py-3 border-t">
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={(p) => updateParams({ page: String(p) })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
