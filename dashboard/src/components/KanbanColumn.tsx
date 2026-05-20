import TransactionCard from "./TransactionCard";
import { Database, Shield, Brain, UserCheck, ShieldAlert } from "lucide-react";

interface KanbanColumnProps {
  title: string;
  count: number;
  transactions: any[];
  layer: "input" | "bronze" | "silver" | "gold" | "inference" | "final" | "rejected";
  colorVar: string; // e.g. "var(--primary)"
  isWide?: boolean;
}

export default function KanbanColumn({ title, count, transactions, layer, colorVar, isWide = false }: KanbanColumnProps) {
  const getLayerIcon = () => {
    switch (layer) {
      case "input":
        return <Database size={15} style={{ color: colorVar }} />;
      case "bronze":
        return <Shield size={15} style={{ color: colorVar }} />;
      case "silver":
        return <Shield size={15} style={{ color: colorVar }} />;
      case "gold":
        return <Shield size={15} style={{ color: colorVar }} />;
      case "inference":
        return <Brain size={15} style={{ color: colorVar }} />;
      case "final":
        return <UserCheck size={15} style={{ color: colorVar }} />;
      case "rejected":
        return <ShieldAlert size={15} style={{ color: colorVar }} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="flex flex-col bg-[#1a1b26] border rounded-xl w-full h-full max-h-full overflow-hidden"
      style={{ borderColor: colorVar }}
    >
      {/* Column Header */}
      <div 
        className="p-3 border-b flex items-center justify-between"
        style={{ backgroundColor: `${colorVar}20`, borderBottomColor: colorVar }}
      >
        <h3 className="text-sm font-bold text-white flex items-center gap-2 truncate">
          {getLayerIcon()}
          {title}
        </h3>
        <span className="bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
          {count}
        </span>
      </div>
      
      {/* Cards Container */}
      <div className={`p-2 flex-1 custom-scrollbar ${
        transactions.length === 0
          ? "flex items-center justify-center w-full"
          : isWide
            ? "grid grid-cols-3 gap-3 overflow-y-auto content-start"
            : "flex flex-col space-y-2 overflow-y-auto"
      }`}>
        {transactions.length === 0 ? (
          <span className="text-gray-500 text-xs italic select-none">
            Waiting for data...
          </span>
        ) : (
          transactions.map(tx => (
            <TransactionCard key={tx.internal_id || tx.transaction_id || tx._id} tx={tx} layer={layer} />
          ))
        )}
      </div>
    </div>
  );
}
