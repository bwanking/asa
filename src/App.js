import React, { useState } from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';


// --- 1. ASSET PREVIEW (Linter Fix & Visual Test) ---
const MathSVG = {
  SetObjects: ({ count, itemType }) => (
    <div className="border-2 border-black rounded-3xl p-4 w-32 h-24 flex items-center justify-center bg-white relative mx-auto">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full ${itemType === 'star' ? 'bg-yellow-400' : 'bg-blue-500'}`}></div>
        ))}
      </div>
    </div>
  ),
  FractionBox: ({ shaded, total }) => (
    <div className="flex justify-center my-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`w-8 h-8 border-2 border-black ${i < shaded ? 'bg-gray-400' : 'bg-white'}`}></div>
      ))}
    </div>
  )
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const uploadP1VisualSets = async () => {
    setLoading(true);
    const themes = ["Nature", "Home", "School", "Toys", "Animals"];

    for (let setId = 1; setId <= 100; setId++) {
      let questions = [];
      const theme = themes[setId % themes.length];
      const year = 1990 + setId - 1;

      for (let i = 1; i <= 50; i++) {
        const seed = (setId * 100) + i;
        const topic = i % 5;
        let q = { q: "", ans: "", options: [], artType: null, artValue: null };

        switch(topic) {
          case 0: // VISUAL SETS
            const memberCount = (seed % 4) + 2;
            const item = ["balls", "stars", "trees", "cups"][seed % 4];
            q.q = `Look at the picture. How many ${item} are in the set?`;
            q.ans = `${memberCount}`;
            q.options = [q.ans, `${memberCount + 1}`, "1", "9"].sort(() => Math.random() - 0.5);
            q.artType = "set_visual";
            q.artValue = { count: memberCount, item: item };
            break;

          case 1: // VISUAL FRACTIONS
            const totalParts = (seed % 2 === 0) ? 2 : 4;
            q.q = `What fraction of the shape is shaded?`;
            q.ans = `1/${totalParts}`;
            q.options = [q.ans, "2/1", "1/1", "0/4"].sort(() => Math.random() - 0.5);
            q.artType = "fraction_visual";
            q.artValue = { shaded: 1, total: totalParts };
            break;

          case 2: // ADDITION WITH PICTURES
            const n1 = (seed % 3) + 1;
            const n2 = (seed % 3) + 1;
            q.q = `Count the items and add: ${n1} + ${n2} =`;
            q.ans = `${n1 + n2}`;
            q.options = [q.ans, `${n1 + n2 + 1}`, "0", "10"].sort(() => Math.random() - 0.5);
            q.artType = "addition_visual";
            q.artValue = { val1: n1, val2: n2 };
            break;

          default: // BASIC NUMBER WORK
            const num = (seed % 20);
            q.q = `Which number comes after ${num}?`;
            q.ans = `${num + 1}`;
            q.options = [q.ans, `${num - 1}`, "21", "0"].sort(() => Math.random() - 0.5);
        }
        questions.push(q);
      }

      await setDoc(doc(db, "UDA_EXAMS", `p1_mathematics_${year}`), {
        metadata: { class: "P1", subject: "MATHEMATICS", theme, setId, year: year.toString() },
        questions
      });
      setCount(setId);
    }
    setLoading(false);
    alert("100 Visual Sets Uploaded!");
  };

  return (
    <div className="p-10 text-center font-sans">
      <h1 className="text-4xl font-black mb-4">P1 VISUAL PRODUCT FACTORY</h1>
      <p className="mb-8 text-gray-500">Creating 100 sets with heavy illustrations for P1 learners.</p>
      
      <button 
        onClick={uploadP1VisualSets} 
        disabled={loading}
        className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-purple-700"
      >
        {loading ? `Uploading Set ${count}...` : "🚀 PUSH 100 VISUAL SETS"}
      </button>

      <div className="mt-12 opacity-40">
        <p className="text-xs font-bold uppercase tracking-widest">Visual Asset Previews</p>
        <div className="flex justify-center gap-8 mt-4">
          <MathSVG.SetObjects count={4} itemType="star" />
          <MathSVG.FractionBox shaded={1} total={4} />
        </div>
      </div>
    </div>
  );
};

export default App;
