import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis, address, include_photos, format } = body
    
    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Generate PDF report
    const doc = new PDFDocument()
    const chunks: Buffer[] = []
    
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks)
      
      // Upload to Supabase storage
      const fileName = `report_${Date.now()}.pdf`
      const { data: uploadData, error } = await supabase.storage
        .from('reports')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
        })
      
      if (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Failed to upload report' }, { status: 500 })
      }
      
      const reportUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/reports/${fileName}`
      
      return NextResponse.json({ report_url: reportUrl })
    })
    
    // Generate PDF content
    doc.fontSize(20).text('Roof Analysis Report', 50, 50)
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, 50, 80)
    
    if (address) {
      doc.text(`Property: ${address}`, 50, 100)
    }
    
    doc.moveDown()
    doc.fontSize(16).text('Executive Summary', 50, 140)
    doc.fontSize(12).text(`
      This comprehensive roof analysis was conducted using advanced AI technology.
      The analysis identified a ${analysis.condition} condition roof with approximately
      ${analysis.square_feet} square feet of ${analysis.material} material.
    `, 50, 170)
    
    // Add more sections...
    doc.fontSize(16).text('Key Findings', 50, 250)
    doc.fontSize(12)
    doc.text(`• Roof Area: ${analysis.square_feet} sq ft`, 70, 280)
    doc.text(`• Material: ${analysis.material}`, 70, 300)
    doc.text(`• Condition: ${analysis.condition}`, 70, 320)
    doc.text(`• Estimated Remaining Life: ${analysis.estimated_remaining_life} years`, 70, 340)
    
    // Cost estimates
    doc.moveDown()
    doc.fontSize(16).text('Cost Estimates', 50, 380)
    doc.fontSize(12)
    doc.text(`Repair: $${analysis.repair_cost_estimate[0].toLocaleString()} - $${analysis.repair_cost_estimate[1].toLocaleString()}`, 70, 410)
    doc.text(`Replacement: $${analysis.replacement_cost_estimate[0].toLocaleString()} - $${analysis.replacement_cost_estimate[1].toLocaleString()}`, 70, 430)
    
    // Recommendations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      doc.moveDown()
      doc.fontSize(16).text('Recommendations', 50, 470)
      doc.fontSize(12)
      analysis.recommendations.forEach((rec: string, idx: number) => {
        doc.text(`${idx + 1}. ${rec}`, 70, 500 + (idx * 20))
      })
    }
    
    doc.end()
    
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
