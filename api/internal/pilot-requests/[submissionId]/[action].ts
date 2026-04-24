import { handlePilotRequestAction } from '../../../_lib/internalPilotApiHandlers.js';
import { handleOperatorApprovalAction } from '../../../_lib/operatorApprovalActionApi.js';

export default async function handler(req: Parameters<typeof handlePilotRequestAction>[0], res: Parameters<typeof handlePilotRequestAction>[1]) {
  const submissionId = Array.isArray(req.query.submissionId) ? req.query.submissionId[0] : req.query.submissionId;
  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;

  if (submissionId === 'approval-action' && action === 'confirm') {
    return handleOperatorApprovalAction(req, res);
  }

  return handlePilotRequestAction(req, res);
}
