import { AlertCircle } from "lucide-react";

interface Alert {
  id: string;
  type: string;
  reason: string;
  timestamp: string;
}

interface AlertsTableProps {
  alerts: Alert[];
}

export default function AlertsTable({ alerts }: AlertsTableProps) {
  return (
    <div className="bg-[var(--card)] rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-800 flex items-center gap-2">
        <AlertCircle className="text-[var(--danger)]" />
        <h2 className="text-lg font-bold text-white">Active Alerts / Human Review</h2>
      </div>
      <div className="flex-1 overflow-auto">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No active alerts or reviews pending.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#171821] text-gray-400">
              <tr>
                <th className="px-6 py-3 font-medium">Transaction ID</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Reason</th>
                <th className="px-6 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-300">{alert.id}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[var(--danger)]/10 text-[var(--danger)]">
                      {alert.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{alert.reason}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(alert.timestamp).toLocaleTimeString()}
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
