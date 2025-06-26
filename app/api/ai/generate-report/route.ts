import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { analysis, address, roofImageUrl, recommendations } = await request.json()

    const pdf = await PDFDocument.create()
    const page = pdf.addPage()
    const { width, height } = page.getSize()
    const font = await pdf.embedFont(StandardFonts.Helvetica)

    page.drawText('Roof Analysis Report', {
      x: 50,
      y: height - 50,
      size: 24,
      font,
      color: rgb(0.1, 0.1, 0.1)
    })

    if (address) {
      page.drawText(`Property: ${address}`, { x: 50, y: height - 80, size: 12, font })
    }

    page.drawText('Key Findings', { x: 50, y: height - 120, size: 16, font })
    page.drawText(`Roof Area: ${analysis.square_feet} sq ft`, { x: 70, y: height - 140, size: 12, font })
    page.drawText(`Material: ${analysis.material}`, { x: 70, y: height - 160, size: 12, font })
    page.drawText(`Condition: ${analysis.condition}`, { x: 70, y: height - 180, size: 12, font })

    if (recommendations?.length) {
      page.drawText('AI Recommendations', { x: 50, y: height - 220, size: 16, font })
      recommendations.forEach((rec: string, idx: number) => {
        page.drawText(`${idx + 1}. ${rec}`, { x: 70, y: height - 240 - idx * 20, size: 12, font })
      })
    }

    const pdfBytes = await pdf.save()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const fileName = `report_${Date.now()}.pdf`
    const { error } = await supabase.storage.from('reports').upload(fileName, pdfBytes, {
      contentType: 'application/pdf'
    })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Failed to upload report' }, { status: 500 })
    }

    const { data } = await supabase.storage.from('reports').createSignedUrl(fileName, 86400)
    return NextResponse.json({ report_url: data?.signedUrl })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
