import { Router } from "express";

import {
  sendInvitation,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
  getInvitationById,
  removeCollaborator,
  getAllInvitations,
  getAllPendingInvitations,
  getAllAcceptedInvitations,
  getAllSentInvitations,
  getAllSentPendingInvitations,
  getAllSentAcceptedInvitations,
  getAllCollaborators,
} from "../controllers/playlistCollaborator.controller.js";

import {
  verifyJWT,
  optionalVerifyJWT,
} from "../middlewares/auth.middleware.js";
import { isEmailVerified } from "../middlewares/emailVerification.middleware.js";

const router = Router();

// Get all collaborators
router
  .route("/playlist/:playlistId/collaborators")
  .get(optionalVerifyJWT, getAllCollaborators);

// Protected routes
router.use(verifyJWT);

// Invitation actions
router
  .route("/playlist/:playlistId/invite/:userId")
  .post(isEmailVerified, sendInvitation);
router
  .route("/invitation/:invitationId/accept")
  .patch(isEmailVerified, acceptInvitation);
router
  .route("/invitation/:invitationId/reject")
  .delete(isEmailVerified, rejectInvitation);
router
  .route("/invitation/:invitationId/cancel")
  .delete(isEmailVerified, cancelInvitation);
router.route("/invitation/:invitationId").get(getInvitationById);

// Collaborator actions
router
  .route("/playlist/:playlistId/collaborator/:userId")
  .delete(isEmailVerified, removeCollaborator);

// Received invitations
router.route("/invitations").get(getAllInvitations);
router.route("/invitations/pending").get(getAllPendingInvitations);
router.route("/invitations/accepted").get(getAllAcceptedInvitations);

// Sent invitations
router.route("/invitations/sent").get(getAllSentInvitations);
router.route("/invitations/sent/pending").get(getAllSentPendingInvitations);
router.route("/invitations/sent/accepted").get(getAllSentAcceptedInvitations);

export default router;
