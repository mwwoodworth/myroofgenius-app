import os
import base64
from typing import Dict, List, Optional, Tuple
import numpy as np
from PIL import Image
import io
import openai
import json
from dataclasses import dataclass
import cv2

@dataclass
class RoofAnalysisResult:
    square_feet: float
    pitch: str
    material: str
    condition: str
    damage_areas: List[Dict]
    recommendations: List[str]
    estimated_remaining_life: int
    repair_cost_estimate: Tuple[float, float]
    replacement_cost_estimate: Tuple[float, float]
    confidence_scores: Dict[str, float]

class RoofAnalyzer:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.supabase = create_client(
            os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        
    async def analyze_roof_image(
        self, 
        image_file: bytes, 
        address: Optional[str] = None,
        analysis_type: str = "full"
    ) -> RoofAnalysisResult:
        """Perform comprehensive roof analysis using GPT-4 Vision"""
        
        # 1. Pre-process image
        image = Image.open(io.BytesIO(image_file))
        image_array = np.array(image)
        
        # 2. Run edge detection for roof outline
        edges = self._detect_roof_edges(image_array)
        
        # 3. Estimate dimensions if possible
        estimated_area = self._estimate_roof_area(edges, image_array.shape)
        
        # 4. Prepare image for GPT-4 Vision
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=85)
        base64_image = base64.b64encode(buffered.getvalue()).decode()
        
        # 5. Get prompt based on analysis type
        prompt = self._get_analysis_prompt(analysis_type, address)
        
        # 6. Call GPT-4 Vision
        response = await openai.ChatCompletion.acreate(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert roofing contractor with 30 years of experience. Provide detailed, accurate analysis of roof conditions."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": f"data:image/jpeg;base64,{base64_image}"}
                    ]
                }
            ],
            max_tokens=1500,
            temperature=0.3
        )
        
        # 7. Parse GPT response
        analysis_text = response.choices[0].message.content
        parsed_analysis = self._parse_gpt_analysis(analysis_text)
        
        # 8. Combine with computer vision results
        if estimated_area > 0:
            parsed_analysis["square_feet"] = estimated_area
            parsed_analysis["confidence_scores"]["area_measurement"] = 0.7
        
        # 9. Calculate cost estimates based on local data
        costs = self._calculate_cost_estimates(
            parsed_analysis["square_feet"],
            parsed_analysis["material"],
            parsed_analysis["condition"],
            address
        )
        
        # 10. Store analysis result
        stored_result = await self._store_analysis(
            image_file,
            parsed_analysis,
            analysis_type,
            response.model
        )
        
        return RoofAnalysisResult(
            square_feet=parsed_analysis["square_feet"],
            pitch=parsed_analysis["pitch"],
            material=parsed_analysis["material"],
            condition=parsed_analysis["condition"],
            damage_areas=parsed_analysis["damage_areas"],
            recommendations=parsed_analysis["recommendations"],
            estimated_remaining_life=parsed_analysis["remaining_life"],
            repair_cost_estimate=costs["repair"],
            replacement_cost_estimate=costs["replacement"],
            confidence_scores=parsed_analysis["confidence_scores"]
        )
    
    def _detect_roof_edges(self, image_array: np.ndarray) -> np.ndarray:
        """Use computer vision to detect roof edges"""
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter for roof-like shapes
        roof_contours = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:  # Minimum area threshold
                roof_contours.append(contour)
        
        return edges
    
    def _estimate_roof_area(self, edges: np.ndarray, image_shape: Tuple) -> float:
        """Estimate roof area from edge detection"""
        # This is a simplified estimation
        # In production, would use more sophisticated methods
        total_pixels = np.sum(edges > 0)
        
        # Assume average residential roof is 2000 sq ft
        # and takes up about 30% of a typical aerial photo
        image_area = image_shape[0] * image_shape[1]
        roof_percentage = total_pixels / image_area
        
        # Very rough estimation - would need calibration
        estimated_sqft = roof_percentage * 6000
        
        return min(max(estimated_sqft, 800), 8000)  # Reasonable bounds
    
    def _get_analysis_prompt(self, analysis_type: str, address: Optional[str]) -> str:
        """Get appropriate prompt based on analysis type"""
        
        base_prompt = """Analyze this roof image and provide the following information in JSON format:
        {
            "square_feet": estimated roof area in square feet,
            "pitch": roof pitch (e.g., "4/12", "6/12"),
            "material": roofing material type,
            "condition": overall condition ("excellent", "good", "fair", "poor"),
            "damage_areas": [
                {
                    "type": "damage type",
                    "severity": "minor/moderate/severe",
                    "location": "description of location",
                    "area_sqft": estimated affected area
                }
            ],
            "recommendations": ["list of recommended actions"],
            "remaining_life": estimated years of remaining life,
            "confidence_scores": {
                "area_measurement": 0.0-1.0,
                "material_identification": 0.0-1.0,
                "damage_assessment": 0.0-1.0
            }
        }"""
        
        if analysis_type == "damage":
            base_prompt += "\nFocus particularly on identifying damage, wear, and potential issues."
        elif analysis_type == "measurement":
            base_prompt += "\nFocus on accurate measurements and dimensions."
        
        if address:
            base_prompt += f"\nProperty address: {address}. Consider local climate and building codes."
        
        return base_prompt
    
    def _parse_gpt_analysis(self, analysis_text: str) -> Dict:
        """Parse GPT response into structured data"""
        try:
            # Extract JSON from response
            json_start = analysis_text.find("{")
            json_end = analysis_text.rfind("}") + 1
            json_str = analysis_text[json_start:json_end]
            
            return json.loads(json_str)
        except:
            # Fallback parsing if JSON extraction fails
            return {
                "square_feet": 1500,
                "pitch": "unknown",
                "material": "asphalt shingle",
                "condition": "unknown",
                "damage_areas": [],
                "recommendations": ["Manual inspection recommended"],
                "remaining_life": 10,
                "confidence_scores": {
                    "area_measurement": 0.3,
                    "material_identification": 0.5,
                    "damage_assessment": 0.4
                }
            }
    
    def _calculate_cost_estimates(
        self, 
        sqft: float, 
        material: str, 
        condition: str,
        address: Optional[str]
    ) -> Dict[str, Tuple[float, float]]:
        """Calculate repair and replacement cost estimates"""
        
        # Base costs per square foot (would be loaded from database)
        material_costs = {
            "asphalt shingle": {"repair": 4.50, "replacement": 7.50},
            "metal": {"repair": 7.00, "replacement": 12.00},
            "tile": {"repair": 10.00, "replacement": 18.00},
            "slate": {"repair": 15.00, "replacement": 25.00},
            "flat/tpo": {"repair": 6.00, "replacement": 10.00}
        }
        
        # Get base costs
        base_costs = material_costs.get(
            material.lower(), 
            material_costs["asphalt shingle"]
        )
        
        # Adjust for condition
        condition_multipliers = {
            "excellent": 0.5,
            "good": 0.7,
            "fair": 1.0,
            "poor": 1.3
        }
        
        repair_multiplier = condition_multipliers.get(condition.lower(), 1.0)
        
        # Calculate ranges
        repair_low = sqft * base_costs["repair"] * repair_multiplier * 0.8
        repair_high = sqft * base_costs["repair"] * repair_multiplier * 1.2
        
        replacement_low = sqft * base_costs["replacement"] * 0.9
        replacement_high = sqft * base_costs["replacement"] * 1.1
        
        # Adjust for location if available (would use real geo data)
        if address and "denver" in address.lower():
            # Denver market adjustment
            location_multiplier = 1.15
            repair_low *= location_multiplier
            repair_high *= location_multiplier
            replacement_low *= location_multiplier
            replacement_high *= location_multiplier
        
        return {
            "repair": (round(repair_low, -2), round(repair_high, -2)),
            "replacement": (round(replacement_low, -2), round(replacement_high, -2))
        }
    
    async def _store_analysis(
        self, 
        image_file: bytes,
        analysis: Dict,
        analysis_type: str,
        ai_model: str
    ) -> Dict:
        """Store analysis results in database"""
        
        # Upload image to Supabase storage
        file_name = f"roof_analysis_{uuid.uuid4()}.jpg"
        
        storage_response = self.supabase.storage.from_("roof-images").upload(
            file_name,
            image_file,
            {"content-type": "image/jpeg"}
        )
        
        image_url = f"{os.getenv('NEXT_PUBLIC_SUPABASE_URL')}/storage/v1/object/public/roof-images/{file_name}"
        
        # Store analysis record
        analysis_record = self.supabase.table("roof_analyses").insert({
            "image_url": image_url,
            "analysis_type": analysis_type,
            "ai_model": ai_model,
            "ai_response": analysis,
            "confidence_score": analysis["confidence_scores"]["damage_assessment"]
        }).execute()
        
        return analysis_record.data[0]
