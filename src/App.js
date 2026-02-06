import React, { useState } from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';

// --- 1. DYNAMIC SVG LIBRARY (P3 Visual Aids) ---
const MathSVG = {
  SetObjects: ({ count, name }) => (
    <div className="flex flex-col items-center border-2 border-black p-2 my-1 rounded-full w-24 h-24 mx-auto bg-white relative">
      <span className="absolute -top-2 left-2 font-bold bg-white px-1">Set {name}</span>
      <div className="grid grid-cols-3 gap-1 mt-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-3 h-3 bg-black rounded-full"></div>
        ))}
      </div>
    </div>
  ),
  Fraction: ({ total }) => (
    <svg width="60" height="60" className="mx-auto my-1">
      <rect x="5" y="5" width="50" height="50" stroke="black" fill="none" strokeWidth="2" />
      <line x1="30" y1="5" x2="30" y2="55" stroke="black" />
      {total > 2 && <line x1="5" y1="30" x2="55" y2="30" stroke="black" />}
    </svg>
  ),
  Geometry: ({ type, val }) => (
    <svg width="80" height="60" className="mx-auto my-1">
      {type === 'rectangle' ? (
        <rect x="10" y="15" width="60" height="30" stroke="black" fill="none" strokeWidth="2" />
      ) : (
        <polygon points="40,5 5,55 75,55" stroke="black" fill="none" strokeWidth="2" />
      )}
      <text x="40" y="58" fontSize="10" textAnchor="middle">{val}cm</text>
    </svg>
  )
};

const App = () => {
  const [loading, setLoading] = useState(false);

  const uploadP3UniqueSets = async () => {
    setLoading(true);
    console.log("🚀 Starting P3 High-Variety Upload...");

    for (let setId = 1; setId <= 100; setId++) {
      let paperQuestions = [];
      const setBase = setId * 500; 

      for (let i = 1; i <= 50; i++) {
        const qId = setBase + i;
        const topicSelector = (i + setId) % 10; // Rolling Topic Logic
        
        let q = { 
          q: "", 
          ans: "", 
          options: [], 
          artType: null, 
          artValue: null 
        };

        switch(topicSelector) {
          case 0: // SET THEORY
            const cnt = (qId % 4) + 3;
            const sName = ["K", "M", "P", "S", "Y"][qId % 5];
            q.q = `How many members are in Set ${sName} shown below?`;
            q.ans = `${cnt}`;
            q.options = [q.ans, `${cnt+1}`, "2", "10"];
            q.artType = "sets";
            q.artValue = { count: cnt, name: sName };
            break;

          case 1: // FRACTIONS
            const den = (qId % 2 === 0) ? 4 : 2;
            q.q = `Write the fraction for the unshaded part of the figure:`;
            q.ans = `1/${den}`;
            q.options = [q.ans, `${den}/1`, "1/3", "4/4"];
            q.artType = "fraction";
            q.artValue = { total: den };
            break;

          case 2: // MONEY (P3 level)
            const price = (qId % 5 + 2) * 100;
            q.q = `If a lush costs ${price} shillings, how much change will you get from 1,000 shillings?`;
            q.ans = `${1000 - price}`;
            q.options = [q.ans, `${price}`, "100", "500"];
            break;

          case 3: // GEOMETRY (Area/Perimeter)
            const side = (qId % 5) + 3;
            q.q = `Find the perimeter of the triangle shown below with sides of ${side}cm each:`;
            q.ans = `${side * 3}cm`;
            q.options = [q.ans, `${side * 2}cm`, `${side * side}cm`, "15cm"];
            q.artType = "geometry";
            q.artValue = { type: 'triangle', val: side };
            break;

          case 4: // PLACE VALUE (Up to thousands)
            const num = 1000 + (qId % 8999);
            const places = ["Ones", "Tens", "Hundreds", "Thousands"];
            const pSel = qId % 4;
            q.q = `Which digit is in the ${places[pSel]} place in the number ${num}?`;
            const numStr = num.toString().split('').reverse();
            q.ans = numStr[pSel];
            q.options = [q.ans, numStr[(pSel+1)%4], "0", "9"];
            break;

          case 5: // CAPACITY / WEIGHT
            const ltr = (qId % 5) + 2;
            q.q = `How many half-litre bottles can fill a ${ltr} litre jerrycan?`;
            q.ans = `${ltr * 2}`;
            q.options = [q.ans, `${ltr}`, `${ltr + 2}`, "10"];
            break;

          case 6: // WORD PROBLEMS
            const names = ["Musa", "Alice", "Okello", "Babirye"];
            const n = 50 + (qId % 50);
            const m = 10 + (qId % 20);
            q.q = `${names[qId%4]} had ${n} sweets. If he gave ${m} to his friend, how many did he keep?`;
            q.ans = `${n - m}`;
            q.options = [q.ans, `${n + m}`, "40", "100"];
            break;

          case 7: // MULTIPLICATION / DIVISION
            const fact1 = (qId % 5) + 2;
            const fact2 = (qId % 4) + 3;
            q.q = `Work out: ${fact1} x ${fact2} = ____`;
            q.ans = `${fact1 * fact2}`;
            q.options = [q.ans, `${fact1 + fact2}`, "12", "20"];
            break;

          case 8: // PATTERNS
            const start = qId % 20;
            const gap = (qId % 3) + 2;
            q.q = `Find the next number in the pattern: ${start}, ${start+gap}, ${start+(gap*2)}, ____`;
            q.ans = `${start + (gap*3)}`;
            q.options = [q.ans, `${start + (gap*4)}`, "50", "0"];
            break;

          default: // ALGEBRA
            const box = (qId % 10) + 1;
            const res = 20 + (qId % 10);
            q.q = `Find the value of x: x + ${res - box} = ${res}`;
            q.ans = `${box}`;
            q.options = [q.ans, `${res}`, "5", "10"];
        }
        
        // Shuffle the options array
        q.options = q.options.sort(() => Math.random() - 0.5);
        paperQuestions.push(q);
      }

      try {
        await setDoc(doc(db, "UDA_EXAMS", `p3_mathematics_${1990 + setId - 1}`), {
          metadata: {
            class: "P3",
            subject: "MATHEMATICS",
            totalQuestions: 50,
            updatedAt: new Date().toISOString(),
            year: (1990 + setId - 1).toString()
          },
          questions: paperQuestions
        });
        console.log(`✅ Uploaded Set ${setId}`);
      } catch (err) {
        console.error("Error:", err);
        break;
      }
    }
    setLoading(false);
    alert("P3 MATH: 100 UNIQUE SETS UPLOADED!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-10">
      <h1 className="text-4xl font-black text-blue-900 mb-6 text-center">UDA P.3 MATH FACTORY</h1>
      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md">
        <p className="mb-6 text-gray-600 font-bold">This will generate 100 sets (5,000 unique questions) with rolling topics and SVG illustrations.</p>
        <button 
          onClick={uploadP3UniqueSets} 
          disabled={loading}
          className={`px-10 py-4 rounded-full text-white font-black text-xl transition-all shadow-lg ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700 hover:scale-105'}`}
        >
          {loading ? "UPLOADING..." : "🚀 START UPLOAD"}
        </button>
      </div>
    </div>
  );
};

export default App;
