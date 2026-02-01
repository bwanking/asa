import React, { useState, useMemo } from 'react';

// --- 1. DYNAMIC SVG ENGINE (Illustrations) ---
const MathSVG = {
  // Generates different counts and shapes based on unique seeds
  SetGroup: ({ seed }) => {
    const count = (seed % 5) + 3; // 3 to 7 items
    const shapeType = seed % 3;
    return (
      <div className="flex justify-center border-2 border-dashed border-gray-400 p-2 my-2 rounded bg-slate-50">
        <svg width="180" height="50" viewBox="0 0 180 50">
          {Array.from({ length: count }).map((_, i) => (
            shapeType === 0 ? 
            <circle key={i} cx={25 + i * 30} cy="25" r="10" stroke="black" fill="none" strokeWidth="1.5" /> :
            <rect key={i} x={15 + i * 30} y={15} width="20" height="20" stroke="black" fill="none" strokeWidth="1.5" />
          ))}
        </svg>
      </div>
    );
  },
  // Generates an abacus with varying beads
  Abacus: ({ seed }) => {
    const ones = (seed % 9) + 1;
    return (
      <svg width="100" height="80" className="mx-auto my-1">
        <line x1="30" y1="10" x2="30" y2="70" stroke="black" strokeWidth="2"/>
        <line x1="60" y1="10" x2="60" y2="70" stroke="black" strokeWidth="2"/>
        <line x1="90" y1="10" x2="90" y2="70" stroke="black" strokeWidth="2"/>
        <rect x="10" y="70" width="80" height="8" fill="#333"/>
        {Array.from({ length: ones }).map((_, i) => (
          <ellipse key={i} cx="90" cy={65 - i * 6} rx="7" ry="3" fill="white" stroke="black" />
        ))}
      </svg>
    );
  }
};

const UgandaDigitalAcademy = () => {
  const [selectedSet, setSelectedSet] = useState(null);
  const [shuffleSeed, setShuffleSeed] = useState(1);

  // --- 2. THE GENERATOR (Uses Prime Multipliers for Uniqueness) ---
  const questions = useMemo(() => {
    if (selectedSet === null) return [];
    
    let qns = [];
    // Prime numbers (157, 397) ensure the sequence doesn't repeat for a long time
    const baseSeed = selectedSet * 157 * shuffleSeed;

    for (let i = 1; i <= 50; i++) {
      const qSeed = baseSeed + (i * 397);
      let q = { id: i, text: "", img: null };

      if (i <= 10) { // Topic: Sets
        q.text = "Count the members in the set:";
        q.img = <MathSVG.SetGroup seed={qSeed} />;
      } 
      else if (i <= 25) { // Topic: Numbers & Place Value
        if (i % 5 === 0) {
          q.text = "What number is on the Abacus?";
          q.img = <MathSVG.Abacus seed={qSeed} />;
        } else if (i % 2 === 0) {
          const val = 100 + (qSeed % 400);
          q.text = `Write ${val} in words:`;
        } else {
          const val = 10 + (qSeed % 80);
          q.text = `What is the place value of ${val.toString()[0]} in ${val}?`;
        }
      }
      else if (i <= 40) { // Topic: Operations
        const n1 = 30 + (qSeed % 60);
        const n2 = 10 + (qSeed % 20);
        q.text = qSeed % 2 === 0 ? `Work out: ${n1} + ${n2} =` : `Take away: ${n1} - ${n2} =`;
      }
      else { // Topic: Geometry/Drawing
        const items = ["triangle", "rectangle", "square", "kite", "ball", "tree"];
        const item = items[qSeed % items.length];
        q.text = `Draw and color a ${item}:`;
        q.img = <div className="h-20 w-32 border-2 border-black border-dashed mx-auto my-2"></div>;
      }
      qns.push(q);
    }
    return qns;
  }, [selectedSet, shuffleSeed]);

  // --- 3. DASHBOARD VIEW ---
  if (selectedSet === null) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-blue-900 mb-2">UGANDA DIGITAL ACADEMY</h1>
          <p className="font-bold text-blue-600">P.2 MATHEMATICS - 100 UNIQUE ASSESSMENT SETS</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 max-w-6xl mx-auto">
          {Array.from({ length: 100 }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setSelectedSet(i + 1)}
              className="h-16 bg-white border-2 border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all font-bold shadow-sm"
            >
              SET {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- 4. PAPER VIEW ---
  return (
    <div className="min-h-screen bg-zinc-200 p-4">
      <div className="no-print mb-6 flex justify-between items-center max-w-[210mm] mx-auto bg-white p-4 rounded-xl shadow">
        <button onClick={() => setSelectedSet(null)} className="font-bold text-gray-600">← Back</button>
        <button 
          onClick={() => setShuffleSeed(Math.floor(Math.random() * 1000))} 
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold"
        >
          🔀 SHUFFLE QUESTIONS
        </button>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg">PRINT PDF</button>
      </div>

      <div className="paper bg-white shadow-2xl border-2 border-black p-10 mx-auto w-[210mm] min-h-[297mm]">
        <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
          <h1 className="text-3xl font-black">UGANDA DIGITAL ACADEMY</h1>
          <h2 className="text-lg font-bold">P.2 MATHEMATICS ASSESSMENT - SET {selectedSet}</h2>
          <div className="flex justify-between mt-4 text-xs font-bold uppercase">
            <span>Name: ________________________________</span>
            <span>Class: P.2</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {questions.map((q) => (
            <div key={q.id} className="text-[12px] border-b border-gray-100 pb-1">
              <p><span className="font-bold">{q.id}.</span> {q.text}</p>
              {q.img}
              <div className="mt-1 border-b border-black w-20 h-4 ml-4"></div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-[10px] font-bold border-t pt-2 italic opacity-40">
          * END OF WORK - UGANDA DIGITAL ACADEMY *
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
