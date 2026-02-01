import React, { useState } from 'react';

// --- 1. DYNAMIC SVG LIBRARY (No images, keeps repo <500MB) ---
const MathSVG = {
  SetObjects: ({ count, seed }) => (
    <div className="flex justify-center border-2 border-dashed border-gray-400 p-2 my-2 rounded-lg bg-gray-50">
      <svg width="200" height="40" viewBox="0 0 200 40">
        {Array.from({ length: count }).map((_, i) => (
          <circle key={i} cx={20 + i * 30} cy="20" r={8} stroke="black" fill={seed % 2 === 0 ? "none" : "#eee"} strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  ),
  Abacus: ({ value }) => (
    <svg width="80" height="60" className="mx-auto my-1">
      <line x1="20" y1="5" x2="20" y2="50" stroke="black" strokeWidth="2"/>
      <line x1="40" y1="5" x2="40" y2="50" stroke="black" strokeWidth="2"/>
      <line x1="60" y1="5" x2="60" y2="50" stroke="black" strokeWidth="2"/>
      <rect x="5" y="50" width="70" height="6" fill="#000"/>
      {Array.from({ length: value }).map((_, i) => (
        <ellipse key={i} cx="60" cy={45 - i * 5} rx="6" ry="2.5" fill="white" stroke="black" />
      ))}
    </svg>
  )
};

const UgandaDigitalAcademy = () => {
  const [selectedSet, setSelectedSet] = useState(null);

  // --- 2. THE UNIQUE CONTENT ENGINE ---
  const generateUniqueSet = (setId) => {
    let paperQuestions = [];
    
    // This creates a unique "starting point" for every set
    // Set 1 starts at 50, Set 2 starts at 100, Set 3 at 150...
    const setBase = setId * 50; 

    for (let i = 1; i <= 50; i++) {
      const qId = setBase + i; // This number is unique across all 5,000 questions
      let q = { num: i, text: "", art: null };

      // Distribute topics across the 50 questions
      if (i <= 10) { // TOPIC: SETS
        const count = (qId % 6) + 2;
        q.text = `How many circles are in this set?`;
        q.art = <MathSVG.SetObjects count={count} seed={qId} />;
      } 
      else if (i <= 20) { // TOPIC: NUMBERS
        if (i % 4 === 0) {
          const val = (qId % 9) + 1;
          q.text = `What digit is on the ones rod?`;
          q.art = <MathSVG.Abacus value={val} />;
        } else {
          const num = 100 + (qId % 700) + (i * 2);
          q.text = `Write ${num} in number names:`;
        }
      }
      else if (i <= 40) { // TOPIC: OPERATIONS
        const n1 = 20 + (qId % 50) + i;
        const n2 = 5 + (qId % 15);
        if (i % 2 === 0) {
          q.text = `Work out: ${n1} + ${n2} =`;
        } else {
          q.text = `Find the difference: ${n1 + 10} - ${n2} =`;
        }
      }
      else { // TOPIC: GEOMETRY & MEASUREMENT
        const items = ["Rectangle", "Triangle", "Square", "Kite", "Pot", "Tree", "Cup"];
        const pick = items[qId % items.length];
        q.text = `Draw a ${pick} in the box below:`;
        q.art = <div className="h-16 w-24 border border-black border-dotted mx-auto my-2"></div>;
      }
      paperQuestions.push(q);
    }
    return paperQuestions;
  };

  if (selectedSet === null) {
    return (
      <div className="p-10 bg-gray-100 min-h-screen">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-black text-blue-900">UGANDA DIGITAL ACADEMY</h1>
          <p className="text-lg font-bold text-gray-600">P.2 MATHEMATICS - 100 UNIQUE SETS</p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 max-w-6xl mx-auto">
          {Array.from({ length: 100 }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setSelectedSet(i + 1)}
              className="p-4 bg-white border-2 border-blue-800 rounded-lg hover:bg-blue-800 hover:text-white font-bold transition-all shadow"
            >
              SET {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const questions = generateUniqueSet(selectedSet);

  return (
    <div className="min-h-screen bg-zinc-300 p-4">
      <div className="no-print mb-4 flex justify-between max-w-[210mm] mx-auto bg-white p-4 rounded-lg shadow">
        <button onClick={() => setSelectedSet(null)} className="font-bold">← Back to Sets</button>
        <span className="font-black text-blue-800 tracking-widest">UDA P.2 PORTAL</span>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-1 rounded font-bold">Print Set {selectedSet}</button>
      </div>

      <div className="paper bg-white p-10 mx-auto w-[210mm] min-h-[297mm] shadow-2xl border-2 border-black">
        <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
          <h1 className="text-3xl font-black">UGANDA DIGITAL ACADEMY</h1>
          <h2 className="text-xl font-bold italic">MATHEMATICS ASSESSMENT - SET {selectedSet}</h2>
          <div className="flex justify-between mt-6 text-xs font-bold underline">
            <span>NAME: ____________________________________</span>
            <span>CLASS: P.2</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
          {questions.map((q) => (
            <div key={q.num} className="text-[11px] leading-tight">
              <p><span className="font-bold">{q.num}.</span> {q.text}</p>
              {q.art}
              <div className="mt-2 border-b border-black w-20 h-4 ml-4"></div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-[10px] font-bold border-t pt-2 italic">
          Generated via Uganda Digital Academy AI Engine (Standard Curriculum)
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .paper { border: none !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; }
        }
        .paper { font-family: 'Times New Roman', serif; }
      `}</style>
    </div>
  );
};

export default UgandaDigitalAcademy;
