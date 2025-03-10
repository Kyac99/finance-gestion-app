from rest_framework import serializers
from .models import (
    Supplier, ProductCategory, Product, 
    Purchase, PurchaseItem, PurchasePayment,
    Customer, Sale, SaleItem, SalePayment,
    StockMovement, Invoice
)

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'


class ProductSimpleSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour les produits"""
    class Meta:
        model = Product
        fields = ['id', 'name', 'reference', 'selling_price', 'stock_quantity']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    is_low_stock = serializers.ReadOnlyField()
    margin = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = '__all__'


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    is_low_stock = serializers.ReadOnlyField()
    margin = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = '__all__'
        depth = 1


class PurchaseItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = PurchaseItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'received_quantity', 'total_price']


class PurchasePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchasePayment
        fields = ['id', 'payment_date', 'amount', 'payment_method', 'reference', 'notes']


class PurchaseListSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    total_amount = serializers.ReadOnlyField()
    balance_due = serializers.ReadOnlyField()
    
    class Meta:
        model = Purchase
        fields = ['id', 'supplier', 'supplier_name', 'reference', 'order_date', 'status', 
                  'payment_status', 'total_amount', 'balance_due']


class PurchaseDetailSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    total_amount = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    balance_due = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    items = PurchaseItemSerializer(many=True, read_only=True)
    payments = PurchasePaymentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Purchase
        fields = '__all__'


class PurchaseCreateSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)
    
    class Meta:
        model = Purchase
        fields = ['supplier', 'reference', 'order_date', 'expected_delivery_date', 
                  'status', 'payment_status', 'payment_due_date', 'notes', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        purchase = Purchase.objects.create(**validated_data)
        
        for item_data in items_data:
            PurchaseItem.objects.create(purchase=purchase, **item_data)
        
        return purchase


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'discount', 'total_price']


class SalePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalePayment
        fields = ['id', 'payment_date', 'amount', 'payment_method', 'reference', 'notes']


class SaleListSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.name')
    total_amount = serializers.ReadOnlyField()
    balance_due = serializers.ReadOnlyField()
    
    class Meta:
        model = Sale
        fields = ['id', 'customer', 'customer_name', 'reference', 'sale_date', 'status', 
                  'payment_status', 'total_amount', 'balance_due']


class SaleDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.name')
    total_amount = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    balance_due = serializers.ReadOnlyField()
    payment_days = serializers.ReadOnlyField()
    items = SaleItemSerializer(many=True, read_only=True)
    payments = SalePaymentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Sale
        fields = '__all__'


class SaleCreateSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    
    class Meta:
        model = Sale
        fields = ['customer', 'reference', 'sale_date', 'status', 'payment_status', 
                  'expected_delivery_date', 'notes', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sale = Sale.objects.create(**validated_data)
        
        for item_data in items_data:
            SaleItem.objects.create(sale=sale, **item_data)
        
        return sale


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    
    class Meta:
        model = StockMovement
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='sale.customer.name')
    total_amount = serializers.ReadOnlyField(source='sale.total_amount')
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Invoice
        fields = '__all__'


class DashboardSupplierPaymentSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    total_amount = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    balance_due = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Purchase
        fields = ['id', 'supplier_name', 'order_date', 'payment_due_date', 
                  'payment_status', 'total_amount', 'total_paid', 'balance_due', 'is_overdue']


class DashboardCustomerPaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.name')
    total_amount = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    balance_due = serializers.ReadOnlyField()
    days_since_delivery = serializers.SerializerMethodField()
    
    class Meta:
        model = Sale
        fields = ['id', 'customer_name', 'sale_date', 'actual_delivery_date', 
                  'payment_status', 'total_amount', 'total_paid', 'balance_due', 'days_since_delivery']
    
    def get_days_since_delivery(self, obj):
        if obj.actual_delivery_date:
            from django.utils import timezone
            import datetime
            today = timezone.now().date()
            return (today - obj.actual_delivery_date).days
        return None