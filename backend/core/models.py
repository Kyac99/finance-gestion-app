from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Supplier(models.Model):
    """Modèle pour gérer les fournisseurs"""
    name = models.CharField(max_length=100, verbose_name="Nom")
    country = models.CharField(max_length=100, verbose_name="Pays", blank=True, null=True)
    contact_name = models.CharField(max_length=100, verbose_name="Nom du contact", blank=True, null=True)
    contact_email = models.EmailField(verbose_name="Email du contact", blank=True, null=True)
    contact_phone = models.CharField(max_length=20, verbose_name="Téléphone du contact", blank=True, null=True)
    payment_terms = models.TextField(verbose_name="Conditions de paiement", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")

    class Meta:
        verbose_name = "Fournisseur"
        verbose_name_plural = "Fournisseurs"
        ordering = ["name"]

    def __str__(self):
        return self.name


class ProductCategory(models.Model):
    """Modèle pour catégoriser les produits"""
    name = models.CharField(max_length=100, verbose_name="Nom")
    description = models.TextField(verbose_name="Description", blank=True, null=True)

    class Meta:
        verbose_name = "Catégorie de produit"
        verbose_name_plural = "Catégories de produits"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    """Modèle pour gérer les produits"""
    name = models.CharField(max_length=100, verbose_name="Nom")
    reference = models.CharField(max_length=50, verbose_name="Référence", blank=True, null=True)
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, blank=True, 
                                verbose_name="Catégorie", related_name="products")
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True,
                               verbose_name="Fournisseur", related_name="products")
    buying_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix d'achat")
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix de vente")
    stock_quantity = models.IntegerField(default=0, verbose_name="Quantité en stock")
    min_stock_level = models.IntegerField(default=5, verbose_name="Niveau minimum de stock")
    description = models.TextField(verbose_name="Description", blank=True, null=True)
    image = models.ImageField(upload_to='products/', verbose_name="Image", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def is_low_stock(self):
        """Vérifie si le stock est bas"""
        return self.stock_quantity <= self.min_stock_level
    
    @property
    def margin(self):
        """Calcule la marge sur le produit"""
        if self.buying_price > 0:
            return ((self.selling_price - self.buying_price) / self.buying_price) * 100
        return 0


class Purchase(models.Model):
    """Modèle pour gérer les achats auprès des fournisseurs"""
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('ordered', 'Commandé'),
        ('received', 'Reçu'),
        ('cancelled', 'Annulé'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('unpaid', 'Non payé'),
        ('partial', 'Partiellement payé'),
        ('paid', 'Payé'),
    )
    
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, verbose_name="Fournisseur", related_name="purchases")
    reference = models.CharField(max_length=50, verbose_name="Référence", blank=True, null=True)
    order_date = models.DateField(verbose_name="Date de commande", default=timezone.now)
    expected_delivery_date = models.DateField(verbose_name="Date de livraison prévue", blank=True, null=True)
    actual_delivery_date = models.DateField(verbose_name="Date de livraison effective", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid', 
                                     verbose_name="Statut de paiement")
    payment_due_date = models.DateField(verbose_name="Date d'échéance", blank=True, null=True)
    notes = models.TextField(verbose_name="Notes", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")

    class Meta:
        verbose_name = "Achat"
        verbose_name_plural = "Achats"
        ordering = ["-order_date"]

    def __str__(self):
        return f"Achat {self.id} - {self.supplier.name}"

    @property
    def total_amount(self):
        """Calcule le montant total de l'achat"""
        total = sum(item.total_price for item in self.items.all())
        return total
    
    @property
    def total_paid(self):
        """Calcule le montant total payé"""
        return sum(payment.amount for payment in self.payments.all())
    
    @property
    def balance_due(self):
        """Calcule le solde restant à payer"""
        return self.total_amount - self.total_paid
    
    @property
    def is_overdue(self):
        """Vérifie si le paiement est en retard"""
        if self.payment_due_date and self.payment_status != 'paid':
            return self.payment_due_date < timezone.now().date()
        return False


class PurchaseItem(models.Model):
    """Modèle pour les articles d'un achat"""
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, verbose_name="Achat", related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Produit", related_name="purchase_items")
    quantity = models.IntegerField(verbose_name="Quantité")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix unitaire")
    received_quantity = models.IntegerField(default=0, verbose_name="Quantité reçue")

    class Meta:
        verbose_name = "Article d'achat"
        verbose_name_plural = "Articles d'achat"

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"

    @property
    def total_price(self):
        """Calcule le prix total pour cet article"""
        return self.quantity * self.unit_price


class PurchasePayment(models.Model):
    """Modèle pour les paiements effectués pour un achat"""
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Espèces'),
        ('bank_transfer', 'Virement bancaire'),
        ('check', 'Chèque'),
        ('mobile_money', 'Mobile Money'),
        ('other', 'Autre'),
    )
    
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, verbose_name="Achat", related_name="payments")
    payment_date = models.DateField(verbose_name="Date de paiement", default=timezone.now)
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, verbose_name="Méthode de paiement")
    reference = models.CharField(max_length=100, verbose_name="Référence", blank=True, null=True)
    notes = models.TextField(verbose_name="Notes", blank=True, null=True)

    class Meta:
        verbose_name = "Paiement d'achat"
        verbose_name_plural = "Paiements d'achat"
        ordering = ["-payment_date"]

    def __str__(self):
        return f"Paiement {self.id} - {self.purchase}"

    def save(self, *args, **kwargs):
        """Mise à jour du statut de paiement de l'achat après sauvegarde du paiement"""
        super().save(*args, **kwargs)
        purchase = self.purchase
        total_paid = purchase.total_paid
        total_amount = purchase.total_amount
        
        if total_paid >= total_amount:
            purchase.payment_status = 'paid'
        elif total_paid > 0:
            purchase.payment_status = 'partial'
        else:
            purchase.payment_status = 'unpaid'
        
        purchase.save()


