const app = {
    // Identifiants demandés pour la démo
    credentials: {
        login: "MPEREZ",
        pwd: "202606"
    },

    // 1. Système de connexion
    login: function() {
        const user = document.getElementById('input-login').value;
        const pass = document.getElementById('input-pwd').value;

        if (user === this.credentials.login && pass === this.credentials.pwd) {
            this.showScreen('screen-home');
            this.loadCategories(); 
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    },

    // 2. Navigation
    showScreen: function(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },

    // 3. Chargement du fichier JSON
    loadCategories: async function() {
        try {
            const response = await fetch('config.json');
            const data = await response.json();
            const select = document.getElementById('select-categorie');
            
            select.innerHTML = '<option value="">-- Sélectionnez une catégorie --</option>';
            data.categoriesSignalement.forEach(cat => {
                select.innerHTML += `<option value="${cat.label}">${cat.label}</option>`;
            });
        } catch (error) {
            console.error("Erreur de chargement", error);
            document.getElementById('select-categorie').innerHTML = '<option value="">Erreur chargement JSON</option>';
        }
    },

    // 4. Géolocalisation GPS
    getLocation: function() {
        const addressInput = document.getElementById('input-adresse');
        
        if (navigator.geolocation) {
            addressInput.value = "Recherche GPS en cours...";
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude.toFixed(5);
                    const lon = position.coords.longitude.toFixed(5);
                    addressInput.value = `GPS : ${lat}, ${lon}`;
                },
                function(error) {
                    alert("Erreur de géolocalisation. Veuillez vérifier les autorisations de votre navigateur ou saisir l'adresse manuellement.");
                    addressInput.value = "";
                }
            );
        } else {
            alert("La géolocalisation n'est pas supportée par votre appareil.");
        }
    },

    // 5. Outil de génération d'horodatage (ex: 20260615_143000)
    getTimestamp: function() {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    },

    // 6. Soumission et création du fichier texte
    submitSignalement: function() {
        const nom = document.getElementById('input-nom').value || 'Anonyme';
        const tel = document.getElementById('input-tel').value || 'Non renseigné';
        const categorie = document.getElementById('select-categorie').value;
        const adresse = document.getElementById('input-adresse').value;
        const obs = document.getElementById('input-obs').value || 'Aucune observation';

        if(!categorie || !adresse) {
            alert("Veuillez remplir au moins le type d'incident et la localisation.");
            return;
        }

        // Formatage du contenu du fichier texte
        const contenuFichier = `=== NOUVEAU SIGNALEMENT ===\r\n` +
                               `Date de saisie : ${new Date().toLocaleString('fr-FR')}\r\n` +
                               `---------------------------\r\n` +
                               `Identité du requérant : ${nom}\r\n` +
                               `Téléphone : ${tel}\r\n` +
                               `---------------------------\r\n` +
                               `Type d'incident : ${categorie}\r\n` +
                               `Localisation / GPS : ${adresse}\r\n` +
                               `Observations : ${obs}\r\n` +
                               `===========================\r\n`;

        // Création du fichier virtuel
        const blob = new Blob([contenuFichier], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const lienTelechargement = document.createElement('a');
        
        lienTelechargement.href = url;
        // Nom du fichier avec horodatage
        lienTelechargement.download = `Signalement_${this.getTimestamp()}.txt`;
        
        // Déclenchement du téléchargement
        document.body.appendChild(lienTelechargement);
        lienTelechargement.click();
        
        // Nettoyage de la mémoire
        document.body.removeChild(lienTelechargement);
        URL.revokeObjectURL(url);
        
        alert("Alerte transmise !\n\nLe rapport a été généré et téléchargé sur votre appareil sous forme de fichier texte horodaté.");
        
        // Réinitialisation du formulaire
        document.getElementById('input-nom').value = '';
        document.getElementById('input-tel').value = '';
        document.getElementById('input-adresse').value = '';
        document.getElementById('input-obs').value = '';
        document.getElementById('select-categorie').value = '';
        this.showScreen('screen-home');
    }
};
