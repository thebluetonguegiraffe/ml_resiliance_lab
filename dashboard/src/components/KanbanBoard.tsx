import KanbanColumn from "./KanbanColumn";

interface KanbanBoardProps {
  data: {
    input: any[];
    bronze: any[];
    silver: any[];
    gold: any[];
    inference: any[];
    final: any[];
    rejected: any[];
  };
}

const globalSeqMap = new Map<string, number>();
let globalNextNum = 1;

export default function KanbanBoard({ data }: KanbanBoardProps) {
  // Collect all transactions to build a stable sequence mapping
  const allTxs = [
    ...data.input,
    ...data.bronze,
    ...data.silver,
    ...data.gold,
    ...data.inference,
    ...data.final,
    ...data.rejected
  ];

  // Reset the global map if the pipeline is completely empty (e.g. after a reset)
  const isEmpty = 
    data.input.length === 0 && 
    data.bronze.length === 0 && 
    data.silver.length === 0 && 
    data.gold.length === 0 && 
    data.inference.length === 0 && 
    data.final.length === 0 && 
    data.rejected.length === 0;

  if (isEmpty) {
    globalSeqMap.clear();
    globalNextNum = 1;
  }

  // Sort ALL transactions by database insertion order (using MongoDB _id timestamp or string comparison)
  const sortedTxs = [...allTxs].sort((a, b) => {
    const idA = a._id?.toString() || "";
    const idB = b._id?.toString() || "";
    if (idA.length === 24 && idB.length === 24) {
      return idA.localeCompare(idB);
    }
    // Fallback to simulated time or timestamp
    const timeA = a.time !== undefined ? a.time : (a.Time || 0);
    const timeB = b.time !== undefined ? b.time : (b.Time || 0);
    if (timeA !== timeB) return timeA - timeB;
    return idA.localeCompare(idB);
  });

  // Assign stable persistent numbers to any new transaction IDs
  sortedTxs.forEach(tx => {
    const id = tx.internal_id || tx.transaction_id || tx._id?.toString();
    if (id && !globalSeqMap.has(id)) {
      globalSeqMap.set(id, globalNextNum++);
    }
  });

  // Injects seq_num into transactions
  const mapTransactions = (txList: any[]) => {
    return txList.map(tx => {
      const id = tx.internal_id || tx.transaction_id || tx._id?.toString() || "";
      const seq = globalSeqMap.get(id) || 0;
      return {
        ...tx,
        seq_num: seq
      };
    });
  };

  return (
    <div className="flex-1 w-full h-full overflow-hidden pb-2 min-h-0">
      <div className="flex h-full gap-3 px-1 w-full pb-2 min-h-0">
        
        {/* Main Flow */}
        <div className="h-full flex-1 flex flex-col min-w-[120px] max-w-[320px] min-h-0">
          <KanbanColumn 
            title="INPUT QUEUE" 
            count={data.input.length} 
            transactions={mapTransactions(data.input)} 
            layer="input" 
            colorVar="#d8b4fe" 
          />
        </div>

        {/* Medallion Group (Bronze, Silver, Gold) with Spanning Rejected Stack below */}
        <div className="h-full flex flex-col gap-3 min-w-[380px] max-w-[1000px] flex-[3] min-h-0">
          {/* Main 3 medallion stages */}
          <div className="flex-1 flex gap-3 w-full min-h-0">
            <div className="flex-1 flex flex-col min-w-[120px] max-w-[320px] min-h-0">
              <KanbanColumn 
                title="BRONZE LAYER" 
                count={data.bronze.length} 
                transactions={mapTransactions(data.bronze)} 
                layer="bronze" 
                colorVar="#a0a0a0" 
              />
            </div>
            <div className="flex-1 flex flex-col min-w-[120px] max-w-[320px] min-h-0">
              <KanbanColumn 
                title="SILVER LAYER" 
                count={data.silver.length} 
                transactions={mapTransactions(data.silver)} 
                layer="silver" 
                colorVar="#a9dfd8" 
              />
            </div>
            <div className="flex-1 flex flex-col min-w-[120px] max-w-[320px] min-h-0">
              <KanbanColumn 
                title="GOLD LAYER" 
                count={data.gold.length} 
                transactions={mapTransactions(data.gold)} 
                layer="gold" 
                colorVar="#fcb859" 
              />
            </div>
          </div>
          
          {/* Single Unified Spanning Rejected Stack */}
          <div className="h-2/5 shrink-0 flex flex-col w-full min-h-0">
            <KanbanColumn 
              title="REJECTED STACK" 
              count={data.rejected.length} 
              transactions={mapTransactions(data.rejected)} 
              layer="rejected" 
              colorVar="#fb003c" 
              isWide={true}
            />
          </div>
        </div>

        <div className="h-full flex-1 flex flex-col min-w-[120px] max-w-[320px] min-h-0">
          <KanbanColumn 
            title="INFERENCE LAYER" 
            count={data.inference.length} 
            transactions={mapTransactions(data.inference)} 
            layer="inference" 
            colorVar="#20aef3" 
          />
        </div>

        <div className="h-full flex-1 flex flex-col min-w-[120px] max-w-[320px] min-h-0">
          <KanbanColumn 
            title="FINAL STATE" 
            count={data.final.length} 
            transactions={mapTransactions(
              [...data.final].sort((a, b) => {
                const timeA = a.aggregated_at ? new Date(a.aggregated_at).getTime() : 0;
                const timeB = b.aggregated_at ? new Date(b.aggregated_at).getTime() : 0;
                if (timeB !== timeA) return timeB - timeA;
                return (b._id?.toString() || "").localeCompare(a._id?.toString() || "");
              })
            )}
            layer="final" 
            colorVar="#029f04" 
          />
        </div>

      </div>
    </div>
  );
}
