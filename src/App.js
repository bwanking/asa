
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

const App = () => {
  const [view, setView] = useState('grid'); 
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fetchingPdf, setFetchingPdf] = useState(false);
  
  // --- ENHANCED UPLOAD STATE ---
  const [uploadStatus, setUploadStatus] = useState({ 
    active: false, 
    step: "", 
    percent: 0 
  });

  const [currentPaperName, setCurrentPaperName] = useState("");
  const [examSets, setExamSets] = useState([]);

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
        setExamSets(savedData.length === 0 ? [
          { id: 1, label: "Set 1", fileName: "" },
          { id: 2, label: "Set 2", fileName: "" }
        ] : savedData.sort((a, b) => a.id - b.id));
      } catch (e) { console.error("Firebase load error", e); }
    };
    loadSets();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.pdfFile.files[0];
    const setNumber = parseInt(e.target.setNumberInput.value);

    if (!file || !setNumber) return alert("Missing file or set number");

    // Initialize Progress
    setUploadStatus({ active: true, step: "Reading PDF data...", percent: 10 });

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        setUploadStatus({ active: true, step: "Connecting to BitSoft Vault...", percent: 30 });
        
        const base64Content = reader.result.split(',')[1];
        const fileName = file.name;

        // GitHub Upload Step
        setUploadStatus({ active: true, step: "Uploading file to GitHub...", percent: 60 });
        const ghResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(fileName)}`, {
          method: "PUT",
          headers: { Authorization: `Token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ message: `BitSoft Deploy Set ${setNumber}`, content: base64Content }),
        });

        if (ghResponse.ok) {
          setUploadStatus({ active: true, step: "Finalizing database link...", percent: 90 });
          
          const setRef = doc(db, "examMappings", setNumber.toString());
          await setDoc(setRef, {
            label: `Set ${setNumber}`,
            fileName: fileName,
            timestamp: new Date()
          });

          setExamSets(prev => {
            const newSets = [...prev];
            const idx = newSets.findIndex(s => s.id === setNumber);
            if (idx > -1) newSets[idx].fileName = fileName;
            else newSets.push({ id: setNumber, label: `Set ${setNumber}`, fileName });
            return newSets.sort((a, b) => a.id - b.id);
          });

          setUploadStatus({ active: true, step: "Done!", percent: 100 });
          setTimeout(() => {
            setUploadStatus({ active: false, step: "", percent: 0 });
            setView('grid');
          }, 800);
        } else {
          throw new Error("GitHub rejected the file.");
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) { 
      alert(err.message); 
      setUploadStatus({ active: false, step: "", percent: 0 });
    }
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
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#0a192f] text-white p-6 flex flex-col gap-8 shadow-xl">
        <h1 className="text-3xl italic font-bold text-blue-400">UDA</h1>
        <nav className="flex flex-col gap-4">
          <div onClick={() => {setView('grid'); setPdfUrl(null);}} className={`p-3 rounded-lg cursor-pointer transition ${view === 'grid' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>🐣 Nursery</div>
        </nav>
        <div className="mt-auto border-t border-slate-700 pt-6">
          <button onClick={() => setView('upload')} className="w-full p-3 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700">📤 Admin Upload</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 relative">
        {view === 'grid' && !pdfUrl && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {examSets.map((set) => (
              <button key={set.id} onClick={() => fetchVaultPdf(set.fileName)} className={`p-6 rounded-xl border h-32 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${set.fileName ? 'bg-white border-blue-200 text-slate-700 font-bold shadow-sm hover:shadow-md' : 'bg-slate-100 text-slate-400 italic'}`}>
                {set.label}
                {set.fileName && <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">BitSoft Verified</span>}
              </button>
            ))}
          </div>
        )}

        {view === 'upload' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border mt-10">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Permanent Vault Upload</h2>
            
            {/* --- PROGRESS OVERLAY --- */}
            {uploadStatus.active ? (
              <div className="py-10 flex flex-col items-center text-center">
                <div className="w-full bg-slate-100 h-4 rounded-full mb-4 overflow-hidden border">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-500 ease-out" 
                    style={{ width: `${uploadStatus.percent}%` }}
                  ></div>
                </div>
                <p className="font-bold text-blue-600 animate-pulse">{uploadStatus.step}</p>
                <p className="text-xs text-slate-400 mt-2">{uploadStatus.percent}% Completed</p>
              </div>
            ) : (
              <form onSubmit={handleUpload} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Set Number</label>
                  <input type="number" name="setNumberInput" placeholder="e.g. 5" className="w-full p-3 border rounded-lg mt-1" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">PDF Document</label>
                  <input type="file" name="pdfFile" accept=".pdf" className="w-full p-2 border-2 border-dashed rounded-lg mt-1" required />
                </div>
                <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg font-bold mt-4">
                  Start Deployment
                </button>
                <button type="button" onClick={() => setView('grid')} className="text-slate-500 text-sm">Cancel</button>
              </form>
            )}
          </div>
        )}

        {/* Viewer with Mask */}
        {pdfUrl && (
          <div className="max-w-5xl mx-auto h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border-4 border-blue-600 overflow-hidden">
            <div className="p-4 bg-white flex justify-between items-center border-b">
              <h2 className="font-bold text-slate-800">BITSOFT EXAMINATION SERIES</h2>
              <button onClick={() => setPdfUrl(null)} className="bg-red-50 text-red-600 px-4 py-1 rounded-full font-bold">Close</button>
            </div>
            <div className="flex-1 relative">
              <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[85%] h-[120px] bg-white z-10 flex flex-col items-center justify-center pointer-events-none">
                  <h1 className="text-3xl font-black text-black uppercase">BitSoft National Examinations</h1>
                  <p className="text-lg font-bold text-black border-y-2 border-black px-10 mt-1 uppercase">Assessment Board</p>
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
