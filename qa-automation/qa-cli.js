#!/usr/bin/env node

/**
 * 🛠️ QA CLI Tool
 * 
 * Command-line interface for managing QA test cases dynamically
 */

const { TestCaseManager } = require('./test-case-manager')
const { execSync } = require('child_process')
const readline = require('readline')

class QACLITool {
  constructor() {
    this.testManager = new TestCaseManager()
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  }

  async run() {
    const args = process.argv.slice(2)
    const command = args[0]

    try {
      await this.testManager.initialize()

      switch (command) {
        case 'add':
          await this.addTestCase()
          break
        case 'add-feature':
          await this.addFeatureTests()
          break
        case 'list':
          await this.listTestCases()
          break
        case 'detect':
          await this.detectNewCode()
          break
        case 'generate-suite':
          await this.generateTestSuite()
          break
        case 'dashboard':
          await this.openDashboard()
          break
        case 'watch':
          await this.watchForChanges()
          break
        case 'help':
        default:
          this.showHelp()
      }
    } catch (error) {
      console.error('❌ Error:', error.message)
      process.exit(1)
    } finally {
      this.rl.close()
    }
  }

  async addTestCase() {
    console.log('\n🧪 Add New Test Case')
    console.log('====================')

    const testCase = {}

    testCase.id = await this.prompt('Test ID (e.g., user-login-success): ')
    testCase.name = await this.prompt('Test Name: ')
    testCase.category = await this.promptChoice('Category:', ['UI', 'API', 'Integration', 'Performance', 'Security', 'Component'])
    testCase.priority = await this.promptChoice('Priority:', ['P0', 'P1', 'P2', 'P3'])
    testCase.description = await this.prompt('Description: ')

    // Add steps
    testCase.steps = []
    console.log('\nAdd test steps (press enter on empty line to finish):')
    let stepNum = 1
    while (true) {
      const step = await this.prompt(`Step ${stepNum}: `)
      if (!step.trim()) break
      testCase.steps.push(step)
      stepNum++
    }

    // Add expected results
    testCase.expectedResults = []
    console.log('\nAdd expected results (press enter on empty line to finish):')
    let resultNum = 1
    while (true) {
      const result = await this.prompt(`Expected Result ${resultNum}: `)
      if (!result.trim()) break
      testCase.expectedResults.push(result)
      resultNum++
    }

    // Add tags
    const tagsInput = await this.prompt('Tags (comma-separated): ')
    testCase.tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean)

    // Category-specific fields
    if (testCase.category === 'UI') {
      testCase.url = await this.prompt('Page URL (optional): ')
    } else if (testCase.category === 'API') {
      testCase.endpoint = await this.prompt('API Endpoint: ')
      testCase.method = await this.promptChoice('HTTP Method:', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
      testCase.expectedStatus = parseInt(await this.prompt('Expected Status Code (200): ') || '200')
    } else if (testCase.category === 'Performance') {
      testCase.maxLoadTime = parseInt(await this.prompt('Max Load Time (ms, 3000): ') || '3000')
      testCase.maxResponseTime = parseInt(await this.prompt('Max Response Time (ms, 1000): ') || '1000')
    }

    const createdTest = await this.testManager.addTestCase(testCase)
    
    console.log('\n✅ Test Case Created Successfully!')
    console.log('=================================')
    console.log(`ID: ${createdTest.id}`)
    console.log(`Name: ${createdTest.name}`)
    console.log(`Category: ${createdTest.category}`)
    console.log(`Priority: ${createdTest.priority}`)
    console.log(`File: qa-automation/test-cases/${createdTest.category.toLowerCase()}-${createdTest.id}.json`)
    
    // Ask if they want to add to current test suite
    const addToSuite = await this.promptYesNo('Add to current test suite? (y/n): ')
    if (addToSuite) {
      console.log('📋 Test case will be included in the next test run')
    }
  }

