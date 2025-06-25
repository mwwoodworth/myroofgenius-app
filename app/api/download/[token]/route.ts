import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params
  
  // Initialize Supabase with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    // 1. Validate token and check expiry
    const { data: download, error } = await supabase
      .from('downloads')
      .select(`
        *,
        product_files (
          file_name,
          file_url,
          file_type
        )
      `)
      .eq('download_token', token)
      .single()
    
    if (error || !download) {
      return NextResponse.json(
        { error: 'Invalid download link' },
        { status: 404 }
      )
    }
    
    // 2. Check if expired
    const now = new Date()
    const expiresAt = new Date(download.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Download link has expired' },
        { status: 410 }
      )
    }
    
    // 3. Check if already downloaded (optional - for single-use links)
    if (download.downloaded_at && process.env.SINGLE_USE_DOWNLOADS === 'true') {
      return NextResponse.json(
        { error: 'This file has already been downloaded' },
        { status: 410 }
      )
    }
    
    // 4. Get the file from storage
    const fileUrl = download.product_files.file_url
    const fileName = download.product_files.file_name
    
    // If file is in Supabase storage
    if (fileUrl.startsWith('/protected/')) {
      const filePath = fileUrl.replace('/protected/', '')
      const { data: fileData, error: fileError } = await supabase.storage
        .from('product-files')
        .download(filePath)
      
      if (fileError || !fileData) {
        console.error('File download error:', fileError)
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      // 5. Update download record
      await supabase
        .from('downloads')
        .update({
          downloaded_at: now.toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent')
        })
        .eq('id', download.id)
      
      // 6. Track download event
      await supabase
        .from('analytics_events')
        .insert({
          user_id: download.user_id,
          event_type: 'file_downloaded',
          event_data: {
            download_id: download.id,
            file_name: fileName,
            order_id: download.order_id
          }
        })
      
      // 7. Return file with proper headers
      const arrayBuffer = await fileData.arrayBuffer()
      
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': download.product_files.file_type || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': arrayBuffer.byteLength.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    } else {
      // Handle external URLs (CDN, S3, etc.)
      const response = await fetch(fileUrl)
      const data = await response.arrayBuffer()
      
      return new NextResponse(data, {
        headers: {
          'Content-Type': download.product_files.file_type || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': data.byteLength.toString()
        }
      })
    }
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    )
  }
}
