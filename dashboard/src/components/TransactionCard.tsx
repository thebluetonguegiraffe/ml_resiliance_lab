import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, FileWarning, Fingerprint, ShieldAlert, Zap } from "lucide-react";

interface TransactionCardProps {
  tx: any;
  layer: "input" | "bronze" | "silver" | "gold" | "inference" | "final" | "rejected";
}

export default function TransactionCard({ tx, layer }: TransactionCardProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const id = tx.transaction_id || tx._id?.toString() || "Unknown";
  const amount = tx.amount ? `${tx.amount}€` : "";
  let time = "";
  if (mounted) {
    const rawTime = tx.time !== undefined ? tx.time : tx.Time;
    if (rawTime !== undefined && rawTime !== null) {
      const timeVal = typeof rawTime === 'string' ? parseFloat(rawTime) : rawTime;
      if (!isNaN(timeVal)) {
        const hours = Math.floor(timeVal / 3600) % 24;
        const minutes = Math.floor((timeVal % 3600) / 60);
        time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    } else if (tx.timestamp) {
      time = new Date(tx.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second:'2-digit',
        hour12: false 
      });
    }
  }

  // Dynamic styling based on layer and status
  let borderColor = "border-gray-800";
  let Icon = Zap;
  let iconColor = "text-gray-500";

  if (layer === "rejected" || tx.rejection_reason) {
    borderColor = "border-[var(--danger)]/50";
    Icon = ShieldAlert;
    iconColor = "text-[var(--danger)]";
  } else if (tx.needs_manual_review) {
    borderColor = "border-[var(--warning)]/50";
    Icon = AlertCircle;
    iconColor = "text-[var(--warning)]";
  } else if (layer === "final") {
    borderColor = tx.decision === "approved" ? "border-[var(--success)]/50" : "border-[var(--danger)]/50";
    Icon = tx.decision === "approved" ? CheckCircle2 : ShieldAlert;
    iconColor = tx.decision === "approved" ? "text-[var(--success)]" : "text-[var(--danger)]";
  } else if (layer === "silver") {
    Icon = Fingerprint;
    iconColor = "text-[var(--accent)]";
  } else if (layer === "inference") {
    Icon = FileWarning;
    iconColor = "text-[var(--primary)]";
  } else if (layer === "input") {
    Icon = Zap;
    iconColor = "text-[#d8b4fe]";
  }

  return (
    <div className={`bg-[#1c1e2a] p-2.5 rounded-lg border ${borderColor} shadow-md hover:shadow-lg transition-all duration-200`}>
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Icon size={12} className={`flex-shrink-0 ${iconColor}`} />
          <span className="text-[10px] font-mono text-gray-300 truncate" title={id}>
            {tx.seq_num ? `Tx #${tx.seq_num}` : id}
          </span>
        </div>
        <span className={`text-[9px] font-bold flex-shrink-0 ${id.includes('burst') || id.includes('VELOCITY') ? 'text-yellow-400' : 'text-gray-400'}`}>
          {time}
        </span>
      </div>
      
      <div className="flex justify-between items-end mt-1">
        <div className="text-[9px] text-gray-400 max-w-[80px] truncate" title={tx.user_id}>
          {tx.user_id}
        </div>
        <div className={`text-xs font-bold ${id.includes('INVALID') ? 'text-red-500' : 'text-white'}`}>
          {amount}
        </div>
      </div>

      {/* Layer specific details */}
      {layer === "silver" && tx.ml_features && (
        <div className="mt-2 text-[10px] text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded">
          Drift: {tx.ml_features.drift_score ? tx.ml_features.drift_score.toFixed(2) : "N/A"}
        </div>
      )}

      {layer === "gold" && tx.fraud_rules_triggered && tx.fraud_rules_triggered.length > 0 && (
        <div className="mt-2 text-[10px] text-[var(--warning)] bg-[var(--warning)]/10 px-2 py-1 rounded truncate">
          {tx.fraud_rules_triggered.join(", ")}
        </div>
      )}

      {layer === "inference" && tx.prediction !== undefined && (
        <div className={`mt-2 text-[10px] px-2 py-1 rounded ${tx.prediction === 1 ? 'text-[var(--danger)] bg-[var(--danger)]/10' : 'text-[var(--success)] bg-[var(--success)]/10'}`}>
          Pred: {tx.prediction === 1 ? 'Fraud' : 'Legit'}
        </div>
      )}

      {layer === "rejected" && tx.rejection_reason && (
        <div className="mt-2 text-[10px] text-[var(--danger)] bg-[var(--danger)]/10 px-2 py-1 rounded truncate" title={tx.rejection_reason}>
          {tx.rejection_reason}
        </div>
      )}
    </div>
  );
}
