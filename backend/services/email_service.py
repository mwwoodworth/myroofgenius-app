import os
from typing import Dict, List, Optional
import resend
from jinja2 import Template
from supabase import create_client, Client
import premailer

class EmailService:
    def __init__(self):
        resend.api_key = os.getenv("RESEND_API_KEY")
        self.supabase: Client = create_client(
            os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        self.from_email = "MyRoofGenius <noreply@myroofgenius.com>"
        
    async def send_transactional_email(
        self,
        to: str,
        template_name: str,
        context: Dict,
        attachments: Optional[List[Dict]] = None
    ) -> bool:
        """Send a transactional email using a template"""
        
        try:
            # Get template
            template_result = self.supabase.table("email_templates").select("*").eq(
                "name", template_name
            ).eq("is_active", True).single().execute()
            
            if not template_result.data:
                raise ValueError(f"Email template '{template_name}' not found")
            
            template_data = template_result.data
            
            # Render template
            subject_template = Template(template_data["subject"])
            html_template = Template(template_data["html_content"])
            text_template = Template(template_data["text_content"] or "")
            
            subject = subject_template.render(**context)
            html_content = html_template.render(**context)
            text_content = text_template.render(**context) if template_data["text_content"] else None
            
            # Apply CSS inlining for better email client compatibility
            if html_content:
                html_content = premailer.transform(html_content)
            
            # Prepare email data
            email_data = {
                "from": self.from_email,
                "to": to,
                "subject": subject,
                "html": html_content
            }
            
            if text_content:
                email_data["text"] = text_content
            
            if attachments:
                email_data["attachments"] = attachments
            
            # Send via Resend
            response = resend.Emails.send(email_data)
            
            # Log email send
            self._log_email_send(
                to=to,
                template=template_name,
                subject=subject,
                status="sent",
                message_id=response.get("id")
            )
            
            return True
            
        except Exception as e:
            print(f"Email send failed: {e}")
            self._log_email_send(
                to=to,
                template=template_name,
                subject=context.get("subject", ""),
                status="failed",
                error=str(e)
            )
            return False
    
    async def send_bulk_email(
        self,
        recipients: List[Dict[str, str]],
        template_name: str,
        common_context: Dict,
        batch_size: int = 50
    ) -> Dict[str, int]:
        """Send bulk emails with personalization"""
        
        sent = 0
        failed = 0
        
        # Process in batches
        for i in range(0, len(recipients), batch_size):
            batch = recipients[i:i + batch_size]
            
            for recipient in batch:
                # Merge common context with recipient-specific data
                context = {**common_context, **recipient}
                
                success = await self.send_transactional_email(
                    to=recipient["email"],
                    template_name=template_name,
                    context=context
                )
                
                if success:
                    sent += 1
                else:
                    failed += 1
        
        return {"sent": sent, "failed": failed}
    
    def _log_email_send(
        self,
        to: str,
        template: str,
        subject: str,
        status: str,
        message_id: Optional[str] = None,
        error: Optional[str] = None
    ):
        """Log email send attempt"""
        try:
            self.supabase.table("email_logs").insert({
                "to_email": to,
                "template": template,
                "subject": subject,
                "status": status,
                "message_id": message_id,
                "error": error
            }).execute()
        except Exception as e:
            print(f"Failed to log email: {e}")
