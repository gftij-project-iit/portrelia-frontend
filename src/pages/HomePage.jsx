import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiAperture,
  FiArrowRight,
  FiArrowUp,
  FiArrowUpRight,
  FiCheck,
  FiClock,
  FiEdit3,
  FiLayers,
  FiMenu,
  FiPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";

import logo from "../assets/logo.png";
import portraitImage from "../assets/home-portrait.png";
import portraitImage2 from "../assets/home-portrait2.png";

import ofti from "../assets/brands/ofti.png";
import assermentis from "../assets/brands/assermentis.png";
import gftij from "../assets/brands/gftij.png";
import intertrad from "../assets/brands/intertrad.png";
import calamelle from "../assets/brands/calamelle.webp";

import "./HomePage.css";
import ThemeSwitcher from "../theme/ThemeSwitcher";

/* =========================================================
   DATA
   ========================================================= */

const CURRENT_YEAR = new Date().getFullYear();

/* Texte qui s'écrit dans "Le rendu Portrélia" (\n = retour à la ligne) */
const TYPED_TEXT = "Des équipes\nqui inspirent\nconfiance.";

const NAV_ITEMS = [
  { label: "Solutions", href: "#solutions" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "Ressources", href: "#ressources" },
  { label: "FAQ", href: "#faq" },
  { label: "À propos", href: "#apropos" },
  { label: "Contact", href: "/contact" },
];

const NAV_COUNT = NAV_ITEMS.length;

const LEGAL_ITEMS = [
  { label: "Politique de confidentialité", to: "/politique-confidentialite" },
  { label: "Mentions légales", to: "/mentions-legales" },
  { label: "Conditions générales d'utilisation", to: "/cgu" },
  { label: "Conditions générales de vente", to: "/cgv" },
  { label: "Politique de cookies", to: "/politique-cookies" },
];

const PARTNER_LOGOS = [
  { name: "OFTI", image: ofti, url: "https://ofti.fr/", className: "trust-logo-ofti" },
  { name: "Assermentis", image: assermentis, url: "https://www.assermentis.com/", className: "trust-logo-assermentis" },
  { name: "GFTIJ", image: gftij, url: "https://www.gftij.fr/", className: "trust-logo-gftij" },
  { name: "InterTrad", image: intertrad, url: "https://intertrad.fr/", className: "trust-logo-intertrad" },
  { name: "Calamelle", image: calamelle, url: "https://calamelle.fr/", className: "trust-logo-calamelle" },
];

/* 4 copies pour une boucle sans trou, même sur très grand écran */
const TRUST_COPIES = [0, 1, 2, 3];

const HERO_LINES = [
  "Des portraits professionnels",
  "qui renforcent votre marque",
  "employeur",
];

const BENEFITS = [
  "Expérience guidée pour vos collaborateurs",
  "Direction artistique et retouche humaine",
  "Résultats cohérents et fidèles",
  "Livraison rapide en 48 à 72 h",
];

const MARQUEE_ITEMS = [
  "Portraits homogènes",
  "Retouche humaine",
  "Livraison en 48 à 72 h",
  "Direction artistique",
  "Parcours guidé",
  "100 % à distance",
  "Données respectées",
];

const STATS = [
  { value: 3, label: "étapes pour lancer une campagne de portraits" },
  { prefix: "48–", value: 72, suffix: " h", label: "pour recevoir les portraits de vos équipes" },
  { value: 100, suffix: " %", label: "à distance, où que soient vos collaborateurs" },
];

const STEPS = [
  {
    number: "01",
    title: "Créer une campagne",
    text: "Organisez vos besoins en portraits depuis un espace dédié à votre entreprise.",
  },
  {
    number: "02",
    title: "Inviter les collaborateurs",
    text: "Chaque participant suit un parcours guidé pour transmettre sa photographie.",
  },
  {
    number: "03",
    title: "Retrouver les portraits",
    text: "Consultez les galeries produites et suivez l'avancement de votre campagne.",
  },
];

const SHOWCASE_POINTS = [
  "Un cadre visuel commun pour toute l'équipe",
  "Des portraits homogènes, réalistes et de haute qualité",
  "Une retouche humaine, fidèle à chaque collaborateur",
  "Des galeries centralisées dans votre espace entreprise",
];

