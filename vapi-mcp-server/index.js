#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import path from 'path';

// Data storage
const DATA_FILE = path.join(process.cwd(), 'business-formations.json');

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    customers: {},
    formations: {},
    analytics: {
      totalCalls: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      conversionRates: {}
    }
  }, null, 2));
}

// Helper functions
function loadData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateCustomerId(phone, email) {
  return phone ? `phone_${phone.replace(/\D/g, '')}` : `email_${email?.replace('@', '_at_')}`;
}

// Create MCP server
const server = new Server(
  {
    name: "vapi-business-formation",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "save_customer_info",
        description: "Save customer contact information during a call",
        inputSchema: {
          type: "object",
          properties: {
            phone: { type: "string", description: "Customer phone number" },
            name: { type: "string", description: "Customer full name" },
            email: { type: "string", description: "Customer email address" },
            callNumber: { type: "number", description: "Which call this is (1-4)" }
          },
          required: ["phone", "callNumber"]
        }
      },
      {
        name: "save_business_concept",
        description: "Save business concept details from Call 1",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string", description: "Customer ID" },
            businessIdea: { type: "string", description: "The business concept/idea" },
            targetMarket: { type: "string", description: "Target market description" },
            revenueModel: { type: "string", description: "How they plan to make money" },
            fundingNeeds: { type: "number", description: "Amount of funding needed" },
            state: { type: "string", description: "State of operation" }
          },
          required: ["customerId", "businessIdea"]
        }
      },
      {
        name: "save_legal_formation",
        description: "Save legal formation details from Call 2",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string", description: "Customer ID" },
            businessName: { type: "string", description: "Chosen business name" },
            businessType: { type: "string", description: "LLC, Corporation, etc." },
            formationState: { type: "string", description: "State to form in" },
            trademarkNeeds: { type: "boolean", description: "Needs trademark protection" },
            industry: { type: "string", description: "Industry/business category" }
          },
          required: ["customerId"]
        }
      },
      {
        name: "save_banking_operations",
        description: "Save banking and operations details from Call 3",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string", description: "Customer ID" },
            bankingPreference: { type: "string", description: "Preferred bank" },
            paymentProcessing: { type: "string", description: "Payment processing needs" },
            accountingSoftware: { type: "string", description: "Accounting software choice" },
            estimatedRevenue: { type: "number", description: "Monthly revenue projection" }
          },
          required: ["customerId"]
        }
      },
      {
        name: "save_website_marketing",
        description: "Save website and marketing details from Call 4",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string", description: "Customer ID" },
            websiteRequirements: { type: "string", description: "Website feature requirements" },
            brandingPreferences: { type: "string", description: "Branding and design preferences" },
            marketingGoals: { type: "string", description: "Marketing objectives" },
            domainPreference: { type: "string", description: "Preferred domain name" },
            packageSelected: { type: "string", description: "Launch Basic, Launch Pro, or Launch Complete" }
          },
          required: ["customerId"]
        }
      },
      {
        name: "get_customer_info",
        description: "Retrieve existing customer information",
        inputSchema: {
          type: "object",
          properties: {
            phone: { type: "string", description: "Customer phone number" },
            email: { type: "string", description: "Customer email address" }
          }
        }
      },
      {
        name: "get_formation_progress",
        description: "Check the progress of a customer's business formation",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string", description: "Customer ID" }
          },
          required: ["customerId"]
        }
      },
      {
        name: "calculate_package_pricing",
        description: "Calculate pricing for different packages",
        inputSchema: {
          type: "object",
          properties: {
            package: { 
              type: "string", 
              enum: ["Launch Basic", "Launch Pro", "Launch Complete"],
              description: "Package name"
            },
            addOns: {
              type: "array",
              items: { type: "string" },
              description: "Additional services"
            }
          },
          required: ["package"]
        }
      },
      {
        name: "get_analytics",
        description: "Get current analytics and metrics",
        inputSchema: {
          type: "object",
          properties: {
            metric: {
              type: "string",
              enum: ["overview", "funnel", "revenue", "states"],
              description: "Type of analytics to retrieve"
            }
          }
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const data = loadData();

  try {
    switch (name) {
      case "save_customer_info":
        const customerId = generateCustomerId(args.phone, args.email);
        
        if (!data.customers[customerId]) {
          data.customers[customerId] = {
            id: customerId,
            phone: args.phone,
            name: args.name,
            email: args.email,
            callsCompleted: [],
            createdAt: new Date().toISOString()
          };
          data.analytics.totalCustomers++;
        } else {
          // Update existing customer
          if (args.name) data.customers[customerId].name = args.name;
          if (args.email) data.customers[customerId].email = args.email;
        }

        // Track call completion
        if (!data.customers[customerId].callsCompleted.includes(args.callNumber)) {
          data.customers[customerId].callsCompleted.push(args.callNumber);
          data.analytics.totalCalls++;
        }

        saveData(data);
        return {
          content: [
            {
              type: "text",
              text: `Customer ${customerId} saved successfully. Completed calls: ${data.customers[customerId].callsCompleted.join(', ')}`
            }
          ]
        };

      case "save_business_concept":
        if (!data.formations[args.customerId]) {
          data.formations[args.customerId] = {
            customerId: args.customerId,
            createdAt: new Date().toISOString(),
            call1: {},
            call2: {},
            call3: {},
            call4: {},
            status: 'in_progress'
          };
        }

        data.formations[args.customerId].call1 = {
          businessIdea: args.businessIdea,
          targetMarket: args.targetMarket,
          revenueModel: args.revenueModel,
          fundingNeeds: args.fundingNeeds,
          state: args.state,
          completedAt: new Date().toISOString()
        };

        saveData(data);
        return {
          content: [
            {
              type: "text",
              text: `Business concept saved for customer ${args.customerId}. Business idea: ${args.businessIdea}`
            }
          ]
        };

      case "save_legal_formation":
        if (!data.formations[args.customerId]) {
          return {
            content: [
              {
                type: "text",
                text: `Error: No business formation found for customer ${args.customerId}. Please complete Call 1 first.`
              }
            ],
            isError: true
          };
        }

        data.formations[args.customerId].call2 = {
          businessName: args.businessName,
          businessType: args.businessType,
          formationState: args.formationState,
          trademarkNeeds: args.trademarkNeeds,
          industry: args.industry,
          completedAt: new Date().toISOString()
        };

        saveData(data);
        return {
          content: [
            {
              type: "text",
              text: `Legal formation details saved for ${args.businessName || 'the business'}. Formation type: ${args.businessType || 'TBD'}`
            }
          ]
        };

      case "save_banking_operations":
        if (!data.formations[args.customerId]) {
          return {
            content: [
              {
                type: "text",
                text: `Error: No business formation found for customer ${args.customerId}.`
              }
            ],
            isError: true
          };
        }

        data.formations[args.customerId].call3 = {
          bankingPreference: args.bankingPreference,
          paymentProcessing: args.paymentProcessing,
          accountingSoftware: args.accountingSoftware,
          estimatedRevenue: args.estimatedRevenue,
          completedAt: new Date().toISOString()
        };

        saveData(data);
        return {
          content: [
            {
              type: "text",
              text: `Banking and operations details saved. Banking: ${args.bankingPreference || 'TBD'}, Estimated revenue: $${args.estimatedRevenue || 'TBD'}`
            }
          ]
        };

      case "save_website_marketing":
        if (!data.formations[args.customerId]) {
          return {
            content: [
              {
                type: "text",
                text: `Error: No business formation found for customer ${args.customerId}.`
              }
            ],
            isError: true
          };
        }

        data.formations[args.customerId].call4 = {
          websiteRequirements: args.websiteRequirements,
          brandingPreferences: args.brandingPreferences,
          marketingGoals: args.marketingGoals,
          domainPreference: args.domainPreference,
          packageSelected: args.packageSelected,
          completedAt: new Date().toISOString()
        };

        // Mark as completed and calculate revenue
        data.formations[args.customerId].status = 'completed';
        data.formations[args.customerId].completedAt = new Date().toISOString();

        if (args.packageSelected) {
          let revenue = 0;
          switch (args.packageSelected) {
            case 'Launch Basic': revenue = 999; break;
            case 'Launch Pro': revenue = 1799; break;
            case 'Launch Complete': revenue = 3499; break;
          }
          data.formations[args.customerId].revenue = revenue;
          data.analytics.totalRevenue += revenue;
        }

        saveData(data);
        return {
          content: [
            {
              type: "text",
              text: `🎉 Business formation completed! Package: ${args.packageSelected || 'TBD'}, Domain: ${args.domainPreference || 'TBD'}`
            }
          ]
        };

      case "get_customer_info":
        const lookupId = generateCustomerId(args.phone, args.email);
        const customer = data.customers[lookupId];

        if (!customer) {
          return {
            content: [
              {
                type: "text",
                text: "No customer found with that phone number or email."
              }
            ]
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Customer found: ${customer.name || 'Name not provided'} (${customer.phone}) - Completed calls: ${customer.callsCompleted.join(', ') || 'None'}`
            }
          ]
        };

      case "get_formation_progress":
        const formation = data.formations[args.customerId];
        
        if (!formation) {
          return {
            content: [
              {
                type: "text", 
                text: "No business formation found for this customer."
              }
            ]
          };
        }

        const progress = [];
        if (formation.call1?.completedAt) progress.push("✅ Call 1: Business Concept");
        if (formation.call2?.completedAt) progress.push("✅ Call 2: Legal Formation");
        if (formation.call3?.completedAt) progress.push("✅ Call 3: Banking & Operations");
        if (formation.call4?.completedAt) progress.push("✅ Call 4: Website & Marketing");

        const nextCall = progress.length + 1;
        const businessName = formation.call2?.businessName || "their business";

        return {
          content: [
            {
              type: "text",
              text: `Progress for ${businessName}:\n${progress.join('\n')}\n\n${progress.length < 4 ? `Next: Call ${nextCall}` : 'Formation Complete! 🎉'}`
            }
          ]
        };

      case "calculate_package_pricing":
        const pricing = {
          "Launch Basic": {
            price: 999,
            features: ["LLC formation", "EIN", "Basic brand kit", "1-page website"]
          },
          "Launch Pro": {
            price: 1799,
            features: ["Everything in Basic", "Full brand kit", "5-page website", "Premium integrations"]
          },
          "Launch Complete": {
            price: 3499,
            features: ["Everything in Pro", "Priority filing", "Ongoing compliance", "1-year support"]
          }
        };

        const selectedPackage = pricing[args.package];
        if (!selectedPackage) {
          return {
            content: [
              {
                type: "text",
                text: "Invalid package. Available packages: Launch Basic ($999), Launch Pro ($1799), Launch Complete ($3499)"
              }
            ]
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `${args.package}: $${selectedPackage.price}\n\nIncludes:\n• ${selectedPackage.features.join('\n• ')}`
            }
          ]
        };

      case "get_analytics":
        const analytics = data.analytics;
        const customers = Object.values(data.customers);
        const formations = Object.values(data.formations);

        switch (args.metric) {
          case "overview":
            return {
              content: [
                {
                  type: "text",
                  text: `📊 DreamSeed Analytics Overview:\n\n• Total Customers: ${customers.length}\n• Total Calls: ${analytics.totalCalls}\n• Completed Formations: ${formations.filter(f => f.status === 'completed').length}\n• Total Revenue: $${analytics.totalRevenue?.toLocaleString() || '0'}`
                }
              ]
            };

          case "funnel":
            const call1 = customers.filter(c => c.callsCompleted.includes(1)).length;
            const call2 = customers.filter(c => c.callsCompleted.includes(2)).length;
            const call3 = customers.filter(c => c.callsCompleted.includes(3)).length;
            const call4 = customers.filter(c => c.callsCompleted.includes(4)).length;

            return {
              content: [
                {
                  type: "text",
                  text: `📈 Conversion Funnel:\n\n• Call 1: ${call1} customers\n• Call 2: ${call2} customers (${call1 > 0 ? Math.round(call2/call1*100) : 0}%)\n• Call 3: ${call3} customers (${call2 > 0 ? Math.round(call3/call2*100) : 0}%)\n• Call 4: ${call4} customers (${call3 > 0 ? Math.round(call4/call3*100) : 0}%)\n\nOverall conversion: ${customers.length > 0 ? Math.round(call4/customers.length*100) : 0}%`
                }
              ]
            };

          default:
            return {
              content: [
                {
                  type: "text",
                  text: "Available analytics: overview, funnel, revenue, states"
                }
              ]
            };
        }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`
            }
          ],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vapi MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});