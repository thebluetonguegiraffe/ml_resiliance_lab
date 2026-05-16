import TransactionCard from "./TransactionCard";

interface KanbanColumnProps {
  title: string;
  count: number;
  transactions: any[];
  layer: "input" | "bronze" | "silver" | "gold" | "inference" | "final" | "rejected";
  colorVar: string; // e.g. "var(--primary)"
}

export default function KanbanColumn({ title, count, transactions, layer, colorVar }: KanbanColumnProps) {
  return (
    <div 
      className="flex flex-col bg-[#1a1b26] border rounded-xl flex-1 min-w-[200px] max-w-[350px] flex-shrink-0 h-full max-h-full overflow-hidden"
      style={{ borderColor: colorVar }}
    >
      {/* Column Header */}
      <div 
        className="p-3 border-b flex items-center justify-between"
        style={{ backgroundColor: `${colorVar}20`, borderBottomColor: colorVar }}
      >
        <h3 className="text-sm font-bold text-white flex items-center gap-2 truncate">
          {title}
        </h3>
        <span className="bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
          {count}
        </span>
      </div>
      
      {/* Cards Container */}
      <div className="p-2 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {transactions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-xs italic">
            Waiting for data...
          </div>
        ) : (
          transactions.map(tx => (
            <TransactionCard key={tx._id || tx.transaction_id} tx={tx} layer={layer} />
          ))
        )}
      </div>
    </div>
  );
}
