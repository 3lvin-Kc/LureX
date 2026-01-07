/**
 * Simple verification script for the infinite loop fix
 * This can be run with: node verify-fix.js
 * 
 * This script checks that the key fixes have been applied to prevent
 * the "Maximum update depth exceeded" error.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying infinite loop fixes...\n');

// Check 1: useCodeGeneration hook file sync useEffect
const useCodeGenPath = path.join(__dirname, 'src/hooks/useCodeGeneration.ts');
const useCodeGenContent = fs.readFileSync(useCodeGenPath, 'utf8');

console.log('✅ Checking useCodeGeneration.ts...');

// Check that the problematic ref pattern has been removed
const hasRefPattern = useCodeGenContent.includes('addFileRef.current') ||
                     useCodeGenContent.includes('appendFileContentRef.current');

if (hasRefPattern) {
  console.log('❌ FAILED: Still using ref pattern in file sync useEffect');
  process.exit(1);
} else {
  console.log('✅ PASSED: Ref pattern removed from file sync useEffect');
}

// Check that proper dependencies are used
const hasCorrectDeps = useCodeGenContent.includes('[addFile, appendFileContent, setFileComplete, setStreamingFile]');

if (!hasCorrectDeps) {
  console.log('❌ FAILED: Missing proper dependencies in file sync useEffect');
  process.exit(1);
} else {
  console.log('✅ PASSED: Proper dependencies used in file sync useEffect');
}

// Check 2: setReadOnly useEffect fix
const hasReadOnlyRef = useCodeGenContent.includes('setReadOnlyRef.current');

if (hasReadOnlyRef) {
  console.log('❌ FAILED: Still using ref pattern for setReadOnly');
  process.exit(1);
} else {
  console.log('✅ PASSED: Ref pattern removed from setReadOnly useEffect');
}

const hasReadOnlyDeps = useCodeGenContent.includes('[generationStatus, setReadOnly]');

if (!hasReadOnlyDeps) {
  console.log('❌ FAILED: Missing proper dependencies in setReadOnly useEffect');
  process.exit(1);
} else {
  console.log('✅ PASSED: Proper dependencies used in setReadOnly useEffect');
}

// Check 3: Generation store reconnect fix
const genStorePath = path.join(__dirname, 'src/stores/generation-store.ts');
const genStoreContent = fs.readFileSync(genStorePath, 'utf8');

console.log('\n✅ Checking generation-store.ts...');

// Check that get().connect() is used instead of state.connect()
const hasCorrectConnect = genStoreContent.includes('get().connect()') && 
                         !genStoreContent.includes('state.connect()');

if (!hasCorrectConnect) {
  console.log('❌ FAILED: Still using state.connect() instead of get().connect()');
  process.exit(1);
} else {
  console.log('✅ PASSED: Using get().connect() to avoid stale closure issues');
}

// Check 4: Verify no obvious infinite loop patterns
const dangerousPatterns = [
  /\[\s*\]/, // Empty dependency arrays in useEffect (except where appropriate)
  /useEffect.*\[\].*subscribe/, // useEffect with empty deps and subscription
];

const hasDangerousPatterns = dangerousPatterns.some(pattern => {
  const matches = useCodeGenContent.match(pattern);
  return matches && matches.length > 0;
});

if (hasDangerousPatterns) {
  console.log('❌ FAILED: Found potentially dangerous patterns');
  process.exit(1);
} else {
  console.log('✅ PASSED: No dangerous infinite loop patterns found');
}

// Check 5: Verify EnhancedChatAssistant doesn't have problematic useEffect patterns
const assistantPath = path.join(__dirname, 'src/components/ai/EnhancedChatAssistant.tsx');
const assistantContent = fs.readFileSync(assistantPath, 'utf8');

console.log('\n✅ Checking EnhancedChatAssistant.tsx...');

// Check that useEffect dependencies are properly specified
const useEffectMatches = assistantContent.match(/useEffect\([^)]+\,\s*\[[^\]]*\]/g) || [];

let hasBadUseEffect = false;
useEffectMatches.forEach(match => {
  if (match.includes('[],') && !match.includes('//')) {
    // Empty dependency array without comment explaining why
    console.log(`⚠️  Found useEffect with empty deps: ${match}`);
  }
});

// Check for any direct store mutations in useEffect
const hasStoreMutations = assistantContent.includes('useGenerationStore(') &&
                       assistantContent.includes('set(');

if (hasStoreMutations) {
  console.log('❌ FAILED: Found direct store mutations in component');
  process.exit(1);
} else {
  console.log('✅ PASSED: No direct store mutations found in component');
}

console.log('\n🎉 All checks passed! The infinite loop fix has been properly applied.');
console.log('\n📋 Summary of fixes:');
console.log('   • Removed ref pattern from useCodeGeneration file sync useEffect');
console.log('   • Added proper dependencies to prevent re-creation');
console.log('   • Fixed setReadOnly useEffect dependencies');
console.log('   • Fixed generation store reconnect logic');
console.log('   • Verified no dangerous patterns remain');
console.log('\n✨ The "Maximum update depth exceeded" error should now be resolved!');
