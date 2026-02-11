/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const App = () => {
  const [view, setView] = useState('grid'); 
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fetchingPdf, setFetchingPdf] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPaperName, setCurrentPaperName] = useState("");

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

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.pdfFile.files[0];
    const setNumber = parseInt(e.target.setNumber.value);
    if (!file || !setNumber) return alert("Please select a file and set number");

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        const fileName = file.name;
        const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(fileName)}`, {
          method: "PUT",
          headers: { Authorization: `Token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ message: `BitSoft Upload Set ${setNumber}`, content: base64Content }),
        });
        if (response.ok) {
          setExamSets(prev => prev.map(s => s.id === setNumber ? { ...s, fileName: fileName } : s));
          alert(`Set ${setNumber} linked to BitSoft Vault!`);
          setView('grid');
        }
      };
    } catch (err) { alert(err.message); } finally { setUploading(false); }
  };

  const fetchVaultPdf = async (fileName) => {
    if (!fileName) return;
    setFetchingPdf(true);
    setCurrentPaperName(fileName);
    try {
      const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(fileName)}`, {
        headers: { Authorization: `Token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3.raw" },
      });
      const blob = await response.blob();
      setPdfUrl(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })));
    } catch (err) { alert(err.message); } finally { setFetchingPdf(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0a192f] text-white p-6 flex flex-col gap-8">
        <div className="flex flex-col">
          <h1 className="text-3xl italic font-bold text-blue-400 leading-none">UDA</h1>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">BitSoft Systems</span>
        </div>
        <nav className="flex flex-col gap-4">
          <div onClick={() => {setView('grid'); setPdfUrl(null);}} className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer ${view === 'grid' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
             🐣 Nursery
          </div>
        </nav>
        <div className="mt-auto border-t border-slate-700 pt-6">
          <button onClick={() => {setView('upload'); setPdfUrl(null);}} className={`w-full flex items-center gap-3 p-3 rounded-lg font-bold ${view === 'upload' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
            📤 Admin Upload
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 relative overflow-hidden">
        {view === 'grid' && !pdfUrl && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {examSets.map((set) => (
              <button key={set.id} onClick={() => fetchVaultPdf(set.fileName)} className={`p-6 rounded-xl border h-32 flex flex-col items-center justify-center gap-2 ${set.fileName ? 'bg-white border-blue-200 text-slate-700 font-bold' : 'bg-slate-100 text-slate-400 italic'}`}>
                {set.label}
                {set.fileName && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">BITSOFT</span>}
              </button>
            ))}
          </div>
        )}

        {view === 'upload' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border mt-10">
            <h2 className="text-xl font-bold mb-6">BitSoft Admin: Upload Paper</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <select name="setNumber" className="p-3 border rounded-lg bg-slate-50">
                {examSets.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <input type="file" name="pdfFile" accept=".pdf" className="p-2 border rounded-lg" />
              <button type="submit" disabled={uploading} className="bg-indigo-600 text-white p-3 rounded-lg font-bold">
                {uploading ? "Uploading..." : "Save to BitSoft"}
              </button>
            </form>
          </div>
        )}

        {/* --- BRANDED PDF VIEWER --- */}
        {pdfUrl && (
          <div className="max-w-6xl mx-auto h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-blue-600">
            {/* External Header */}
            <div className="p-4 bg-white flex justify-between items-center border-b shadow-sm z-20">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-lg font-black italic">BS</div>
                <h2 className="font-bold text-slate-800">BITSOFT EXAMINATION SERIES</h2>
              </div>
              <button onClick={() => setPdfUrl(null)} className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition">Close Viewer</button>
            </div>

            <div className="flex-1 relative bg-slate-200">
              {/* --- THE MASK --- 
                  This div covers the "Greenhill" area inside the PDF frame. 
                  Adjust the 'top' and 'height' if needed for different paper formats.
              */}
              <div className="absolute top-[55px] left-1/2 -translate-x-1/2 w-[80%] h-[120px] bg-white z-10 flex flex-col items-center justify-center pointer-events-none">
                  <h1 className="text-3xl font-black text-black tracking-tighter uppercase">BitSoft National Examinations</h1>
                  <p className="text-lg font-bold text-black border-y-2 border-black px-8 mt-1">BITSOFT ASSESSMENT BOARD</p>
                  <p className="text-sm font-bold mt-1">"Empowering Education through Technology"</p>
              </div>

              {/* The actual PDF */}
              <iframe src={pdfUrl} className="w-full h-full" title="Viewer" />
            </div>
          </div>
        )}

        {fetchingPdf && (
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-white px-8 py-4 rounded-full font-bold text-blue-600 animate-pulse">Loading BitSoft Paper...</div>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;
