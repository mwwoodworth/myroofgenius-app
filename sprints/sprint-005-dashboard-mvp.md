# Sprint 005: Dashboard MVP

## Why This Matters
Your dashboard is mission control during the chaos. When three projects are in flight, two bids are due tomorrow, and your phone won't stop buzzing—you need a single place that shows what actually matters. Not vanity metrics. Not feature overload. Just the intelligence that prevents expensive surprises.

## What This Protects
- **Your focus**: Surface only what needs attention right now
- **Your margins**: Visual alerts before problems compound  
- **Your sanity**: One source of truth across all projects

## Implementation Steps

### 1. Dashboard Information Architecture

**Core Dashboard Layout:**
```jsx
<Dashboard>
  <DashboardHeader>
    <UserContext>
      <CompanyName>{user.company}</CompanyName>
      <UserRole>{user.role}</UserRole>
      <LastSync>{lastDataSync}</LastSync>
    </UserContext>
    <QuickActions>
      <ActionButton icon="plus" label="New Estimate" />
      <ActionButton icon="upload" label="Import Project" />
      <ActionButton icon="alert" label="Risk Alerts" badge={alertCount} />
    </QuickActions>
  </DashboardHeader>

  <CriticalMetrics>
    <MetricCard 
      label="Active Estimates"
      value={metrics.activeEstimates}
      trend={metrics.estimatesTrend}
      alert={metrics.overdueCount > 0}
    />
    <MetricCard 
      label="At-Risk Margin"
      value={formatCurrency(metrics.marginAtRisk)}
      trend={metrics.marginTrend}
      alert={metrics.marginHealth < 0.85}
    />
    <MetricCard 
      label="Pending Decisions"
      value={metrics.pendingDecisions}
      trend={null}
      alert={metrics.urgentDecisions > 0}
    />
    <MetricCard 
      label="Win Rate"
      value={formatPercent(metrics.winRate)}
      trend={metrics.winRateTrend}
      period="Last 90 days"
    />
  </CriticalMetrics>

  <ProjectGrid>
    <ActiveProjects>
      {projects.map(project => (
        <ProjectCard key={project.id}>
          <ProjectHeader>
            <ProjectName>{project.name}</ProjectName>
            <ProjectStatus status={project.status} />
            <DueDate urgent={project.daysUntilDue < 2}>
              {project.dueDate}
            </DueDate>
          </ProjectHeader>
          
          <ProjectMetrics>
            <Metric label="Base" value={project.baseCost} />
            <Metric label="Risk" value={project.riskExposure} alert />
            <Metric label="Margin" value={project.currentMargin} />
          </ProjectMetrics>
          
          <ProjectAlerts>
            {project.alerts.map(alert => (
              <Alert 
                severity={alert.severity}
                message={alert.message}
                action={alert.suggestedAction}
              />
            ))}
          </ProjectAlerts>
          
          <ProjectActions>
            <Action icon="edit" label="Edit Estimate" />
            <Action icon="analyze" label="Re-run Analysis" />
            <Action icon="export" label="Export" />
          </ProjectActions>
        </ProjectCard>
      ))}
    </ActiveProjects>

    <RiskRadar>
      <RadarHeader>
        <Title>Risk Radar</Title>
        <TimeFilter>
          <Option value="24h">24 Hours</Option>
          <Option value="7d" selected>7 Days</Option>
          <Option value="30d">30 Days</Option>
        </TimeFilter>
      </RadarHeader>
      
      <RiskList>
        {risks.map(risk => (
          <RiskItem severity={risk.severity}>
            <RiskProject>{risk.projectName}</RiskProject>
            <RiskType>{risk.type}</RiskType>
            <RiskImpact>{formatCurrency(risk.potentialImpact)}</RiskImpact>
            <RiskAction onClick={() => navigateToRisk(risk)}>
              Review →
            </RiskAction>
          </RiskItem>
        ))}
      </RiskList>
    </RiskRadar>
  </ProjectGrid>

  <RecentActivity>
    <ActivityHeader>
      <Title>Project Activity</Title>
      <ViewAll href="/activity">View All</ViewAll>
    </ActivityHeader>
    
    <ActivityFeed>
      {activities.map(activity => (
        <ActivityItem key={activity.id}>
          <ActivityTime>{formatTime(activity.timestamp)}</ActivityTime>
          <ActivityUser>{activity.user}</ActivityUser>
          <ActivityAction>{activity.action}</ActivityAction>
          <ActivityProject>{activity.project}</ActivityProject>
        </ActivityItem>
      ))}
    </ActivityFeed>
  </RecentActivity>
</Dashboard>
```

