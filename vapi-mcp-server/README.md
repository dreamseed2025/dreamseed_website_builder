# 🌱 Vapi MCP Server for DreamSeed Business Formation

**Powerful MCP server that lets your Vapi assistants directly save and retrieve business formation data in real-time during conversations!**

## 🚀 What This Does

Your Vapi assistants can now:
- ✅ **Save customer info** as they collect it during calls
- ✅ **Store business concepts** from Call 1 in real-time
- ✅ **Track legal formation** details from Call 2
- ✅ **Record banking/operations** from Call 3  
- ✅ **Capture website/marketing** and final package selection from Call 4
- ✅ **Retrieve previous data** to provide continuity between calls
- ✅ **Calculate pricing** and show package options
- ✅ **Generate analytics** on demand

## 🛠 Available MCP Tools

### Customer Management
- `save_customer_info` - Save contact details during any call
- `get_customer_info` - Look up existing customer by phone/email

### Business Formation Tracking  
- `save_business_concept` - Store Call 1 business ideas
- `save_legal_formation` - Store Call 2 legal details
- `save_banking_operations` - Store Call 3 banking setup
- `save_website_marketing` - Store Call 4 website/package selection

### Progress & Analytics
- `get_formation_progress` - Check customer's completion status
- `calculate_package_pricing` - Show pricing for different packages
- `get_analytics` - Real-time funnel and revenue metrics

## 🔧 Setup Instructions

1. **Install dependencies:**
   ```bash
   cd vapi-mcp-server
   npm install
   ```

2. **Test the server:**
   ```bash
   npm start
   ```

3. **Configure in Vapi:**
   - Go to your Vapi assistant settings
   - Add MCP server connection
   - Use the server path and tools

## 💡 Example Usage in Vapi Conversations

**Call 1 - Business Concept:**
```
Assistant: "Let me save your contact information..."
→ Calls save_customer_info(phone="555-1234", name="John Smith", callNumber=1)