import os
import uuid
import secrets
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import resend
from supabase import create_client, Client
from jinja2 import Template

class FulfillmentService:
    def __init__(self):
        self.supabase: Client = create_client(
            os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        resend.api_key = os.getenv("RESEND_API_KEY")
        
    async def fulfill_order(self, stripe_session_id: str) -> Dict:
        """Complete order fulfillment process after successful payment"""
        
        # 1. Get order details
        order_result = self.supabase.table("orders").select("*").eq(
            "stripe_session_id", stripe_session_id
        ).single().execute()
        
        if not order_result.data:
            raise ValueError(f"Order not found for session {stripe_session_id}")
            
        order = order_result.data
        
        # 2. Get product and files
        product_result = self.supabase.table("products").select(
            "*, product_files(*)"
        ).eq("id", order["product_id"]).single().execute()
        
        product = product_result.data
        
        # 3. Create download tokens
        download_links = []
        expires_at = datetime.utcnow() + timedelta(days=30)
        
        for file in product["product_files"]:
            token = secrets.token_urlsafe(32)
            
            # Insert download record
            self.supabase.table("downloads").insert({
                "order_id": order["id"],
                "product_file_id": file["id"],
                "user_id": order["user_id"],
                "download_token": token,
                "expires_at": expires_at.isoformat()
            }).execute()
            
            download_links.append({
                "file_name": file["file_name"],
                "download_url": f"{os.getenv('NEXT_PUBLIC_SITE_URL')}/api/download/{token}"
            })
        
        # 4. Update order status
        self.supabase.table("orders").update({
            "status": "completed",
            "fulfilled_at": datetime.utcnow().isoformat()
        }).eq("id", order["id"]).execute()
        
        # 5. Send email
        await self._send_order_email(order, product, download_links)
        
        # 6. Track analytics
        self._track_event("order_fulfilled", {
            "order_id": order["id"],
            "product_id": product["id"],
            "amount": float(order["amount"])
        }, order["user_id"])
        
        return {
            "order_id": order["id"],
            "download_links": download_links,
            "email_sent": True
        }
    
    async def _send_order_email(self, order: Dict, product: Dict, download_links: List[Dict]):
        """Send order confirmation email with download links"""
        
        # Get email template
        template_result = self.supabase.table("email_templates").select("*").eq(
            "name", "order_confirmation"
        ).single().execute()
        
        template_data = template_result.data
        
        # Format download links
        links_html = "<ul>"
        links_text = ""
        for link in download_links:
            links_html += f'<li><a href="{link["download_url"]}">{link["file_name"]}</a></li>'
            links_text += f'- {link["file_name"]}: {link["download_url"]}\n'
        links_html += "</ul>"
        
        # Get user email
        if order["user_id"]:
            user_result = self.supabase.auth.admin.get_user_by_id(order["user_id"])
            user_email = user_result.user.email
        else:
            # Get from Stripe session metadata
            user_email = order.get("customer_email", "customer@example.com")
        
        # Render template
        html_template = Template(template_data["html_content"])
        text_template = Template(template_data["text_content"])
        
        html_content = html_template.render(
            order_number=order["id"][:8],
            download_links=links_html,
            product_name=product["name"],
            amount=f"${order['amount']:.2f}"
        )
        
        text_content = text_template.render(
            order_number=order["id"][:8],
            download_links=links_text,
            product_name=product["name"],
            amount=f"${order['amount']:.2f}"
        )
        
        # Send email via Resend
        try:
            resend.Emails.send({
                "from": "MyRoofGenius <orders@myroofgenius.com>",
                "to": user_email,
                "subject": f"Order Confirmation - {order['id'][:8]}",
                "html": html_content,
                "text": text_content
            })
        except Exception as e:
            print(f"Email send failed: {e}")
            # Log to error tracking but don't fail the order
    
    def _track_event(self, event_type: str, event_data: Dict, user_id: Optional[str] = None):
        """Track analytics event"""
        try:
            self.supabase.table("analytics_events").insert({
                "user_id": user_id,
                "event_type": event_type,
                "event_data": event_data
            }).execute()
        except Exception as e:
            print(f"Analytics tracking failed: {e}")
