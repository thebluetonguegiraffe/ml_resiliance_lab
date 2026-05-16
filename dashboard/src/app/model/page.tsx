import Header from "@/components/Header";
import TimeDistributionChart from "@/components/TimeDistributionChart";
import { getTransactionTimeDistributions, getDashboardMetrics } from "@/app/actions";
import { Database, Cpu, History, AlertTriangle } from "lucide-react";

export default async function ModelPage() {
  const distributionData = await getTransactionTimeDistributions();
  const metrics = await getDashboardMetrics();

  return (
    <div className="flex min-h-screen bg-[#0f111a] text-[var(--foreground)] font-sans">
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* We use a modified Header for the model page to show active tab */}
        <Header metrics={metrics} />
        
        <main className="flex-1 p-6 flex flex-col gap-10 w-full max-w-[1920px] mx-auto animate-in fade-in duration-700">
          
          {/* Hero Section - Now in a Card */}
          <section className="bg-[#161721] p-8 rounded-xl border border-gray-800 shadow-xl text-left">
            <h1 className="text-4xl font-bold text-[var(--primary)] tracking-tighter uppercase leading-none mb-4">
              Model <span className="text-white">Intelligence</span>
            </h1>
            <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase mb-4">FRAUD DETECTION ENGINE V1.0</p>
            <p className="text-gray-400 text-sm leading-relaxed text-justify w-full">
              Our fraud detection engine utilizes a high-performance supervised learning model trained on over 280,000 credit card transactions. 
              The system is optimized for high recall to minimize financial loss while maintaining strict latency constraints.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Training Card */}
            <div className="lg:col-span-1 bg-[#1c1e2a] p-8 rounded-2xl border border-gray-800 shadow-xl flex flex-col gap-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3 text-white">
                <Database className="text-[var(--primary)]" size={24} />
                <h2 className="text-xl font-bold">Training Data</h2>
              </div>
              <ul className="flex flex-col gap-4 text-sm">
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

            {/* Algorithm Card */}
            <div className="lg:col-span-1 bg-[#1c1e2a] p-8 rounded-2xl border border-gray-800 shadow-xl flex flex-col gap-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3 text-white">
                <Cpu className="text-[var(--success)]" size={24} />
                <h2 className="text-xl font-bold">Algorithm & Logic</h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed text-justify">
                We employ an Ensemble learning strategy using Random Forest with SMOTE oversampling. 
                The model analyzes transaction amount, temporal velocity, and 28 PCA-transformed features to output a fraud probability score.
              </p>
              <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800 flex justify-between items-center mt-auto">
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5 uppercase font-black tracking-widest">Target Latency</div>
                  <div className="text-2xl font-black text-[var(--success)] tracking-tight">~12.4ms</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 mb-0.5 uppercase font-black tracking-widest">Precision-Recall</div>
                  <div className="text-2xl font-black text-white tracking-tight">0.942</div>
                </div>
              </div>
            </div>

            {/* Strategy Card */}
            <div className="lg:col-span-1 bg-[#1c1e2a] p-8 rounded-2xl border border-gray-800 shadow-xl flex flex-col gap-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3 text-white">
                <History className="text-[var(--warning)]" size={24} />
                <h2 className="text-xl font-bold">Resilience Strategy</h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed text-justify">
                Stratified K-Fold cross-validation ensures robustness against overfitting. 
                The model is specifically monitored for performance degradation during simulated data drift events in the nightly window.
              </p>
              <div className="mt-auto pt-4 flex gap-2">
                <span className="px-2 py-1 bg-gray-800 rounded text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Scalable</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Fault-Tolerant</span>
              </div>
            </div>
          </div>

          {/* Chart Section - Split Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <TimeDistributionChart data={distributionData} />
            </div>
            
            <div className="xl:col-span-1 bg-[#1c1e2a] p-8 rounded-2xl border border-gray-800 shadow-xl flex flex-col gap-6">
              <div className="flex items-center gap-3 text-[var(--warning)]">
                <AlertTriangle size={24} />
                <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Drift Analysis</h2>
              </div>
              
              <div className="flex flex-col gap-6">
                <p className="text-gray-300 text-sm leading-relaxed text-justify italic border-l-2 border-[var(--warning)] pl-4">
                  A significant drop in transaction volume is observed around <span className="text-white font-bold">4:00 AM</span> (logical window). 
                </p>
                <p className="text-gray-400 text-sm leading-relaxed text-justify">
                  Due to this low data density, the pipeline calculates a proactive <span className="text-[var(--primary)] font-bold">Data Drift Score</span>.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed text-justify">
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
