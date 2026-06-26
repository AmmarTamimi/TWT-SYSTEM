// components/services.tsx
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Heart, Users, BookOpen, HandHeart, Sparkles } from "lucide-react";


const services = [
  {
    icon: <Heart className="h-8 w-8 text-[#2c6e49]" />,
    title: "Health & Wellness",
    desc: "Free medical camps, mental health support, and wellness programs.",
    gradient: "from-rose-50 to-pink-50"
  },
  {
    icon: <Users className="h-8 w-8 text-[#2c6e49]" />,
    title: "Family Support",
    desc: "Food distribution, housing assistance, and family counseling.",
    gradient: "from-blue-50 to-cyan-50"
  },
  {
    icon: <BookOpen className="h-8 w-8 text-[#2c6e49]" />,
    title: "Education for All",
    desc: "Scholarships, after-school programs, and adult literacy classes.",
    gradient: "from-amber-50 to-orange-50"
  },
  {
    icon: <HandHeart className="h-8 w-8 text-[#2c6e49]" />,
    title: "Community Outreach",
    desc: "Volunteer opportunities, awareness campaigns, and local partnerships.",
    gradient: "from-purple-50 to-violet-50"
  },
];

export function Services() {
  return (
    <section className="relative bg-gradient-to-b from-white via-green-50/20 to-white px-6 py-16 md:py-24">
      {/* Decorative element */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-300/50 to-transparent"></div>
      
      <div className="relative mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 rounded-full text-[#2c6e49] text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Our Programs
          </span>
          <h2 className="text-3xl font-bold text-[#2c6e49] sm:text-4xl lg:text-5xl">
            What We Do
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Our programs are designed to uplift and empower every member of the community.
          </p>
        </div>
        
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <Card 
              key={service.title} 
              className={`group border-0 bg-gradient-to-br ${service.gradient} shadow-md hover:shadow-xl transition-all duration-300 hover-lift cursor-default`}
            >
              <CardHeader>
                <div className="relative">
                  <div className="absolute inset-0 bg-green-600/5 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                </div>
                <CardTitle className="text-xl text-green-800 mt-2">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}