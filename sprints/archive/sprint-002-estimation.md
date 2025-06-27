# Sprint 002: Estimation Engine Core

## Why This Matters
Your estimation engine is the difference between a quote that protects margins and one that bleeds money at closeout. This sprint builds the analytical backbone that catches what spreadsheets miss—the compound risks that turn profitable bids into explanations to ownership.

## What This Protects
- **Your margins**: Identifies cost drivers before they compound
- **Your reputation**: Prevents the "how did we miss that?" conversations
- **Your time**: Automates the cross-checking you do at midnight

## Implementation Steps

### 1. Core Estimation Data Model

**Database Schema:**
```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  location JSONB, -- {address, climate_zone, wind_zone}
  building_type VARCHAR(100),
  square_footage INTEGER,
  existing_system JSONB,
  created_by UUID,
  created_at TIMESTAMP
);

-- Estimates table  
CREATE TABLE estimates (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  version INTEGER,
  status VARCHAR(50), -- draft, submitted, won, lost
  base_cost DECIMAL(10,2),
  risk_adjustments JSONB,
  final_bid DECIMAL(10,2),
  margin_percentage DECIMAL(5,2),
  created_at TIMESTAMP
);

-- Cost drivers table
CREATE TABLE cost_drivers (
  id UUID PRIMARY KEY,
  estimate_id UUID REFERENCES estimates(id),
  driver_type VARCHAR(100), -- hidden_damage, code_update, access_issue
  probability DECIMAL(3,2), -- 0.00 to 1.00
  impact_low DECIMAL(10,2),
  impact_high DECIMAL(10,2),
  mitigation_strategy TEXT,
  detected_by VARCHAR(50) -- ai_analysis, user_input, historical_pattern
);
```

### 2. Risk Analysis Engine

**Core Algorithm:**
```javascript
// Risk calculation service
class RiskAnalysisEngine {
  constructor() {
    this.riskFactors = {
      deck_deterioration: {
        indicators: ['building_age > 20', 'previous_leaks', 'coastal_location'],
        impact_range: [0.15, 0.35], // 15-35% cost increase
        probability_model: 'logistic_regression'
      },
      code_compliance: {
        indicators: ['last_roof_year < current_code_year', 'jurisdiction_strictness'],
        impact_range: [0.05, 0.15],
        probability_model: 'decision_tree'
      },
      hidden_penetrations: {
        indicators: ['building_additions', 'multiple_tenants', 'retrofit_history'],
        impact_range: [0.02, 0.08],
        probability_model: 'random_forest'
      }
    };
  }

  analyzeProject(projectData) {
    const risks = [];
    
    for (const [driverType, config] of Object.entries(this.riskFactors)) {
      const probability = this.calculateProbability(projectData, config);
      if (probability > 0.3) { // 30% threshold
        risks.push({
          type: driverType,
          probability,
          impactLow: projectData.baseCost * config.impact_range[0],
          impactHigh: projectData.baseCost * config.impact_range[1],
          severity: this.calculateSeverity(probability, config.impact_range)
        });
      }
    }
    
    return this.prioritizeRisks(risks);
  }
}
```

### 3. User Interface Components

**Estimation Dashboard Layout:**
```jsx
<EstimationDashboard>
  <ProjectHeader>
    <ProjectName />
    <StatusBadge /> // Draft, In Review, Submitted
    <MarginIndicator /> // Visual margin health
  </ProjectHeader>
  
  <EstimationGrid>
    <BaseEstimate>
      <MaterialCosts />
      <LaborCosts />
      <EquipmentCosts />
      <SubtotalDisplay />
    </BaseEstimate>
    
    <RiskAnalysisPanel>
      <RiskSummary>
        <TotalRiskExposure /> // $X - $Y range
        <ConfidenceScore /> // 87% confidence in estimate
      </RiskSummary>
      <RiskDriverList>
        {risks.map(risk => (
          <RiskCard 
            severity={risk.severity}
            probability={risk.probability}
            impact={risk.impactRange}
            mitigation={risk.strategy}
          />
        ))}
      </RiskDriverList>
    </RiskAnalysisPanel>
    
    <MarginProtection>
      <CurrentMargin />
      <MarginUnderRisk /> // If all risks materialize
      <RecommendedBuffer />
    </MarginProtection>
  </EstimationGrid>
  
  <ActionBar>
    <SaveDraft />
    <RunAnalysis />
    <ExportEstimate />
    <SubmitBid />
  </ActionBar>
</EstimationDashboard>
```

