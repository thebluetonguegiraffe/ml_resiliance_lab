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

  const idMap = new Map<string, number>();
  let nextNum = 1;

  // Sort by time/timestamp first to keep sequence stable across updates
  const sortedTxs = [...allTxs].sort((a, b) => {
    const timeA = a.time !== undefined ? a.time : (a.Time || 0);
    const timeB = b.time !== undefined ? b.time : (b.Time || 0);
    if (timeA !== timeB) return timeA - timeB;

    const tsA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tsB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    if (tsA !== tsB) return tsA - tsB;

    const idA = a.transaction_id || a._id?.toString() || "";
    const idB = b.transaction_id || b._id?.toString() || "";
    return idA.localeCompare(idB);
  });

  sortedTxs.forEach(tx => {
    const id = tx.transaction_id || tx._id?.toString();
    if (id && !idMap.has(id)) {
      idMap.set(id, nextNum++);
    }
  });

  // Injects seq_num into transactions
  const mapTransactions = (txList: any[]) => {
    return txList.map(tx => {
      const id = tx.transaction_id || tx._id?.toString() || "";
      const seq = idMap.get(id) || 0;
      return {
        ...tx,
        seq_num: seq
      };
    });
  };

  return (
    <div className="flex-1 w-full h-full overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar">
      <div className="flex h-full gap-4 px-2 min-w-max pb-2">
        
        {/* Main Flow */}
        <div className="h-full flex-1 flex flex-col min-w-[200px] max-w-[350px]">
          <KanbanColumn 
            title="Input Queue" 
            count={data.input.length} 
            transactions={mapTransactions(data.input)} 
            layer="input" 
            colorVar="#d8b4fe" 
          />
        </div>

        <div className="flex flex-col gap-4 h-full flex-1 min-w-[200px] max-w-[350px]">
          <div className="flex-1 flex flex-col">
            <KanbanColumn 
              title="Bronze (Raw)" 
              count={data.bronze.length} 
              transactions={mapTransactions(data.bronze)} 
              layer="bronze" 
              colorVar="#a0a0a0" 
            />
          </div>
          
          {/* Branch off for rejected */}
          <div className="flex-1 shrink-0 h-2/5 flex flex-col">
            <KanbanColumn 
              title="Rejected" 
              count={data.rejected.length} 
              transactions={mapTransactions(data.rejected)} 
              layer="rejected" 
              colorVar="#fb003c" 
            />
          </div>
        </div>

        <div className="h-full flex-1 flex flex-col min-w-[200px] max-w-[350px]">
           <KanbanColumn 
            title="Silver (Features)" 
            count={data.silver.length} 
            transactions={mapTransactions(data.silver)} 
            layer="silver" 
            colorVar="#a9dfd8" 
          />
        </div>

        <div className="h-full flex-1 flex flex-col min-w-[200px] max-w-[350px]">
          <KanbanColumn 
            title="Gold (Decision)" 
            count={data.gold.length} 
            transactions={mapTransactions(data.gold)} 
            layer="gold" 
            colorVar="#fcb859" 
          />
        </div>

        <div className="h-full flex-1 flex flex-col min-w-[200px] max-w-[350px]">
          <KanbanColumn 
            title="Inference" 
            count={data.inference.length} 
            transactions={mapTransactions(data.inference)} 
            layer="inference" 
            colorVar="#20aef3" 
          />
        </div>

        <div className="h-full flex-1 flex flex-col min-w-[200px] max-w-[350px]">
          <KanbanColumn 
            title="Final State" 
            count={data.final.length} 
            transactions={mapTransactions(data.final)} 
            layer="final" 
            colorVar="#029f04" 
          />
        </div>

      </div>
    </div>
  );
}
