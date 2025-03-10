from django.contrib import admin
from .models import (
    Supplier, ProductCategory, Product, 
    Purchase, PurchaseItem, PurchasePayment,
    Customer, Sale, SaleItem, SalePayment,
    StockMovement, Invoice
)

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'contact_name', 'contact_phone')
    search_fields = ('name', 'contact_name')
    list_filter = ('country',)


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


class ProductInline(admin.TabularInline):
    model = Product
    extra = 0
    fields = ('name', 'stock_quantity', 'buying_price', 'selling_price')
    readonly_fields = ('stock_quantity',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'reference', 'category', 'supplier', 'buying_price', 'selling_price', 'stock_quantity', 'is_low_stock')
    list_filter = ('category', 'supplier', 'is_low_stock')
    search_fields = ('name', 'reference')
    readonly_fields = ('is_low_stock', 'margin')
    fieldsets = (
        (None, {
            'fields': ('name', 'reference', 'description')
        }),
        ('Catégorisation', {
            'fields': ('category', 'supplier')
        }),
        ('Prix', {
            'fields': ('buying_price', 'selling_price', 'margin')
        }),
        ('Stock', {
            'fields': ('stock_quantity', 'min_stock_level', 'is_low_stock')
        }),
        ('Médias', {
            'fields': ('image',)
        }),
    )


class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 0
    fields = ('product', 'quantity', 'unit_price', 'received_quantity', 'total_price')
    readonly_fields = ('total_price',)


class PurchasePaymentInline(admin.TabularInline):
    model = PurchasePayment
    extra = 0
    fields = ('payment_date', 'amount', 'payment_method', 'reference')


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'supplier', 'order_date', 'status', 'payment_status', 'total_amount', 'balance_due')
    list_filter = ('status', 'payment_status', 'order_date')
    search_fields = ('supplier__name', 'reference')
    readonly_fields = ('total_amount', 'total_paid', 'balance_due', 'is_overdue')
    inlines = [PurchaseItemInline, PurchasePaymentInline]
    fieldsets = (
        (None, {
            'fields': ('supplier', 'reference', 'notes')
        }),
        ('Dates', {
            'fields': ('order_date', 'expected_delivery_date', 'actual_delivery_date')
        }),
        ('Statut', {
            'fields': ('status', 'payment_status', 'payment_due_date')
        }),
        ('Montants', {
            'fields': ('total_amount', 'total_paid', 'balance_due', 'is_overdue')
        }),
    )


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email')
    search_fields = ('name', 'phone', 'email')


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    fields = ('product', 'quantity', 'unit_price', 'discount', 'total_price')
    readonly_fields = ('total_price',)


class SalePaymentInline(admin.TabularInline):
    model = SalePayment
    extra = 0
    fields = ('payment_date', 'amount', 'payment_method', 'reference')


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'sale_date', 'status', 'payment_status', 'total_amount', 'balance_due')
    list_filter = ('status', 'payment_status', 'sale_date')
    search_fields = ('customer__name', 'reference')
    readonly_fields = ('total_amount', 'total_paid', 'balance_due', 'payment_days')
    inlines = [SaleItemInline, SalePaymentInline]
    fieldsets = (
        (None, {
            'fields': ('customer', 'reference', 'notes')
        }),
        ('Dates', {
            'fields': ('sale_date', 'expected_delivery_date', 'actual_delivery_date')
        }),
        ('Statut', {
            'fields': ('status', 'payment_status')
        }),
        ('Montants', {
            'fields': ('total_amount', 'total_paid', 'balance_due', 'payment_days')
        }),
    )


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'movement_type', 'date', 'reference')
    list_filter = ('movement_type', 'date')
    search_fields = ('product__name', 'reference', 'notes')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'sale', 'issue_date', 'due_date', 'status', 'is_overdue')
    list_filter = ('status', 'issue_date', 'is_overdue')
    search_fields = ('invoice_number', 'sale__customer__name')
    readonly_fields = ('is_overdue',)
    fieldsets = (
        (None, {
            'fields': ('sale', 'invoice_number', 'notes')
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date')
        }),
        ('Statut', {
            'fields': ('status', 'is_overdue')
        }),
    )