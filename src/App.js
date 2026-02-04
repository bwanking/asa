import React, { useState } from 'react';

const P2_MATH_TOPICS = [
  "Numbers and Place Values", "Addition and Subtraction", "Geometry", 
  "Measurement", "Sets", "Graphs and Data"
];

const MathGenerator = () => {
  const [activePaper, setActivePaper] = useState(null);

  // Function to generate a random math problem based on topic
  const generateQuestion = (topic, qNum, paperId) => {
    const seed = paperId + qNum; // Ensures variety across different papers
    
    switch (topic) {
      case "Numbers and Place Values":
        const num = 100 + (seed % 400);
        return { q: `What is the place value of ${num.toString()[1]} in ${num}?`, a: "Tens" };
      case "Addition and Subtraction":
        const a = 10 + (seed % 50);
        const b = 5 + (seed % 20);
        return { q: `Work out: ${a} + ${b} = `, a: a + b };
      case "Geometry":
        const shapes = ["triangle", "rectangle", "square", "circle"];
        const shape = shapes[seed % 4];
        return { q: `Draw a ${shape} in the box below:`, a: "", isDrawing: true };
      case "Measurement":
        return { q: `How many months are in a year?`, a: "12" };
      default:
        return { q: `Write ${seed + 10} in words.`, a: "" };
    }
  };

  const createPaper = (id) => {
    const questions = [];
    for (let i = 1; i <= 50; i++) {
      const topic = P2_MATH_TOPICS[i % P2_MATH_TOPICS.length];
      questions.push(generateQuestion(topic, i, id));
    }
    return { id, questions };
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="no-print bg-white p-6 rounded shadow mb-10 text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">UGANDA DIGITAL ACADEMY</h1>
        <p className="mb-4">Generate 100 sets of 50 questions for P.2 Mathematics</p>
        <button 
          onClick={() => setActivePaper(Array.from({ length: 100 }, (_, i) => createPaper(i + 1)))}
          className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition"
        >
          Generate All 100 Papers
        </button>
        {activePaper && (
          <button onClick={handlePrintAll} className="ml-4 bg-gray-800 text-white px-8 py-3 rounded-full">
            Print to PDF
          </button>
        )}
      </div>

      <div className="print-area">
        {activePaper?.map((paper) => (
          <div key={paper.id} className="paper-page bg-white p-12 mx-auto mb-10 border-2 border-black w-[210mm] min-h-[297mm] shadow-lg relative page-break">
            {/* Header matched to your requirement */}
            <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
              <h1 className="text-3xl font-black uppercase tracking-widest">UGANDA DIGITAL ACADEMY</h1>
              <h2 className="text-xl font-bold mt-2">P.2 MATHEMATICS END OF TERM ASSESSMENT</h2>
              <div className="flex justify-between mt-6 px-10 font-bold">
                <span>SET: {paper.id.toString().padStart(3, '0')}</span>
                <span>DURATION: 2 HOURS</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-6 text-sm">
              {paper.questions.map((q, index) => (
                <div key={index} className="border-b border-gray-200 pb-2">
                  <p className="font-semibold">{index + 1}. {q.q}</p>
                  {q.isDrawing ? (
                    <div className="h-16 w-full border border-dashed border-gray-300 mt-2"></div>
                  ) : (
                    <div className="mt-4 border-b border-black w-20"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="absolute bottom-10 left-0 right-0 text-center font-bold text-xs">
              © UGANDA DIGITAL ACADEMY - NEW CURRICULUM STANDARDS
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none; }
          .page-break { page-break-after: always; border: none; box-shadow: none; margin: 0; }
          body { background: white; }
        }
        .paper-page { font-family: 'Times New Roman', Times, serif; }
      `}</style>
    </div>
  );
};

export default MathGenerator;
