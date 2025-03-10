from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
from .models import (
    Supplier, ProductCategory, Product, 
    Purchase, PurchaseItem, PurchasePayment,
    Customer, Sale, SaleItem, SalePayment,
    StockMovement, Invoice
)
from .serializers import (
    SupplierSerializer, ProductCategorySerializer,
    ProductSerializer, ProductDetailSerializer, ProductSimpleSerializer,
    PurchaseListSerializer, PurchaseDetailSerializer, PurchaseCreateSerializer,
    PurchaseItemSerializer, PurchasePaymentSerializer,
    CustomerSerializer, SaleListSerializer, SaleDetailSerializer, SaleCreateSerializer,
    SaleItemSerializer, SalePaymentSerializer,
    StockMovementSerializer, InvoiceSerializer,
    DashboardSupplierPaymentSerializer, DashboardCustomerPaymentSerializer
)


class SupplierViewSet(viewsets.ModelViewSet):
    """API endpoint pour gérer les fournisseurs"""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country']
    search_fields = ['name', 'contact_name']
    ordering_fields = ['name', 'created_at']


class ProductCategoryViewSet(viewsets.ModelViewSet):
    """API endpoint pour gérer les catégories de produits"""
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    """API endpoint pour gérer les produits"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'supplier']
    search_fields = ['name', 'reference']
    ordering_fields = ['name', 'buying_price', 'selling_price', 'stock_quantity']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer

    @action(detail=False)
    def low_stock(self, request):
        """Récupère les produits dont le stock est bas"""
        low_stock_products = Product.objects.filter(stock_quantity__lte=models.F('min_stock_level'))
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)


class PurchaseViewSet(viewsets.ModelViewSet):
    """API endpoint pour gérer les achats"""
    queryset = Purchase.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['supplier', 'status', 'payment_status']
    search_fields = ['reference', 'supplier__name']
    ordering_fields = ['order_date', 'payment_due_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return PurchaseListSerializer
        if self.action == 'retrieve':
            return PurchaseDetailSerializer
        if self.action == 'create':
            return PurchaseCreateSerializer
        return PurchaseDetailSerializer

    @action(detail=True, methods=['post'])
    def add_payment(self, request, pk=None):
        """Ajouter un paiement à un achat"""
        purchase = self.get_object()
        serializer = PurchasePaymentSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(purchase=purchase)
            # La mise à jour du statut de paiement est gérée dans la méthode save() du modèle
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_received(self, request, pk=None):
        """Marquer un achat comme reçu et mettre à jour les stocks"""
        purchase = self.get_object()
        
        if purchase.status == 'received':
            return Response({'detail': 'Cet achat est déjà marqué comme reçu.'}, status=status.HTTP_400_BAD_REQUEST)
        
        purchase.status = 'received'
        purchase.actual_delivery_date = timezone.now().date()
        purchase.save()
        
        # Mettre à jour les quantités reçues et les stocks
        for item in purchase.items.all():
            if 'received_quantity' in request.data and str(item.id) in request.data['received_quantity']:
                received_qty = int(request.data['received_quantity'][str(item.id)])
                
                # Créer un mouvement de stock pour l'entrée
                if received_qty > 0:
                    StockMovement.objects.create(
                        product=item.product,
                        quantity=received_qty,
                        movement_type='in',
                        reference=f"Purchase #{purchase.id}",
                        notes=f"Réception de l'achat #{purchase.id}"
                    )
                    
                    # La mise à jour du stock est gérée dans la méthode save() du modèle StockMovement
                    item.received_quantity = received_qty
                    item.save()
        
        serializer = PurchaseDetailSerializer(purchase)
        return Response(serializer.data)


class CustomerViewSet(viewsets.ModelViewSet):
    """API endpoint pour gérer les clients"""
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'phone', 'email']


class SaleViewSet(viewsets.ModelViewSet):
    """API endpoint pour gérer les ventes"""
    queryset = Sale.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer', 'status', 'payment_status']
    search_fields = ['reference', 'customer__name']
    ordering_fields = ['sale_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return SaleListSerializer
        if self.action == 'retrieve':
            return SaleDetailSerializer
        if self.action == 'create':
            return SaleCreateSerializer
        return SaleDetailSerializer

    @action(detail=True, methods=['post'])
    def add_payment(self, request, pk=None):
        """Ajouter un paiement à une vente"""
        sale = self.get_object()
        serializer = SalePaymentSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(sale=sale)
            # La mise à jour du statut de paiement est gérée dans la méthode save() du modèle
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        """Marquer une vente comme livrée"""
        sale = self.get_object()
        
        if sale.status == 'delivered':
            return Response({'detail': 'Cette vente est déjà marquée comme livrée.'}, status=status.HTTP_400_BAD_REQUEST)
        
        sale.status = 'delivered'
        sale.actual_delivery_date = timezone.now().date()
        sale.save()
        
        # Générer une facture si elle n'existe pas déjà
        if not hasattr(sale, 'invoice'):
            last_invoice = Invoice.objects.order_by('-id').first()
            invoice_number = f"INV-{(last_invoice.id + 1 if last_invoice else 1):05d}"
            
            Invoice.objects.create(
                sale=sale,
                invoice_number=invoice_number,
                issue_date=timezone.now().date(),
                due_date=timezone.now().date() + timedelta(days=30),
                status='sent'
            )
        
        serializer = SaleDetailSerializer(sale)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def generate_invoice(self, request, pk=None):
        """Générer une facture pour une vente"""
        sale = self.get_object()
        
        if hasattr(sale, 'invoice'):
            return Response({'detail': 'Une facture existe déjà pour cette vente.'}, status=status.HTTP_400_BAD_REQUEST)
        
        last_invoice = Invoice.objects.order_by('-id').first()
        invoice_number = f"INV-{(last_invoice.id + 1 if last_invoice else 1):05d}"
        
        invoice = Invoice.objects.create(
            sale=sale,
            invoice_number=invoice_number,
            issue_date=timezone.now().date(),
            due_date=timezone.now().date() + timedelta(days=30),
            status='draft'
        )
        
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StockMovementViewSet(viewsets.ModelViewSet):
    """API endpoint pour gérer les mouvements de stock"""
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'movement_type']
    ordering_fields = ['date']


class InvoiceViewSet(viewsets.ModelViewSet):
    """API endpoint pour gérer les factures"""
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['invoice_number', 'sale__customer__name']
    ordering_fields = ['issue_date', 'due_date']

    @action(detail=True, methods=['post'])
    def mark_sent(self, request, pk=None):
        """Marquer une facture comme envoyée"""
        invoice = self.get_object()
        invoice.status = 'sent'
        invoice.save()
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Marquer une facture comme payée"""
        invoice = self.get_object()
        invoice.status = 'paid'
        invoice.save()
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)


