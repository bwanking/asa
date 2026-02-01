import React, { useState } from 'react';

// --- 1. LIGHTWEIGHT ILLUSTRATION ENGINE (SVGs) ---
// Keeps repo under 500MB as requested
const MathIllustrations = {
  // A set of objects for counting (Topic: Sets)
  SetGroup: ({ count, shape }) => (
    <div className="flex justify-center border-2 border-dashed border-gray-400 p-4 my-3 rounded-lg bg-gray-50">
      <svg width="220" height="60" viewBox="0 0 220 60">
        {Array.from({ length: count }).map((_, i) => (
          shape === 'circle' ? 
          <circle key={i} cx={30 + i * 35} cy="30" r="12" stroke="black" fill="none" strokeWidth="2" /> :
          <rect key={i} x={20 + i * 35} y={15} width="25" height="25" stroke="black" fill="none" strokeWidth="2" />
        ))}
      </svg>
    </div>
  ),
  // P.2 Abacus for Place Value (H, T, O)
  Abacus: ({ h, t, o }) => (
    <div className="flex justify-center my-4">
      <svg width="120" height="100" viewBox="0 0 120 100">
        <line x1="30" y1="20" x2="30" y2="85" stroke="black" strokeWidth="2"/>
        <line x1="60" y1="20" x2="60" y2="85" stroke="black" strokeWidth="2"/>
        <line x1="90" y1="20" x2="90" y2="85" stroke="black" strokeWidth="2"/>
        <rect x="10" y="85" width="100" height="10" fill="#333"/>
        <text x="25" y="98" fontSize="10" className="font-bold">H</text>
        <text x="55" y="98" fontSize="10" className="font-bold">T</text>
        <text x="85" y="98" fontSize="10" className="font-bold">O</text>
        {/* Render beads for Ones (O) based on 'o' value */}
        {Array.from({ length: o }).map((_, i) => (
          <ellipse key={i} cx="90" cy={80 - i * 8} rx="8" ry="4" fill="white" stroke="black" />
        ))}
      </svg>
    </div>
  ),
  // Geometric Shapes for naming/drawing
  Shape: ({ type }) => {
    if (type === 'triangle') return <svg width="60" height="60" className="mx-auto my-2"><path d="M30 5 L55 55 L5 55 Z" stroke="black" fill="none" strokeWidth="2"/></svg>;
    if (type === 'rectangle') return <svg width="80" height="50" className="mx-auto my-2"><rect x="5" y="5" width="70" height="40" stroke="black" fill="none" strokeWidth="2"/></svg>;
    return <div className="h-20 w-20 border-2 border-black border-dashed mx-auto my-2"></div>;
  }
};

const UgandaDigitalAcademy = () => {
  const [selectedSet, setSelectedSet] = useState(null);

  // --- 2. GENERATOR LOGIC (Balanced for P.2 Curriculum) ---
  const generateQuestions = (setId) => {
    let questions = [];
    for (let i = 1; i <= 50; i++) {
      const seed = setId + i;
      let qData = { id: i, text: "", illustration: null };

      if (i <= 10) { // Topic: Sets
        const count = (seed % 4) + 2;
        qData.text = `Count and write the number of members in this set:`;
        qData.illustration = <MathIllustrations.SetGroup count={count} shape={seed % 2 === 0 ? 'circle' : 'rect'} />;
      } 
      else if (i <= 20) { // Topic: Numeration & Abacus
        if (i % 5 === 0) {
          qData.text = `Which number is shown on the ones (O) rod below?`;
          qData.illustration = <MathIllustrations.Abacus h={0} t={0} o={(seed % 6) + 1} />;
        } else {
          qData.text = `Write ${100 + (seed % 100)} in number names:`;
        }
      }
      else if (i <= 40) { // Topic: Operations (+ and -)
        qData.text = `Work out: ${30 + (seed % 20)} ${i % 2 === 0 ? '+' : '-'} ${10 + (seed % 10)} =`;
      }
      else { // Topic: Geometry & Drawing (Like the Baby Class file)
        qData.text = i === 50 ? "Shade the kite below carefully." : "Identify the shape drawn below:";
        qData.illustration = i === 50 ? <MathIllustrations.Shape type="kite" /> : <MathIllustrations.Shape type={seed % 2 === 0 ? 'triangle' : 'rectangle'} />;
      }
      questions.push(qData);
    }
    return questions;
  };

  // --- 3. DASHBOARD VIEW (All 100 Sets) ---
  if (selectedSet === null) {
    return (
      <div className="p-8 bg-blue-50 min-h-screen font-sans">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-blue-900 drop-shadow-sm">UGANDA DIGITAL ACADEMY</h1>
          <p className="text-xl text-blue-700 mt-2 font-bold uppercase tracking-widest">P.2 Mathematics Assessment Bank</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4 max-w-7xl mx-auto">
          {Array.from({ length: 100 }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setSelectedSet(i + 1)}
              className="h-24 flex flex-col items-center justify-center bg-white border-2 border-blue-200 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-md font-black text-lg"
            >
              <span className="text-xs uppercase opacity-60">Set</span>
              {String(i + 1).padStart(3, '0')}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- 4. INDIVIDUAL PAPER VIEW ---
  const questions = generateQuestions(selectedSet);

  return (
    <div className="min-h-screen bg-gray-200 p-4 sm:p-8">
      <div className="no-print mb-6 flex justify-between items-center max-w-[210mm] mx-auto">
        <button onClick={() => setSelectedSet(null)} className="bg-white px-6 py-2 rounded-lg font-bold shadow hover:bg-gray-100">← Back to Dashboard</button>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700">Print Paper</button>
      </div>

      <div className="paper bg-white shadow-2xl border-2 border-black p-12 mx-auto w-[210mm] min-h-[297mm]">
        {/* Header matched to your uploaded doc style */}
        <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
          <h1 className="text-3xl font-black uppercase">UGANDA DIGITAL ACADEMY</h1>
          <h2 className="text-xl font-bold">P.2 MATHEMATICS - SET {String(selectedSet).padStart(3, '0')}</h2>
          <div className="flex justify-between mt-6 px-4 font-bold">
            <span>NAME: ____________________________________</span>
            <span>CLASS: P.2</span>
          </div>
        </div>

        {/* 50 Questions Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-10">
          {questions.map((q) => (
            <div key={q.id} className="text-sm">
              <p className="leading-tight"><span className="font-bold">{q.id}.</span> {q.text}</p>
              {q.illustration}
              <div className="mt-2 border-b border-black w-32 h-4"></div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center font-bold border-t-2 border-black pt-4 italic">
          * END OF WORK - WELL DONE *
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .paper { border: none !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; }
          body { background: white !important; }
        }
        .paper { font-family: 'Times New Roman', serif; }
      `}</style>
    </div>
  );
};

export default UgandaDigitalAcademy;
