import React, { useState } from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';

// --- VISUAL COMPONENTS FOR PREVIEW ---
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

  // Function to generate the questions (used for both Preview and Upload)
  const generateQuestions = (setId) => {
    let questions = [];
    for (let i = 1; i <= 50; i++) {
      const seed = (setId * 100) + i;
      const topic = i % 5;
      let q = { q: "", ans: "", options: [], artType: null, artValue: null, shape: "" };

      switch(topic) {
        case 0:
          const memberCount = (seed % 4) + 2;
          const item = ["balls", "stars", "trees", "cups"][seed % 4];
          q.q = `Look at the picture. How many ${item} are in the set?`;
          q.ans = `${memberCount}`;
          q.options = [q.ans, `${memberCount + 1}`, "1", "9"].sort(() => Math.random() - 0.5);
          q.artType = "set_visual";
          q.artValue = { count: memberCount, item: item };
          break;
        case 1:
          const totalParts = (seed % 2 === 0) ? 2 : 4;
          q.q = `What fraction of the shape is shaded?`;
          q.ans = `1/${totalParts}`;
          q.options = [q.ans, "2/1", "1/1", "0/4"].sort(() => Math.random() - 0.5);
          q.artType = "fraction_visual";
          q.artValue = { shaded: 1, total: totalParts };
          q.shape = seed % 2 === 0 ? "circle" : "square"; 
          break;
        case 2:
          const n1 = (seed % 3) + 1;
          const n2 = (seed % 3) + 1;
          q.q = `Count the items and add: ${n1} + ${n2} =`;
          q.ans = `${n1 + n2}`;
          q.options = [q.ans, `${n1 + n2 + 1}`, "0", "10"].sort(() => Math.random() - 0.5);
          q.artType = "addition_visual";
          q.artValue = { val1: n1, val2: n2 };
          break;
        default:
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
    const sampleSet = generateQuestions(1); // Preview Set 1
    setPreviewData(sampleSet);
  };

  const uploadP1VisualSets = async () => {
    if (!window.confirm("This will upload 100 sets to Firebase. Continue?")) return;
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
    alert("Success! 100 Sets are now in Firebase.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 mb-2">
            UDA FACTORY V2.1
          </h1>
          <p className="text-gray-400 font-medium">Visual Exam Architect for Primary One</p>
        </header>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button 
            onClick={uploadP1VisualSets} 
            disabled={loading}
            className="bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? `Uploading ${count}/100...` : "🚀 PUSH TO FIREBASE"}
          </button>

          <button 
            onClick={handlePreview}
            className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-2xl font-bold shadow-md hover:bg-purple-50 transition-colors"
          >
            👁️ VIEW PREVIEW
          </button>
        </div>

        {previewData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold border-b pb-2">Previewing Set 1 (First 5 Questions)</h2>
            <div className="grid gap-6">
              {previewData.slice(0, 5).map((item, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-purple-500 uppercase">Question {idx + 1}</span>
                  <p className="text-lg font-semibold mb-4">{item.q}</p>
                  
                  {/* VISUALS SECTION */}
                  <div className="mb-6">
                    {item.artType === 'set_visual' && <MathSVG.SetObjects count={item.artValue.count} itemType={item.artValue.item} />}
                    {item.artType === 'fraction_visual' && <MathSVG.FractionBox shaded={1} total={item.artValue.total} shape={item.shape} />}
                    {item.artType === 'addition_visual' && (
                      <div className="flex items-center justify-center gap-4">
                         <MathSVG.SetObjects count={item.artValue.val1} itemType="balls" />
                         <span className="text-3xl font-bold">+</span>
                         <MathSVG.SetObjects count={item.artValue.val2} itemType="balls" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {item.options.map(opt => (
                      <div key={opt} className={`p-3 text-center rounded-xl border-2 ${opt === item.ans ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
