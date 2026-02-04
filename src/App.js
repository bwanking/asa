import React, { useState } from 'react';


// --- 1. DYNAMIC SVG LIBRARY (P2 Visual Aids) ---
const MathSVG = {
  SetObjects: ({ count, type }) => (
    <div className="flex justify-center border-2 border-dotted border-gray-400 p-2 my-1 rounded bg-gray-50">
      <svg width="160" height="40" viewBox="0 0 160 40">
        {Array.from({ length: count }).map((_, i) => (
          type === 'star' ? 
          <polygon key={i} points={`${15+i*25},5 ${18+i*25},15 ${28+i*25},15 ${20+i*25},22 ${23+i*25},32 ${15+i*25},25 ${7+i*25},32 ${10+i*25},22 ${2+i*25},15 ${12+i*25},15`} fill="none" stroke="black" /> :
          <circle key={i} cx={15 + i * 25} cy="20" r="10" stroke="black" fill="none" />
        ))}
      </svg>
    </div>
  ),
  Fraction: ({ part, total }) => (
    <svg width="60" height="60" className="mx-auto my-1">
      <circle cx="30" cy="30" r="25" stroke="black" fill="none" />
      <line x1="30" y1="5" x2="30" y2="55" stroke="black" />
      {total > 2 && <line x1="5" y1="30" x2="55" y2="30" stroke="black" />}
      <path d="M30,30 L30,5 A25,25 0 0,1 55,30 Z" fill={part > 0 ? "#ccc" : "none"} stroke="black" />
    </svg>
  ),
  Clock: ({ hr, min }) => (
    <svg width="60" height="60" className="mx-auto my-1">
      <circle cx="30" cy="30" r="28" stroke="black" fill="none" strokeWidth="2" />
      <line x1="30" y1="30" x2="30" y2="10" stroke="black" strokeWidth="2" /> {/* Min hand */}
      <line x1="30" y1="30" x2="45" y2="30" stroke="black" strokeWidth="3" /> {/* Hour hand */}
    </svg>
  )
};

const UgandaDigitalAcademy = () => {
  const [selectedSet, setSelectedSet] = useState(null);

  const generateUniqueSet = (setId) => {
    let paperQuestions = [];
    const setBase = setId * 100; // Large jump to ensure variety

    for (let i = 1; i <= 50; i++) {
      const qId = setBase + i;
      let q = { num: i, text: "", art: null };

      // ROLLING TOPIC LOGIC - Each set will feel different
      const topicSelector = (i + setId) % 10; 

      switch(topicSelector) {
        case 0: // SETS
          const cnt = (qId % 4) + 3;
          q.text = `Form a set of ${cnt} ${qId % 2 === 0 ? 'cups' : 'balls'}:`;
          q.art = <div className="h-12 w-full border border-dashed border-gray-300 mt-1"></div>;
          break;
        case 1: // FRACTIONS
          q.text = `Shade a ${qId % 2 === 0 ? 'half' : 'quarter'} of this figure:`;
          q.art = <MathSVG.Fraction part={0} total={qId % 2 === 0 ? 2 : 4} />;
          break;
        case 2: // MONEY (UGX)
          const price = (qId % 5 + 1) * 100;
          q.text = `If one egg costs ${price} shillings, find the cost of 2 eggs:`;
          break;
        case 3: // TIME
          q.text = `Tell the time shown on the clock face below:`;
          q.art = <MathSVG.Clock />;
          break;
        case 4: // MEASUREMENT (Weight/Length)
          const items = ["ruler", "pencil", "bench"];
          q.text = `Which is longer, a ${items[qId % 3]} or a ${items[(qId+1)%3]}?`;
          break;
        case 5: // PLACE VALUE
          const num = 100 + (qId % 800);
          q.text = `What digit is in the ${qId % 2 === 0 ? 'Hundreds' : 'Tens'} place in ${num}?`;
          break;
        case 6: // WORD PROBLEMS (Addition/Subtraction)
          const names = ["Musa", "Alice", "Okello", "Babirye"];
          const fruit = ["mangoes", "oranges", "apples"];
          q.text = `${names[qId%4]} had ${20 + qId%10} ${fruit[qId%3]} and ate ${5 + qId%5}. How many are left?`;
          break;
        case 7: // GEOMETRY
          const shapes = ["Square", "Cylinder", "Cone", "Circle"];
          q.text = `Draw a ${shapes[qId % 4]} in the box:`;
          q.art = <div className="h-12 w-20 border border-black mx-auto mt-1"></div>;
          break;
        case 8: // PATTERNS
          const start = qId % 10;
          q.text = `Fill in the missing number: ${start}, ${start+2}, ${start+4}, ____`;
          break;
        default: // MENTAL MATH
          q.text = `Work out: ${(qId % 12) + 1} x 2 =`;
      }
      paperQuestions.push(q);
    }
    return paperQuestions;
  };

  if (selectedSet === null) {
    return (
      <div className="p-10 bg-blue-50 min-h-screen font-sans">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-black text-blue-900 drop-shadow-md">UGANDA DIGITAL ACADEMY</h1>
          <p className="text-xl font-bold text-blue-700 mt-2">P.2 Mathematics Curriculum Bank</p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-4 max-w-6xl mx-auto">
          {Array.from({ length: 100 }, (_, i) => (
            <button key={i+1} onClick={() => setSelectedSet(i+1)} className="p-4 bg-white border-2 border-blue-900 rounded-xl hover:bg-blue-900 hover:text-white font-black transition-all shadow-lg transform hover:scale-105">
              SET {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const questions = generateUniqueSet(selectedSet);

  return (
    <div className="min-h-screen bg-gray-400 p-4">
      <div className="no-print mb-4 flex justify-between max-w-[210mm] mx-auto bg-white p-4 rounded-lg shadow-xl">
        <button onClick={() => setSelectedSet(null)} className="font-bold text-blue-900 underline">← Back to Dashboard</button>
        <button onClick={() => window.print()} className="bg-green-600 text-white px-8 py-2 rounded-full font-black shadow-lg hover:bg-green-700">PRINT PAPER</button>
      </div>

      <div className="paper bg-white p-12 mx-auto w-[210mm] min-h-[297mm] shadow-2xl border-2 border-black relative">
        <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
          <h1 className="text-3xl font-black tracking-tight">UGANDA DIGITAL ACADEMY</h1>
          <h2 className="text-xl font-bold italic text-gray-800">P.2 MATHEMATICS END OF TERM - SET {selectedSet}</h2>
          <div className="flex justify-between mt-6 text-sm font-bold">
            <span>NAME: ____________________________________</span>
            <span>CLASS: P.2</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
          {questions.map((q) => (
            <div key={q.num} className="text-[11.5px] leading-tight border-b border-gray-100 pb-2">
              <p><span className="font-bold">{q.num}.</span> {q.text}</p>
              {q.art}
              <div className="mt-2 border-b border-black w-24 h-4 opacity-30"></div>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] font-bold opacity-40">
          © 2026 UGANDA DIGITAL ACADEMY - ALL RIGHTS RESERVED
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .paper { border: none !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; }
          body { background: white !important; }
        }
        .paper { font-family: 'Times New Roman', Times, serif; }
      `}</style>
    </div>
  );
};

export default UgandaDigitalAcademy;