  async addFeatureTests() {
    console.log('\n🚀 Add Feature Test Suite')
    console.log('==========================')

    const feature = {}
    feature.name = await this.prompt('Feature Name: ')
    feature.description = await this.prompt('Feature Description: ')
    feature.priority = await this.promptChoice('Priority:', ['P0', 'P1', 'P2', 'P3'])

    // Add pages
    feature.pages = []
    console.log('\nAdd pages for this feature (press enter on empty name to finish):')
    while (true) {
      const pageName = await this.prompt('Page Name: ')
      if (!pageName.trim()) break
      const pagePath = await this.prompt('Page Path: ')
      feature.pages.push({ name: pageName, path: pagePath })
    }

    // Add APIs
    feature.apis = []
    console.log('\nAdd APIs for this feature (press enter on empty name to finish):')
    while (true) {
      const apiName = await this.prompt('API Name: ')
      if (!apiName.trim()) break
      const endpoint = await this.prompt('Endpoint: ')
      const method = await this.promptChoice('Method:', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
      feature.apis.push({ name: apiName, endpoint, method })
    }

    // Add user flows
    feature.userFlows = []
    console.log('\nAdd user flows for this feature (press enter on empty name to finish):')
    while (true) {
      const flowName = await this.prompt('User Flow Name: ')
      if (!flowName.trim()) break
      
      const steps = []
      console.log(`\nAdd steps for "${flowName}" (press enter on empty step to finish):`)
      let stepNum = 1
      while (true) {
        const step = await this.prompt(`  Step ${stepNum}: `)
        if (!step.trim()) break
        steps.push(step)
        stepNum++
      }
      
      feature.userFlows.push({ name: flowName, steps })
    }

    const testCases = await this.testManager.addFeatureTests(feature)

    console.log('\n✅ Feature Test Suite Created!')
    console.log('==============================')
    console.log(`Feature: ${feature.name}`)
    console.log(`Generated Tests: ${testCases.length}`)
    
    testCases.forEach((tc, i) => {
      console.log(`  ${i + 1}. ${tc.name} (${tc.category})`)
    })

    console.log(`\nFiles created in: qa-automation/test-cases/`)
  }

  async listTestCases() {
    const testCases = await this.testManager.getAllTestCases()
    
    console.log('\n📋 Current Test Cases')
    console.log('===================')
    
    if (testCases.length === 0) {
      console.log('No test cases found. Use "qa-cli add" to create one.')
      return
    }

    // Group by category
    const grouped = {}
    testCases.forEach(tc => {
      if (!grouped[tc.category]) grouped[tc.category] = []
      grouped[tc.category].push(tc)
    })

    for (const [category, cases] of Object.entries(grouped)) {
      console.log(`\n📂 ${category} (${cases.length})`)
      cases.forEach(tc => {
        const status = tc.status === 'active' ? '✅' : '❌'
        console.log(`  ${status} ${tc.id} - ${tc.name} (${tc.priority})`)
      })
    }

    console.log(`\nTotal: ${testCases.length} test cases`)
  }

  async detectNewCode() {
    console.log('\n🔍 Detecting New Code Changes')
    console.log('=============================')

    try {
      // Get git diff
      const gitDiff = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' })
      
      if (!gitDiff.trim()) {
        console.log('No changes detected since last commit.')
        return
      }

      console.log('Changed files:')
      gitDiff.trim().split('\n').forEach(file => {
        console.log(`  📄 ${file}`)
      })

      const suggestions = await this.testManager.detectNewCode(gitDiff)

      if (suggestions.length === 0) {
        console.log('\n💡 No test case suggestions for these changes.')
        return
      }

      console.log('\n💡 Suggested Test Cases:')
      console.log('=======================')

      suggestions.forEach((suggestion, i) => {
        console.log(`\n${i + 1}. ${suggestion.name}`)
        console.log(`   Category: ${suggestion.category}`)
        console.log(`   File: ${suggestion.filePath}`)
        console.log(`   Description: ${suggestion.description}`)
      })

      const createSuggested = await this.promptYesNo('\nCreate these suggested test cases? (y/n): ')
      
      if (createSuggested) {
        for (const suggestion of suggestions) {
          delete suggestion.suggested // Remove flag
          delete suggestion.filePath // Remove internal field
          
          // Add default values
          suggestion.steps = suggestion.steps || ['Test basic functionality', 'Validate expected behavior']
          suggestion.expectedResults = suggestion.expectedResults || ['Functionality works as expected', 'No errors occur']
          suggestion.tags = [suggestion.category.toLowerCase(), 'auto-generated']
          
          await this.testManager.addTestCase(suggestion)
        }
        
        console.log(`\n✅ Created ${suggestions.length} test cases from suggestions`)
      }

    } catch (error) {
      console.log('❌ Could not detect changes. Make sure you are in a git repository.')
      console.log('Error:', error.message)
    }
  }

  async generateTestSuite() {
    console.log('\n🎯 Generate Custom Test Suite')
    console.log('============================')

    const testCases = await this.testManager.getAllTestCases()
    
    if (testCases.length === 0) {
      console.log('No test cases available. Add some test cases first.')
      return
    }

    console.log('\nAvailable test cases:')
    testCases.forEach((tc, i) => {
      console.log(`  ${i + 1}. ${tc.name} (${tc.category}, ${tc.priority})`)
    })

    const selection = await this.prompt('\nEnter test case numbers (comma-separated, or "all"): ')
    
    let selectedIds = []
    if (selection.toLowerCase() === 'all') {
      selectedIds = testCases.map(tc => tc.id)
    } else {
      const indices = selection.split(',').map(s => parseInt(s.trim()) - 1)
      selectedIds = indices.map(i => testCases[i]?.id).filter(Boolean)
    }

    if (selectedIds.length === 0) {
      console.log('No valid test cases selected.')
      return
    }

    const suite = await this.testManager.generateTestSuite(selectedIds)

    console.log('\n✅ Test Suite Generated!')
    console.log('=======================')
    console.log(`Name: ${suite.name}`)
    console.log(`Test Cases: ${suite.testCases.length}`)
    console.log(`Categories: ${Object.keys(suite.categories).join(', ')}`)
    console.log(`File: qa-automation/custom-tests/dynamic-suite-[timestamp].js`)
  }

  async openDashboard() {
    console.log('\n📊 Opening QA Dashboard')
    console.log('======================')
    console.log('Dashboard URL: http://localhost:3000/qa-dashboard')
    console.log('\nMake sure your development server is running:')
    console.log('  npm run dev')
    
    // Try to open browser (works on macOS/Windows/Linux)
    try {
      const open = require('open')
      await open('http://localhost:3000/qa-dashboard')
      console.log('✅ Dashboard opened in browser')
    } catch (error) {
      console.log('💡 Please open the URL manually in your browser')
    }
  }

  async watchForChanges() {
    console.log('\n👀 Watching for Code Changes')
    console.log('===========================')
    console.log('Watching for file changes... (Press Ctrl+C to stop)')

    const chokidar = require('chokidar')
    
    const watcher = chokidar.watch(['app/', 'lib/', 'components/'], {
      ignored: ['node_modules/', '.next/', 'dist/'],
      persistent: true
    })

    watcher.on('add', async (path) => {
      console.log(`\n📄 New file detected: ${path}`)
      
      const suggestions = await this.testManager.suggestTestsForNewFile({
        file: path,
        category: this.testManager.categorizeFile(path)
      })

      if (suggestions) {
        console.log(`💡 Suggested test: ${suggestions.name}`)
        console.log(`   Category: ${suggestions.category}`)
        console.log(`   Run "qa-cli add" to create this test case`)
      }
    })

    watcher.on('change', (path) => {
      console.log(`📝 File changed: ${path}`)
      console.log(`💡 Consider updating related test cases`)
    })

    // Keep process alive
    process.stdin.resume()
  }

  showHelp() {
    console.log('\n🛠️  QA CLI Tool - DreamSeed Platform')
    console.log('===================================')
    console.log('')
    console.log('Commands:')
    console.log('  add              Add a new test case interactively')
    console.log('  add-feature      Add test suite for a new feature')
    console.log('  list             List all existing test cases')
    console.log('  detect           Detect code changes and suggest test cases')
    console.log('  generate-suite   Generate custom test suite from existing cases')
    console.log('  dashboard        Open the QA dashboard in browser')
    console.log('  watch            Watch for file changes and suggest tests')
    console.log('  help             Show this help message')
    console.log('')
    console.log('Examples:')
    console.log('  qa-cli add                    # Add new test case')
    console.log('  qa-cli add-feature           # Add tests for new feature')
    console.log('  qa-cli list                  # Show all test cases')
    console.log('  qa-cli detect               # Check for new code')
    console.log('  qa-cli dashboard            # Open dashboard')
    console.log('')
    console.log('Integration:')
    console.log('  - Test cases are automatically included in dashboard')
    console.log('  - Generated tests integrate with existing QA framework')
    console.log('  - Supports all test categories: UI, API, Integration, Performance')
    console.log('')
  }

  // Helper methods
  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve)
    })
  }

  async promptChoice(question, choices) {
    console.log(question)
    choices.forEach((choice, i) => {
      console.log(`  ${i + 1}. ${choice}`)
    })
    
    const answer = await this.prompt('Select (1-' + choices.length + '): ')
    const index = parseInt(answer) - 1
    return choices[index] || choices[0]
  }

  async promptYesNo(question) {
    const answer = await this.prompt(question)
    return answer.toLowerCase().startsWith('y')
  }
}

// CLI entry point
if (require.main === module) {
  const cli = new QACLITool()
  cli.run()
}

module.exports = { QACLITool }