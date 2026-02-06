import React, { useState } from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';

// --- 1. DYNAMIC PREVIEW ASSETS (Satisfies Linter) ---
const MathSVG = {
  SetObjects: ({ count, name }) => (
    <div className="flex flex-col items-center border-2 border-black p-2 my-1 rounded-full w-20 h-20 mx-auto bg-white relative">
      <span className="absolute -top-2 left-2 font-bold bg-white text-[10px]">Set {name}</span>
      <div className="grid grid-cols-3 gap-1 mt-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-2 h-2 bg-black rounded-full"></div>
        ))}
      </div>
    </div>
  ),
  Fraction: ({ total }) => (
    <svg width="40" height="40" className="mx-auto my-1">
      <rect x="5" y="5" width="30" height="30" stroke="black" fill="none" strokeWidth="2" />
      <line x1="20" y1="5" x2="20" y2="35" stroke="black" />
      {total > 2 && <line x1="5" y1="20" x2="35" y2="20" stroke="black" />}
    </svg>
  )
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadHighValueSets = async () => {
    setLoading(true);
    
    // THEMES for variety - each Set will prioritize different themes
    const themes = [
      { name: "The Farm", items: ["cows", "goats", "hens"], prices: [2000, 5000] },
      { name: "The Market", items: ["apples", "fish", "tomatoes"], prices: [500, 1000] },
      { name: "Our School", items: ["pencils", "desks", "books"], prices: [200, 1500] },
      { name: "The Kitchen", items: ["cups", "plates", "spoons"], prices: [300, 800] }
    ];

    for (let setId = 1; setId <= 100; setId++) {
      let paperQuestions = [];
      const currentTheme = themes[setId % themes.length];
      const year = 1990 + setId - 1;

      for (let i = 1; i <= 50; i++) {
        const seed = (setId * 50) + i;
        const topicSelector = (i + setId) % 8; // Rolling variety
        let q = { q: "", ans: "", options: [], artType: null, artValue: null };

        switch(topicSelector) {
          case 0: // SETS (Unique Objects)
            const count = (seed % 4) + 3;
            const obj = currentTheme.items[seed % 3];
            q.q = `Draw a set of ${count} ${obj}:`;
            q.ans = "drawing";
            q.options = ["Correct Drawing", "Wrong Count", "Empty Set", "Numbers"];
            q.artType = "sets";
            q.artValue = { count, name: obj.toUpperCase() };
            break;

          case 1: // FRACTIONS (Unique Shapes)
            const den = (seed % 2 === 0) ? 2 : 4;
            q.q = `In ${currentTheme.name}, half of the ${currentTheme.items[0]} are white. Shade the fraction:`;
            q.ans = `1/${den}`;
            q.options = [q.ans, "2/1", "1/10", "4/4"];
            q.artType = "fraction";
            q.artValue = { total: den };
            break;

          case 2: // MONEY (Unique Pricing)
            const price = currentTheme.prices[seed % 2];
            const qty = (seed % 3) + 2;
            q.q = `At ${currentTheme.name}, one ${currentTheme.items[1]} costs ${price} UGX. Find the cost of ${qty}:`;
            q.ans = `${price * qty}`;
            q.options = [q.ans, `${price}`, `${price + 100}`, "0"];
            break;

          case 3: // MEASUREMENT
            const unit = ["metres", "kilograms", "litres"][seed % 3];
            const val1 = (seed % 20) + 10;
            const val2 = (seed % 10) + 5;
            q.q = `Add ${val1}${unit} to ${val2}${unit}:`;
            q.ans = `${val1 + val2}${unit}`;
            q.options = [q.ans, `${val1}${unit}`, `${val2}${unit}`, "100"];
            break;

          default: // WORD PROBLEMS (Themed Storytelling)
            const n1 = 10 + (seed % 40);
            const n2 = 2 + (seed % 8);
            q.q = `There were ${n1} ${currentTheme.items[2]} in ${currentTheme.name}. ${n2} were broken. How many are left?`;
            q.ans = `${n1 - n2}`;
            q.options = [q.ans, `${n1 + n2}`, "0", "15"];
        }
        q.options = q.options.sort(() => Math.random() - 0.5);
        paperQuestions.push(q);
      }

      await setDoc(doc(db, "UDA_EXAMS", `p3_mathematics_${year}`), {
        metadata: { 
          class: "P3", 
          subject: "MATHEMATICS", 
          theme: currentTheme.name,
          year: year.toString(),
          setId: setId 
        },
        questions: paperQuestions
      });
      setProgress(setId);
    }
    setLoading(false);
    alert("SUCCESS: 100 Unique Commercial Sets Uploaded!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg">
        <h1 className="text-3xl font-black text-blue-900">UDA PRODUCT FACTORY</h1>
        <p className="text-gray-500 mt-2 font-medium">Generating High-Variety Commercial Sets (1-100)</p>
        
        <div className="my-8">
          <button 
            onClick={uploadHighValueSets} 
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-white font-black transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:scale-105'}`}
          >
            {loading ? `UPLOADING SET ${progress}/100...` : "🚀 GENERATE & UPLOAD PRODUCTS"}
          </button>
        </div>

        <div className="flex justify-center gap-4 opacity-30 pointer-events-none">
          <MathSVG.SetObjects count={3} name="A" />
          <MathSVG.Fraction total={4} />
        </div>
      </div>
    </div>
  );
};

export default App;
