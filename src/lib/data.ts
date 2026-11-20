// Capa de acceso a datos. Hoy lee de /src/data; cuando se migre a Supabase solo cambia la
// implementación de estas funciones (la firma async ya está pensada para eso). Ojo: con
// cacheComponents activo, una consulta remota acá va a necesitar "use cache" + cacheLife
// para que la home siga siendo estática.
import { accessories, accessoryCategories } from "@/data/accessories";
import { bikeCategories, bikes } from "@/data/bikes";
import { business } from "@/data/business";
import { about, hero, marqueeItems, navItems, stats } from "@/data/content";
import { services, workshopSteps } from "@/data/services";
import { testimonials } from "@/data/testimonials";
import { videos } from "@/data/videos";
import type { Accessory, Bike, Product } from "@/types";

function byFeaturedFirst<T extends { featured: boolean }>(a: T, b: T) {
    return Number(b.featured) - Number(a.featured);
}

export async function getBikes(): Promise<Bike[]> {
    return [...bikes].sort(byFeaturedFirst);
}

export async function getAccessories(): Promise<Accessory[]> {
    return [...accessories].sort(byFeaturedFirst);
}

export async function getProducts(): Promise<Product[]> {
    const [bikeList, accessoryList] = await Promise.all([getBikes(), getAccessories()]);
    return [...bikeList, ...accessoryList];
}

export async function getFeaturedProducts(): Promise<Product[]> {
    const products = await getProducts();
    return products.filter(function (product) {
        return product.featured;
    });
}

export async function getBikeCategories() {
    return bikeCategories;
}

export async function getAccessoryCategories() {
    return accessoryCategories;
}

export async function getServices() {
    return services;
}

export async function getWorkshopSteps() {
    return workshopSteps;
}

export async function getTestimonials() {
    return testimonials;
}

export async function getVideos() {
    return videos;
}

export async function getBusinessInfo() {
    return business;
}

export async function getHeroContent() {
    return hero;
}

export async function getAboutContent() {
    return about;
}

export async function getStats() {
    return stats;
}

export async function getMarqueeItems() {
    return marqueeItems;
}

export async function getNavItems() {
    return navItems;
}