const FEATURES = [
  {
    title: "Parcours guidé",
    text: "Chaque collaborateur est accompagné pas à pas pour transmettre sa photographie.",
  },
  {
    title: "Direction artistique",
    text: "Un cadre visuel commun, cohérent avec votre image de marque employeur.",
  },
  {
    title: "Retouche humaine",
    text: "Une retouche réalisée avec soin pour un résultat réaliste et fidèle.",
  },
  {
    title: "Résultats homogènes",
    text: "Des portraits harmonisés, quel que soit l'endroit où se trouvent vos équipes.",
  },
  {
    title: "Livraison en 48 à 72 h",
    text: "Vos galeries sont disponibles rapidement dans votre espace entreprise.",
  },
  {
    title: "Données respectées",
    text: "Une solution sécurisée, pensée pour le respect des données personnelles.",
  },
];

const RESOURCES = [
  {
    title: "Protection des données",
    text: "Comprenez comment les informations et les photographies sont traitées.",
    to: "/politique-confidentialite",
    cta: "Consulter la politique",
  },
  {
    title: "Utilisation de la plateforme",
    text: "Retrouvez les principales conditions d'utilisation de Portrélia.",
    to: "/cgu",
    cta: "Consulter les CGU",
  },
  {
    title: "Cookies et confidentialité",
    text: "Découvrez les outils de mesure d'audience et les choix disponibles.",
    to: "/politique-cookies",
    cta: "En savoir plus",
  },
];

const FAQ_ITEMS = [
  {
    question: "Combien de temps faut-il pour recevoir les portraits ?",
    answer:
      "Les portraits sont livrés en 48 à 72 h, directement dans votre espace entreprise.",
  },
  {
    question: "Les collaborateurs doivent-ils se déplacer ?",
    answer:
      "Non. Chaque participant suit un parcours guidé à distance pour transmettre sa photographie, où qu'il se trouve.",
  },
  {
    question: "Les portraits sont-ils retouchés ?",
    answer:
      "Oui. Chaque campagne bénéficie d'une direction artistique et d'une retouche humaine pour des résultats cohérents et fidèles.",
  },
  {
    question: "Comment les données sont-elles protégées ?",
    answer:
      "Portrélia est pensée pour le respect des données personnelles. Le détail des traitements figure dans notre politique de confidentialité.",
  },
  {
    question: "Comment sont établis les tarifs ?",
    answer:
      "Les offres s'adaptent à votre projet et au nombre de collaborateurs. Demandez une démo pour en parler avec nous.",
  },
];

const SECTION_IDS = [
  "accueil",
  "solutions",
  "rendu",
  "avantages",
  "tarifs",
  "ressources",
  "faq",
  "apropos",
];

const NAV_GROUPS = {
  rendu: "solutions",
  avantages: "solutions",
};

const isRoute = (href) => href.startsWith("/");

const formatIndex = (index) => String(index + 1).padStart(2, "0");

/* =========================================================
   ANIMATION VARIANTS
   ========================================================= */

const EASE = [0.22, 1, 0.36, 1];
const VIEWPORT = { once: true, amount: 0.2 };

const stagger = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE } },
};

const lineReveal = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.9, ease: EASE } },
};

const popIn = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 18 },
  },
};

const accentBar = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.9, ease: EASE, delay: 0.2 } },
};

const stepsLine = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1.4, ease: EASE } },
};

const HOVER_SPRING = { type: "spring", stiffness: 320, damping: 22 };

/* =========================================================
   SOUS-COMPOSANTS
   ========================================================= */

/* Texte qui s'écrit lettre par lettre (démarre quand start = true) */
function Typewriter({ text, delay = 0, speed = 0.06, start = true }) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const typed = useTransform(count, (latest) =>
    text.slice(0, Math.round(latest))
  );

  useEffect(() => {
    if (!start) return undefined;

    if (reduceMotion) {
      count.set(text.length);
      return undefined;
    }

    count.set(0);

    const controls = animate(count, text.length, {
      duration: text.length * speed,
      delay,
      ease: "linear",
    });

    return () => controls.stop();
  }, [start, text, delay, speed, reduceMotion, count]);

  return (
    <p className="home-typed">
      <span className="home-sr-only">{text}</span>

      <span className="home-typed-ghost" aria-hidden="true">
        {text}
      </span>

      <span className="home-typed-live" aria-hidden="true">
        <motion.span>{typed}</motion.span>
        <span className="home-typed-cursor" />
      </span>
    </p>
  );
}

