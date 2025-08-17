import { mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// Anthropic AI Assessment Action
export const performAIAssessment = action({
  args: {
    projectDescription: v.string(),
    requestId: v.optional(v.string()),
  },
  handler: async (ctx, { projectDescription, requestId }) => {
    try {
      // Get Anthropic API key from environment variables
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY not configured in Convex environment");
      }

      // Create comprehensive assessment prompt
      const prompt = `
You are Alex, the TreeAI Operations Commander. Analyze this tree service project and provide a comprehensive assessment.

PROJECT DESCRIPTION:
${projectDescription}

Please provide a complete assessment including:

1. TREE MEASUREMENTS (estimate if not provided):
   - Height (feet)
   - Canopy radius (feet) 
   - DBH - Diameter at Breast Height (inches)
   - Species (if identifiable)
   - Condition (healthy/declining/hazardous/dead)

2. SERVICE TYPE:
   - Primary service (removal/trimming/stump_grinding/emergency)
   - Location type (residential/commercial/municipal)

3. AFISS RISK ASSESSMENT (0-100% for each domain):
   - ACCESS: Equipment and crew access challenges
   - FALL ZONE: Areas where tree parts may fall
   - INTERFERENCE: Obstacles like power lines, structures
   - SEVERITY: Urgency and immediate risk factors
   - SITE CONDITIONS: Environmental conditions

4. BUSINESS ESTIMATES:
   - Estimated hours
   - Estimated cost ($)
   - Crew type needed (standard/experienced/expert/specialist)
   - Equipment required
   - Safety protocols needed
   - ISA certified arborist required? (yes/no)

5. COMPLEXITY ASSESSMENT:
   - Overall complexity (low/moderate/high/extreme)
   - Complexity multiplier (1.1x - 3.5x)

Provide specific numerical values and detailed reasoning. Be comprehensive but concise.
Format your response as JSON with the following structure:

{
  "tree_measurements": {
    "height": number,
    "canopy_radius": number,
    "dbh": number,
    "species": string,
    "condition": string
  },
  "service_details": {
    "service_type": string,
    "location_type": string
  },
  "afiss_assessment": {
    "access_score": number,
    "fall_zone_score": number,
    "interference_score": number,
    "severity_score": number,
    "site_conditions_score": number,
    "composite_score": number
  },
  "business_estimates": {
    "estimated_hours": number,
    "estimated_cost": number,
    "crew_type": string,
    "equipment_required": [string],
    "safety_protocols": [string],
    "isa_certified_required": boolean
  },
  "complexity": {
    "level": string,
    "multiplier": number,
    "factors": [string]
  },
  "treescore": {
    "base_score": number,
    "total_score": number
  },
  "reasoning": string
}`;

      // Call Anthropic API
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 3000,
          temperature: 0.1,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const assessmentText = data.content[0].text;

      // Try to parse JSON from the response
      let structuredAssessment;
      try {
        // Look for JSON in the response
        const jsonMatch = assessmentText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structuredAssessment = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        // If JSON parsing fails, create a fallback structure
        structuredAssessment = {
          raw_assessment: assessmentText,
          error: "Failed to parse structured response",
          fallback: true,
        };
      }

      // Calculate composite AFISS score if not provided
      if (structuredAssessment.afiss_assessment && !structuredAssessment.afiss_assessment.composite_score) {
        const afiss = structuredAssessment.afiss_assessment;
        structuredAssessment.afiss_assessment.composite_score = (
          afiss.access_score * 0.20 +
          afiss.fall_zone_score * 0.25 +
          afiss.interference_score * 0.20 +
          afiss.severity_score * 0.30 +
          afiss.site_conditions_score * 0.05
        );
      }

      // Add metadata
      const assessmentResult = {
        ...structuredAssessment,
        request_id: requestId || `ai_${Date.now()}`,
        project_description: projectDescription,
        model_used: "claude-3-5-sonnet-20241022",
        assessment_timestamp: Date.now(),
        raw_response: assessmentText,
      };

      return {
        status: "success",
        data: assessmentResult,
      };
    } catch (error) {
      console.error("AI Assessment Error:", error);
      return {
        status: "error",
        error: error.message,
        fallback_data: {
          project_description: projectDescription,
          error_occurred: true,
          timestamp: Date.now(),
        },
      };
    }
  },
});

