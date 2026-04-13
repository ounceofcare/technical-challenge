interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-gray-100 text-gray-600",
  registered: "bg-blue-100 text-blue-800",
  checked_in: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  declined: "bg-red-100 text-red-800",
  waitlisted: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
  overdue: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600";
  const label = status.replace(/_/g, " ");

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  );
}
