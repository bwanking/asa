import React, { useState } from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';

const App = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fetchingPdf, setFetchingPdf] = useState(false);
  const [currentPaperName, setCurrentPaperName] = useState("");

  // --- 1. DYNAMIC GITHUB FETCH ---
  const fetchVaultPdf = async (fileName) => {
    setFetchingPdf(true);
    setCurrentPaperName(fileName);
    
    const GITHUB_TOKEN = "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"; 
    const OWNER = "bwanking";
    const REPO = "uda-exams-vault";

    try {
      const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(fileName)}`,
        {
          headers: {
            Authorization: `Token ${GITHUB_TOKEN}`, 
            Accept: "application/vnd.github.v3.raw", 
          },
        }
      );

      if (!response.ok) throw new Error(`Paper not found in vault (Status: ${response.status})`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      
      setPdfUrl(blobUrl);
    } catch (error) {
      console.error("Fetch Error:", error);
      alert(error.message);
    } finally {
      setFetchingPdf(false);
    }
  };

  // --- 2. SET MAPPING ---
  // You can expand this list as you add more files to your GitHub Repo
  const examSets = [
    { id: 1, label: "Set 1", fileName: "BABY MID TERM II NUMBERS - 2023.pdf" },
    { id: 2, label: "Set 2", fileName: "TOP CLASS ENGLISH - 2023.pdf" }, // Example name
    { id: 3, label: "Set 3", fileName: "P1 MATHS END OF TERM - 2024.pdf" }, // Example name
    // Add more mappings here...
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Matching your screenshot */}
      <div className="w-64 bg-[#0a192f] text-white p-6 flex flex-col gap-8">
        <h1 className="text-3xl font-italic font-bold text-blue-400">UDA</h1>
        <nav className="flex flex-col gap-4">
          <div className="bg-blue-600 p-3 rounded-lg flex items-center gap-3 cursor-pointer">
            <span>🐣</span> Nursery
          </div>
          <div className="p-3 flex items-center gap-3 hover:bg-slate-800 rounded-lg cursor-pointer">
            <span>📚</span> Primary
          </div>
          <div className="p-3 flex items-center gap-3 hover:bg-slate-800 rounded-lg cursor-pointer">
            <span>🧬</span> Secondary
          </div>
        </nav>
        <div className="mt-auto flex flex-col gap-4 border-t border-slate-700 pt-6">
          <button className="flex items-center gap-3 text-sm">🔑 Login</button>
          <button className="flex items-center gap-3 text-sm">👤 Create Account</button>
          <button className="flex items-center gap-3 text-sm">⚙️ Admin</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-blue-600 font-bold uppercase">← Back to Numeracy</h2>
        </div>

        {/* The Grid of Sets */}
        {!pdfUrl && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {examSets.map((set) => (
              <button
                key={set.id}
                onClick={() => fetchVaultPdf(set.fileName)}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-slate-100 font-bold text-slate-700 transition-all active:scale-95"
              >
                {set.label}
              </button>
            ))}
            
            {/* Placeholder for undefined sets */}
            {[...Array(40)].map((_, i) => {
               if(i + 4 > 49) return null; 
               return (
                <button key={i+4} className="bg-white/50 p-6 rounded-xl border border-slate-100 text-slate-400 italic text-sm">
                  Set {i+4} (Empty)
                </button>
               )
            })}
          </div>
        )}

        {/* Loading State */}
        {fetchingPdf && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl animate-pulse">
              Opening {currentPaperName}...
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        {pdfUrl && (
          <div className="max-w-5xl mx-auto bg-white p-4 shadow-2xl rounded-lg animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="font-bold text-slate-700 uppercase">{currentPaperName}</h2>
              <button 
                onClick={() => {
                  URL.revokeObjectURL(pdfUrl);
                  setPdfUrl(null);
                }} 
                className="text-red-500 font-bold hover:underline"
              >
                Close Viewer
              </button>
            </div>
            <iframe 
              src={pdfUrl} 
              className="w-full h-[85vh] border-2 border-gray-200 rounded"
              title="PDF Viewer"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
