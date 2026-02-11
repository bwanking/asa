
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const App = () => {
  // --- UI STATE ---
  const [view, setView] = useState('grid'); 
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fetchingPdf, setFetchingPdf] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPaperName, setCurrentPaperName] = useState("");

  // --- DATA STATE ---
  const [examSets, setExamSets] = useState([
    { id: 1, label: "Set 1", fileName: "BABY MID TERM II NUMBERS - 2023.pdf" },
    { id: 2, label: "Set 2", fileName: "P.7 (A) SCIENCE FEB 2022.pdf" },
    { id: 3, label: "Set 3", fileName: "" },
    { id: 4, label: "Set 4", fileName: "" },
    { id: 5, label: "Set 5", fileName: "" },
    { id: 6, label: "Set 6", fileName: "" },
    { id: 7, label: "Set 7", fileName: "" }
  ]);

  const GITHUB_TOKEN = "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"; 
  const OWNER = "bwanking";
  const REPO = "uda-exams-vault";

  // --- 1. ADMIN UPLOAD LOGIC ---
  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.pdfFile.files[0];
    const setNumber = parseInt(e.target.setNumber.value);

    if (!file || !setNumber) {
      alert("Please select a file and set number");
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
              message: `Upload Set ${setNumber}: ${fileName} (Branded BitSoft)`,
              content: base64Content,
            }),
          }
        );

        if (response.ok) {
          const updatedSets = examSets.map(s => 
            s.id === setNumber ? { ...s, fileName: fileName } : s
          );
          setExamSets(updatedSets);
          alert(`Successfully uploaded to BitSoft Vault (Set ${setNumber})`);
          setView('grid');
        } else {
          const err = await response.json();
          throw new Error(err.message || "Failed to upload");
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

      if (!response.ok) throw new Error("File not found in the BitSoft vault.");

      const blob = await response.blob();
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      setPdfUrl(url);
    } catch (error) {
      alert(error.message);
    } finally {
      setFetchingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar - UDA/BitSoft Style */}
      <div className="w-64 bg-[#0a192f] text-white p-6 flex flex-col gap-8 shadow-xl">
        <div className="flex flex-col">
          <h1 className="text-3xl italic font-bold text-blue-400">UDA</h1>
          <span className="text-[10px] tracking-[0.2em] text-slate-400 font-bold uppercase">Powered by BitSoft</span>
        </div>
        
        <nav className="flex flex-col gap-4">
          <div onClick={() => {setView('grid'); setPdfUrl(null);}} className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition ${view === 'grid' ? 'bg-blue-600 shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}>
            <span>🐣</span> Nursery
          </div>
          <div className="p-3 flex items-center gap-3 hover:bg-slate-800 rounded-lg cursor-pointer opacity-70">
            <span>📚</span> Primary
          </div>
        </nav>
        
        <div className="mt-auto flex flex-col gap-4 border-t border-slate-700 pt-6">
          <button 
            onClick={() => {setView('upload'); setPdfUrl(null);}} 
            className={`flex items-center gap-3 p-3 rounded-lg font-bold transition ${view === 'upload' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            📤 Upload to BitSoft
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        
        {/* GRID VIEW */}
        {view === 'grid' && !pdfUrl && (
          <div>
            <div className="flex justify-between items-end mb-8">
               <h2 className="text-blue-600 font-bold uppercase tracking-widest">← Back to Numeracy</h2>
               <div className="text-right">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Repository</h3>
                  <p className="text-slate-800 font-black text-xl">BitSoft Exam Archive</p>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {examSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => fetchVaultPdf(set.fileName)}
                  className={`p-6 rounded-xl shadow-sm border transition-all active:scale-95 flex flex-col items-center justify-center gap-2 h-32
                    ${set.fileName ? 'bg-white border-blue-200 text-slate-700 font-bold' : 'bg-slate-100 border-transparent text-slate-400 italic'}`}
                >
                  <span className="text-lg">{set.label}</span>
                  {set.fileName && <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">BitSoft Verified</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD VIEW */}
        {view === 'upload' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mt-10">
            <div className="mb-6">
               <h2 className="text-2xl font-bold text-slate-800">BitSoft Admin Upload</h2>
               <p className="text-slate-500 text-sm">Add new papers to the branded digital vault.</p>
            </div>
            
            <form onSubmit={handleUpload} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assign to Set:</label>
                <select name="setNumber" className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  {examSets.map(s => (
                    <option key={s.id} value={s.id}>{s.label} {s.fileName ? '(Replace existing)' : '(New)'}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Choose PDF:</label>
                <input type="file" name="pdfFile" accept=".pdf" className="w-full p-2 border-2 border-dashed border-slate-300 rounded-lg" />
              </div>

              <div className="flex gap-4 mt-4">
                <button type="submit" disabled={uploading} className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
                  {uploading ? "Processing..." : "Deploy to BitSoft Vault"}
                </button>
                <button type="button" onClick={() => setView('grid')} className="px-6 py-3 border rounded-lg font-bold hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* PDF VIEWER WITH BITSOFT BRANDING */}
        {pdfUrl && (
          <div className="max-w-6xl mx-auto flex flex-col h-[90vh]">
            {/* BRANDED HEADER OVERLAY */}
            <div className="bg-white border-x-4 border-t-4 border-blue-600 p-4 rounded-t-2xl shadow-lg flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-lg font-black text-xl">B</div>
                <div>
                  <h2 className="font-black text-slate-900 leading-none">BITSOFT EXAM SERIES</h2>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Quality Assessment Solutions</p>
                </div>
              </div>
              
              <div className="text-center hidden md:block">
                 <p className="text-xs font-bold text-slate-400 uppercase">Document Name</p>
                 <p className="text-sm font-bold text-slate-700">{currentPaperName}</p>
              </div>

              <button 
                onClick={() => {
                  URL.revokeObjectURL(pdfUrl);
                  setPdfUrl(null);
                }} 
                className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all border border-red-200"
              >
                Close Paper
              </button>
            </div>

            {/* THE PDF CONTENT */}
            <div className="flex-1 bg-slate-800 border-x-4 border-b-4 border-blue-600 rounded-b-2xl overflow-hidden shadow-2xl relative">
              <iframe src={pdfUrl} className="w-full h-full" title="BitSoft Viewer" />
            </div>
            
            <p className="text-center text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">
              © 2026 BitSoft Digital Vault • All Rights Reserved
            </p>
          </div>
        )}

        {/* Loading Overlay */}
        {fetchingPdf && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-white px-10 py-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
               <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
               <span className="font-black text-blue-600 uppercase tracking-tighter">BitSoft Secure Link...</span>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;
