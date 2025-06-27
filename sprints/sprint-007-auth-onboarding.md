# Sprint 007: Auth and Onboarding

## Why This Matters
First impressions happen once. When a stressed estimator signs up at 10 PM after losing another bid to hidden costs, they need immediate value—not a tour of features they'll never use. Your onboarding flow is the bridge between skepticism and trust, between "another app" and "my protective system."

## What This Protects
- **User confidence**: They know exactly what to do first
- **Time investment**: Get to value in under 3 minutes
- **Trust building**: Demonstrate competence immediately

## Implementation Steps

### 1. Authentication Architecture

**Secure, Simple Auth Flow:**
```javascript
// Auth service configuration
const authConfig = {
  providers: {
    email: {
      enabled: true,
      passwordRequirements: {
        minLength: 12,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventCommon: true // Check against common passwords
      },
      magicLink: {
        enabled: true,
        expiration: 900, // 15 minutes
        rateLimit: 3 // per hour
      }
    },
    google: {
      enabled: true,
      scopes: ['email', 'profile'],
      clientId: process.env.GOOGLE_CLIENT_ID
    },
    microsoft: {
      enabled: true,
      scopes: ['user.read'],
      tenantId: 'common' // Multi-tenant
    }
  },
  
  session: {
    duration: 86400, // 24 hours
    refresh: true,
    secure: true,
    sameSite: 'strict'
  },
  
  mfa: {
    optional: true,
    methods: ['totp', 'sms'],
    enforceFor: ['admin', 'owner']
  }
};

// Registration flow
class RegistrationService {
  async register(userData) {
    // 1. Validate inputs
    const validation = await this.validateRegistration(userData);
    if (!validation.isValid) {
      return { error: validation.errors };
    }
    
    // 2. Check for existing account
    const existing = await this.checkExistingUser(userData.email);
    if (existing) {
      return { 
        error: 'Account exists', 
        suggestion: 'Try logging in or reset your password' 
      };
    }
    
    // 3. Create account
    const user = await this.createUser({
      ...userData,
      status: 'pending_verification',
      onboardingStep: 'role_selection'
    });
    
    // 4. Send verification
    await this.sendVerificationEmail(user);
    
    // 5. Create initial workspace
    await this.createWorkspace(user);
    
    return { 
      success: true, 
      nextStep: 'verify_email',
      userId: user.id 
    };
  }
}
```

### 2. Progressive Onboarding Flow

