# Application de Gestion des Finances d'Entreprise

Cette application est destinée à une entrepreneure qui vend des sacs, chaussures et autres produits. Elle permet de suivre l'ensemble des transactions financières, de gérer les fournisseurs, les clients, et d'offrir une visibilité sur les flux financiers à travers des tableaux de bord interactifs.

## Fonctionnalités principales du MVP

- Gestion des fournisseurs et des achats
- Suivi des stocks
- Gestion des ventes et des clients
- Tableaux de bord pour le suivi des échéances et des flux financiers
- Génération de factures

## Technologies utilisées

- **Backend**: Django (Python)
- **Base de données**: PostgreSQL
- **Frontend**: React.js
- **API**: Django REST Framework

## Installation et démarrage

### Prérequis

- Python 3.9+
- Node.js 16+
- PostgreSQL 13+

### Installation backend (Django)

```bash
# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows : venv\Scripts\activate

# Installer les dépendances
pip install -r backend/requirements.txt

# Configurer la base de données
cd backend
python manage.py migrate

# Démarrer le serveur
python manage.py runserver
```

### Installation frontend (React)

```bash
# Installer les dépendances
cd frontend
npm install

# Démarrer l'application
npm start
```