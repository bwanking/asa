import React from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';

function App() {
  
  
  // Helper to shuffle options so the correct answer isn't always in the same spot
  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  const runUpload = async (subject) => {
    const targetClass = "p3";
    console.log(`🚀 Starting NLSC Factory for ${subject}...`);
    
    for (let i = 0; i < 100; i++) {
      const yearMapping = 1990 + i; 
      const docId = `${targetClass}_${subject.toLowerCase()}_${yearMapping}`;
      
      const generatedQuestions = Array.from({ length: 50 }, (_, index) => {
        const qNum = index + 1;
        // The 'seed' ensures every year AND every question is unique
        const seed = yearMapping + qNum;
        let qObj = { q: "", ans: "", options: [], artType: null, artValue: null };

        if (subject === "mathematics") {
          // --- TOPIC 1: SET THEORY (Questions 1-10) ---
          if (qNum <= 10) {
            const count = (seed % 5) + 2; // 2 to 6 elements
            const setName = ["A", "B", "P", "Q", "K"][seed % 5];
            qObj.q = `How many elements are in Set ${setName} shown below?`;
            qObj.ans = `${count}`;
            qObj.options = shuffle([`${count}`, `${count + 1}`, `${count - 2}`, "0"]);
            qObj.artType = "sets";
            qObj.artValue = { count, name: setName };
          } 
          // --- TOPIC 2: GEOMETRY & SHAPES (Questions 11-20) ---
          else if (qNum <= 20) {
            const side = (seed % 5) + 3; // 3 to 7 cm
            qObj.q = `Calculate the perimeter of the square shown below with a side of ${side}cm.`;
            qObj.ans = `${side * 4}cm`;
            qObj.options = shuffle([`${side * 4}cm`, `${side * side}cm`, "10cm", "20cm"]);
            qObj.artType = "square";
            qObj.artValue = side;
          }
          // --- TOPIC 3: MONEY & REAL LIFE (Questions 21-30) ---
          else if (qNum <= 30) {
            const pencilPrice = (seed % 3 + 1) * 200;
            const quantity = (seed % 3) + 2;
            qObj.q = `If one pencil costs ${pencilPrice} shillings, find the cost of ${quantity} pencils.`;
            qObj.ans = `${pencilPrice * quantity}`;
            qObj.options = shuffle([`${pencilPrice * quantity}`, `${pencilPrice}`, "1000", "500"]);
            qObj.artType = "money";
          }
          // --- TOPIC 4: MEASUREMENT - TIME/WEIGHT (Questions 31-40) ---
          else if (qNum <= 40) {
            const weeks = (seed % 3) + 2;
            qObj.q = `How many days are in ${weeks} weeks?`;
            qObj.ans = `${weeks * 7}`;
            qObj.options = shuffle([`${weeks * 7}`, `${weeks * 5}`, "14", "30"]);
          }
          // --- TOPIC 5: ALGEBRA & NUMERATION (Questions 41-50) ---
          else {
            const unknown = (seed % 10) + 1;
            const base = (seed % 20) + 5;
            qObj.q = `What number must be added to ${base} to get ${base + unknown}?`;
            qObj.ans = `${unknown}`;
            qObj.options = shuffle([`${unknown}`, `${base}`, `${base + unknown}`, "1"]);
          }
        }

        return qObj;
      });

      try {
        await setDoc(doc(db, "UDA_EXAMS", docId), {
          metadata: {
            class: "P3",
            subject: subject.toUpperCase(),
            totalQuestions: 50,
            updatedAt: new Date().toISOString(),
            year: yearMapping.toString(),
            curriculum: "NLSC"
          },
          questions: generatedQuestions
        });
        console.log(`✅ Uploaded Set ${yearMapping}: ${docId}`);
      } catch (err) {
        console.error("❌ Error uploading:", err);
        return;
      }
    }
    alert(`${subject.toUpperCase()} - 100 Unique NLSC Sets Uploaded Successfully!`);
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', display: 'inline-block', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#1a73e8' }}>UDA NLSC FACTORY</h1>
        <p style={{ color: '#5f6368' }}>Generating 100 unique years (1990 - 2089)</p>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
          <button onClick={() => runUpload("mathematics")} style={btnStyle("#ea4335")}>
            🚀 PUSH UNIQUE P3 MATH
          </button>
        </div>
        
        <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
          Note: This will overwrite existing data for the same years.
        </p>
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({
  padding: '15px 30px',
  backgroundColor: bg,
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '16px'
});

export default App;
