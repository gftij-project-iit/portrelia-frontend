
import { Link, useLocation } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";

import logo from "../../assets/logo.png";
import "./LegalPage.css";

/* =========================================================
   PORTRÉLIA — INFORMATIONS COMMUNES
   ========================================================= */

const COMPANY = {
  serviceName: "Portrélia",
  operatorName: "OFTI",
  address: "23 rue du Départ, boîte 37, 75014 Paris, France",
  phone: "01 87 66 00 12",
  website: "https://www.portrelia.fr",
  analyticsId: "G-L4RVHLB0T7",
};

const LEGAL_LINKS = [
  {
    title: "Confidentialité",
    path: "/politique-confidentialite",
  },
  {
    title: "Mentions légales",
    path: "/mentions-legales",
  },
  {
    title: "CGU",
    path: "/cgu",
  },
  {
    title: "CGV",
    path: "/cgv",
  },
  {
    title: "Cookies",
    path: "/politique-cookies",
  },
];

/* =========================================================
   DOCUMENTS JURIDIQUES
   ========================================================= */

const documents = {
  /* =======================================================
     1. POLITIQUE DE CONFIDENTIALITÉ
     ======================================================= */

  "/politique-confidentialite": {
    eyebrow: "PROTECTION DES DONNÉES",
    title: "Politique de confidentialité",

    intro:
      "Chez Portrélia, la protection des informations personnelles et des photographies constitue une dimension essentielle de notre service. Cette politique présente les données traitées, leurs finalités et les droits des personnes concernées.",

    sections: [
      {
        title: "1. Présentation de Portrélia",
        paragraphs: [
          "Portrélia est un service destiné aux entreprises souhaitant produire des portraits professionnels homogènes pour leurs équipes, sans organiser nécessairement de séance photographique collective.",

          "La plateforme permet aux entreprises de créer et suivre des campagnes de portraits, d'inviter leurs collaborateurs, de réceptionner des photographies et de consulter les portraits réalisés.",

          "Le service est présenté comme étant exploité par OFTI, sous réserve de confirmation de l'identité juridique complète de l'entité contractante.",

          `Adresse de contact communiquée : ${COMPANY.address}.`,

          `Téléphone : ${COMPANY.phone}.`,

          `Site internet : ${COMPANY.website}.`,
        ],
      },

      {
        title: "2. Personnes concernées",
        paragraphs: [
          "La présente politique concerne les visiteurs du site, les représentants des entreprises clientes, les administrateurs des comptes entreprises, les collaborateurs invités à participer à une campagne et les personnes demandant une démonstration.",

          "Les comptes entreprises sont créés après validation par l'équipe Portrélia. Les collaborateurs participent aux campagnes au moyen d'une invitation ou d'un lien prévu à cet effet.",

          "Le service commercial est destiné aux professionnels et peut être proposé à des entreprises établies dans différents pays de l'Union européenne.",
        ],
      },

      {
        title: "3. Données personnelles collectées",
        paragraphs: [
          "Selon le parcours utilisé et les fonctionnalités activées, les catégories suivantes peuvent être traitées.",
        ],

        bullets: [
          "Informations d'identification : nom, prénom et coordonnées professionnelles.",
          "Informations relatives à l'entreprise : dénomination, coordonnées et données nécessaires à la gestion du compte.",
          "Données de connexion : informations techniques relatives à l'authentification et à la sécurité.",
          "Données de campagne : invitations, participants, statuts, styles visuels sélectionnés et historique de traitement.",
          "Photographies originales transmises par les collaborateurs.",
          "Portraits générés, sélections, validations et éventuelles versions retouchées.",
          "Informations nécessaires aux abonnements et à la facturation.",
          "Demandes d'assistance et échanges avec l'équipe Portrélia.",
          "Informations de fréquentation collectées par Google Analytics lorsque le visiteur a accepté les cookies concernés.",
        ],
      },

      {
        title: "4. Finalités des traitements",
        paragraphs: [
          "Les informations collectées sont utilisées pour assurer la fourniture et le fonctionnement du service Portrélia.",
        ],

        bullets: [
          "Traiter les demandes de démonstration et les relations commerciales.",
          "Créer et administrer les comptes professionnels.",
          "Organiser les campagnes de portraits.",
          "Inviter les collaborateurs et suivre leur participation.",
          "Recevoir les photographies nécessaires à la prestation.",
          "Produire des portraits professionnels à l'aide d'outils techniques et d'intelligence artificielle.",
          "Effectuer les contrôles qualité et les retouches humaines nécessaires.",
          "Permettre la sélection, la validation et la livraison des portraits.",
          "Gérer les abonnements, les paiements et les factures.",
          "Assurer l'assistance technique et la sécurité du service.",
          "Mesurer la fréquentation du site lorsque le consentement requis a été donné.",
        ],
      },

      {
        title: "5. Responsabilités et bases légales",
        paragraphs: [
          "Les rôles des parties peuvent varier selon les traitements réalisés.",

          "Lorsqu'une entreprise cliente décide d'organiser une campagne de portraits pour ses collaborateurs, elle peut agir en qualité de responsable du traitement, Portrélia intervenant alors en qualité de sous-traitant pour les opérations réalisées sur ses instructions.",

          "Pour les opérations relatives à sa propre activité, notamment les demandes commerciales, la gestion de son site ou la facturation, l'exploitant de Portrélia peut agir en qualité de responsable du traitement.",

          "Les traitements doivent reposer sur une base juridique appropriée, notamment l'exécution d'un contrat, une obligation légale, l'intérêt légitime ou le consentement lorsque celui-ci est requis.",

          "La base légale exacte applicable aux photographies des collaborateurs doit être déterminée en fonction du rôle de chaque partie et communiquée avant la collecte. L'acceptation de conditions d'utilisation ne remplace pas automatiquement le consentement à l'utilisation de l'image.",
        ],
      },

      {
        title: "6. Photographies et intelligence artificielle",
        paragraphs: [
          "Portrélia permet la création de portraits professionnels à partir de photographies fournies dans le cadre d'une campagne organisée par une entreprise.",

          "Le parcours envisagé comprend une invitation, la présentation d'un guide photographique, la transmission de photographies, leur traitement, un contrôle qualité, puis la mise à disposition des portraits selon les droits applicables.",

          "La génération peut reposer sur des services d'intelligence artificielle fournis par des prestataires externes.",

          "L'équipe Portrélia peut intervenir pour sélectionner les résultats, vérifier la ressemblance, identifier d'éventuels défauts visuels et effectuer des corrections ou retouches.",

          "Les photographies transmises sont destinées à la réalisation de la prestation demandée. Toute utilisation supplémentaire doit disposer d'une base juridique appropriée et être portée à la connaissance des personnes concernées.",

          "Le nom du fournisseur d'intelligence artificielle, ses conditions de traitement des photographies et la question de leur éventuelle utilisation pour l'entraînement de modèles restent à vérifier. Aucune garantie de non-entraînement ne peut être formulée avant cette vérification.",
        ],
      },

      {
        title: "7. Utilisation et publication des portraits",
        paragraphs: [
          "Les portraits produits par Portrélia sont destinés à des usages professionnels convenus avec l'entreprise cliente.",

          "Ils peuvent notamment être utilisés sur des profils professionnels, des sites d'entreprise, des organigrammes, des signatures électroniques et des supports de communication.",

          "L'entreprise cliente doit s'assurer qu'elle dispose des droits et autorisations nécessaires pour les utilisations envisagées de l'image des collaborateurs.",

          "La livraison d'un portrait ne constitue pas à elle seule une autorisation générale de publier l'image d'une personne dans tous les contextes.",

          "Les collaborateurs doivent recevoir une information claire sur les usages prévus, les destinataires des images et les modalités d'exercice de leurs droits.",
        ],
      },

      {
        title: "8. Personnes pouvant accéder aux images",
        paragraphs: [
          "L'accès aux photographies et aux portraits dépend du rôle de l'utilisateur et des autorisations associées à la campagne.",

          "Les personnes susceptibles d'être autorisées à accéder aux fichiers comprennent le collaborateur concerné, certains utilisateurs habilités de l'entreprise cliente et les administrateurs autorisés de Portrélia.",

          "Des prestataires techniques peuvent également intervenir lorsqu'un accès aux données est nécessaire à la réalisation du service.",

          "Les accès doivent être limités aux besoins professionnels et techniques correspondants.",

          "Les galeries privées et les éventuels liens de partage doivent être utilisés conformément aux autorisations mises en place.",
        ],
      },

      {
        title: "9. Hébergement et prestataires techniques",
        paragraphs: [
          "Portrélia utilise Supabase pour certaines fonctionnalités de stockage et de gestion des données, notamment celles liées aux images.",

          "D'autres services techniques peuvent intervenir dans le fonctionnement de l'application, en particulier pour l'hébergement du site, le serveur applicatif, la messagerie transactionnelle, le paiement et la génération des portraits.",

          "Stripe intervient dans le traitement des paiements et la gestion de certaines informations liées à la facturation.",

          "Google Analytics 4 est utilisé pour mesurer la fréquentation du site lorsque le visiteur a accepté les traceurs concernés.",

          "Les régions exactes de traitement, la liste complète des sous-traitants et les éventuels transferts internationaux doivent être confirmés à partir des configurations et contrats des fournisseurs.",
        ],
      },

      {
        title: "10. Conservation des données",
        paragraphs: [
          "Les données personnelles doivent être conservées uniquement pendant une durée proportionnée aux finalités pour lesquelles elles sont traitées, sous réserve des obligations légales applicables.",

          "Des durées spécifiques doivent être définies pour les comptes utilisateurs, les invitations, les campagnes, les photographies originales, les portraits générés, les fichiers sauvegardés et les journaux techniques.",

          "À la date de rédaction, la durée définitive de conservation des photographies originales et des portraits générés n'a pas encore été fixée. Cette règle doit être arrêtée et appliquée techniquement avant la mise en exploitation complète.",

          "Les documents de facturation sont conservés selon les obligations comptables et fiscales applicables.",
        ],
      },

      {
        title: "11. Protection et sécurité",
        paragraphs: [
          "Portrélia prévoit des mesures techniques et organisationnelles destinées à protéger les informations traitées.",

          "Ces mesures comprennent notamment la gestion des comptes et des habilitations, la protection de l'accès aux fichiers, ainsi que le suivi des fonctionnalités nécessaires à la sécurité de l'application.",

          "Les utilisateurs doivent également protéger leurs identifiants et signaler toute activité suspecte.",

          "Aucune mesure de sécurité ne peut garantir l'élimination de tous les risques. Les mécanismes réellement déployés doivent faire l'objet de vérifications et de mises à jour régulières.",
        ],
      },

      {
        title: "12. Droits des personnes concernées",
        paragraphs: [
          "Sous réserve des conditions prévues par le Règlement général sur la protection des données, toute personne concernée peut exercer ses droits d'accès, de rectification, d'effacement, de limitation, d'opposition et, lorsque les conditions sont réunies, de portabilité.",

          "Lorsqu'un traitement repose sur le consentement, celui-ci peut être retiré à tout moment, sans remettre en cause la licéité des traitements réalisés auparavant.",

          "Les demandes peuvent être adressées à l'exploitant du service par les coordonnées de contact communiquées dans les présentes pages. Un contact électronique spécifique à la protection des données doit encore être désigné.",

          "Lorsqu'une demande concerne un traitement réalisé pour le compte d'une entreprise cliente, Portrélia peut être amené à transmettre la demande ou à assister cette entreprise selon la répartition de leurs responsabilités.",

          "Les personnes concernées disposent également du droit d'introduire une réclamation auprès de la Commission nationale de l'informatique et des libertés, la CNIL.",
        ],
      },

      {
        title: "13. Cookies et mesure d'audience",
        paragraphs: [
          "Portrélia utilise Google Analytics 4 afin de mieux comprendre la fréquentation du site et les pages consultées.",

          "Le chargement des outils de mesure d'audience concernés est conditionné à l'acceptation des cookies par le visiteur.",

          "Le visiteur peut accepter, refuser puis modifier son choix depuis le dispositif de gestion des préférences proposé sur le site.",

          "Des informations complémentaires figurent dans la politique de cookies.",
        ],
      },

      {
        title: "14. Contact",
        paragraphs: [
          `Exploitant indiqué : ${COMPANY.operatorName}.`,
          `Adresse de contact : ${COMPANY.address}.`,
          `Téléphone : ${COMPANY.phone}.`,

          "L'adresse électronique dédiée aux demandes RGPD n'a pas encore été communiquée. Elle devra être ajoutée avant la publication définitive de cette politique.",
        ],
      },
    ],
  },

  /* =======================================================
     2. MENTIONS LÉGALES
     ======================================================= */

  "/mentions-legales": {
    eyebrow: "INFORMATIONS JURIDIQUES",
    title: "Mentions légales",

    intro:
      "Retrouvez les informations relatives à l'exploitation du site Portrélia, à ses coordonnées et aux règles applicables à son contenu.",

    sections: [
      {
        title: "1. Présentation du site",
        paragraphs: [
          "Portrélia est une plateforme professionnelle destinée à la création et à la gestion de campagnes de portraits d'entreprise.",

          "Le service permet aux entreprises d'organiser la participation de leurs collaborateurs et de retrouver les portraits produits dans un espace dédié.",

          `Le site est accessible à l'adresse ${COMPANY.website}.`,
        ],
      },

      {
        title: "2. Exploitant du service",
        paragraphs: [
          `Nom commercial ou exploitant communiqué : ${COMPANY.operatorName}.`,

          "Portrélia est présenté comme un service commercialisé sous la responsabilité d'OFTI, sous réserve de confirmation de l'identité juridique exacte du cocontractant.",

          `Adresse de contact communiquée : ${COMPANY.address}.`,

          `Téléphone : ${COMPANY.phone}.`,

          "La dénomination sociale complète, la forme juridique, le capital social lorsqu'il est applicable, le siège social confirmé, les références d'immatriculation et le numéro de TVA éventuel n'ont pas encore été communiqués.",

          "Ces renseignements doivent être ajoutés aux mentions légales avant la mise en ligne commerciale définitive. L'adresse de contact ci-dessus ne peut être présentée comme siège social sans confirmation.",
        ],
      },

      {
        title: "3. Direction de la publication",
        paragraphs: [
          "Le nom et la qualité de la personne assumant la direction de la publication doivent être indiqués par l'entreprise exploitante.",

          "À la date de préparation de ce document, cette information reste à confirmer.",
        ],
      },

      {
        title: "4. Hébergement et infrastructure",
        paragraphs: [
          "La partie publique de l'application Portrélia est déployée au moyen de services Vercel.",

          "L'application utilise également des services techniques de stockage et de traitement de données, notamment Supabase.",

          "L'infrastructure serveur de l'application et les fournisseurs intervenant dans le traitement des portraits doivent être identifiés dans la documentation technique du service.",

          "Les coordonnées réglementaires des hébergeurs concernés doivent être complétées à partir des informations contractuelles exactes.",
        ],
      },

      {
        title: "5. Propriété intellectuelle",
        paragraphs: [
          "Les éléments originaux du site Portrélia, notamment les textes, interfaces, logiciels, graphismes, logos et supports de présentation, sont susceptibles d'être protégés par les droits de propriété intellectuelle applicables.",

          "Toute reproduction ou exploitation non autorisée d'un élément protégé est interdite, sauf disposition légale contraire ou autorisation de son titulaire.",

          "Les marques et logos de sociétés tierces restent la propriété de leurs titulaires respectifs.",

          "La présence d'une marque ou d'un logo tiers sur le site ne saurait, à elle seule, être interprétée comme une déclaration de partenariat ou d'approbation.",
        ],
      },

      {
        title: "6. Utilisation du site",
        paragraphs: [
          "Les informations mises à disposition sur le site ont pour objectif de présenter les prestations proposées par Portrélia.",

          "L'accès aux fonctionnalités professionnelles peut être soumis à une inscription, à une invitation et à la validation d'un compte par l'équipe Portrélia.",

          "Les modalités détaillées d'utilisation figurent dans les conditions générales d'utilisation.",
        ],
      },

      {
        title: "7. Données personnelles",
        paragraphs: [
          "Les données personnelles traitées dans le cadre du service sont décrites dans la politique de confidentialité.",

          "Les informations relatives à l'utilisation des traceurs et aux choix des visiteurs sont disponibles dans la politique de cookies.",
        ],
      },

      {
        title: "8. Contact",
        paragraphs: [
          `Adresse de contact : ${COMPANY.address}.`,
          `Téléphone : ${COMPANY.phone}.`,

          "Une adresse électronique professionnelle officielle devra être ajoutée pour permettre une prise de contact directe avec l'exploitant.",
        ],
      },
    ],
  },

  /* =======================================================
     3. CONDITIONS GÉNÉRALES D'UTILISATION
     ======================================================= */

  "/cgu": {
    eyebrow: "UTILISATION DE LA PLATEFORME",
    title: "Conditions générales d'utilisation",

    intro:
      "Les présentes conditions décrivent les principales règles applicables à l'accès et à l'utilisation des services Portrélia par les entreprises et les collaborateurs invités.",

    sections: [
      {
        title: "1. Objet",
        paragraphs: [
          "Les présentes conditions générales d'utilisation encadrent l'utilisation de la plateforme Portrélia, un service destiné à faciliter la réalisation de portraits professionnels pour les équipes des entreprises clientes.",

          "La plateforme permet notamment de créer des campagnes, d'inviter des participants, de transmettre des photographies, de suivre l'avancement du traitement et de consulter les résultats.",
        ],
      },

      {
        title: "2. Public concerné",
        paragraphs: [
          "Portrélia s'adresse principalement aux entreprises et aux professionnels.",

          "Les entreprises peuvent demander l'ouverture d'un compte professionnel, sous réserve de validation par l'équipe Portrélia.",

          "Les collaborateurs accèdent aux fonctionnalités qui leur sont destinées dans le cadre d'une invitation à participer à une campagne.",

          "Les prestations peuvent être proposées à des entreprises établies dans différents pays de l'Union européenne, sous réserve des conditions contractuelles applicables.",
        ],
      },

      {
        title: "3. Création et activation d'un compte",
        paragraphs: [
          "La création d'un compte entreprise peut nécessiter la communication du nom de l'entreprise, des coordonnées professionnelles de son représentant et des autres informations nécessaires à la fourniture du service.",

          "L'activation du compte peut être soumise à un contrôle ou à une validation par l'équipe Portrélia.",

          "Les utilisateurs s'engagent à communiquer des informations exactes et à les mettre à jour lorsque cela est nécessaire.",

          "Les identifiants et moyens d'authentification doivent rester confidentiels. L'utilisateur doit signaler toute utilisation non autorisée de son compte.",
        ],
      },

      {
        title: "4. Gestion des campagnes",
        paragraphs: [
          "Les utilisateurs autorisés de l'entreprise peuvent créer et organiser des campagnes de portraits professionnels selon les fonctionnalités et les droits associés à leur formule.",

          "Une campagne peut comprendre un style visuel, des participants, des invitations et des informations de suivi.",

          "L'entreprise cliente est responsable de la pertinence des informations relatives à ses collaborateurs et du caractère légitime des invitations transmises.",

          "L'entreprise doit informer ses collaborateurs des finalités poursuivies et des utilisations envisagées de leurs portraits.",
        ],
      },

      {
        title: "5. Participation des collaborateurs",
        paragraphs: [
          "Les collaborateurs peuvent accéder à un parcours spécifique depuis leur invitation.",

          "Le parcours peut comprendre la consultation d'informations sur la prestation, un guide photographique, la transmission d'images et la consultation des portraits proposés.",

          "Les collaborateurs doivent utiliser des photographies sur lesquelles ils disposent des droits nécessaires et qui correspondent à leur propre identité.",

          "L'utilisation d'une photographie représentant une autre personne sans droit ou autorisation appropriée est interdite.",
        ],
      },

      {
        title: "6. Intelligence artificielle et contrôle humain",
        paragraphs: [
          "Portrélia peut recourir à des outils d'intelligence artificielle externes pour produire des portraits professionnels à partir des photographies transmises.",

          "La génération peut être accompagnée d'une sélection, d'un contrôle qualité et de retouches par l'équipe Portrélia.",

          "Les résultats peuvent présenter des différences visuelles, des imperfections ou des variations nécessitant une correction.",

          "Une vérification humaine peut notamment porter sur la ressemblance, les artefacts visuels, les couleurs et la cohérence avec le style sélectionné.",
        ],
      },

      {
        title: "7. Galeries et téléchargements",
        paragraphs: [
          "Les portraits produits peuvent être consultés au moyen de galeries accessibles aux utilisateurs autorisés.",

          "Selon les droits accordés, l'entreprise et les collaborateurs peuvent télécharger certains portraits.",

          "L'entreprise peut disposer de fonctionnalités de partage de galeries, notamment au moyen de liens prévus par l'application.",

          "Les destinataires des liens de partage doivent être choisis avec soin, car la diffusion d'un lien d'accès peut permettre la consultation des images dans les limites des fonctionnalités associées.",

          "L'accès aux galeries doit être limité aux personnes autorisées et aux finalités prévues par la campagne.",
        ],
      },

      {
        title: "8. Règles d'utilisation",
        paragraphs: [
          "Chaque utilisateur s'engage à employer la plateforme de manière loyale, licite et conforme à sa destination professionnelle.",
        ],

        bullets: [
          "Ne pas usurper l'identité d'un tiers.",
          "Ne pas transmettre de photographies obtenues illicitement.",
          "Ne pas publier ou partager des portraits sans autorisation appropriée.",
          "Ne pas contourner les mécanismes d'authentification ou de sécurité.",
          "Ne pas accéder aux campagnes d'une autre entreprise sans autorisation.",
          "Ne pas perturber volontairement le fonctionnement technique du service.",
          "Ne pas utiliser la plateforme pour produire des contenus frauduleux ou trompeurs.",
        ],
      },

      {
        title: "9. Propriété intellectuelle",
        paragraphs: [
          "Le site, sa présentation, ses composants logiciels et ses éléments graphiques sont protégés dans les conditions prévues par la réglementation applicable.",

          "Les utilisateurs conservent les droits qu'ils détiennent sur les photographies transmises.",

          "Les droits d'exploitation des portraits générés doivent être déterminés par les conditions commerciales applicables et les droits à l'image des personnes concernées.",

          "Aucune disposition des présentes conditions ne doit être interprétée comme autorisant l'exploitation de l'image d'une personne au-delà des usages légalement permis.",
        ],
      },

      {
        title: "10. Protection des données",
        paragraphs: [
          "Les traitements de données personnelles effectués dans le cadre de Portrélia sont présentés dans la politique de confidentialité.",

          "L'entreprise cliente peut être tenue d'informer ses collaborateurs et de définir les conditions de traitement de leurs photographies.",

          "Lorsque Portrélia intervient comme sous-traitant, les obligations des parties doivent être précisées dans un accord de traitement des données adapté.",
        ],
      },

      {
        title: "11. Disponibilité du service",
        paragraphs: [
          "Portrélia s'efforce d'assurer le fonctionnement de la plateforme et la disponibilité des fonctionnalités proposées.",

          "Des interruptions peuvent intervenir notamment pour des opérations de maintenance, des mises à jour ou en raison d'incidents techniques.",

          "Les éventuels engagements spécifiques de disponibilité et de support doivent être définis dans les documents contractuels applicables.",
        ],
      },

      {
        title: "12. Fermeture des comptes",
        paragraphs: [
          "L'utilisateur ou l'entreprise cliente peut solliciter une assistance concernant son compte et ses données.",

          "La fonctionnalité de suppression autonome des comptes et des portraits n'est pas encore déployée dans toutes les parties de l'application.",

          "L'absence d'un bouton de suppression ne fait pas disparaître les droits des personnes prévus par la réglementation sur la protection des données.",

          "La suppression ou la restitution des données doit être organisée conformément aux rôles des parties, aux obligations légales et aux conditions contractuelles applicables.",
        ],
      },

      {
        title: "13. Évolution des conditions",
        paragraphs: [
          "Les présentes conditions peuvent être modifiées pour tenir compte de l'évolution de la plateforme, de ses fonctionnalités ou du cadre réglementaire.",

          "Les modifications ayant une incidence sur les droits ou obligations contractuels des utilisateurs doivent être portées à leur connaissance dans des conditions adaptées.",
        ],
      },

      {
        title: "14. Droit applicable",
        paragraphs: [
          "Les présentes conditions sont destinées à être utilisées dans le cadre d'un service professionnel exploité en France.",

          "Leur application doit respecter les règles impératives qui pourraient s'appliquer aux entreprises et personnes concernées, y compris lorsque le service est proposé dans d'autres pays de l'Union européenne.",

          "Les modalités définitives de règlement des différends doivent être arrêtées dans les documents contractuels de Portrélia.",
        ],
      },
    ],
  },

  /* =======================================================
     4. CONDITIONS GÉNÉRALES DE VENTE
     ======================================================= */

  "/cgv": {
    eyebrow: "CONDITIONS COMMERCIALES",
    title: "Conditions générales de vente",

    intro:
      "Ces conditions présentent le cadre commercial applicable aux services et abonnements Portrélia proposés aux entreprises.",

    sections: [
      {
        title: "1. Présentation du prestataire",
        paragraphs: [
          "Portrélia est un service B2B de création et de gestion de portraits professionnels pour les entreprises.",

          `Exploitant communiqué : ${COMPANY.operatorName}.`,

          `Adresse de contact : ${COMPANY.address}.`,

          `Téléphone : ${COMPANY.phone}.`,

          "L'identité juridique complète de l'entreprise contractante doit être confirmée avant que les présentes conditions soient utilisées comme document contractuel définitif.",
        ],
      },

      {
        title: "2. Prestations proposées",
        paragraphs: [
          "Portrélia propose une plateforme permettant aux entreprises de préparer et suivre des campagnes de portraits professionnels.",

          "Le service comprend, selon la formule souscrite et les prestations convenues, la gestion des campagnes, les invitations, la transmission de photographies, le traitement des images, le contrôle qualité et la mise à disposition des résultats.",

          "Les conditions particulières, le nombre de personnes incluses et les éventuelles prestations complémentaires doivent être indiqués dans l'offre acceptée par l'entreprise.",
        ],
      },

      {
        title: "3. Formules et abonnements",
        paragraphs: [
          "Portrélia prévoit une formule Free et une formule Premium.",

          "Une tarification de 14,99 € a été communiquée pour l'offre payante, mais il reste à confirmer précisément si ce montant est hors taxes ou toutes taxes comprises, ainsi que le périmètre exact de l'abonnement.",

          "Les abonnements payants sont prévus sur une base mensuelle.",

          "Les prix, taxes, options, limitations et prestations incluses doivent être affichés clairement avant toute confirmation d'achat.",

          "La formule Free, lorsqu'elle est proposée, peut être soumise aux limitations fonctionnelles indiquées dans l'interface.",
        ],
      },

      {
        title: "4. Souscription",
        paragraphs: [
          "L'ouverture d'un compte professionnel et l'accès au service peuvent être soumis à la validation de l'équipe Portrélia.",

          "La souscription d'une formule payante est réalisée selon le parcours de commande proposé dans l'application.",

          "Avant le paiement, l'entreprise doit pouvoir consulter les caractéristiques de l'offre, le prix applicable, la périodicité et les conditions de renouvellement et de résiliation.",

          "La commande engage les parties dans les conditions précisées au moment de sa validation.",
        ],
      },

      {
        title: "5. Paiement et facturation",
        paragraphs: [
          "Les paiements en ligne et certaines fonctionnalités de facturation sont gérés au moyen des services Stripe.",

          "Le client doit communiquer les informations nécessaires à la facturation et s'assurer de leur exactitude.",

          "Les montants dus et la périodicité de facturation sont indiqués dans les informations présentées avant la souscription.",

          "Les factures sont mises à disposition selon les fonctionnalités prévues dans l'espace entreprise ou dans le parcours de paiement.",

          "Les règles applicables aux taxes et à la facturation doivent tenir compte de la localisation de l'entreprise cliente et des obligations fiscales correspondantes.",
        ],
      },

      {
        title: "6. Renouvellement automatique",
        paragraphs: [
          "Les abonnements payants Portrélia sont prévus avec un renouvellement automatique mensuel.",

          "Le client doit être informé de cette reconduction avant la souscription.",

          "Sauf résiliation effective dans les conditions applicables, le renouvellement entraîne la facturation d'une nouvelle période.",

          "Les conditions exactes de renouvellement, les éventuels délais de préavis et les modalités de notification doivent correspondre au fonctionnement réellement configuré dans Stripe et dans l'application.",
        ],
      },

      {
        title: "7. Résiliation",
        paragraphs: [
          "Le client peut demander la résiliation de son abonnement depuis les fonctionnalités mises à disposition dans son espace entreprise, lorsque celles-ci sont disponibles.",

          "Le fonctionnement annoncé prévoit que l'abonnement déjà payé reste actif jusqu'à la fin de la période de facturation en cours.",

          "La résiliation empêche les renouvellements ultérieurs une fois qu'elle est effectivement prise en compte, sous réserve des conditions présentées lors de la souscription.",

          "Une demande de résiliation ne constitue pas, à elle seule, un remboursement de la période déjà commencée.",

          "Cette règle doit rester compatible avec les dispositions légales impératives et les engagements contractuels applicables.",
        ],
      },

      {
        title: "8. Remboursements et contestations",
        paragraphs: [
          "Le fonctionnement commercial envisagé ne prévoit pas de remboursement automatique du prix de l'abonnement lorsque le client résilie en cours de période.",

          "L'abonnement reste normalement utilisable jusqu'à l'échéance de la période payée.",

          "Cette disposition ne supprime pas les droits légaux du client en cas de manquement contractuel, d'erreur de facturation ou dans les autres situations où un remboursement peut être exigé.",

          "Les demandes relatives à la qualité d'un portrait doivent être examinées selon les engagements de service et les éventuelles conditions de reprise convenues avec l'entreprise.",
        ],
      },

      {
        title: "9. Organisation et livraison des portraits",
        paragraphs: [
          "Les campagnes de portraits sont organisées selon les besoins et les choix de l'entreprise cliente.",

          "L'entreprise peut définir le calendrier de sa campagne et les dates attendues selon les possibilités offertes par le service.",

          "Le projet Portrélia poursuit un objectif opérationnel de traitement rapide, généralement envisagé autour de 48 à 72 heures après réception complète des éléments nécessaires.",

          "Ce délai constitue un objectif de service et non une garantie contractuelle générale tant que les conditions précises de déclenchement et d'exécution n'ont pas été arrêtées.",

          "Les dates et délais contractuellement garantis, lorsqu'ils existent, doivent figurer dans l'offre ou les conditions particulières validées par l'entreprise.",
        ],
      },

      {
        title: "10. Contrôle qualité et reprises",
        paragraphs: [
          "Les portraits réalisés peuvent faire l'objet d'une vérification humaine portant notamment sur la ressemblance, la cohérence visuelle et la présence de défauts techniques.",

          "Selon les caractéristiques de la prestation, une correction ou une nouvelle génération peut être envisagée lorsque le résultat n'est pas exploitable.",

          "Les modalités exactes de reprise, les éventuels plafonds et les délais correspondants doivent être précisés dans les conditions particulières de l'offre.",
        ],
      },

      {
        title: "11. Droits d'utilisation des portraits",
        paragraphs: [
          "Les portraits sont réalisés en vue d'utilisations professionnelles par l'entreprise cliente et les personnes concernées.",

          "Les usages envisagés peuvent notamment comprendre les profils professionnels, les sites internet, les communications d'entreprise et les supports internes.",

          "Les droits d'exploitation accordés sur les images doivent être définis dans l'offre contractuelle et respecter les droits à l'image des collaborateurs.",

          "L'entreprise cliente demeure responsable de disposer des autorisations nécessaires à la publication des portraits.",
        ],
      },

      {
        title: "12. Protection des données",
        paragraphs: [
          "Les traitements de données nécessaires à l'exécution du service sont présentés dans la politique de confidentialité.",

          "Lorsque Portrélia agit comme sous-traitant pour une entreprise cliente, les obligations des parties doivent être encadrées par des dispositions contractuelles conformes à l'article 28 du RGPD.",

          "Les conditions de conservation, de restitution et de suppression des photographies doivent être définies dans ce cadre.",
        ],
      },

      {
        title: "13. Responsabilité",
        paragraphs: [
          "Chaque partie est tenue de respecter les obligations qui lui incombent au titre de l'accord conclu.",

          "Portrélia ne peut exclure une responsabilité qui ne peut légalement faire l'objet d'une limitation.",

          "Les éventuelles limitations conventionnelles de responsabilité doivent être adaptées à la prestation réellement fournie et aux règles impératives applicables.",

          "La responsabilité de l'entreprise cliente concernant ses autorisations de publication et le choix des participants doit être précisée dans le contrat.",
        ],
      },

      {
        title: "14. Réclamations et différends",
        paragraphs: [
          "Les clients peuvent signaler une difficulté relative à la prestation, à un portrait, à un abonnement ou à une facture en utilisant les coordonnées de contact de l'exploitant.",

          `Téléphone communiqué : ${COMPANY.phone}.`,

          `Adresse de contact : ${COMPANY.address}.`,

          "Les modalités définitives de traitement des réclamations et de règlement des différends doivent être précisées avant la publication contractuelle des présentes CGV.",

          "Les règles impératives applicables aux contrats conclus avec des clients situés dans différents États de l'Union européenne restent applicables.",
        ],
      },
    ],
  },

  /* =======================================================
     5. POLITIQUE DE COOKIES
     ======================================================= */

  "/politique-cookies": {
    eyebrow: "VOS PRÉFÉRENCES",
    title: "Politique de cookies",

    intro:
      "Portrélia vous informe de l'utilisation des cookies et vous permet de choisir si vous souhaitez autoriser les mesures d'audience réalisées avec Google Analytics.",

    sections: [
      {
        title: "1. Qu'est-ce qu'un cookie ?",
        paragraphs: [
          "Un cookie est une information qui peut être enregistrée ou consultée sur votre appareil lorsque vous visitez un site internet.",

          "Certains cookies servent au fonctionnement d'un service, tandis que d'autres permettent de mesurer son audience ou de proposer des fonctionnalités supplémentaires.",
        ],
      },

      {
        title: "2. Cookies nécessaires au fonctionnement",
        paragraphs: [
          "La plateforme peut utiliser des mécanismes de stockage et des cookies techniques nécessaires à la connexion, à la sécurité et au fonctionnement des comptes.",

          "Ces éléments peuvent notamment participer à la gestion des sessions ou au maintien de certaines préférences de fonctionnement.",

          "Les cookies strictement nécessaires ne sont pas soumis aux mêmes règles de consentement que les cookies utilisés à des fins non essentielles.",

          "L'inventaire définitif de ces cookies, de leurs fournisseurs et de leurs durées de vie doit être établi à partir de l'application déployée.",
        ],
      },

      {
        title: "3. Google Analytics 4",
        paragraphs: [
          "Portrélia utilise Google Analytics 4, un service de mesure d'audience fourni par Google.",

          "Ce service permet notamment de mesurer le nombre de visites, les pages consultées et les interactions configurées sur le site.",

          `L'identifiant de mesure Analytics actuellement utilisé est ${COMPANY.analyticsId}.`,

          "La mesure d'audience est activée uniquement lorsque le visiteur accepte les cookies correspondants.",

          "Les informations transmises doivent être limitées aux données utiles à la mesure de fréquentation. Les identifiants privés, les informations personnelles et les liens sensibles ne doivent pas être envoyés à Google Analytics.",
        ],
      },

      {
        title: "4. Consentement aux cookies",
        paragraphs: [
          "Lors de sa première visite, l'utilisateur peut choisir d'accepter ou de refuser les cookies de mesure d'audience.",

          "Les deux choix doivent être accessibles de manière équivalente, sans rendre le refus plus difficile que l'acceptation.",

          "En l'absence d'acceptation, les balises de mesure d'audience soumises à consentement ne doivent pas être activées.",

          "Le refus des cookies Analytics ne doit pas empêcher l'accès aux fonctionnalités essentielles de Portrélia.",
        ],
      },

      {
        title: "5. Modification du choix",
        paragraphs: [
          "L'utilisateur peut modifier ses préférences après avoir accepté ou refusé les cookies.",

          "Un bouton de gestion des préférences est mis à disposition dans l'interface du site.",

          "Lorsque le consentement est retiré, les nouvelles opérations de mesure concernées doivent être interrompues.",

          "Le retrait du consentement ne supprime pas automatiquement l'ensemble des données qui auraient été collectées précédemment dans les conditions applicables.",
        ],
      },

      {
        title: "6. Enregistrement des préférences",
        paragraphs: [
          "Le choix d'accepter ou de refuser les cookies Analytics est enregistré localement par l'application afin d'éviter de demander une nouvelle décision à chaque changement de page.",

          "Le mécanisme actuel utilise notamment une information enregistrée sous la clé technique portrelia-analytics-consent dans le stockage local du navigateur.",

          "Cette information permet de déterminer si le script de mesure d'audience doit être chargé.",

          "La durée de mémorisation du choix doit être fixée et appliquée conformément aux recommandations applicables. La version technique actuelle nécessite encore une vérification sur ce point.",
        ],
      },

      {
        title: "7. Durées de conservation",
        paragraphs: [
          "Les cookies et les données associées ne doivent pas être conservés au-delà des durées applicables à leurs finalités.",

          "Les durées effectives des cookies Google Analytics, la durée de conservation des événements dans la propriété GA4 et la durée de conservation du choix de consentement doivent être confirmées dans la configuration technique.",
        ],
      },

      {
        title: "8. Autres outils publicitaires",
        paragraphs: [
          "À la date de rédaction, seul Google Analytics a été confirmé comme outil de mesure d'audience installé sur Portrélia.",

          "Google Tag Manager, Google Ads, les pixels publicitaires et les autres services de suivi marketing ne sont pas présentés comme actifs tant que leur installation n'a pas été confirmée.",

          "Si de nouveaux outils nécessitant un consentement sont ajoutés, l'information fournie aux utilisateurs et le dispositif de gestion des préférences devront être adaptés.",
        ],
      },

      {
        title: "9. Gestion des cookies par le navigateur",
        paragraphs: [
          "L'utilisateur peut également consulter ou supprimer certains cookies depuis les paramètres de son navigateur.",

          "Ces paramètres ne remplacent pas le dispositif de consentement proposé par Portrélia pour les traceurs concernés.",

          "La suppression des données du navigateur peut entraîner la réinitialisation des préférences enregistrées localement.",
        ],
      },

      {
        title: "10. Contact",
        paragraphs: [
          "Pour toute question relative aux cookies ou à la protection des données, vous pouvez contacter l'exploitant de Portrélia.",

          `Adresse communiquée : ${COMPANY.address}.`,

          `Téléphone : ${COMPANY.phone}.`,

          "Une adresse électronique spécifique doit encore être confirmée pour les demandes relatives à la confidentialité.",
        ],
      },
    ],
  },
};

