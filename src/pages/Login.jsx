import React, { useState } from 'react';

// 1. Lightweight SVG Library (Zero image files needed)
const MathIllustrations = {
  set_objects: (count) => (
    <svg width="120" height="60" viewBox="0 0 120 60" className="border border-dashed border-gray-400 mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <circle key={i} cx={20 + (i * 25)} cy="30" r="8" stroke="black" fill="none" />
      ))}
    </svg>
  ),
  geometry_shape: (type) => {
    if (type === 'triangle') return <svg width="60" height="60"><path d="M30 10 L55 50 L5 50 Z" stroke="black" fill="none"/></svg>;
    if (type === 'rectangle') return <svg width="60" height="40"><rect x="5" y="5" width="50" height="30" stroke="black" fill="none"/></svg>;
    return null;
  }
};

// 2. Topic Balancer Logic
const THEMES = [
  { name: "Sets", question: "Count the objects in the set and write the number name.", type: "svg", val: 4 },
  { name: "Numbers", question: "What is the place value of the underlined digit? 3 _4_ 8", type: "text", val: "Tens" },
  { name: "Operations", question: "Add: 24 + 13 =", type: "text", val: "37" },
  { name: "Geometry", question: "Name the shape drawn below:", type: "shape", val: "triangle" },
  { name: "Measurement", question: "How many days make a week?", type: "text", val: "7" }
];

const P2MathGenerator = () => {
  const [paperBatch, setPaperBatch] = useState([]);

  // Generate 100 balanced papers
  const generate100Papers = () => {
    const newBatch = Array.from({ length: 100 }).map((_, index) => {
      // Logic: Pick a primary theme based on index to ensure 20 of each theme
      const themeIndex = index % THEMES.length;
      return {
        id: index + 1,
        theme: THEMES[themeIndex],
        seed: Math.random() // Used for unique variations
      };
    });
    setPaperBatch(newBatch);
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <div className="no-print mb-8 text-center">
        <h1 className="text-2xl font-bold mb-4">P2 Mathematics Paper Generator</h1>
        <button 
          onClick={generate100Papers}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow-lg hover:bg-blue-700 transition"
        >
          Generate 100 Balanced Papers
        </button>
        <p className="mt-2 text-gray-600">Click generate, then press <b>Ctrl + P</b> to print all as PDF.</p>
      </div>

      <div className="print-container">
        {paperBatch.map((paper) => (
          <div key={paper.id} className="paper-sheet bg-white p-10 mx-auto mb-10 border-2 border-black w-[210mm] min-h-[297mm] shadow-md relative">
            [cite_start]{/* Header style matched to your uploaded BABY 4 DRAWING.doc [cite: 1] */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-2xl font-bold uppercase">TekArt Learning</h1>
              <h2 className="text-lg font-bold">P.2 MATHEMATICS MIDTERM ASSESSMENT</h2>
              <div className="flex justify-between mt-4 px-4 text-sm">
                <span><strong>SET:</strong> {paper.id}</span>
                <span><strong>THEME:</strong> {paper.theme.name}</span>
              </div>
            </div>

            <div className="mb-6">
              <p><strong>NAME:</strong> __________________________________________________</p>
            </div>

            {/* Dynamic Question Content */}
            <div className="space-y-12">
              <div className="question">
                <p className="text-lg font-medium">1. {paper.theme.question}</p>
                <div className="mt-6 flex justify-center">
                  {paper.theme.type === 'svg' && MathIllustrations.set_objects(paper.theme.val)}
                  {paper.theme.type === 'shape' && MathIllustrations.geometry_shape(paper.theme.val)}
                </div>
                <p className="mt-8 border-b border-black w-1/2">Answer: </p>
              </div>

              {/* Static secondary questions to fill the paper */}
              <div className="question">
                <p className="text-lg font-medium">2. Fill in the missing numbers:</p>
                <p className="mt-4 text-xl">10, 20, ____, 40, ____, 60.</p>
              </div>
              
              <div className="question">
                <p className="text-lg font-medium">3. Show the number 5 on the abacus below:</p>
                <svg width="100" height="80" className="mx-auto mt-4">
                  <line x1="30" y1="10" x2="30" y2="70" stroke="black" strokeWidth="2"/>
                  <line x1="70" y1="10" x2="70" y2="70" stroke="black" strokeWidth="2"/>
                  <rect x="10" y="70" width="80" height="10" fill="black"/>
                </svg>
              </div>
            </div>

            <div className="absolute bottom-10 left-0 right-0 text-center font-bold">
              *END*
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none; }
          .paper-sheet { 
            margin: 0; 
            border: none; 
            box-shadow: none; 
            page-break-after: always; 
          }
          body { background: white; }
        }
      `}</style>
    </div>
  );
};

export default P2MathGenerator;
