import { initializeApi } from "../api/config";
import { Resource } from "../types/resourceTypes";

export const fetchResources = async (): Promise<Resource[]> => {
    const api = initializeApi();
    return await api.listResources();
};

export const createResource = async (resource: Omit<Resource, 'id'>): Promise<Resource> => {
    const api = initializeApi();
    return await api.addResource(resource);
};
