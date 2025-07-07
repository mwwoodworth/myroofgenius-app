import { NextResponse } from 'next/server';
import { ComplianceEngine } from '@/lib/compliance/engine';

interface Project {
  location?: { state?: string };
  windRating?: number;
  [key: string]: unknown;
}

async function saveComplianceReport(_report: unknown) {
  // placeholder for persistence logic
}

export async function POST(request: Request) {
  try {
    const project = (await request.json()) as Project;
    const engine = new ComplianceEngine();

  if (project.location?.state === 'FL') {
    engine.registerCheck({
      code: 'FL-HVHZ',
      description: 'High Velocity Hurricane Zone requirements',
      category: 'critical',
      validator: (p: Project & { windRating?: number }) => {
        return {
          passed: (p.windRating ?? 0) >= 150,
          message: 'Project must meet HVHZ wind requirements',
          recommendations: ['Use enhanced fastening schedule', 'Require product approval']
        }
      }
    })
  }

    const report = await engine.runComplianceCheck(project as Project);
    await saveComplianceReport(report);
    return NextResponse.json(report);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
