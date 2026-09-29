import os
import sys
import django
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_project.settings')
django.setup()

from django.utils import timezone
from library_app.models import Category, Book, Member, BorrowRecord

def seed():
    print("Seeding database...")
    
    # 1. Categories
    cat_cs, _ = Category.objects.get_or_create(name="Computer Science", defaults={"description": "Programming, Software Engineering, Algorithms"})
    cat_scifi, _ = Category.objects.get_or_create(name="Science Fiction", defaults={"description": "Futuristic science and technology fiction"})
    cat_math, _ = Category.objects.get_or_create(name="Mathematics", defaults={"description": "Linear Algebra, Calculus, Statistics"})
    cat_lit, _ = Category.objects.get_or_create(name="Literature & Fiction", defaults={"description": "Classic and modern novels"})
    cat_hist, _ = Category.objects.get_or_create(name="History", defaults={"description": "World History, Biographies"})

    # 2. Books
    books_data = [
        {
            "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
            "author": "Robert C. Martin",
            "category": cat_cs,
            "isbn": "978-0132350884",
            "publisher": "Prentice Hall",
            "publication_year": 2008,
            "description": "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
            "total_quantity": 5,
            "available_quantity": 4,
        },
        {
            "title": "Introduction to Algorithms",
            "author": "Thomas H. Cormen, Charles E. Leiserson",
            "category": cat_cs,
            "isbn": "978-0262033848",
            "publisher": "MIT Press",
            "publication_year": 2009,
            "description": "Comprehensive textbook covering depth and breadth of algorithms.",
            "total_quantity": 3,
            "available_quantity": 2,
        },
        {
            "title": "Dune",
            "author": "Frank Herbert",
            "category": cat_scifi,
            "isbn": "978-0441172719",
            "publisher": "Chilton Books",
            "publication_year": 1965,
            "description": "Set on the desert planet Arrakis, Dune is the story of Paul Atreides.",
            "total_quantity": 4,
            "available_quantity": 3,
        },
        {
            "title": "Linear Algebra Done Right",
            "author": "Sheldon Axler",
            "category": cat_math,
            "isbn": "978-3319110790",
            "publisher": "Springer",
            "publication_year": 2015,
            "description": "Best selling undergraduate linear algebra textbook.",
            "total_quantity": 2,
            "available_quantity": 1,
        },
        {
            "title": "The Great Gatsby",
            "author": "F. Scott Fitzgerald",
            "category": cat_lit,
            "isbn": "978-0743273565",
            "publisher": "Scribner",
            "publication_year": 1925,
            "description": "A novel written by American author F. Scott Fitzgerald.",
            "total_quantity": 3,
            "available_quantity": 3,
        },
        {
            "title": "Sapiens: A Brief History of Humankind",
            "author": "Yuval Noah Harari",
            "category": cat_hist,
            "isbn": "978-0062316097",
            "publisher": "Harper",
            "publication_year": 2014,
            "description": "Survey of the history of humankind from the evolution of archaic human species.",
            "total_quantity": 4,
            "available_quantity": 4,
        }
    ]

    books = []
    for bdata in books_data:
        b, _ = Book.objects.get_or_create(isbn=bdata["isbn"], defaults=bdata)
        books.append(b)

    # 3. Members
    members_data = [
        {"name": "Alice Johnson", "email": "alice.j@example.com", "phone": "+1-555-0192", "address": "123 Campus Way, University City"},
        {"name": "Bob Smith", "email": "bob.smith@example.com", "phone": "+1-555-0143", "address": "456 College Ave, Apt 4B"},
        {"name": "Charlie Davis", "email": "charlie.d@example.com", "phone": "+1-555-0178", "address": "789 Library Road, Tech Park"},
    ]

    members = []
    for mdata in members_data:
        m, _ = Member.objects.get_or_create(email=mdata["email"], defaults=mdata)
        members.append(m)

    # 4. Borrow Records
    today = timezone.now().date()
    
    if BorrowRecord.objects.count() == 0 and len(members) >= 3 and len(books) >= 4:
        # Borrow 1: Active borrowed
        BorrowRecord.objects.create(
            member=members[0],
            book=books[0], # Clean Code
            borrow_date=today - timedelta(days=5),
            due_date=today + timedelta(days=9),
            status='Borrowed'
        )
        # Borrow 2: Overdue
        BorrowRecord.objects.create(
            member=members[1],
            book=books[1], # Algorithms
            borrow_date=today - timedelta(days=20),
            due_date=today - timedelta(days=6),
            status='Overdue'
        )
        # Borrow 3: Returned
        BorrowRecord.objects.create(
            member=members[2],
            book=books[2], # Dune
            borrow_date=today - timedelta(days=15),
            due_date=today - timedelta(days=1),
            return_date=today - timedelta(days=2),
            status='Returned'
        )

    print("Database successfully seeded!")

if __name__ == '__main__':
    seed()
