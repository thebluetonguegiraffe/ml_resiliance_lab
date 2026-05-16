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
  return (
    <div className="flex-1 w-full h-full overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar">
      <div className="flex h-full gap-4 px-2 min-w-max pb-2">
        
        {/* Main Flow */}
        <div className="h-full flex-1 flex flex-col min-w-[200px] max-w-[350px]">
          <KanbanColumn 
            title="Input Queue" 
            count={data.input.length} 
            transactions={data.input} 
            layer="input" 
            colorVar="#d8b4fe" 
          />
        </div>

        <div className="flex flex-col gap-4 h-full flex-1 min-w-[200px] max-w-[350px]">
          <div className="flex-1 flex flex-col">
            <KanbanColumn 
              title="Bronze (Raw)" 
              count={data.bronze.length} 
              transactions={data.bronze} 
              layer="bronze" 
              colorVar="#a0a0a0" 
            />
          </div>
          
          {/* Branch off for rejected */}
          <div className="flex-1 shrink-0 h-2/5 flex flex-col">
            <KanbanColumn 
              title="Rejected" 
              count={data.rejected.length} 
              transactions={data.rejected} 
              layer="rejected" 
              colorVar="#fb003c" 
            />
          </div>
        </div>

        <div className="h-full flex-1 flex flex-col min-w-[200px] max-w-[350px]">
           <KanbanColumn 
            title="Silver (Features)" 
            count={data.silver.length} 
            transactions={data.silver} 
            layer="silver" 
            colorVar="#a9dfd8" 
          />
        </div>

        <div className="h-full flex-1 flex flex-col min-w-[200px] max-w-[350px]">
          <KanbanColumn 
            title="Gold (Decision)" 
            count={data.gold.length} 
            transactions={data.gold} 
            layer="gold" 
            colorVar="#fcb859" 
          />
        </div>

        <div className="h-full flex-1 flex flex-col min-w-[200px] max-w-[350px]">
          <KanbanColumn 
            title="Inference" 
            count={data.inference.length} 
            transactions={data.inference} 
            layer="inference" 
            colorVar="#20aef3" 
          />
        </div>

        <div className="h-full flex-1 flex flex-col min-w-[200px] max-w-[350px]">
          <KanbanColumn 
            title="Final State" 
            count={data.final.length} 
            transactions={data.final} 
            layer="final" 
            colorVar="#029f04" 
          />
        </div>

      </div>
    </div>
  );
}
