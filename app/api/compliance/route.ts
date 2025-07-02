import { NextResponse } from 'next/server'
import { ComplianceEngine } from '@/lib/compliance/engine'

async function saveComplianceReport(report: any) {
  // placeholder for persistence logic
  console.log('Saving compliance report', report.projectId)
}

export async function POST(request: Request) {
  const project = await request.json()
  const engine = new ComplianceEngine()

  if (project.location?.state === 'FL') {
    engine.registerCheck({
      code: 'FL-HVHZ',
      description: 'High Velocity Hurricane Zone requirements',
      category: 'critical',
      validator: (p) => {
        return {
          passed: p.windRating >= 150,
          message: 'Project must meet HVHZ wind requirements',
          recommendations: ['Use enhanced fastening schedule', 'Require product approval']
        }
      }
    })
  }

  const report = await engine.runComplianceCheck(project)
  await saveComplianceReport(report)
  return NextResponse.json(report)
}
