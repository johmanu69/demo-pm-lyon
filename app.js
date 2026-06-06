const app = {
    // Identifiants encodés en Base64 pour masquer la lecture directe dans le code source
    // "TVBFUkVa" = MPEREZ | "MjAyNjA2" = 202606
    credentials: {
        loginHash: "TVBFUkVa",
        pwdHash: "MjAyNjA2"
    },

    // 1. Système de connexion sécurisé pour la démo
    login: function() {
        const user = document.getElementById('input-login').value.toUpperCase();
        const pass = document.getElementById('input-pwd').value;

        // On encode ce que tape l'utilisateur pour le comparer au hash masqué
        if (btoa(user) === this.credentials.loginHash && btoa(pass) === this.credentials.pwdHash) {
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
        }
    },

    // 4. Géolocalisation GPS avec conversion en adresse postale (OpenStreetMap)
    getLocation: function() {
        const addressInput = document.getElementById('input-adresse');
        
        if (navigator.geolocation) {
            addressInput.value = "Recherche satellite en cours...";
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    // Appel à l'API gratuite OpenStreetMap pour convertir le GPS en adresse
                    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
                    
                    fetch(url)
                        .then(response => response.json())
                        .then(data => {
                            if (data && data.display_name) {
                                // Succès : on insère l'adresse trouvée dans le champ (qui reste modifiable manuellement)
                                addressInput.value = data.display_name;
                            } else {
                                addressInput.value = `GPS : ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
                            }
                        })
                        .catch(err => {
                            console.error("Erreur API", err);
                            addressInput.value = `GPS : ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
                        });
                },
                function(error) {
                    alert("Erreur GPS. Vérifiez que la position est activée sur votre téléphone. Vous pouvez saisir l'adresse manuellement.");
                    addressInput.value = "";
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            alert("La géolocalisation n'est pas supportée par votre appareil.");
        }
    },

    // 5. Outil de génération d'horodatage
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

        const contenuFichier = `=== NOUVEAU SIGNALEMENT ===\r\n` +
                               `Date de saisie : ${new Date().toLocaleString('fr-FR')}\r\n` +
                               `---------------------------\r\n` +
                               `Identité du requérant : ${nom}\r\n` +
                               `Téléphone : ${tel}\r\n` +
                               `---------------------------\r\n` +
                               `Type d'incident : ${categorie}\r\n` +
                               `Localisation : ${adresse}\r\n` +
                               `Observations : ${obs}\r\n` +
                               `===========================\r\n`;

        const blob = new Blob([contenuFichier], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const lienTelechargement = document.createElement('a');
        
        lienTelechargement.href = url;
        lienTelechargement.download = `Signalement_${this.getTimestamp()}.txt`;
        
        document.body.appendChild(lienTelechargement);
        lienTelechargement.click();
        
        document.body.removeChild(lienTelechargement);
        URL.revokeObjectURL(url);
        
        alert("Alerte transmise !\n\nLe rapport a été généré et téléchargé sur votre appareil.");
        
        document.getElementById('input-nom').value = '';
        document.getElementById('input-tel').value = '';
        document.getElementById('input-adresse').value = '';
        document.getElementById('input-obs').value = '';
        document.getElementById('select-categorie').value = '';
        this.showScreen('screen-home');
    }
};