class Customer(models.Model):
    """Modèle pour gérer les clients"""
    name = models.CharField(max_length=100, verbose_name="Nom")
    phone = models.CharField(max_length=20, verbose_name="Téléphone", blank=True, null=True)
    email = models.EmailField(verbose_name="Email", blank=True, null=True)
    address = models.TextField(verbose_name="Adresse", blank=True, null=True)
    notes = models.TextField(verbose_name="Notes", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")

    class Meta:
        verbose_name = "Client"
        verbose_name_plural = "Clients"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Sale(models.Model):
    """Modèle pour gérer les ventes"""
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('shipped', 'Expédiée'),
        ('delivered', 'Livrée'),
        ('cancelled', 'Annulée'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('unpaid', 'Non payé'),
        ('partial', 'Partiellement payé'),
        ('paid', 'Payé'),
    )
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, verbose_name="Client", related_name="sales")
    reference = models.CharField(max_length=50, verbose_name="Référence", blank=True, null=True)
    sale_date = models.DateField(verbose_name="Date de vente", default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid', 
                                     verbose_name="Statut de paiement")
    expected_delivery_date = models.DateField(verbose_name="Date de livraison prévue", blank=True, null=True)
    actual_delivery_date = models.DateField(verbose_name="Date de livraison effective", blank=True, null=True)
    notes = models.TextField(verbose_name="Notes", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")

    class Meta:
        verbose_name = "Vente"
        verbose_name_plural = "Ventes"
        ordering = ["-sale_date"]

    def __str__(self):
        return f"Vente {self.id} - {self.customer.name}"

    @property
    def total_amount(self):
        """Calcule le montant total de la vente"""
        total = sum(item.total_price for item in self.items.all())
        return total
    
    @property
    def total_paid(self):
        """Calcule le montant total payé"""
        return sum(payment.amount for payment in self.payments.all())
    
    @property
    def balance_due(self):
        """Calcule le solde restant à payer"""
        return self.total_amount - self.total_paid
    
    @property
    def payment_days(self):
        """Calcule le nombre de jours depuis la livraison jusqu'au paiement intégral"""
        if self.actual_delivery_date and self.payment_status == 'paid':
            last_payment = self.payments.order_by('-payment_date').first()
            if last_payment:
                return (last_payment.payment_date - self.actual_delivery_date).days
        return None


class SaleItem(models.Model):
    """Modèle pour les articles d'une vente"""
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, verbose_name="Vente", related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Produit", related_name="sale_items")
    quantity = models.IntegerField(verbose_name="Quantité")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix unitaire")
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Remise")

    class Meta:
        verbose_name = "Article de vente"
        verbose_name_plural = "Articles de vente"

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"

    @property
    def total_price(self):
        """Calcule le prix total pour cet article (avec remise)"""
        return (self.quantity * self.unit_price) - self.discount
    
    def save(self, *args, **kwargs):
        """Mise à jour du stock après sauvegarde"""
        is_new = self.pk is None
        old_quantity = 0
        
        if not is_new:
            old_instance = SaleItem.objects.get(pk=self.pk)
            old_quantity = old_instance.quantity
        
        super().save(*args, **kwargs)
        
        # Mettre à jour le stock seulement si le statut de la vente est confirmée ou livrée
        if self.sale.status in ['confirmed', 'shipped', 'delivered']:
            quantity_difference = self.quantity - old_quantity
            if quantity_difference != 0:
                self.product.stock_quantity -= quantity_difference
                self.product.save()


class SalePayment(models.Model):
    """Modèle pour les paiements reçus pour une vente"""
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Espèces'),
        ('bank_transfer', 'Virement bancaire'),
        ('check', 'Chèque'),
        ('mobile_money', 'Mobile Money'),
        ('other', 'Autre'),
    )
    
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, verbose_name="Vente", related_name="payments")
    payment_date = models.DateField(verbose_name="Date de paiement", default=timezone.now)
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, verbose_name="Méthode de paiement")
    reference = models.CharField(max_length=100, verbose_name="Référence", blank=True, null=True)
    notes = models.TextField(verbose_name="Notes", blank=True, null=True)

    class Meta:
        verbose_name = "Paiement de vente"
        verbose_name_plural = "Paiements de vente"
        ordering = ["-payment_date"]

    def __str__(self):
        return f"Paiement {self.id} - {self.sale}"

    def save(self, *args, **kwargs):
        """Mise à jour du statut de paiement de la vente après sauvegarde du paiement"""
        super().save(*args, **kwargs)
        sale = self.sale
        total_paid = sale.total_paid
        total_amount = sale.total_amount
        
        if total_paid >= total_amount:
            sale.payment_status = 'paid'
        elif total_paid > 0:
            sale.payment_status = 'partial'
        else:
            sale.payment_status = 'unpaid'
        
        sale.save()


