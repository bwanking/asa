
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

const App = () => {
  const [view, setView] = useState('grid'); 
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fetchingPdf, setFetchingPdf] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ active: false, step: "", percent: 0 });
  const [examSets, setExamSets] = useState([]);

  // --- CONFIG ---
  const GITHUB_TOKEN = "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"; 
  const OWNER = "bwanking";
  const REPO = "uda-exams-vault";

  useEffect(() => {
    const loadSets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "examMappings"));
        const savedData = [];
        querySnapshot.forEach((doc) => {
          savedData.push({ id: parseInt(doc.id), ...doc.data() });
        });
        setExamSets(savedData.sort((a, b) => a.id - b.id));
      } catch (e) { console.error("Firebase load error", e); }
    };
    loadSets();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.pdfFile.files[0];
    const setNumber = e.target.setNumberInput.value;

    if (!file || !setNumber) return alert("Please select a file and set number.");

    setUploadStatus({ active: true, step: "Reading file...", percent: 20 });

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Content = reader.result.split(',')[1];
        const fileName = `${setNumber}_${file.name.replace(/\s+/g, '_')}`; // Unique name to prevent 60% hang

        setUploadStatus({ active: true, step: "Uploading to GitHub...", percent: 60 });

        // Check if file exists first to get SHA (required for overwriting/updating)
        const checkRes = await fetch(`https://api.api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(fileName)}`, {
            headers: { Authorization: `Token ${GITHUB_TOKEN}` }
        });
        
        let sha = null;
        if (checkRes.ok) {
            const fileData = await checkRes.json();
            sha = fileData.sha;
        }

        const ghResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(fileName)}`, {
          method: "PUT",
          headers: { 
            Authorization: `Token ${GITHUB_TOKEN}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ 
            message: `BitSoft Deploy Set ${setNumber}`, 
            content: base64Content,
            sha: sha // Include SHA if the file already exists
          }),
        });

        if (!ghResponse.ok) {
            const errorData = await ghResponse.json();
            throw new Error(`GitHub Error: ${errorData.message}`);
        }

        setUploadStatus({ active: true, step: "Updating Database...", percent: 90 });
        
        const setRef = doc(db, "examMappings", setNumber.toString());
        await setDoc(setRef, {
          label: `Set ${setNumber}`,
          fileName: fileName,
          timestamp: new Date()
        });

        setUploadStatus({ active: true, step: "Success!", percent: 100 });
        setTimeout(() => {
          setUploadStatus({ active: false, step: "", percent: 0 });
          window.location.reload(); // Force refresh to see new data
        }, 1000);

      } catch (err) {
        console.error(err);
        alert(`Upload Failed: ${err.message}`);
        setUploadStatus({ active: false, step: "", percent: 0 });
      }
    };
  };

  const fetchVaultPdf = async (fileName) => {
    setFetchingPdf(true);
    try {
      const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(fileName)}`, {
        headers: { Authorization: `Token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3.raw" },
      });
      const blob = await response.blob();
      setPdfUrl(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })));
    } catch (err) { alert("Error fetching PDF"); } finally { setFetchingPdf(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <div className="w-72 bg-[#0f172a] text-white p-8 flex flex-col shadow-2xl">
        <div className="mb-10">
          <h1 className="text-4xl font-black italic text-blue-500 tracking-tighter">UDA</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Branded by BitSoft</p>
        </div>
        
        <button onClick={() => {setView('grid'); setPdfUrl(null);}} className={`w-full text-left p-4 rounded-xl mb-4 transition ${view === 'grid' ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'hover:bg-slate-800'}`}>
          🐣 Nursery Papers
        </button>

        <div className="mt-auto">
          <button onClick={() => setView('upload')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all">
            📤 Admin Upload
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        {view === 'grid' && !pdfUrl && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {examSets.map((set) => (
              <button key={set.id} onClick={() => fetchVaultPdf(set.fileName)} className="group bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-400 transition-all flex flex-col items-center gap-3">
                <span className="text-lg font-bold text-slate-700">{set.label}</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase">BitSoft</span>
              </button>
            ))}
          </div>
        )}

        {view === 'upload' && (
          <div className="max-w-lg mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 mt-10">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Vault Deployment</h2>
            
            {uploadStatus.active ? (
              <div className="text-center py-10">
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-4">
                  <div className="bg-blue-600 h-full transition-all duration-700" style={{ width: `${uploadStatus.percent}%` }}></div>
                </div>
                <p className="font-bold text-blue-600 animate-pulse uppercase text-sm tracking-widest">{uploadStatus.step}</p>
              </div>
            ) : (
              <form onSubmit={handleUpload} className="space-y-6">
                <input type="number" name="setNumberInput" placeholder="Set Number" className="w-full p-4 border rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" required />
                <input type="file" name="pdfFile" accept=".pdf" className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition" required />
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-lg">Start Push to Vault</button>
                <button type="button" onClick={() => setView('grid')} className="w-full text-slate-400 font-bold">Cancel</button>
              </form>
            )}
          </div>
        )}

        {/* Branded Viewer */}
        {pdfUrl && (
          <div className="max-w-6xl mx-auto h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl border-[6px] border-blue-600 overflow-hidden relative">
            <div className="p-5 bg-white flex justify-between items-center border-b">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">B</div>
                  <h2 className="font-black text-slate-800 tracking-tight">BITSOFT EXAMINATION BOARD</h2>
               </div>
               <button onClick={() => setPdfUrl(null)} className="bg-red-50 text-red-500 px-6 py-2 rounded-xl font-black hover:bg-red-500 hover:text-white transition">CLOSE</button>
            </div>
            <div className="flex-1 relative">
                <div className="absolute top-[65px] left-1/2 -translate-x-1/2 w-[82%] h-[125px] bg-white z-10 flex flex-col items-center justify-center pointer-events-none text-center border-b-2 border-black">
                    <h1 className="text-4xl font-black text-black uppercase leading-tight">BitSoft National Examinations</h1>
                    <p className="text-xl font-bold text-black border-y-2 border-black px-12 mt-1">INTERNAL ASSESSMENT SERIES</p>
                </div>
                <iframe src={pdfUrl} className="w-full h-full" title="BitSoft" />
            </div>
          </div>
        )}
      </div>

      {fetchingPdf && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-blue-600">Accessing Secure Vault...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
