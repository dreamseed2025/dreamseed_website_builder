import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q'
);

class BusinessLaunchChecklist {
  
  // Complete 90+ item business launch checklist organized by call stage
  getComprehensiveChecklist() {
    return {
      1: { // Foundation Call
        "contact_info": [
          "customer_name", "customer_email", "customer_phone", "address", "city", "state_of_operation", "zip", 
          "preferred_contact_method"
        ],
        "llc_filing": [
          "business_name", "entity_type", "state_of_operation", "business_purpose", 
          "registered_agent", "registered_address", "principal_business_address",
          "duration", "management_structure", "naics_code"
        ],
        "financial_operational": [
          "business_banking", "business_location_type", "business_insurance", "urgency_level"
        ]
      },
      
      2: { // Brand Identity Call
        "brand_identity": [
          "business_name", "industry_sector", "brand_personality", "target_audience",
          "brand_values", "color_preferences", "style_direction", "logo_type_preference",
          "inspiration_references", "usage_requirements", "file_format_needs",
          "color_variations", "size_considerations"
        ],
        "domain_requirements": [
          "primary_business_name", "alternative_names", "domain_extension_preference",
          "geographic_considerations", "brand_protection", "dns_management",
          "email_hosting", "subdomain_strategy", "domain_privacy"
        ],
        "website_content": [
          "business_name_tagline", "business_description", "problem_solved",
          "target_customers", "unique_value_proposition", "primary_services_products",
          "founder_story", "business_mission", "core_values"
        ]
      },
      
      3: { // Operations Call
        "financial_operational": [
          "accounting_software", "financial_projections", "funding_requirements",
          "payment_processing", "equipment_needs", "software_requirements",
          "vendor_supplier_relationships", "inventory_management", "industry_regulations",
          "employment_law", "tax_obligations", "contract_templates"
        ],
        "website_content": [
          "team_information", "company_history", "business_address", "business_phone",
          "business_email", "hours_of_operation", "service_areas", "service_descriptions",
          "pricing_information", "process_methodology", "benefits_outcomes",
          "contact_form_requirements", "analytics_tracking", "seo_keywords"
        ],
        "llc_filing": [
          "member_names", "member_addresses", "ownership_percentages", "ein_info",
          "professional_licenses", "special_permits"
        ]
      },
      
      4: { // Launch Strategy Call
        "launch_marketing": [
          "target_market_definition", "marketing_channels", "content_strategy",
          "launch_timeline", "marketing_budget", "attorney", "accountant",
          "insurance_agent", "marketing_consultant", "technology_support",
          "customer_service", "quality_control", "growth_planning",
          "exit_strategy", "succession_planning"
        ],
        "website_content": [
          "testimonials_reviews", "professional_photos", "product_images",
          "hero_images", "brand_colors", "typography_preferences",
          "social_media_links", "mobile_optimization"
        ]
      }
    };
  }

  // Calculate completion percentage for a customer
  async calculateCompletionPercentage(customerPhone) {
    try {
      const { data: customer, error } = await supabase
        .from('users')
        .select('*')
        .eq('customer_phone', customerPhone)
        .single();

      if (error || !customer) {
        return { completionPercentage: 0, breakdown: {} };
      }

      const checklist = this.getComprehensiveChecklist();
      const totalItems = this.getTotalChecklistItems();
      let completedItems = 0;
      let breakdown = {};

      // Check each call stage
      for (const [stage, categories] of Object.entries(checklist)) {
        let stageCompleted = 0;
        let stageTotal = 0;
        breakdown[`call_${stage}`] = {};

        for (const [category, fields] of Object.entries(categories)) {
          let categoryCompleted = 0;
          
          fields.forEach(field => {
            stageTotal++;
            if (customer[field] && customer[field] !== 'Not extracted' && customer[field].trim() !== '') {
              completedItems++;
              stageCompleted++;
              categoryCompleted++;
            }
          });

          breakdown[`call_${stage}`][category] = {
            completed: categoryCompleted,
            total: fields.length,
            percentage: Math.round((categoryCompleted / fields.length) * 100)
          };
        }

        breakdown[`call_${stage}`].overall = {
          completed: stageCompleted,
          total: stageTotal,
          percentage: Math.round((stageCompleted / stageTotal) * 100)
        };
      }

      const completionPercentage = Math.round((completedItems / totalItems) * 100);

      return {
        completionPercentage,
        completedItems,
        totalItems,
        breakdown,
        readiness: this.assessReadiness(breakdown)
      };

    } catch (error) {
      console.error('Error calculating completion:', error);
      return { completionPercentage: 0, breakdown: {} };
    }
  }