**Smart, Role-Based Onboarding:**
```jsx
<OnboardingFlow>
  {/* Step 1: Role Selection (Immediate after email verification) */}
  <OnboardingStep step={1} name="role_selection">
    <StepHeader>
      <Title>Welcome to MyRoofGenius</Title>
      <Subtitle>Let's set up your protective system</Subtitle>
    </StepHeader>
    
    <RoleSelection>
      <RoleCard 
        role="estimator"
        selected={selectedRole === 'estimator'}
        onClick={() => selectRole('estimator')}
      >
        <RoleIcon>📊</RoleIcon>
        <RoleTitle>Commercial Estimator</RoleTitle>
        <RoleDescription>
          I prepare bids and need to catch hidden costs
        </RoleDescription>
        <RoleFeatures>
          <Feature>47-point risk analysis</Feature>
          <Feature>Margin protection alerts</Feature>
          <Feature>Historical cost patterns</Feature>
        </RoleFeatures>
      </RoleCard>
      
      <RoleCard 
        role="architect"
        selected={selectedRole === 'architect'}
        onClick={() => selectRole('architect')}
      >
        <RoleIcon>📐</RoleIcon>
        <RoleTitle>Architect/Specifier</RoleTitle>
        <RoleDescription>
          I specify roof systems and need accuracy
        </RoleDescription>
        <RoleFeatures>
          <Feature>Code compliance verification</Feature>
          <Feature>Manufacturer compatibility</Feature>
          <Feature>Detail library access</Feature>
        </RoleFeatures>
      </RoleCard>
      
      <RoleCard 
        role="owner"
        selected={selectedRole === 'owner'}
        onClick={() => selectRole('owner')}
      >
        <RoleIcon>🏢</RoleIcon>
        <RoleTitle>Building Owner</RoleTitle>
        <RoleDescription>
          I evaluate proposals and protect assets
        </RoleDescription>
        <RoleFeatures>
          <Feature>Quote comparison tools</Feature>
          <Feature>20-year cost modeling</Feature>
          <Feature>Risk assessment</Feature>
        </RoleFeatures>
      </RoleCard>
    </RoleSelection>
    
    <StepAction>
      <ContinueButton 
        disabled={!selectedRole}
        onClick={() => proceedToStep(2)}
      >
        Continue
      </ContinueButton>
    </StepAction>
  </OnboardingStep>

  {/* Step 2: Immediate Value Demonstration */}
  <OnboardingStep step={2} name="quick_win">
    <StepHeader>
      <Title>See Your First Protection in Action</Title>
      <Subtitle>Try our {roleTools[selectedRole].name} (30 seconds)</Subtitle>
    </StepHeader>
    
    <QuickDemo>
      {selectedRole === 'estimator' && (
        <EstimatorDemo>
          <DemoPrompt>
            Enter a recent project's basic details to see 
            what risks you might have missed:
          </DemoPrompt>
          
          <QuickForm>
            <Input 
              label="Project Square Footage"
              type="number"
              placeholder="45,000"
              value={demoData.sqft}
              onChange={(e) => updateDemo({sqft: e.target.value})}
            />
            <Input 
              label="Building Age (years)"
              type="number"
              placeholder="23"
              value={demoData.age}
              onChange={(e) => updateDemo({age: e.target.value})}
            />
            <Select 
              label="Current Roof Type"
              value={demoData.roofType}
              onChange={(e) => updateDemo({roofType: e.target.value})}
            >
              <option value="">Select...</option>
              <option value="bur">Built-Up (BUR)</option>
              <option value="mod_bit">Modified Bitumen</option>
              <option value="epdm">EPDM</option>
              <option value="tpo">TPO</option>
            </Select>
          </QuickForm>
          
          <AnalyzeButton 
            onClick={runQuickAnalysis}
            loading={analyzing}
          >
            Run Risk Analysis
          </AnalyzeButton>
          
          {results && (
            <QuickResults>
              <ResultHeader>
                Found {results.riskCount} Hidden Risks
              </ResultHeader>
              <TopRisk>
                <RiskIcon severity={results.topRisk.severity} />
                <RiskDetails>
                  <RiskName>{results.topRisk.name}</RiskName>
                  <RiskImpact>
                    Potential Impact: ${results.topRisk.impactRange}
                  </RiskImpact>
                  <RiskProbability>
                    {results.topRisk.probability}% probability based on similar projects
                  </RiskProbability>
                </RiskDetails>
              </TopRisk>
              <ViewFullAnalysis>
                See all {results.riskCount} risks →
              </ViewFullAnalysis>
            </QuickResults>
          )}
        </EstimatorDemo>
      )}
    </QuickDemo>
    
    <StepAction>
      <SkipLink onClick={() => proceedToStep(3)}>
        Skip demo
      </SkipLink>
      <ContinueButton 
        onClick={() => proceedToStep(3)}
        enabled={demoCompleted}
      >
        Continue to Setup
      </ContinueButton>
    </StepAction>
  </OnboardingStep>

  {/* Step 3: Minimal Setup */}
  <OnboardingStep step={3} name="basic_setup">
    <StepHeader>
      <Title>Quick Setup</Title>
      <Subtitle>Just the essentials to protect your projects</Subtitle>
    </StepHeader>
    
    <SetupForm>
      <FormSection>
        <Label>Company Name</Label>
        <Input 
          value={company.name}
          onChange={(e) => updateCompany({name: e.target.value})}
          placeholder="ABC Roofing Contractors"
        />
      </FormSection>
      
      <FormSection>
        <Label>Primary Service Area</Label>
        <Select 
          value={company.serviceArea}
          onChange={(e) => updateCompany({serviceArea: e.target.value})}
        >
          <option value="">Select Region...</option>
          <option value="denver_metro">Denver Metro</option>
          <option value="front_range">Front Range</option>
          <option value="western_slope">Western Slope</option>
          <option value="multi_state">Multi-State</option>
        </Select>
        <FieldNote>
          We'll customize for your local codes and climate
        </FieldNote>
      </FormSection>
      
      <FormSection optional>
        <Label>Typical Project Size</Label>
        <RadioGroup>
          <Radio 
            name="projectSize" 
            value="small"
            checked={company.projectSize === 'small'}
            onChange={() => updateCompany({projectSize: 'small'})}
          >
            Under $100K
          </Radio>
          <Radio 
            name="projectSize" 
            value="medium"
            checked={company.projectSize === 'medium'}
            onChange={() => updateCompany({projectSize: 'medium'})}
          >
            $100K - $500K
          </Radio>
          <Radio 
            name="projectSize" 
            value="large"
            checked={company.projectSize === 'large'}
            onChange={() => updateCompany({projectSize: 'large'})}
          >
            Over $500K
          </Radio>
        </RadioGroup>
      </FormSection>
      
      <FormSection optional>
        <Toggle 
          label="Enable team invites"
          checked={company.enableTeam}
          onChange={(checked) => updateCompany({enableTeam: checked})}
        />
        <FieldNote>
          You can add team members later
        </FieldNote>
      </FormSection>
    </SetupForm>
    
    <StepAction>
      <SetupLaterLink onClick={skipSetup}>
        I'll set this up later
      </SetupLaterLink>
      <CompleteButton 
        onClick={completeOnboarding}
        loading={saving}
      >
        Start Using MyRoofGenius
      </CompleteButton>
    </StepAction>
  </OnboardingStep>
</OnboardingFlow>
```

