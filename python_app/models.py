from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import List, Optional


@dataclass
class VideoFrame:
    """Represents a single frame extracted from a video."""

    timestamp: float
    content: str


@dataclass
class OcrResult:
    """OCR result extracted from a frame."""

    timestamp: float
    title: str
    author: str
    confidence: float

    def is_confident(self, threshold: float) -> bool:
        """Return True when the OCR result meets the confidence threshold."""
        return self.confidence >= threshold


@dataclass
class Book:
    """Book entity stored in the in-memory catalogue."""

    id: str
    title: str
    author: str
    categories: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    source: Optional[str] = None
    is_loaned: bool = False


@dataclass
class Loan:
    """Loan entity that tracks the borrowing state of a book."""

    book_id: str
    borrower: str
    loaned_at: date
    due_at: date
    returned_at: Optional[date] = None

    def mark_returned(self, return_date: Optional[date] = None) -> None:
        """Mark the loan as returned."""
        self.returned_at = return_date or date.today()

    def is_active(self) -> bool:
        """Return True while the loan is not returned yet."""
        return self.returned_at is None

    def is_overdue(self, on_date: Optional[date] = None) -> bool:
        """Check whether the loan is overdue as of the given date."""
        if self.returned_at is not None:
            return False
        check_date = on_date or date.today()
        return check_date > self.due_at
