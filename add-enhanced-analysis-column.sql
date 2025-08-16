-- Add enhanced analysis column to store comprehensive transcript analysis
ALTER TABLE business_formations 
ADD COLUMN enhanced_analysis JSONB;

-- Add comment for documentation
COMMENT ON COLUMN business_formations.enhanced_analysis IS 'Comprehensive transcript analysis with 100% data completeness including extracted customer info, business details, preferences, MCP function tracking, and validation results';