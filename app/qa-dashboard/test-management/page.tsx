'use client'

import React, { useState, useEffect } from 'react'

interface TestCase {
  id: string
  name: string
  category: string
  priority: string
  description: string
  steps: string[]
  expectedResults: string[]
  tags: string[]
  status: string
  createdAt: string
  updatedAt: string
  automatable: boolean
}

export default function TestManagement() {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTest, setEditingTest] = useState<TestCase | null>(null)
  const [newTestCase, setNewTestCase] = useState({
    id: '',
    name: '',
    category: 'UI',
    priority: 'P2',
    description: '',
    steps: [''],
    expectedResults: [''],
    tags: '',
    automatable: true
  })

  const categories = ['All', 'UI', 'API', 'Integration', 'Performance', 'Security', 'Component']
  const priorities = ['P0', 'P1', 'P2', 'P3']

  useEffect(() => {
    loadTestCases()
  }, [])

  const loadTestCases = async () => {
    try {
      // In a real implementation, this would fetch from the API
      // For now, we'll simulate with sample data
      const sampleTestCases: TestCase[] = [
        {
          id: 'homepage-load-test',
          name: 'Homepage Load Test',
          category: 'UI',
          priority: 'P1',
          description: 'Verify homepage loads correctly and displays key elements',
          steps: [
            'Navigate to homepage',
            'Verify page title is correct',
            'Check navigation menu is visible',
            'Validate footer content'
          ],
          expectedResults: [
            'Page loads within 3 seconds',
            'Title contains "DreamSeed"',
            'Navigation menu has all required links',
            'Footer displays copyright information'
          ],
          tags: ['homepage', 'ui', 'smoke'],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          automatable: true
        },
        {
          id: 'user-registration-api',
          name: 'User Registration API',
          category: 'API',
          priority: 'P0',
          description: 'Test user registration endpoint functionality',
          steps: [
            'Send POST request to /api/auth/register',
            'Validate response format',
            'Check user creation in database',
            'Test error scenarios'
          ],
          expectedResults: [
            'Returns 201 status on success',
            'Response includes user ID',
            'User is stored in database',
            'Proper error handling for invalid data'
          ],
          tags: ['auth', 'api', 'critical'],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          automatable: true
        }
      ]
      
      setTestCases(sampleTestCases)
    } catch (error) {
      console.error('Failed to load test cases:', error)
    }
  }

  const filteredTestCases = selectedCategory === 'All' 
    ? testCases 
    : testCases.filter(tc => tc.category === selectedCategory)

  const handleAddTestCase = () => {
    setShowAddForm(true)
    setEditingTest(null)
    setNewTestCase({
      id: '',
      name: '',
      category: 'UI',
      priority: 'P2',
      description: '',
      steps: [''],
      expectedResults: [''],
      tags: '',
      automatable: true
    })
  }

  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTest(testCase)
    setShowAddForm(true)
    setNewTestCase({
      id: testCase.id,
      name: testCase.name,
      category: testCase.category,
      priority: testCase.priority,
      description: testCase.description,
      steps: testCase.steps,
      expectedResults: testCase.expectedResults,
      tags: testCase.tags.join(', '),
      automatable: testCase.automatable
    })
  }

  const handleSaveTestCase = async () => {
    try {
      const testCaseData = {
        ...newTestCase,
        tags: newTestCase.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        steps: newTestCase.steps.filter(step => step.trim()),
        expectedResults: newTestCase.expectedResults.filter(result => result.trim())
      }

      if (editingTest) {
        // Update existing test case
        const updatedTestCases = testCases.map(tc => 
          tc.id === editingTest.id 
            ? { ...tc, ...testCaseData, updatedAt: new Date().toISOString() }
            : tc
        )
        setTestCases(updatedTestCases)
      } else {
        // Add new test case
        const newTC: TestCase = {
          ...testCaseData,
          id: testCaseData.id || `test-${Date.now()}`,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setTestCases([...testCases, newTC])
      }

      setShowAddForm(false)
      setEditingTest(null)
    } catch (error) {
      console.error('Failed to save test case:', error)
    }
  }

  const handleDeleteTestCase = async (id: string) => {
    if (confirm('Are you sure you want to delete this test case?')) {
      setTestCases(testCases.filter(tc => tc.id !== id))
    }
  }

  const addStep = () => {
    setNewTestCase({
      ...newTestCase,
      steps: [...newTestCase.steps, '']
    })
  }

  const updateStep = (index: number, value: string) => {
    const updatedSteps = [...newTestCase.steps]
    updatedSteps[index] = value
    setNewTestCase({ ...newTestCase, steps: updatedSteps })
  }

  const removeStep = (index: number) => {
    setNewTestCase({
      ...newTestCase,
      steps: newTestCase.steps.filter((_, i) => i !== index)
    })
  }

  const addExpectedResult = () => {
    setNewTestCase({
      ...newTestCase,
      expectedResults: [...newTestCase.expectedResults, '']
    })
  }

  const updateExpectedResult = (index: number, value: string) => {
    const updatedResults = [...newTestCase.expectedResults]
    updatedResults[index] = value
    setNewTestCase({ ...newTestCase, expectedResults: updatedResults })
  }

  const removeExpectedResult = (index: number) => {
    setNewTestCase({
      ...newTestCase,
      expectedResults: newTestCase.expectedResults.filter((_, i) => i !== index)
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return '#dc3545'
      case 'P1': return '#fd7e14'
      case 'P2': return '#ffc107'
      case 'P3': return '#28a745'
      default: return '#6c757d'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UI': return '#007bff'
      case 'API': return '#28a745'
      case 'Integration': return '#17a2b8'
      case 'Performance': return '#ffc107'
      case 'Security': return '#dc3545'
      case 'Component': return '#6f42c1'
      default: return '#6c757d'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px' 
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🛠️ Test Case Management
            </h1>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
              Add, edit, and manage test cases for your QA automation
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAddTestCase}
              style={{
                padding: '12px 24px',
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ➕ Add Test Case
            </button>
            
            <button
              onClick={() => window.location.href = '/qa-dashboard'}
              style={{
                padding: '12px 24px',
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              📊 Back to Dashboard
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: selectedCategory === category 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : '#f8f9fa',
                color: selectedCategory === category ? 'white' : '#495057',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {category} {category !== 'All' && `(${testCases.filter(tc => tc.category === category).length})`}
            </button>
          ))}
        </div>

        {/* Test Cases List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {filteredTestCases.map(testCase => (
            <div
              key={testCase.id}
              style={{
                background: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Test Case Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#495057'
                  }}>
                    {testCase.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                      background: getCategoryColor(testCase.category),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {testCase.category}
                    </span>
                    <span style={{
                      background: getPriorityColor(testCase.priority),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {testCase.priority}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleEditTestCase(testCase)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#007bff',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTestCase(testCase.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#dc3545',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Description */}
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#6c757d',
                lineHeight: '1.4'
              }}>
                {testCase.description}
              </p>

              {/* Test Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  background: '#f8f9fa',
                  padding: '8px',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>
                    Steps
                  </div>
                  <div style={{ fontSize: '14px', color: '#28a745' }}>
                    {testCase.steps.length}
                  </div>
                </div>
                
                <div style={{
                  background: '#f8f9fa',
                  padding: '8px',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>
                    Expected Results
                  </div>
                  <div style={{ fontSize: '14px', color: '#28a745' }}>
                    {testCase.expectedResults.length}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {testCase.tags.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  {testCase.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#e9ecef',
                        color: '#495057',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        marginRight: '4px'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Automation Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#6c757d'
              }}>
                <span>
                  {testCase.automatable ? '🤖 Automatable' : '👤 Manual'}
                </span>
                <span>
                  Updated: {new Date(testCase.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h2 style={{
                margin: '0 0 20px 0',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#495057'
              }}>
                {editingTest ? 'Edit Test Case' : 'Add New Test Case'}
              </h2>

              {/* Form Fields */}
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* ID and Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Test ID (e.g., homepage-load)"
                    value={newTestCase.id}
                    onChange={(e) => setNewTestCase({...newTestCase, id: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Test Name"
                    value={newTestCase.name}
                    onChange={(e) => setNewTestCase({...newTestCase, name: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Category and Priority */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <select
                    value={newTestCase.category}
                    onChange={(e) => setNewTestCase({...newTestCase, category: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef',
                      fontSize: '14px'
                    }}
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <select
                    value={newTestCase.priority}
                    onChange={(e) => setNewTestCase({...newTestCase, priority: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef',
                      fontSize: '14px'
                    }}
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <textarea
                  placeholder="Test Description"
                  value={newTestCase.description}
                  onChange={(e) => setNewTestCase({...newTestCase, description: e.target.value})}
                  rows={3}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />

                {/* Steps */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057', marginBottom: '8px', display: 'block' }}>
                    Test Steps
                  </label>
                  {newTestCase.steps.map((step, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder={`Step ${index + 1}`}
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e9ecef',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        onClick={() => removeStep(index)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#dc3545',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addStep}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #007bff',
                      background: 'white',
                      color: '#007bff',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    + Add Step
                  </button>
                </div>

                {/* Expected Results */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057', marginBottom: '8px', display: 'block' }}>
                    Expected Results
                  </label>
                  {newTestCase.expectedResults.map((result, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder={`Expected Result ${index + 1}`}
                        value={result}
                        onChange={(e) => updateExpectedResult(index, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e9ecef',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        onClick={() => removeExpectedResult(index)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#dc3545',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addExpectedResult}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #007bff',
                      background: 'white',
                      color: '#007bff',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    + Add Expected Result
                  </button>
                </div>

                {/* Tags */}
                <input
                  type="text"
                  placeholder="Tags (comma-separated)"
                  value={newTestCase.tags}
                  onChange={(e) => setNewTestCase({...newTestCase, tags: e.target.value})}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    fontSize: '14px'
                  }}
                />

                {/* Automation Checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={newTestCase.automatable}
                    onChange={(e) => setNewTestCase({...newTestCase, automatable: e.target.checked})}
                  />
                  <span style={{ fontSize: '14px', color: '#495057' }}>
                    This test case can be automated
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px'
              }}>
                <button
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: '1px solid #6c757d',
                    background: 'white',
                    color: '#6c757d',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTestCase}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {editingTest ? 'Update Test Case' : 'Create Test Case'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTestCases.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6c757d'
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>No test cases found</h3>
            <p style={{ margin: '0 0 20px 0' }}>
              {selectedCategory === 'All' 
                ? 'Get started by adding your first test case' 
                : `No test cases in the ${selectedCategory} category`}
            </p>
            <button
              onClick={handleAddTestCase}
              style={{
                padding: '12px 24px',
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ➕ Add First Test Case
            </button>
          </div>
        )}

      </div>
    </div>
  )
}