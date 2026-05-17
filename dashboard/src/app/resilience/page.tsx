import Header from "@/components/Header";
import { getDashboardMetrics } from "@/app/actions";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  Users, 
  Server, 
  ArrowRight, 
  Bug, 
  Settings, 
  CheckCircle2, 
  FileText,
  Activity
} from "lucide-react";

export default async function ResiliencePage() {
  const metrics = await getDashboardMetrics();

  const strategies = [
    {
      id: "contract",
      title: "Data Contract Enforcement",
      layer: "Bronze Layer (Ingestion)",
      icon: <ShieldAlert className="text-[var(--danger)]" size={32} />,
      status: "ACTIVE",
      statusColor: "text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20",
      description: "Protects the pipeline from malformed schema structures, data drift, and corrupted payloads.",
      howItWorks: "Before transactions are written to the database, they pass through a strict schema validation engine. Any transaction violating our data contract (e.g. negative amounts, invalid IDs, missing temporal markers) is instantly redirected to the `transactions_rejected` collection, stopping ingestion and preventing downstream ML corruption.",
      faultTrigger: "Invalid Tx",
      mitigationAction: "Schema filtering blocks -999.0 amounts and logs immediate validation alerts.",
      mockLog: "2026-05-17 11:48:58 - bronze - WARNING - Data contract rejection: Transaction INJ-INVALID-Tx failed schema validation: Amount must be positive."
    },
    {
      id: "breaker",
      title: "Circuit Breaker & Fallbacks",
      layer: "Silver Layer (Enrichment)",
      icon: <Zap className="text-[var(--warning)]" size={32} />,
      status: "ACTIVE",
      statusColor: "text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/20",
      description: "Ensures pipeline continuity when third-party APIs or external enrichment databases experience downtime.",
      howItWorks: "If the Credit Score or Enrichment API returns high latency or failure rates, the pipeline's proactive Circuit Breaker transitions to the 'OPEN' state. In this mode, the system bypasses external API requests to prevent blocking the stream, falls back to historical customer profiles or average drift baselines, and flags transactions for manual review in the Gold Layer.",
      faultTrigger: "Kill API / Outage",
      mitigationAction: "Transition to fallback mode; skips high-latency API queries and flags for human evaluation.",
      mockLog: "2026-05-17 11:48:59 - silver - ERROR - External Enrichment API Down! Circuit Breaker [OPEN]. Fallback baseline applied."
    },
    {
      id: "drift",
      title: "Adversarial Drift Monitoring",
      layer: "Inference Layer (Model Assessment)",
      icon: <TrendingUp className="text-[var(--primary)]" size={32} />,
      status: "MONITORING",
      statusColor: "text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20",
      description: "Detects statistical distribution shifts and low-density window fraud attacks.",
      howItWorks: "During off-hours (e.g., 4:00 AM window), traffic density decreases, creating a logical blind spot. Fraudsters exploit this by initiating burst attacks. The pipeline monitors statistical data drift in real-time. If transaction patterns deviate from standard historical probability shapes, the system triggers alerts, and downstream thresholds are tightened.",
      faultTrigger: "Nightly Burst",
      mitigationAction: "Calculates statistical Kolmogorov-Smirnov drift score; flags high-probability deviation.",
      mockLog: "2026-05-17 11:49:00 - inference - WARNING - High Data Drift Detected (Score: 78%). Scaling up anomaly sensitivity."
    },
    {
      id: "velocity",
      title: "Velocity & Carding Protection",
      layer: "Gold Layer (Business Rules)",
      icon: <Activity className="text-[var(--success)]" size={32} />,
      status: "ACTIVE",
      statusColor: "text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/20",
      description: "Detects high-frequency automated card testing and velocity fraud schemes.",
      howItWorks: "The Gold Layer computes customer temporal frequency over moving sliding windows (e.g., last 5 minutes). Rapid, sequential transaction attempts with a matching Cardholder ID represent automation (card testing). The system locks the card account immediately, flagging the transactions for review and preventing multi-merchant fraud.",
      faultTrigger: "Velocity Burst",
      mitigationAction: "Applies sliding-window aggregation; locks account if frequency exceeds 3 requests per minute.",
      mockLog: "2026-05-17 11:49:01 - gold - CRITICAL - Velocity rule breached for customer C_2391. 5 transactions in 10 seconds. Account locked."
    },
    {
      id: "human",
      title: "Human-in-the-Loop Validation",
      layer: "Final Layer (Decision Output)",
      icon: <Users className="text-purple-400" size={32} />,
      status: "ACTIVE",
      statusColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
      description: "Bridges the gap between automated machine learning confidence and strict human oversight.",
      howItWorks: "When the Random Forest model returns a borderline probability score (e.g., 0.40 - 0.70 confidence), making a binary choice risks high false-positives or false-negatives. The pipeline automatically routes these transaction logs to a secure Human Review Queue. A financial analyst evaluates the case, making the final decision while feedback-looping the label to improve future models.",
      faultTrigger: "Borderline Score",
      mitigationAction: "Saves record to Manual Review Queue; locks funds pending decision.",
      mockLog: "2026-05-17 11:49:02 - decision_engine - INFO - Marginal prediction confidence (54.5%). Escalated to Human Review."
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#0f111a] text-[var(--foreground)] font-sans">
      <div className="flex-1 flex flex-col min-h-screen w-full">
        <Header metrics={metrics} />

        <main className="flex-1 p-4 md:p-6 flex flex-col gap-4 md:gap-6 xl:gap-8 w-full max-w-[1920px] mx-auto animate-in fade-in duration-700">
          
          {/* Hero Section with standardized layout */}
          <section className="relative overflow-hidden bg-[#161721] p-4 md:p-6 lg:p-8 rounded-xl border border-gray-800 shadow-xl text-left">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[var(--primary)]/10 to-transparent blur-[80px] pointer-events-none rounded-full"></div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--primary)] mb-2 lg:mb-4 tracking-tighter uppercase">
              Resilience <span className="text-white">Strategies</span>
            </h1>
            <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase mb-4">FAULT TOLERANCE & ADVERSARIAL SAFEGUARDS</p>
            <p className="text-gray-400 text-xs lg:text-sm leading-relaxed text-justify w-full">
              An ML pipeline running in production is only as strong as its weakest dependency. 
              Our fraud detection lab is architected with a multi-layered, redundant defense schema. 
              We actively enforce data contracts, construct auto-recovering circuit breakers, and integrate human judgment at critical decision points to protect our model from adversarial drift and platform instability.
            </p>
          </section>

          {/* Core Mapping Visualizer */}
          <section className="bg-[#161721] p-6 rounded-2xl border border-gray-800 shadow-xl">
            <h2 className="text-lg lg:text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Server className="text-[var(--success)]" size={22} />
              Adversarial Mapping & Automated Mitigation Flow
            </h2>
            
            {/* Visual Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-[#1c1e2a] p-5 rounded-xl border border-gray-800 flex flex-col gap-3 relative">
                <div className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400">STAGE 1</div>
                <div className="w-10 h-10 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 flex items-center justify-center">
                  <Bug size={18} className="text-[var(--danger)]" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">1. Attack / Injection</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  User fires a payload fault from the Control Panel (e.g. Kill API or corrupted payload format).
                </p>
              </div>

              <div className="bg-[#1c1e2a] p-5 rounded-xl border border-gray-800 flex flex-col gap-3 relative">
                <div className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400">STAGE 2</div>
                <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/30 flex items-center justify-center">
                  <Activity size={18} className="text-[var(--warning)]" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">2. Anomaly Ingestion</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  The active Medallion pipeline detects the system aberration at the respective processing layer.
                </p>
              </div>

              <div className="bg-[#1c1e2a] p-5 rounded-xl border border-gray-800 flex flex-col gap-3 relative">
                <div className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400">STAGE 3</div>
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex items-center justify-center">
                  <Settings size={18} className="text-[var(--primary)]" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">3. Active Mitigation</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  A proactive defense strategy kicks in: circuit breakers open, fallbacks load, or schemas filter.
                </p>
              </div>

              <div className="bg-[#1c1e2a] p-5 rounded-xl border border-gray-800 flex flex-col gap-3 relative">
                <div className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400">STAGE 4</div>
                <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-[var(--success)]" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">4. Clean State Recovery</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  System logs are written, malformed logs are isolated, and the main pipeline remains healthy and live.
                </p>
              </div>

            </div>
          </section>

          {/* Deep-Dive Grid */}
          <div className="flex flex-col gap-6 md:gap-8">
            <h2 className="text-lg lg:text-xl font-bold text-white px-2">Layered Defensive Strategies</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {strategies.map((strategy) => (
                <div 
                  key={strategy.id} 
                  className="bg-[#161721] p-6 lg:p-8 rounded-2xl border border-gray-800 shadow-xl flex flex-col gap-5 hover:border-[var(--primary)]/30 hover:shadow-[0_0_40px_rgba(32,174,243,0.06)] transition-all duration-300 group"
                >
                  {/* Top Line */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 group-hover:scale-105 transition-transform duration-300">
                        {strategy.icon}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{strategy.title}</h3>
                        <span className="text-xs text-gray-500 font-semibold">{strategy.layer}</span>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md border ${strategy.statusColor}`}>
                      {strategy.status}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed text-justify mt-1">
                    {strategy.description}
                  </p>

                  <div className="h-px bg-gray-800/60 my-1"></div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Architecture Implementation</span>
                      <p className="text-gray-400 text-sm leading-relaxed text-justify">
                        {strategy.howItWorks}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-950/60 p-3 rounded-xl border border-gray-900">
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mb-0.5">Control Action Trigger</span>
                        <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                          <Bug size={12} className="text-red-400 shrink-0" />
                          {strategy.faultTrigger}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mb-0.5">Defensive Strategy</span>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--success)] font-bold">
                          <ShieldCheck size={12} className="shrink-0" />
                          {strategy.mitigationAction}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <FileText size={12} className="text-gray-500" />
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Defensive Telemetry Console Logs</span>
                      </div>
                      <div className="bg-gray-950 p-3 rounded-xl border border-gray-900 font-mono text-[10px] text-gray-400 overflow-x-auto whitespace-nowrap custom-scrollbar">
                        <code className="text-left block">{strategy.mockLog}</code>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
