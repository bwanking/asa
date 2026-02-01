import React, { useState } from 'react';

// --- 1. DYNAMIC ILLUSTRATION ENGINE (SVG) ---
const MathSVG = {
  SetGroup: ({ count, shape, seed }) => (
    <div className="flex justify-center border-2 border-dashed border-gray-400 p-4 my-3 rounded-lg bg-gray-50">
      <svg width="220" height="60" viewBox="0 0 220 60">
        {Array.from({ length: count }).map((_, i) => (
          shape === 'circle' ? 
          <circle key={i} cx={30 + i * 35} cy="30" r={10 + (seed % 5)} stroke="black" fill="none" strokeWidth="2" /> :
          <rect key={i} x={20 + i * 35} y={15} width={20 + (seed % 10)} height={20 + (seed % 10)} stroke="black" fill="none" strokeWidth="2" />
        ))}
      </svg>
    </div>
  ),
  Abacus: ({ val, seed }) => (
    <div className="flex justify-center my-4">
      <svg width="120" height="100" viewBox="0 0 120 100">
        <line x1="30" y1="20" x2="30" y2="85" stroke="black" strokeWidth="2"/>
        <line x1="60" y1="20" x2="60" y2="85" stroke="black" strokeWidth="2"/>
        <line x1="90" y1="20" x2="90" y2="85" stroke="black" strokeWidth="2"/>
        <rect x="10" y="85" width="100" height="10" fill="#333"/>
        <text x="25" y="98" fontSize="10" className="font-bold">H</text>
        <text x="55" y="98" fontSize="10" className="font-bold">T</text>
        <text x="85" y="98" fontSize="10" className="font-bold">O</text>
        {Array.from({ length: val }).map((_, i) => (
          <ellipse key={i} cx="90" cy={80 - i * 8} rx="8" ry="4" fill={seed % 2 === 0 ? "gray" : "white"} stroke="black" />
        ))}
      </svg>
    </div>
  ),
  Shape: ({ type, seed }) => {
    const size = 40 + (seed % 20);
    if (type === 'triangle') return <svg width="80" height="80" className="mx-auto my-2"><path d={`M40 5 L${40+size/2} ${size} L${40-size/2} ${size} Z`} stroke="black" fill="none" strokeWidth="2"/></svg>;
    if (type === 'rectangle') return <svg width="100" height="60" className="mx-auto my-2"><rect x="10" y="10" width={size + 20} height={size} stroke="black" fill="none" strokeWidth="2"/></svg>;
    return <div className="h-20 w-20 border-2 border-black border-dashed mx-auto my-2"></div>;
  }
};

const UgandaDigitalAcademy = () => {
  const [selectedSet, setSelectedSet] = useState(null);

  // --- 2. UNIQUE QUESTION GENERATOR ---
  const generateQuestions = (setId) => {
    let questions = [];
    
    // Each set starts with a different base number to prevent repetition
    const setOffset = setId * 50; 

    for (let i = 1; i <= 50; i++) {
      const uniqueId = setOffset + i;
      let qData = { id: i, text: "", illustration: null };

      if (i <= 10) { // Topic: Sets
        const count = (uniqueId % 6) + 2; 
        const shape = uniqueId % 2 === 0 ? 'circle' : 'rect';
        qData.text = `Count and write the number of members in this set of ${shape}s:`;
        qData.illustration = <MathSVG.SetGroup count={count} shape={shape} seed={uniqueId} />;
      } 
      else if (i <= 20) { // Topic: Numeration
        if (i % 3 === 0) {
          const val = (uniqueId % 8) + 1;
          qData.text = `Write the number shown on the Ones rod:`;
          qData.illustration = <MathSVG.Abacus val={val} seed={uniqueId} />;
        } else {
          const num = 100 + (uniqueId % 899);
          qData.text = `Write ${num} in number names (words):`;
        }
      }
      else if (i <= 40) { // Topic: Operations
        const n1 = 20 + (uniqueId % 70);
        const n2 = 5 + (uniqueId % 15);
        const op = uniqueId % 2 === 0 ? '+' : '-';
        qData.text = `Work out: ${n1} ${op} ${n2} =`;
      }
      else { // Topic: Geometry & Measurement
        const shapes = ['triangle', 'rectangle', 'square'];
        const chosen = shapes[uniqueId % 3];
        qData.text = i === 50 ? "Draw a kite in the box and shade it:" : `Identify this ${chosen}:`;
        qData.illustration = i === 50 ? <MathSVG.Shape type="box" /> : <MathSVG.Shape type={chosen === 'square' ? 'rectangle' : chosen} seed={uniqueId} />;
      }
      questions.push(qData);
    }
    return questions;
  };

  if (selectedSet === null) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-black text-blue-900 mb-2">UGANDA DIGITAL ACADEMY</h1>
          <p className="text-blue-600 font-bold uppercase tracking-widest">P.2 Unique Assessment Portal (100 Balanced Sets)</p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 max-w-7xl mx-auto">
          {Array.from({ length: 100 }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setSelectedSet(i + 1)}
              className="group h-20 bg-white border-2 border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex flex-col items-center justify-center"
            >
              <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100 uppercase">Set</span>
              <span className="text-xl font-black">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const questions = generateQuestions(selectedSet);

  return (
    <div className="min-h-screen bg-zinc-100 p-4">
      <div className="no-print mb-6 flex justify-between items-center max-w-[210mm] mx-auto">
        <button onClick={() => setSelectedSet(null)} className="bg-white border px-4 py-2 rounded-lg font-bold">← Select Different Set</button>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg">Print Set {selectedSet}</button>
      </div>

      <div className="paper bg-white shadow-2xl border-2 border-black p-10 mx-auto w-[210mm] min-h-[297mm]">
        <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
          <h1 className="text-3xl font-black">UGANDA DIGITAL ACADEMY</h1>
          <h2 className="text-xl font-bold uppercase tracking-tighter">P.2 MATHEMATICS - UNIQUE SET {selectedSet}</h2>
          <div className="flex justify-between mt-6 text-xs font-bold uppercase">
            <span>Name: ____________________________________</span>
            <span>Stream: _________</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-8">
          {questions.map((q) => (
            <div key={q.id} className="text-[13px] leading-tight">
              <p><span className="font-bold">{q.id}.</span> {q.text}</p>
              {q.illustration}
              <div className="mt-2 border-b border-black w-24 h-4"></div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center font-bold border-t pt-4 text-xs italic opacity-50">
          Generated uniquely for Uganda Digital Academy Curriculum Standards
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
