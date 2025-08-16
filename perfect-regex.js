// Find the perfect regex for business name extraction

const testTexts = [
  "I want to start a coffee shop business called Quick Brew LLC in Texas",
  "I want to create a tech startup called InnovateTech LLC in California", 
  "I want to start a Mexican restaurant called Casa Maria LLC in Florida"
];

function testPerfectRegex(text) {
  console.log('\n🔍 Testing:', text);
  console.log('═'.repeat(60));
  
  // Perfect regex - capture name + LLC but stop before "in"
  const perfectMatch = text.match(/called\s+([A-Za-z0-9\s]+(?:LLC|Inc|Corp)?)(?=\s+in|\s*\.|!|\?|$)/i);
  console.log('Perfect regex result:', perfectMatch);
  if (perfectMatch) {
    console.log('Perfect capture group 1:', `"${perfectMatch[1].trim()}"`);
  }
}

testTexts.forEach(testPerfectRegex);