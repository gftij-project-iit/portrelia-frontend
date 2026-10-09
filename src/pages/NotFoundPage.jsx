import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="not-found">

      <h1>
        404
      </h1>

      <p>
        Cette page n'existe pas.
      </p>

      <Link
        to="/"
        className="btn btn-primary"
      >
        Retour à l'accueil
      </Link>

    </div>
  );
}

export default NotFoundPage;