### 4. AI Analysis Integration

**Analysis API Endpoint:**
```javascript
// POST /api/estimates/analyze
{
  "projectId": "uuid",
  "baseEstimate": {
    "materials": 125000,
    "labor": 85000,
    "equipment": 15000
  },
  "projectDetails": {
    "squareFootage": 45000,
    "buildingAge": 23,
    "roofType": "modified_bitumen",
    "location": {
      "city": "Denver",
      "state": "CO",
      "climateZone": "5B"
    }
  }
}

// Response
{
  "analysisId": "uuid",
  "riskScore": 7.2, // 1-10 scale
  "identifiedRisks": [
    {
      "type": "deck_deterioration",
      "probability": 0.67,
      "estimatedImpact": {
        "low": 18750,
        "high": 43750
      },
      "reasoning": "23-year-old building with modified bitumen showing typical end-of-life patterns",
      "mitigation": "Include deck inspection contingency and moisture scanning in proposal"
    }
  ],
  "marginAnalysis": {
    "targetMargin": 18.0,
    "currentMargin": 18.0,
    "riskAdjustedMargin": 11.3,
    "recommendedBuffer": 6.7
  }
}
```

### 5. Historical Pattern Learning

**Data Collection Points:**
```javascript
// Track actual vs estimated for learning
const projectCloseout = {
  estimateId: "uuid",
  actualCosts: {
    materials: 132000, // 5.6% over
    labor: 91000, // 7% over  
    equipment: 15500
  },
  discoveredIssues: [
    {
      type: "hidden_penetrations",
      count: 14,
      additionalCost: 8400
    },
    {
      type: "deck_repairs",
      squareFootage: 3200,
      additionalCost: 12800
    }
  ],
  lessons: {
    "Infrared scan would have caught wet insulation",
    "Additional site visit needed for equipment count"
  }
};

// Feed back into ML model for improved predictions
```

## Design & UX Specifications

**Visual Risk Indicators:**
- Green (0-30%): Low probability, minimal concern
- Yellow (31-60%): Moderate probability, include contingency  
- Orange (61-80%): High probability, active mitigation required
- Red (81-100%): Near certainty, major pricing adjustment needed

**Margin Health Visualization:**
```
Current: [████████████████░░░░] 18%
At Risk: [██████████░░░░░░░░░░] 11.3%
Target:  [████████████████░░░░] 18%

Recommendation: Add 6.7% buffer to protect target margin
```

**Responsive Behavior:**
- Desktop: Full dashboard with side-by-side panels
- Tablet: Stacked panels with collapsible sections
- Mobile: Focused view on risk summary, drill down for details

## Acceptance Criteria

### Core Functionality
- [ ] Estimate creation with automatic risk analysis
- [ ] Risk factors calculate within 3 seconds
- [ ] Historical data influences risk probabilities
- [ ] Margin protection recommendations display clearly

### Data Integrity
- [ ] All calculations traceable to source
- [ ] Version history for estimate iterations
- [ ] Audit log for all adjustments
- [ ] Export includes full risk documentation

### User Experience
- [ ] Risk cards sortable by severity/probability
- [ ] One-click mitigation strategy addition
- [ ] Real-time margin recalculation
- [ ] Mobile-responsive risk review

### Integration Points
- [ ] Connects to project database
- [ ] Exports to PDF proposal format
- [ ] Integrates with CRM for bid tracking
- [ ] Feeds closeout data back for learning

## Operator QA Checklist

### Functional Testing
1. Create new estimate with typical commercial project data
2. Verify risk analysis completes in < 3 seconds
3. Adjust base costs - confirm margin recalculation
4. Add manual risk factor - verify impact on total
5. Export estimate - check PDF formatting

### Edge Case Testing
1. Test with $10K project (minimum viable)
2. Test with $10M project (scale validation)
3. Input negative values - verify error handling
4. Test with incomplete data - verify required fields

### Risk Calculation Validation
1. Create identical project, verify consistent risk scores
2. Change single variable (age), verify appropriate risk change
3. Test all risk factor combinations document in `/test-data`
4. Verify probability calculations match expected ranges

### Performance Testing
1. Load dashboard with 50+ historical estimates
2. Verify search/filter responds in < 500ms
3. Test bulk operations (export multiple estimates)
4. Verify no memory leaks in long sessions

## Assigned AI

**Primary:** Codex - Core implementation and algorithm development  
**Secondary:** Gemini - Risk model optimization and data analysis  
**Review:** Claude - UX copy and explanation clarity