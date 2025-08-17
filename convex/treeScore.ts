import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// TreeScore calculation interfaces
export interface TreeMeasurements {
  height: number;
  canopyRadius: number;
  dbh: number;
  species?: string;
}

export interface HazardFactors {
  pool: boolean;
  fence: boolean;
  structures: boolean;
  utilities: boolean;
  permitting: boolean;
  steepTerrain: boolean;
  softSoil: boolean;
  limitedAccess: boolean;
  nearbyVehicles: boolean;
  glassWindows: boolean;
  septicTank: boolean;
  overheadLines: boolean;
  undergroundUtilities: boolean;
}

export interface CostParameters {
  setupCost: number;
  ratePerPoint: number;
  profitMultiplier: number;
}

export interface TreeScoreResult {
  baseTreeScore: number;
  hazardImpact: number;
  finalTreeScore: number;
  totalCost: number;
  businessRules: string[];
  riskFlags: string[];
  breakdown: {
    setupCost: number;
    scoreCost: number;
    subtotal: number;
    markup: number;
    finalCost: number;
    additionalFees: { [key: string]: number };
  };
}

/**
 * TreeScore Calculator Functions
 * Implements the TreeAI formulas TS-001, HI-001, FTS-001, TC-002
 */

// Formula TS-001: Base TreeScore Calculation
function calculateBaseTreeScore(measurements: TreeMeasurements): number {
  const { height, canopyRadius, dbh } = measurements;
  const canopyDiameter = canopyRadius * 2;
  const dbhFeet = dbh / 12;
  
  return height * canopyDiameter * dbhFeet;
}

// Formula HI-001: Hazard Impact Calculator
function calculateHazardImpact(hazards: HazardFactors): number {
  let totalImpact = 0;

  if (hazards.pool) totalImpact += 15;
  if (hazards.fence) totalImpact += 10;
  if (hazards.structures) totalImpact += 20;
  if (hazards.utilities) totalImpact += 25;
  if (hazards.permitting) totalImpact += 30;
  if (hazards.steepTerrain) totalImpact += 12;
  if (hazards.softSoil) totalImpact += 8;
  if (hazards.limitedAccess) totalImpact += 18;
  if (hazards.nearbyVehicles) totalImpact += 14;
  if (hazards.glassWindows) totalImpact += 9;
  if (hazards.septicTank) totalImpact += 7;
  if (hazards.overheadLines) totalImpact += 22;
  if (hazards.undergroundUtilities) totalImpact += 19;

  return totalImpact;
}

// Formula FTS-001: Final TreeScore
function calculateFinalTreeScore(baseScore: number, hazardImpactPercent: number): number {
  const hazardDecimal = hazardImpactPercent / 100;
  return baseScore * (1 + hazardDecimal);
}

// Formula TC-002: Total Cost Calculator
function calculateBaseCost(finalScore: number, params: CostParameters): number {
  const scoreCost = finalScore * params.ratePerPoint;
  const subtotal = params.setupCost + scoreCost;
  return subtotal * params.profitMultiplier;
}

// Business Rules Engine
function applyBusinessRules(
  measurements: TreeMeasurements,
  hazards: HazardFactors,
  hazardImpact: number,
  baseCost: number,
  params: CostParameters
): {
  adjustedCost: number;
  appliedRules: string[];
  riskFlags: string[];
  additionalFees: { [key: string]: number };
} {
  let adjustedCost = baseCost;
  const appliedRules: string[] = [];
  const riskFlags: string[] = [];
  const additionalFees: { [key: string]: number } = {};

  // BR-001: Large Tree Bonus
  if (measurements.dbh >= 24) {
    adjustedCost *= 1.15;
    appliedRules.push('BR-001: Large Tree Bonus (+15%)');
  }

  // BR-002: High-Risk Flag
  if (hazardImpact >= 50) {
    riskFlags.push('HIGH RISK: Supervisor review required');
    riskFlags.push('Site visit required before work begins');
    additionalFees['Safety Equipment'] = 150;
    adjustedCost += additionalFees['Safety Equipment'];
    appliedRules.push('BR-002: High-Risk Safety Protocol');
  }

  // BR-003: Minimum Job Size
  if (adjustedCost < 500) {
    adjustedCost = 500;
    appliedRules.push('BR-003: Minimum Job Size Enforced ($500)');
  }

  // BR-004: Crane Requirement
  const needsCrane = measurements.height > 60 || 
                    (measurements.height > 40 && hazards.limitedAccess);
  
  if (needsCrane) {
    additionalFees['Crane Setup'] = 800;
    const craneRateIncrease = params.ratePerPoint * 0.25;
    const increasedScoreCost = measurements.height * craneRateIncrease;
    adjustedCost += additionalFees['Crane Setup'] + increasedScoreCost;
    riskFlags.push('CRANE REQUIRED: Specialized operator needed');
    appliedRules.push('BR-004: Crane Requirement (+$800 + 25% rate increase)');
  }

  // BR-005: Permit Alert
  if (hazards.permitting) {
    additionalFees['Permit Processing'] = 150;
    adjustedCost += additionalFees['Permit Processing'];
    riskFlags.push('PERMITS REQUIRED: 7-14 day timeline extension');
    appliedRules.push('BR-005: Permit Processing Fee (+$150)');
  }

  return {
    adjustedCost,
    appliedRules,
    riskFlags,
    additionalFees
  };
}

