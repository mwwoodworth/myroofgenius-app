interface Project {
  id?: string
  roofSlope?: number
  location?: { climateZone?: number; state?: string }
  [key: string]: unknown
}

interface ComplianceCheck {
  code: string
  description: string
  category: 'critical' | 'important' | 'recommended'
  validator: (project: Project) => ComplianceResult
}

interface ComplianceResult {
  passed: boolean
  message: string
  recommendations?: string[]
  references?: string[]
}

interface ComplianceReport {
  projectId: string
  timestamp: string
  duration: number
  passed: boolean
  criticalIssues: ComplianceResult[]
  warnings: ComplianceResult[]
  recommendations: ComplianceResult[]
  fullResults: (ComplianceResult & { code: string })[]
}

export class ComplianceEngine {
  private checks: Map<string, ComplianceCheck> = new Map()

  constructor() {
    this.registerStandardChecks()
  }

  private registerStandardChecks() {
    this.registerCheck({
      code: 'IBC-1511.4',
      description: 'Cool roof requirements for low-slope roofs',
      category: 'critical',
      validator: (project) => {
        const slope = project.roofSlope ?? 0
        const location = project.location ?? {}
        if (slope < 2 && (location.climateZone ?? 0) >= 4) {
          return {
            passed: false,
            message: 'Cool roof required for low-slope in this climate zone',
            recommendations: [
              'Use roofing material with SRI \u2265 78',
              'Consider white TPO or PVC membrane',
              'Add cool roof coating to existing system'
            ],
            references: ['IBC 2021 Section 1511.4', 'ASHRAE 90.1-2019']
          }
        }
        return { passed: true, message: 'Cool roof requirements met' }
      }
    })
  }

  async runComplianceCheck(project: Project): Promise<ComplianceReport> {
    const results: (ComplianceResult & { code: string; category: string })[] = []
    const startTime = Date.now()

    for (const [code, check] of Array.from(this.checks.entries())) {
      try {
        const result = await check.validator(project)
        results.push({ code, category: check.category, ...result })
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        results.push({
          code,
          category: check.category,
          passed: false,
          message: `Check failed: ${message}`,
          recommendations: ['Manual review required']
        })
      }
    }

    return {
      projectId: project.id ?? '',
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      passed: results.every(r => r.passed || r.category !== 'critical'),
      criticalIssues: results.filter(r => !r.passed && r.category === 'critical'),
      warnings: results.filter(r => !r.passed && r.category === 'important'),
      recommendations: results.filter(r => !r.passed && r.category === 'recommended'),
      fullResults: results
    }
  }

  registerCheck(check: ComplianceCheck) {
    this.checks.set(check.code, check)
  }
}