### 3. Smart Default Configuration

**Role-Based Dashboard Setup:**
```javascript
const roleDefaults = {
  estimator: {
    dashboard: {
      widgets: [
        'active_estimates',
        'risk_alerts',
        'margin_tracker',
        'recent_analyses'
      ],
      defaultView: 'project_list'
    },
    notifications: {
      margin_alerts: true,
      risk_threshold: 'medium',
      deadline_reminders: true,
      daily_summary: false
    },
    tools: {
      primary: 'risk_analyzer',
      quickAccess: ['cost_drivers', 'margin_calculator', 'checklist_generator']
    }
  },
  
  architect: {
    dashboard: {
      widgets: [
        'active_specifications',
        'code_updates',
        'compatibility_alerts',
        'detail_library'
      ],
      defaultView: 'specification_list'
    },
    notifications: {
      code_changes: true,
      manufacturer_updates: true,
      rfi_prevention: true,
      weekly_summary: true
    },
    tools: {
      primary: 'specification_validator',
      quickAccess: ['detail_library', 'code_checker', 'compatibility_matrix']
    }
  }
};

// Apply defaults on completion
async function completeOnboarding(userId, role, preferences) {
  // Apply role defaults
  const defaults = roleDefaults[role];
  
  // Merge with user preferences
  const userConfig = {
    ...defaults,
    ...preferences,
    onboarding: {
      completed: true,
      completedAt: new Date(),
      skippedSteps: getSkippedSteps()
    }
  };
  
  // Save configuration
  await saveUserConfiguration(userId, userConfig);
  
  // Set up initial data
  await createSampleProject(userId, role);
  await subscribeToUpdates(userId, role);
  
  // Track completion
  analytics.track('Onboarding Completed', {
    userId,
    role,
    timeToComplete: calculateOnboardingTime(),
    demoCompleted: preferences.demoCompleted,
    setupCompleted: preferences.setupCompleted
  });
}
```

### 4. Progressive Disclosure

**Post-Onboarding Education:**
```jsx
const ProgressiveEducation = () => {
  const [user] = useUser();
  const [currentTip, setCurrentTip] = useState(null);
  
  // Show contextual tips based on user behavior
  useEffect(() => {
    const tip = getNextRelevantTip(user);
    if (tip && shouldShowTip(tip, user)) {
      setCurrentTip(tip);
    }
  }, [user.currentAction]);
  
  return (
    <>
      {currentTip && (
        <ContextualTip 
          tip={currentTip}
          onDismiss={() => dismissTip(currentTip.id)}
          onLearnMore={() => openHelpArticle(currentTip.helpId)}
        >
          <TipContent>
            <TipIcon>{currentTip.icon}</TipIcon>
            <TipMessage>
              <TipTitle>{currentTip.title}</TipTitle>
              <TipText>{currentTip.message}</TipText>
            </TipMessage>
          </TipContent>
          <TipActions>
            <TipAction onClick={() => executeTipAction(currentTip)}>
              {currentTip.actionLabel}
            </TipAction>
            <DismissButton onClick={() => dismissTip(currentTip.id)}>
              Got it
            </DismissButton>
          </TipActions>
        </ContextualTip>
      )}
    </>
  );
};

// Tip configuration
const progressiveTips = {
  first_estimate: {
    trigger: 'creating_first_estimate',
    title: 'Pro tip: Start with square footage',
    message: 'Enter the basics first. Our AI will identify risks as you add details.',
    actionLabel: 'Show me',
    icon: '💡'
  },
  
  risk_threshold: {
    trigger: 'viewing_high_risk',
    title: 'High risk flagged',
    message: 'This 67% probability means it happened in 2 out of 3 similar projects.',
    actionLabel: 'View similar projects',
    icon: '⚠️'
  }
};
```