// Main TreeScore calculation function
function calculateTreeScore(
  measurements: TreeMeasurements,
  hazards: HazardFactors,
  costParams: CostParameters
): TreeScoreResult {
  
  const baseTreeScore = calculateBaseTreeScore(measurements);
  const hazardImpact = calculateHazardImpact(hazards);
  const finalTreeScore = calculateFinalTreeScore(baseTreeScore, hazardImpact);
  const baseCost = calculateBaseCost(finalTreeScore, costParams);

  const businessRulesResult = applyBusinessRules(
    measurements, 
    hazards, 
    hazardImpact, 
    baseCost, 
    costParams
  );

  const scoreCost = finalTreeScore * costParams.ratePerPoint;
  const subtotal = costParams.setupCost + scoreCost;
  const markup = subtotal * (costParams.profitMultiplier - 1);

  return {
    baseTreeScore: Math.round(baseTreeScore),
    hazardImpact,
    finalTreeScore: Math.round(finalTreeScore),
    totalCost: Math.round(businessRulesResult.adjustedCost),
    businessRules: businessRulesResult.appliedRules,
    riskFlags: businessRulesResult.riskFlags,
    breakdown: {
      setupCost: costParams.setupCost,
      scoreCost: Math.round(scoreCost),
      subtotal: Math.round(subtotal),
      markup: Math.round(markup),
      finalCost: Math.round(businessRulesResult.adjustedCost),
      additionalFees: businessRulesResult.additionalFees
    }
  };
}

// Convex Mutations and Queries

export const calculateTreeScoreMutation = mutation({
  args: {
    measurements: v.object({
      height: v.number(),
      canopyRadius: v.number(),
      dbh: v.number(),
      species: v.optional(v.string())
    }),
    hazardFactors: v.object({
      pool: v.boolean(),
      fence: v.boolean(),
      structures: v.boolean(),
      utilities: v.boolean(),
      permitting: v.boolean(),
      steepTerrain: v.boolean(),
      softSoil: v.boolean(),
      limitedAccess: v.boolean(),
      nearbyVehicles: v.boolean(),
      glassWindows: v.boolean(),
      septicTank: v.boolean(),
      overheadLines: v.boolean(),
      undergroundUtilities: v.boolean()
    }),
    costParameters: v.optional(v.object({
      setupCost: v.number(),
      ratePerPoint: v.number(),
      profitMultiplier: v.number()
    }))
  },
  handler: async (ctx, args) => {
    // Use default cost parameters if not provided
    const defaultParams: CostParameters = {
      setupCost: 200,
      ratePerPoint: 0.75,
      profitMultiplier: 1.5
    };

    const costParams = args.costParameters || defaultParams;
    
    return calculateTreeScore(args.measurements, args.hazardFactors, costParams);
  }
});

export const quickEstimate = query({
  args: {
    height: v.number(),
    canopyRadius: v.number(),
    dbh: v.number()
  },
  handler: async (ctx, args) => {
    const measurements: TreeMeasurements = {
      height: args.height,
      canopyRadius: args.canopyRadius,
      dbh: args.dbh
    };
    
    const baseScore = calculateBaseTreeScore(measurements);
    
    const defaultParams: CostParameters = {
      setupCost: 200,
      ratePerPoint: 0.75,
      profitMultiplier: 1.5
    };

    const estimatedCost = calculateBaseCost(baseScore, defaultParams);
    
    let category = 'Small';
    if (baseScore > 1000) category = 'Medium';
    if (baseScore > 2000) category = 'Large';
    if (baseScore > 3500) category = 'Extra Large';

    return {
      baseScore: Math.round(baseScore),
      estimatedCost: Math.round(estimatedCost),
      category
    };
  }
});