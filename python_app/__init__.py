"""
Simple BookTracker prototype implemented in Python.

The package exposes the core service classes so that they can be reused
from tests or small demo scripts without importing internal modules
directly.
"""

from .models import Book, Loan, OcrResult, VideoFrame
from .services import (
    BookService,
    LoanService,
    OcrEngine,
    RecognitionPipeline,
    VideoProcessor,
)

__all__ = [
    "Book",
    "Loan",
    "OcrResult",
    "VideoFrame",
    "BookService",
    "LoanService",
    "OcrEngine",
    "RecognitionPipeline",
    "VideoProcessor",
]
