# 🌱 Business Formation MCP Server

**Model Context Protocol server for DreamSeed business formation system**

## ✅ Setup Complete!

Your MCP server is built and ready to connect to Claude Desktop and Vapi assistants.

## 🔧 Available MCP Tools

### 1. **extract_and_save_business_data**
```
Extract business formation data from conversation text and save to database
Parameters: conversation_text, call_stage (1-4), customer_phone
```

### 2. **get_customer_progress** 
```
Get customer's business formation progress
Parameters: customer_phone OR customer_email
```

### 3. **get_state_requirements**
```
Get LLC formation requirements for a specific state
Parameters: state (California, Delaware, Texas, Florida, New York)
```

### 4. **validate_business_name**
```
Check if business name is valid and available for the state
Parameters: business_name, state
```

### 5. **calculate_formation_costs**
```
Calculate total costs for business formation in a specific state
Parameters: state, entity_type (LLC), package_type (Launch Basic/Pro/Complete)
```

### 6. **get_formation_analytics**
```
Get analytics on business formations
Parameters: metric_type (overview/by_state/by_package), date_range
```

## 🚀 Connect to Claude Desktop

Add this to your Claude Desktop config:

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "business-formation": {
      "command": "node",
      "args": ["/Users/morganwalker/DreamSeed/business-formation-mcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://plmmudazcsiksgmgphte.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your_actual_service_role_key"
      }
    }
  }
}
```

## 📞 Connect to Vapi

Update your Vapi assistant prompts to use MCP functions:

```
You are Alex, a business formation specialist. As you collect information during the conversation, use these tools to save data in real-time:

Available Tools:
- extract_and_save_business_data: Save business formation data to database
- get_customer_progress: Check customer's current progress  
- get_state_requirements: Get state-specific LLC requirements
- validate_business_name: Check if business name is valid for the state
- calculate_formation_costs: Show accurate costs for the customer's state

IMPORTANT: After collecting key information (name, email, business details), immediately use extract_and_save_business_data to save it.

Example usage:
User: "My name is John Smith, email john@email.com, starting a bakery called Sweet Treats in California"
You: Let me save that information... 
[Call extract_and_save_business_data with the conversation text]
```

## 🧪 Test MCP Functions

### Test Data Extraction:
```
extract_and_save_business_data({
  "conversation_text": "My name is Morgan Walker, email morgan.walker@gmail.com, phone 619-851-0622. It's a California LLC named HoneyHush, a gourmet biscuit business.",
  "call_stage": 1
})
```

### Test State Requirements:
```
get_state_requirements({
  "state": "California"
})
```

### Test Business Name Validation:
```
validate_business_name({
  "business_name": "HoneyHush LLC",
  "state": "California"
})
```

## 💡 Benefits

✅ **Real-time data extraction** during conversations  
✅ **Automatic database storage** in Supabase  
✅ **State-specific guidance** for customers  
✅ **Progress tracking** through the formation process  
✅ **Cost calculations** for accurate quotes  
✅ **Business name validation** to prevent issues  

## 🔑 Environment Variables

Set these in your `.env` file:

```env
SUPABASE_URL=https://plmmudazcsiksgmgphte.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## 🏗️ Development Commands

```bash
# Build the project
npm run build

# Run in development mode
npm run dev

# Watch for changes
npm run watch

# Start production server
npm start
```

## 🎯 Next Steps

1. **Get your real Supabase service role key** from the Supabase dashboard
2. **Update the .env file** with the real key
3. **Configure Claude Desktop** with the MCP server
4. **Update Vapi assistant prompts** to use MCP functions
5. **Test the complete flow** with real conversations

Your MCP server will revolutionize your business formation system by providing real-time data extraction and intelligent conversation capabilities!