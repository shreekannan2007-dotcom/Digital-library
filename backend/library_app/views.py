from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.db.models import Q, Count
from .models import Category, Book, Member, BorrowRecord
from .serializers import (
    CategorySerializer, BookSerializer, MemberSerializer, BorrowRecordSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'isbn', 'publisher', 'category__name']
    ordering_fields = ['title', 'author', 'publication_year', 'available_quantity', 'created_at']

    def get_queryset(self):
        queryset = Book.objects.all()
        category_id = self.request.query_params.get('category')
        availability = self.request.query_params.get('available')
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if availability == 'true':
            queryset = queryset.filter(available_quantity__gt=0)
        elif availability == 'false':
            queryset = queryset.filter(available_quantity=0)

        return queryset


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone', 'address']
    ordering_fields = ['name', 'created_at']


class BorrowRecordViewSet(viewsets.ModelViewSet):
    queryset = BorrowRecord.objects.all()
    serializer_class = BorrowRecordSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['member__name', 'member__email', 'book__title', 'book__isbn']
    ordering_fields = ['borrow_date', 'due_date', 'status', 'created_at']

    def get_queryset(self):
        queryset = BorrowRecord.objects.all()
        status_param = self.request.query_params.get('status')
        member_id = self.request.query_params.get('member')
        book_id = self.request.query_params.get('book')

        today = timezone.now().date()
        # Auto update overdue status for list query
        BorrowRecord.objects.filter(status='Borrowed', due_date__lt=today).update(status='Overdue')

        if status_param:
            queryset = queryset.filter(status=status_param)
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        if book_id:
            queryset = queryset.filter(book_id=book_id)

        return queryset

    @action(detail=False, methods=['post'])
    def borrow_book(self, request):
        member_id = request.data.get('member')
        book_id = request.data.get('book')
        borrow_date = request.data.get('borrow_date', timezone.now().date())
        due_date = request.data.get('due_date')

        if not member_id or not book_id or not due_date:
            return Response(
                {"error": "Member, Book, and Due Date are required fields."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return Response({"error": "Selected member does not exist."}, status=status.HTTP_404_NOT_FOUND)

        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({"error": "Selected book does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Business Rule: Do not allow borrowing when available quantity is zero
        if book.available_quantity <= 0:
            return Response(
                {"error": f"'{book.title}' is currently out of stock (Available Quantity: 0)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Decrease available quantity
            book.available_quantity -= 1
            book.save()

            # Create borrow record
            record = BorrowRecord.objects.create(
                member=member,
                book=book,
                borrow_date=borrow_date,
                due_date=due_date,
                status='Borrowed'
            )

        serializer = BorrowRecordSerializer(record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        try:
            record = BorrowRecord.objects.get(pk=pk)
        except BorrowRecord.DoesNotExist:
            return Response({"error": "Borrow record not found."}, status=status.HTTP_404_NOT_FOUND)

        # Business Rule: Do not allow the same book to be returned twice
        if record.status == 'Returned':
            return Response(
                {"error": "This borrow record has already been marked as returned."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return_date = request.data.get('return_date', timezone.now().date())

        with transaction.atomic():
            book = record.book
            # Increase available quantity
            book.available_quantity += 1
            book.save()

            # Update borrow record
            record.return_date = return_date
            record.status = 'Returned'
            record.save()

        serializer = BorrowRecordSerializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def dashboard_stats(request):
    today = timezone.now().date()
    
    # Auto update overdue status
    BorrowRecord.objects.filter(status='Borrowed', due_date__lt=today).update(status='Overdue')

    total_books = Book.objects.count()
    total_members = Member.objects.count()
    active_borrows = BorrowRecord.objects.filter(status='Borrowed').count()
    overdue_borrows = BorrowRecord.objects.filter(status='Overdue').count()

    recent_borrows = BorrowRecord.objects.select_related('member', 'book').order_by('-created_at')[:5]
    recent_serializer = BorrowRecordSerializer(recent_borrows, many=True)

    category_stats = Category.objects.annotate(book_count=Count('books')).values('name', 'book_count')

    return Response({
        'total_books': total_books,
        'total_members': total_members,
        'active_borrows': active_borrows,
        'overdue_borrows': overdue_borrows,
        'recent_borrows': recent_serializer.data,
        'category_stats': list(category_stats),
    })
