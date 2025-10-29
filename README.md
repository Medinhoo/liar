# 🃏 Menteur - Jeu de cartes multijoueur

MVP d'un jeu de cartes en ligne jouable entre amis (2-4 joueurs).

## 🎯 Fonctionnalités MVP

- ✅ Création et jonction de salles avec code unique
- ✅ Jusqu'à 4 joueurs par partie
- ✅ Distribution automatique de 52 cartes
- ✅ Tour par tour synchronisé en temps réel
- ✅ Interface animée avec Framer Motion
- ⚠️ Pas de persistance (refresh = partie perdue)
- ⚠️ Pas encore de logique "menteur" (juste la mécanique de base)

## 🛠️ Stack technique

### Backend
- Node.js + Express
- Socket.IO pour le temps réel
- Stockage en mémoire (pas de DB)

### Frontend
- React + TypeScript
- TailwindCSS
- Framer Motion
- Socket.IO client

## 🚀 Installation et lancement

### Prérequis
- Node.js (v18+)
- npm

### 1. Installer les dépendances

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Lancer le serveur backend

```bash
cd server
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

### 3. Lancer le client frontend

Dans un nouveau terminal :

```bash
cd client
npm run dev
```

Le client démarre sur `http://localhost:5173`

## 🎮 Comment jouer

1. **Créer une partie**
   - Ouvrez `http://localhost:5173`
   - Cliquez sur "Créer une partie"
   - Entrez votre nom
   - Partagez le code de salle avec vos amis

2. **Rejoindre une partie**
   - Ouvrez `http://localhost:5173` dans un autre navigateur/onglet
   - Cliquez sur "Rejoindre une partie"
   - Entrez votre nom et le code de salle

3. **Démarrer la partie**
   - L'hôte clique sur "Démarrer la partie" (minimum 2 joueurs)
   - Les cartes sont distribuées automatiquement

4. **Jouer**
   - Chaque joueur joue à tour de rôle
   - Cliquez sur une carte de votre main pour la jouer
   - La carte apparaît au centre
   - Le tour passe au joueur suivant

## 📁 Structure du projet

```
menteur/
├── server/
│   ├── index.js              # Serveur Express + Socket.IO
│   ├── gameManager.js        # Gestion des parties en mémoire
│   └── utils/
│       └── deck.js           # Génération et distribution des cartes
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Card.tsx      # Composant carte
    │   │   ├── PlayerHand.tsx # Main du joueur
    │   │   └── GameBoard.tsx  # Plateau de jeu
    │   ├── pages/
    │   │   ├── Home.tsx       # Page d'accueil
    │   │   └── GameRoom.tsx   # Salle de jeu
    │   ├── context/
    │   │   └── SocketContext.tsx # Gestion Socket.IO
    │   ├── types/
    │   │   └── game.ts        # Types TypeScript
    │   └── App.tsx
    └── package.json
```

## 🔌 Événements Socket.IO

### Client → Serveur
- `create_room` - Créer une salle
- `join_room` - Rejoindre une salle
- `start_game` - Démarrer la partie
- `play_card` - Jouer une carte

### Serveur → Client
- `room_created` - Salle créée
- `room_joined` - Salle rejointe
- `player_joined` - Nouveau joueur
- `game_started` - Partie démarrée
- `card_played` - Carte jouée
- `turn_changed` - Changement de tour
- `game_ended` - Partie terminée
- `error` - Erreur

## ⚠️ Limitations actuelles

- Pas de persistance (refresh = perte de la partie)
- Pas de reconnexion automatique
- Pas de logique du "menteur" (bluff, vérification)
- Pas de gestion des points
- Pas d'historique des parties
- Maximum 4 joueurs

## 🔮 Évolutions futures

- [ ] Implémenter les règles du "menteur"
- [ ] Système de bluff et vérification
- [ ] Persistance avec Redis/DB
- [ ] Reconnexion automatique
- [ ] Historique des parties
- [ ] Système de points
- [ ] Chat en jeu
- [ ] Animations avancées
- [ ] Mode spectateur
- [ ] Parties privées/publiques

## 📝 Notes de développement

- Le serveur tourne sur le port 3001
- Le client tourne sur le port 5173
- CORS configuré pour le développement local
- Toutes les données sont en mémoire côté serveur
- Les cartes sont représentées avec symboles Unicode (♥ ♦ ♣ ♠)

## 🐛 Débogage

Si vous rencontrez des problèmes :

1. Vérifiez que les deux serveurs sont lancés
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez les logs du serveur backend
4. Assurez-vous que les ports 3001 et 5173 sont disponibles

## 📄 Licence

Ce projet est un MVP éducatif sans licence spécifique.
