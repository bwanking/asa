/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const App = () => {
  // --- UI STATE ---
  const [view, setView] = useState('grid'); // 'grid' or 'upload'
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fetchingPdf, setFetchingPdf] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPaperName, setCurrentPaperName] = useState("");

  // --- DATA STATE ---
  // In a real app, this would be fetched from Firebase. 
  // For now, we manage it locally.
  const [examSets, setExamSets] = useState([
    { id: 1, label: "Set 1", fileName: "BABY MID TERM II NUMBERS - 2023.pdf" },
    { id: 2, label: "Set 2", fileName: "" },
    { id: 3, label: "Set 3", fileName: "" },
  ]);

  const GITHUB_TOKEN = "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"; 
  const OWNER = "bwanking";
  const REPO = "uda-exams-vault";

  // --- 1. ADMIN UPLOAD LOGIC ---
  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.pdfFile.files[0];
    const setNumber = parseInt(e.target.setNumber.value);

    if (!file || !setNumber) return alert("Please select a file and set number");

    setUploading(true);

    try {
      // Convert file to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        const fileName = file.name;

        // Push to GitHub API
        const response = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(fileName)}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Token ${GITHUB_TOKEN}`,
              Content-Type: "application/json",
            },
            body: JSON.stringify({
              message: `Upload Set ${setNumber}: ${fileName}`,
              content: base64Content,
            }),
          }
        );

        if (response.ok) {
          // Update the local list so the Set now has a link
          const updatedSets = examSets.map(s => 
            s.id === setNumber ? { ...s, fileName: fileName } : s
          );
          setExamSets(updatedSets);
          alert(`Successfully uploaded to Set ${setNumber}!`);
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

  // --- 2. FETCH LOGIC ---
  const fetchVaultPdf = async (fileName) => {
    if (!fileName) return alert("No file attached to this set yet.");
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

      if (!response.ok) throw new Error("File not found in GitHub Vault");

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
      {/* Sidebar */}
      <div className="w-64 bg-[#0a192f] text-white p-6 flex flex-col gap-8 shadow-xl">
        <h1 className="text-3xl italic font-bold text-blue-400">UDA</h1>
        <nav className="flex flex-col gap-4">
          <div onClick={() => setView('grid')} className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer ${view === 'grid' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <span>🐣</span> Nursery
          </div>
          <div className="p-3 flex items-center gap-3 hover:bg-slate-800 rounded-lg cursor-pointer">
            <span>📚</span> Primary
          </div>
        </nav>
        <div className="mt-auto flex flex-col gap-4 border-t border-slate-700 pt-6">
          <button onClick={() => setView('upload')} className={`flex items-center gap-3 p-2 rounded ${view === 'upload' ? 'bg-red-600' : 'text-slate-400'}`}>
            📤 Admin Upload
          </button>
          <button className="flex items-center gap-3 text-sm text-slate-400">⚙️ Admin Settings</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* VIEW 1: THE GRID */}
        {view === 'grid' && !pdfUrl && (
          <>
            <h2 className="text-blue-600 font-bold mb-8">← BACK TO NUMERACY</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {examSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => fetchVaultPdf(set.fileName)}
                  className={`p-6 rounded-xl shadow-sm border transition-all active:scale-95 flex flex-col items-center gap-2
                    ${set.fileName ? 'bg-white border-blue-200 text-slate-700 font-bold' : 'bg-slate-100 border-transparent text-slate-400 italic'}`}
                >
                  <span>{set.label}</span>
                  {set.fileName && <span className="text-[10px] text-blue-500 truncate w-full">Linked</span>}
                </button>
              ))}
            </div>
          </>
        )}

        {/* VIEW 2: THE UPLOAD PAGE */}
        {view === 'upload' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Admin: Upload Exam to Vault</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Target Set Number</label>
                <select name="setNumber" className="w-full p-3 bg-slate-50 border rounded-lg outline-blue-500">
                  {examSets.map(s => (
                    <option key={s.id} value={s.id}>{s.label} {s.fileName ? '(Overwrite)' : '(Empty)'}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Select PDF File</label>
                <input type="file" name="pdfFile" accept=".pdf" className="w-full p-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer" />
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={uploading} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
                  {uploading ? "Uploading to GitHub..." : "Upload & Link Set"}
                </button>
                <button type="button" onClick={() => setView('grid')} className="px-6 py-3 border rounded-lg font-bold">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 3: PDF VIEWER */}
        {pdfUrl && (
          <div className="max-w-5xl mx-auto bg-white p-4 shadow-2xl rounded-lg">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="font-bold text-slate-700 uppercase">{currentPaperName}</h2>
              <button onClick={() => setPdfUrl(null)} className="text-red-500 font-bold">Close Viewer</button>
            </div>
            <iframe src={pdfUrl} className="w-full h-[80vh] rounded" title="Viewer" />
          </div>
        )}

        {/* Fetching Overlay */}
        {fetchingPdf && (
           <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50 font-bold text-blue-600">
             Opening secure vault...
           </div>
        )}
      </div>
    </div>
  );
};

export default App;
