
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
    { id: 2, label: "Set 2", fileName: "" },
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
              message: `Upload Set ${setNumber}: ${fileName}`,
              content: base64Content,
            }),
          }
        );

        if (response.ok) {
          const updatedSets = examSets.map(s => 
            s.id === setNumber ? { ...s, fileName: fileName } : s
          );
          setExamSets(updatedSets);
          alert(`Successfully uploaded and linked to Set ${setNumber}!`);
          setView('grid');
        } else {
          const err = await response.json();
          throw new Error(err.message || "Failed to upload");
        }
      };
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 2. RETRIEVE LOGIC ---
  const fetchVaultPdf = async (fileName) => {
    if (!fileName) {
      alert("No PDF has been uploaded for this set yet.");
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

      if (!response.ok) throw new Error("File not found in the vault.");

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - UDA Style */}
      <div className="w-64 bg-[#0a192f] text-white p-6 flex flex-col gap-8 shadow-xl">
        <h1 className="text-3xl italic font-bold text-blue-400">UDA</h1>
        <nav className="flex flex-col gap-4">
          <div onClick={() => {setView('grid'); setPdfUrl(null);}} className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer ${view === 'grid' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <span>🐣</span> Nursery
          </div>
          <div className="p-3 flex items-center gap-3 hover:bg-slate-800 rounded-lg cursor-pointer opacity-50">
            <span>📚</span> Primary
          </div>
        </nav>
        
        <div className="mt-auto flex flex-col gap-4 border-t border-slate-700 pt-6">
          <button 
            onClick={() => {setView('upload'); setPdfUrl(null);}} 
            className={`flex items-center gap-3 p-3 rounded-lg font-bold transition ${view === 'upload' ? 'bg-red-600' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            📤 Upload Paper
          </button>
          <div className="text-xs text-slate-500 text-center">Admin Mode Active</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        
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
                  {set.fileName && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">Ready</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD VIEW */}
        {view === 'upload' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mt-10">
            <h2 className="text-2xl font-bold mb-2 text-slate-800">Vault Upload</h2>
            <p className="text-slate-500 mb-6 text-sm">Select a set to link the PDF to.</p>
            
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
                <button type="submit" disabled={uploading} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-400">
                  {uploading ? "Uploading..." : "Save to GitHub Vault"}
                </button>
                <button type="button" onClick={() => setView('grid')} className="px-6 py-3 border rounded-lg font-bold hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* PDF VIEWER */}
        {pdfUrl && (
          <div className="max-w-5xl mx-auto bg-white p-4 shadow-2xl rounded-lg animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="font-bold text-slate-700 truncate pr-4">{currentPaperName}</h2>
              <button 
                onClick={() => {
                  URL.revokeObjectURL(pdfUrl);
                  setPdfUrl(null);
                }} 
                className="bg-red-100 text-red-600 px-4 py-1 rounded-full font-bold hover:bg-red-200 transition"
              >
                Close Paper
              </button>
            </div>
            <iframe src={pdfUrl} className="w-full h-[82vh] rounded border shadow-inner" title="Viewer" />
          </div>
        )}

        {/* Loading Overlay */}
        {fetchingPdf && (
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-white px-8 py-4 rounded-full shadow-2xl font-bold text-blue-600 animate-bounce">
               Fetching from Vault...
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;
