// Add this Illustration Library to your code
const MathSVG = {
  SetObjects: ({ count }) => (
    <div className="flex justify-center border-2 border-dashed border-gray-400 p-4 my-2">
      <svg width="200" height="60" viewBox="0 0 200 60">
        {Array.from({ length: count }).map((_, i) => (
          <circle key={i} cx={30 + i * 35} cy="30" r="12" stroke="black" fill="none" strokeWidth="2" />
        ))}
      </svg>
    </div>
  ),
  Abacus: ({ value }) => (
    <svg width="100" height="80" className="mx-auto my-2">
      <line x1="30" y1="10" x2="30" y2="70" stroke="black" strokeWidth="3"/>
      <line x1="70" y1="10" x2="70" y2="70" stroke="black" strokeWidth="3"/>
      <rect x="10" y="70" width="80" height="10" fill="black"/>
      {/* Beads for Tens (30) and Ones (70) */}
      <circle cx="70" cy="60" r="5" fill="gray" />
      <circle cx="70" cy="50" r="5" fill="gray" />
    </svg>
  ),
  Clock: () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="mx-auto my-2">
      <circle cx="50" cy="50" r="45" stroke="black" fill="none" strokeWidth="2" />
      <line x1="50" y1="50" x2="50" y2="20" stroke="black" strokeWidth="3" /> {/* Long hand */}
      <line x1="50" y1="50" x2="80" y2="50" stroke="black" strokeWidth="2" /> {/* Short hand */}
      <text x="45" y="15" fontSize="10">12</text>
      <text x="85" y="55" fontSize="10">3</text>
    </svg>
  )
};

// Inside your generateQuestions function, update the logic:
const generateQuestions = (setId) => {
  let questions = [];
  for (let i = 1; i <= 50; i++) {
    const seed = setId + i;
    
    // Example: Every 5th question is an illustration question
    if (i % 10 === 1) {
      questions.push({ 
        id: i, 
        text: "Count and write the number of balls in the set:", 
        render: <MathSVG.SetObjects count={(seed % 5) + 2} /> 
      });
    } else if (i % 10 === 5) {
      questions.push({ 
        id: i, 
        text: "Show the time on the clock face below:", 
        render: <MathSVG.Clock /> 
      });
    } else if (i % 10 === 8) {
      questions.push({ 
        id: i, 
        text: "Represent the number 2 on the ones rod of the abacus:", 
        render: <MathSVG.Abacus /> 
      });
    } else {
      // Standard Text Questions
      questions.push({ id: i, text: `Solve: ${10 + (seed % 20)} + ${5 + (seed % 5)} =`, render: null });
    }
  }
  return questions;
};
