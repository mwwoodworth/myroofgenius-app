# Sprint 006: Checklist Generator

## Why This Matters
Checklists are the difference between systematic protection and hoping you remembered everything. When you're managing multiple projects, each with unique requirements, you need more than a generic template. You need checklists that adapt to project specifics, capture institutional knowledge, and prevent the mistakes that compound into margin erosion.

## What This Protects
- **Your process integrity**: Nothing falls through the cracks
- **Your team's knowledge**: Captures what experienced pros check automatically
- **Your liability**: Documentation that you followed proper procedures

## Implementation Steps

### 1. Dynamic Checklist Engine

**Core Checklist Data Model:**
```javascript
const CHECKLIST_TEMPLATES = {
  estimation_review: {
    name: 'Pre-Bid Estimation Review',
    category: 'estimation',
    criticalityLevel: 'high',
    estimatedTime: '45 minutes',
    sections: [
      {
        name: 'Scope Verification',
        items: [
          {
            id: 'scope_001',
            text: 'Roof area calculations verified against drawings',
            required: true,
            evidenceType: 'calculation',
            riskFactor: 'measurement_error',
            conditional: null
          },
          {
            id: 'scope_002',
            text: 'All roof levels and transitions identified',
            required: true,
            evidenceType: 'visual_confirmation',
            riskFactor: 'missed_areas',
            conditional: {
              trigger: 'building_type === "multi_level"',
              additionalItems: ['level_transition_details']
            }
          }
        ]
      },
      {
        name: 'Hidden Cost Review',
        items: [
          {
            id: 'hidden_001',
            text: 'Deck condition assessment completed',
            required: true,
            evidenceType: 'inspection_report',
            riskFactor: 'deck_deterioration',
            conditional: {
              trigger: 'building_age > 20',
              severity: 'critical'
            }
          },
          {
            id: 'hidden_002',
            text: 'Asbestos risk evaluated for buildings pre-1980',
            required: false,
            evidenceType: 'historical_review',
            riskFactor: 'hazmat_discovery',
            conditional: {
              trigger: 'built_year < 1980',
              makeRequired: true
            }
          }
        ]
      }
    ]
  },
  
  specification_compliance: {
    name: 'Specification Compliance Check',
    category: 'architect',
    criticalityLevel: 'high',
    estimatedTime: '30 minutes',
    sections: [
      {
        name: 'Code Compliance',
        items: [
          {
            id: 'code_001',
            text: 'Current IBC version requirements verified',
            required: true,
            evidenceType: 'code_reference',
            updateFrequency: 'monthly'
          },
          {
            id: 'code_002',
            text: 'Local amendments reviewed and incorporated',
            required: true,
            evidenceType: 'jurisdiction_check',
            conditional: {
              trigger: 'jurisdiction_has_amendments === true'
            }
          }
        ]
      }
    ]
  }
};
```

### 2. Checklist Generation Interface

