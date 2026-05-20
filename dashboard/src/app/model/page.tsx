import Header from "@/components/Header";
import TimeDistributionChart from "@/components/TimeDistributionChart";
import { getTransactionTimeDistributions, getDashboardMetrics } from "@/app/actions";
import { Database, Cpu, AlertTriangle, Layers, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ModelPage() {
  const distributionData = await getTransactionTimeDistributions();
  const metrics = await getDashboardMetrics();

  return (
    <div className="flex min-h-screen bg-[#0f111a] text-[var(--foreground)] font-sans">
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* We use a modified Header for the model page to show active tab */}
        <Header metrics={metrics} />

        <main className="flex-1 p-4 md:p-6 flex flex-col gap-4 md:gap-6 xl:gap-8 w-full max-w-[1920px] mx-auto animate-in fade-in duration-700">

          <section className="relative overflow-hidden bg-[#161721] p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl text-left">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[var(--primary)]/10 to-transparent blur-[100px] pointer-events-none rounded-full"></div>

            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[var(--primary)] tracking-tight uppercase">
                Model <span className="text-white">Intelligence</span>
              </h1>
            </div>

            <p className="text-gray-400 text-xs lg:text-sm leading-relaxed text-justify w-full">
              A high-performance supervised learning model has been train to identify
              fraudulent credit card transactions in real time. Trained on more than
              <span className="text-blue-500 font-bold"> 280,000</span> transaction records, the
              <span className="text-blue-500 font-bold"> Fraud Detection Engine</span> is optimized for
              <span className="text-blue-500 font-bold"> High Recall</span> to minimize financial exposure
              caused by undetected fraud, while maintaining strict
              <span className="text-blue-500 font-bold"> Low-Latency</span> requirements for seamless transaction processing.
              The system is engineered to deliver scalable, reliable, and production-ready performance
              within mission-critical payment environments.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Training Card */}
            <div className="bg-[#1c1e2a] p-4 md:p-6 lg:p-8 rounded-xl lg:rounded-2xl border border-gray-800 shadow-xl flex flex-col gap-4 lg:gap-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3 text-white">
                <Database className="text-[var(--primary)] w-5 h-5 lg:w-6 lg:h-6" />
                <h2 className="text-lg lg:text-xl font-bold">Training Data</h2>
              </div>
              <ul className="flex flex-col gap-3 lg:gap-4 text-xs lg:text-sm">
                <li className="flex justify-between border-b border-gray-800/50 pb-2">
                  <span className="text-gray-500 font-medium">Dataset Source</span>
                  <span className="text-white font-bold">ULB Machine Learning Group</span>
                </li>
                <li className="flex justify-between border-b border-gray-800/50 pb-2">
                  <span className="text-gray-500 font-medium">Total Samples</span>
                  <span className="text-white font-bold">284,807</span>
                </li>
                <li className="flex justify-between border-b border-gray-800/50 pb-2">
                  <span className="text-gray-500 font-medium">Features</span>
                  <span className="text-white font-bold">30 PCA Enriched</span>
                </li>
                <li className="flex justify-between border-b border-gray-800/50 pb-2">
                  <span className="text-gray-500 font-medium">Class Imbalance</span>
                  <span className="text-red-400 font-bold">0.172% Fraud Rate</span>
                </li>
              </ul>

            </div>

            {/* Random Forest Card */}
            <div className="bg-[#1c1e2a] p-4 md:p-6 lg:p-8 rounded-xl lg:rounded-2xl border border-gray-800 shadow-xl flex flex-col gap-4 lg:gap-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3 text-white">
                <Layers className="text-[#10b981] w-5 h-5 lg:w-6 lg:h-6" />
                <h2 className="text-lg lg:text-xl font-bold">Random Forest deployed Model</h2>
              </div>
              <p className="text-gray-400 text-xs lg:text-sm leading-relaxed text-justify">
                The production-deployed model leverages an ensemble learning strategy based on Random Forest algorithms to evaluate transaction amounts, temporal behavior, and PCA-transformed features. Optimized using the Area Under the Precision-Recall Curve (AUPRC) to address the severe class imbalance of only 0.172% fraudulent transactions, the model delivers superior fraud detection performance with significantly fewer false negatives compared to sequential boosting approaches.
              </p>
              <div className="bg-gray-900/30 p-3 rounded-xl border border-gray-800/40 text-xs text-gray-400 flex items-center justify-between mt-auto">
                <span>Baseline AUROC</span>
                <span className="text-[#10b981] text-base font-black">0.9917</span>
              </div>
            </div>

            {/* XGBoost Card */}
            <div className="bg-[#1c1e2a] p-4 md:p-6 lg:p-8 rounded-xl lg:rounded-2xl border border-gray-800 shadow-xl flex flex-col gap-4 lg:gap-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3 text-white">
                <Zap className="text-yellow-400 w-5 h-5 lg:w-6 lg:h-6 animate-pulse" />
                <h2 className="text-lg lg:text-xl font-bold text-white">XGBoost Alternative</h2>
              </div>
              <p className="text-gray-400 text-xs lg:text-sm leading-relaxed text-justify">
                An alternative approach based on sequential boosting with XGBoost was also developed and evaluated. Although the model leveraged the same feature set and optimization strategy focused on AUPRC, experimental results demonstrated lower AUROC performance and a higher rate of false negatives compared to the production Random Forest ensemble. Furthermore, the application of traditional imbalance-handling techniques such as scale_pos_weight led to additional performance degradation, reducing the model’s effectiveness in detecting fraudulent transactions.
              </p>
              <div className="bg-gray-900/30 p-3 rounded-xl border border-gray-800/40 text-xs text-gray-400 flex items-center justify-between mt-auto">
                <span>Baseline AUROC</span>
                <span className="text-yellow-400 text-base font-black">0.9810</span>
              </div>
            </div>
          </div>

          {/* Performance Comparison Section */}
          <section className="bg-[#161721] p-4 md:p-6 lg:p-8 rounded-xl border border-gray-800 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Model Performance Comparison</h3>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Experiment Runs & Validation Metrics</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                Random Forest Baseline is Optimal
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs lg:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-bold">Run ID</th>
                    <th className="py-3 px-4 font-bold">Model Architecture</th>
                    <th className="py-3 px-4 font-bold">ROC-AUC (AUROC)</th>
                    <th className="py-3 px-4 font-bold">Recall (Fraud)</th>
                    <th className="py-3 px-4 font-bold">PR-AUC (AUPRC)</th>
                    <th className="py-3 px-4 font-bold text-right">False Negatives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300 font-mono">
                  <tr className="hover:bg-gray-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-400">baseline</td>
                    <td className="py-3.5 px-4 font-semibold text-white font-sans flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                      Random Forest
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#10b981]">0.9917</td>
                    <td className="py-3.5 px-4 font-bold text-[#10b981]">0.889</td>
                    <td className="py-3.5 px-4">0.931</td>
                    <td className="py-3.5 px-4 font-bold text-[#10b981] text-right">5</td>
                  </tr>
                  <tr className="hover:bg-gray-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-400">baseline</td>
                    <td className="py-3.5 px-4 font-semibold text-white font-sans flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
                      XGBoost
                    </td>
                    <td className="py-3.5 px-4">0.9810</td>
                    <td className="py-3.5 px-4">0.867</td>
                    <td className="py-3.5 px-4 font-bold text-[var(--primary)]">0.931</td>
                    <td className="py-3.5 px-4 text-right">6</td>
                  </tr>
                  <tr className="hover:bg-gray-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-500">scale_pos_weight</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-400 font-sans flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f43f5e]"></span>
                      XGBoost
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">0.9753</td>
                    <td className="py-3.5 px-4 text-gray-500">0.844</td>
                    <td className="py-3.5 px-4 text-gray-500">0.827</td>
                    <td className="py-3.5 px-4 text-right text-[#f43f5e]">7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Chart Section - Split Layout */}
          <div className="grid grid-cols-4 gap-6 lg:gap-8">
            <div className="col-span-3">
              <TimeDistributionChart data={distributionData} />
            </div>

            <div className="col-span-1 bg-[#1c1e2a] p-4 md:p-6 lg:p-8 rounded-xl lg:rounded-2xl border border-gray-800 shadow-xl flex flex-col gap-4 lg:gap-6">
              <div className="flex items-center gap-3 text-[var(--warning)]">
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6" />
                <h2 className="text-lg lg:text-xl font-bold text-white uppercase tracking-tighter">Drift Analysis</h2>
              </div>

              <div className="flex flex-col gap-4 lg:gap-6">
                <p className="text-gray-300 text-xs lg:text-sm leading-relaxed text-justify italic border-l-2 border-[var(--warning)] pl-4">
                  A significant drop in transaction volume is observed around <span className="text-white font-bold">4:00 AM</span> (logical window).
                </p>
                <p className="text-gray-400 text-xs lg:text-sm leading-relaxed text-justify">
                  Due to this low data density, the pipeline calculates a proactive <span className="text-[var(--primary)] font-bold">Data Drift Score</span>.
                </p>
                <p className="text-gray-400 text-xs lg:text-sm leading-relaxed text-justify">
                  This monitoring stage prevents the model from processing transaction patterns it hasn't been sufficiently trained on, ensuring operational resilience and preventing accuracy degradation in low-volume windows.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
