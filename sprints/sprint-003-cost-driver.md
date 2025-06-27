# Sprint 003: Cost Driver Analyzer

## Why This Matters
Cost drivers are the silent margin killers. They hide in specifications, compound during execution, and surface during closeout—when it's too late. This analyzer transforms tribal knowledge into systematic protection, catching the patterns that experienced estimators feel in their gut but can't always articulate at 11 PM.

## What This Protects
- **Your bid accuracy**: Quantifies the "what-ifs" that keep you up at night
- **Your negotiating position**: Arms you with data when clients push back on contingencies
- **Your project memory**: Captures lessons from every project, not just the painful ones

## Implementation Steps

### 1. Cost Driver Taxonomy

**System Architecture:**
```javascript
const COST_DRIVER_HIERARCHY = {
  structural: {
    deck_deterioration: {
      triggers: ['moisture_reading > 20%', 'visible_rust', 'deflection_observed'],
      impact_multiplier: 1.25,
      detection_method: 'infrared_scan',
      mitigation_cost: 2500 // for scan
    },
    hidden_structural: {
      triggers: ['building_age > 30', 'no_as_built_drawings', 'multiple_additions'],
      impact_multiplier: 1.15,
      detection_method: 'exploratory_demo',
      mitigation_cost: 5000
    }
  },
  
  regulatory: {
    code_updates: {
      triggers: ['last_permit_year < code_adoption_year', 'jurisdiction_change'],
      impact_multiplier: 1.12,
      detection_method: 'code_analysis',
      mitigation_cost: 0 // research time
    },
    energy_compliance: {
      triggers: ['jurisdiction === "Denver"', 'square_footage > 25000'],
      impact_multiplier: 1.08,
      detection_method: 'ordinance_check',
      mitigation_cost: 0
    }
  },
  
  environmental: {
    weather_delays: {
      triggers: ['season === "winter"', 'mountain_location', 'critical_path_work'],
      impact_multiplier: 1.10,
      detection_method: 'historical_weather',
      mitigation_cost: 0 // schedule buffer
    },
    hazmat_discovery: {
      triggers: ['built_before_1980', 'industrial_use', 'previous_renovations'],
      impact_multiplier: 1.30,
      detection_method: 'asbestos_test',
      mitigation_cost: 1500
    }
  },
  
  operational: {
    access_restrictions: {
      triggers: ['occupied_building', 'secure_facility', 'urban_location'],
      impact_multiplier: 1.18,
      detection_method: 'site_visit',
      mitigation_cost: 0
    },
    coordination_complexity: {
      triggers: ['multiple_trades', 'phased_schedule', 'tenant_coordination'],
      impact_multiplier: 1.15,
      detection_method: 'project_review',
      mitigation_cost: 0
    }
  }
};
```

### 2. Interactive Analysis Interface

