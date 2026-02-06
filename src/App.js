import React, { useState } from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';



// --- VISUAL COMPONENTS (Matches your App.jsx Engine) ---
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
    const setBase = setId * 100;

    for (let i = 1; i <= 50; i++) {
      const qId = setBase + i;
      let q = { q: "", ans: "", options: [], artType: null, artValue: null, shape: "" };

      // --- ALTERNATING TOPIC LOGIC (Copied from your P.2 example) ---
      const topicSelector = (i + setId) % 10; 

      switch(topicSelector) {
        case 0: // SETS
          const cnt = (qId % 4) + 3;
          const item = ["balls", "stars", "cups", "pots"][qId % 4];
          q.q = `Look at the picture. How many ${item} are in the set?`;
          q.ans = `${cnt}`;
          q.artType = "set_visual";
          q.artValue = { count: cnt, item: item };
          break;

        case 1: // FRACTIONS
          const den = (qId % 2 === 0) ? 2 : 4;
          q.q = `What fraction of the shape is shaded?`;
          q.ans = `1/${den}`;
          q.artType = "fraction_visual";
          q.artValue = { shaded: 1, total: den };
          q.shape = qId % 2 === 0 ? "circle" : "square";
          break;

        case 2: // MONEY (Ugandan Shillings)
          const price = (qId % 5 + 1) * 100;
          q.q = `If a pencil costs ${price} shillings, find the cost of 2 pencils:`;
          q.ans = `${price * 2}`;
          break;

        case 3: // TIME
          const hours = (qId % 12) + 1;
          q.q = `It is ${hours} o'clock. Is this time in the morning or night?`;
          q.ans = "Morning";
          q.options = ["Morning", "Night", "Afternoon", "Evening"];
          break;

        case 4: // MEASUREMENT
          q.q = `Which one is heavier, a Jerrycan of water or a plastic cup?`;
          q.ans = `Jerrycan`;
          q.options = ["Jerrycan", "Cup", "Both", "None"];
          break;

        case 5: // PLACE VALUE
          const val = (qId % 20) + 10;
          const t = Math.floor(val / 10);
          const o = val % 10;
          q.q = `What number is shown by ${t} tens and ${o} ones?`;
          q.ans = `${val}`;
          break;

        case 6: // ADDITION VISUAL
          const n1 = (qId % 3) + 1;
          const n2 = (qId % 3) + 2;
          q.q = `Count the items and add: ${n1} + ${n2} =`;
          q.ans = `${n1 + n2}`;
          q.artType = "addition_visual";
          q.artValue = { val1: n1, val2: n2 };
          break;

        case 7: // GEOMETRY
          const shapes = ["Circle", "Triangle", "Square", "Rectangle"];
          const selected = shapes[qId % 4];
          q.q = `Identify the shape: This is a ______________`;
          q.ans = selected;
          break;

        case 8: // PATTERNS
          const start = qId % 10;
          q.q = `Fill in the missing number: ${start}, ${start+2}, ${start+4}, ____`;
          q.ans = `${start + 6}`;
          break;

        default: // NUMBER NAMES
          const num = (qId % 10) + 1;
          const names = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
          q.q = `Write the number ${num} in words:`;
          q.ans = names[num];
      }

      // --- AUTO-GENERATE OPTIONS ---
      if (q.options.length === 0) {
        const correct = q.ans;
        const d1 = isNaN(correct) ? "None" : parseInt(correct) + 1;
        const d2 = isNaN(correct) ? "Both" : parseInt(correct) + 5;
        const d3 = isNaN(correct) ? "All" : 0;
        q.options = [correct, `${d1}`, `${d2}`, `${d3}`].sort(() => Math.random() - 0.5);
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
    alert("Database updated with alternating sets!");
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8 font-serif">
      <div className="max-w-4xl mx-auto mb-8 bg-white p-6 rounded-xl shadow-lg">
         <h1 className="text-2xl font-bold mb-4">UDA Question Paper Generator (Alternating)</h1>
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
        <div className="max-w-[800px] mx-auto bg-white p-12 shadow-2xl border-2 border-gray-300">
          <div className="text-center border-b-4 border-black pb-4 mb-6">
            <h1 className="text-3xl font-black uppercase">UDA Primary School Examinations</h1>
            <p className="font-bold text-lg">P.1 Mathematics Curriculum Assessment</p>
          </div>
          <div className="space-y-12">
            {previewData.slice(0, 10).map((item, idx) => (
              <div key={idx} className="pb-4">
                <p className="text-xl font-medium mb-6">{idx + 1}. {item.q}</p>
                <div className="mb-6">
                  {item.artType === 'set_visual' && <MathSVG.SetObjects count={item.artValue.count} itemType={item.artValue.item} />}
                  {item.artType === 'fraction_visual' && <MathSVG.FractionBox shaded={1} total={item.artValue.total} shape={item.shape} />}
                  {item.artType === 'addition_visual' && (
                    <div className="flex items-center gap-4">
                       <MathSVG.SetObjects count={item.artValue.val1} itemType="balls" />
                       <span className="text-4xl">+</span>
                       <MathSVG.SetObjects count={item.artValue.val2} itemType="balls" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {item.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="w-8 h-8 border-2 border-black rounded-full flex items-center justify-center text-sm font-bold">{String.fromCharCode(97 + i)}</div>
                       <span className="text-lg underline underline-offset-4 decoration-dotted">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