### 2. Role-Based Dashboard Views

**Estimator Dashboard Focus:**
```javascript
const estimatorDashboard = {
  primaryMetrics: [
    'estimates_in_progress',
    'total_risk_exposure', 
    'average_margin',
    'win_rate_trend'
  ],
  
  alertPriorities: {
    margin_erosion: 'critical',
    missing_data: 'high',
    deadline_approaching: 'high',
    historical_pattern_match: 'medium'
  },
  
  quickActions: [
    'new_estimate',
    'import_from_excel',
    'risk_analysis',
    'compare_estimates'
  ],
  
  dataRefreshRate: 60 // seconds
};

const architectDashboard = {
  primaryMetrics: [
    'active_specifications',
    'compliance_alerts',
    'rfi_prevention_rate',
    'spec_accuracy_score'
  ],
  
  alertPriorities: {
    code_update: 'critical',
    compatibility_issue: 'critical',
    manufacturer_change: 'high',
    detail_review_needed: 'medium'
  },
  
  quickActions: [
    'new_specification',
    'validate_spec',
    'detail_library',
    'code_checker'
  ]
};
```

### 3. Real-Time Data Pipeline

**WebSocket Connection for Live Updates:**
```javascript
class DashboardDataService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.subscribers = new Map();
  }

  connect() {
    this.ws = new WebSocket(process.env.REACT_APP_WS_URL);
    
    this.ws.onopen = () => {
      console.log('Dashboard connected');
      this.reconnectAttempts = 0;
      this.subscribeToUpdates();
    };
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleUpdate(update);
    };
    
    this.ws.onerror = (error) => {
      console.error('Dashboard connection error:', error);
      this.scheduleReconnect();
    };
  }

  subscribeToUpdates() {
    this.ws.send(JSON.stringify({
      type: 'subscribe',
      channels: ['projects', 'risks', 'alerts', 'activity'],
      userId: getCurrentUserId()
    }));
  }

  handleUpdate(update) {
    switch(update.type) {
      case 'project_update':
        this.updateProjectData(update.data);
        break;
      case 'new_risk':
        this.addRiskAlert(update.data);
        break;
      case 'margin_alert':
        this.showMarginWarning(update.data);
        break;
      case 'activity':
        this.updateActivityFeed(update.data);
        break;
    }
  }
}
```

### 4. Alert System Implementation

**Alert Priority and Display Logic:**
```javascript
const ALERT_CONFIGS = {
  margin_below_target: {
    severity: 'critical',
    icon: 'trending_down',
    color: '#E53E3E',
    sound: true,
    persist: true,
    template: 'Project {project} margin dropped to {margin}% (target: {target}%)'
  },
  
  high_risk_identified: {
    severity: 'high',
    icon: 'warning',
    color: '#FF6B35',
    sound: false,
    persist: true,
    template: '{count} high-probability risks identified on {project}'
  },
  
  deadline_approaching: {
    severity: 'medium',
    icon: 'schedule',
    color: '#F6AD55',
    sound: false,
    persist: false,
    template: '{project} estimate due in {hours} hours'
  },
  
  data_sync_issue: {
    severity: 'low',
    icon: 'sync_problem',
    color: '#A0AEC0',
    sound: false,
    persist: false,
    template: 'Last sync: {time} ago. Some data may be stale.'
  }
};

class AlertManager {
  prioritizeAlerts(alerts) {
    const severityOrder = ['critical', 'high', 'medium', 'low'];
    
    return alerts
      .sort((a, b) => {
        const severityDiff = severityOrder.indexOf(a.severity) - 
                            severityOrder.indexOf(b.severity);
        if (severityDiff !== 0) return severityDiff;
        
        // Within same severity, sort by timestamp
        return b.timestamp - a.timestamp;
      })
      .slice(0, 5); // Show max 5 alerts
  }
}
```

### 5. Mobile Dashboard Optimization

