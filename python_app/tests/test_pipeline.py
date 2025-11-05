import unittest
from datetime import date

from python_app import LoanService, RecognitionPipeline


class RecognitionPipelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.pipeline = RecognitionPipeline()

    def test_pipeline_registers_unique_books(self) -> None:
        frames = [
            "The Pragmatic Programmer - Andrew Hunt",
            "Clean Code by Robert C. Martin",
            "Clean Code by Robert C. Martin",  # duplicate frame
            "Refactoring",
            "Domain-Driven Design - Eric Evans",
        ]
        books = self.pipeline.process_video(
            frames, min_confidence=0.75, default_category="Programming"
        )

        self.assertEqual(len(books), 4)
        titles = sorted(book.title for book in books)
        self.assertEqual(
            titles,
            [
                "Clean Code",
                "Domain-Driven Design",
                "Refactoring",
                "The Pragmatic Programmer",
            ],
        )
        # All books should receive the default category.
        for book in books:
            self.assertEqual(book.categories, ["Programming"])
            self.assertTrue(book.source.startswith("frame@"))

    def test_loan_lifecycle(self) -> None:
        book = self.pipeline.book_service.register_book(
            "Working Effectively with Legacy Code", "Michael Feathers"
        )
        loan_service = LoanService(self.pipeline.book_service)

        loan = loan_service.loan_book(book.id, "Alice", loan_date=date(2024, 1, 1))
        self.assertTrue(book.is_loaned)
        self.assertEqual(loan.borrower, "Alice")
        self.assertEqual(loan.due_at, date(2024, 1, 15))
        self.assertTrue(loan.is_overdue(on_date=date(2024, 1, 20)))

        loan_service.return_book(book.id, return_date=date(2024, 1, 10))
        self.assertFalse(book.is_loaned)
        self.assertFalse(loan.is_active())
        self.assertEqual(loan.returned_at, date(2024, 1, 10))


if __name__ == "__main__":
    unittest.main()