**Cost Driver Dashboard:**
```jsx
<CostDriverAnalyzer>
  <AnalysisHeader>
    <ProjectContext>
      <ProjectName>{project.name}</ProjectName>
      <RiskScore score={analysis.composite_score} />
      <LastUpdated>{analysis.timestamp}</LastUpdated>
    </ProjectContext>
    <QuickStats>
      <Stat label="Identified Drivers" value={analysis.driver_count} />
      <Stat label="Total Risk Exposure" value={formatCurrency(analysis.total_exposure)} />
      <Stat label="Confidence Level" value={`${analysis.confidence}%`} />
    </QuickStats>
  </AnalysisHeader>
  
  <DriverCategories>
    {Object.entries(COST_DRIVER_HIERARCHY).map(([category, drivers]) => (
      <CategoryPanel key={category} defaultExpanded={hasHighRisk(category)}>
        <CategoryHeader>
          <CategoryName>{formatCategoryName(category)}</CategoryName>
          <CategoryRisk level={getCategoryRisk(category)} />
          <DriverCount>{getActiveDriverCount(category)}</DriverCount>
        </CategoryHeader>
        
        <DriverList>
          {Object.entries(drivers).map(([driverType, config]) => (
            <DriverCard 
              key={driverType}
              driver={driverType}
              probability={calculateProbability(project, config)}
              impact={calculateImpact(project, config)}
              status={getDriverStatus(driverType)}
            >
              <DriverDetails>
                <TriggersList triggers={config.triggers} />
                <ImpactRange 
                  low={project.baseCost * (config.impact_multiplier - 1) * 0.7}
                  high={project.baseCost * (config.impact_multiplier - 1) * 1.3}
                />
                <MitigationStrategy>
                  <DetectionMethod>{config.detection_method}</DetectionMethod>
                  <MitigationCost>{formatCurrency(config.mitigation_cost)}</MitigationCost>
                  <ActionButton onClick={() => addMitigation(driverType)}>
                    Add to Estimate
                  </ActionButton>
                </MitigationStrategy>
              </DriverDetails>
            </DriverCard>
          ))}
        </DriverList>
      </CategoryPanel>
    ))}
  </DriverCategories>
  
  <AnalysisSummary>
    <ScenarioModeling>
      <Scenario name="Best Case" exposure={analysis.exposure_10th_percentile} />
      <Scenario name="Most Likely" exposure={analysis.exposure_50th_percentile} />
      <Scenario name="Worst Case" exposure={analysis.exposure_90th_percentile} />
    </ScenarioModeling>
    
    <RecommendedActions>
      <ActionItem priority="high">
        Schedule infrared scan - High probability of wet insulation (67%)
      </ActionItem>
      <ActionItem priority="medium">
        Include 7-day weather contingency for March start
      </ActionItem>
      <ActionItem priority="low">
        Verify current energy code requirements with Denver
      </ActionItem>
    </RecommendedActions>
  </AnalysisSummary>
</CostDriverAnalyzer>
```

### 3. Historical Pattern Recognition

**Learning Engine:**
```javascript
class PatternLearningService {
  async analyzeHistoricalPatterns(projectCharacteristics) {
    // Pull similar projects from history
    const similarProjects = await db.query(`
      SELECT p.*, 
             e.final_cost - e.original_estimate as variance,
             cd.driver_type,
             cd.actual_impact
      FROM projects p
      JOIN estimates e ON p.id = e.project_id
      JOIN cost_driver_outcomes cd ON e.id = cd.estimate_id
      WHERE similarity_score(p.characteristics, $1) > 0.7
      ORDER BY p.completed_date DESC
      LIMIT 100
    `, [projectCharacteristics]);
    
    // Identify patterns
    const patterns = this.extractPatterns(similarProjects);
    
    return {
      topPatterns: patterns.slice(0, 5),
      confidenceScore: this.calculateConfidence(patterns),
      sampleSize: similarProjects.length,
      insights: this.generateInsights(patterns)
    };
  }
  
  extractPatterns(projects) {
    // Group by driver type and outcome
    const driverOutcomes = {};
    
    projects.forEach(project => {
      const key = project.driver_type;
      if (!driverOutcomes[key]) {
        driverOutcomes[key] = {
          occurrences: 0,
          totalImpact: 0,
          conditions: []
        };
      }
      
      driverOutcomes[key].occurrences++;
      driverOutcomes[key].totalImpact += project.actual_impact;
      driverOutcomes[key].conditions.push(project.characteristics);
    });
    
    // Convert to actionable patterns
    return Object.entries(driverOutcomes)
      .map(([driver, data]) => ({
        driver,
        frequency: data.occurrences / projects.length,
        averageImpact: data.totalImpact / data.occurrences,
        commonConditions: this.findCommonConditions(data.conditions)
      }))
      .sort((a, b) => b.frequency * b.averageImpact - a.frequency * a.averageImpact);
  }
}
```

### 4. Real-Time Alerts

**Alert Configuration:**
```javascript
const ALERT_THRESHOLDS = {
  margin_erosion: {
    yellow: 0.85, // 85% of target margin
    red: 0.70,    // 70% of target margin
    message: "Cost drivers reducing margin below target"
  },
  
  high_uncertainty: {
    yellow: 5,    // 5+ high-probability unknowns
    red: 10,      // 10+ high-probability unknowns
    message: "Multiple unresolved risk factors"
  },
  
  scope_creep: {
    yellow: 1.15, // 15% over base
    red: 1.30,    // 30% over base
    message: "Cumulative risk exceeds normal contingency"
  }
};

// Real-time monitoring
function monitorCostDrivers(estimate) {
  const alerts = [];
  
  // Check margin impact
  const adjustedMargin = calculateAdjustedMargin(estimate);
  if (adjustedMargin < estimate.targetMargin * ALERT_THRESHOLDS.margin_erosion.red) {
    alerts.push({
      severity: 'red',
      type: 'margin_erosion',
      message: `Margin at risk: ${adjustedMargin}% vs ${estimate.targetMargin}% target`,
      action: 'Review pricing strategy or reduce scope'
    });
  }
  
  return alerts;
}
```

