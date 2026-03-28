import { useCallback, useEffect, useState } from 'react';
import { sponsorsService } from '../services';
import { CreateSponsorRequest, ReorderDirection, Sponsor, UpdateSponsorRequest } from '../types/sponsors';

interface UseSponsorsOptions {
  eventId: string;
  autoFetch?: boolean;
}

interface UseSponsorsReturn {
  sponsors: Sponsor[];
  isLoading: boolean;
  error: string | null;
  fetchSponsors: () => Promise<void>;
  addSponsor: (data: CreateSponsorRequest) => Promise<Sponsor | null>;
  editSponsor: (sponsorId: string, data: UpdateSponsorRequest) => Promise<Sponsor | null>;
  removeSponsor: (sponsorId: string) => Promise<boolean>;
  reorderSponsor: (sponsorId: string, direction: ReorderDirection) => Promise<Sponsor[] | null>;
  toggleVisibility: (sponsorId: string, visible: boolean) => Promise<Sponsor | null>;
}

export function useSponsors({ eventId, autoFetch = true }: UseSponsorsOptions): UseSponsorsReturn {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchSponsors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sponsorsService.getSponsors(eventId);
      setSponsors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sponsors');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const addSponsor = useCallback(
    async (data: CreateSponsorRequest): Promise<Sponsor | null> => {
      try {
        const created = await sponsorsService.createSponsor(eventId, data);
        setSponsors((prev) => [...prev, created].sort((a, b) => a.order - b.order));
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create sponsor');
        return null;
      }
    },
    [eventId],
  );

  const editSponsor = useCallback(
    async (sponsorId: string, data: UpdateSponsorRequest): Promise<Sponsor | null> => {
      try {
        const updated = await sponsorsService.updateSponsor(eventId, sponsorId, data);
        setSponsors((prev) => prev.map((item) => (item.id === sponsorId ? updated : item)).sort((a, b) => a.order - b.order));
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update sponsor');
        return null;
      }
    },
    [eventId],
  );

  const removeSponsor = useCallback(
    async (sponsorId: string): Promise<boolean> => {
      try {
        await sponsorsService.deleteSponsor(eventId, sponsorId);
        setSponsors((prev) => prev.filter((item) => item.id !== sponsorId));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete sponsor');
        return false;
      }
    },
    [eventId],
  );

  const reorderSponsor = useCallback(
    async (sponsorId: string, direction: ReorderDirection): Promise<Sponsor[] | null> => {
      try {
        const updatedList = await sponsorsService.reorderSponsor(eventId, sponsorId, direction);
        setSponsors(updatedList.sort((a, b) => a.order - b.order));
        return updatedList;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reorder sponsor');
        return null;
      }
    },
    [eventId],
  );

  const toggleVisibility = useCallback(
    async (sponsorId: string, visible: boolean): Promise<Sponsor | null> => {
      try {
        const updated = await sponsorsService.updateSponsor(eventId, sponsorId, { visible });
        setSponsors((prev) => prev.map((item) => (item.id === sponsorId ? updated : item)));
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update visibility');
        return null;
      }
    },
    [eventId],
  );

  useEffect(() => {
    if (autoFetch && eventId) {
      fetchSponsors();
    }
  }, [autoFetch, eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    sponsors,
    isLoading,
    error,
    fetchSponsors,
    addSponsor,
    editSponsor,
    removeSponsor,
    reorderSponsor,
    toggleVisibility,
  };
}
