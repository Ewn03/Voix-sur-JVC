// ==UserScript==
// @name         Synthèse Vocale pour jv chat sur le 18-25
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Ajoute la synthèse vocale sur le 18 25 de JeuxVideo.com
// @author       Ewn03
// @match        https://www.jeuxvideo.com/forums/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var voices = [];
    var voixChargees = false;//attend de charger les voix
    var autoriseVoix = false;//autorise manuellement à lire le texte
    updateVoices();

    function updateVoices() {
        voices = speechSynthesis.getVoices();
        //console.log(voices); // Log des voix disponibles
        if (voices.length > 0) {
            voixChargees = true;
            createTitre();
        } else {
            setTimeout(updateVoices, 250);
        }
    }

    function startVoice(contentText) {
        var utterance = new SpeechSynthesisUtterance(contentText);
        // choisir une voix spécifique:
        //"Microsoft Hortense - French (France)"
        //"Microsoft Julie - French (France)"
        //"Google français"

        utterance.voice = voices.find(voice => voice.name === "Google français");
        utterance.rate = 1.1;//vitesse de parole
        console.log("on speak");
        speechSynthesis.speak(utterance);
        let r = setInterval(() => {
            //console.log(speechSynthesis.speaking);
            if (!speechSynthesis.speaking) {
                clearInterval(r);
                console.log("clearinterval");
            } else {
                console.log("speech pause and resume");
                speechSynthesis.pause();
                speechSynthesis.resume();
            }
        }, 14000);
    }

    observeDOM();

    function handleNewMessage(node) {
        if (node && node.querySelectorAll) {
            var pElements = node.querySelectorAll('.txt-msg p');
            pElements.forEach(function(p) {
                // Vérifier si l'élément <p> est contenu dans un <blockquote>
                if (!p.closest('blockquote')) {
                    var textContent = p.textContent;
                    console.log("on va lire : "+textContent);

                    if (voixChargees){
                        startVoice(textContent);
                    }
                }
            });
        }
    }

    // Fonction pour observer les mutations dans le DOM
    function observeDOM() {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {

                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    let node = mutation.addedNodes[i];
                    if (node.nodeType === 1 && node.matches('.jvchat-bloc-message')) {
                        if ( autoriseVoix ) handleNewMessage(node);
                        else console.log("voix pas encore autorisee, cliquez sur la checkbox");
                    }
                }
            });
        });

        // Configuration de l'observer : écouter les ajouts de nouveaux éléments
        var config = { childList: true, subtree: true };
        observer.observe(document.body, config);
    }

    function stopVoice() {
        if ( speechSynthesis ) speechSynthesis.cancel();
    }

    function creerCheckbox(){
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'activerCheckbox';

        var label = document.createElement('label');
        label.htmlFor = 'Activer la voix';
        label.appendChild(document.createTextNode('Activer la voix'));

        // Ajouter le checkbox et le label au conteneur
        var container = document.createElement('div');
        container.appendChild(checkbox);
        container.appendChild(label);
        checkbox.addEventListener('change', verifierEtatCheckbox);
        var forumDiv = document.getElementById('titreVoix');
        forumDiv.insertAdjacentElement('afterend', container);
    }

    function verifierEtatCheckbox(e){
        if ( e.target.checked ) {
            autoriseVoix = true;//un 'speech' est recréé à chaque fois
        } else {
            autoriseVoix = false;
            stopVoice();//le 'speech' est annulé
        }
    }

    function createTitre(){
        var newTitre = document.createElement('h4');
        newTitre.textContent = 'Activer la voix qui lit les messages';
        newTitre.id = "titreVoix";
        var forumDiv = document.getElementById('jvchat-forum');
        newTitre.classList.add('titre-info-fofo');
        if (forumDiv) {
            // Insérer le bouton après la div 'jvchat-forum'
            forumDiv.insertAdjacentElement('afterend', newTitre);
            creerCheckbox();
        } else {
            console.log("Élément 'jvchat-forum' introuvable");
            setTimeout(createTitre, 500);
        }
    }


})();
