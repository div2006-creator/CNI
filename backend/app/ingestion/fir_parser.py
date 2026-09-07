import re
from typing import List, Dict, Any

class FIRParser:
    """
    Parser for unstructured Police FIR reports, field intelligence notes, and wiretap transcripts.
    Uses domain entity patterns & rule-based extraction to structure entities and relationships.
    """

    @classmethod
    def parse(cls, content: str) -> Dict[str, Any]:
        """
        Parses unstructured text and extracts structured intelligence fields with character offset locations.
        Raises ValueError if content is empty.
        """
        text = content.strip()
        if not text:
            raise ValueError("Empty FIR or surveillance report text content.")

        # Helper to compute character start/end offsets for matched tokens
        def locate_offsets(tokens_list: List[str]) -> Dict[str, Dict[str, int]]:
            offsets = {}
            for tok in tokens_list:
                pos = text.find(tok)
                if pos != -1:
                    offsets[tok] = {
                        "start_offset": pos,
                        "end_offset": pos + len(tok)
                    }
                else:
                    offsets[tok] = {"start_offset": 0, "end_offset": len(tok)}
            return offsets

        # 1. Extract Person Names / Suspect Aliases
        person_patterns = [
            r'Subject\s+([A-Z][a-z0-9_-]+(?:\s+[A-Z][a-z0-9_-]+)?)',
            r'accused\s+([A-Z][a-z0-9_-]+(?:\s+[A-Z][a-z0-9_-]+)?)',
            r'alias\s+([A-Z][a-z0-9_-]+)',
            r'Mr\.\s+([A-Z][a-z0-9_-]+\s+[A-Z][a-z0-9_-]+)',
            r'Officer\s+([A-Z][a-z0-9_-]+)'
        ]
        persons = set()
        for pat in person_patterns:
            for match in re.finditer(pat, text, re.IGNORECASE):
                name = match.group(1).strip()
                if len(name) > 2 and name.lower() not in ["the", "a", "an", "at", "by"]:
                    persons.add(name)

        # 2. Extract Phone Numbers
        phone_matches = re.findall(r'\+?\d{1,4}?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b', text)
        phones = list(set([p.strip() for p in phone_matches if len(re.sub(r'\D', '', p)) >= 10]))

        # 3. Extract Accounts / Crypto Wallets / UPI VPAs
        account_matches = re.findall(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+|Account\s*#?\s*[A-Za-z0-9-]+|0x[a-fA-F0-9]{8,}', text, re.IGNORECASE)
        accounts = list(set([a.strip() for a in account_matches]))

        # 4. Extract Organizations / Shell Corps
        org_matches = re.findall(r'\b([A-Z][A-Za-z0-9\s]+(?:Corp|Corporation|Ltd|Limited|Inc|Enterprises|Logistics|Trading|Group|Services))\b', text)
        organizations = list(set([o.strip() for o in org_matches]))

        # 5. Extract Locations
        loc_matches = re.findall(r'\b(Warehouse\s+[A-Za-z0-9\s]+|Safehouse\s+[A-Za-z0-9\s]+|Sector\s+\d+[A-Za-z]?|Terminal\s+\d+|Hub\s+\d+)\b', text, re.IGNORECASE)
        locations = list(set([l.strip() for l in loc_matches]))

        # 6. Extract Vehicles
        veh_matches = re.findall(r'\b((?:Black|White|Silver|Red|Blue)?\s*(?:SUV|Sedan|Truck|Van|Bike)\s*(?:\(Plates:\s*[A-Z0-9-]+\)?)?)\b', text, re.IGNORECASE)
        vehicles = list(set([v.strip() for v in veh_matches if len(v.strip()) > 3]))

        all_tokens = list(persons) + phones + accounts + organizations + locations + vehicles

        return {
            "record_type": "FIR_REPORT",
            "full_text": text,
            "extracted_tokens": {
                "persons": list(persons),
                "phones": phones,
                "accounts": accounts,
                "organizations": organizations,
                "locations": locations,
                "vehicles": vehicles
            },
            "token_offsets": locate_offsets(all_tokens)
        }

