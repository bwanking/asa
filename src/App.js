/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const App = () => {
  // --- UI STATE ---
  const [view, setView] = useState('grid'); 
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fetchingPdf, setFetchingPdf] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPaperName, setCurrentPaperName] = useState("");

  // --- DATA STATE (Unlimited Logic) ---
  // We start with your known files, but this list will grow as you upload
  const [examSets, setExamSets] = useState([
    { id: 1, label: "Set 1", fileName: "BABY MID TERM II NUMBERS - 2023.pdf" },
    { id: 2, label: "Set 2", fileName: "P.7 (A) SCIENCE FEB 2022.pdf" },
  ]);

  const GITHUB_TOKEN = "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"; 
  const OWNER = "bwanking";
  const REPO = "uda-exams-vault";

  // --- 1. DYNAMIC ADMIN UPLOAD ---
  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.pdfFile.files[0];
    const setNumber = parseInt(e.target.setNumberInput.value);

    if (!file || !setNumber) {
      alert("Please provide a file and a Set Number (e.g., 8, 9, 10...)");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        const fileName = file.name;

        const response = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(fileName)}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Token ${GITHUB_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: `BitSoft Deploy: Set ${setNumber} - ${fileName}`,
              content: base64Content,
            }),
          }
        );

        if (response.ok) {
          // UNLIMITED LOGIC: Check if set exists, update it, or add new ones up to that number
          setExamSets(prev => {
            const newSets = [...prev];
            // If user enters Set 10 but we only have 2, create 3-9 as empty and 10 as active
            for (let i = 1; i <= setNumber; i++) {
              const existingIdx = newSets.findIndex(s => s.id === i);
              if (existingIdx === -1) {
                newSets.push({ id: i, label: `Set ${i}`, fileName: i === setNumber ? fileName : "" });
              } else if (i === setNumber) {
                newSets[existingIdx].fileName = fileName;
              }
            }
            return newSets.sort((a, b) => a.id - b.id);
          });

          alert(`Successfully deployed Set ${setNumber} to BitSoft Vault!`);
          setView('grid');
        } else {
          const err = await response.json();
          throw new Error(err.message || "GitHub Upload Failed");
        }
      };
    } catch (error) {
      alert("Upload Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 2. RETRIEVE LOGIC ---
  const fetchVaultPdf = async (fileName) => {
    if (!fileName) {
      alert("No paper linked to this set yet.");
      return;
    }
    setFetchingPdf(true);
    setCurrentPaperName(fileName);

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
      const blob = await response.blob();
      setPdfUrl(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })));
    } catch (error) {
      alert(error.message);
    } finally {
      setFetchingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#0a192f] text-white p-6 flex flex-col gap-8 shadow-xl">
        <div className="flex flex-col">
          <h1 className="text-3xl italic font-bold text-blue-400">UDA</h1>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">BitSoft Systems</span>
        </div>
        
        <nav className="flex flex-col gap-4">
          <div onClick={() => {setView('grid'); setPdfUrl(null);}} className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition ${view === 'grid' ? 'bg-blue-600 shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}>
            <span>🐣</span> Nursery
          </div>
        </nav>
        
        <div className="mt-auto border-t border-slate-700 pt-6">
          <button 
            onClick={() => {setView('upload'); setPdfUrl(null);}} 
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-bold transition ${view === 'upload' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            📤 Admin: New Upload
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 relative">
        
        {/* GRID VIEW */}
        {view === 'grid' && !pdfUrl && (
          <div>
            <h2 className="text-blue-600 font-bold mb-8 uppercase tracking-widest">← Back to Numeracy</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {examSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => fetchVaultPdf(set.fileName)}
                  className={`p-6 rounded-xl shadow-sm border transition-all active:scale-95 flex flex-col items-center justify-center gap-2 h-32
                    ${set.fileName ? 'bg-white border-blue-200 text-slate-700 font-bold' : 'bg-slate-100 border-transparent text-slate-400 italic'}`}
                >
                  <span className="text-lg">{set.label}</span>
                  {set.fileName && <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD VIEW (Unlimited) */}
        {view === 'upload' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mt-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Deploy New Paper</h2>
            <p className="text-slate-500 text-sm mb-6">Enter any number (e.g. 50, 100) to create that set.</p>
            
            <form onSubmit={handleUpload} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Set Number:</label>
                <input 
                  type="number" 
                  name="setNumberInput" 
                  placeholder="e.g. 8"
                  className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select PDF:</label>
                <input type="file" name="pdfFile" accept=".pdf" className="w-full p-2 border-2 border-dashed border-slate-300 rounded-lg" />
              </div>

              <div className="flex gap-4 mt-4">
                <button type="submit" disabled={uploading} className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
                  {uploading ? "Uploading to GitHub..." : "Deploy to BitSoft Vault"}
                </button>
                <button type="button" onClick={() => setView('grid')} className="px-6 py-3 border rounded-lg font-bold">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* BRANDED PDF VIEWER WITH MASK */}
        {pdfUrl && (
          <div className="max-w-6xl mx-auto flex flex-col h-[90vh]">
            <div className="bg-white border-x-4 border-t-4 border-blue-600 p-4 rounded-t-2xl shadow-lg flex justify-between items-center z-20">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-lg font-black italic">BS</div>
                <h2 className="font-black text-slate-900 leading-none">BITSOFT EXAMINATION SERIES</h2>
              </div>
              <button onClick={() => setPdfUrl(null)} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all">Close Viewer</button>
            </div>

            <div className="flex-1 bg-slate-800 border-x-4 border-b-4 border-blue-600 rounded-b-2xl overflow-hidden shadow-2xl relative">
              {/* THE BITSOFT MASK - Hides original school header */}
              <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[85%] h-[120px] bg-white z-10 flex flex-col items-center justify-center pointer-events-none">
                  <h1 className="text-3xl font-black text-black tracking-tighter uppercase">BitSoft National Examinations</h1>
                  <p className="text-lg font-bold text-black border-y-2 border-black px-10 mt-1">BITSOFT ASSESSMENT BOARD</p>
                  <p className="text-xs font-bold mt-2 opacity-70">CONFIDENTIAL • BITSOFT DIGITAL REPOSITORY</p>
              </div>
              <iframe src={pdfUrl} className="w-full h-full" title="BitSoft Viewer" />
            </div>
          </div>
        )}

        {fetchingPdf && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-white px-10 py-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
               <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
               <span className="font-black text-blue-600">Syncing with BitSoft...</span>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;
