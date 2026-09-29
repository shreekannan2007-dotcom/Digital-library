from django.contrib import admin
from .models import Category, Book, Member, BorrowRecord

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'author', 'category', 'isbn', 'total_quantity', 'available_quantity')
    search_fields = ('title', 'author', 'isbn')
    list_filter = ('category',)

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'phone', 'created_at')
    search_fields = ('name', 'email', 'phone')

@admin.register(BorrowRecord)
class BorrowRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'member', 'book', 'borrow_date', 'due_date', 'return_date', 'status')
    list_filter = ('status', 'borrow_date', 'due_date')
    search_fields = ('member__name', 'book__title')