class DashboardViewSet(viewsets.ViewSet):
    """API endpoint pour les tableaux de bord"""
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False)
    def supplier_payments(self, request):
        """Récupère les paiements aux fournisseurs à effectuer"""
        # Achats non payés et partiellement payés
        unpaid_purchases = Purchase.objects.filter(payment_status__in=['unpaid', 'partial'])
        serializer = DashboardSupplierPaymentSerializer(unpaid_purchases, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def customer_payments(self, request):
        """Récupère les paiements des clients à recevoir"""
        # Ventes non payées et partiellement payées
        unpaid_sales = Sale.objects.filter(payment_status__in=['unpaid', 'partial'])
        serializer = DashboardCustomerPaymentSerializer(unpaid_sales, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def low_stock_products(self, request):
        """Récupère les produits dont le stock est bas"""
        from django.db.models import F
        low_stock_products = Product.objects.filter(stock_quantity__lte=F('min_stock_level'))
        serializer = ProductSimpleSerializer(low_stock_products, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def sales_summary(self, request):
        """Résumé des ventes pour le tableau de bord"""
        from django.db.models import Sum, Count
        from django.db.models.functions import TruncMonth
        
        # Ventes par mois (dernier semestre)
        six_months_ago = timezone.now().date() - timedelta(days=180)
        sales_by_month = Sale.objects.filter(sale_date__gte=six_months_ago)\
            .annotate(month=TruncMonth('sale_date'))\
            .values('month')\
            .annotate(
                total=Sum(models.F('items__quantity') * models.F('items__unit_price')),
                count=Count('id')
            )\
            .order_by('month')
        
        # Ventes par statut de paiement
        sales_by_payment_status = Sale.objects.values('payment_status')\
            .annotate(count=Count('id'))\
            .order_by('payment_status')
        
        return Response({
            'sales_by_month': sales_by_month,
            'sales_by_payment_status': sales_by_payment_status,
        })

    @action(detail=False)
    def purchases_summary(self, request):
        """Résumé des achats pour le tableau de bord"""
        from django.db.models import Sum, Count
        from django.db.models.functions import TruncMonth
        
        # Achats par mois (dernier semestre)
        six_months_ago = timezone.now().date() - timedelta(days=180)
        purchases_by_month = Purchase.objects.filter(order_date__gte=six_months_ago)\
            .annotate(month=TruncMonth('order_date'))\
            .values('month')\
            .annotate(
                total=Sum(models.F('items__quantity') * models.F('items__unit_price')),
                count=Count('id')
            )\
            .order_by('month')
        
        # Achats par statut de paiement
        purchases_by_payment_status = Purchase.objects.values('payment_status')\
            .annotate(count=Count('id'))\
            .order_by('payment_status')
        
        return Response({
            'purchases_by_month': purchases_by_month,
            'purchases_by_payment_status': purchases_by_payment_status,
        })