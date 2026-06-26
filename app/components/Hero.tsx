import Link from "next/link";
import { Button } from "./ui/Button";
import { ArrowRight, Heart } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50/30 px-6 py-16 md:py-24 lg:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative mx-auto max-w-6xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/80 backdrop-blur-sm rounded-full text-green-700 text-sm font-medium mb-6 animate-fade-in">
          <Heart className="w-4 h-4 fill-green-600 text-green-600" />
          <span>Making a difference together</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-[#2c6e49] sm:text-5xl md:text-6xl lg:text-7xl animate-slide-up">
          Tamimi Welfare
          <span className="block text-green-600">Trust</span>
        </h1>
        
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 sm:text-xl animate-slide-up delay-100">
          Empowering communities, transforming lives — with compassion and integrity.
        </p>
        
        <div className="mt-8 flex flex-wrap justify-center gap-4 animate-slide-up delay-200">
            <Link href={'/login'}>
          <Button className="group bg-green-700 px-8 py-6 text-base font-semibold text-white shadow-lg transition-all hover:bg-green-800 hover:shadow-xl hover-lift">
            Become a Member
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
            </Link>
          <Button 
            variant="outline" 
            className="border-2 border-green-700 px-8 py-6 text-base font-semibold text-green-700 hover:bg-green-50 hover:border-green-800 transition-all hover-lift"
          >
            Learn More
          </Button>
        </div>

        <div className="mt-12 flex justify-center animate-fade-in delay-300">
          <div className="relative rounded-2xl bg-white/70 p-2 backdrop-blur-sm shadow-xl border border-white/50">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Community support"
              className="h-48 w-full rounded-xl object-cover md:h-72 lg:h-96 transition-transform duration-700 hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent rounded-xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
}