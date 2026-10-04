import { Proposal } from '../types/api';

export enum ProposalSort {
  LowestPrice = 'lowestPrice',
  BestRated = 'bestRated',
  FastestResponse = 'fastestResponse'
}

const proposalStatusLabels: Record<string, string> = {
  sent: 'Aguardando cliente',
  accepted: 'Aceita',
  rejected: 'Não selecionada',
  withdrawn: 'Retirada',
  expired: 'Expirada'
};

export function calculateProposalTotal(proposal: Proposal) {
  return Number(proposal.price) + Number(proposal.travelFee);
}

export function resolveProposalStatusLabel(status: string) {
  return proposalStatusLabels[status] || status;
}

export function resolveProposalValidity(validUntil: string, status: string, now = Date.now()) {
  if (status !== 'sent') return resolveProposalStatusLabel(status);
  const remainingMilliseconds = new Date(validUntil).getTime() - now;
  if (remainingMilliseconds <= 0) return 'Expirada';
  const remainingHours = Math.ceil(remainingMilliseconds / (60 * 60 * 1000));
  if (remainingHours === 1) return 'Válida por mais 1 hora';
  return `Válida por mais ${remainingHours} horas`;
}

export function sortProposals(proposals: Proposal[], sort: ProposalSort) {
  return [...proposals].sort((first, second) => {
    if (sort === ProposalSort.BestRated) {
      return (second.professional?.metrics?.averageRating || 0) -
        (first.professional?.metrics?.averageRating || 0);
    }
    if (sort === ProposalSort.FastestResponse) {
      return (first.professional?.metrics?.averageResponseMinutes || Number.MAX_SAFE_INTEGER) -
        (second.professional?.metrics?.averageResponseMinutes || Number.MAX_SAFE_INTEGER);
    }
    return calculateProposalTotal(first) - calculateProposalTotal(second);
  });
}
