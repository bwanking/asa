import React, { useState } from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';

// --- VISUAL COMPONENTS ---
const MathSVG = {
  SetObjects: ({ count, itemType }) => (
    <div className="border-2 border-slate-300 rounded-2xl p-4 w-40 h-28 flex items-center justify-center bg-white mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full ${itemType === 'stars' ? 'bg-yellow-400' : 'bg-blue-500'}`}></div>
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

  const generateQuestions = (setId) => {
    let questions = [];
    for (let i = 1; i <= 50; i++) {
      const seed = (setId * 100) + i;
      const topic = i % 5;
      let q = { q: "", ans: "", options: [], artType: null, artValue: null, shape: "" };
      if (topic === 0) {
          const memberCount = (seed % 4) + 2;
          const item = ["balls", "stars", "trees", "cups"][seed % 4];
          q.q = `Look at the picture. How many ${item} are in the set?`;
          q.ans = `${memberCount}`;
          q.options = [q.ans, `${memberCount + 1}`, "1", "9"].sort(() => Math.random() - 0.5);
          q.artType = "set_visual";
          q.artValue = { count: memberCount, item: item };
      } else if (topic === 1) {
          const totalParts = (seed % 2 === 0) ? 2 : 4;
          q.q = `What fraction of the shape is shaded?`;
          q.ans = `1/${totalParts}`;
          q.options = [q.ans, "2/1", "1/1", "0/4"].sort(() => Math.random() - 0.5);
          q.artType = "fraction_visual";
          q.artValue = { shaded: 1, total: totalParts };
          q.shape = seed % 2 === 0 ? "circle" : "square"; 
      } else if (topic === 2) {
          const n1 = (seed % 3) + 1;
          const n2 = (seed % 3) + 1;
          q.q = `Count the items and add: ${n1} + ${n2} =`;
          q.ans = `${n1 + n2}`;
          q.options = [q.ans, `${n1 + n2 + 1}`, "0", "10"].sort(() => Math.random() - 0.5);
          q.artType = "addition_visual";
          q.artValue = { val1: n1, val2: n2 };
      } else {
          const num = (seed % 20);
          q.q = `Which number comes after ${num}?`;
          q.ans = `${num + 1}`;
          q.options = [q.ans, `${num - 1}`, "21", "0"].sort(() => Math.random() - 0.5);
      }
      questions.push(q);
    }
    return questions;
  };

  const handlePreview = () => setPreviewData(generateQuestions(1));

  const uploadP1VisualSets = async () => {
    setLoading(true);
    for (let setId = 1; setId <= 100; setId++) {
      const year = 1990 + setId - 1;
      await setDoc(doc(db, "UDA_EXAMS", `p1_mathematics_${year}`), {
        metadata: { class: "P1", subject: "MATHEMATICS", setId, year: year.toString() },
        questions: generateQuestions(setId)
      });
      setCount(setId);
    }
    setLoading(false);
    alert("Database updated!");
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8 font-serif">
      {/* CONTROL PANEL - HIDDEN ON PRINT */}
      <div className="max-w-4xl mx-auto mb-8 bg-white p-6 rounded-xl shadow-lg print:hidden">
         <h1 className="text-2xl font-bold mb-4">UDA Question Paper Generator</h1>
         <div className="flex gap-4">
            <button onClick={uploadP1VisualSets} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
               {loading ? `Uploading ${count}%` : "Push to Database"}
            </button>
            <button onClick={handlePreview} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold">
               Preview Format
            </button>
         </div>
      </div>

      {previewData && (
        <div className="max-w-[800px] mx-auto bg-white p-12 shadow-2xl border-2 border-gray-300 min-h-screen">
          {/* --- OFFICIAL HEADER --- */}
          <div className="text-center border-b-4 border-black pb-4 mb-6">
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20 bg-blue-900 text-white flex items-center justify-center rounded-full text-2xl font-black">UDA</div>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight">UDA Primary School Examinations</h1>
            <p className="font-bold text-lg">P.1 Mathematics Termly Assessment</p>
          </div>

          {/* --- STUDENT INFO FIELDS --- */}
          <div className="grid grid-cols-2 gap-y-4 mb-8 text-sm font-bold uppercase">
            <div className="border-b border-dotted border-black pb-1">NAME: _________________________________________</div>
            <div className="border-b border-dotted border-black pb-1 pl-4">STREAM: __________________</div>
            <div className="border-b border-dotted border-black pb-1">DATE: _________________________________________</div>
            <div className="border-b border-dotted border-black pb-1 pl-4">SIGN: __________________</div>
          </div>

          {/* --- INSTRUCTIONS --- */}
          <div className="border-2 border-black p-4 mb-8">
            <p className="font-black underline mb-2 italic">Instructions to Learners:</p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Read all questions carefully before answering.</li>
              <li>Answer all questions in the spaces provided.</li>
              <li>Calculators are not allowed.</li>
              <li>Use a sharp pencil for drawing and shading.</li>
            </ul>
          </div>

          {/* --- QUESTIONS SECTION --- */}
          <div className="space-y-12">
            {previewData.slice(0, 10).map((item, idx) => (
              <div key={idx} className="relative pb-4">
                <div className="flex gap-4">
                  <span className="font-black text-xl">{idx + 1}.</span>
                  <div className="flex-1">
                    <p className="text-xl font-medium mb-6">{item.q}</p>
                    
                    {/* Visual Asset */}
                    <div className="mb-6">
                      {item.artType === 'set_visual' && <MathSVG.SetObjects count={item.artValue.count} itemType={item.artValue.item} />}
                      {item.artType === 'fraction_visual' && <MathSVG.FractionBox shaded={1} total={item.artValue.total} shape={item.shape} />}
                      {item.artType === 'addition_visual' && (
                        <div className="flex items-center justify-start gap-4">
                           <MathSVG.SetObjects count={item.artValue.val1} itemType="balls" />
                           <span className="text-4xl">+</span>
                           <MathSVG.SetObjects count={item.artValue.val2} itemType="balls" />
                        </div>
                      )}
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-2 gap-4">
                      {item.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <div className="w-8 h-8 border-2 border-black rounded-full flex items-center justify-center text-sm font-bold">
                              {String.fromCharCode(97 + i)}
                           </div>
                           <span className="text-lg underline underline-offset-4 decoration-dotted">{opt} ______________</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="mt-20 pt-4 border-t border-black text-center font-bold text-sm italic">
            "Education is the key to Success" - UDA Examination Board
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
