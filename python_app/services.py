from __future__ import annotations

import uuid
from datetime import date, timedelta
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence

from .models import Book, Loan, OcrResult, VideoFrame


class VideoProcessor:
    """
    Extremely small video processor stub.

    In place of working with real video files we accept either:
    - a text file whose lines simulate the frames
    - an in-memory sequence of strings

    Each non-empty line becomes a `VideoFrame`.
    """

    def extract_frames(
        self, video_source: Sequence[str] | str | Path, interval_seconds: float = 1.0
    ) -> List[VideoFrame]:
        raw_frames = self._read_frames(video_source)
        frames: List[VideoFrame] = []
        for index, content in enumerate(raw_frames):
            text = content.strip()
            if not text:
                continue
            frames.append(VideoFrame(timestamp=index * interval_seconds, content=text))
        return frames

    def _read_frames(self, video_source: Sequence[str] | str | Path) -> List[str]:
        if isinstance(video_source, Sequence) and not isinstance(video_source, (str, Path)):
            return list(video_source)

        path = Path(video_source)  # type: ignore[arg-type]
        if not path.exists():
            raise FileNotFoundError(f"Video source '{path}' was not found.")
        return path.read_text(encoding="utf-8").splitlines()


class OcrEngine:
    """
    Simplified OCR engine that extracts book hints from frame text.

    The engine expects frame content to follow one of the patterns:
    - "Title - Author"
    - "Title by Author"
    - "Title" (author will be set to "Unknown")
    """

    def recognize(self, frames: Iterable[VideoFrame]) -> List[OcrResult]:
        results: List[OcrResult] = []
        for frame in frames:
            title, author = self._parse_content(frame.content)
            confidence = self._estimate_confidence(title, author)
            results.append(OcrResult(frame.timestamp, title, author, confidence))
        return results

    def _parse_content(self, content: str) -> tuple[str, str]:
        lowered = content.lower()
        if " - " in content:
            left, right = content.split(" - ", 1)
            return left.strip(), right.strip()
        if " by " in lowered:
            marker = lowered.index(" by ")
            title = content[:marker].strip()
            author = content[marker + 4 :].strip()
            return title, author
        return content.strip(), "Unknown"

    def _estimate_confidence(self, title: str, author: str) -> float:
        if not title:
            return 0.0
        base = 0.85 if author != "Unknown" else 0.7
        bonus = min(len(title) / 50.0, 0.1)
        return round(min(base + bonus, 0.95), 2)


class BookService:
    """In-memory book catalogue with duplicate protection."""

    def __init__(self) -> None:
        self._books: Dict[str, Book] = {}
        self._title_index: Dict[str, str] = {}

    def register_book(
        self,
        title: str,
        author: str,
        categories: Optional[List[str]] = None,
        source: Optional[str] = None,
    ) -> Book:
        normalized_key = self._normalize_title(title, author)
        if normalized_key in self._title_index:
            existing_id = self._title_index[normalized_key]
            return self._books[existing_id]

        book_id = uuid.uuid4().hex
        book = Book(
            id=book_id,
            title=title.strip(),
            author=author.strip(),
            categories=categories or [],
            source=source,
        )
        self._books[book_id] = book
        self._title_index[normalized_key] = book_id
        return book

    def register_from_ocr(
        self,
        results: Iterable[OcrResult],
        min_confidence: float = 0.8,
        default_category: Optional[str] = None,
    ) -> List[Book]:
        registered: List[Book] = []
        for result in results:
            if not result.is_confident(min_confidence):
                continue
            categories = [default_category] if default_category else None
            book = self.register_book(
                title=result.title,
                author=result.author,
                categories=categories,
                source=f"frame@{result.timestamp:.1f}s",
            )
            if book not in registered:
                registered.append(book)
        return registered

    def search(self, keyword: str) -> List[Book]:
        keyword_lower = keyword.lower()
        return [
            book
            for book in self._books.values()
            if keyword_lower in book.title.lower() or keyword_lower in book.author.lower()
        ]

    def update_book(
        self,
        book_id: str,
        *,
        title: Optional[str] = None,
        author: Optional[str] = None,
        categories: Optional[List[str]] = None,
    ) -> Book:
        if book_id not in self._books:
            raise KeyError(f"Book '{book_id}' is not registered.")
        book = self._books[book_id]
        original_key = self._normalize_title(book.title, book.author)
        if title:
            book.title = title
        if author:
            book.author = author
        if title or author:
            # Refresh duplicate index so that lookups stay in sync.
            self._title_index.pop(original_key, None)
            new_key = self._normalize_title(book.title, book.author)
            self._title_index[new_key] = book_id
        if categories is not None:
            book.categories = categories
        return book

    def remove_book(self, book_id: str) -> None:
        if book_id not in self._books:
            raise KeyError(f"Book '{book_id}' is not registered.")
        book = self._books.pop(book_id)
        normalized_key = self._normalize_title(book.title, book.author)
        self._title_index.pop(normalized_key, None)

    def list_books(self) -> List[Book]:
        return list(self._books.values())

    def _normalize_title(self, title: str, author: str) -> str:
        return f"{title.strip().lower()}::{author.strip().lower()}"


class LoanService:
    """Loan manager that keeps track of book lending and returns."""

    def __init__(self, book_service: BookService) -> None:
        self._book_service = book_service
        self._loans: Dict[str, Loan] = {}

    def loan_book(
        self,
        book_id: str,
        borrower: str,
        loan_date: Optional[date] = None,
        days: int = 14,
    ) -> Loan:
        if book_id not in self._book_service._books:
            raise KeyError(f"Book '{book_id}' is not registered.")
        book = self._book_service._books[book_id]
        if book.is_loaned:
            raise ValueError(f"Book '{book.title}' is already loaned.")

        start = loan_date or date.today()
        loan = Loan(
            book_id=book_id,
            borrower=borrower,
            loaned_at=start,
            due_at=start + timedelta(days=days),
        )
        self._loans[book_id] = loan
        book.is_loaned = True
        return loan

    def return_book(self, book_id: str, return_date: Optional[date] = None) -> Loan:
        if book_id not in self._loans:
            raise KeyError(f"Book '{book_id}' is not currently loaned.")
        loan = self._loans[book_id]
        loan.mark_returned(return_date)
        book = self._book_service._books[book_id]
        book.is_loaned = False
        return loan

    def list_active_loans(self) -> List[Loan]:
        return [loan for loan in self._loans.values() if loan.is_active()]

    def list_overdue(self, on_date: Optional[date] = None) -> List[Loan]:
        return [loan for loan in self.list_active_loans() if loan.is_overdue(on_date)]


class RecognitionPipeline:
    """
    Helper that wires the processor, OCR, and book service together.

    A caller can run the end-to-end flow using a single method call which
    keeps the example approachable for educational purposes.
    """

    def __init__(
        self,
        video_processor: Optional[VideoProcessor] = None,
        ocr_engine: Optional[OcrEngine] = None,
        book_service: Optional[BookService] = None,
    ) -> None:
        self.video_processor = video_processor or VideoProcessor()
        self.ocr_engine = ocr_engine or OcrEngine()
        self.book_service = book_service or BookService()

    def process_video(
        self,
        video_source: Sequence[str] | str | Path,
        *,
        min_confidence: float = 0.8,
        default_category: Optional[str] = None,
    ) -> List[Book]:
        frames = self.video_processor.extract_frames(video_source)
        ocr_results = self.ocr_engine.recognize(frames)
        return self.book_service.register_from_ocr(
            ocr_results, min_confidence=min_confidence, default_category=default_category
        )
