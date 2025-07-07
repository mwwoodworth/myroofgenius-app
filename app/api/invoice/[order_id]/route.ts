import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts } from 'pdf-lib';

interface LicenseKey {
  license_key: string;
}

interface Order {
  id: string;
  amount: number;
  created_at: string;
  products: { name?: string }[] | null;
  license_keys: LicenseKey[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { order_id: string } }
) {
  try {
    const orderId = params.order_id;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: 'supabase not configured' }, { status: 500 });
    }
    const supabase = createClient(url, key);
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, amount, created_at, products(name), license_keys(license_key)')
      .eq('id', orderId)
      .single<Order>();
    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const drawText = (text: string, y: number) => {
    page.drawText(text, { x: 50, y, size: 12, font });
  };

  drawText('Invoice', height - 50);
  drawText(`Order: ${order.id}`, height - 80);
  drawText(`Date: ${new Date(order.created_at).toLocaleDateString()}`, height - 100);
  drawText(`Product: ${order.products ? order.products[0]?.name : ''}`, height - 120);
  drawText(`Amount: $${order.amount.toFixed(2)}`, height - 140);
  if (order.license_keys && order.license_keys.length) {
    drawText('License Keys:', height - 170);
    order.license_keys.forEach((lk: LicenseKey, idx: number) => {
      drawText(lk.license_key, height - 190 - idx * 15);
    });
  }

  const pdfBytes = await pdfDoc.save();
    const res = new NextResponse(Buffer.from(pdfBytes), { status: 200 });
    res.headers.set('Content-Type', 'application/pdf');
    res.headers.set('Content-Disposition', `attachment; filename="invoice-${order.id}.pdf"`);
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
