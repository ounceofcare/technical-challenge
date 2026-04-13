"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { ResidentWithCommunity } from "@/types";

interface ResidentDetail extends ResidentWithCommunity {
  events: Array<{
    id: string;
    title: string;
    starts_at: number;
    event_type: string;
    attendance_status: string;
  }>;
  compliance: Array<{
    id: string;
    title: string;
    due_date: number;
    fulfillment_status: string | null;
    fulfilled_at: number | null;
  }>;
}

export default function ResidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [resident, setResident] = useState<ResidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    fetch(`/api/residents/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setResident(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    // Only send changed fields to minimize payload
    const changes: Record<string, string> = {};
    if (formData.name !== resident?.name) changes.name = formData.name;
    if (formData.email !== resident?.email) changes.email = formData.email;
    if (formData.phone !== (resident?.phone || "")) changes.phone = formData.phone;

    if (Object.keys(changes).length === 0) {
      setEditing(false);
      return;
    }

    const res = await fetch(`/api/residents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });

    if (res.ok) {
      const updated = await res.json();
      setResident((prev) => prev ? { ...prev, ...updated } : prev);
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resident?")) return;

    const res = await fetch(`/api/residents/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/residents");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!resident) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Resident not found</p>
        <Link href="/residents" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Back to residents
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/residents" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to residents
        </Link>
      </div>

      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{resident.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm">{resident.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-sm">{resident.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Community</dt>
              <dd className="text-sm">{resident.community_name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Status</dt>
              <dd><StatusBadge status={resident.status} /></dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Date of Birth</dt>
              <dd className="text-sm">{resident.date_of_birth || "—"}</dd>
            </div>
          </dl>
        )}
      </div>

      {/* Event History */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Event History</h2>
        {resident.events.length === 0 ? (
          <p className="text-sm text-gray-500">No events</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {resident.events.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-2">
                    <Link href={`/events/${event.id}`} className="text-sm text-blue-600 hover:underline">
                      {event.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">{event.event_type}</td>
                  <td className="px-4 py-2"><StatusBadge status={event.attendance_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Compliance Status */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Compliance Status</h2>
        {resident.compliance.length === 0 ? (
          <p className="text-sm text-gray-500">No compliance requirements</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {resident.compliance.map((req) => (
                <tr key={req.id}>
                  <td className="px-4 py-2 text-sm">{req.title}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={req.fulfillment_status || "pending"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
