import os
from typing import List, Dict, Optional
from datetime import datetime
import openai
from supabase import create_client
import json
from enum import Enum

class UserRole(Enum):
    FIELD = "field"
    PROJECT_MANAGER = "pm"
    EXECUTIVE = "executive"
    HOMEOWNER = "homeowner"

class CopilotService:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.supabase = create_client(
            os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        self.conversation_cache = {}
        
    async def process_message(
        self,
        message: str,
        session_id: str,
        user_id: Optional[str],
        user_role: UserRole = UserRole.FIELD,
        context: Optional[Dict] = None
    ) -> str:
        """Process user message with full context awareness"""
        
        # 1. Get conversation history
        history = await self._get_conversation_history(session_id)
        
        # 2. Get user context
        user_context = await self._get_user_context(user_id) if user_id else {}
        
        # 3. Get role-specific prompt
        system_prompt = await self._get_system_prompt(user_role)
        
        # 4. Build messages for GPT
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add relevant context
        if user_context:
            messages.append({
                "role": "system",
                "content": f"User context: {json.dumps(user_context)}"
            })
        
        # Add conversation history (last 10 messages)
        for msg in history[-10:]:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        # 5. Check for action triggers
        action_response = await self._check_action_triggers(message, user_role, context)
        if action_response:
            return action_response
        
        # 6. Generate response
        response = await openai.ChatCompletion.acreate(
            model="gpt-4-turbo-preview",
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        
        ai_response = response.choices[0].message.content
        
        # 7. Store messages
        await self._store_messages(session_id, user_id, [
            {"role": "user", "content": message},
            {"role": "assistant", "content": ai_response}
        ])
        
        # 8. Track analytics
        self._track_interaction(user_id, user_role, message, ai_response)
        
        return ai_response
    
    async def _check_action_triggers(
        self, 
        message: str, 
        user_role: UserRole,
        context: Optional[Dict]
    ) -> Optional[str]:
        """Check for specific action triggers and handle them"""
        
        message_lower = message.lower()
        
        # Estimate generation trigger
        if any(trigger in message_lower for trigger in ["create estimate", "generate estimate", "new estimate"]):
            if user_role in [UserRole.FIELD, UserRole.PROJECT_MANAGER]:
                estimate_data = await self._generate_estimate_template(context)
                return f"I've created a new estimate template for you:\n\n{estimate_data['summary']}\n\nYou can access it here: {estimate_data['link']}"
        
        # Report generation
        if "generate report" in message_lower or "create report" in message_lower:
            report_data = await self._generate_report(context)
            return f"I've generated your report:\n\n{report_data['summary']}\n\nDownload it here: {report_data['link']}"
        
        # Support ticket creation
        if "support" in message_lower and "ticket" in message_lower:
            ticket = await self._create_support_ticket(message, context.get("user_id"))
            return f"I've created support ticket #{ticket['id'][:8]}. Our team will respond within 2 business hours."
        
        # Order lookup
        if "order" in message_lower and any(word in message_lower for word in ["status", "where", "find"]):
            if context and context.get("user_id"):
                orders = await self._get_recent_orders(context["user_id"])
                if orders:
                    order_text = "\n".join([
                        f"- Order #{o['id'][:8]}: {o['product_name']} - ${o['amount']} ({o['status']})"
                        for o in orders[:5]
                    ])
                    return f"Here are your recent orders:\n\n{order_text}"
        
        return None
    
    async def _get_conversation_history(self, session_id: str) -> List[Dict]:
        """Get conversation history from database"""
        
        result = self.supabase.table("copilot_messages").select("*").eq(
            "session_id", session_id
        ).order("created_at").execute()
        
        return result.data or []
    
    async def _get_user_context(self, user_id: str) -> Dict:
        """Get relevant user context for personalization"""
        
        # Get user profile
        profile = self.supabase.table("user_profiles").select("*").eq(
            "user_id", user_id
        ).single().execute()
        
        # Get recent activity
        recent_analyses = self.supabase.table("roof_analyses").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).limit(3).execute()
        
        recent_orders = self.supabase.table("orders").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).limit(3).execute()
        
        return {
            "profile": profile.data if profile.data else {},
            "recent_analyses": recent_analyses.data if recent_analyses.data else [],
            "recent_orders": recent_orders.data if recent_orders.data else [],
            "subscription_tier": profile.data.get("subscription_tier", "free") if profile.data else "free"
        }
    
    async def _get_system_prompt(self, user_role: UserRole) -> str:
        """Get role-specific system prompt"""
        
        prompt_name = f"copilot_{user_role.value}"
        
        result = self.supabase.table("prompts").select("content").eq(
            "name", prompt_name
        ).eq("is_active", True).order("version", desc=True).limit(1).execute()
        
        if result.data:
            return result.data[0]["content"]
        
        # Fallback prompts
        fallback_prompts = {
            UserRole.FIELD: """You are an AI assistant for roofing field workers. Help with:
            - Quick measurements and calculations
            - Material identification and recommendations  
            - Safety guidelines and best practices
            - Weather considerations
            - Photo analysis for damage assessment
            Be concise and practical. Field workers need quick, actionable answers.""",
            
            UserRole.PROJECT_MANAGER: """You are an AI assistant for roofing project managers. Help with:
            - Project scheduling and resource allocation
            - Cost estimation and budget management
            - Crew coordination and communication
            - Progress tracking and reporting
            - Client communication templates
            Provide detailed, professional responses with business context.""",
            
            UserRole.EXECUTIVE: """You are an AI assistant for roofing company executives. Help with:
            - Business analytics and KPIs
            - Market trends and competitive analysis
            - Strategic planning and growth opportunities
            - Financial performance and profitability
            - Team performance and operational efficiency
            Focus on high-level insights and strategic recommendations.""",
            
            UserRole.HOMEOWNER: """You are an AI assistant helping homeowners with roofing questions. Help with:
            - Understanding roofing problems and solutions
            - Evaluating contractor quotes and proposals
            - Maintenance tips and schedules
            - Insurance claim guidance
            - Material options and warranties
            Use simple language and explain technical terms."""
        }
        
        return fallback_prompts.get(user_role, fallback_prompts[UserRole.FIELD])
    
    async def _store_messages(self, session_id: str, user_id: Optional[str], messages: List[Dict]):
        """Store messages in database"""
        
        records = []
        for msg in messages:
            records.append({
                "session_id": session_id,
                "user_id": user_id,
                "role": msg["role"],
                "content": msg["content"],
                "metadata": msg.get("metadata", {})
            })
        
        self.supabase.table("copilot_messages").insert(records).execute()
    
    async def _generate_estimate_template(self, context: Optional[Dict]) -> Dict:
        """Generate an estimate template"""
        
        # In production, this would create an actual estimate in the system
        estimate_id = str(uuid.uuid4())[:8]
        
        return {
            "summary": f"Estimate #{estimate_id}\n- 2,000 sq ft asphalt shingle replacement\n- Includes tear-off and disposal\n- Estimated total: $8,500-$10,500",
            "link": f"/estimates/{estimate_id}",
            "id": estimate_id
        }
    
    async def _generate_report(self, context: Optional[Dict]) -> Dict:
        """Generate a report"""
        
        report_id = str(uuid.uuid4())[:8]
        
        return {
            "summary": "Roof Inspection Report generated with 15 photos and detailed findings",
            "link": f"/reports/{report_id}.pdf",
            "id": report_id
        }
    
    async def _create_support_ticket(self, message: str, user_id: Optional[str]) -> Dict:
        """Create a support ticket"""
        
        ticket = self.supabase.table("support_tickets").insert({
            "user_id": user_id,
            "subject": "Support request via AI Copilot",
            "description": message,
            "priority": "medium"
        }).execute()
        
        return ticket.data[0]
    
    async def _get_recent_orders(self, user_id: str) -> List[Dict]:
        """Get recent orders for a user"""
        
        result = self.supabase.table("orders").select(
            "*, products(name)"
        ).eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
        
        orders = []
        for order in result.data:
            orders.append({
                "id": order["id"],
                "product_name": order["products"]["name"],
                "amount": order["amount"],
                "status": order["status"],
                "created_at": order["created_at"]
            })
        
        return orders
    
    def _track_interaction(self, user_id: Optional[str], user_role: UserRole, message: str, response: str):
        """Track copilot interaction for analytics"""
        
        try:
            self.supabase.table("analytics_events").insert({
                "user_id": user_id,
                "event_type": "copilot_interaction",
                "event_data": {
                    "user_role": user_role.value,
                    "message_length": len(message),
                    "response_length": len(response),
                    "timestamp": datetime.utcnow().isoformat()
                }
            }).execute()
        except Exception as e:
            print(f"Analytics tracking failed: {e}")