**Interactive Checklist Builder:**
```jsx
<ChecklistGenerator>
  <GeneratorHeader>
    <Title>Generate Project-Specific Checklist</Title>
    <SavedTemplates onClick={openTemplateLibrary}>
      My Templates ({userTemplates.length})
    </SavedTemplates>
  </GeneratorHeader>

  <ProjectContext>
    <ContextForm>
      <FormSection>
        <Label>Project Type</Label>
        <Select 
          value={projectType} 
          onChange={updateChecklistOptions}
        >
          <Option value="new_construction">New Construction</Option>
          <Option value="reroof">Re-roofing</Option>
          <Option value="repair">Repair/Maintenance</Option>
          <Option value="inspection">Inspection Only</Option>
        </Select>
      </FormSection>

      <FormSection>
        <Label>Building Characteristics</Label>
        <MultiSelect 
          options={buildingCharacteristics}
          selected={selectedCharacteristics}
          onChange={updateConditionalItems}
        />
      </FormSection>

      <FormSection>
        <Label>Known Risk Factors</Label>
        <RiskFactorInput 
          factors={identifiedRisks}
          onAdd={addRiskFactor}
          onRemove={removeRiskFactor}
        />
      </FormSection>

      <FormSection>
        <Label>Compliance Requirements</Label>
        <ComplianceSelector 
          jurisdiction={projectJurisdiction}
          requirements={applicableRequirements}
        />
      </FormSection>
    </ContextForm>
  </ProjectContext>

  <ChecklistPreview>
    <PreviewHeader>
      <ChecklistName>
        {generatedChecklist.name || 'Custom Project Checklist'}
      </ChecklistName>
      <ItemCount>
        {generatedChecklist.totalItems} items 
        ({generatedChecklist.requiredItems} required)
      </ItemCount>
      <EstimatedTime>
        ~{generatedChecklist.estimatedTime} to complete
      </EstimatedTime>
    </PreviewHeader>

    <ChecklistSections>
      {generatedChecklist.sections.map(section => (
        <Section key={section.id}>
          <SectionHeader>
            <SectionName>{section.name}</SectionName>
            <SectionProgress>
              {section.completedItems}/{section.totalItems}
            </SectionProgress>
          </SectionHeader>

          <ChecklistItems>
            {section.items.map(item => (
              <ChecklistItem 
                key={item.id}
                required={item.required}
                conditional={item.conditional}
              >
                <ItemCheckbox 
                  checked={item.completed}
                  onChange={() => toggleItem(item.id)}
                />
                <ItemText>
                  {item.text}
                  {item.conditional && (
                    <ConditionalBadge>
                      If: {item.conditional.trigger}
                    </ConditionalBadge>
                  )}
                </ItemText>
                <ItemActions>
                  {item.evidenceType && (
                    <EvidenceButton 
                      type={item.evidenceType}
                      onClick={() => attachEvidence(item.id)}
                    />
                  )}
                  <ItemNote 
                    value={item.note}
                    onChange={(note) => updateItemNote(item.id, note)}
                  />
                </ItemActions>
              </ChecklistItem>
            ))}
          </ChecklistItems>
        </Section>
      ))}
    </ChecklistSections>
  </ChecklistPreview>

  <GeneratorActions>
    <SecondaryButton onClick={saveAsTemplate}>
      Save as Template
    </SecondaryButton>
    <SecondaryButton onClick={exportChecklist}>
      Export PDF
    </SecondaryButton>
    <PrimaryButton onClick={finalizeChecklist}>
      Generate Checklist
    </PrimaryButton>
  </GeneratorActions>
</ChecklistGenerator>
```

### 3. Smart Checklist Logic

**Conditional Item Generation:**
```javascript
class ChecklistEngine {
  generateChecklist(projectData, template) {
    const checklist = {
      id: generateId(),
      projectId: projectData.id,
      name: this.generateName(projectData, template),
      sections: [],
      metadata: {
        generatedAt: new Date(),
        estimatedTime: 0,
        totalItems: 0,
        requiredItems: 0
      }
    };

    // Process each section
    template.sections.forEach(section => {
      const processedSection = this.processSection(section, projectData);
      if (processedSection.items.length > 0) {
        checklist.sections.push(processedSection);
        checklist.metadata.totalItems += processedSection.items.length;
        checklist.metadata.requiredItems += processedSection.items
          .filter(item => item.required).length;
      }
    });

    // Add project-specific items
    const customItems = this.generateCustomItems(projectData);
    if (customItems.length > 0) {
      checklist.sections.push({
        name: 'Project-Specific Requirements',
        items: customItems
      });
    }

    // Calculate time estimate
    checklist.metadata.estimatedTime = this.calculateTimeEstimate(checklist);

    return checklist;
  }

  processSection(section, projectData) {
    const processedSection = {
      ...section,
      items: []
    };

    section.items.forEach(item => {
      // Check if item applies to this project
      if (this.itemApplies(item, projectData)) {
        const processedItem = { ...item };

        // Handle conditional requirements
        if (item.conditional) {
          const conditionMet = this.evaluateCondition(
            item.conditional.trigger, 
            projectData
          );
          
          if (conditionMet) {
            if (item.conditional.makeRequired) {
              processedItem.required = true;
            }
            if (item.conditional.additionalItems) {
              // Add conditional sub-items
              const additionalItems = this.getAdditionalItems(
                item.conditional.additionalItems
              );
              processedSection.items.push(...additionalItems);
            }
          }
        }

        processedSection.items.push(processedItem);
      }
    });

    return processedSection;
  }

  generateCustomItems(projectData) {
    const customItems = [];

    // Add items based on identified risks
    projectData.risks?.forEach(risk => {
      const riskItems = this.getRiskMitigationItems(risk);
      customItems.push(...riskItems);
    });

    // Add jurisdiction-specific items
    if (projectData.jurisdiction) {
      const jurisdictionItems = this.getJurisdictionItems(
        projectData.jurisdiction
      );
      customItems.push(...jurisdictionItems);
    }

    // Add items from historical patterns
    const historicalItems = this.getHistoricalPatternItems(projectData);
    customItems.push(...historicalItems);

    return customItems;
  }
}
```