/* =========================================================
   AFFICHAGE DES DOCUMENTS
   ========================================================= */

export default function LegalPage() {
  const location = useLocation();

  const legalDocument = documents[location.pathname];

  if (!legalDocument) {
    return (
      <div className="legal-page">
        <main className="legal-main">
          <div className="legal-container">
            <h1>Document introuvable</h1>

            <p>
              Le document demandé n'est pas disponible.
            </p>

            <Link to="/" className="legal-back">
              <FiArrowLeft />
              Retour à l'accueil
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="legal-page">
      {/* HEADER */}

      <header className="legal-header">
        <Link to="/" className="legal-logo">
          <img src={logo} alt="Logo Portrélia" />
          <span>Portrélia</span>
        </Link>

        <Link to="/" className="legal-back">
          <FiArrowLeft />
          <span>Retour à l'accueil</span>
        </Link>
      </header>

      {/* CONTENU */}

      <main className="legal-main">
        <div className="legal-container">
          <div className="legal-heading">
            <div className="legal-heading-icon">
              <FiShield />
            </div>

            <p className="legal-eyebrow">
              {legalDocument.eyebrow}
            </p>

            <h1>{legalDocument.title}</h1>

            <p className="legal-intro">
              {legalDocument.intro}
            </p>

            <p className="legal-updated">
              Version de travail — informations juridiques
              et techniques à finaliser avant publication
            </p>
          </div>

          <div className="legal-layout">
            {/* MENU LATÉRAL */}

            <aside className="legal-sidebar">
              <h2>Informations légales</h2>

              <nav aria-label="Documents juridiques">
                {LEGAL_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={
                      location.pathname === link.path
                        ? "legal-active"
                        : ""
                    }
                  >
                    <span>{link.title}</span>
                    <FiArrowRight />
                  </Link>
                ))}
              </nav>
            </aside>

            {/* ARTICLES */}

            <article className="legal-article">
              {legalDocument.sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>

                  {section.paragraphs?.map(
                    (paragraph, index) => (
                      <p key={`${section.title}-${index}`}>
                        {paragraph}
                      </p>
                    )
                  )}

                  {section.bullets && (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>

      {/* FOOTER */}

      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <span>
            © {new Date().getFullYear()} Portrélia
          </span>

          <nav aria-label="Informations légales">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
