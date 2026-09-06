import re
from typing import Optional

def normalize_phone(phone: str) -> str:
    """
    Normalizes phone numbers into standard E.164 format.
    Example:
    '+91 9876543210' -> '+919876543210'
    '919876543210'   -> '+919876543210'
    '9876543210'     -> '+919876543210'
    """
    if not phone:
        return ""
    
    cleaned = phone.strip()
    has_plus = cleaned.startswith('+')
    
    # Strip everything except digits
    digits_only = re.sub(r'\D', '', cleaned)
    
    if not digits_only:
        return phone.strip()
    
    if has_plus:
        return f"+{digits_only}"
    
    # Standard 10-digit Indian phone number without country code
    if len(digits_only) == 10:
        return f"+91{digits_only}"
    
    # 12-digit starting with 91 (India)
    if len(digits_only) == 12 and digits_only.startswith("91"):
        return f"+{digits_only}"
        
    return f"+{digits_only}" if len(digits_only) > 10 else digits_only

def normalize_upi(upi: str) -> str:
    """
    Normalizes UPI IDs (lowercase, whitespace stripped).
    Example: '  John.Doe@OKAxis ' -> 'john.doe@okaxis'
    """
    if not upi:
        return ""
    return upi.strip().lower()

def normalize_account(account: str) -> str:
    """
    Normalizes bank account numbers or crypto wallet addresses.
    Example: ' SYN-994-021 ' -> 'SYN994021'
    """
    if not account:
        return ""
    # Strip spaces and hyphens, uppercase
    cleaned = re.sub(r'[\s\-]', '', account.strip()).upper()
    return cleaned if cleaned else account.strip()

def normalize_vehicle(vehicle: str) -> str:
    """
    Normalizes vehicle registration numbers.
    Example: ' syn - 9901 ' -> 'SYN9901'
    """
    if not vehicle:
        return ""
    cleaned = re.sub(r'[\s\-]', '', vehicle.strip()).upper()
    return cleaned if cleaned else vehicle.strip()

def normalize_entity_identifier(entity_type: str, identifier: str) -> str:
    """
    Dispatches entity identifier normalization based on entity type.
    """
    if not identifier:
        return ""
    
    etype = (entity_type or "").upper()
    if etype == "PHONE":
        return normalize_phone(identifier)
    elif etype in ("UPI_ID", "UPI"):
        return normalize_upi(identifier)
    elif etype in ("BANK_ACCOUNT", "ACCOUNT"):
        return normalize_account(identifier)
    elif etype == "VEHICLE":
        return normalize_vehicle(identifier)
    else:
        return identifier.strip()
