import React, { useState } from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';

// --- VISUAL COMPONENTS (Matches your App.jsx Engine) ---
const MathSVG = {
  SetObjects: ({ count, itemType }) => (
    <div className="border-2 border-slate-300 rounded-2xl p-4 w-40 h-28 flex items-center justify-center bg-white mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full ${itemType === 'stars' ? 'bg-yellow-400' : 'bg-blue-500'}`}></div>
        ))}
      </div>
    </div>
  ),
  FractionBox: ({ shaded, total, shape }) => (
    <div className="flex justify-center my-4">
      <div className={`flex border-4 border-black overflow-hidden ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`w-12 h-12 border-r-2 border-black last:border-r-0 ${i < shaded ? 'bg-blue-400' : 'bg-white'}`}></div>
        ))}
      </div>
    </div>
  )
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [previewData, setPreviewData] = useState(null);
  
  // PDF State
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fetchingPdf, setFetchingPdf] = useState(false);

  // --- GITHUB FETCH LOGIC (Updated for Inline Viewing) ---
  const fetchPrivatePdf = async () => {
    setFetchingPdf(true);
    const GITHUB_TOKEN = "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"; 
    const OWNER = "bwanking";
    const REPO = "uda-exams-vault";
    const FILE_PATH = "BABY MID TERM II NUMBERS - 2023.pdf"; 

    try {
      // Step 1: Get the file metadata (including base64 content)
      const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(FILE_PATH)}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json", 
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch PDF data.");

      const data = await response.json();
      
      // Step 2: GitHub returns content in base64. 
      // We create a Data URI which browsers prefer for inline embedding.
      const base64Content = data.content.replace(/\n/g, ''); // Remove newlines
      const dataUri = `data:application/pdf;base64,${base64Content}`;
      
      setPdfUrl(dataUri);
      setPreviewData(null); 
    } catch (error) {
      console.error("Error fetching PDF:", error);
      alert("Error loading PDF: " + error.message);
    } finally {
      setFetchingPdf(false);
    }
  };

  const generateQuestions = (setId) => {
    let questions = [];
    const setBase = setId * 100;

    for (let i = 1; i <= 50; i++) {
      const qId = setBase + i;
      let q = { q: "", ans: "", options: [], artType: null, artValue: null, shape: "" };
      const topicSelector = (i + setId) % 10; 

      switch(topicSelector) {
        case 0: 
          const cnt = (qId % 4) + 3;
          const item = ["balls", "stars", "cups", "pots"][qId % 4];
          q.q = `Look at the picture. How many ${item} are in the set?`;
          q.ans = `${cnt}`;
          q.artType = "set_visual";
          q.artValue = { count: cnt, item: item };
          break;
        case 1: 
          const den = (qId % 2 === 0) ? 2 : 4;
          q.q = `What fraction of the shape is shaded?`;
          q.ans = `1/${den}`;
          q.artType = "fraction_visual";
          q.artValue = { shaded: 1, total: den };
          q.shape = qId % 2 === 0 ? "circle" : "square";
          break;
        case 2: 
          const price = (qId % 5 + 1) * 100;
          q.q = `If a pencil costs ${price} shillings, find the cost of 2 pencils:`;
          q.ans = `${price * 2}`;
          break;
        case 3: 
          const hours = (qId % 12) + 1;
          q.q = `It is ${hours} o'clock. Is this time in the morning or night?`;
          q.ans = "Morning";
          q.options = ["Morning", "Night", "Afternoon", "Evening"];
          break;
        case 4: 
          q.q = `Which one is heavier, a Jerrycan of water or a plastic cup?`;
          q.ans = `Jerrycan`;
          q.options = ["Jerrycan", "Cup", "Both", "None"];
          break;
        case 5: 
          const val = (qId % 20) + 10;
          const t = Math.floor(val / 10);
          const o = val % 10;
          q.q = `What number is shown by ${t} tens and ${o} ones?`;
          q.ans = `${val}`;
          break;
        case 6: 
          const n1 = (qId % 3) + 1;
          const n2 = (qId % 3) + 2;
          q.q = `Count the items and add: ${n1} + ${n2} =`;
          q.ans = `${n1 + n2}`;
          q.artType = "addition_visual";
          q.artValue = { val1: n1, val2: n2 };
          break;
        case 7: 
          const shapes = ["Circle", "Triangle", "Square", "Rectangle"];
          const selected = shapes[qId % 4];
          q.q = `Identify the shape: This is a ______________`;
          q.ans = selected;
          break;
        case 8: 
          const start = qId % 10;
          q.q = `Fill in the missing number: ${start}, ${start+2}, ${start+4}, ____`;
          q.ans = `${start + 6}`;
          break;
        default: 
          const num = (qId % 10) + 1;
          const names = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
          q.q = `Write the number ${num} in words:`;
          q.ans = names[num];
      }

      if (q.options.length === 0) {
        const correct = q.ans;
        const d1 = isNaN(correct) ? "None" : parseInt(correct) + 1;
        const d2 = isNaN(correct) ? "Both" : parseInt(correct) + 5;
        const d3 = isNaN(correct) ? "All" : 0;
        q.options = [correct, `${d1}`, `${d2}`, `${d3}`].sort(() => Math.random() - 0.5);
      }
      questions.push(q);
    }
    return questions;
  };

  const handlePreview = () => {
    setPdfUrl(null);
    setPreviewData(generateQuestions(1));
  };

  const uploadP1VisualSets = async () => {
    setLoading(true);
    for (let setId = 1; setId <= 100; setId++) {
      const year = 1990 + setId - 1;
      await setDoc(doc(db, "UDA_EXAMS", `p1_mathematics_${year}`), {
        metadata: { class: "P1", subject: "MATHEMATICS", setId, year: year.toString() },
        questions: generateQuestions(setId)
      });
      setCount(setId);
    }
    setLoading(false);
    alert("Database updated!");
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8 font-serif">
      <div className="max-w-4xl mx-auto mb-8 bg-white p-6 rounded-xl shadow-lg">
         <h1 className="text-2xl font-bold mb-4">UDA Question Paper Generator</h1>
         <div className="flex flex-wrap gap-4">
            <button onClick={uploadP1VisualSets} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
                {loading ? `Uploading ${count}%` : "Push to Database"}
            </button>
            <button onClick={handlePreview} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold">
                Preview Format
            </button>
            <button 
              onClick={fetchPrivatePdf} 
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold"
              disabled={fetchingPdf}
            >
               {fetchingPdf ? "Fetching..." : "View PDF from Vault"}
            </button>
         </div>
      </div>

      {/* Updated Viewer Section */}
      {pdfUrl && (
        <div className="max-w-5xl mx-auto bg-white p-4 shadow-2xl rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Viewing: BABY MID TERM II</h2>
            <button onClick={() => setPdfUrl(null)} className="text-red-500 font-bold">Close Viewer</button>
          </div>
          {/* Using <embed> instead of <iframe> for better PDF behavior */}
          <embed 
            src={pdfUrl} 
            type="application/pdf"
            className="w-full h-[800px] border-2 border-gray-300 rounded"
          />
        </div>
      )}

      {/* Generated Questions Preview */}
      {previewData && (
        <div className="max-w-[800px] mx-auto bg-white p-12 shadow-2xl border-2 border-gray-300">
          <div className="text-center border-b-4 border-black pb-4 mb-6">
            <h1 className="text-3xl font-black uppercase">UDA Primary School Examinations</h1>
            <p className="font-bold text-lg">P.1 Mathematics Curriculum Assessment</p>
          </div>
          <div className="space-y-12">
            {previewData.slice(0, 10).map((item, idx) => (
              <div key={idx} className="pb-4">
                <p className="text-xl font-medium mb-6">{idx + 1}. {item.q}</p>
                <div className="mb-6">
                  {item.artType === 'set_visual' && <MathSVG.SetObjects count={item.artValue.count} itemType={item.artValue.item} />}
                  {item.artType === 'fraction_visual' && <MathSVG.FractionBox shaded={1} total={item.artValue.total} shape={item.shape} />}
                  {item.artType === 'addition_visual' && (
                    <div className="flex items-center gap-4">
                       <MathSVG.SetObjects count={item.artValue.val1} itemType="balls" />
                       <span className="text-4xl">+</span>
                       <MathSVG.SetObjects count={item.artValue.val2} itemType="balls" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {item.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="w-8 h-8 border-2 border-black rounded-full flex items-center justify-center text-sm font-bold">{String.fromCharCode(97 + i)}</div>
                       <span className="text-lg underline underline-offset-4 decoration-dotted">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
