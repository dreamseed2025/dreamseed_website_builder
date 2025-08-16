// Debug the business name extraction regex

const testTexts = [
  "I want to start a coffee shop business called Quick Brew LLC in Texas",
  "I want to create a tech startup called InnovateTech LLC in California", 
  "I want to start a Mexican restaurant called Casa Maria LLC in Florida"
];

function testRegex(text) {
  console.log('\n🔍 Testing:', text);
  console.log('═'.repeat(60));
  
  // Current regex
  const calledMatch = text.match(/called\s+([A-Za-z0-9\s]+?)(?:\s+LLC|\s+Inc|\s+Corp|\s+in\s+|\.|!|\?|$)/i);
  console.log('Current regex result:', calledMatch);
  if (calledMatch) {
    console.log('Capture group 1:', `"${calledMatch[1].trim()}"`);
  }
  
  // Better regex - exclude "called" from capture
  const betterMatch = text.match(/(?:called\s+)([A-Za-z0-9\s]+(?:LLC|Inc|Corp)?)(?:\s+in\s+|\.|!|\?|$)/i);
  console.log('Better regex result:', betterMatch);
  if (betterMatch) {
    console.log('Better capture group 1:', `"${betterMatch[1].trim()}"`);
  }
  
  // Even better - include LLC in the name if present
  const bestMatch = text.match(/(?:called\s+)([A-Za-z0-9\s]+(?:LLC|Inc|Corp)?)/i);
  console.log('Best regex result:', bestMatch);
  if (bestMatch) {
    console.log('Best capture group 1:', `"${bestMatch[1].trim()}"`);
  }
}

testTexts.forEach(testRegex);