class StockMovement(models.Model):
    """Modèle pour suivre les mouvements de stock"""
    MOVEMENT_TYPE_CHOICES = (
        ('in', 'Entrée'),
        ('out', 'Sortie'),
        ('adjustment', 'Ajustement'),
    )
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Produit", related_name="stock_movements")
    quantity = models.IntegerField(verbose_name="Quantité")
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPE_CHOICES, verbose_name="Type de mouvement")
    reference = models.CharField(max_length=100, verbose_name="Référence", blank=True, null=True)
    date = models.DateTimeField(verbose_name="Date", default=timezone.now)
    notes = models.TextField(verbose_name="Notes", blank=True, null=True)

    class Meta:
        verbose_name = "Mouvement de stock"
        verbose_name_plural = "Mouvements de stock"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.movement_type} - {self.product.name} - {self.quantity}"

    def save(self, *args, **kwargs):
        """Mise à jour du stock après sauvegarde"""
        super().save(*args, **kwargs)
        
        if self.movement_type == 'in':
            self.product.stock_quantity += self.quantity
        elif self.movement_type == 'out':
            self.product.stock_quantity -= self.quantity
        elif self.movement_type == 'adjustment':
            # Pour un ajustement, la quantité peut être positive ou négative
            self.product.stock_quantity += self.quantity
        
        self.product.save()


class Invoice(models.Model):
    """Modèle pour les factures"""
    STATUS_CHOICES = (
        ('draft', 'Brouillon'),
        ('sent', 'Envoyée'),
        ('paid', 'Payée'),
        ('cancelled', 'Annulée'),
        ('overdue', 'En retard'),
    )
    
    sale = models.OneToOneField(Sale, on_delete=models.CASCADE, verbose_name="Vente", related_name="invoice")
    invoice_number = models.CharField(max_length=50, verbose_name="Numéro de facture", unique=True)
    issue_date = models.DateField(verbose_name="Date d'émission", default=timezone.now)
    due_date = models.DateField(verbose_name="Date d'échéance", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Statut")
    notes = models.TextField(verbose_name="Notes", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")

    class Meta:
        verbose_name = "Facture"
        verbose_name_plural = "Factures"
        ordering = ["-issue_date"]

    def __str__(self):
        return f"Facture {self.invoice_number}"

    @property
    def is_overdue(self):
        """Vérifie si la facture est en retard de paiement"""
        if self.due_date and self.status not in ['paid', 'cancelled']:
            return self.due_date < timezone.now().date()
        return False