import { Professional, ProfessionalVerificationStatus, VerificationDocumentType } from '../types/api';

export function resolveProfessionalVerification(professional: Professional) {
  if (professional.verifiedDocuments) {
    const verifiedTypes = new Set(professional.verifiedDocuments);
    return { identity: verifiedTypes.has(VerificationDocumentType.Identity), address: verifiedTypes.has(VerificationDocumentType.AddressProof), certificate: verifiedTypes.has(VerificationDocumentType.ProfessionalCertificate) };
  }
  // Older servers expose only a verification level; generic badges do not prove document checks.
  return { identity: professional.verificationStatus === ProfessionalVerificationStatus.IdentityVerified || professional.verificationStatus === ProfessionalVerificationStatus.ProfessionalVerified,
    certificate: professional.verificationStatus === ProfessionalVerificationStatus.ProfessionalVerified, address: false };
}
