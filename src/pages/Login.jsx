import React, { useState } from 'react';


// --- 1. DYNAMIC ILLUSTRATION ENGINE (SVG) ---
const MathSVG = {
  SetObjects: ({ count, seed }) => (
    <div className="flex justify-center border-2 border-dashed border-gray-400 p-2 my-1 rounded bg-gray-50">
      <svg width="160" height="40" viewBox="0 0 160 40">
        {Array.from({ length: count }).map((_, i) => (
          <circle key={i} cx={20 + i * 25} cy="20" r="8" stroke="black" fill={seed % 2 === 0 ? "none" : "#eee"} strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  ),
  Abacus: ({ value }) => (
    <svg width="80" height="50" className="mx-auto my-1">
      <line x1="20" y1="5" x2="20" y2="40" stroke="black" strokeWidth="2"/>
      <line x1="40" y1="5" x2="40" y2="40" stroke="black" strokeWidth="2"/>
      <line x1="60" y1="5" x2="60" y2="40" stroke="black" strokeWidth="2"/>
      <rect x="5" y="40" width="70" height="6" fill="#000"/>
      {Array.from({ length: value }).map((_, i) => (
        <ellipse key={i} cx="60" cy={35 - i * 5} rx="6" ry="2.5" fill="white" stroke="black" />
      ))}
    </svg>
  ),
  ShapeBox: ({ type }) => (
    <div className="h-16 w-24 border border-black border-dotted mx-auto my-1 flex items-center justify-center italic text-[10px] text-gray-400">
      Draw {type} here
    </div>
  )
};

// --- 2. SUBJECT CONTENT GENERATORS ---
const getSubjectQuestions = (subject, setId) => {
  let questions = [];
  const setBase = setId * 100;

  for (let i = 1; i <= 50; i++) {
    const qId = setBase + i;
    let q = { num: i, text: "", art: null };

    if (subject === "Mathematics") {
      const topicSelector = i % 5;
      if (topicSelector === 1) {
        const cnt = (qId % 5) + 2;
        q.text = `How many members are in this set?`;
        q.art = <MathSVG.SetObjects count={cnt} seed={qId} />;
      } else if (topicSelector === 3) {
        const val = (qId % 6) + 1;
        q.text = `Show ${val} on the ones rod:`;
        q.art = <MathSVG.Abacus value={val} />;
      } else if (i > 40) {
        const shapes = ["Kite", "Triangle", "Rectangle", "Square"];
        const pick = shapes[qId % shapes.length];
        q.text = `Draw a ${pick} in the box:`;
        q.art = <MathSVG.ShapeBox type={pick} />;
      } else {
        q.text = `Work out: ${10 + (qId % 40)} + ${5 + (qId % 10)} =`;
      }
    } 
    
    else if (subject === "Science (Literacy 1)") {
      const topics = ["Human Body", "Sanitation", "Plants", "Weather"];
      const t = topics[qId % topics.length];
      if (t === "Human Body") q.text = `We use our _________ to taste food.`;
      else if (t === "Sanitation") q.text = `A __________ is used for bathing.`;
      else if (t === "Plants") q.text = `Name one thing plants need to grow: __________`;
      else q.text = `Which weather is best for drying clothes? __________`;
      if (i % 10 === 0) q.art = <MathSVG.ShapeBox type="item" />;
    }

    else if (subject === "SST (Literacy 2)") {
      const topics = ["Home", "School", "Leadership", "People"];
      const t = topics[qId % topics.length];
      if (t === "Home") q.text = `Who provides food for the family? __________`;
      else if (t === "School") q.text = `Name your school motto: ____________________`;
      else if (t === "Leadership") q.text = `Write one duty of a teacher: __________`;
      else q.text = `A ____________ is a place where we go to learn.`;
      if (i % 10 === 0) q.art = <MathSVG.ShapeBox type="map/picture" />;
    }

    else if (subject === "English") {
      if (i % 2 === 0) q.text = `Give the opposite of 'Boy': __________`;
      else q.text = `Fill in the missing letter: S_hool`;
    }

    questions.push(q);
  }
  return questions;
};

const UgandaDigitalAcademy = () => {
  const [currentView, setCurrentView] = useState('subjects'); 
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);

  const subjects = [
    { name: "Mathematics", icon: "🔢", color: "bg-blue-600" },
    { name: "Science (Literacy 1)", icon: "🌱", color: "bg-green-600" },
    { name: "SST (Literacy 2)", icon: "🌍", color: "bg-orange-600" },
    { name: "English", icon: "📚", color: "bg-purple-600" }
  ];

  if (currentView === 'subjects') {
    return (
      <div className="p-10 bg-slate-50 min-h-screen font-sans">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900">UGANDA DIGITAL ACADEMY</h1>
          <p className="text-xl font-bold text-slate-500 mt-2 uppercase">P.2 Assessment Portal</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {subjects.map((sub) => (
            <button
              key={sub.name}
              onClick={() => { setSelectedSubject(sub.name); setCurrentView('sets'); }}
              className="p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all border-b-8 border-slate-200 hover:border-slate-400 text-center"
            >
              <div className={`text-6xl mb-4 p-4 rounded-full inline-block ${sub.color} text-white`}>{sub.icon}</div>
              <h2 className="text-2xl font-black text-slate-800">{sub.name}</h2>
              <p className="text-slate-400 font-bold mt-2">100 Unique Sets</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === 'sets') {
    return (
      <div className="p-10 bg-white min-h-screen">
        <button onClick={() => setCurrentView('subjects')} className="mb-8 font-black text-slate-400 hover:text-black">← CHANGE SUBJECT</button>
        <h1 className="text-3xl font-black text-slate-900 uppercase mb-10">{selectedSubject} SETS</h1>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {Array.from({ length: 100 }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => { setSelectedSet(i + 1); setCurrentView('paper'); }}
              className="h-16 bg-slate-100 border-2 border-slate-200 rounded-lg hover:bg-black hover:text-white font-bold transition-all"
            >
              SET {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const questions = getSubjectQuestions(selectedSubject, selectedSet);

  return (
    <div className="min-h-screen bg-zinc-200 p-4">
      <div className="no-print mb-4 flex justify-between max-w-[210mm] mx-auto bg-white p-4 rounded-lg shadow-xl">
        <button onClick={() => setCurrentView('sets')} className="font-bold underline">← Back</button>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-black shadow-lg">PRINT PDF</button>
      </div>

      <div className="paper bg-white p-12 mx-auto w-[210mm] min-h-[297mm] shadow-2xl border-2 border-black">
        <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
          <h1 className="text-3xl font-black uppercase">UGANDA DIGITAL ACADEMY</h1>
          <h2 className="text-xl font-bold italic">{selectedSubject} - SET {selectedSet}</h2>
          <div className="flex justify-between mt-6 text-sm font-bold">
            <span>NAME: ____________________________________</span>
            <span>CLASS: P.2</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
          {questions.map((q) => (
            <div key={q.num} className="text-[12px] leading-tight border-b border-gray-50 pb-2">
              <p><span className="font-bold">{q.num}.</span> {q.text}</p>
              {q.art}
              <div className="mt-2 border-b border-black w-24 h-4 opacity-20"></div>
            </div>
          ))}
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
