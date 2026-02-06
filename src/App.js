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
    try {
      for (let setId = 1; setId <= 100; setId++) {
        let paperQuestions = [];
        const setBase = setId * 500; 

        for (let i = 1; i <= 50; i++) {
          const qId = setBase + i;
          const topicSelector = (i + setId) % 10;
          let q = { q: "", ans: "", options: [], artType: null, artValue: null };

          switch(topicSelector) {
            case 0:
              const cnt = (qId % 4) + 3;
              const sName = ["K", "M", "P", "S", "Y"][qId % 5];
              q.q = `How many members are in Set ${sName} shown below?`;
              q.ans = `${cnt}`;
              q.options = [q.ans, `${cnt+1}`, "2", "10"];
              q.artType = "sets";
              q.artValue = { count: cnt, name: sName };
              break;
            case 1:
              const den = (qId % 2 === 0) ? 4 : 2;
              q.q = `Write the fraction for the unshaded part:`;
              q.ans = `1/${den}`;
              q.options = [q.ans, `${den}/1`, "1/3", "4/4"];
              q.artType = "fraction";
              q.artValue = { total: den };
              break;
            case 3:
              const side = (qId % 5) + 3;
              q.q = `Find the perimeter of the triangle (${side}cm):`;
              q.ans = `${side * 3}cm`;
              q.options = [q.ans, "10cm", "15cm", "20cm"];
              q.artType = "geometry";
              q.artValue = { type: 'triangle', val: side };
              break;
            default:
              q.q = `Work out: ${(qId % 10) + 5} + ${(qId % 5) + 2}`;
              q.ans = `${((qId % 10) + 5) + ((qId % 5) + 2)}`;
              q.options = [q.ans, "0", "100", "5"];
          }
          q.options = q.options.sort(() => Math.random() - 0.5);
          paperQuestions.push(q);
        }

        await setDoc(doc(db, "UDA_EXAMS", `p3_mathematics_${1990 + setId - 1}`), {
          metadata: { class: "P3", subject: "MATHEMATICS", totalQuestions: 50, year: (1990 + setId - 1).toString() },
          questions: paperQuestions
        });
      }
      alert("UPLOAD COMPLETE!");
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <h1 style={{ color: '#1a365d' }}>UDA P.3 MATH FACTORY</h1>
      
      <div style={{ margin: '20px 0', padding: '20px', backgroundColor: 'white', borderRadius: '15px', display: 'inline-block' }}>
        <button 
          onClick={uploadP3UniqueSets} 
          disabled={loading}
          style={{ padding: '15px 40px', backgroundColor: loading ? '#ccc' : '#e53e3e', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? "UPLOADING 5000 QNS..." : "🚀 START P3 UPLOAD"}
        </button>
      </div>

      {/* This section uses MathSVG to satisfy the linter and show you a preview */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ color: '#718096' }}>Asset Preview (Linter Check)</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', opacity: 0.6 }}>
          <MathSVG.SetObjects count={5} name="P" />
          <MathSVG.Fraction total={4} />
          <MathSVG.Geometry type="triangle" val={5} />
        </div>
      </div>
    </div>
  );
};

export default App;
