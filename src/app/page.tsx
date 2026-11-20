import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { About } from "@/components/sections/About";
import { Accessories } from "@/components/sections/Accessories";
import { Bikes } from "@/components/sections/Bikes";
import { Booking } from "@/components/sections/Booking";
import { Brands } from "@/components/sections/Brands";
import { Hero } from "@/components/sections/Hero";
import { Location } from "@/components/sections/Location";
import { Marquee } from "@/components/sections/Marquee";
import { Services } from "@/components/sections/Services";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { Videos } from "@/components/sections/Videos";
import { Workflow } from "@/components/sections/Workflow";
import { StructuredData } from "@/components/StructuredData";
import {
    getAboutContent,
    getAccessories,
    getAccessoryCategories,
    getBikeCategories,
    getBikes,
    getBrands,
    getBusinessInfo,
    getHeroContent,
    getMarqueeItems,
    getNavItems,
    getServices,
    getServicesVideoUrl,
    getStats,
    getTestimonials,
    getVideos,
    getWorkshopSteps,
} from "@/lib/data";

export default async function Home() {
    const [
        business,
        navItems,
        hero,
        marqueeItems,
        stats,
        services,
        steps,
        bikes,
        bikeCategories,
        accessories,
        accessoryCategories,
        videos,
        about,
        testimonials,
        brands,
        servicesVideoUrl,
    ] = await Promise.all([
        getBusinessInfo(),
        getNavItems(),
        getHeroContent(),
        getMarqueeItems(),
        getStats(),
        getServices(),
        getWorkshopSteps(),
        getBikes(),
        getBikeCategories(),
        getAccessories(),
        getAccessoryCategories(),
        getVideos(),
        getAboutContent(),
        getTestimonials(),
        getBrands(),
        getServicesVideoUrl(),
    ]);

    return (
        <>
            <StructuredData business={business} />
            <Header navItems={navItems} />
            <main>
                <Hero content={hero} schedule={business.schedule} />
                <Marquee items={marqueeItems} />
                <Stats stats={stats} />
                <Services services={services} videoUrl={servicesVideoUrl} />
                <Workflow steps={steps} />
                <Booking services={services} business={business} />
                <Bikes
                    bikes={bikes}
                    categories={bikeCategories}
                    customOrderDays={business.customOrderDays}
                    stockUrl={business.stockUrl}
                />
                <Accessories accessories={accessories} categories={accessoryCategories} />
                <Brands brands={brands} />
                <Videos videos={videos} business={business} />
                <About about={about} />
                <Testimonials testimonials={testimonials} />
                <Location business={business} />
            </main>
            <Footer business={business} navItems={navItems} />
            <WhatsAppFab />
        </>
    );
}
