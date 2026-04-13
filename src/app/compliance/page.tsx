import { getComplianceOverview, getComplianceStats } from "@/lib/queries/compliance";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatPercent } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default function CompliancePage() {
  const requirements = getComplianceOverview();
  const communityStats = getComplianceStats();

  // Group requirements by community
  const grouped: Record<string, typeof requirements> = {};
  for (const req of requirements) {
    if (!grouped[req.community_name]) {
      grouped[req.community_name] = [];
    }
    grouped[req.community_name].push(req);
  }

  const now = Math.floor(Date.now() / 1000);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Compliance Overview</h1>

      {/* Community Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {communityStats.map((cs) => (
          <div key={cs.community_name} className="bg-white rounded-lg border p-6 text-center">
            <p className="text-sm text-gray-500">{cs.community_name}</p>
            <p className={`text-3xl font-bold mt-2 ${cs.rate >= 80 ? "text-emerald-600" : cs.rate >= 50 ? "text-amber-600" : "text-red-600"}`}>
              {formatPercent(cs.rate)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Overall Compliance</p>
          </div>
        ))}
      </div>

      {/* Requirements by Community */}
      {Object.entries(grouped).map(([communityName, reqs]) => (
        <div key={communityName} className="bg-white rounded-lg border mb-6">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold">{communityName}</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fulfillment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reqs.map((req) => {
                const isOverdue = req.due_date < now;

                return (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium">{req.title}</p>
                      {req.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                          {req.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-gray-600 capitalize">{req.frequency}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatDate(req.due_date)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                          <div
                            className={`h-2 rounded-full ${
                              req.fulfillment_rate >= 80
                                ? "bg-emerald-500"
                                : req.fulfillment_rate >= 50
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(req.fulfillment_rate, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatPercent(req.fulfillment_rate)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {req.fulfilled_count} / {req.total_residents} residents
                      </p>
                    </td>
                    <td className="px-6 py-3">
                      {isOverdue ? (
                        <StatusBadge status="overdue" />
                      ) : req.fulfillment_rate >= 100 ? (
                        <StatusBadge status="completed" />
                      ) : (
                        <StatusBadge status="pending" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