### 4. Mobile Checklist Experience

**Field-Optimized Interface:**
```jsx
const MobileChecklist = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [checklistMode, setChecklistMode] = useState('execute'); // or 'review'

  return (
    <MobileChecklistContainer>
      <ChecklistHeader>
        <BackButton onClick={navigateBack}>← Projects</BackButton>
        <ChecklistTitle>{checklist.name}</ChecklistTitle>
        <ProgressRing 
          progress={checklist.completionPercentage} 
          size="small"
        />
      </ChecklistHeader>

      {checklistMode === 'execute' && (
        <SwipeableSection>
          <SectionIndicator>
            {activeSection + 1} of {checklist.sections.length}
          </SectionIndicator>
          
          <SectionContent>
            <SectionTitle>
              {checklist.sections[activeSection].name}
            </SectionTitle>
            
            <ItemsList>
              {checklist.sections[activeSection].items.map(item => (
                <MobileChecklistItem key={item.id}>
                  <ItemRow onClick={() => toggleItem(item.id)}>
                    <CheckCircle checked={item.completed} />
                    <ItemLabel required={item.required}>
                      {item.text}
                    </ItemLabel>
                  </ItemRow>
                  
                  {item.expanded && (
                    <ItemDetails>
                      <PhotoCapture 
                        itemId={item.id}
                        onCapture={handlePhotoEvidence}
                      />
                      <VoiceNote 
                        itemId={item.id}
                        onRecord={handleVoiceNote}
                      />
                      <QuickNote 
                        value={item.note}
                        onChange={(note) => updateNote(item.id, note)}
                        placeholder="Add note..."
                      />
                    </ItemDetails>
                  )}
                </MobileChecklistItem>
              ))}
            </ItemsList>
          </SectionContent>

          <SectionNavigation>
            <NavButton 
              onClick={() => setActiveSection(activeSection - 1)}
              disabled={activeSection === 0}
            >
              Previous
            </NavButton>
            <NavButton 
              onClick={() => setActiveSection(activeSection + 1)}
              disabled={activeSection === checklist.sections.length - 1}
              primary
            >
              Next
            </NavButton>
          </SectionNavigation>
        </SwipeableSection>
      )}

      <QuickActions>
        <ActionButton icon="camera" onClick={openCamera}>
          Photo
        </ActionButton>
        <ActionButton icon="mic" onClick={startVoiceNote}>
          Note
        </ActionButton>
        <ActionButton icon="flag" onClick={flagIssue}>
          Flag
        </ActionButton>
        <ActionButton icon="share" onClick={shareChecklist}>
          Share
        </ActionButton>
      </QuickActions>
    </MobileChecklistContainer>
  );
};
```

