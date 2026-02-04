import React, { useState } from 'react';

// --- 1. SUBJECT CONTENT GENERATORS ---
const getSubjectQuestions = (subject, setId) => {
  let questions = [];
  const setBase = setId * 100;

  for (let i = 1; i <= 50; i++) {
    const qId = setBase + i;
    let q = { num: i, text: "", art: null };

    if (subject === "Mathematics") {
      const topics = ["Sets", "Fractions", "Money", "Time", "Geometry", "Addition"];
      const t = topics[qId % topics.length];
      if (t === "Sets") q.text = `Draw a set of ${(qId % 4) + 2} chairs:`;
      else if (t === "Fractions") q.text = `What is a half of ${(qId % 5 + 1) * 2}?`;
      else if (t === "Money") q.text = `How many 500 shilling coins make 1,000 shillings?`;
      else q.text = `Work out: ${10 + (qId % 20)} + ${5 + (qId % 5)} =`;
    } 
    
    else if (subject === "Science (Literacy 1)") {
      const topics = ["Human Body", "Sanitation", "Plants", "Weather"];
      const t = topics[qId % topics.length];
      if (t === "Human Body") q.text = `Name the part of the body used for seeing: __________`;
      else if (t === "Sanitation") q.text = `Why do we wash our hands after visiting a latrine? __________`;
      else if (t === "Plants") q.text = `Give one example of a fruit we eat: __________`;
      else q.text = `Which type of weather needs an umbrella? __________`;
    }

    else if (subject === "SST (Literacy 2)") {
      const topics = ["Home", "School", "Leadership", "People"];
      const t = topics[qId % topics.length];
      if (t === "Home") q.text = `Who is the head of a nuclear family? __________`;
      else if (t === "School") q.text = `Name the person who heads a school: __________`;
      else if (t === "Leadership") q.text = `Mention one local leader in our village: __________`;
      else q.text = `How do we show respect to elders? __________`;
    }

    else if (subject === "English") {
      const words = ["Table", "Flower", "Teacher", "School", "Pencil"];
      if (i % 2 === 0) q.text = `Write the plural of: ${words[qId % 5]} __________`;
      else q.text = `Use 'is' or 'are': The children ________ playing.`;
    }

    questions.push(q);
  }
  return questions;
};

const UgandaDigitalAcademy = () => {
  const [currentView, setCurrentView] = useState('subjects'); // 'subjects', 'sets', 'paper'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);

  const subjects = [
    { name: "Mathematics", icon: "🔢", color: "bg-blue-600" },
    { name: "Science (Literacy 1)", icon: "🌱", color: "bg-green-600" },
    { name: "SST (Literacy 2)", icon: "🌍", color: "bg-orange-600" },
    { name: "English", icon: "📚", color: "bg-purple-600" }
  ];

  // --- VIEW 1: SUBJECT SELECTION ---
  if (currentView === 'subjects') {
    return (
      <div className="p-10 bg-slate-50 min-h-screen font-sans">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 drop-shadow-sm">UGANDA DIGITAL ACADEMY</h1>
          <p className="text-xl font-bold text-slate-500 mt-2 uppercase tracking-[0.2em]">P.2 New Curriculum Portal</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {subjects.map((sub) => (
            <button
              key={sub.name}
              onClick={() => { setSelectedSubject(sub.name); setCurrentView('sets'); }}
              className="group p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all border-b-8 border-slate-200 hover:border-slate-400 transform hover:-translate-y-2 text-center"
            >
              <div className={`text-6xl mb-4 p-4 rounded-full inline-block ${sub.color} text-white`}>{sub.icon}</div>
              <h2 className="text-2xl font-black text-slate-800 uppercase">{sub.name}</h2>
              <p className="text-slate-400 font-bold mt-2">100 Unique Sets</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW 2: SET SELECTION ---
  if (currentView === 'sets') {
    return (
      <div className="p-10 bg-white min-h-screen">
        <button onClick={() => setCurrentView('subjects')} className="mb-8 font-black text-slate-400 hover:text-black">← CHANGE SUBJECT</button>
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-black text-slate-900 uppercase underline decoration-4 decoration-blue-500">{selectedSubject} SETS</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {Array.from({ length: 100 }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => { setSelectedSet(i + 1); setCurrentView('paper'); }}
              className="h-16 bg-slate-100 border-2 border-slate-200 rounded-lg hover:bg-black hover:text-white font-bold transition-all shadow-sm"
            >
              SET {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW 3: PRINTABLE PAPER ---
  const questions = getSubjectQuestions(selectedSubject, selectedSet);

  return (
    <div className="min-h-screen bg-zinc-200 p-4">
      <div className="no-print mb-4 flex justify-between max-w-[210mm] mx-auto bg-white p-4 rounded-lg shadow-xl">
        <button onClick={() => setCurrentView('sets')} className="font-bold underline">← Change Set</button>
        <div className="text-center">
            <p className="text-[10px] font-black uppercase text-blue-800">New Curriculum</p>
            <p className="text-xs font-bold">{selectedSubject}</p>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-black shadow-lg">PRINT PDF</button>
      </div>

      <div className="paper bg-white p-12 mx-auto w-[210mm] min-h-[297mm] shadow-2xl border-2 border-black relative">
        <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
          <h1 className="text-3xl font-black tracking-tight">UGANDA DIGITAL ACADEMY</h1>
          <h2 className="text-xl font-bold uppercase">{selectedSubject} - SET {selectedSet}</h2>
          <div className="flex justify-between mt-6 text-sm font-bold">
            <span>NAME: ____________________________________</span>
            <span>CLASS: P.2</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
          {questions.map((q) => (
            <div key={q.num} className="text-[12px] leading-tight border-b border-gray-100 pb-2 min-h-[40px]">
              <p><span className="font-bold">{q.num}.</span> {q.text}</p>
              <div className="mt-2 border-b border-black w-32 h-4 opacity-20"></div>
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
