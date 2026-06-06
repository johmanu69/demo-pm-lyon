const app = {
    // Identifiants en dur pour la démo
    credentials: {
        login: "MPEREZ",
        pwd: "202606"
    },

    // Fonction d'authentification
    login: function() {
        const user = document.getElementById('input-login').value;
        const pass = document.getElementById('input-pwd').value;

        if (user === this.credentials.login && pass === this.credentials.pwd) {
            this.showScreen('screen-home');
            this.loadCategories(); // Charge le fichier JSON une fois connecté
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    },

    // Navigation entre les écrans
    showScreen: function(screenId) {
        // Masque tous les écrans
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        // Affiche l'écran demandé
        document.getElementById(screenId).classList.add('active');
    },

    // Chargement dynamique des catégories depuis config.json
    loadCategories: async function() {
        try {
            const response = await fetch('config.json');
            const data = await response.json();
            const select = document.getElementById('select-categorie');
            
            // On vide le select et on le remplit avec les données du fichier
            select.innerHTML = '<option value="">-- Sélectionnez une catégorie --</option>';
            data.categoriesSignalement.forEach(cat => {
                select.innerHTML += `<option value="${cat.id}">${cat.label}</option>`;
            });
        } catch (error) {
            console.error("Erreur de chargement du fichier de configuration", error);
        }
    },

    // Simulation d'enregistrement
    submitSignalement: function() {
        const categorie = document.getElementById('select-categorie').value;
        const adresse = document.getElementById('input-adresse').value;

        if(!categorie || !adresse) {
            alert("Veuillez remplir au moins la catégorie et l'adresse.");
            return;
        }

        // Création d'un objet de données pour simuler la sauvegarde
        const dataToSave = {
            date: new Date().toISOString(),
            categorie: categorie,
            adresse: adresse,
            observations: document.getElementById('input-obs').value
        };

        // Sauvegarde fictive dans le navigateur
        console.log("Données enregistrées localement :", dataToSave);
        alert("Signalement enregistré avec succès !\n\nDans la version finale, ceci mettra à jour la base de données du poste.");
        
        // Réinitialisation et retour accueil
        document.getElementById('input-adresse').value = '';
        document.getElementById('input-obs').value = '';
        document.getElementById('select-categorie').value = '';
        this.showScreen('screen-home');
    }
};
