/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const App = () => {
  const [view, setView] = useState('grid'); 
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fetchingPdf, setFetchingPdf] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPaperName, setCurrentPaperName] = useState("");
  const [examSets, setExamSets] = useState([]);

  const GITHUB_TOKEN = "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"; 
  const OWNER = "bwanking";
  const REPO = "uda-exams-vault";

  // --- 1. LOAD DATA FROM FIREBASE ON START ---
  useEffect(() => {
    const loadSets = async () => {
      const querySnapshot = await getDocs(collection(db, "examMappings"));
      const savedData = [];
      querySnapshot.forEach((doc) => {
        savedData.push({ id: parseInt(doc.id), ...doc.data() });
      });
      
      // If Firebase is empty, show at least Set 1 & 2 as placeholders
      if (savedData.length === 0) {
        setExamSets([
          { id: 1, label: "Set 1", fileName: "" },
          { id: 2, label: "Set 2", fileName: "" }
        ]);
      } else {
        setExamSets(savedData.sort((a, b) => a.id - b.id));
      }
    };
    loadSets();
  }, []);

  // --- 2. ADMIN UPLOAD (SAVES TO GITHUB + FIREBASE) ---
  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.pdfFile.files[0];
    const setNumber = parseInt(e.target.setNumberInput.value);

    if (!file || !setNumber) return alert("Missing file or set number");

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        const fileName = file.name;

        // A. Upload to GitHub
        const ghResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(fileName)}`, {
          method: "PUT",
          headers: { Authorization: `Token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ message: `BitSoft Deploy Set ${setNumber}`, content: base64Content }),
        });

        if (ghResponse.ok) {
          // B. Save Mapping to Firebase (The "Glue" that survives refresh)
          const setRef = doc(db, "examMappings", setNumber.toString());
          await setDoc(setRef, {
            label: `Set ${setNumber}`,
            fileName: fileName,
            timestamp: new Date()
          });

          // C. Update Local State for immediate UI change
          setExamSets(prev => {
            const newSets = [...prev];
            const idx = newSets.findIndex(s => s.id === setNumber);
            if (idx > -1) newSets[idx].fileName = fileName;
            else newSets.push({ id: setNumber, label: `Set ${setNumber}`, fileName });
            return newSets.sort((a, b) => a.id - b.id);
          });

          alert("Set Permanently Saved!");
          setView('grid');
        }
      };
    } catch (err) { alert(err.message); } finally { setUploading(false); }
  };

  const fetchVaultPdf = async (fileName) => {
    if (!fileName) return alert("Set is empty.");
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
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#0a192f] text-white p-6 flex flex-col gap-8 shadow-xl">
        <h1 className="text-3xl italic font-bold text-blue-400">UDA</h1>
        <nav className="flex flex-col gap-4">
          <div onClick={() => {setView('grid'); setPdfUrl(null);}} className={`p-3 rounded-lg cursor-pointer ${view === 'grid' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>🐣 Nursery</div>
        </nav>
        <div className="mt-auto border-t border-slate-700 pt-6">
          <button onClick={() => setView('upload')} className="w-full p-3 bg-indigo-600 rounded-lg font-bold">📤 Admin Upload</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 relative">
        {view === 'grid' && !pdfUrl && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {examSets.map((set) => (
              <button key={set.id} onClick={() => fetchVaultPdf(set.fileName)} className={`p-6 rounded-xl border h-32 flex flex-col items-center justify-center gap-2 ${set.fileName ? 'bg-white border-blue-200 text-slate-700 font-bold shadow-sm' : 'bg-slate-100 text-slate-400 italic'}`}>
                {set.label}
                {set.fileName && <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full">BITSOFT</span>}
              </button>
            ))}
          </div>
        )}

        {view === 'upload' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border mt-10">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Permanent Vault Upload</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <input type="number" name="setNumberInput" placeholder="Set Number (e.g. 5)" className="p-3 border rounded-lg" required />
              <input type="file" name="pdfFile" accept=".pdf" className="p-2 border rounded-lg" required />
              <button type="submit" disabled={uploading} className="bg-blue-600 text-white p-3 rounded-lg font-bold">
                {uploading ? "Saving Forever..." : "Deploy & Save"}
              </button>
              <button type="button" onClick={() => setView('grid')} className="text-slate-500 text-sm">Cancel</button>
            </form>
          </div>
        )}

        {/* Branded Viewer with Mask */}
        {pdfUrl && (
          <div className="max-w-5xl mx-auto h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border-4 border-blue-600 overflow-hidden">
            <div className="p-4 bg-white flex justify-between items-center border-b">
              <h2 className="font-bold text-slate-800 tracking-tight">BITSOFT EXAMINATION SERIES</h2>
              <button onClick={() => setPdfUrl(null)} className="text-red-500 font-bold">Close Paper</button>
            </div>
            <div className="flex-1 relative">
              {/* BitSoft Branding Mask */}
              <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[85%] h-[120px] bg-white z-10 flex flex-col items-center justify-center pointer-events-none text-center">
                  <h1 className="text-3xl font-black text-black uppercase">BitSoft National Examinations</h1>
                  <p className="text-lg font-bold text-black border-y-2 border-black px-10 mt-1">BITSOFT ASSESSMENT BOARD</p>
              </div>
              <iframe src={pdfUrl} className="w-full h-full" title="BitSoft" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
