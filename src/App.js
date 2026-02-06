import React, { useState } from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';

// --- VISUAL COMPONENTS (The "Art" for the questions) ---
const MathSVG = {
  SetObjects: ({ count, itemType }) => (
    <div className="border-2 border-purple-200 rounded-2xl p-4 w-40 h-28 flex items-center justify-center bg-white shadow-inner mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full ${itemType === 'stars' ? 'bg-yellow-400 shadow-[0_0_8px_orange]' : 'bg-blue-500'}`}></div>
        ))}
      </div>
    </div>
  ),
  FractionBox: ({ shaded, total, shape }) => (
    <div className="flex justify-center my-4">
      <div className={`flex border-4 border-black overflow-hidden ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`w-12 h-12 border-r-2 border-black last:border-r-0 ${i < shaded ? 'bg-blue-400' : 'bg-white'}`}></div>
        ))}
      </div>
    </div>
  )
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [previewData, setPreviewData] = useState(null);

  // LOGIC: Generate the 50 questions per set
  const generateQuestions = (setId) => {
    let questions = [];
    for (let i = 1; i <= 50; i++) {
      const seed = (setId * 100) + i;
      const topic = i % 5;
      let q = { q: "", ans: "", options: [], artType: null, artValue: null, shape: "" };

      switch(topic) {
        case 0: // SETS
          const memberCount = (seed % 4) + 2;
          const item = ["balls", "stars", "trees", "cups"][seed % 4];
          q.q = `Look at the picture. How many ${item} are in the set?`;
          q.ans = `${memberCount}`;
          q.options = [q.ans, `${memberCount + 1}`, "1", "9"].sort(() => Math.random() - 0.5);
          q.artType = "set_visual";
          q.artValue = { count: memberCount, item: item };
          break;
        case 1: // FRACTIONS
          const totalParts = (seed % 2 === 0) ? 2 : 4;
          q.q = `What fraction of the shape is shaded?`;
          q.ans = `1/${totalParts}`;
          q.options = [q.ans, "2/1", "1/1", "0/4"].sort(() => Math.random() - 0.5);
          q.artType = "fraction_visual";
          q.artValue = { shaded: 1, total: totalParts };
          q.shape = seed % 2 === 0 ? "circle" : "square"; 
          break;
        case 2: // ADDITION
          const n1 = (seed % 3) + 1;
          const n2 = (seed % 3) + 1;
          q.q = `Count the items and add: ${n1} + ${n2} =`;
          q.ans = `${n1 + n2}`;
          q.options = [q.ans, `${n1 + n2 + 1}`, "0", "10"].sort(() => Math.random() - 0.5);
          q.artType = "addition_visual";
          q.artValue = { val1: n1, val2: n2 };
          break;
        default: // NUMBERS
          const num = (seed % 20);
          q.q = `Which number comes after ${num}?`;
          q.ans = `${num + 1}`;
          q.options = [q.ans, `${num - 1}`, "21", "0"].sort(() => Math.random() - 0.5);
      }
      questions.push(q);
    }
    return questions;
  };

  const handlePreview = () => {
    const sampleSet = generateQuestions(1); 
    setPreviewData(sampleSet);
  };

  const uploadP1VisualSets = async () => {
    if (!window.confirm("Ready to update all 100 sets in the database?")) return;
    setLoading(true);
    const themes = ["Nature", "Home", "School", "Toys", "Animals"];

    for (let setId = 1; setId <= 100; setId++) {
      const questions = generateQuestions(setId);
      const theme = themes[setId % themes.length];
      const year = 1990 + setId - 1;

      await setDoc(doc(db, "UDA_EXAMS", `p1_mathematics_${year}`), {
        metadata: { class: "P1", subject: "MATHEMATICS", theme, setId, year: year.toString() },
        questions
      });
      setCount(setId);
    }
    setLoading(false);
    alert("Database updated with 100 Visual Sets!");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl p-6 md:p-12 border border-slate-100">
        <header className="text-center mb-12">
          <div className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-bold mb-4 uppercase tracking-widest">
            Production Ready
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
            UDA <span className="text-purple-600 text-outline">MERGE</span>
          </h1>
          <p className="text-slate-400 text-lg">Visual Question Engine & Database Sync</p>
        </header>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button 
            onClick={uploadP1VisualSets} 
            disabled={loading}
            className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold shadow-xl hover:bg-black hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? `UPDATING DB (${count}/100)...` : "⚡ SYNC TO FIREBASE"}
          </button>

          <button 
            onClick={handlePreview}
            className="w-full sm:w-auto bg-white text-purple-600 border-2 border-purple-600 px-10 py-5 rounded-2xl font-bold shadow-md hover:bg-purple-50 transition-all"
          >
            👁️ VIEW LIVE PREVIEW
          </button>
        </div>

        {previewData && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-black text-slate-900">Current Question Logic</h2>
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-bold">50 Questions Generated</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {previewData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
                  <span className="text-[0.65rem] font-bold text-purple-400 uppercase tracking-widest mb-2 block">P1 MATH • Q{idx + 1}</span>
                  <p className="text-xl font-bold text-slate-800 mb-6 leading-tight">{item.q}</p>
                  
                  <div className="mb-8 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                    {item.artType === 'set_visual' && <MathSVG.SetObjects count={item.artValue.count} itemType={item.artValue.item} />}
                    {item.artType === 'fraction_visual' && <MathSVG.FractionBox shaded={1} total={item.artValue.total} shape={item.shape} />}
                    {item.artType === 'addition_visual' && (
                      <div className="flex items-center justify-center gap-2">
                         <MathSVG.SetObjects count={item.artValue.val1} itemType="balls" />
                         <span className="text-2xl font-bold text-slate-400">+</span>
                         <MathSVG.SetObjects count={item.artValue.val2} itemType="balls" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {item.options.map(opt => (
                      <div key={opt} className={`p-4 text-center rounded-xl font-bold border-2 transition-all ${opt === item.ans ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 bg-white text-slate-400'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-300 font-medium italic">... and 46 more questions generated for this set.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