// Store AI Assessment Results
export const storeAIAssessment = mutation({
  args: {
    assessmentData: v.any(),
    projectDescription: v.string(),
  },
  handler: async (ctx, { assessmentData, projectDescription }) => {
    try {
      // Store the full AI assessment
      const assessmentId = await ctx.db.insert("ai_assessments", {
        project_description: projectDescription,
        assessment_data: assessmentData,
        model_used: assessmentData.model_used || "claude-3-5-sonnet",
        assessment_timestamp: assessmentData.assessment_timestamp || Date.now(),
        request_id: assessmentData.request_id || `ai_${Date.now()}`,
        status: "completed",
        created_at: Date.now(),
      });

      // If we have structured data, also create a project record
      if (assessmentData.business_estimates && !assessmentData.fallback) {
        const projectData = {
          description: projectDescription,
          location_type: assessmentData.service_details?.location_type || "residential",
          service_type: assessmentData.service_details?.service_type || "removal",
          
          // Tree measurements
          tree_height: assessmentData.tree_measurements?.height || 0,
          canopy_radius: assessmentData.tree_measurements?.canopy_radius || 0,
          dbh: assessmentData.tree_measurements?.dbh || 0,
          tree_species: assessmentData.tree_measurements?.species || "unknown",
          tree_condition: assessmentData.tree_measurements?.condition || "unknown",
          
          // TreeScore
          base_treescore: assessmentData.treescore?.base_score || 0,
          total_treescore: assessmentData.treescore?.total_score || 0,
          
          // AFISS scores
          afiss_composite_score: assessmentData.afiss_assessment?.composite_score || 0,
          access_score: assessmentData.afiss_assessment?.access_score || 0,
          fall_zone_score: assessmentData.afiss_assessment?.fall_zone_score || 0,
          interference_score: assessmentData.afiss_assessment?.interference_score || 0,
          severity_score: assessmentData.afiss_assessment?.severity_score || 0,
          site_conditions_score: assessmentData.afiss_assessment?.site_conditions_score || 0,
          
          // Complexity
          complexity_level: assessmentData.complexity?.level || "low",
          complexity_multiplier: assessmentData.complexity?.multiplier || 1.0,
          
          // Business estimates
          estimated_hours: assessmentData.business_estimates?.estimated_hours || 0,
          estimated_cost: assessmentData.business_estimates?.estimated_cost || 0,
          crew_type_recommended: assessmentData.business_estimates?.crew_type || "standard",
          equipment_required: assessmentData.business_estimates?.equipment_required || [],
          safety_protocols: assessmentData.business_estimates?.safety_protocols || [],
          isa_certified_required: assessmentData.business_estimates?.isa_certified_required || false,
          
          // Metadata
          claude_model_used: assessmentData.model_used || "claude-3-5-sonnet",
          assessment_time_seconds: 0, // Will be calculated by timing
          ai_assessment_id: assessmentId,
        };

        const projectId = await ctx.db.insert("projects", projectData);
        
        return {
          status: "success",
          assessment_id: assessmentId,
          project_id: projectId,
          data: assessmentData,
        };
      }

      return {
        status: "success",
        assessment_id: assessmentId,
        data: assessmentData,
      };
    } catch (error) {
      console.error("Store Assessment Error:", error);
      return {
        status: "error",
        error: error.message,
      };
    }
  },
});

// Get AI Assessment History
export const getAIAssessments = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    const assessments = await ctx.db
      .query("ai_assessments")
      .order("desc")
      .take(limit);
    
    return assessments;
  },
});

// Combined AI Assessment and Storage
export const performAndStoreAssessment = action({
  args: {
    projectDescription: v.string(),
    requestId: v.optional(v.string()),
  },
  handler: async (ctx, { projectDescription, requestId }) => {
    try {
      // Perform AI assessment
      const assessmentResult = await ctx.runAction(api.alex_ai_assessment.performAIAssessment, {
        projectDescription,
        requestId,
      });

      if (assessmentResult.status === "error") {
        return assessmentResult;
      }

      // Store the assessment
      const storeResult = await ctx.runMutation(api.alex_ai_assessment.storeAIAssessment, {
        assessmentData: assessmentResult.data,
        projectDescription,
      });

      return {
        status: "success",
        assessment: assessmentResult.data,
        storage: storeResult,
      };
    } catch (error) {
      return {
        status: "error",
        error: error.message,
      };
    }
  },
});