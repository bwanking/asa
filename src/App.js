import React, { useState } from 'react';


// Topics aligned with the Ugandan P.2 Thematic Curriculum
const TOPICS = ["Numbers", "Operations", "Geometry", "Measurement", "Sets"];

const App = () => {
  const [selectedSet, setSelectedSet] = useState(null);

  // Helper to generate specific questions for a set
  const generateQuestions = (setId) => {
    let questions = [];
    for (let i = 1; i <= 50; i++) {
      const topic = TOPICS[i % TOPICS.length];
      const seed = setId * i; // Deterministic generation
      
      let qText = "";
      if (topic === "Numbers") qText = `Write ${100 + (seed % 900)} in words.`;
      if (topic === "Operations") qText = `Work out: ${20 + (seed % 30)} + ${10 + (seed % 10)} =`;
      if (topic === "Geometry") qText = `Name the shape with 3 sides and 3 corners:`;
      if (topic === "Measurement") qText = `How many days make a week?`;
      if (topic === "Sets") qText = `Draw a set of ${2 + (seed % 5)} balls:`;

      questions.push({ id: i, text: qText, topic });
    }
    return questions;
  };

  // 1. Dashboard View (Selection Page)
  if (selectedSet === null) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen font-sans">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-black text-blue-900">UGANDA DIGITAL ACADEMY</h1>
          <p className="text-gray-600 mt-2">P.2 Mathematics Assessment Bank (100 Sets)</p>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4 max-w-6xl mx-auto">
          {Array.from({ length: 100 }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setSelectedSet(i + 1)}
              className="p-4 bg-white border-2 border-blue-100 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition shadow-sm font-bold text-blue-800"
            >
              SET {String(i + 1).padStart(3, '0')}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Individual Paper View
  const questions = generateQuestions(selectedSet);

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Navigation - Hidden during Print */}
      <div className="no-print mb-6 flex justify-between items-center max-w-[210mm] mx-auto">
        <button 
          onClick={() => setSelectedSet(null)}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 font-bold"
        >
          ← Back to All Sets
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow-lg"
        >
          Print Set {selectedSet}
        </button>
      </div>

      {/* The Actual Paper */}
      <div className="paper shadow-2xl border-2 border-black p-10 mx-auto w-[210mm] min-h-[297mm]">
        <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
          <h1 className="text-3xl font-black uppercase">UGANDA DIGITAL ACADEMY</h1>
          <h2 className="text-xl font-bold italic">P.2 MATHEMATICS - SET {String(selectedSet).padStart(3, '0')}</h2>
          <div className="flex justify-between mt-4 text-sm font-bold">
            <span>NAME: ________________________________</span>
            <span>CLASS: P.2</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-8">
          {questions.map((q) => (
            <div key={q.id} className="flex items-start">
              <span className="font-bold mr-2">{q.id}.</span>
              <div className="flex-1">
                <p className="text-lg">{q.text}</p>
                <div className="mt-4 border-b border-black w-1/2 h-4"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center font-bold border-t pt-4">
          * END OF SET {selectedSet} *
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .paper { border: none !important; box-shadow: none !important; margin: 0 !important; }
          body { background: white; }
        }
        .paper { font-family: 'Times New Roman', serif; }
      `}</style>
    </div>
  );
};

export default App;
