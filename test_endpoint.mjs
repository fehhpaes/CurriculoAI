async function test() {
  const response = await fetch('http://localhost:3000/api/analyze-roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText: 'Experiência como professor de geografia e técnico de TI. Experiência como professor de geografia e técnico de TI. Experiência como professor de geografia e técnico de TI.' })
  });
  
  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Body:', text);
}
test();
