import React from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';

function App() {
  
  const runUpload = async (subject) => {
    const targetClass = "p3";
    console.log(`🚀 Generating Unique NLSC Sets for ${subject}...`);
    
    for (let i = 0; i < 100; i++) {
      const yearMapping = 1990 + i; 
      const docId = `${targetClass}_${subject.toLowerCase()}_${yearMapping}`;
      
      const generatedQuestions = Array.from({ length: 50 }, (_, index) => {
        const qNum = index + 1;
        // Seed unique values based on the specific set and question number
        const seed = yearMapping + qNum;
        let questionObj = { q: "", ans: "", options: [], artType: null, artValue: null };

        if (subject === "mathematics") {
          // TOPIC: GEOMETRY & AREA (New Curriculum Standard)
          if (qNum % 10 === 0) {
            const base = (seed % 6) + 4;
            const height = (seed % 4) + 2;
            questionObj.q = `Find the area of the triangle shown below with base ${base}cm and height ${height}cm.`;
            questionObj.ans = `${(base * height) / 2}`;
            questionObj.options = [`${(base * height) / 2}`, `${base * height}`, "12", "20"];
            questionObj.artType = "triangle"; 
            questionObj.artValue = { base, height }; // Frontend uses this to draw
          } 
          // TOPIC: MONEY & SHOPPING (Real-life competency)
          else if (qNum % 10 === 3) {
            const price = (seed % 5 + 1) * 100;
            questionObj.q = `If one apple costs ${price} shillings, how much will you pay for 3 apples?`;
            questionObj.ans = `${price * 3}`;
            questionObj.options = [`${price * 3}`, `${price * 2}`, "1000", "500"];
            questionObj.artType = "money";
          }
          // TOPIC: SETS & GROUPS
          else if (qNum % 10 === 1) {
            const members = (seed % 4) + 3;
            questionObj.q = `Identify the number of elements in the set P shown below.`;
            questionObj.ans = `${members}`;
            questionObj.options = [`${members}`, "2", "9", "0"];
            questionObj.artType = "sets";
            questionObj.artValue = members;
          }
          else {
            const n1 = (seed % 80) + 10;
            const n2 = (seed % 20);
            questionObj.q = `Solve: ${n1} + ${n2} = ____`;
            questionObj.ans = `${n1 + n2}`;
            questionObj.options = [`${n1 + n2}`, `${n1 + n2 + 1}`, `${n1 + n2 - 1}`, "100"];
          }
        } 
        // ... Logic for other subjects follows similar randomization ...
        
        return questionObj;
      });

      try {
        await setDoc(doc(db, "UDA_EXAMS", docId), {
          metadata: {
            class: "P3",
            subject: subject.toUpperCase(),
            totalQuestions: 50,
            updatedAt: new Date().toISOString(),
            year: yearMapping.toString(),
            curriculum: "NLSC" // Tagging as New Curriculum
          },
          questions: generatedQuestions
        });
      } catch (err) {
        console.error("❌ Error:", err);
        return;
      }
    }
    alert(`${subject.toUpperCase()} Unique Sets Uploaded!`);
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>UDA NLSC ADMIN PANEL</h1>
      <button onClick={() => runUpload("mathematics")} style={btnStyle("#e74c3c")}>Update Unique P3 Math</button>
      <button onClick={() => runUpload("science")} style={btnStyle("#27ae60")}>Update Unique P3 Science</button>
    </div>
  );
}

const btnStyle = (color) => ({
  padding: '15px 25px', margin: '10px', backgroundColor: color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
});

export default App;