### 5. Checklist Analytics and Learning

**Usage Pattern Tracking:**
```javascript
const ChecklistAnalytics = {
  trackItemCompletion(itemId, projectContext) {
    // Record completion patterns
    analytics.track('Checklist Item Completed', {
      itemId,
      timeToComplete: calculateTimeSpent(itemId),
      projectType: projectContext.type,
      userRole: currentUser.role,
      skipped: false,
      hadIssues: checkForFlags(itemId)
    });
  },

  analyzeChecklistEffectiveness(checklistId) {
    const stats = {
      completionRate: calculateCompletionRate(checklistId),
      averageTime: getAverageCompletionTime(checklistId),
      mostSkippedItems: getMostSkippedItems(checklistId),
      correlationWithSuccess: correlateWithProjectOutcomes(checklistId)
    };

    // Generate insights
    const insights = [];
    
    if (stats.completionRate < 0.8) {
      insights.push({
        type: 'low_completion',
        message: 'This checklist has low completion. Consider simplifying.',
        severity: 'medium'
      });
    }

    if (stats.mostSkippedItems.length > 3) {
      insights.push({
        type: 'frequently_skipped',
        message: `${stats.mostSkippedItems.length} items frequently skipped. Review relevance.`,
        items: stats.mostSkippedItems
      });
    }

    return { stats, insights };
  }
};
```

## Design & UX Specifications

**Visual Hierarchy:**
```css
/* Checklist states */
.checklist-item {
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.checklist-item.required {
  border-left: 3px solid #E53E3E;
}

.checklist-item.completed {
  background: #F0FFF4;
  opacity: 0.8;
}

.checklist-item.flagged {
  background: #FFF5F0;
  border: 1px solid #FF6B35;
}

/* Progress visualization */
.section-progress {
  height: 4px;
  background: #E2E8F0;
  border-radius: 2px;
  overflow: hidden;
}

.section-progress-bar {
  height: 100%;
  background: #48BB78;
  transition: width 0.3s ease;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .checklist-item {
    padding: 16px;
    margin-bottom: 8px;
  }
  
  .check-circle {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }
  
  .item-text {
    font-size: 16px;
    line-height: 1.5;
  }
}
```

## Acceptance Criteria

### Functional Requirements
- [ ] Generate project-specific checklists in < 2 seconds
- [ ] Support offline mode for field use
- [ ] Photo and voice evidence attachment
- [ ] Real-time sync when connection restored

### Customization
- [ ] Add/remove items from generated checklists
- [ ] Save custom templates
- [ ] Share checklists with team
- [ ] Export to PDF with evidence

### Mobile Experience
- [ ] Touch-optimized interface
- [ ] Works in bright sunlight (high contrast mode)
- [ ] Minimal data usage
- [ ] Quick actions accessible one-handed

### Analytics
- [ ] Track completion patterns
- [ ] Identify problematic items
- [ ] Suggest optimizations
- [ ] Correlate with project success

## Operator QA Checklist

### Core Functionality Testing
1. Generate checklist for each project type
2. Verify conditional items appear correctly
3. Complete checklist with all evidence types
4. Export completed checklist with attachments
5. Verify sync between devices

### Mobile Field Testing
1. Use in bright sunlight - verify visibility
2. Test with gloves on - verify touch targets
3. Complete checklist offline - verify sync
4. Test voice notes in noisy environment
5. Verify photo quality and compression

### Edge Case Testing
1. Generate checklist with 100+ items
2. Attach 50+ photos to single checklist
3. Test with intermittent connectivity
4. Switch between multiple checklists
5. Test with limited device storage

### Analytics Validation
1. Verify completion tracking accuracy
2. Test insight generation thresholds
3. Validate time tracking calculations
4. Check correlation analysis
5. Test recommendation engine

## Assigned AI

**Primary:** Codex - Core implementation and conditional logic  
**Secondary:** Operator - Mobile testing and field validation  
**Review:** Claude - Checklist content and item clarity