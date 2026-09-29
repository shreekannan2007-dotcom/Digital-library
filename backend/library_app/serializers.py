from rest_framework import serializers
from .models import Category, Book, Member, BorrowRecord
from django.utils import timezone

class CategorySerializer(serializers.ModelSerializer):
    book_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_book_count(self, obj):
        return obj.books.count()


class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name', default='Uncategorized')

    class Meta:
        model = Book
        fields = '__all__'

    def validate(self, data):
        total = data.get('total_quantity', getattr(self.instance, 'total_quantity', 1))
        available = data.get('available_quantity', getattr(self.instance, 'available_quantity', 1))

        if available > total:
            raise serializers.ValidationError({"available_quantity": "Available quantity cannot exceed total quantity."})
        return data


class MemberSerializer(serializers.ModelSerializer):
    active_borrows_count = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = '__all__'

    def get_active_borrows_count(self, obj):
        return obj.borrow_records.filter(status='Borrowed').count()


class BorrowRecordSerializer(serializers.ModelSerializer):
    member_name = serializers.ReadOnlyField(source='member.name')
    member_email = serializers.ReadOnlyField(source='member.email')
    book_title = serializers.ReadOnlyField(source='book.title')
    book_isbn = serializers.ReadOnlyField(source='book.isbn')
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = BorrowRecord
        fields = '__all__'

    def get_is_overdue(self, obj):
        if obj.status == 'Borrowed' and str(obj.due_date) < str(timezone.now().date()):
            return True
        return False    