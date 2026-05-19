import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, FileWarning, Fingerprint, Shield, ShieldAlert, Zap, Gauge } from "lucide-react";

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
  const rawAmount = tx.amount !== undefined && tx.amount !== null ? tx.amount : tx.Amount;
  const amount = rawAmount !== undefined && rawAmount !== null ? `${rawAmount}€` : "";
  let time = "";
  if (mounted) {
    // 1. Try simulated transaction time (in seconds from start of day) first
    const rawTime = tx.time !== undefined ? tx.time : tx.Time;
    if (rawTime !== undefined && rawTime !== null) {
      const timeVal = typeof rawTime === 'string' ? parseFloat(rawTime) : rawTime;
      if (!isNaN(timeVal)) {
        if (timeVal < 0) {
          // If the time is negative, display the full raw value as a string so the anomaly is visible
          time = String(rawTime);
        } else {
          const hours = Math.floor(timeVal / 3600) % 24;
          const minutes = Math.floor((timeVal % 3600) / 60);
          time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
    }
    
    // 2. Fall back to real-time pipeline stage processing timestamps
    if (!time) {
      const isoString = tx.ingested_at || tx.enriched_at || tx.aggregated_at || tx.timestamp;
      if (isoString) {
        const date = new Date(isoString);
        if (!isNaN(date.getTime())) {
          time = date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          });
        }
      }
    }

    // 3. Fall back to MongoDB ObjectId timestamp extraction (very robust)
    if (!time && tx._id) {
      try {
        const idStr = tx._id.toString();
        // Standard MongoDB ObjectId is a 24-character hex string where the first 8 chars represent timestamp
        if (idStr.length === 24) {
          const timestamp = parseInt(idStr.substring(0, 8), 16) * 1000;
          if (!isNaN(timestamp)) {
            time = new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // 4. Absolute fallback to current time
    if (!time) {
      time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
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
    const status = tx.status || "";
    const isFraud = tx.prediction === 1 || tx.class === 1;
    if (isFraud) {
      borderColor = "border-[var(--danger)] bg-red-950/20 shadow-md shadow-[var(--danger)]/10";
      Icon = ShieldAlert;
      iconColor = "text-[var(--danger)]";
    } else if (status === "APPROVED") {
      borderColor = "border-[var(--success)]/50";
      Icon = CheckCircle2;
      iconColor = "text-[var(--success)]";
    } else if (status === "DENIED") {
      borderColor = "border-[var(--danger)]/50";
      Icon = ShieldAlert;
      iconColor = "text-[var(--danger)]";
    } else if (status === "TO_REVISE") {
      borderColor = "border-[var(--warning)]/50";
      Icon = AlertCircle;
      iconColor = "text-[var(--warning)]";
    } else {
      borderColor = "border-gray-700";
      Icon = CheckCircle2;
      iconColor = "text-gray-400";
    }
  } else if (layer === "bronze") {
    Icon = Shield;
    iconColor = "text-[#a0a0a0]";
  } else if (layer === "silver") {
    Icon = Shield;
    iconColor = "text-[#a9dfd8]";
  } else if (layer === "gold") {
    Icon = Shield;
    iconColor = "text-[#fcb859]";
  } else if (layer === "inference") {
    Icon = FileWarning;
    iconColor = "text-[var(--primary)]";
  } else if (layer === "input") {
    Icon = Zap;
    iconColor = "text-[#d8b4fe]";
  }

  const hasInternalId = tx.internal_id !== undefined && tx.internal_id !== null;

  return (
    <div className={`bg-[#1c1e2a] p-2.5 rounded-lg border ${borderColor} shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0 w-full`}>
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Icon size={14} className={`flex-shrink-0 ${iconColor}`} />
          <span className="text-xs lg:text-sm font-bold text-white truncate" title={tx.transaction_id || tx._id?.toString() || "Unknown"}>
            {hasInternalId ? `Tx #${tx.internal_id}` : (tx.seq_num ? `Tx #${tx.seq_num}` : id)}
          </span>
        </div>
        <span className={`text-[9px] font-bold flex-shrink-0 ${id.includes('burst') || id.includes('VELOCITY') ? 'text-yellow-400' : 'text-gray-400'}`}>
          {time}
        </span>
      </div>
      
      <div className="flex justify-between items-end mt-1">
        <div className="text-[9px] text-gray-400 max-w-[150px] truncate" title={tx.user_id}>
          {(() => {
            if (layer === "silver") {
              const cs = tx.credit_score !== undefined ? tx.credit_score : "N/A";
              return (
                <span className="flex items-center gap-1 select-none">
                  <span>Credit Score: <span className={cs === 0 ? "text-[var(--danger)] font-bold animate-pulse" : "text-white font-medium"}>{cs}</span></span>
                </span>
              );
            }
            if (layer === "gold") {
              const count = tx.tx_count_last_1s !== undefined ? tx.tx_count_last_1s : "0";
              const active = tx.high_velocity_alert;
              return (
                <span className="flex items-center gap-1 select-none">
                  <span>tx/s: <span className="text-white font-medium">{count}</span></span>
                  <span className="text-gray-700 font-normal">|</span>
                  <span className="flex items-center gap-0.5" title={active ? "High Velocity Alert: ACTIVE" : "Velocity: Normal"}>
                    <Gauge size={10} className={active ? "text-[var(--danger)] animate-pulse" : "text-[#fcb859]"} />
                    <span className={active ? "text-[var(--danger)] font-bold animate-pulse text-[8px]" : "text-[#fcb859] font-medium text-[8px]"}>
                      {active ? "HIGH VEL" : "OK"}
                    </span>
                  </span>
                </span>
              );
            }
            if (layer === "inference") {
              const isFraud = tx.prediction === 1;
              return (
                <span className="flex items-center gap-1 select-none">
                  <span>Pred: <span className={isFraud ? "text-[var(--danger)] font-bold" : "text-[var(--success)] font-bold"}>{isFraud ? "Fraud" : "Legit"}</span></span>
                </span>
              );
            }
            if (layer === "final") {
              const cs = tx.credit_score !== undefined ? tx.credit_score : "N/A";
              const count = tx.tx_count_last_1s !== undefined ? tx.tx_count_last_1s : "0";
              const active = tx.high_velocity_alert;
              return (
                <span className="flex items-center gap-1 select-none text-[8.5px]">
                  <span>CS: <span className={cs === 0 ? "text-[var(--danger)] font-bold animate-pulse" : "text-white font-medium"}>{cs}</span></span>
                  <span className="text-gray-700">|</span>
                  <span>tx/S: <span className="text-white font-medium">{count}</span></span>
                  <span className="text-gray-700">|</span>
                  <span title={active ? "High Velocity Active" : "Velocity Normal"} className="flex items-center">
                    <Gauge size={9} className={active ? "text-[var(--danger)] animate-pulse" : "text-[#fcb859]"} />
                  </span>
                </span>
              );
            }
            if (layer === "rejected" && tx.rejection_reason) {
              return <span className="text-[var(--danger)] font-bold truncate max-w-[130px]" title={tx.rejection_reason}>{tx.rejection_reason}</span>;
            }
            return <span className="truncate">{tx.user_id}</span>;
          })()}
        </div>
        <div className={`text-xs font-bold ${id.includes('INVALID') || tx.prediction === 1 || tx.class === 1 ? 'text-red-500' : 'text-white'}`}>
          {amount}
        </div>
      </div>
    </div>
  );
}