  getTotalChecklistItems() {
    const checklist = this.getComprehensiveChecklist();
    let total = 0;
    
    for (const categories of Object.values(checklist)) {
      for (const fields of Object.values(categories)) {
        total += fields.length;
      }
    }
    
    return total;
  }

  // Assess readiness for next steps
  assessReadiness(breakdown) {
    const readiness = {
      ready_for_llc_filing: false,
      ready_for_logo_design: false,
      ready_for_domain_purchase: false,
      ready_for_website_build: false,
      ready_for_launch: false
    };

    // LLC Filing readiness (Call 1 + basic LLC info)
    if (breakdown.call_1?.llc_filing?.percentage >= 80 && 
        breakdown.call_1?.contact_info?.percentage >= 90) {
      readiness.ready_for_llc_filing = true;
    }

    // Logo Design readiness (Call 2 brand identity)
    if (breakdown.call_2?.brand_identity?.percentage >= 70) {
      readiness.ready_for_logo_design = true;
    }

    // Domain Purchase readiness (Call 2 domain + business name)
    if (breakdown.call_2?.domain_requirements?.percentage >= 60 &&
        breakdown.call_1?.llc_filing?.percentage >= 50) {
      readiness.ready_for_domain_purchase = true;
    }

    // Website Build readiness (Call 2 + 3 content)
    if (breakdown.call_2?.website_content?.percentage >= 70 &&
        breakdown.call_3?.website_content?.percentage >= 60) {
      readiness.ready_for_website_build = true;
    }

    // Launch readiness (All calls significantly complete)
    if (breakdown.call_1?.overall?.percentage >= 80 &&
        breakdown.call_2?.overall?.percentage >= 70 &&
        breakdown.call_3?.overall?.percentage >= 70 &&
        breakdown.call_4?.overall?.percentage >= 60) {
      readiness.ready_for_launch = true;
    }

    return readiness;
  }

  // Get missing items for specific category
  getMissingItems(customer, stage, category) {
    const checklist = this.getComprehensiveChecklist();
    const fields = checklist[stage]?.[category] || [];
    
    return fields.filter(field => {
      const value = customer[field];
      return !value || value === 'Not extracted' || value.trim() === '';
    });
  }

  // Generate next action items
  generateActionItems(breakdown, customer) {
    const actions = [];

    // High priority missing items
    for (const [stage, categories] of Object.entries(breakdown)) {
      for (const [category, stats] of Object.entries(categories)) {
        if (category !== 'overall' && stats.percentage < 50) {
          const missing = this.getMissingItems(customer, stage.replace('call_', ''), category);
          if (missing.length > 0) {
            actions.push({
              priority: 'high',
              category: category,
              call_stage: stage.replace('call_', ''),
              missing_fields: missing.slice(0, 3), // Top 3 missing
              completion: stats.percentage
            });
          }
        }
      }
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

export default BusinessLaunchChecklist;

// Example usage
async function testChecklist() {
  const checklist = new BusinessLaunchChecklist();
  
  // Test with your customer
  const result = await checklist.calculateCompletionPercentage('+17279006911');
  
  console.log('📊 BUSINESS LAUNCH COMPLETION ANALYSIS');
  console.log('=====================================');
  console.log(`Overall Completion: ${result.completionPercentage}%`);
  console.log(`Items Complete: ${result.completedItems}/${result.totalItems}`);
  
  console.log('\n📞 CALL STAGE BREAKDOWN:');
  Object.entries(result.breakdown).forEach(([stage, data]) => {
    if (stage !== 'overall') {
      console.log(`\n${stage.toUpperCase()}:`);
      Object.entries(data).forEach(([category, stats]) => {
        if (category !== 'overall') {
          console.log(`  ${category}: ${stats.completed}/${stats.total} (${stats.percentage}%)`);
        }
      });
    }
  });
  
  console.log('\n🚀 READINESS ASSESSMENT:');
  Object.entries(result.readiness).forEach(([key, ready]) => {
    console.log(`  ${key}: ${ready ? '✅ Ready' : '❌ Not Ready'}`);
  });
}

// Uncomment to test
// testChecklist().catch(console.error);