import io
import csv
import re
from typing import List, Dict, Any

class CDRParser:
    """
    Parser for Call Detail Records (CDR) in CSV or tabular text formats.
    """

    CALLER_COLS = ["calling_number", "caller", "caller_num", "phone_a", "source_phone", "calling_no", "caller_id", "source"]
    CALLEE_COLS = ["called_number", "called", "callee", "receiver_num", "phone_b", "target_phone", "called_no", "receiver_id", "target"]

    DURATION_COLS = ["duration", "call_duration", "duration_sec", "dur_sec"]
    TIME_COLS = ["timestamp", "call_time", "date_time", "datetime", "date", "time"]
    TYPE_COLS = ["call_type", "type", "communication_type"]
    TOWER_COLS = ["cell_tower", "tower_id", "location", "cell_id", "imei"]

    @classmethod
    def parse(cls, content: str) -> List[Dict[str, Any]]:
        """
        Parses CDR raw CSV string into standardized list of call record dictionaries.
        Raises ValueError if content is invalid or unparseable.
        """
        raw_text = content.strip()
        if not raw_text:
            raise ValueError("Empty CDR file content.")

        records: List[Dict[str, Any]] = []
        stream = io.StringIO(raw_text)
        lines = [line.strip() for line in stream.readlines() if line.strip()]

        if not lines:
            raise ValueError("No valid text lines found in CDR content.")

        delimiter = ',' if ',' in lines[0] else ('\t' if '\t' in lines[0] else ';')
        reader = csv.DictReader(lines, delimiter=delimiter)

        def find_col(candidates: List[str], row: Dict[str, Any]) -> str:
            for k, v in row.items():
                if k and str(k).strip().lower() in candidates:
                    return str(v).strip()
            return ""

        for idx, row in enumerate(reader):
            caller = find_col(cls.CALLER_COLS, row)
            callee = find_col(cls.CALLEE_COLS, row)
            duration = find_col(cls.DURATION_COLS, row)
            timestamp = find_col(cls.TIME_COLS, row)
            call_type = find_col(cls.TYPE_COLS, row) or "VOICE"
            location = find_col(cls.TOWER_COLS, row)

            # Fallback for plain regex if standard header matching failed
            if not caller or not callee:
                row_str = " ".join(str(v) for v in row.values())
                phones = re.findall(r'\+?\d{10,15}', row_str)
                if len(phones) >= 2:
                    caller = phones[0]
                    callee = phones[1]

            if caller and callee:
                snippet = f"Line {idx+2}: Caller {caller} -> Callee {callee}"
                records.append({
                    "record_type": "CDR",
                    "caller_phone": caller,
                    "callee_phone": callee,
                    "duration_sec": int(duration) if duration.isdigit() else 60,
                    "timestamp": timestamp or "2026-08-30T10:00:00Z",
                    "call_type": call_type.upper(),
                    "cell_tower": location or "Tower-Alpha-4",
                    "raw_row": idx + 1,
                    "row_number": idx + 2, # Account for CSV header row
                    "line_number": idx + 2,
                    "snippet": snippet
                })

        # If CSV parsing produced 0 records, try line-by-line regex extraction
        if not records:
            for idx, line in enumerate(lines):
                phones = re.findall(r'\+?\d{10,15}', line)
                if len(phones) >= 2:
                    records.append({
                        "record_type": "CDR",
                        "caller_phone": phones[0],
                        "callee_phone": phones[1],
                        "duration_sec": 45,
                        "timestamp": "2026-08-30T10:00:00Z",
                        "call_type": "VOICE",
                        "cell_tower": "Tower-Default",
                        "raw_row": idx + 1,
                        "row_number": idx + 1,
                        "line_number": idx + 1,
                        "snippet": line[:150]
                    })

        if not records:
            raise ValueError("Invalid CDR format: Content contains no identifiable caller/callee phone numbers.")

        return records