### 5. Reporting and Export

**Client-Ready Report Structure:**
```markdown
# Risk Analysis Summary
Project: {project_name}
Date: {analysis_date}
Prepared for: {client_name}

## Executive Summary
Our analysis identified {count} potential cost drivers that could impact this project. 
Based on historical data from {similar_project_count} similar projects, we recommend 
a contingency of {recommended_contingency}% to maintain your target margins.

## Key Findings

### High Probability Risks
1. **Deck Deterioration** (67% probability)
   - Potential Impact: $18,750 - $43,750
   - Mitigation: Infrared moisture scan ($2,500)
   - If unmitigated: 4.2% margin reduction

### Medium Probability Risks
[List with same structure]

### Recommended Mitigation Strategy
Total Mitigation Investment: ${total_mitigation_cost}
Protected Value: ${protected_value}
ROI on Risk Mitigation: {roi}%

## Historical Context
Projects with similar characteristics experienced:
- Average cost overrun: {historical_overrun}%
- Most common issues: {top_3_issues}
- Success rate with mitigation: {success_rate}%
```

## Design & UX Specifications

**Risk Visualization Standards:**
```css
/* Probability indicators */
.probability-low { background: #E8F5E9; border-left: 4px solid #4CAF50; }
.probability-medium { background: #FFF3E0; border-left: 4px solid #FF9800; }
.probability-high { background: #FFEBEE; border-left: 4px solid #F44336; }

/* Impact severity */
.impact-minor { opacity: 0.7; }
.impact-moderate { opacity: 0.85; }
.impact-major { opacity: 1.0; font-weight: 600; }

/* Interactive states */
.driver-card:hover { transform: translateX(4px); }
.driver-card.selected { box-shadow: 0 0 0 2px #3E92CC; }
```

**Mobile Optimization:**
- Collapsible categories with severity indicators
- Swipe to dismiss/accept mitigation strategies
- Summary view with drill-down capability
- Offline capability for field analysis

## Acceptance Criteria

### Analysis Accuracy
- [ ] Identifies all standard cost drivers for project type
- [ ] Probability calculations align with historical data
- [ ] Impact ranges based on actual project outcomes
- [ ] Confidence scores reflect data quality

### User Experience
- [ ] Analysis completes in < 5 seconds
- [ ] All drivers have clear explanations
- [ ] Mitigation strategies are actionable
- [ ] Export generates professional PDF

### Integration
- [ ] Connects to estimation engine
- [ ] Updates based on project changes
- [ ] Feeds back actual outcomes
- [ ] Syncs with mobile app

### Reporting
- [ ] Client-ready export format
- [ ] Internal detailed analysis
- [ ] Historical comparison view
- [ ] ROI tracking on mitigations

## Operator QA Checklist

### Functional Validation
1. Create analysis for standard commercial project
2. Verify all 47 cost drivers evaluate correctly
3. Change project parameters, confirm updates
4. Add mitigation, verify estimate adjustment
5. Export report, check formatting and data

### Accuracy Testing
1. Run analysis on 10 historical projects
2. Compare predictions to actual outcomes
3. Verify probability calculations match formula
4. Test edge cases (tiny/huge projects)
5. Validate impact range calculations

### User Flow Testing
1. Complete analysis from project creation to export
2. Test on mobile device in field conditions
3. Verify offline mode captures all inputs
4. Test category collapse/expand states
5. Verify alert thresholds trigger correctly

### Performance Validation
1. Load analysis with 100+ historical matches
2. Verify sub-5-second analysis time
3. Test with poor network connectivity
4. Check memory usage over extended session
5. Verify smooth scrolling with all panels expanded

## Assigned AI

**Primary:** Codex - Implementation and algorithm development  
**Secondary:** Gemini - Historical pattern analysis and ML model  
**Review:** Claude - Report generation and explanation clarity