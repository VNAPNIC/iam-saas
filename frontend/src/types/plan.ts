export interface Plan {
    id: string;
    name: string;
    price: number;
    userLimit: number;
    apiCallLimit: number;
    status: string;
}