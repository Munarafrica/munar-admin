import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { Sponsor, CreateSponsorRequest, UpdateSponsorRequest, ReorderDirection } from '../types/sponsors';
import { delay, mockSponsors, generateId } from './mock/data';

export async function getSponsors(eventId: string): Promise<Sponsor[]> {
  if (config.features.useMockData) {
    await delay();
    return mockSponsors
      .filter((sponsor) => sponsor.eventId === eventId)
      .sort((a, b) => a.order - b.order);
  }

  return apiClient.get<Sponsor[]>(`/events/${eventId}/sponsors`);
}

export async function createSponsor(eventId: string, data: CreateSponsorRequest): Promise<Sponsor> {
  if (config.features.useMockData) {
    await delay();
    const eventSponsors = mockSponsors.filter((sponsor) => sponsor.eventId === eventId);
    const nextOrder = eventSponsors.length > 0 ? Math.max(...eventSponsors.map((s) => s.order)) + 1 : 1;

    const newSponsor: Sponsor = {
      id: generateId('spon'),
      eventId,
      name: data.name,
      logoUrl: data.logoUrl,
      websiteUrl: data.websiteUrl,
      description: data.description,
      visible: data.visible ?? true,
      order: nextOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSponsors.push(newSponsor);
    return newSponsor;
  }

  return apiClient.post<Sponsor>(`/events/${eventId}/sponsors`, data);
}

export async function updateSponsor(eventId: string, sponsorId: string, data: UpdateSponsorRequest): Promise<Sponsor> {
  if (config.features.useMockData) {
    await delay();
    const index = mockSponsors.findIndex((sponsor) => sponsor.id === sponsorId && sponsor.eventId === eventId);
    if (index === -1) {
      throw new Error('Sponsor not found');
    }

    mockSponsors[index] = {
      ...mockSponsors[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return mockSponsors[index];
  }

  return apiClient.put<Sponsor>(`/events/${eventId}/sponsors/${sponsorId}`, data);
}

export async function deleteSponsor(eventId: string, sponsorId: string): Promise<void> {
  if (config.features.useMockData) {
    await delay();
    const index = mockSponsors.findIndex((sponsor) => sponsor.id === sponsorId && sponsor.eventId === eventId);
    if (index !== -1) {
      mockSponsors.splice(index, 1);
    }
    return;
  }

  await apiClient.delete(`/events/${eventId}/sponsors/${sponsorId}`);
}

export async function reorderSponsor(
  eventId: string,
  sponsorId: string,
  direction: ReorderDirection,
): Promise<Sponsor[]> {
  if (config.features.useMockData) {
    await delay();
    const sponsors = mockSponsors
      .filter((sponsor) => sponsor.eventId === eventId)
      .sort((a, b) => a.order - b.order);

    const currentIndex = sponsors.findIndex((sponsor) => sponsor.id === sponsorId);
    if (currentIndex === -1) {
      throw new Error('Sponsor not found');
    }

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= sponsors.length) {
      return sponsors;
    }

    const updatedSponsors = [...sponsors];
    [updatedSponsors[currentIndex], updatedSponsors[swapIndex]] = [
      updatedSponsors[swapIndex],
      updatedSponsors[currentIndex],
    ];

    updatedSponsors.forEach((sponsor, index) => {
      sponsor.order = index + 1;
      sponsor.updatedAt = new Date().toISOString();
    });

    mockSponsors.forEach((sponsor, index) => {
      const replacement = updatedSponsors.find((item) => item.id === sponsor.id && item.eventId === sponsor.eventId);
      if (replacement) {
        mockSponsors[index] = replacement;
      }
    });

    return updatedSponsors;
  }

  return apiClient.post<Sponsor[]>(`/events/${eventId}/sponsors/${sponsorId}/reorder`, { direction });
}
