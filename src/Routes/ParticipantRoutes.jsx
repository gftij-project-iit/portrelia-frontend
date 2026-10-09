import { Route } from "react-router-dom";
import PublicRoute from "./PublicRoutes";

import PhotoGuidePage from "../pages/participant/PhotoGuidePage";
import InvitationPage from "../pages/participant/InvitationPage";
import PhotoUploadPage from "../pages/participant/PhotoUploadPage";
import PhotoValidationPage from "../pages/participant/PhotoValidationPage";
import SubmissionCompletePage from "../pages/participant/SubmissionCompletePage";

const ParticipantRoutes = (
  <>
    {/* Invitation collaborateur */}
    <Route path="/invitation" element={<PublicRoute><InvitationPage /></PublicRoute>} />

    {/* Étape 1 - Guide photo */}
    <Route path="/invitation/guide-photo" element={<PublicRoute><PhotoGuidePage /></PublicRoute>} />

     <Route path="/invitation/photos" element={<PublicRoute><PhotoUploadPage /></PublicRoute>} />

     {/* Étape 3 - Validation avant envoi */}
    <Route path="/invitation/validation" element={<PublicRoute><PhotoValidationPage /></PublicRoute>} />
    <Route path="/invitation/envoi-termine" element={<PublicRoute><SubmissionCompletePage /></PublicRoute>} />
  </>
);

export default ParticipantRoutes;