# 🚀 Guide de déploiement sur Render

Ce guide vous explique comment déployer votre jeu Menteur sur Render.com (gratuit).

## 📋 Prérequis

- ✅ Compte GitHub avec le projet poussé
- ✅ Compte Render.com (gratuit)

## 🔧 Étape 1 : Pousser les changements sur GitHub

Les fichiers suivants ont été modifiés/créés pour le déploiement :
- `package.json` (racine) - Scripts de build et démarrage
- `server/index.js` - Configuration production/développement
- `client/src/context/SocketContext.tsx` - URL dynamique
- `render.yaml` - Configuration Render
- `.env.example` - Documentation des variables

**Commandes à exécuter :**

```bash
# Vérifier les fichiers modifiés
git status

# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "Préparation pour déploiement sur Render"

# Pousser sur GitHub
git push origin main
```

## 🌐 Étape 2 : Créer un compte Render

1. Allez sur https://render.com
2. Cliquez sur "Get Started for Free"
3. Connectez-vous avec votre compte GitHub
4. Autorisez Render à accéder à vos repositories

## 🎯 Étape 3 : Créer un nouveau Web Service

1. Dans le dashboard Render, cliquez sur **"New +"** → **"Web Service"**

2. Connectez votre repository GitHub :
   - Cherchez "menteur" ou "liar"
   - Cliquez sur **"Connect"**

3. Configurez le service :
   - **Name** : `menteur` (ou le nom de votre choix)
   - **Region** : `Frankfurt (EU Central)` (le plus proche de la Belgique)
   - **Branch** : `main`
   - **Runtime** : `Node`
   - **Build Command** : `npm run build`
   - **Start Command** : `npm start`
   - **Instance Type** : `Free`

4. Variables d'environnement :
   - Cliquez sur **"Advanced"**
   - Ajoutez : `NODE_ENV` = `production`
   - (Le `PORT` est automatiquement fourni par Render)

5. Cliquez sur **"Create Web Service"**

## ⏳ Étape 4 : Attendre le déploiement

Render va maintenant :
1. ✅ Cloner votre repository
2. ✅ Installer les dépendances (`npm install`)
3. ✅ Builder le client React (`npm run build`)
4. ✅ Copier les fichiers dans `server/public`
5. ✅ Démarrer le serveur Node.js

**Durée estimée : 3-5 minutes**

Vous verrez les logs en temps réel. Attendez le message :
```
==> Your service is live 🎉
```

## 🎮 Étape 5 : Tester votre jeu

1. Render vous donnera une URL type : `https://menteur.onrender.com`

2. Ouvrez cette URL dans votre navigateur

3. Testez :
   - ✅ Créer une partie
   - ✅ Ouvrir un autre onglet/navigateur
   - ✅ Rejoindre avec le code
   - ✅ Jouer quelques tours

## ⚠️ Important : Plan gratuit de Render

**Limitations du plan gratuit :**
- ✅ Votre jeu est accessible 24/7
- ⚠️ Après **15 minutes d'inactivité**, le serveur s'endort
- ⏱️ Au premier accès, il redémarre en **~30 secondes**
- 💡 Parfait pour jouer entre amis occasionnellement

**Astuce :** Si vous voulez éviter l'attente, visitez le site 1 minute avant de jouer pour le "réveiller".

## 🔄 Mises à jour futures

Pour déployer des changements :

```bash
# Faire vos modifications
git add .
git commit -m "Description des changements"
git push origin main
```

Render détectera automatiquement le push et redéploiera ! 🚀

## 🐛 Dépannage

### Le site ne charge pas
- Vérifiez les logs dans le dashboard Render
- Assurez-vous que le build s'est terminé avec succès

### Erreur de connexion Socket.IO
- Vérifiez que `NODE_ENV=production` est bien défini
- Regardez les logs du navigateur (F12 → Console)

### Le serveur s'endort trop vite
- C'est normal avec le plan gratuit
- Considérez un upgrade à 7$/mois pour un serveur toujours actif

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs Render
2. Vérifiez la console du navigateur (F12)
3. Relisez ce guide étape par étape

## 🎉 Félicitations !

Votre jeu Menteur est maintenant en ligne et accessible à tous ! 🃏

Partagez l'URL avec vos amis et amusez-vous bien !