/* Chiffre qui compte jusqu'à sa valeur */
function Counter({ value, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();

  const count = useMotionValue(0);
  const text = useTransform(
    count,
    (latest) => `${prefix}${Math.round(latest)}${suffix}`
  );

  useEffect(() => {
    if (!inView) return undefined;

    if (reduceMotion) {
      count.set(value);
      return undefined;
    }

    const controls = animate(count, value, {
      duration: 1.8,
      ease: EASE,
    });

    return () => controls.stop();
  }, [inView, value, reduceMotion, count]);

  return (
    <motion.span ref={ref} className="home-stat-value">
      {text}
    </motion.span>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 12
  );
  const [showTop, setShowTop] = useState(
    () => typeof window !== "undefined" && window.scrollY > 720
  );
  const [activeSection, setActiveSection] = useState("accueil");
  const [openFaq, setOpenFaq] = useState(0);

  const reduceMotion = useReducedMotion();
  const heroRef = useRef(null);
  const featureRef = useRef(null);
  const featureInView = useInView(featureRef, { once: true, amount: 0.35 });

  /* Barre de progression de lecture */
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  /* Hero : scène qui remonte au scroll */
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const stageY = useTransform(heroProgress, [0, 1], [0, reduceMotion ? 0 : -70]);

  /* Hero : 3D + parallax à la souris */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 70, damping: 18 });
  const smoothY = useSpring(pointerY, { stiffness: 70, damping: 18 });

  const stageRotateX = useTransform(smoothY, [-0.5, 0.5], [7, -7]);
  const stageRotateY = useTransform(smoothX, [-0.5, 0.5], [-9, 9]);
  const card1X = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const card1Y = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);
  const card2X = useTransform(smoothX, [-0.5, 0.5], [22, -22]);
  const card2Y = useTransform(smoothY, [-0.5, 0.5], [14, -14]);
  const chipX = useTransform(smoothX, [-0.5, 0.5], [-30, 30]);
  const chipY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);
  const pillX = useTransform(smoothX, [-0.5, 0.5], [26, -26]);
  const pillY = useTransform(smoothY, [-0.5, 0.5], [18, -18]);

  /* "Le rendu Portrélia" : parallax de la grande photo */
  const { scrollYProgress: featureProgress } = useScroll({
    target: featureRef,
    offset: ["start end", "end start"],
  });
  const featureY = useTransform(
    featureProgress,
    [0, 1],
    [reduceMotion ? 0 : -40, reduceMotion ? 0 : 40]
  );

  /* Échap ferme le menu */
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  /* Bloque le scroll quand le menu mobile est ouvert */
  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  /* Ferme le menu mobile si on repasse en desktop */
  useEffect(() => {
    const media = window.matchMedia("(min-width: 992px)");

    const onChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };

    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  /* Navbar au scroll + bouton retour en haut */
  useEffect(() => {
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setShowTop(y > 720);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Section active dans la navigation */
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveSection(NAV_GROUPS[id] ?? id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const scrollToSection = useCallback(
    (event, href) => {
      if (!href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      document.body.style.overflow = "";
      setMenuOpen(false);

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      window.history.replaceState(null, "", href);
    },
    [reduceMotion]
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const handleHeroPointer = (event) => {
    if (reduceMotion || event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetHeroPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  /* Effet "spotlight" qui suit la souris sur les cartes */
  const handleSpotlight = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="home-page">

        {/* PROGRESSION DE LECTURE */}
        <motion.div
          className="home-scroll-progress"
          style={{ scaleX: progressX }}
          aria-hidden="true"
        />

        {/* NAVBAR */}
        <motion.header
          className={`home-navbar${scrolled ? " is-scrolled" : ""}`}
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Link to="/" className="home-brand" onClick={closeMenu}>
            <img src={logo} alt="Portrélia" className="home-brand-logo" />
            <span className="home-brand-name">Portrélia</span>
          </Link>

          <nav className="home-nav-links" aria-label="Navigation principale">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === `#${activeSection}`;

              const content = (
                <>
                  <span>{item.label}</span>

                  {isActive && (
                    <motion.span
                      layoutId="home-nav-indicator"
                      className="home-nav-indicator"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </>
              );

              return isRoute(item.href) ? (
                <Link to={item.href} key={item.href} className="home-nav-link">
                  {content}
                </Link>
              ) : (
                <a
                  href={item.href}
                  key={item.href}
                  className={`home-nav-link${isActive ? " is-active" : ""}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => scrollToSection(event, item.href)}
                >
                  {content}
                </a>
              );
            })}
          </nav>

          <div className="home-nav-actions">
            <ThemeSwitcher />
            <Link to="/connexion" className="home-login-btn">
              Se connecter
            </Link>

            <Link to="/demande-demo" className="home-demo-btn">
              Demander une démo
            </Link>
          </div>

          <motion.button
            type="button"
            className="home-mobile-toggle"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            aria-controls="home-mobile-menu"
            whileTap={{ scale: 0.92 }}
            onClick={() => setMenuOpen((previous) => !previous)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? "close" : "open"}
                className="home-mobile-toggle-icon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {menuOpen ? <FiX /> : <FiMenu />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.header>

        {/* MENU MOBILE */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.button
                key="backdrop"
                type="button"
                className="home-mobile-backdrop"
                aria-label="Fermer le menu"
                onClick={closeMenu}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />

              <motion.nav
                key="menu"
                id="home-mobile-menu"
                className="home-mobile-menu"
                aria-label="Navigation mobile"
                initial={{ opacity: 0, y: -14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <p className="home-mobile-menu-label" style={{ "--i": 0 }}>
                  Découvrir Portrélia
                </p>

                {NAV_ITEMS.map((item, index) =>
                  isRoute(item.href) ? (
                    <Link
                      to={item.href}
                      key={item.href}
                      onClick={closeMenu}
                      style={{ "--i": index + 1 }}
                    >
                      <span>{item.label}</span>
                      <FiArrowRight />
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      key={item.href}
                      onClick={(event) => scrollToSection(event, item.href)}
                      style={{ "--i": index + 1 }}
                    >
                      <span>{item.label}</span>
                      <FiArrowRight />
                    </a>
                  )
                )}

                <div
                  className="home-mobile-menu-divider"
                  style={{ "--i": NAV_COUNT + 1 }}
                />

                <div
                  className="home-mobile-theme"
                  style={{ "--i": NAV_COUNT + 1 }}
                >
                  <ThemeSwitcher variant="menu" />
                </div>

                <div
                  className="home-mobile-menu-divider"
                  style={{ "--i": NAV_COUNT + 1 }}
                />

                <Link
                  to="/connexion"
                  className="home-mobile-login"
                  onClick={closeMenu}
                  style={{ "--i": NAV_COUNT + 2 }}
                >
                  Se connecter
                </Link>

                <Link
                  to="/demande-demo"
                  className="home-mobile-demo"
                  onClick={closeMenu}
                  style={{ "--i": NAV_COUNT + 3 }}
                >
                  Demander une démo
                </Link>

                <div
                  className="home-mobile-menu-divider"
                  style={{ "--i": NAV_COUNT + 4 }}
                />

                <p
                  className="home-mobile-menu-label"
                  style={{ "--i": NAV_COUNT + 5 }}
                >
                  Informations légales
                </p>

                {LEGAL_ITEMS.map((item, index) => (
                  <Link
                    to={item.to}
                    key={item.to}
                    className="home-mobile-legal-link"
                    onClick={closeMenu}
                    style={{ "--i": NAV_COUNT + 6 + index }}
                  >
                    {item.label}
                  </Link>
                ))}
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main>

          {/* ================= HERO ================= */}
          <section id="accueil" className="home-main-section" ref={heroRef}>
            <div className="home-hero-card">
              <div
                className="home-hero-content"
                onPointerMove={handleHeroPointer}
                onPointerLeave={resetHeroPointer}
              >

                {/* HERO GAUCHE */}
                <div className="home-hero-left">
                  <motion.div
                    className="home-hero-copy"
                    variants={stagger(0.1, 0.25)}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.h1 variants={stagger(0.12)}>
                      {HERO_LINES.map((line) => (
                        <span className="home-hero-line" key={line}>
                          <motion.span className="home-hero-line-inner" variants={lineReveal}>
                            {line}
                          </motion.span>
                        </span>
                      ))}
                    </motion.h1>

                    <motion.p className="home-hero-description" variants={fadeUp}>
                      Une solution simple et sécurisée pour des portraits
                      homogènes, réalistes et de haute qualité, où que soient
                      vos équipes.
                    </motion.p>

                    <motion.ul className="home-benefits" variants={stagger(0.09)}>
                      {BENEFITS.map((benefit) => (
                        <motion.li key={benefit} variants={fadeLeft}>
                          <motion.span className="benefit-check" variants={popIn}>
                            ✓
                          </motion.span>
                          <span>{benefit}</span>
                        </motion.li>
                      ))}
                    </motion.ul>

                    <motion.div className="home-hero-actions" variants={fadeUp}>
                      <Link to="/demande-demo" className="home-primary-cta">
                        Demander une démo
                      </Link>

                      <button
                        type="button"
                        className="home-video-btn"
                        onClick={(event) => scrollToSection(event, "#solutions")}
                      >
                        <span className="video-play">▶</span>
                        <span>Découvrir la solution</span>
                      </button>
                    </motion.div>

                    <motion.div className="home-hero-proof" variants={fadeUp}>
                      <div className="home-hero-proof-avatars" aria-hidden="true">
                        <img src={portraitImage} alt="" />
                        <img src={portraitImage2} alt="" />
                        <span className="home-hero-proof-more">
                          <FiUsers />
                        </span>
                      </div>

                      <p>
                        <strong>Un rendu cohérent</strong> pour toute votre équipe
                      </p>
                    </motion.div>
                  </motion.div>
                </div>

                {/* HERO DROITE : SCÈNE 3D AVEC LES 2 PORTRAITS */}
                <div className="home-hero-right">
                  <motion.div
                    className="home-stage"
                    style={{ y: stageY, rotateX: stageRotateX, rotateY: stageRotateY }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 1.1, ease: EASE }}
                  >
                    <div className="home-stage-glow" aria-hidden="true" />

                    <div className="home-stage-ring" aria-hidden="true">
                      <span className="home-stage-orbit-dot" />
                      <span className="home-stage-orbit-dot home-stage-orbit-dot-2" />
                    </div>

                    <div
                      className="home-stage-ring home-stage-ring-inner"
                      aria-hidden="true"
                    />

                    {/* Carte 1 : femme */}
                    <motion.div
                      className="home-stage-card home-stage-card-1"
                      style={{ x: card1X, y: card1Y }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 90, rotate: -16 }}
                        animate={{ opacity: 1, y: 0, rotate: -6 }}
                        transition={{ delay: 0.55, duration: 1.2, ease: EASE }}
                      >
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <motion.div
                            className="home-stage-card-border"
                            whileHover={{ scale: 1.04, rotate: 5 }}
                            transition={HOVER_SPRING}
                          >
                            <div className="home-stage-card-inner">
                              <div className="home-stage-img-wrap">
                                <img
                                  src={portraitImage}
                                  alt="Portrait professionnel réalisé avec Portrélia"
                                  className="home-stage-img home-stage-img-1"
                                  decoding="async"
                                />
                              </div>

                              <span className="home-stage-caption">
                                <FiEdit3 />
                                Retouche humaine
                              </span>
                            </div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    {/* Carte 2 : homme */}
                    <motion.div
                      className="home-stage-card home-stage-card-2"
                      style={{ x: card2X, y: card2Y }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 110, rotate: 16 }}
                        animate={{ opacity: 1, y: 0, rotate: 6 }}
                        transition={{ delay: 0.75, duration: 1.2, ease: EASE }}
                      >
                        <motion.div
                          animate={{ y: [0, 10, 0] }}
                          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <motion.div
                            className="home-stage-card-border"
                            whileHover={{ scale: 1.04, rotate: -5 }}
                            transition={HOVER_SPRING}
                          >
                            <div className="home-stage-card-inner">
                              <div className="home-stage-img-wrap">
                                <img
                                  src={portraitImage2}
                                  alt="Second portrait professionnel réalisé avec Portrélia"
                                  className="home-stage-img home-stage-img-2"
                                  decoding="async"
                                />
                              </div>

                              <span className="home-stage-caption">
                                <FiLayers />
                                Rendu homogène
                              </span>
                            </div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    {/* Badge "Livré en 48 à 72 h" */}
                    <motion.div
                      className="home-stage-chip"
                      style={{ x: chipX, y: chipY }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: -16, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 1.25, duration: 0.6, ease: EASE }}
                      >
                        <motion.span
                          className="home-stage-chip-inner"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <FiClock />
                          Livré en 48 à 72 h
                        </motion.span>
                      </motion.div>
                    </motion.div>

                    {/* Badge "Direction artistique" */}
                    <motion.div
                      className="home-stage-pill"
                      style={{ x: pillX, y: pillY }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 1.45, duration: 0.6, ease: EASE }}
                      >
                        <motion.span
                          className="home-stage-pill-inner"
                          animate={{ y: [0, 6, 0] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <span className="home-stage-pill-icon">
                            <FiAperture />
                          </span>
                          Direction artistique
                        </motion.span>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* LOGOS PARTENAIRES QUI DÉFILENT */}
                <motion.div
                  className="home-trust-bar"
                  variants={stagger(0.1, 0.2)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <motion.p className="home-trust-title" variants={fadeUp}>
                    Ils nous font confiance
                  </motion.p>

                  <motion.div className="home-trust-marquee" variants={fadeUp}>
                    <div className="home-trust-track">
                      {TRUST_COPIES.map((copy) => (
                        <div
                          className="home-trust-group"
                          key={copy}
                          aria-hidden={copy > 0 ? "true" : undefined}
                        >
                          {PARTNER_LOGOS.map((partner) => (
                            <a
                              key={`${copy}-${partner.name}`}
                              href={partner.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              tabIndex={copy > 0 ? -1 : undefined}
                              className="trust-logo-item"
                              aria-label={`Visiter le site de ${partner.name}`}
                              title={`Visiter ${partner.name}`}
                            >
                              <img
                                src={partner.image}
                                alt={partner.name}
                                className={`trust-logo ${partner.className}`}
                                loading="lazy"
                                decoding="async"
                              />
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>

              </div>
            </div>
          </section>

          {/* ================= BANDEAU DÉFILANT ================= */}
          <section className="home-marquee" aria-label="Points forts de Portrélia">
            <div className="home-marquee-track">
              {[0, 1].map((copy) => (
                <div
                  className="home-marquee-group"
                  key={copy}
                  aria-hidden={copy === 1 ? "true" : undefined}
                >
                  {MARQUEE_ITEMS.map((item) => (
                    <span className="home-marquee-item" key={`${copy}-${item}`}>
                      <span className="home-marquee-star" aria-hidden="true">
                        ✦
                      </span>
                      {item}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* ================= CHIFFRES ================= */}
          <section className="home-stats">
            <motion.div
              className="home-stats-grid"
              variants={stagger(0.12)}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
            >
              {STATS.map((stat) => (
                <motion.div
                  className="home-stat"
                  key={stat.label}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={HOVER_SPRING}
                >
                  <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  <span className="home-stat-label">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ================= SOLUTIONS ================= */}
          <section id="solutions" className="home-info-section">
            <div className="home-info-container">
              <motion.div
                variants={stagger(0.12)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
              >
                <motion.p className="home-eyebrow" variants={fadeUp}>
                  NOTRE SOLUTION
                </motion.p>

                <motion.h2 variants={fadeUp}>
                  Un parcours simple pour vos équipes
                </motion.h2>

                <motion.p className="home-info-intro" variants={fadeUp}>
                  Centralisez vos campagnes de portraits professionnels,
                  accompagnez vos collaborateurs et retrouvez les résultats
                  dans votre espace entreprise.
                </motion.p>
              </motion.div>

              <motion.div
                className="home-info-grid home-steps-grid"
                variants={stagger(0.16)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
              >
                <motion.span
                  className="home-steps-line"
                  aria-hidden="true"
                  variants={stepsLine}
                />

                {STEPS.map((step) => (
                  <motion.article
                    key={step.number}
                    className="home-info-card"
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    transition={HOVER_SPRING}
                    onMouseMove={handleSpotlight}
                  >
                    <motion.span
                      className="home-info-card-accent"
                      variants={accentBar}
                      aria-hidden="true"
                    />

                    <motion.span className="home-step" variants={popIn}>
                      {step.number}
                    </motion.span>

                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ================= LE RENDU PORTRÉLIA (PHOTO SEULE) ================= */}
          <section id="rendu" className="home-info-section home-showcase">
            <div className="home-info-container">
              <motion.div
                className="home-centered-section"
                variants={stagger(0.12)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
              >
                <motion.p className="home-eyebrow" variants={fadeUp}>
                  LE RENDU PORTRÉLIA
                </motion.p>

                <motion.h2 variants={fadeUp}>
                  Un rendu homogène pour toute l'équipe
                </motion.h2>

                <motion.p className="home-info-intro" variants={fadeUp}>
                  Que vos collaborateurs soient au bureau ou à distance, chaque
                  portrait s'inscrit dans la même direction artistique.
                </motion.p>
              </motion.div>

              <motion.div
                ref={featureRef}
                className="home-feature-frame"
                initial={
                  reduceMotion
                    ? false
                    : { clipPath: "inset(8% 5% 8% 5% round 32px)" }
                }
                whileInView={{ clipPath: "inset(0% 0% 0% 0% round 32px)" }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 1.3, ease: EASE }}
              >
                <div className="home-feature-media-wrap">
                  <motion.div className="home-feature-media" style={{ y: featureY }}>
                    <motion.img
                      src={portraitImage}
                      alt="Portrait professionnel réalisé avec Portrélia"
                      loading="lazy"
                      decoding="async"
                      initial={{ scale: 1.22 }}
                      whileInView={{ scale: 1.02 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 1.8, ease: EASE }}
                    />
                  </motion.div>
                </div>

                <motion.div
                  className="home-feature-overlay"
                  variants={stagger(0.12, 0.4)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                >
                  <motion.div variants={fadeUp}>
                    <Typewriter
                      text={TYPED_TEXT}
                      delay={0.6}
                      speed={0.06}
                      start={featureInView}
                    />
                  </motion.div>

                  <motion.ul className="home-check-list" variants={stagger(0.08)}>
                    {SHOWCASE_POINTS.map((point) => (
                      <motion.li key={point} variants={fadeLeft}>
                        <span className="home-check-icon">
                          <FiCheck />
                        </span>
                        <span>{point}</span>
                      </motion.li>
                    ))}
                  </motion.ul>

                  <motion.div variants={fadeUp}>
                    <Link to="/demande-demo" className="home-section-button">
                      Voir une démonstration
                      <FiArrowRight />
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* ================= AVANTAGES : LISTE CLASSIQUE ================= */}
          <section id="avantages" className="home-info-section home-info-soft">
            <div className="home-info-container">
              <motion.div
                className="home-split-head"
                variants={stagger(0.12)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
              >
                <div>
                  <motion.p className="home-eyebrow" variants={fadeUp}>
                    POURQUOI PORTRÉLIA
                  </motion.p>

                  <motion.h2 variants={fadeUp}>
                    Tout ce qu'il faut pour des portraits réussis
                  </motion.h2>
                </div>

                <motion.p className="home-info-intro" variants={fadeUp}>
                  Une expérience pensée pour les entreprises, de l'invitation
                  des collaborateurs jusqu'à la livraison des galeries.
                </motion.p>
              </motion.div>

              <motion.ol
                className="home-points"
                variants={stagger(0.08)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
              >
                {FEATURES.map((feature, index) => (
                  <motion.li
                    key={feature.title}
                    className="home-point"
                    variants={fadeUp}
                  >
                    <span className="home-point-number">{formatIndex(index)}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </motion.li>
                ))}
              </motion.ol>
            </div>
          </section>

          {/* ================= TARIFS ================= */}
          <section id="tarifs" className="home-info-section home-pricing-section">
            <div className="home-glow" aria-hidden="true">
              <span />
              <span />
            </div>

            <motion.div
              className="home-info-container home-centered-section"
              variants={stagger(0.12)}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
            >
              <motion.p className="home-eyebrow" variants={fadeUp}>
                OFFRES ENTREPRISES
              </motion.p>

              <motion.h2 variants={fadeUp}>
                Une solution adaptée à vos besoins
              </motion.h2>

              <motion.p className="home-info-intro" variants={fadeUp}>
                Échangeons sur votre projet, le nombre de collaborateurs et
                les modalités de réalisation de vos portraits.
              </motion.p>

              <motion.div variants={fadeUp}>
                <Link to="/demande-demo" className="home-section-button">
                  Découvrir nos offres
                  <FiArrowRight />
                </Link>
              </motion.div>
            </motion.div>
          </section>

          {/* ================= RESSOURCES : LISTE DE LIENS ================= */}
          <section id="ressources" className="home-info-section home-info-soft">
            <div className="home-info-container">
              <motion.div
                variants={stagger(0.12)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
              >
                <motion.p className="home-eyebrow" variants={fadeUp}>
                  RESSOURCES
                </motion.p>

                <motion.h2 variants={fadeUp}>
                  Des informations claires, à chaque étape
                </motion.h2>
              </motion.div>

              <motion.ul
                className="home-resource-list"
                variants={stagger(0.1)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
              >
                {RESOURCES.map((resource) => (
                  <motion.li key={resource.title} variants={fadeUp}>
                    <Link to={resource.to} className="home-resource-row">
                      <strong className="home-resource-title">
                        {resource.title}
                      </strong>

                      <span className="home-resource-text">{resource.text}</span>

                      <span className="home-resource-cta">
                        {resource.cta}
                        <FiArrowUpRight aria-hidden="true" />
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </section>

          {/* ================= FAQ ================= */}
          <section id="faq" className="home-info-section">
            <div className="home-info-container home-faq-layout">
              <motion.div
                className="home-faq-intro"
                variants={stagger(0.12)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
              >
                <motion.p className="home-eyebrow" variants={fadeLeft}>
                  QUESTIONS FRÉQUENTES
                </motion.p>

                <motion.h2 variants={fadeLeft}>
                  Vous avez des questions ?
                </motion.h2>

                <motion.p className="home-info-intro" variants={fadeLeft}>
                  Les réponses essentielles pour lancer votre première
                  campagne de portraits.
                </motion.p>

                <motion.div variants={fadeLeft}>
                  <Link to="/contact" className="home-section-button">
                    Poser une question
                    <FiArrowRight />
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                className="home-faq-list"
                variants={stagger(0.08)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
              >
                {FAQ_ITEMS.map((item, index) => {
                  const isOpen = openFaq === index;

                  return (
                    <motion.div
                      key={item.question}
                      className={`home-faq-item${isOpen ? " is-open" : ""}`}
                      variants={fadeRight}
                    >
                      <button
                        type="button"
                        id={`home-faq-button-${index}`}
                        className="home-faq-question"
                        aria-expanded={isOpen}
                        aria-controls={`home-faq-panel-${index}`}
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      >
                        <span>{item.question}</span>

                        <motion.span
                          className="home-faq-icon"
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          aria-hidden="true"
                        >
                          <FiPlus />
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`home-faq-panel-${index}`}
                            role="region"
                            aria-labelledby={`home-faq-button-${index}`}
                            className="home-faq-answer"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                          >
                            <p>{item.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>

          {/* ================= À PROPOS ================= */}
          <section id="apropos" className="home-info-section home-info-soft">
            <div className="home-info-container home-about-layout">
              <motion.div
                variants={stagger(0.12)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
              >
                <motion.p className="home-eyebrow" variants={fadeLeft}>
                  À PROPOS DE PORTRÉLIA
                </motion.p>

                <motion.h2 variants={fadeLeft}>
                  Des portraits cohérents pour votre image de marque
                </motion.h2>
              </motion.div>

              <motion.div
                className="home-about-copy"
                variants={stagger(0.14, 0.1)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
              >
                <motion.p variants={fadeRight}>
                  Portrélia accompagne les entreprises dans la création et
                  l'organisation de leurs portraits professionnels, avec une
                  expérience à distance pensée pour les équipes.
                </motion.p>

                <motion.p variants={fadeRight}>
                  Notre objectif est de simplifier la production de portraits
                  homogènes, tout en accordant une place essentielle à la
                  qualité du résultat et au respect des données personnelles.
                </motion.p>

                <motion.div variants={fadeRight}>
                  <Link to="/demande-demo" className="home-section-button">
                    Parlons de votre projet
                    <FiArrowRight />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* ================= CTA FINAL ================= */}
          <section className="home-final-cta">
            <div className="home-final-cta-glow" aria-hidden="true" />

            <motion.div
              className="home-final-cta-inner"
              variants={stagger(0.12)}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
            >
              <motion.div className="home-final-avatars" variants={fadeUp} aria-hidden="true">
                <img src={portraitImage} alt="" />
                <img src={portraitImage2} alt="" />
                <span className="home-final-avatar-plus">
                  <FiUsers />
                </span>
              </motion.div>

              <motion.h2 variants={fadeUp}>
                Prêt à harmoniser les portraits de vos équipes ?
              </motion.h2>

              <motion.p variants={fadeUp}>
                Parlons de votre projet et du nombre de collaborateurs à
                accompagner.
              </motion.p>

              <motion.div className="home-final-actions" variants={fadeUp}>
                <Link to="/demande-demo" className="home-final-primary">
                  Demander une démo
                  <FiArrowRight />
                </Link>

                <Link to="/contact" className="home-final-secondary">
                  Nous contacter
                </Link>
              </motion.div>
            </motion.div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="home-footer">
          <div className="home-footer-inner">
            <motion.div
              className="home-footer-top"
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
            >
              <motion.div className="home-footer-brand" variants={fadeUp}>
                <img src={logo} alt="Portrélia" loading="lazy" />

                <div>
                  <strong>Portrélia</strong>
                  <p>Des portraits professionnels pour vos équipes.</p>
                </div>
              </motion.div>

              <motion.div className="home-footer-column" variants={fadeUp}>
                <h3>Navigation</h3>

                {NAV_ITEMS.map((item) =>
                  isRoute(item.href) ? (
                    <Link to={item.href} key={item.href}>
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      key={item.href}
                      onClick={(event) => scrollToSection(event, item.href)}
                    >
                      {item.label}
                    </a>
                  )
                )}
              </motion.div>

              <motion.div className="home-footer-column" variants={fadeUp}>
                <h3>Informations légales</h3>

                {LEGAL_ITEMS.map((item) => (
                  <Link to={item.to} key={item.to}>
                    {item.label}
                  </Link>
                ))}
              </motion.div>

              <motion.div className="home-footer-column" variants={fadeUp}>
                <h3>Portrélia</h3>
                <Link to="/connexion">Se connecter</Link>
                <Link to="/demande-demo">Demander une démo</Link>
                <Link to="/contact">Nous contacter</Link>
              </motion.div>
            </motion.div>

            <div className="home-footer-bottom">
              <span>© {CURRENT_YEAR} Portrélia</span>
              <span>Vos données et votre confidentialité comptent.</span>
            </div>
          </div>
        </footer>

        {/* RETOUR EN HAUT */}
        <AnimatePresence>
          {showTop && !menuOpen && (
            <motion.button
              type="button"
              className="home-back-to-top"
              aria-label="Revenir en haut de la page"
              onClick={scrollToTop}
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.9 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <FiArrowUp />
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </MotionConfig>
  );
}

export default HomePage;