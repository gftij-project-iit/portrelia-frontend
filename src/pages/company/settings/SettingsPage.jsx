
import { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";

import api from "../../../services/api";
import "./SettingsPage.css";

const initialPasswords = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function SettingsPage() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState(initialPasswords);
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadAccount = async () => {
      try {
        const response = await api.get("/me", {
          signal: controller.signal,
        });

        const data = response.data?.data ?? response.data;

        setAccount(data?.user ?? data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err.response?.data?.message ||
            "Impossible de charger les informations du compte."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadAccount();

    return () => controller.abort();
  }, []);

  const updatePassword = (field, value) => {
    setPasswords((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (saving) return;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Choisissez un mot de passe différent de l'actuel.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.patch("/company/settings/password", {
        currentPassword,
        newPassword,
      });

      setPasswords(initialPasswords);
      setShowPasswords(false);
      setSuccess("Votre mot de passe a été modifié avec succès.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de modifier votre mot de passe."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="company-settings-page">
      <header className="company-settings-header">
        <span>ESPACE ENTREPRISE</span>
        <h1>Paramètres</h1>
        <p>Consultez vos informations et gérez la sécurité de votre compte.</p>
      </header>

      <div className="company-settings-content">
        <section className="company-settings-card">
          <div className="company-settings-card-heading">
            <span className="company-settings-icon">
              <FiUser />
            </span>
            <div>
              <h2>Informations du compte</h2>
              <p>Ces informations sont actuellement en lecture seule.</p>
            </div>
          </div>

          {loading ? (
            <div className="company-settings-loading">
              <ClipLoader size={24} color="#56319a" />
            </div>
          ) : (
            <div className="company-settings-fields">
              <label>
                Prénom
                <input readOnly value={account?.firstName || ""} />
              </label>

              <label>
                Nom
                <input readOnly value={account?.lastName || ""} />
              </label>

              <label className="company-settings-full">
                Adresse e-mail
                <div className="company-settings-readonly-icon">
                  <FiMail />
                  <input readOnly value={account?.email || ""} />
                </div>
              </label>
            </div>
          )}
        </section>

        <section className="company-settings-card">
          <div className="company-settings-card-heading">
            <span className="company-settings-icon">
              <FiShield />
            </span>
            <div>
              <h2>Modifier mon mot de passe</h2>
              <p>Protégez votre compte avec un mot de passe sécurisé.</p>
            </div>
          </div>

          {error && (
            <div className="company-settings-alert error" role="alert">
              <FiAlertCircle />
              {error}
            </div>
          )}

          {success && (
            <div className="company-settings-alert success" role="status">
              <FiCheckCircle />
              {success}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="company-settings-password-fields">
              {[
                ["currentPassword", "Mot de passe actuel"],
                ["newPassword", "Nouveau mot de passe"],
                ["confirmPassword", "Confirmer le nouveau mot de passe"],
              ].map(([field, label]) => (
                <label key={field}>
                  {label}
                  <div className="company-settings-password-input">
                    <FiLock />

                    <input
                      type={showPasswords ? "text" : "password"}
                      value={passwords[field]}
                      onChange={(event) =>
                        updatePassword(field, event.target.value)
                      }
                      autoComplete={
                        field === "currentPassword"
                          ? "current-password"
                          : "new-password"
                      }
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPasswords((value) => !value)}
                      aria-label={
                        showPasswords
                          ? "Masquer les mots de passe"
                          : "Afficher les mots de passe"
                      }
                    >
                      {showPasswords ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </label>
              ))}
            </div>

            <div className="company-settings-form-footer">
              <span>
                <FiShield />
                Utilisez au moins 8 caractères.
              </span>

              <button type="submit" disabled={saving}>
                {saving ? (
                  <ClipLoader size={15} color="#fff" />
                ) : (
                  <FiSave />
                )}
                {saving ? "Enregistrement..." : "Modifier le mot de passe"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