### 5. Account Security

**Security Implementation:**
```javascript
// Password strength indicator
function calculatePasswordStrength(password) {
  let strength = 0;
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    notCommon: !commonPasswords.includes(password.toLowerCase())
  };
  
  strength = Object.values(checks).filter(Boolean).length;
  
  return {
    score: strength,
    level: strength < 3 ? 'weak' : strength < 5 ? 'medium' : 'strong',
    feedback: generatePasswordFeedback(checks)
  };
}

// Session management
class SessionManager {
  constructor() {
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    this.warningTime = 30 * 60 * 1000; // 30 min warning
  }
  
  startSession(user) {
    const session = {
      id: generateSessionId(),
      userId: user.id,
      startTime: Date.now(),
      lastActivity: Date.now(),
      ipAddress: getClientIP(),
      userAgent: getUserAgent()
    };
    
    this.setSessionCookie(session);
    this.startActivityMonitor();
    
    return session;
  }
  
  monitorActivity() {
    // Reset timeout on user activity
    document.addEventListener('click', this.resetTimeout);
    document.addEventListener('keypress', this.resetTimeout);
    
    // Check session validity
    setInterval(() => {
      const timeRemaining = this.getTimeRemaining();
      
      if (timeRemaining < this.warningTime && timeRemaining > 0) {
        this.showSessionWarning(timeRemaining);
      } else if (timeRemaining <= 0) {
        this.endSession();
      }
    }, 60000); // Check every minute
  }
}
```

## Design & UX Specifications

**Visual Progress Indicators:**
```css
/* Onboarding progress */
.onboarding-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
}

.progress-step {
  flex: 1;
  height: 4px;
  background: #E2E8F0;
  margin: 0 4px;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.progress-step.completed {
  background: #48BB78;
}

.progress-step.current {
  background: #3E92CC;
  animation: pulse 2s infinite;
}

/* Role cards */
.role-card {
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-card:hover {
  border-color: #CBD5E0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.role-card.selected {
  border-color: #3E92CC;
  background: #F0F9FF;
}

/* Password strength */
.password-strength-indicator {
  height: 4px;
  border-radius: 2px;
  margin-top: 8px;
  transition: all 0.3s ease;
}

.strength-weak { background: #E53E3E; width: 33%; }
.strength-medium { background: #F6AD55; width: 66%; }
.strength-strong { background: #48BB78; width: 100%; }
```

## Acceptance Criteria

### Authentication
- [ ] Email/password and SSO options work
- [ ] Password requirements enforced
- [ ] Session management secure
- [ ] MFA optional but functional

### Onboarding Flow
- [ ] Complete in under 3 minutes
- [ ] Role selection drives experience
- [ ] Demo provides immediate value
- [ ] Setup captures minimal required info

### Security
- [ ] HTTPS enforced
- [ ] Secure session cookies
- [ ] Rate limiting on auth endpoints
- [ ] Password strength indicators accurate

### Analytics
- [ ] Track drop-off points
- [ ] Measure time to value
- [ ] Record role selections
- [ ] Monitor demo engagement

## Operator QA Checklist

### Auth Flow Testing
1. Test registration with various emails
2. Verify password requirements enforced
3. Test SSO with Google and Microsoft
4. Verify email verification flow
5. Test password reset process

### Onboarding Testing
1. Complete flow for each role
2. Verify skip options work correctly
3. Test demo with edge case inputs
4. Verify defaults apply correctly
5. Test on mobile devices

### Security Testing
1. Attempt SQL injection on forms
2. Test session timeout behavior
3. Verify HTTPS redirect
4. Test rate limiting
5. Check for secure headers

### Error Handling
1. Test with existing email
2. Submit empty required fields
3. Use invalid email formats
4. Test network interruption
5. Verify error messages helpful

## Assigned AI

**Primary:** Codex - Implementation and auth flow  
**Secondary:** Operator - Security testing and validation  
**Review:** Claude - Onboarding copy and user guidance