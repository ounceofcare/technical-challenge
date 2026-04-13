interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "warning" | "success" | "danger";
}

const VARIANT_STYLES = {
  default: "bg-white border-gray-200",
  warning: "bg-amber-50 border-amber-200",
  success: "bg-emerald-50 border-emerald-200",
  danger: "bg-red-50 border-red-200",
};

export function StatCard({ title, value, subtitle, variant = "default" }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-6 ${VARIANT_STYLES[variant]}`}>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