**Responsive Component Behavior:**
```jsx
const MobileDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  
  return (
    <MobileContainer>
      <MobileHeader>
        <CompanyLogo />
        <NotificationBadge count={alertCount} />
        <MenuToggle />
      </MobileHeader>
      
      <ViewSelector>
        <ViewTab 
          active={activeView === 'overview'} 
          onClick={() => setActiveView('overview')}
        >
          Overview
        </ViewTab>
        <ViewTab 
          active={activeView === 'projects'} 
          onClick={() => setActiveView('projects')}
        >
          Projects
        </ViewTab>
        <ViewTab 
          active={activeView === 'alerts'} 
          onClick={() => setActiveView('alerts')}
        >
          Alerts
        </ViewTab>
      </ViewSelector>
      
      <SwipeableViews index={activeView} onChangeIndex={setActiveView}>
        <OverviewPanel>
          <CompactMetrics metrics={criticalMetrics} />
          <QuickActionBar actions={mobileQuickActions} />
        </OverviewPanel>
        
        <ProjectsPanel>
          <ProjectList 
            projects={activeProjects}
            layout="compact"
            showOnlyUrgent={true}
          />
        </ProjectsPanel>
        
        <AlertsPanel>
          <AlertList 
            alerts={prioritizedAlerts}
            onDismiss={dismissAlert}
            onAction={handleAlertAction}
          />
        </AlertsPanel>
      </SwipeableViews>
      
      <MobileNavBar>
        <NavItem icon="dashboard" label="Dashboard" active />
        <NavItem icon="folder" label="Projects" />
        <NavItem icon="add" label="New" primary />
        <NavItem icon="analytics" label="Reports" />
        <NavItem icon="settings" label="Settings" />
      </MobileNavBar>
    </MobileContainer>
  );
};
```

## Design & UX Specifications

**Visual Hierarchy:**
```css
/* Critical information styling */
.metric-critical {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.metric-secondary {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-secondary);
}

/* Alert severity colors */
.alert-critical { 
  background: #FEE; 
  border-left: 4px solid #E53E3E;
  animation: pulse 2s infinite;
}

.alert-high { 
  background: #FFF5F0; 
  border-left: 4px solid #FF6B35;
}

.alert-medium { 
  background: #FFFAF0; 
  border-left: 4px solid #F6AD55;
}

/* Project status indicators */
.status-active { color: #3E92CC; }
.status-pending { color: #F6AD55; }
.status-at-risk { color: #E53E3E; }
.status-complete { color: #48BB78; }
```

**Animation and Feedback:**
```css
/* Subtle animations for data updates */
@keyframes dataUpdate {
  0% { background-color: transparent; }
  50% { background-color: rgba(62, 146, 204, 0.1); }
  100% { background-color: transparent; }
}

.metric-updated {
  animation: dataUpdate 1s ease-out;
}

/* Loading states */
.skeleton-loader {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}
```

## Acceptance Criteria

### Core Functionality
- [ ] Dashboard loads in < 2 seconds
- [ ] Real-time updates without page refresh
- [ ] Role-based views display correctly
- [ ] All metrics calculate accurately

### Data Integrity
- [ ] Sync status clearly visible
- [ ] Stale data warnings appear after 5 minutes
- [ ] Error states handle gracefully
- [ ] Offline mode shows cached data

### User Experience
- [ ] Mobile view fully functional
- [ ] Touch targets minimum 44px
- [ ] Smooth transitions between views
- [ ] Accessible with keyboard navigation

### Performance
- [ ] 60fps scrolling on all devices
- [ ] WebSocket reconnection automatic
- [ ] Memory usage stable over time
- [ ] CPU usage < 30% idle

## Operator QA Checklist

### Functional Testing
1. Login as each role type - verify correct dashboard
2. Create new project - appears in dashboard immediately
3. Trigger each alert type - verify display and sound
4. Test quick actions - all navigate correctly
5. Verify data refresh - changes appear within 3 seconds

### Mobile Testing
1. Test on iPhone 12 Pro, Samsung S21, iPad
2. Verify swipe gestures work smoothly
3. Test landscape and portrait orientations
4. Verify touch targets are easily tappable
5. Test offline mode - shows appropriate messaging

### Performance Testing
1. Load dashboard with 50+ active projects
2. Leave open for 24 hours - check memory usage
3. Simulate poor network - verify graceful degradation
4. Test with 10 concurrent users - verify speed
5. Check WebSocket reconnection after network loss

### Visual Testing
1. Verify all status colors are distinguishable
2. Test with browser zoom 50% - 200%
3. Check dark mode if implemented
4. Verify charts render correctly
5. Test with colorblind simulator

## Assigned AI

**Primary:** Codex - Implementation and real-time features  
**Secondary:** Operator - Testing across devices and roles  
**Review:** Claude - UX copy and information architecture