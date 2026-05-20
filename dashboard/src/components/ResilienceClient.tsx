"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import {
  AlertTriangle,
  Power,
  Zap,
  Moon,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  Server,
  ArrowRight,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  Brain,
  UserCheck,
  Cpu,
  Shield
} from "lucide-react";

interface ResilienceClientProps {
  metrics: any;
}

export default function ResilienceClient({ metrics }: ResilienceClientProps) {
  // Core Resilience Concepts
  const coreConcepts = [
    {
      title: "Medallion Architecture",
      icon: <Shield className="text-blue-400" size={24} />,
      badge: "Architecture",
      description: "Data pipeline architecture pattern designed to organize information into progressive layers of refinement and quality. The Bronze layer stores raw ingested data, the Silver layer cleans and enriches it and the Gold layer delivers curated, aggregated, and business-ready data optimized for analytics and machine learning workloads."
    },
    {
      title: "Fault Injection",
      icon: <Activity className="text-red-400" size={24} />,
      badge: "Testing Method",
      description: "Testing pattern consisting on deliberate introduction of simulated errors, corrupted data, or controlled system failures into a live pipeline, in order to validate that safety mechanisms, monitoring systems, and recovery strategies behave correctly under stress conditions."
    },
    {
      title: "Circuit Breaker",
      icon: <Zap className="text-amber-400" size={24} />,
      badge: "Fault Tolerance",
      description: "A protective software pattern that preserves system integrity when external services (such as APIs) fail. If an external service becomes unavailable or too slow, the circuit “opens” and stops requests, preventing cascading failures and enabling fallback mechanisms like manual review"
    },
    {
      title: "Kill Switch & Data Drift",
      icon: <TrendingUp className="text-emerald-400" size={24} />,
      badge: "ML Monitoring",
      description: "A safeguard combining data drift monitoring and a kill switch mechanism. When live transaction patterns deviate significantly from training data, model accuracy may drop; the kill switch can then pause or limit decisions to prevent errors and trigger fallback monitoring or retraining."
    }
  ];

  // Pipeline layers mapping Section 2 & 3 together
  const pipelineStages = [
    {
      id: "bronze",
      number: "1",
      layerName: "Bronze Layer (Ingestion)",
      title: "Data Contract Enforcement",
      hexColor: "#a0a0a0",
      threat: {
        name: "Invalid Tx",
        sub: "Schema Corruption",
        icon: <AlertTriangle className="text-red-500 animate-pulse" size={20} />,
        description: "Simulates upstream system bugs or malicious payload tampering. It tests if the pipeline can catch and reject malformed data (like negative transaction amounts) before it corrupts the machine learning model."
      },
      defense: {
        purpose: "Protects the pipeline from malformed structures and corrupted payloads.",
        implementation: "Before transactions enter the database, they pass through a strict validation engine. Any transaction violating the data contract (e.g., negative amounts, missing timestamps) is instantly rejected, preventing downstream ML corruption.",
        trigger: "Invalid Tx",
        telemetry: "2026-05-17 11:48:58 - bronze - WARNING - Data contract rejection: Transaction INJ-INVALID-Tx failed schema validation: Amount must be positive."
      }
    },
    {
      id: "silver",
      number: "2",
      layerName: "Silver Layer (Enrichment)",
      title: "Circuit Breakers & Fallbacks",
      hexColor: "#a9dfd8",
      threat: {
        name: "Kill API",
        sub: "Service Outage",
        icon: <Power className="text-red-500 animate-pulse" size={20} />,
        description: "Simulates a sudden outage or extreme latency from external third-party enrichment services. It verifies that the system can gracefully fall back to alternative data without halting the entire transaction stream."
      },
      defense: {
        purpose: "Ensures pipeline continuity when external APIs experience downtime.",
        implementation: "If external enrichment services return high latency or fail, a proactive Circuit Breaker transitions to the 'OPEN' state. The system bypasses external requests, falls back to historical customer baselines, and flags the transaction for careful evaluation.",
        trigger: "Kill API",
        telemetry: "2026-05-17 11:48:59 - silver - ERROR - External Enrichment API Down! Circuit Breaker [OPEN]. Fallback baseline applied."
      }
    },
    {
      id: "gold",
      number: "3",
      layerName: "Gold Layer (Business Rules)",
      title: "Velocity & Carding Protection",
      hexColor: "#fcb859",
      threat: {
        name: "Velocity Burst",
        sub: "Card Testing",
        icon: <Zap className="text-blue-400 animate-pulse" size={20} />,
        description: "Simulate sequential transactions using a single stolen card. It validates the real-time aggregation rules designed to lock accounts during high-frequency attacks."
      },
      defense: {
        purpose: "Detects high-frequency automated card testing schemes.",
        implementation: "The system computes transaction frequency over a moving time window. Rapid, sequential attempts with the same card ID indicate automated card testing. The pipeline immediately locks the account, preventing multi-merchant fraud.",
        trigger: "Velocity Burst",
        telemetry: "2026-05-17 11:49:01 - gold - CRITICAL - Velocity rule breached for customer C_2391. 5 transactions in 10 seconds. Account locked."
      }
    },
    {
      id: "inference",
      number: "4",
      layerName: "Inference Layer (Model Assessment)",
      title: "Adversarial Drift Monitoring",
      hexColor: "#20aef3",
      threat: {
        name: "Nightly Burst",
        sub: "Statistical Anomalies",
        icon: <Moon className="text-amber-500 animate-pulse" size={20} />,
        description: "Simulates off-hour bot attacks or fraud rings attempting to exploit low-traffic periods. It tests the system's ability to detect statistical data drift in real time and increase its anomaly sensitivity."
      },
      defense: {
        purpose: "Detects statistical distribution shifts and low-traffic fraud attacks.",
        implementation: "Fraudsters often exploit low-traffic off-hours (e.g., 4:00 AM) with burst attacks. The pipeline monitors statistical data drift in real time. If transaction patterns deviate from historical norms, the system triggers alerts and tightens downstream security thresholds.  Since the ML model is only reliable within the data distribution it was trained on, it cannot guarantee stable performance when exposed to significant data drift or previously unseen patterns.",
        trigger: "Nightly Burst",
        telemetry: "2026-05-17 11:49:00 - inference - WARNING - High Data Drift Detected (Score: 78%). Scaling up anomaly sensitivity."
      }
    },
    {
      id: "decision",
      number: "5",
      layerName: "Decision Layer (Output)",
      title: "Human-in-the-Loop Validation",
      hexColor: "#029f04",
      threat: {
        name: "Fraud Sample",
        sub: "Known Fraud Injection",
        icon: <ShieldAlert className="text-red-500 animate-pulse" size={20} />,
        description: "Simulates the ingestion of a confirmed, highly complex fraudulent transaction. It verifies that the machine learning model can successfully recognize hidden, non-linear fraud patterns and flag the transaction, even when basic business rules are bypassed."
      },
      defense: {
        purpose: "Bridges the gap between automated ML confidence and strict human oversight.",
        implementation: "When the Random Forest model returns a borderline probability score (e.g., 40% - 70% confidence), a binary automated choice risks costly false-positives or false-negatives. The pipeline automatically routes these ambiguous transactions to a secure queue for manual review by a financial analyst.",
        trigger: "Fraud Sample / Borderline Score",
        telemetry: "2026-05-17 11:49:02 - decision_engine - INFO - Marginal prediction confidence (54.5%). Escalated to Human Review."
      }
    }
  ];

  const [activeStageId, setActiveStageId] = useState<string>("bronze");
  const selectedStage = pipelineStages.find((s) => s.id === activeStageId) || pipelineStages[0];

  const getThreatStyle = (id: string, active: boolean) => {
    if (!active) {
      return "bg-[#171821]/60 border-gray-800 text-gray-400";
    }
    switch (id) {
      case "gold":
        return "bg-blue-950/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-blue-400";
      case "inference":
        return "bg-amber-950/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-500";
      default:
        return "bg-red-950/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] text-red-500";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f111a] text-[var(--foreground)] font-sans">
      <div className="flex-1 flex flex-col min-h-screen w-full">
        <Header metrics={metrics} />

        <main className="flex-1 p-4 md:p-6 flex flex-col gap-6 md:gap-8 xl:gap-10 w-full max-w-[1920px] mx-auto animate-in fade-in duration-700">

          {/* Hero Section */}
          <section className="relative overflow-hidden bg-[#161721] p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl text-left">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[var(--primary)]/10 to-transparent blur-[100px] pointer-events-none rounded-full"></div>

            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[var(--primary)] tracking-tight uppercase">
                System <span className="text-white">Resilience</span>
              </h1>
            </div>

            <p className="text-gray-400 text-xs lg:text-sm leading-relaxed text-justify w-full">
              A Machine Learning pipeline is only as strong as its weakest dependency. This platform employs a
              <span className="text-blue-500 font-bold"> multi-layered defense architecture</span> to enforce strict
              <span className="text-blue-500 font-bold"> data contracts</span>, implement
              <span className="text-blue-500 font-bold"> auto-recovering circuit breakers</span>, and integrate
              <span className="text-blue-500 font-bold"> human oversight</span> at critical decision points.
              The system is additionally designed to detect and mitigate
              <span className="text-blue-500 font-bold"> data drift</span> in real time, continuously monitoring
              feature distributions and behavioral anomalies that could degrade model performance over time.
              Explore the architecture below to understand how
              <span className="text-blue-500 font-bold"> failures</span>,
              <span className="text-blue-500 font-bold"> schema violations</span>, and
              <span className="text-blue-500 font-bold"> drift scenarios</span> are simulated, detected, and neutralized
              within mission-critical environments.
            </p>
          </section>

          {/* Core Resilience Concepts */}
          <section className="bg-[#161721] p-5 md:p-6 rounded-xl border border-gray-800 shadow-xl text-left flex flex-col gap-5">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                <Server className="text-[var(--primary)]" size={20} />
                Core Resilience Key Concepts
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mt-1">
              {coreConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="bg-[#12131b]/95 p-5 rounded-xl border border-gray-800/80 shadow-md hover:border-[var(--primary)]/30 hover:shadow-[0_0_30px_rgba(32,174,243,0.04)] transition-all duration-300 group flex flex-col justify-between min-h-[180px]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800/80 group-hover:scale-110 transition-transform duration-300">
                        {concept.icon}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300 px-2 py-0.5 rounded-full bg-gray-900 border border-gray-700">
                        {concept.badge}
                      </span>
                    </div>
                    <h3 className="text-sm lg:text-base font-extrabold text-white tracking-tight leading-tight group-hover:text-[var(--primary)] transition-colors">
                      {concept.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed text-justify">
                      {concept.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Medallion Architecture Map (Integrating Section 2 & 3) */}
          <section className="bg-[#161721] p-5 md:p-6 lg:p-8 rounded-2xl border border-gray-800 shadow-xl flex flex-col gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-800 pb-5">
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="text-[var(--success)]" size={22} />
                  Pipeline & Fault Injection Visualizer
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Click on each layer of the Medallion Pipeline to see where threats are injected and how defense mechanisms neutralize them.
                </p>
              </div>
            </div>

            {/* Visual Pipeline Flow Chart */}
            <div className="w-full overflow-x-auto pb-4 custom-scrollbar select-none">
              <div className="flex items-stretch min-w-[1060px] gap-0 p-2">
                {pipelineStages.map((stage, idx) => {
                  const boardColor = stage.hexColor;
                  const isActive = activeStageId === stage.id;

                  return (
                    <React.Fragment key={stage.id}>
                      {/* Column */}
                      <div
                        onClick={() => setActiveStageId(stage.id)}
                        className={`flex-1 flex flex-col rounded-xl overflow-hidden transition-all duration-300 cursor-pointer border ${
                          isActive
                            ? "scale-[1.035] z-10 shadow-2xl"
                            : "opacity-70 hover:opacity-95 hover:scale-[1.01]"
                        }`}
                        style={{
                          borderColor: isActive ? boardColor : `${boardColor}25`,
                          boxShadow: isActive ? `0 0 32px ${boardColor}30` : "none",
                          background: "#13141f",
                          minHeight: "220px",
                        }}
                      >
                        {/* Header */}
                        <div
                          className="px-4 py-4 border-b flex items-center gap-3 transition-all duration-300"
                          style={{
                            backgroundColor: isActive ? `${boardColor}22` : `${boardColor}0a`,
                            borderBottomColor: isActive ? `${boardColor}80` : `${boardColor}25`,
                          }}
                        >
                          {stage.id === "bronze"    && <Shield    size={18} style={{ color: boardColor }} className="shrink-0" />}
                          {stage.id === "silver"    && <Shield    size={18} style={{ color: boardColor }} className="shrink-0" />}
                          {stage.id === "gold"      && <Shield    size={18} style={{ color: boardColor }} className="shrink-0" />}
                          {stage.id === "inference" && <Brain     size={18} style={{ color: boardColor }} className="shrink-0" />}
                          {stage.id === "decision"  && <UserCheck size={18} style={{ color: boardColor }} className="shrink-0" />}
                          <h3 className="text-[14px] font-extrabold text-white truncate uppercase tracking-wide leading-none flex-1">
                            {stage.layerName.split(" (")[0]}
                          </h3>
                        </div>

                        {/* Body */}
                        <div className="flex-1 flex flex-col gap-0" style={{ backgroundColor: "#0e0f1a" }}>

                          {/* Top: defense info */}
                          <div className="flex flex-col gap-3 p-4 overflow-hidden">
                            {/* Colored left-accent title */}
                            <div className="flex items-start gap-2.5">
                              <div
                                className="w-[3px] rounded-full shrink-0 mt-0.5 self-stretch"
                                style={{ backgroundColor: boardColor, minHeight: "16px" }}
                              />
                              <span className="text-[13px] font-black text-white uppercase tracking-tight leading-snug">
                                {stage.title}
                              </span>
                            </div>
                            <p className="text-[12px] text-gray-400 leading-relaxed line-clamp-5 pl-[14px]">
                              {stage.defense.purpose}
                            </p>
                          </div>

                          {/* Bottom: barrier + threat */}
                          <div className="flex flex-col gap-2.5 px-4 pb-4">
                            {/* Injection Barrier — simple divider */}
                            <div className="flex items-center gap-2 select-none my-1">
                              <div className="h-px flex-1" style={{ backgroundColor: `${boardColor}20` }} />
                              <span className="text-[8px] font-bold text-gray-600 tracking-widest font-mono uppercase">
                                Injection Barrier
                              </span>
                              <div className="h-px flex-1" style={{ backgroundColor: `${boardColor}20` }} />
                            </div>

                            {/* Threat button */}
                            <div
                              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border transition-all duration-300 ${
                                getThreatStyle(stage.id, isActive)
                              }`}
                            >
                              {stage.id === "bronze"    && <AlertTriangle size={15} className="shrink-0" />}
                              {stage.id === "silver"    && <Power         size={15} className="shrink-0" />}
                              {stage.id === "gold"      && <Zap           size={15} className="shrink-0" />}
                              {stage.id === "inference" && <Moon          size={15} className="shrink-0" />}
                              {stage.id === "decision"  && <ShieldAlert   size={15} className="shrink-0" />}
                              <span className="text-[12px] font-bold uppercase tracking-wider">
                                {stage.threat.name}
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Arrow connector between stages */}
                      {idx < pipelineStages.length - 1 && (
                        <div className="flex items-center justify-center px-1.5 shrink-0 self-center">
                          <ArrowRight size={14} className="text-gray-700" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>



            {/* Interactive Inspection Panel (Details of the Selected Stage) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-gray-800/80 animate-in fade-in slide-in-from-bottom-5 duration-500">

              {/* Left Side: Simulated Threat Details (Section 2) */}
              <div className="lg:col-span-4 flex flex-col gap-4 bg-[#12131b] p-5 rounded-xl border border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500/80"></div>

                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Simulated Threat Vector</span>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                      {selectedStage.threat.icon}
                      {selectedStage.threat.name} <span className="text-xs text-gray-500 font-normal">({selectedStage.threat.sub})</span>
                    </h3>
                  </div>
                </div>

                <div className="bg-red-500/5 p-4 rounded-lg border border-red-950/20 text-justify flex-1">
                  <p className="text-xs text-gray-300 leading-relaxed font-normal">
                    {selectedStage.threat.description}
                  </p>
                </div>
              </div>

              {/* Right Side: Active Defense Strategy Details (Section 3) */}
              <div
                className="lg:col-span-8 flex flex-col gap-4 bg-[#12131b] p-5 rounded-xl border transition-all duration-300 relative overflow-hidden"
                style={{ borderColor: `${selectedStage.hexColor}25` }}
              >
                <div
                  className="absolute top-0 left-0 w-1.5 h-full"
                  style={{ backgroundColor: selectedStage.hexColor }}
                ></div>

                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest"
                      style={{ color: selectedStage.hexColor }}
                    >
                      Mitigation & Defense
                    </span>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <ShieldCheck size={20} style={{ color: selectedStage.hexColor }} />
                      {selectedStage.title}
                    </h3>
                  </div>
                </div>

                {/* Purpose (1/3) and Implementation (2/3) */}
                <div className="grid grid-cols-[1fr_2fr] gap-4 flex-1">
                  <div className="bg-gray-950/40 p-4 rounded-lg border border-gray-900 text-justify flex flex-col gap-1.5">
                    <span
                      className="text-[9px] uppercase font-bold tracking-widest block"
                      style={{ color: selectedStage.hexColor }}
                    >
                      Purpose
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {selectedStage.defense.purpose}
                    </p>
                  </div>
                  <div className="bg-gray-950/40 p-4 rounded-lg border border-gray-900 text-justify flex flex-col gap-1.5">
                    <span
                      className="text-[9px] uppercase font-bold tracking-widest block"
                      style={{ color: selectedStage.hexColor }}
                    >
                      Implementation
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {selectedStage.defense.implementation}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
