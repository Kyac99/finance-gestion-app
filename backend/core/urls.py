from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierViewSet, ProductCategoryViewSet, ProductViewSet,
    PurchaseViewSet, CustomerViewSet, SaleViewSet,
    StockMovementViewSet, InvoiceViewSet, DashboardViewSet
)

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'product-categories', ProductCategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'purchases', PurchaseViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'stock-movements', StockMovementViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]